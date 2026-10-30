// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

const statusElement = document.getElementById("status");

async function dispatch() {
  try {
    const params = new URLSearchParams(location.search);
    const mailto = normalizeMailto(params.get("mailto"));
    const result = await chrome.runtime.sendMessage({ type: "queue-mailto", mailto });
    if (!result?.ok) throw new Error(result?.error || msg("errorDispatchFailed"));
    statusElement.textContent = result.setupRequired
      ? msg("dispatchSetupRequired")
      : result.delivered
      ? msg("dispatchDelivered")
      : msg("dispatchOpened");
  } catch (error) {
    document.body.classList.add("error");
    statusElement.textContent = error.message;
  }
}

dispatch();
