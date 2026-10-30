// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

const statusElement = document.getElementById("status");
let configuredInstance = null;

chrome.runtime.sendMessage({ type: "get-status" }).then((result) => {
  statusElement.textContent = result?.pending
    ? msg("pendingLinks", [String(result.pending)])
    : msg("noPendingLinks");
  const diagnostics = result?.diagnostics;
  document.getElementById("diagnostics").textContent = diagnostics
    ? [
        `${msg("labelVersion")}: ${diagnostics.version || "?"}`,
        `${msg("labelStatus")}: ${diagnostics.state || "?"}`,
        `${msg("labelDirect")}: ${diagnostics.directResultLabel || diagnostics.directResult || "?"}`,
        `${msg("labelFrames")}: ${diagnostics.accessibleIframeCount || 0}/${diagnostics.iframeCount || 0}`,
        diagnostics.error ? `${msg("labelError")}: ${diagnostics.error}` : ""
      ].filter(Boolean).join("\n")
    : msg("noConnection");
});

chrome.runtime.sendMessage({ type: "get-config" }).then((result) => {
  configuredInstance = result?.config || null;
  document.getElementById("instance").textContent = configuredInstance
    ? msg("configuredWebmail", [
        ({ sogo: "SOGo", roundcube: "Roundcube" })[configuredInstance.provider] || "GroupWise",
        configuredInstance.origin
      ])
    : msg("noInstanceConfigured");
  document.getElementById("open").disabled = !configuredInstance;
});

document.getElementById("open").addEventListener("click", async () => {
  if (!configuredInstance) return;
  const tabs = await chrome.tabs.query({ url: configuredInstance.matchPattern });
  if (tabs[0]?.id) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: configuredInstance.url, active: true });
  }
  window.close();
});

document.getElementById("settings").addEventListener("click", async () => {
  await chrome.runtime.openOptionsPage();
  window.close();
});
