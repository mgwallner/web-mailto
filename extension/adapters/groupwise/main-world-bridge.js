// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

(() => {
  const EVENT_NAME = "groupwise-mailto-dispatch";
  const MAX_VISITED_OBJECTS = 250000;
  const MAILTO_ACTION = "app-new-mail-to";
  let capturedMailtoHandler = null;

  // GroupWise registers its application actions in a Map during bootstrap. The
  // production bundle contains this exact registration:
  // handlers.set("app-new-mail-to", action => compose(..., action.param)).
  // Capturing that one registration gives us the native compose entry point
  // without depending on a selected message or Angular debug metadata.
  const originalMapSet = Map.prototype.set;
  function captureGroupWiseAction(key, value) {
    if (key === MAILTO_ACTION && typeof value === "function") {
      capturedMailtoHandler = value;
      if (Map.prototype.set === captureGroupWiseAction) Map.prototype.set = originalMapSet;
    }
    return originalMapSet.call(this, key, value);
  }
  Map.prototype.set = captureGroupWiseAction;

  function parseMailto(mailto) {
    const value = String(mailto || "");
    if (!value.toLowerCase().startsWith("mailto:")) throw new Error("invalidMailto");
    const raw = value.slice(7);
    const queryAt = raw.indexOf("?");
    const address = queryAt === -1 ? raw : raw.slice(0, queryAt);
    const query = queryAt === -1 ? "" : raw.slice(queryAt + 1);
    const params = new URLSearchParams(query);
    const get = (name) => params.get(name) || null;
    return {
      contact: null,
      preferredEmail: address ? decodeURIComponent(address) : null,
      preferredName: null,
      cc: get("cc"),
      bcc: get("bcc"),
      subject: get("subject"),
      body: get("body")
    };
  }

  function angularContexts() {
    const contexts = [];
    for (const element of document.querySelectorAll("*")) {
      for (const key of Object.getOwnPropertyNames(element)) {
        if (key.startsWith("__ngContext__")) contexts.push(element[key]);
      }
    }
    return contexts;
  }

  function findActionsPublisher() {
    const stack = angularContexts().map((value) => ({ value, depth: 0 }));
    const visited = new WeakSet();
    let visitedCount = 0;
    while (stack.length && visitedCount < MAX_VISITED_OBJECTS) {
      const { value, depth } = stack.pop();
      if (!value || (typeof value !== "object" && typeof value !== "function")) continue;
      if (visited.has(value)) continue;
      visited.add(value);
      visitedCount += 1;
      try {
        if (value.actions && typeof value.actions.publish === "function") return value.actions;
        if (typeof value.publish === "function" && typeof value.subscribeAll === "function" &&
            typeof value.getFocusValue === "function") return value;
      } catch (_error) {
        continue;
      }
      if (depth >= 15 || value instanceof Node || value instanceof Window) continue;
      const children = Array.isArray(value)
        ? value
        : Object.keys(value).slice(0, 200).map((key) => {
            try { return value[key]; } catch (_error) { return null; }
          });
      for (const child of children) stack.push({ value: child, depth: depth + 1 });
    }
    return null;
  }

  document.addEventListener(EVENT_NAME, (event) => {
    const carrier = event.target;
    if (!(carrier instanceof HTMLElement) || !carrier.hasAttribute("data-groupwise-mailto")) return;
    try {
      const payload = parseMailto(carrier.textContent);
      if (capturedMailtoHandler) {
        capturedMailtoHandler({ id: MAILTO_ACTION, param: payload });
        carrier.dataset.result = "captured-handler";
        return;
      }
      const actions = findActionsPublisher();
      if (!actions) {
        carrier.dataset.result = "handler-not-captured";
        carrier.dataset.error = "handlerNotCaptured";
        return;
      }
      actions.publish(MAILTO_ACTION, payload);
      carrier.dataset.result = "accepted";
    } catch (error) {
      carrier.dataset.result = "error";
      carrier.dataset.error = error instanceof Error ? error.message : String(error);
    }
  });
})();
