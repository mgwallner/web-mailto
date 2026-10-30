// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

function resolveSogoComposeUrl(mailto) {
  const carrier = document.createElement("span");
  carrier.hidden = true;
  carrier.setAttribute("data-sogo-mailto", "");
  carrier.textContent = mailto;
  document.documentElement.appendChild(carrier);
  carrier.dispatchEvent(new CustomEvent("mailto-web-bridge-sogo", { bubbles: true }));
  const result = {
    accepted: carrier.dataset.accepted === "true",
    composeUrl: carrier.dataset.composeUrl || "",
    error: carrier.dataset.error || ""
  };
  carrier.remove();
  return result;
}

async function resolveSogoItem(item) {
  if (!item || typeof item.mailto !== "string") return false;
  const result = resolveSogoComposeUrl(item.mailto);
  if (!result.accepted || !result.composeUrl) return false;
  return result.composeUrl;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "compose-mailto") return undefined;
  resolveSogoItem(message.item)
    .then((composeUrl) => sendResponse({ accepted: Boolean(composeUrl), composeUrl }))
    .catch((error) => sendResponse({ accepted: false, error: error.message }));
  return true;
});

chrome.runtime.sendMessage({ type: "webmail-ready" }).then((response) => {
  if (!response?.item) return undefined;
  return resolveSogoItem(response.item).then((composeUrl) => {
    if (!composeUrl) return undefined;
    return chrome.runtime.sendMessage({
      type: "open-sogo-compose",
      id: response.item.id,
      composeUrl
    });
  });
}).catch(() => {});

if (location.pathname.includes("/UIxMailPopupView") && location.hash.includes("mailtoWebBridge=1")) {
  let editorWasPresent = Boolean(document.getElementById("mailEditor"));
  const observer = new MutationObserver(() => {
    const editorPresent = Boolean(document.getElementById("mailEditor"));
    if (editorPresent) editorWasPresent = true;
    if (editorWasPresent && !editorPresent) {
      observer.disconnect();
      chrome.runtime.sendMessage({ type: "close-sogo-window" }).catch(() => {});
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
