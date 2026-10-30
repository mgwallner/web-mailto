// SPDX-FileCopyrightText: 2026 Michael G. Wallner
// SPDX-License-Identifier: GPL-3.0-only

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const extension = path.join(__dirname, "../extension");
const files = [
  "adapters/registry.js",
  "adapters/groupwise/worker.js",
  "adapters/sogo/worker.js",
  "adapters/roundcube/worker.js"
];
const source = files.map((file) => fs.readFileSync(path.join(extension, file), "utf8")).join("\n");
const context = { URL };
vm.runInNewContext(`${source}\nthis.adapters = WebmailAdapters;`, context);

const expectedIds = [
  "groupwise-main-world",
  "groupwise-isolated-world",
  "sogo-main-world",
  "sogo-isolated-world",
  "roundcube-isolated-world"
];
assert.deepEqual(Array.from(context.adapters.scriptIds()), expectedIds);

for (const provider of ["groupwise", "sogo", "roundcube"]) {
  const adapter = context.adapters.get(provider);
  assert.equal(adapter.id, provider);
  assert.equal(typeof adapter.contentScripts, "function");
  assert.equal(typeof adapter.openCompose, "function");
  assert.equal(typeof adapter.handleMessage, "function");
}
