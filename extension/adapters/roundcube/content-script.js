// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

function roundcubeComposeUrl(mailto) {
  const url = new URL(location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set("_task", "mail");
  url.searchParams.set("_action", "compose");
  // Roundcube's compose action parses a complete mailto URI supplied via _to.
  url.searchParams.set("_to", mailto);
  return url.href;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "compose-mailto") return undefined;
  try {
    const mailto = message.item?.mailto;
    if (typeof mailto !== "string" || !mailto.toLowerCase().startsWith("mailto:")) {
      throw new Error("invalid-mailto");
    }
    sendResponse({ accepted: true, composeUrl: roundcubeComposeUrl(mailto) });
  } catch (error) {
    sendResponse({ accepted: false, error: error instanceof Error ? error.message : String(error) });
  }
  return undefined;
});

const params = new URLSearchParams(location.search);
const composing = params.get("_task") === "mail" && params.get("_action") === "compose";
chrome.runtime.sendMessage({ type: "roundcube-state", composing }).catch(() => {});

chrome.runtime.sendMessage({ type: "webmail-ready" }).then((response) => {
  if (!response?.item) return undefined;
  return chrome.runtime.sendMessage({
    type: "open-roundcube-compose",
    id: response.item.id,
    composeUrl: roundcubeComposeUrl(response.item.mailto)
  });
}).catch(() => {});
