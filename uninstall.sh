#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Michael G. Wallner
# SPDX-License-Identifier: GPL-3.0-only

set -euo pipefail

readonly DATA_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}"
readonly CONFIG_HOME="${XDG_CONFIG_HOME:-${HOME}/.config}"
readonly BIN_HOME="${HOME}/.local/bin"

case "${LANG:-en}" in
  de*) readonly M_REMOVED='Linux-Handler entfernt. Die Chrome-Extension bitte zusätzlich in chrome://extensions entfernen.\n' ;;
  fr*) readonly M_REMOVED='Gestionnaire Linux supprimé. Supprimez également l’extension dans chrome://extensions.\n' ;;
  it*) readonly M_REMOVED='Gestore Linux rimosso. Rimuovi anche l’estensione da chrome://extensions.\n' ;;
  es*) readonly M_REMOVED='Controlador Linux eliminado. Elimina también la extensión en chrome://extensions.\n' ;;
  *) readonly M_REMOVED='Linux handler removed. Also remove the Chrome extension from chrome://extensions.\n' ;;
esac

rm -f "$BIN_HOME/web-mailto-handler"
rm -f "$DATA_HOME/applications/web-mailto.desktop"
rm -f "$CONFIG_HOME/web-mailto/config"
rmdir "$CONFIG_HOME/web-mailto" 2>/dev/null || true

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DATA_HOME/applications"
fi

printf '%b' "$M_REMOVED"
