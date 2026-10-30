#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Michael G. Wallner
# SPDX-License-Identifier: GPL-3.0-only

set -euo pipefail

readonly PROJECT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
expected_id="bcbnhoeclfpgfofkaohlailcbeekngha"

python3 -m json.tool "$PROJECT_DIR/extension/manifest.json" >/dev/null
while IFS= read -r -d '' file; do node --check "$file"; done < <(find "$PROJECT_DIR/extension" -name '*.js' -print0)
node "$PROJECT_DIR/tests/common.test.js"
node "$PROJECT_DIR/tests/adapters.test.js"
for file in "$PROJECT_DIR"/*.sh "$PROJECT_DIR"/linux/web-mailto-handler "$PROJECT_DIR"/tests/check.sh; do
  bash -n "$file"
done

for locale in en fr it es; do
  for document in README PRIVACY TECHNICAL; do
    test -s "$PROJECT_DIR/docs/$locale/$document.md"
  done
done
for locale in de en fr it es; do
  grep -q "Comment\[$locale\]=" "$PROJECT_DIR/linux/web-mailto.desktop"
done

manifest_id=$(python3 - "$PROJECT_DIR/extension/manifest.json" <<'PY'
import base64, hashlib, json, sys
key = json.load(open(sys.argv[1], encoding="utf-8"))["key"]
digest = hashlib.sha256(base64.b64decode(key)).hexdigest()[:32]
print(digest.translate(str.maketrans("0123456789abcdef", "abcdefghijklmnop")))
PY
)
[[ $manifest_id == "$expected_id" ]] || { printf 'Falsche Extension-ID: %s\n' "$manifest_id" >&2; exit 1; }
grep -q "$expected_id" "$PROJECT_DIR/linux/web-mailto-handler"
grep -q "$expected_id" "$PROJECT_DIR/install.sh"
grep -q '^Exec=@HANDLER_PATH@ %u$' "$PROJECT_DIR/linux/web-mailto.desktop"
for adapter in groupwise sogo roundcube; do
  test -s "$PROJECT_DIR/extension/adapters/$adapter/worker.js"
done
grep -q 'WebmailAdapters.get(config.provider)' "$PROJECT_DIR/extension/service-worker.js"
python3 - "$PROJECT_DIR/extension/manifest.json" <<'PY'
import json, sys
manifest = json.load(open(sys.argv[1], encoding="utf-8"))
assert "host_permissions" not in manifest
assert "content_scripts" not in manifest
assert manifest["optional_host_permissions"] == ["https://*/*"]
assert manifest["options_ui"]["page"] == "options.html"
assert "scripting" in manifest["permissions"]
assert "tabs" not in manifest["permissions"]
assert "web_accessible_resources" not in manifest
PY
grep -q 'sender.id !== chrome.runtime.id' "$PROJECT_DIR/extension/service-worker.js"
grep -q 'sender.frameId !== 0' "$PROJECT_DIR/extension/service-worker.js"
grep -q 'url.pathname === "/dispatch.html"' "$PROJECT_DIR/extension/service-worker.js"
python3 - "$PROJECT_DIR/extension" <<'PY'
import json, pathlib, re, sys
root = pathlib.Path(sys.argv[1])
locales = {}
for locale in ("de", "en", "fr", "it", "es"):
    path = root / "_locales" / locale / "messages.json"
    locales[locale] = json.loads(path.read_text(encoding="utf-8"))
expected = set(locales["en"])
for locale, messages in locales.items():
    assert set(messages) == expected, f"{locale}: locale keys differ"
    assert all(entry.get("message") for entry in messages.values()), f"{locale}: empty message"
    for key, entry in messages.items():
        placeholders = {name.upper() for name in entry.get("placeholders", {})}
        referenced = set(re.findall(r'\$([A-Z][A-Z0-9_]*)\$', entry["message"]))
        assert referenced == placeholders, f"{locale}/{key}: placeholder mismatch"
manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
assert manifest["default_locale"] == "en"
used = set()
for path in list(root.glob("*.js")) + list(root.glob("*.html")):
    text = path.read_text(encoding="utf-8")
    used.update(re.findall(r'msg\("([A-Za-z0-9_]+)"', text))
    used.update(re.findall(r'data-i18n(?:-html|-placeholder)?="([A-Za-z0-9_]+)"', text))
missing = used - expected
assert not missing, f"missing locale keys: {sorted(missing)}"
PY

printf 'Alle statischen Prüfungen erfolgreich.\n'
