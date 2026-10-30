// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

const WebmailAdapters = (() => {
  const adapters = new Map();

  return Object.freeze({
    register(adapter) {
      if (!adapter?.id || adapters.has(adapter.id)) {
        throw new Error(`Invalid or duplicate webmail adapter: ${adapter?.id || "unknown"}`);
      }
      adapters.set(adapter.id, Object.freeze(adapter));
    },
    get(id) {
      return adapters.get(id) || adapters.get("groupwise");
    },
    scriptIds() {
      return Array.from(adapters.values()).flatMap((adapter) =>
        adapter.contentScripts({ matchPattern: "https://invalid.example/*" }).map((script) => script.id));
    }
  });
})();
