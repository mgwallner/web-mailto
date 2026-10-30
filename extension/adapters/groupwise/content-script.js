// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

let composeInProgress = false;
let lastDiagnostics = {
  version: "1.0.0",
  state: msg("diagContentActive"),
  iframeCount: 0,
  accessibleIframeCount: 0,
  error: ""
};

function publishDiagnostics(changes = {}) {
  lastDiagnostics = { ...lastDiagnostics, ...changes };
  chrome.runtime.sendMessage({ type: "set-diagnostics", diagnostics: lastDiagnostics }).catch(() => {});
}

function candidateMailIframes() {
  const result = [];
  const seen = new Set();
  for (const selector of ["gw-preview-pane iframe", "iframe[srcdoc]", "iframe"]) {
    for (const iframe of document.querySelectorAll(selector)) {
      if (!seen.has(iframe)) {
        seen.add(iframe);
        result.push(iframe);
      }
    }
  }
  return result;
}

function injectIntoGroupWiseIframe(iframe, mailto) {
  let iframeDocument;
  try {
    iframeDocument = iframe.contentDocument;
  } catch (_error) {
    return false;
  }
  if (!iframeDocument?.body || !iframe.contentWindow) return false;
  publishDiagnostics({ accessibleIframeCount: lastDiagnostics.accessibleIframeCount + 1 });

  const existingMailtoLinks = Array.from(iframeDocument.querySelectorAll("a[href]"))
    .filter((link) => link.getAttribute("href")?.toLowerCase().startsWith("mailto:"));
  const oldHrefs = existingMailtoLinks.map((link) => link.getAttribute("href"));
  existingMailtoLinks.forEach((link) => link.setAttribute("href", "#"));

  const anchor = iframeDocument.createElement("a");
  anchor.href = mailto;
  anchor.textContent = msg("newMessage");
  anchor.setAttribute("aria-hidden", "true");
  anchor.style.cssText = "position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;overflow:hidden";
  iframeDocument.body.appendChild(anchor);

  let reachedFallback = false;
  const stopExternalFallback = (event) => {
    if (event.target === anchor || anchor.contains(event.target)) {
      reachedFallback = true;
      event.preventDefault();
    }
  };

  try {
    // GroupWise's iframe load handler scans all mailto anchors and attaches its
    // internal MailTo action. Existing anchors are hidden from that second scan
    // above so they do not receive duplicate handlers.
    iframe.dispatchEvent(new Event("load"));
    existingMailtoLinks.forEach((link, index) => link.setAttribute("href", oldHrefs[index]));

    // If GroupWise handled the click, its listener calls stopPropagation() and
    // preventDefault(). Otherwise the window fallback prevents an OS mailto loop.
    iframe.contentWindow.addEventListener("click", stopExternalFallback, { once: true });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, view: iframe.contentWindow });
    anchor.dispatchEvent(event);
    const handled = event.defaultPrevented && !reachedFallback;
    publishDiagnostics({
      state: handled ? msg("diagHandlerAccepted") : msg("diagFrameNoResponse"),
      error: ""
    });
    return handled;
  } catch (error) {
    publishDiagnostics({ state: msg("diagFrameError"), error: error.message });
    return false;
  } finally {
    existingMailtoLinks.forEach((link, index) => link.setAttribute("href", oldHrefs[index]));
    anchor.remove();
  }
}

function injectMailto(mailto) {
  const iframes = candidateMailIframes();
  publishDiagnostics({
    state: iframes.length ? msg("diagCheckingFrames") : msg("diagNoFrame"),
    iframeCount: iframes.length,
    accessibleIframeCount: 0,
    error: lastDiagnostics.error || ""
  });
  for (const iframe of iframes) {
    if (injectIntoGroupWiseIframe(iframe, mailto)) return true;
  }
  return false;
}

function dispatchThroughAngular(mailto) {
  const carrier = document.createElement("span");
  carrier.hidden = true;
  carrier.setAttribute("data-groupwise-mailto", "");
  carrier.textContent = mailto;
  document.documentElement.appendChild(carrier);
  try {
    carrier.dispatchEvent(new CustomEvent("groupwise-mailto-dispatch", { bubbles: true }));
    const result = carrier.dataset.result || "bridge-not-running";
    const directResultMessages = {
      accepted: "directAccepted",
      "captured-handler": "directCapturedHandler",
      "handler-not-captured": "directHandlerNotCaptured",
      "bridge-not-running": "directBridgeNotRunning",
      error: "directError"
    };
    const bridgeErrors = {
      handlerNotCaptured: "errorHandlerNotCaptured",
      invalidMailto: "errorNotMailto"
    };
    const bridgeError = bridgeErrors[carrier.dataset.error]
      ? msg(bridgeErrors[carrier.dataset.error])
      : carrier.dataset.error || "";
    publishDiagnostics({
      state: result === "accepted" || result === "captured-handler"
        ? msg("diagActionAccepted")
        : msg("diagDirectResult", [msg(directResultMessages[result] || "directUnknown")]),
      directResult: result,
      directResultLabel: msg(directResultMessages[result] || "directUnknown"),
      error: bridgeError
    });
    return result === "accepted" || result === "captured-handler";
  } finally {
    carrier.remove();
  }
}

async function acceptItem(item) {
  if (composeInProgress || !item || typeof item.mailto !== "string") return false;
  composeInProgress = true;
  try {
    if (!dispatchThroughAngular(item.mailto) && !injectMailto(item.mailto)) {
      return false;
    }
    await chrome.runtime.sendMessage({ type: "mailto-accepted", id: item.id });
    return true;
  } finally {
    setTimeout(() => { composeInProgress = false; }, 750);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "compose-mailto") return undefined;
  acceptItem(message.item)
    .then((accepted) => sendResponse({ accepted }))
    .catch((error) => sendResponse({ accepted: false, error: error.message }));
  return true;
});

async function requestPending() {
  if (composeInProgress) return;
  try {
    const response = await chrome.runtime.sendMessage({ type: "webmail-ready" });
    if (response?.ok && response.item) await acceptItem(response.item);
  } catch (_error) {
    // A service worker restart is harmless; the next navigation retries it.
  }
}

requestPending();
publishDiagnostics();

let retryTimer = null;
const observer = new MutationObserver(() => {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = setTimeout(requestPending, 300);
});
observer.observe(document.documentElement, { childList: true, subtree: true });

// GroupWise initializes parts of the preview lazily. Mutation notifications can
// remain busy during startup, so a bounded poll makes delivery independent of a
// first click into the application.
let startupAttempts = 0;
const startupRetry = setInterval(() => {
  startupAttempts += 1;
  requestPending();
  if (startupAttempts >= 120) clearInterval(startupRetry);
}, 1000);

window.addEventListener("focus", requestPending);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) requestPending();
});
