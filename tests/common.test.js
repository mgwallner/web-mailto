// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../extension/common.js"), "utf8");
const testMessages = {
  errorCompleteUrl: "Enter a complete webmail URL.",
  errorHttpsRequired: "The webmail URL must use HTTPS.",
  errorNoCredentials: "The URL must not contain credentials.",
  errorNoText: "The handoff contains no text.",
  errorMailtoLength: "The mailto link is empty or too long.",
  errorNotMailto: "No mailto link was provided."
};
const context = {
  URL,
  chrome: { i18n: { getMessage: (key) => testMessages[key] || key } }
};
vm.runInNewContext(`${source}\nthis.api = { normalizeWebmailUrl, normalizeGroupWiseUrl, normalizeMailto };`, context);

assert.deepEqual(
  JSON.parse(JSON.stringify(context.api.normalizeGroupWiseUrl(" https://mail.example.org/de/gw/mailbox/default?x=1#part "))),
  {
    url: "https://mail.example.org/de/gw/mailbox/default",
    origin: "https://mail.example.org",
    matchPattern: "https://mail.example.org/*",
    provider: "groupwise"
  }
);
assert.throws(() => context.api.normalizeGroupWiseUrl("http://mail.example.org"), /HTTPS/);
assert.throws(() => context.api.normalizeGroupWiseUrl("not a URL"), /complete/);
assert.equal(context.api.normalizeMailto(" MAILTO:user@example.org?subject=Test "), "mailto:user@example.org?subject=Test");
assert.throws(() => context.api.normalizeMailto("https://example.org"), /No mailto/);

const sogo = context.api.normalizeWebmailUrl("https://mail.example.org/SOGo", "sogo");
assert.equal(sogo.sogoBaseUrl, "https://mail.example.org/SOGo/");
const mailcowSogo = context.api.normalizeWebmailUrl("https://mail.example.org/custom-sogo", "sogo");
assert.equal(mailcowSogo.sogoBaseUrl, "https://mail.example.org/custom-sogo/");
const roundcube = context.api.normalizeWebmailUrl("https://mail.example.org/roundcube/?_task=mail", "roundcube");
assert.equal(roundcube.url, "https://mail.example.org/roundcube/");
assert.equal(roundcube.provider, "roundcube");
