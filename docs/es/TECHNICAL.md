# Funcionamiento técnico

## Arquitectura

La extensión tiene un núcleo independiente del proveedor y adaptadores webmail separados. El service worker gestiona configuración, permisos, cola, duplicados y pestañas. El registro define la interfaz común; cada `adapters/<proveedor>/worker.js` declara sus scripts y encapsula el ciclo de la ventana de redacción. Los scripts de página usan el mensaje común `compose-mailto`.

GroupWise WebAccess no proporciona una URL pública de redacción ni un controlador `mailto:` en el manifiesto web. Su interfaz registra internamente la acción `app-new-mail-to`, que recibe destinatarios, CC, CCO, asunto y cuerpo y abre el diálogo normal de redacción.

`main-world-bridge.js` se ejecuta en `document_start` solo en el dominio autorizado. Durante el inicio observa temporalmente `Map.prototype.set` hasta que GroupWise registra `app-new-mail-to`. Solo captura ese registro y restaura inmediatamente el método original. No modifica el controlador GroupWise; invoca su función con los campos analizados localmente. Si falla, intenta usar el controlador mailto de GroupWise en un marco de mensaje existente. Nunca envía mensajes automáticamente.

Desarrollado y probado con **OpenText™ GroupWise™ CE 25.2 software**. No es una API pública, por lo que una actualización puede requerir cambios. Otras versiones no constan como probadas. La instancia debe usar HTTPS.

Flujo: el controlador Linux recibe la URI sin cambios, abre la página local de traspaso, la extensión la encola temporalmente en local y el script entrega los campos a la instancia configurada. GroupWise muestra un borrador y el usuario decide si lo envía. El proyecto no opera ningún servidor ni incluye telemetría.

OpenText y GroupWise son marcas de OpenText. Todos los derechos pertenecen a sus titulares. El proyecto no contiene código GroupWise copiado, logotipos ni gráficos de OpenText y no está afiliado, autorizado, certificado ni respaldado por OpenText.

## Adaptador SOGo

SOGo 5.12.12 registra directamente la ruta de redacción `UIxMailPopupView`. El adaptador abre esa ruta con la URI `mailto:` intacta y codificada. `$parseMailto` procesa destinatarios, CC, CCO, asunto y cuerpo. No se intercepta ningún prototipo o controlador interno ni se realiza ninguna consulta de versión.

La dirección configurada solo se usa para abrir el webmail y limitar el permiso al dominio. En la página SOGo cargada, el adaptador lee `window.ApplicationBaseURL`, definida por SOGo, y construye la ruta de redacción. Así funcionan rutas específicas de la instalación y del usuario, como en mailcow, sin adivinar `/SOGo/` ni otras rutas.

## Adaptador Roundcube

Probado con Roundcube 1.7.2. El adaptador usa la acción de redacción con `_task=mail`, `_action=compose` y la URI `mailto:` completa en `_to`; Roundcube analiza los campos. Una ventana independiente conserva la pestaña del buzón y solo se cierran ventanas creadas por la extensión después de abandonar un editor previamente cargado. No se modifica código de Roundcube ni se consulta su versión.
