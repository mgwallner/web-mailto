# WEB mailto

[Deutsch](../../README.md) · [English](../en/README.md) · [Français](../fr/README.md) · **Italiano** · [Español](../es/README.md)

Gestore Linux ed estensione Chrome per aprire i link `mailto:` in istanze configurabili OpenText GroupWise WebAccess, SOGo o Roundcube. L’interfaccia supporta tedesco, inglese, francese, italiano e spagnolo.

Questa è un’integrazione indipendente e non ufficiale. Non è affiliata, autorizzata o supportata da OpenText.

## Compatibilità e diritti

Il gestore desktop Linux è progettato per ambienti desktop con supporto
XDG/Freedesktop. È stato testato su GNOME; KDE Plasma e gli altri ambienti
compatibili con XDG non sono attualmente stati testati nella pratica.

Sviluppata e testata con **OpenText™ GroupWise™ CE 25.2 software**. Altre versioni potrebbero funzionare ma non risultano testate. L’integrazione usa un gestore interno non documentato e potrebbe richiedere modifiche dopo un aggiornamento.

L’adattatore SOGo è stato sviluppato per **SOGo 5.12.12**. Usa la route di composizione e il parser mailto previsti da SOGo, senza intercettare gestori interni né eseguire richieste di versione.

L’adattatore Roundcube è stato testato con la demo pubblica **Roundcube 1.7.2**. Usa l’azione di composizione di Roundcube, supporta installazioni in sottodirectory e non interroga la versione.

OpenText e GroupWise sono marchi registrati o non registrati di OpenText. Tutti i diritti sul software e sui materiali correlati restano di OpenText o dei rispettivi titolari. Il progetto non contiene loghi, grafica o codice copiato da OpenText. I nomi sono citati solo per descrivere la compatibilità e non implicano affiliazione, autorizzazione, certificazione o approvazione.

## Installazione

1. Apri `chrome://extensions`, attiva la **Modalità sviluppatore**, scegli **Carica estensione non pacchettizzata** e seleziona la cartella `extension`.
2. Verifica l’ID `bcbnhoeclfpgfofkaohlailcbeekngha`.
3. Seleziona GroupWise, SOGo o Roundcube, inserisci l’URL webmail completo e consenti l’accesso al dominio.
4. Apri il sistema webmail selezionato o accedi e attendi il caricamento completo.
5. Nella cartella del repository esegui:

   ```bash
   ./install.sh
   ```

   Se necessario: `./install.sh chromium`.
6. Apri `tests/test-links.html` in Chrome e fai clic su un link di prova.

## Disinstallazione

Esegui `./uninstall.sh`, poi rimuovi l’estensione da `chrome://extensions`.

## Note

- Viene usato il normale profilo Chrome, in cui il sistema webmail selezionato deve essere autenticato.
- I link in attesa restano nello storage locale per un massimo di 24 ore e non vengono mai inviati automaticamente.
- L’accesso è richiesto solo per il dominio HTTPS configurato; il permesso precedente viene rimosso quando si cambia istanza.
- Il sistema webmail e il relativo URL possono essere modificati in qualsiasi momento tramite l’icona dell’estensione, in **Impostazioni**.
- Dopo un aggiornamento fai clic su **Ricarica** in `chrome://extensions`.

## Documenti

- [Informativa sulla privacy](PRIVACY.md)
- [Documentazione tecnica](TECHNICAL.md)

## Licenza

Copyright (C) 2026 Michael G. Wallner

Questo progetto è software libero distribuito secondo la **GNU General Public
License, solo versione 3.0 (GPL-3.0-only)**. Le versioni modificate distribuite
devono restare sotto la stessa licenza e rendere disponibile il relativo codice
sorgente. Il testo completo è disponibile in [LICENSE](../../LICENSE).
