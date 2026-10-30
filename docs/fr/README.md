# WEB mailto

[Deutsch](../../README.md) · [English](../en/README.md) · **Français** · [Italiano](../it/README.md) · [Español](../es/README.md)

Gestionnaire Linux et extension Chrome ouvrant les liens `mailto:` dans une instance configurable OpenText GroupWise WebAccess, SOGo ou Roundcube. L’interface est disponible en allemand, anglais, français, italien et espagnol.

Ce projet est une intégration indépendante et non officielle. Il n’est ni lié à OpenText, ni autorisé, ni pris en charge par OpenText.

## Compatibilité et droits

Le gestionnaire de bureau Linux est conçu pour les environnements compatibles
XDG/Freedesktop. Il a été testé sous GNOME ; KDE Plasma et les autres
environnements compatibles XDG n’ont pas encore été testés en pratique.

Développé et testé avec **OpenText™ GroupWise™ CE 25.2 software**. D’autres versions peuvent fonctionner, mais ne sont pas documentées comme testées. L’intégration utilise un gestionnaire interne non documenté et peut nécessiter une adaptation après une mise à jour.

L’adaptateur SOGo a été développé pour **SOGo 5.12.12**. Il utilise la route de rédaction et l’analyseur mailto prévus par SOGo, sans intercepter de gestionnaire interne ni effectuer de requête de version.

L’adaptateur Roundcube a été testé avec la démo publique **Roundcube 1.7.2**. Il utilise l’action de rédaction de Roundcube, prend en charge les sous-répertoires et n’interroge pas la version.

OpenText et GroupWise sont des marques déposées ou non déposées d’OpenText. Tous les droits sur le logiciel et les éléments associés restent à OpenText ou à leurs titulaires. Ce projet ne contient aucun logo, visuel ou code copié d’OpenText. La mention des noms sert uniquement à décrire la compatibilité et n’implique aucune affiliation, autorisation, certification ou approbation.

## Installation

1. Ouvrez `chrome://extensions`, activez le **Mode développeur**, choisissez **Charger l’extension non empaquetée**, puis le dossier `extension`.
2. Vérifiez l’identifiant `bcbnhoeclfpgfofkaohlailcbeekngha`.
3. Sélectionnez GroupWise, SOGo ou Roundcube, saisissez l’URL complète du webmail et autorisez l’accès à ce domaine.
4. Ouvrez le système webmail sélectionné ou connectez-vous, puis attendez le chargement complet.
5. Dans le dossier du dépôt, exécutez :

   ```bash
   ./install.sh
   ```

   Si nécessaire : `./install.sh chromium`.
6. Ouvrez `tests/test-links.html` dans Chrome et cliquez sur un lien de test.

## Désinstallation

Exécutez `./uninstall.sh`, puis supprimez l’extension dans `chrome://extensions`.

## Remarques

- Le profil Chrome normal est utilisé ; le système webmail sélectionné doit y être connecté.
- Les liens en attente restent au maximum 24 heures en stockage local et ne sont jamais envoyés automatiquement.
- L’accès est demandé uniquement pour le domaine HTTPS configuré ; l’ancienne autorisation est supprimée en cas de changement.
- Le système webmail et son URL peuvent être modifiés à tout moment via l’icône de l’extension, sous **Paramètres**.
- Après une mise à jour, cliquez sur **Actualiser** dans `chrome://extensions`.

## Documents

- [Politique de confidentialité](PRIVACY.md)
- [Documentation technique](TECHNICAL.md)

## Licence

Copyright (C) 2026 Michael G. Wallner

Ce projet est un logiciel libre sous **GNU General Public License, version 3.0
uniquement (GPL-3.0-only)**. Les versions modifiées distribuées doivent rester
sous la même licence et fournir leur code source correspondant. Le texte
complet figure dans [LICENSE](../../LICENSE).
