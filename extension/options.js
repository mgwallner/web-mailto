// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

const form = document.getElementById("options-form");
const input = document.getElementById("webmail-url");
const providerInput = document.getElementById("provider");
const statusElement = document.getElementById("options-status");
const openButton = document.getElementById("open-webmail");

async function currentConfig() {
  const stored = await chrome.storage.local.get(CONFIG_KEY);
  return stored[CONFIG_KEY] || null;
}

async function load() {
  const config = await currentConfig();
  if (config?.url) input.value = config.url;
  if (config?.provider) providerInput.value = config.provider;
  openButton.disabled = !config?.url;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusElement.className = "";
  statusElement.textContent = msg("requestingAccess");
  let newlyGrantedPattern = null;
  try {
    let config = normalizeWebmailUrl(input.value, providerInput.value);
    const alreadyGranted = await chrome.permissions.contains({ origins: [config.matchPattern] });
    const granted = await chrome.permissions.request({ origins: [config.matchPattern] });
    if (!granted) throw new Error(msg("errorAccessDenied"));
    if (!alreadyGranted) newlyGrantedPattern = config.matchPattern;

    const result = await chrome.runtime.sendMessage({ type: "save-config", config });
    if (!result?.ok) throw new Error(result?.error || msg("errorSaveConfig"));
    newlyGrantedPattern = null;

    input.value = config.url;
    openButton.disabled = false;
    statusElement.className = "success";
    statusElement.textContent = msg("configSaved");
  } catch (error) {
    if (newlyGrantedPattern) {
      await chrome.permissions.remove({ origins: [newlyGrantedPattern] });
    }
    statusElement.className = "error-text";
    statusElement.textContent = error.message;
  }
});

openButton.addEventListener("click", async () => {
  const config = await currentConfig();
  if (config?.url) await chrome.tabs.create({ url: config.url });
});

load();
