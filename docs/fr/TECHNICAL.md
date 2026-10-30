# Fonctionnement technique

## Architecture

L’extension possède un noyau indépendant du fournisseur et des adaptateurs webmail séparés. Le service worker gère configuration, autorisations, file d’attente, doublons et onglets. Le registre définit l’interface commune; chaque fichier `adapters/<fournisseur>/worker.js` déclare ses scripts et encapsule le cycle de la fenêtre de rédaction. Les scripts de page utilisent le message commun `compose-mailto`.

GroupWise WebAccess ne fournit ni URL publique de composition ni gestionnaire `mailto:` dans son manifeste. Son interface enregistre en interne l’action `app-new-mail-to`, qui reçoit destinataires, CC, CCI, objet et corps, puis ouvre la fenêtre normale de rédaction.

`main-world-bridge.js` s’exécute à `document_start` uniquement sur le domaine autorisé. Au démarrage, il observe temporairement `Map.prototype.set` jusqu’à l’enregistrement de `app-new-mail-to`. Seul cet enregistrement est capturé, puis la méthode d’origine est immédiatement restaurée. Le gestionnaire GroupWise n’est pas modifié ; sa fonction est appelée avec les champs analysés localement. En cas d’échec, l’extension essaie le gestionnaire mailto de GroupWise dans un cadre de message existant. Aucun envoi n’est automatique.

Développé et testé avec **OpenText™ GroupWise™ CE 25.2 software**. Il ne s’agit pas d’une API publique ; une mise à jour peut nécessiter une adaptation. Les autres versions ne sont pas documentées comme testées. L’instance doit utiliser HTTPS.

Flux : le gestionnaire Linux reçoit l’URI inchangée, ouvre la page locale de transmission, l’extension la place temporairement en file locale et le script transmet les champs à l’instance configurée. GroupWise affiche un brouillon et l’utilisateur décide de l’envoi. Le projet n’exploite aucun serveur et ne contient aucune télémétrie.

OpenText et GroupWise sont des marques d’OpenText. Tous les droits restent à leurs titulaires. Le projet ne contient ni code GroupWise copié, ni logo ou visuel OpenText et n’est ni affilié, autorisé, certifié ou pris en charge par OpenText.

## Adaptateur SOGo

SOGo 5.12.12 enregistre lui-même la route de rédaction `UIxMailPopupView`. L’adaptateur ouvre cette route avec l’URI `mailto:` inchangée et encodée. `$parseMailto` traite destinataires, CC, CCI, objet et corps. Aucun prototype ou gestionnaire interne n’est intercepté et aucune requête de version n’est effectuée.

L’adresse configurée sert uniquement à ouvrir le webmail et à limiter l’autorisation au domaine. Sur la page SOGo chargée, l’adaptateur lit `window.ApplicationBaseURL`, définie par SOGo, et construit la route de rédaction. Les chemins propres à l’installation et à l’utilisateur, notamment avec mailcow, fonctionnent ainsi sans deviner `/SOGo/` ou un autre chemin.

## Adaptateur Roundcube

Testé avec Roundcube 1.7.2. L’adaptateur utilise l’action de rédaction avec `_task=mail`, `_action=compose` et l’URI `mailto:` complète dans `_to`; Roundcube analyse lui-même les champs. Une fenêtre séparée préserve l’onglet de la boîte aux lettres. Seules les fenêtres créées par l’extension sont fermées après avoir quitté un éditeur précédemment chargé. Aucun code Roundcube n’est modifié et aucune version n’est interrogée.
