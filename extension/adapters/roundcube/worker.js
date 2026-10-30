// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

const ROUNDCUBE_POPUP_PREFIX = "roundcubePopup:";

WebmailAdapters.register({
  id: "roundcube",

  contentScripts(config) {
    return [{
      id: "roundcube-isolated-world",
      matches: [config.matchPattern],
      js: ["adapters/roundcube/content-script.js"],
      runAt: "document_idle",
      world: "ISOLATED",
      persistAcrossSessions: true
    }];
  },

  async openCompose(composeUrl, item, config, core) {
    const target = new URL(composeUrl);
    if (target.protocol !== "https:" || target.origin !== config.origin ||
        target.searchParams.get("_task") !== "mail" ||
        target.searchParams.get("_action") !== "compose") {
      throw new Error(core.dispatchError());
    }
    // A newly opened content script must not pick the same queue item up again.
    await core.acknowledge(item.id);
    const popup = await chrome.windows.create({
      url: target.href,
      type: "popup",
      focused: true,
      width: 1100,
      height: 850
    });
    const tabId = popup.tabs?.[0]?.id;
    if (tabId) {
      await chrome.storage.session.set({ [`${ROUNDCUBE_POPUP_PREFIX}${tabId}`]: { composeSeen: false } });
    }
    return true;
  },

  async handleMessage(message, sender, config, core) {
    if (message.type === "open-roundcube-compose") {
      core.assertSenderOrigin(sender, config);
      await this.openCompose(message.composeUrl, { id: message.id }, config, core);
      return { handled: true, value: { ok: true } };
    }
    if (message.type !== "roundcube-state") return { handled: false };

    core.assertSenderOrigin(sender, config);
    const tabId = sender.tab?.id;
    if (!tabId) throw new Error(core.dispatchError());
    const key = `${ROUNDCUBE_POPUP_PREFIX}${tabId}`;
    const state = (await chrome.storage.session.get(key))[key];
    if (!state) return { handled: true, value: { ok: true } };
    if (message.composing) {
      await chrome.storage.session.set({ [key]: { composeSeen: true } });
    } else if (state.composeSeen && sender.tab?.windowId) {
      await chrome.storage.session.remove(key);
      await chrome.windows.remove(sender.tab.windowId);
    }
    return { handled: true, value: { ok: true } };
  }
});
