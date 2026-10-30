// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

(() => {
  "use strict";

  const EVENT_NAME = "mailto-web-bridge-sogo";

  document.addEventListener(EVENT_NAME, (event) => {
    const carrier = event.target;
    if (!(carrier instanceof HTMLElement) || !carrier.hasAttribute("data-sogo-mailto")) return;

    try {
      const mailto = carrier.textContent || "";
      if (!mailto.toLowerCase().startsWith("mailto:")) throw new Error("invalid-mailto");
      if (typeof window.ApplicationBaseURL !== "string" || !window.ApplicationBaseURL) {
        throw new Error("application-base-url-unavailable");
      }

      const popup = new URL("UIxMailPopupView", new URL(window.ApplicationBaseURL, location.origin));
      popup.hash = `!/Mail/0/new?${encodeURIComponent(mailto)}&mailtoWebBridge=1`;
      carrier.dataset.composeUrl = popup.href;
      carrier.dataset.accepted = "true";
    } catch (error) {
      carrier.dataset.error = error instanceof Error ? error.message : String(error);
    }
  }, true);
})();
