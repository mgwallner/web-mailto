# Privacy policy for WEB mailto

Updated: 29 October 2026

The extension and Linux handler open `mailto:` links in the GroupWise WebAccess, SOGo or Roundcube instance configured by the user. Recipients, CC, BCC, subject and body are processed only on the user's device. The project sends them only to that configured instance, never to the developer or to analytics, advertising or other third-party services. Further processing by the webmail service is governed by its operator's policies.

Local Chrome extension storage contains the configured URL, pending `mailto:` links, and technical diagnostics for the last local handoff. Pending links expire after 24 hours. Removing the extension or its data removes this information.

Permissions: `storage` stores configuration, pending links and diagnostics; `scripting` registers the integration scripts; optional host access is requested only after confirmation and only for the configured HTTPS domain. The previous domain permission is removed when the instance changes.

The extension collects no usage statistics, uses no advertising or analytics cookies, displays no advertising and does not sell or share personal data. It is an independent, unofficial integration, not affiliated with, authorized by, or supported by OpenText.

Tested with **OpenText™ GroupWise™ CE 25.2 software**. OpenText and GroupWise are trademarks of OpenText. All rights remain with their respective owners. This project contains no OpenText logos, product artwork or copied GroupWise code. This policy will be updated before a release that changes data processing.
