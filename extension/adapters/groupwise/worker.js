// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

WebmailAdapters.register({
  id: "groupwise",

  contentScripts(config) {
    return [
      {
        id: "groupwise-main-world",
        matches: [config.matchPattern],
        js: ["adapters/groupwise/main-world-bridge.js"],
        runAt: "document_start",
        world: "MAIN",
        persistAcrossSessions: true
      },
      {
        id: "groupwise-isolated-world",
        matches: [config.matchPattern],
        js: ["common.js", "adapters/groupwise/content-script.js"],
        runAt: "document_idle",
        world: "ISOLATED",
        persistAcrossSessions: true
      }
    ];
  },

  async openCompose() {
    return false;
  },

  async handleMessage() {
    return { handled: false };
  }
});
