# WEB mailto

**Deutsch** · [English](docs/en/README.md) · [Français](docs/fr/README.md) ·
[Italiano](docs/it/README.md) · [Español](docs/es/README.md)

Linux-Desktop-Handler und Chrome-Extension zum Öffnen von `mailto:`-Links in
OpenText GroupWise WebAccess, SOGo oder Roundcube. Webmail-System und Instanzadresse sind
frei konfigurierbar.

Die Extension-Oberfläche ist auf Deutsch, Englisch, Französisch, Italienisch
und Spanisch verfügbar. Chrome wählt die Sprache automatisch; Englisch dient als
Fallback.

Dieses Projekt ist eine unabhängige, inoffizielle Integration und steht in
keiner Verbindung zu OpenText. Es wird von OpenText weder autorisiert noch
unterstützt.

## Kompatibilität

Der Linux-Desktop-Handler ist für Desktop-Umgebungen mit
XDG-/Freedesktop-Unterstützung ausgelegt. Getestet wurde er unter GNOME; KDE
Plasma und andere XDG-kompatible Umgebungen sind derzeit nicht praktisch
getestet.

Entwickelt und getestet mit der Weboberfläche der
**OpenText™ GroupWise™ CE 25.2 software**. Andere Versionen können funktionieren,
sind jedoch nicht als getestet dokumentiert. Da die Integration einen internen,
nicht öffentlich dokumentierten Handler verwendet, kann ein Produktupdate eine
Anpassung erforderlich machen.

Der SOGo-Adapter wurde für **SOGo 5.12.12** entwickelt. Er verwendet die von
SOGo selbst vorgesehene Compose-Route und den SOGo-eigenen `mailto:`-Parser;
anders als bei GroupWise ist dafür kein Eingriff in einen internen Handler
erforderlich. Beim Speichern findet keine Versionsabfrage statt.

Der Roundcube-Adapter wurde mit der öffentlichen **Roundcube-1.7.2-Demo**
entwickelt. Er verwendet Roundcubes eigene Compose-Aktion und übergibt ihr die
vollständige `mailto:`-URI. Installationen in Unterverzeichnissen werden
unterstützt; es findet keine Versionsabfrage statt.

## Marken- und Urheberrechtshinweis

OpenText und GroupWise sind eingetragene oder nicht eingetragene Marken von
OpenText. Sämtliche Markenrechte sowie Urheber- und sonstigen Rechte an der
OpenText GroupWise Software und den zugehörigen Materialien verbleiben bei
OpenText beziehungsweise den jeweiligen Rechteinhabern.

Dieses unabhängige Projekt verwendet keine OpenText-Logos, Produktgrafiken oder
kopierten Programmteile. Die Nennung der Produktbezeichnungen dient
ausschließlich der Beschreibung der Kompatibilität. Sie begründet keine
Verbindung, Autorisierung, Zertifizierung oder Unterstützung durch OpenText.

## Installation

1. In Chrome `chrome://extensions` öffnen.
2. Rechts oben den **Entwicklermodus** einschalten.
3. **Entpackte Erweiterung laden** anklicken und den Ordner
   `extension` aus dem heruntergeladenen Projektordner auswählen.
4. Kontrollieren, dass Chrome für die Erweiterung die ID
   `bcbnhoeclfpgfofkaohlailcbeekngha` anzeigt.
5. Die automatisch geöffnete Einstellungsseite ausfüllen. Alternativ beim
   Extension-Symbol auf **Einstellungen** klicken. GroupWise, SOGo oder Roundcube wählen,
   die vollständige Webmail-URL eingeben und den Chrome-Zugriff erlauben.
6. Das ausgewählte Webmail-System öffnen beziehungsweise dort anmelden und den
   Tab vollständig laden lassen.
7. Im Terminal installieren:

   ```bash
   cd web-mailto
   ./install.sh
   ```

   Falls der Browser unter einem anderen Befehl gestartet wird, diesen angeben,
   beispielsweise `./install.sh chromium`.

8. Die Datei `tests/test-links.html` in Chrome öffnen und einen Test-Link
   anklicken. Bei der ersten Verwendung die Linux-Rückfrage zur
   Anwendungsauswahl bestätigen.
   Falls das Webmail-System noch nicht angemeldet ist, anmelden; der Entwurf
   wird danach automatisch geöffnet.

## Deinstallation

```bash
cd web-mailto
./uninstall.sh
```

Danach die Erweiterung unter `chrome://extensions` entfernen.

## Hinweise

- Der Handler verwendet standardmäßig das normale Chrome-Profil. Das
  ausgewählte Webmail-System muss in diesem Profil angemeldet sein.
- Ausstehende Links bleiben höchstens 24 Stunden in der lokalen
  Erweiterungsspeicherung und werden nie automatisch versendet.
- Die Extension fordert nur Zugriff auf die in den Einstellungen ausgewählte
  HTTPS-Domain an. Beim Wechsel der Instanz wird die alte Berechtigung entfernt.
- Webmail-System und Webmail-URL können jederzeit über das Extension-Symbol
  unter **Einstellungen** geändert werden.
- Nach einer Aktualisierung der Erweiterungsdateien muss auf
  `chrome://extensions` bei der Erweiterung **Neu laden** angeklickt werden.

## Datenschutz und technische Details

- [Datenschutzerklärung](PRIVACY.md)
- [Technische Dokumentation](TECHNICAL.md)

## Lizenz

Copyright (C) 2026 Michael G. Wallner

Dieses Projekt ist freie Software unter der **GNU General Public License,
Version 3.0 only (GPL-3.0-only)**. Weiterverteilte veränderte Fassungen müssen
unter derselben Lizenz stehen und ihren zugehörigen Quellcode verfügbar machen.
Der vollständige Lizenztext steht in [LICENSE](LICENSE).
