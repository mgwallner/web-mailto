# WEB mailto

[Deutsch](../../README.md) · [English](../en/README.md) · [Français](../fr/README.md) · [Italiano](../it/README.md) · **Español**

Controlador Linux y extensión de Chrome que abren enlaces `mailto:` en instancias configurables de OpenText GroupWise WebAccess, SOGo o Roundcube. La interfaz admite alemán, inglés, francés, italiano y español.

Esta es una integración independiente y no oficial. No está afiliada, autorizada ni respaldada por OpenText.

## Compatibilidad y derechos

El controlador de escritorio para Linux está diseñado para entornos de
escritorio compatibles con XDG/Freedesktop. Se ha probado en GNOME; KDE Plasma
y otros entornos compatibles con XDG no se han probado todavía en la práctica.

Desarrollada y probada con **OpenText™ GroupWise™ CE 25.2 software**. Otras versiones podrían funcionar, pero no constan como probadas. La integración usa un controlador interno no documentado y puede requerir cambios tras una actualización.

El adaptador SOGo fue desarrollado para **SOGo 5.12.12**. Utiliza la ruta de redacción y el analizador mailto previstos por SOGo, sin interceptar controladores internos ni realizar consultas de versión.

El adaptador Roundcube se probó con la demostración pública **Roundcube 1.7.2**. Usa la acción de redacción de Roundcube, admite subdirectorios y no consulta la versión.

OpenText y GroupWise son marcas registradas o no registradas de OpenText. Todos los derechos sobre el software y sus materiales pertenecen a OpenText o a sus titulares. El proyecto no contiene logotipos, gráficos ni código copiado de OpenText. Los nombres se mencionan solo para describir la compatibilidad y no implican afiliación, autorización, certificación ni respaldo.

## Instalación

1. Abre `chrome://extensions`, activa el **Modo de desarrollador**, selecciona **Cargar descomprimida** y elige la carpeta `extension`.
2. Comprueba el ID `bcbnhoeclfpgfofkaohlailcbeekngha`.
3. Selecciona GroupWise, SOGo o Roundcube, introduce la URL completa del webmail y permite el acceso al dominio.
4. Abre el sistema webmail seleccionado o inicia sesión y espera a que cargue completamente.
5. En la carpeta del repositorio ejecuta:

   ```bash
   ./install.sh
   ```

   Si es necesario: `./install.sh chromium`.
6. Abre `tests/test-links.html` en Chrome y pulsa un enlace de prueba.

## Desinstalación

Ejecuta `./uninstall.sh` y después elimina la extensión en `chrome://extensions`.

## Notas

- Se usa el perfil normal de Chrome, donde debe estar iniciada la sesión del sistema webmail seleccionado.
- Los enlaces pendientes permanecen un máximo de 24 horas en el almacenamiento local y nunca se envían automáticamente.
- Solo se solicita acceso al dominio HTTPS configurado; el permiso anterior se elimina al cambiar de instancia.
- El sistema webmail y su URL pueden cambiarse en cualquier momento desde el icono de la extensión, en **Configuración**.
- Tras actualizar, pulsa **Volver a cargar** en `chrome://extensions`.

## Documentos

- [Política de privacidad](PRIVACY.md)
- [Documentación técnica](TECHNICAL.md)

## Licencia

Copyright (C) 2026 Michael G. Wallner

Este proyecto es software libre bajo la **GNU General Public License, solamente
versión 3.0 (GPL-3.0-only)**. Las versiones modificadas que se distribuyan deben
mantener la misma licencia y poner a disposición su código fuente
correspondiente. El texto completo está en [LICENSE](../../LICENSE).
