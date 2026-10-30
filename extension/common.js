// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

const CONFIG_KEY = "webmailConfig";
const MAX_MAILTO_LENGTH = 262144;

function msg(key, substitutions) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

function localizeDocument() {
  document.documentElement.lang = chrome.i18n.getUILanguage().split("-")[0];
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = msg(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-html]")) {
    element.innerHTML = msg(element.dataset.i18nHtml);
  }
  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.placeholder = msg(element.dataset.i18nPlaceholder);
  }
}

function normalizeWebmailUrl(value, provider = "groupwise") {
  provider = ["sogo", "roundcube"].includes(provider) ? provider : "groupwise";
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch (_error) {
    throw new Error(msg("errorCompleteUrl"));
  }
  if (url.protocol !== "https:") throw new Error(msg("errorHttpsRequired"));
  if (url.username || url.password) throw new Error(msg("errorNoCredentials"));
  url.hash = "";
  url.search = "";
  const normalized = {
    url: url.href,
    origin: url.origin,
    matchPattern: `${url.origin}/*`,
    provider
  };
  if (provider === "sogo") {
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
    normalized.sogoBaseUrl = url.href;
    normalized.url = normalized.sogoBaseUrl;
  }
  return normalized;
}

function normalizeGroupWiseUrl(value) {
  return normalizeWebmailUrl(value, "groupwise");
}

function normalizeMailto(value) {
  if (typeof value !== "string") {
    throw new Error(msg("errorNoText"));
  }

  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_MAILTO_LENGTH) {
    throw new Error(msg("errorMailtoLength"));
  }

  const colon = trimmed.indexOf(":");
  if (colon === -1 || trimmed.slice(0, colon).toLowerCase() !== "mailto") {
    throw new Error(msg("errorNotMailto"));
  }

  return `mailto:${trimmed.slice(colon + 1)}`;
}
