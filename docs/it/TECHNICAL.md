# Funzionamento tecnico

## Architettura

L’estensione ha un nucleo indipendente dal provider e adattatori webmail separati. Il service worker gestisce configurazione, permessi, coda, duplicati e schede. Il registro definisce l’interfaccia comune; ogni `adapters/<provider>/worker.js` dichiara gli script e incapsula il ciclo della finestra di composizione. Gli script della pagina usano il messaggio comune `compose-mailto`.

GroupWise WebAccess non offre un URL pubblico di composizione né un gestore `mailto:` nel Web Manifest. Il frontend registra internamente l’azione `app-new-mail-to`, che accetta destinatari, CC, CCN, oggetto e corpo e apre la normale finestra di composizione.

`main-world-bridge.js` viene eseguito a `document_start` solo sul dominio autorizzato. Durante l’avvio osserva temporaneamente `Map.prototype.set` finché GroupWise registra `app-new-mail-to`. Cattura solo tale registrazione e ripristina subito il metodo originale. Non modifica il gestore GroupWise, ma ne invoca la funzione con i campi analizzati localmente. Se la cattura fallisce, prova il gestore mailto di GroupWise in un frame messaggio esistente. Nessun messaggio viene inviato automaticamente.

Sviluppato e testato con **OpenText™ GroupWise™ CE 25.2 software**. Non è un’API pubblica, quindi gli aggiornamenti possono richiedere modifiche. Le altre versioni non risultano testate. L’istanza deve usare HTTPS.

Flusso: il gestore Linux riceve l’URI invariato, apre la pagina locale di inoltro, l’estensione lo accoda temporaneamente in locale e lo script passa i campi all’istanza configurata. GroupWise mostra una bozza e l’utente decide l’invio. Il progetto non usa server e non include telemetria.

OpenText e GroupWise sono marchi di OpenText. Tutti i diritti restano ai titolari. Il progetto non contiene codice GroupWise copiato, loghi o grafica OpenText e non è affiliato, autorizzato, certificato o supportato da OpenText.

## Adattatore SOGo

SOGo 5.12.12 registra direttamente la route di composizione `UIxMailPopupView`. L’adattatore apre tale route con l’URI `mailto:` invariato e codificato. `$parseMailto` gestisce destinatari, CC, CCN, oggetto e corpo. Nessun prototipo o gestore interno viene intercettato e non viene eseguita alcuna richiesta di versione.

L’indirizzo configurato serve solo ad aprire la webmail e limitare il permesso al dominio. Nella pagina SOGo caricata l’adattatore legge `window.ApplicationBaseURL`, impostato da SOGo, e costruisce la route di composizione. Sono così supportati i percorsi specifici dell’installazione e dell’utente, anche in mailcow, senza ipotizzare `/SOGo/` o altri percorsi.

## Adattatore Roundcube

Testato con Roundcube 1.7.2. L’adattatore usa l’azione di composizione con `_task=mail`, `_action=compose` e l’URI `mailto:` completa in `_to`; Roundcube analizza direttamente i campi. Una finestra separata preserva la scheda della casella e solo le finestre create dall’estensione vengono chiuse dopo l’uscita da un editor già caricato. Nessun codice Roundcube viene modificato e non viene richiesta la versione.
