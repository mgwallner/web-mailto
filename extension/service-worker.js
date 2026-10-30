// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

importScripts(
  "common.js",
  "adapters/registry.js",
  "adapters/groupwise/worker.js",
  "adapters/sogo/worker.js",
  "adapters/roundcube/worker.js"
);

const PENDING_KEY = "pendingMailto";
const DIAGNOSTICS_KEY = "diagnostics";
const MAX_PENDING_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_PENDING_ITEMS = 20;
const DUPLICATE_SUPPRESSION_MS = 3000;
const activeDeliveries = new Map();
let contentScriptRegistration = Promise.resolve();

function makeId() {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

async function getConfig() {
  const stored = await chrome.storage.local.get(CONFIG_KEY);
  return stored[CONFIG_KEY] || null;
}

async function unregisterContentScripts() {
  const managedIds = new Set(WebmailAdapters.scriptIds());
  const registered = await chrome.scripting.getRegisteredContentScripts();
  const registeredManagedIds = registered
    .map((script) => script.id)
    .filter((id) => managedIds.has(id));
  if (registeredManagedIds.length) {
    await chrome.scripting.unregisterContentScripts({ ids: registeredManagedIds });
  }
}

async function replaceContentScripts(config) {
  await unregisterContentScripts();
  if (!config) return false;
  const permitted = await chrome.permissions.contains({ origins: [config.matchPattern] });
  if (!permitted) return false;
  const adapter = WebmailAdapters.get(config.provider);
  await chrome.scripting.registerContentScripts(adapter.contentScripts(config));
  return true;
}

function registerContentScripts(config) {
  // Installation, browser startup and saving the options can overlap. Chrome
  // rejects a second registration with the same ID, so all replacements must
  // run in one sequence. Continue the sequence even if an earlier operation
  // failed, while still returning that failure to its original caller.
  const operation = contentScriptRegistration
    .catch(() => undefined)
    .then(() => replaceContentScripts(config));
  contentScriptRegistration = operation;
  return operation;
}

async function saveConfig(value) {
  const config = normalizeWebmailUrl(value?.url, value?.provider);
  const permitted = await chrome.permissions.contains({ origins: [config.matchPattern] });
  if (!permitted) throw new Error(msg("errorAccessDenied"));
  const previous = await getConfig();
  await chrome.storage.local.set({ [CONFIG_KEY]: config });
  await registerContentScripts(config);

  if (previous?.matchPattern && previous.matchPattern !== config.matchPattern) {
    await chrome.permissions.remove({ origins: [previous.matchPattern] });
  }

  const tabs = await chrome.tabs.query({ url: config.matchPattern });
  await Promise.all(tabs.filter((tab) => tab.id).map((tab) => chrome.tabs.reload(tab.id)));
  return config;
}

async function loadPending() {
  const stored = await chrome.storage.local.get(PENDING_KEY);
  const now = Date.now();
  const valid = (Array.isArray(stored[PENDING_KEY]) ? stored[PENDING_KEY] : [])
    .filter((item) => item && typeof item.id === "string" &&
      typeof item.mailto === "string" && now - item.createdAt < MAX_PENDING_AGE_MS);
  const unique = new Map();
  for (const item of valid) unique.set(item.mailto, item);
  return Array.from(unique.values()).slice(-MAX_PENDING_ITEMS);
}

async function savePending(items) {
  await chrome.storage.local.set({ [PENDING_KEY]: items.slice(-MAX_PENDING_ITEMS) });
  await updateBadge(items.length);
}

async function updateBadge(count) {
  await chrome.action.setBadgeBackgroundColor({ color: "#1d6f42" });
  await chrome.action.setBadgeText({ text: count ? String(count) : "" });
}

async function enqueue(mailto) {
  const pending = await loadPending();
  const item = { id: makeId(), mailto: normalizeMailto(mailto), createdAt: Date.now() };
  const withoutDuplicate = pending.filter((entry) => entry.mailto !== item.mailto);
  withoutDuplicate.push(item);
  await savePending(withoutDuplicate);
  return item;
}

async function acknowledge(id) {
  const pending = await loadPending();
  await savePending(pending.filter((item) => item.id !== id));
}

function senderUrl(sender) {
  try {
    return sender.tab?.url ? new URL(sender.tab.url) : null;
  } catch (_error) {
    return null;
  }
}

function isDispatchSender(sender) {
  if (sender.id !== chrome.runtime.id || sender.frameId !== 0 || !sender.url) return false;
  try {
    const url = new URL(sender.url);
    return url.protocol === "chrome-extension:" &&
      url.host === chrome.runtime.id &&
      url.pathname === "/dispatch.html";
  } catch (_error) {
    return false;
  }
}

const adapterCore = Object.freeze({
  acknowledge,
  senderUrl,
  dispatchError: () => msg("errorDispatchFailed"),
  assertSenderOrigin(sender, config) {
    const url = senderUrl(sender);
    if (!url || url.origin !== config?.origin) {
      throw new Error(msg("errorDispatchFailed"));
    }
  }
});

async function findWebmailTabs() {
  const config = await getConfig();
  if (!config) return [];
  const tabs = await chrome.tabs.query({ url: config.matchPattern });
  return tabs.sort((a, b) => Number(b.active) - Number(a.active) ||
    (b.lastAccessed || 0) - (a.lastAccessed || 0));
}

async function sendToTab(tabId, item, config) {
  try {
    const result = await chrome.tabs.sendMessage(tabId, {
      type: "compose-mailto",
      item
    });
    if (result && result.accepted) {
      if (result.composeUrl) {
        const adapter = WebmailAdapters.get(config.provider);
        await adapter.openCompose(result.composeUrl, item, config, adapterCore);
        return "popup";
      }
      await acknowledge(item.id);
      await chrome.tabs.update(tabId, { active: true });
      return "tab";
    }
  } catch (_error) {
    // The tab may still be loading. The content script requests pending work later.
  }
  return false;
}

async function deliverOrOpen(item) {
  const config = await getConfig();
  if (!config) {
    await chrome.runtime.openOptionsPage();
    return { delivered: false, setupRequired: true };
  }
  const tabs = await findWebmailTabs();
  for (const tab of tabs) {
    const target = tab.id ? await sendToTab(tab.id, item, config) : false;
    if (target) {
      if (target === "tab" && tab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
      return { delivered: true };
    }
  }

  if (tabs[0]?.id) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    if (tabs[0].windowId) await chrome.windows.update(tabs[0].windowId, { focused: true });
    return { delivered: false };
  }

  const tab = await chrome.tabs.create({ url: config.url, active: true });
  if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true });
  return { delivered: false };
}

function queueAndDeliverOnce(value) {
  const mailto = normalizeMailto(value);
  const existing = activeDeliveries.get(mailto);
  if (existing && existing.expiresAt > Date.now()) {
    return existing.promise.then((result) => ({ ...result, duplicateSuppressed: true }));
  }

  const entry = {
    // Keep the lock for the complete asynchronous delivery and briefly
    // afterwards. A slow-loading webmail tab must not let the lock expire.
    expiresAt: Number.POSITIVE_INFINITY,
    promise: null
  };
  entry.promise = (async () => {
    const item = await enqueue(mailto);
    const delivery = await deliverOrOpen(item);
    return { id: item.id, ...delivery, duplicateSuppressed: false };
  })();
  activeDeliveries.set(mailto, entry);
  const releaseLater = () => {
    entry.expiresAt = Date.now() + DUPLICATE_SUPPRESSION_MS;
    setTimeout(() => {
      if (activeDeliveries.get(mailto) === entry) activeDeliveries.delete(mailto);
    }, DUPLICATE_SUPPRESSION_MS);
  };
  entry.promise.then(releaseLater, releaseLater);
  return entry.promise;
}

async function handleMessage(message, sender) {
  if (!message || typeof message.type !== "string") return undefined;

  if (message.type === "queue-mailto") {
    if (!isDispatchSender(sender)) throw new Error(msg("errorDispatchFailed"));
    const delivery = await queueAndDeliverOnce(message.mailto);
    if (sender.tab?.id && isDispatchSender(sender)) {
      setTimeout(() => chrome.tabs.remove(sender.tab.id).catch(() => {}), 350);
    }
    return { ok: true, ...delivery };
  }

  if (message.type === "get-config") {
    return { ok: true, config: await getConfig() };
  }

  if (message.type === "save-config") {
    return { ok: true, config: await saveConfig(message.config) };
  }

  if (message.type === "webmail-ready") {
    const pending = await loadPending();
    return { ok: true, item: pending[0] || null };
  }

  if (message.type === "mailto-accepted") {
    await acknowledge(message.id);
    return { ok: true };
  }

  if (message.type === "get-status") {
    const pending = await loadPending();
    const stored = await chrome.storage.local.get(DIAGNOSTICS_KEY);
    return { ok: true, pending: pending.length, diagnostics: stored[DIAGNOSTICS_KEY] || null };
  }

  if (message.type === "set-diagnostics") {
    const diagnostics = {
      ...message.diagnostics,
      url: sender.tab?.url || "",
      updatedAt: Date.now()
    };
    await chrome.storage.local.set({ [DIAGNOSTICS_KEY]: diagnostics });
    return { ok: true };
  }

  const config = await getConfig();
  if (config) {
    const result = await WebmailAdapters.get(config.provider)
      .handleMessage(message, sender, config, adapterCore);
    if (result.handled) return result.value;
  }

  throw new Error(msg("errorUnknownMessage"));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((value) => sendResponse(value))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  await savePending(await loadPending());
  const config = await getConfig();
  const registered = await registerContentScripts(config);
  if (!registered) await chrome.runtime.openOptionsPage();
});

chrome.runtime.onStartup.addListener(async () => {
  await savePending(await loadPending());
  await registerContentScripts(await getConfig());
});
