# Technical operation

## Architecture

The extension has a provider-independent core and separate webmail adapters. The service worker owns configuration, permissions, queueing, duplicate suppression and tab selection. The registry defines the common adapter interface; every `adapters/<provider>/worker.js` declares its content scripts and encapsulates provider-specific compose-window validation and lifecycle. Page scripts use the shared `compose-mailto` message format.

GroupWise WebAccess provides neither a public compose URL nor a Web Manifest `mailto:` protocol handler. Its frontend internally registers the `app-new-mail-to` action, which accepts recipient, CC, BCC, subject and body fields and opens the normal compose dialog.

`main-world-bridge.js` runs at `document_start` only on the domain approved by the user. During startup it temporarily observes `Map.prototype.set` until GroupWise registers `app-new-mail-to`. It captures only that registration and immediately restores the original method. It does not modify the GroupWise handler; for a handoff it invokes GroupWise's registered function with locally parsed fields. If capture fails, the extension attempts to use GroupWise's own mailto handler in an existing message frame. It never sends a message automatically.

Developed and tested with **OpenText™ GroupWise™ CE 25.2 software**. This is not a public API, so product updates may require changes. Other versions are not documented as tested. The configured instance must use HTTPS.

Data flow: the Linux handler receives the unchanged URI, opens the extension's local dispatch page, the extension temporarily queues it locally, and the content script passes the parsed fields to the configured instance. GroupWise displays a draft and the user decides whether to send it. The project operates no server and includes no telemetry.

OpenText and GroupWise are trademarks of OpenText. All rights remain with their owners. This project contains no copied GroupWise program code, OpenText logos or product artwork and is not affiliated with, authorized by, certified by, or supported by OpenText.

## SOGo adapter

SOGo 5.12.12 registers the `UIxMailPopupView` compose route itself. The adapter opens that intended route with the encoded, unchanged `mailto:` URI. SOGo's `$parseMailto` handles to, CC, BCC, subject and body. No prototype is modified, no internal SOGo handler is intercepted and no version request is made.

The configured address is used only to open webmail and scope the domain permission. On the loaded SOGo page, the adapter reads SOGo's own `window.ApplicationBaseURL` and builds the compose route from it. This supports installation- and user-specific paths such as mailcow without guessing `/SOGo/` or any other path.

## Roundcube adapter

Tested with Roundcube 1.7.2. The adapter uses Roundcube's compose action with `_task=mail`, `_action=compose` and the complete `mailto:` URI in `_to`. Roundcube parses the fields itself. A separate popup preserves the mailbox tab; only extension-created popups are closed after leaving a previously loaded composer. No Roundcube code is modified and no version request is made.
