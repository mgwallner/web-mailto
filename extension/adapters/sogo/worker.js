// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

WebmailAdapters.register({
  id: "sogo",

  contentScripts(config) {
    return [
      {
        id: "sogo-main-world",
        matches: [config.matchPattern],
        js: ["adapters/sogo/main-world.js"],
        runAt: "document_start",
        world: "MAIN",
        persistAcrossSessions: true
      },
      {
        id: "sogo-isolated-world",
        matches: [config.matchPattern],
        js: ["adapters/sogo/content-script.js"],
        runAt: "document_idle",
        world: "ISOLATED",
        persistAcrossSessions: true
      }
    ];
  },

  async openCompose(composeUrl, item, config, core) {
    const target = new URL(composeUrl);
    if (target.protocol !== "https:" || target.origin !== config.origin) {
      throw new Error(core.dispatchError());
    }
    await chrome.windows.create({
      url: target.href,
      type: "popup",
      focused: true,
      width: 1100,
      height: 850
    });
    await core.acknowledge(item.id);
    return true;
  },

  async handleMessage(message, sender, config, core) {
    if (message.type === "open-sogo-compose") {
      core.assertSenderOrigin(sender, config);
      await this.openCompose(message.composeUrl, { id: message.id }, config, core);
      return { handled: true, value: { ok: true } };
    }
    if (message.type === "close-sogo-window") {
      const senderUrl = core.senderUrl(sender);
      if (!senderUrl || senderUrl.origin !== config.origin ||
          !senderUrl.pathname.includes("/UIxMailPopupView") ||
          !senderUrl.hash.includes("mailtoWebBridge=1") || !sender.tab?.windowId) {
        throw new Error(core.dispatchError());
      }
      await chrome.windows.remove(sender.tab.windowId);
      return { handled: true, value: { ok: true } };
    }
    return { handled: false };
  }
});
