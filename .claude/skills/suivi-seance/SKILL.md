---
name: suivi-seance
description: >-
  Enregistre une séance d'entraînement cyclisme de Jules de bout en bout :
  récupère la dernière sortie sur Strava, l'analyse comme un coach, met à jour
  les fichiers de suivi (journal, indicateurs, tests, zones) et ouvre une PR
  GitHub. Déclenche ce skill dès que Jules dit qu'il a fait / fini / bouclé une
  séance ("j'ai fait ma sortie", "séance S5-A faite", "j'ai bouclé la longue",
  "ça y est j'ai roulé"), qu'il demande d'analyser sa dernière sortie Strava,
  de mettre à jour le suivi, ou de cocher une séance — même s'il ne mentionne
  pas explicitement Strava ou les fichiers. C'est le réflexe par défaut après
  chaque entraînement.
---

# Suivi d'une séance d'entraînement

Ce skill automatise le rituel post-séance de Jules (voir `CLAUDE.md` à la racine
pour le contexte athlète, le matériel et les conventions). L'objectif : qu'en
disant simplement « j'ai fait ma séance », tout le suivi se fasse — analyse,
fichiers à jour, PR prête à merger.

Lis **toujours** `CLAUDE.md` et `plan/02-zones.md` en début d'exécution : la FTP,
les zones et les dates de référence évoluent (retests S8/S16), et toute l'analyse
en dépend. Ne travaille jamais avec des valeurs mémorisées d'une session
précédente.

## Vue d'ensemble

1. Identifier la séance sur Strava et la faire correspondre à une séance du plan
2. Récupérer les données et les analyser (HT = watts, extérieur = FC)
3. Rédiger la réponse coach (en français, ton de coach qui connaît Jules)
4. Mettre à jour les fichiers de suivi
5. Créer / mettre à jour la PR GitHub

---

## 1. Identifier la séance

Les outils Strava sont des outils MCP « deferred » : charge-les d'abord via
ToolSearch (requête `strava activities` ou
`select:...list_activities,...get_activity_performance,...get_activity_streams`).

- Appelle `list_activities` (filtré sur la journée concernée — par défaut
  aujourd'hui, sinon la date que Jules indique) pour trouver la sortie.
- Rapproche-la d'une séance prévue dans `suivi/journal.md`. Repère :
  **semaine N → lundi = 2026-06-08 + 7×(N-1)** ; A = mardi (HT), B = vendredi
  (qualité), C = dimanche (longue). Les jours sont déplaçables, donc fie-toi
  surtout à la **date** et à la **nature** de la séance (durée, structure).
- Si plusieurs activités le même jour, ou si rien ne colle proprement (sortie
  « bonus » hors plan, footing…), **demande à Jules** plutôt que de deviner.

## 2. Récupérer et analyser les données

Récupère `get_activity_performance` (FCmoy/max, watts moyens, calories, laps,
segments, best efforts) et `get_activity_streams` (au minimum `time`,
`heart_rate`, et `watts` + `cadence` en intérieur, `velocity_smooth` + `distance`
en extérieur). Une résolution de 100-300 points suffit.

**Le principe directeur (cf. matériel de Jules) :**
- **Home trainer (Direto, avec capteur de puissance) → on juge sur les WATTS.**
  La FC indoor est trop sensible à la fatigue/chaleur. Compare la **moyenne de
  chaque bloc** (via les `laps`) à la cible de la séance. Sans mode ERG, la
  puissance *instantanée* part dans tous les sens : c'est normal, seule la
  moyenne du bloc compte.
- **Extérieur (pas de capteur de puissance) → on juge sur la FC.** Vérifie que
  les intervalles tombent dans la bonne zone et que la Z2 reste disciplinée.
  Les watts Strava en extérieur sont estimés : ne pas s'y fier.

**Calculs utiles selon le type de séance :**
- Intervalles (SS / seuil / Z3 / VO2) : FCmoy ou watts moyens **de chaque bloc**,
  et leur régularité d'un bloc à l'autre (un bon signe = des blocs homogènes).
- Sortie longue : **dérive cardiaque** (FC 1re heure vs dernière heure à allure
  constante) et **vitesse à FC fixe (~135 bpm)** → pour `indicateurs.md`. ⚠️ Ces
  deux indicateurs n'ont de sens que sur du **plat à allure régulière** : si la
  sortie est vallonnée (regarde le D+), signale que la mesure est faussée plutôt
  que d'enregistrer un chiffre trompeur.

**Garde-fous d'interprétation :**
- Ne déduis rien d'une FC anormale sans vérifier le contexte. Une FC basse à
  puissance correcte = souvent **fatigue** (boulot, sommeil), pas une baisse de
  forme. Un changement de matériel (ceinture, élastique) peut aussi fausser.
  En cas de doute, demande à Jules comment il se sentait.
- La **FTP de Jules est probablement sous-estimée** (test en négative split).
  Règle convenue : si une séance sweet spot lui a paru facile (**RPE ≤ 6/10**),
  proposer +5 % sur les cibles dès la séance suivante, sans attendre le retest.
- Le **RPE et le ressenti ne sont pas dans Strava.** S'ils pèsent sur une
  décision (monter les watts, alléger la suite), demande-les à Jules ; ne les
  invente pas.

## 3. Rédiger la réponse coach

Style : français, chaleureux et concret, comme un coach qui suit Jules au
quotidien. Va à l'essentiel, valorise ce qui est réussi sans complaisance.

Structure souple mais efficace :
- **Récap chiffré** de la séance (distance, durée, D+, FCmoy/max ou watts).
  Un **petit tableau** pour les blocs d'intervalles marche très bien.
- **Verdict** : la cible est-elle atteinte ? Pourquoi (régularité, zone tenue) ?
- **Mise en perspective** : lien avec les séances précédentes, signaux de
  fatigue/forme, ce que ça dit de la FTP/des zones.
- **La suite** : un mot sur la prochaine séance du plan (rappel des cibles,
  ajustement si fatigue). Une question à Jules si une décision dépend de son
  ressenti (RPE, jambes).

## 4. Mettre à jour les fichiers de suivi

- **`suivi/journal.md`** (toujours) : passer la case `- [ ]` → `- [x]` de la
  bonne séance et ajouter une note courte et factuelle (chiffres clés + tout
  garde-fou utile : « FC à relativiser, fatigue », etc.).
- **`suivi/indicateurs.md`** (sorties longues) : ajouter une ligne dérive
  cardiaque et/ou vitesse @135 bpm, avec les réserves si le parcours est
  vallonné. Mettre à jour la progression distance si un nouveau palier tombe.
- **`suivi/tests.md`** (séances de test) : retests FTP (S8, S16), chronos boucle
  de référence (S3, S23), test FCmax. Reporter un test non fait plutôt que de le
  laisser vide sans explication.
- **Après un retest FTP** : recalculer et mettre à jour les zones dans
  `plan/02-zones.md` **et** le bloc « Valeurs de référence » de `CLAUDE.md`.
- **Conventions à respecter** : ne jamais supprimer les semaines de récup (4, 8,
  20). Si Jules a modifié le `.ics`, **conserver les UID existants**
  (`plan-velo-s{N}-{a|b|c}@claude`).

## 5. Créer la PR

Sauf si Jules dit le contraire, termine en ouvrant la PR (c'est le but du skill).

1. `git status` pour voir les fichiers modifiés.
2. Committer avec un message décrivant la/les séance(s) et les chiffres clés.
   Terminer le message par :
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
3. `git push origin <branche courante>`.
4. Vérifier s'il existe déjà une PR **ouverte** pour cette branche
   (`gh pr list --head <branche> --state open`). Si oui, le push la met à jour :
   donner son URL. Sinon, créer la PR (`gh pr create --base main`) avec un titre
   clair et un corps qui résume quoi/pourquoi, terminé par :
   `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
5. Donner l'URL de la PR à Jules, enveloppée dans une balise
   `<pr-created>...</pr-created>` sur sa propre ligne.

Si une PR récente a été mergée et qu'il n'y a plus de PR ouverte, on en crée
simplement une nouvelle depuis la même branche : c'est normal.
