# Technische Funktionsweise

## Architektur

Die Erweiterung besteht aus einem providerunabhängigen Kern und getrennten
Webmail-Adaptern. `service-worker.js` verwaltet Konfiguration, Berechtigungen,
Warteschlange, Duplikatunterdrückung und Tab-Auswahl. `adapters/registry.js`
stellt die gemeinsame Adapter-Schnittstelle bereit. Jeder Adapter deklariert
seine Content-Skripte und kapselt das Öffnen, Validieren und Schließen seines
Editors unter `adapters/<anbieter>/worker.js`. Neue Webmail-Systeme benötigen
damit keine anbieterspezifischen Verzweigungen im Kern.

Die seitenspezifischen Content-Skripte verwenden das gemeinsame Nachrichtenformat
`compose-mailto`. Queue und Desktop-Handler bleiben dadurch unabhängig vom
ausgewählten Webmail-Produkt.

**Deutsch** · [English](docs/en/TECHNICAL.md) · [Français](docs/fr/TECHNICAL.md) ·
[Italiano](docs/it/TECHNICAL.md) · [Español](docs/es/TECHNICAL.md)

## Hintergrund

GroupWise WebAccess stellt keine öffentliche Compose-URL und keinen
Webmanifest-Protocol-Handler für `mailto:` bereit. Das ausgelieferte moderne
GroupWise-Frontend besitzt jedoch intern die Aktion `app-new-mail-to`. Sie
erwartet ein Objekt mit Empfänger-, CC-, BCC-, Betreff- und Textfeldern und
öffnet damit den normalen GroupWise-Nachrichtendialog.

## Integration in den internen Handler

Das Skript `main-world-bridge.js` wird mit `document_start` ausschließlich auf
der vom Benutzer freigegebenen GroupWise-Domain ausgeführt. Während des
GroupWise-Starts registriert die Anwendung ihre Aktionen in einer JavaScript-
`Map`. Das Skript beobachtet vorübergehend `Map.prototype.set`, bis GroupWise den
Schlüssel `app-new-mail-to` mit seiner Handler-Funktion registriert.

Nur diese eine Registrierung wird erfasst. Direkt danach wird
`Map.prototype.set` auf seine ursprüngliche Implementierung zurückgesetzt. Die
Extension verändert den Handler nicht. Bei einer `mailto:`-Übergabe ruft sie die
von GroupWise selbst registrierte Funktion mit den lokal geparsten Feldern auf.

Falls der interne Handler in einer kompatiblen Version nicht erfasst werden
kann, versucht die Extension als Rückfalle GroupWises eigenen Mailto-Handler in
einem bereits vorhandenen Nachrichtenframe zu verwenden. Ein Versand wird nie
automatisch ausgelöst.

## Kompatibilität

Die Integration wurde mit der Weboberfläche der
**OpenText™ GroupWise™ CE 25.2 software** und deren interner Aktion
`app-new-mail-to` entwickelt und getestet. Da dies keine öffentliche
GroupWise-API ist, kann ein GroupWise-Update eine Anpassung der Extension
erfordern. Andere Versionen sind nicht als getestet dokumentiert. Die gewählte
Instanz muss HTTPS verwenden.

## Marken, Copyright und fremde Programmteile

OpenText und GroupWise sind eingetragene oder nicht eingetragene Marken von
OpenText. Sämtliche Rechte an der OpenText GroupWise Software und den
zugehörigen Materialien verbleiben bei OpenText beziehungsweise den jeweiligen
Rechteinhabern. Dieses Projekt enthält keine kopierten GroupWise-Programmteile,
OpenText-Logos oder Produktgrafiken. Es interagiert zur Laufzeit mit einer vom
Benutzer separat bereitgestellten GroupWise-Installation.

Die Produktnamen werden nur referenziell zur Beschreibung der getesteten
Kompatibilität verwendet. Daraus folgt keine Verbindung, Autorisierung,
Zertifizierung oder Unterstützung durch OpenText.

## Datenfluss

1. Der Linux-Handler erhält die unveränderte `mailto:`-URI.
2. Er öffnet die lokale Dispatch-Seite der installierten Extension.
3. Die Extension legt den Link vorübergehend im lokalen Erweiterungsspeicher ab.
4. Das Content-Skript übergibt die geparsten Felder an den internen
   GroupWise-Handler der konfigurierten Instanz.
5. GroupWise zeigt einen Entwurf an; der Benutzer entscheidet selbst über den
   Versand.

Es gibt keinen Server des Projekts und keine Telemetrie.

## SOGo-Adapter

SOGo 5.12.12 registriert selbst eine `mailto:`-Compose-Route über
`UIxMailPopupView`. Der
SOGo-Adapter öffnet diese vorgesehene Route mit der kodierten, unveränderten
`mailto:`-URI. SOGos Methode `$parseMailto` verarbeitet Empfänger, CC, BCC,
Betreff und Nachrichtentext. Es wird kein SOGo-Prototyp verändert und kein
interner Handler abgefangen.

Die konfigurierte Adresse dient nur zum Öffnen und zum Begrenzen der
Domainberechtigung. Auf der geladenen SOGo-Seite liest ein isolierter Adapter
die von SOGo selbst gesetzte `window.ApplicationBaseURL` und bildet damit die
Compose-Route. Dadurch funktionieren installations- und benutzerspezifische
Pfade, etwa bei mailcow. Es werden weder `/SOGo/` noch andere Pfade aus der
Konfigurationsadresse erraten. Es findet keine Versionsabfrage statt.

## Roundcube-Adapter

Der Adapter wurde mit Roundcube 1.7.2 getestet. Auf einer geladenen Roundcube-
Seite bildet er aus dem tatsächlichen Einstiegspfad die URL der Compose-Aktion
mit `_task=mail`, `_action=compose` und der vollständigen `mailto:`-URI im
Parameter `_to`. Roundcube parst Empfänger, CC, BCC, Betreff und Nachrichtentext
selbst und leitet anschließend auf seine sitzungsgebundene Compose-ID um.

Der Editor wird in einem eigenen Popup-Fenster geöffnet, damit ein vorhandener
Posteingang nicht überschrieben wird. Die Extension merkt sich ausschließlich
die von ihr erzeugten Roundcube-Popups. Sobald ein solches Fenster nach einem
zuvor geladenen Editor wieder zur Mailansicht navigiert, wird es geschlossen.
Normale Roundcube-Tabs werden niemals automatisch geschlossen. Es wird weder
Roundcube-Code verändert noch eine Versionsabfrage ausgeführt.
