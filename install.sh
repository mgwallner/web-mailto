#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Michael G. Wallner
# SPDX-License-Identifier: GPL-3.0-only

set -euo pipefail

readonly PROJECT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
readonly DATA_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}"
readonly CONFIG_HOME="${XDG_CONFIG_HOME:-${HOME}/.config}"
readonly BIN_HOME="${HOME}/.local/bin"
readonly EXPECTED_EXTENSION_ID="bcbnhoeclfpgfofkaohlailcbeekngha"

case "${LANG:-en}" in
  de*) readonly M_BROWSER_NOT_FOUND='Fehler: Browser-Befehl "%s" wurde nicht gefunden.\n'; readonly M_DEFAULT_FAILED='Warnung: Der Desktop-Handler konnte nicht als Standard gesetzt werden (aktuell: %s).\n'; readonly M_INSTALLED='Linux-Handler installiert. Erwartete Extension-ID: %s\n'; readonly M_EXTENSION_DIR='Extension-Verzeichnis: %s/extension\n' ;;
  fr*) readonly M_BROWSER_NOT_FOUND='Erreur : la commande de navigateur « %s » est introuvable.\n'; readonly M_DEFAULT_FAILED='Avertissement : impossible de définir le gestionnaire par défaut (actuel : %s).\n'; readonly M_INSTALLED='Gestionnaire Linux installé. Identifiant attendu : %s\n'; readonly M_EXTENSION_DIR='Dossier de l’extension : %s/extension\n' ;;
  it*) readonly M_BROWSER_NOT_FOUND='Errore: comando del browser «%s» non trovato.\n'; readonly M_DEFAULT_FAILED='Avviso: impossibile impostare il gestore predefinito (attuale: %s).\n'; readonly M_INSTALLED='Gestore Linux installato. ID estensione previsto: %s\n'; readonly M_EXTENSION_DIR='Cartella dell’estensione: %s/extension\n' ;;
  es*) readonly M_BROWSER_NOT_FOUND='Error: no se encontró el comando del navegador «%s».\n'; readonly M_DEFAULT_FAILED='Aviso: no se pudo establecer el controlador predeterminado (actual: %s).\n'; readonly M_INSTALLED='Controlador Linux instalado. ID de extensión esperado: %s\n'; readonly M_EXTENSION_DIR='Carpeta de la extensión: %s/extension\n' ;;
  *) readonly M_BROWSER_NOT_FOUND='Error: browser command "%s" was not found.\n'; readonly M_DEFAULT_FAILED='Warning: the desktop handler could not be set as default (current: %s).\n'; readonly M_INSTALLED='Linux handler installed. Expected extension ID: %s\n'; readonly M_EXTENSION_DIR='Extension directory: %s/extension\n' ;;
esac

browser_command=${1:-}
if [[ -n $browser_command ]] && ! command -v "$browser_command" >/dev/null 2>&1; then
  printf "$M_BROWSER_NOT_FOUND" "$browser_command" >&2
  exit 1
fi

install -d "$BIN_HOME" "$DATA_HOME/applications" "$CONFIG_HOME/web-mailto"
install -m 0755 "$PROJECT_DIR/linux/web-mailto-handler" "$BIN_HOME/web-mailto-handler"
sed "s|@HANDLER_PATH@|${BIN_HOME}/web-mailto-handler|" \
  "$PROJECT_DIR/linux/web-mailto.desktop" > "$DATA_HOME/applications/web-mailto.desktop"
chmod 0644 "$DATA_HOME/applications/web-mailto.desktop"

{
  printf 'extension_id=%s\n' "$EXPECTED_EXTENSION_ID"
  if [[ -n $browser_command ]]; then printf 'browser_command=%s\n' "$browser_command"; fi
} > "$CONFIG_HOME/web-mailto/config"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DATA_HOME/applications"
fi
xdg-mime default web-mailto.desktop x-scheme-handler/mailto

actual=$(xdg-mime query default x-scheme-handler/mailto || true)
if [[ $actual != web-mailto.desktop ]]; then
  printf "$M_DEFAULT_FAILED" "$actual" >&2
  exit 1
fi

printf "$M_INSTALLED" "$EXPECTED_EXTENSION_ID"
printf "$M_EXTENSION_DIR" "$PROJECT_DIR"
