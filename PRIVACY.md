# Datenschutzerklärung für WEB mailto

**Deutsch** · [English](docs/en/PRIVACY.md) · [Français](docs/fr/PRIVACY.md) ·
[Italiano](docs/it/PRIVACY.md) · [Español](docs/es/PRIVACY.md)

Stand: 29. Oktober 2026

## Zweck

Die Browser-Erweiterung und der zugehörige Linux-Desktop-Handler öffnen
`mailto:`-Links in einer vom Benutzer konfigurierten
GroupWise-WebAccess-, SOGo- oder Roundcube-Instanz.

## Verarbeitung von mailto-Inhalten

Empfänger, CC, BCC, Betreff und Nachrichtentext eines `mailto:`-Links werden
ausschließlich lokal auf dem Gerät des Benutzers verarbeitet. Die Erweiterung
übermittelt diese Inhalte weder an den Entwickler noch an Analyse-, Werbe- oder
sonstige Drittdienste.

Die Inhalte werden nur an die vom Benutzer in der Erweiterung konfigurierte
Webmail-Instanz übergeben. Die weitere Verarbeitung innerhalb von GroupWise,
SOGo oder Roundcube unterliegt den Bestimmungen des jeweiligen Betreibers.

## Lokal gespeicherte Daten

Die Erweiterung speichert im lokalen Chrome-Erweiterungsspeicher:

- die konfigurierte Webmail-URL und das ausgewählte Webmail-System,
- noch nicht übergebene `mailto:`-Links,
- technische Diagnosedaten zum letzten lokalen Übergabeversuch.

Ausstehende `mailto:`-Links werden spätestens nach 24 Stunden verworfen. Die
gespeicherten Daten verlassen das Gerät nicht durch diese Erweiterung. Sie
können durch Entfernen der Erweiterung beziehungsweise durch Löschen ihrer
Website- und Erweiterungsdaten entfernt werden.

## Berechtigungen

- **Speicher (`storage`)**: speichert Konfiguration, ausstehende Links und lokale
  Diagnoseinformationen.
- **Skripting (`scripting`)**: registriert die für das ausgewählte Webmail-System
  benötigten Integrationsskripte auf der ausgewählten Instanz.
- **Optionaler Domainzugriff**: wird erst nach ausdrücklicher Bestätigung des
  Benutzers und nur für die konfigurierte HTTPS-Domain erteilt. Beim Wechsel der
  Instanz wird die vorherige Domainberechtigung entfernt.

## Keine Erhebung und keine Weitergabe

Die Erweiterung erhebt keine Nutzungsstatistiken, verwendet keine Cookies zu
Analyse- oder Werbezwecken, zeigt keine Werbung und verkauft oder teilt keine
personenbezogenen Daten.

## Unabhängigkeit

Dieses Projekt ist eine unabhängige, inoffizielle Integration. Es ist nicht mit
OpenText verbunden und wird von OpenText weder autorisiert noch unterstützt.
GroupWise und OpenText sind Kennzeichen ihrer jeweiligen Rechteinhaber.

## Kompatibilität, Marken und Copyright

Die Integration wurde mit der Weboberfläche der
**OpenText™ GroupWise™ CE 25.2 software** getestet. OpenText und GroupWise sind
eingetragene oder nicht eingetragene Marken von OpenText. Sämtliche Urheber-,
Marken- und sonstigen Rechte an der OpenText GroupWise Software und den
zugehörigen Materialien verbleiben bei OpenText beziehungsweise den jeweiligen
Rechteinhabern. Dieses Projekt enthält keine OpenText-Logos, Produktgrafiken oder
kopierten GroupWise-Programmteile.

## Änderungen

Bei einer Änderung der Datenverarbeitung wird diese Erklärung vor der
Veröffentlichung einer entsprechenden Erweiterungsaktualisierung angepasst.
