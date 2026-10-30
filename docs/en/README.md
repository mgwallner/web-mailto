# WEB mailto

[Deutsch](../../README.md) · **English** · [Français](../fr/README.md) · [Italiano](../it/README.md) · [Español](../es/README.md)

Linux desktop handler and Chrome extension that open `mailto:` links in configurable OpenText GroupWise WebAccess, SOGo or Roundcube instances. The interface supports German, English, French, Italian and Spanish.

This is an independent, unofficial integration. It is not affiliated with, authorized by, or supported by OpenText.

## Compatibility and rights

The Linux desktop handler is designed for desktop environments with
XDG/Freedesktop support. It has been tested on GNOME; KDE Plasma and other
XDG-compatible environments have not currently been tested in practice.

Developed and tested with **OpenText™ GroupWise™ CE 25.2 software**. Other versions may work but are not documented as tested. The integration uses an internal, undocumented handler and may require changes after a product update.

The SOGo adapter was developed for **SOGo 5.12.12**. It uses SOGo's intended compose route and built-in mailto parser; no internal handler is intercepted and no version request is made.

The Roundcube adapter was tested with the public **Roundcube 1.7.2** demo. It uses Roundcube's compose action, supports subdirectory installations and performs no version request.

OpenText and GroupWise are registered or unregistered trademarks of OpenText. All rights in OpenText GroupWise software and related materials remain with OpenText or their respective owners. This project contains no OpenText logos, product artwork or copied program code. Product names are mentioned solely to describe compatibility and do not imply affiliation, authorization, certification or endorsement.

## Installation

1. Open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the repository's `extension` directory.
2. Verify the extension ID `bcbnhoeclfpgfofkaohlailcbeekngha`.
3. Select GroupWise, SOGo or Roundcube, enter the complete webmail URL and allow access to that domain.
4. Open or sign in to the selected webmail system and let the tab load completely.
5. In the repository directory run:

   ```bash
   ./install.sh
   ```

   If necessary specify the browser, for example `./install.sh chromium`.
6. Open `tests/test-links.html` in Chrome and click a test link.

## Uninstallation

Run `./uninstall.sh`, then remove the extension from `chrome://extensions`.

## Notes

- The handler uses the normal Chrome profile by default; the selected webmail system must be signed in there.
- Pending links remain in local extension storage for no more than 24 hours and are never sent automatically.
- Access is requested only for the configured HTTPS domain. The previous permission is removed when the instance changes.
- The webmail system and URL can be changed at any time through the extension icon under **Settings**.
- After updating the files, click **Reload** for the extension on `chrome://extensions`.

## Documents

- [Privacy policy](PRIVACY.md)
- [Technical documentation](TECHNICAL.md)

## License

Copyright (C) 2026 Michael G. Wallner

This project is free software licensed under the **GNU General Public License,
Version 3.0 only (GPL-3.0-only)**. Distributed modified versions must remain
under the same license and make their corresponding source code available. See
[LICENSE](../../LICENSE) for the complete license text.
