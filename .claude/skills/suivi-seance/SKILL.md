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

Ce skill orchestre le rituel post-séance de Jules. Il décrit **le processus**,
pas les règles d'entraînement : celles-ci (contexte athlète, matériel, zones,
règle d'ajustement FTP, semaines de récup, conventions du dépôt, indicateurs à
suivre) vivent dans **`CLAUDE.md`** (racine) et **`plan/`**, qui sont mis à jour
au fil du plan. Le skill, lui, change rarement.

> ⚠️ **Source de vérité = le dépôt, pas ce fichier.** Lis toujours `CLAUDE.md`
> et `plan/02-zones.md` au début, et applique ce qui y est écrit. Ne recopie
> jamais de chiffres (FTP, zones, dates) ici : ils périment. En cas de doute sur
> une convention, c'est le dépôt qui tranche.

## Vue d'ensemble

1. Identifier la séance sur Strava et la rattacher à une séance du plan
2. Récupérer les données et les analyser
3. **Demander à Jules les conditions / le ressenti** (étape clé, voir §3)
4. Rédiger la réponse coach
5. Mettre à jour les fichiers de suivi
6. Créer / mettre à jour la PR GitHub

---

## 1. Identifier la séance

Les outils Strava sont des outils MCP « deferred » : charge-les d'abord via
ToolSearch (requête `strava activities` ou
`select:...list_activities,...get_activity_performance,...get_activity_streams`).

- `list_activities` filtré sur la journée concernée (par défaut aujourd'hui,
  sinon la date indiquée par Jules) pour trouver la sortie.
- Rapproche-la d'une séance prévue dans `suivi/journal.md` en t'appuyant sur la
  **date** (formule des semaines : voir `CLAUDE.md`) et la **nature** de la
  séance (durée, structure). Les jours sont déplaçables : fie-toi au contenu.
- Si plusieurs activités le même jour, ou si rien ne colle proprement (sortie
  bonus hors plan, footing…), **demande à Jules** plutôt que de deviner.

## 2. Récupérer et analyser les données

`get_activity_performance` (FCmoy/max, watts moyens, calories, laps, segments)
et `get_activity_streams` (`time`, `heart_rate`, + `watts`/`cadence` en
intérieur, `velocity_smooth`/`distance` en extérieur). Résolution 100-300.

Méthode d'analyse (le « sur quoi juger » — watts en HT, FC en extérieur — est
dans `CLAUDE.md` § matériel ; les zones cibles sont dans `plan/02-zones.md`) :

- **Intervalles** (SS / seuil / Z3 / VO2) : calcule la moyenne **de chaque bloc**
  via les `laps` et compare-la à la cible. Regarde la régularité d'un bloc à
  l'autre. En HT sans ERG, la puissance *instantanée* part dans tous les sens :
  c'est normal, seule la moyenne du bloc compte.
- **Sortie longue** : dérive cardiaque (FC 1re heure vs dernière) et vitesse à
  FC fixe (~135 bpm) → `indicateurs.md`. ⚠️ Ces indicateurs ne valent que sur du
  **plat à allure régulière** : si le parcours est vallonné (regarde le D+) ou
  l'allure irrégulière, signale que la mesure est faussée plutôt que d'inscrire
  un chiffre trompeur.

Ne déduis rien d'une donnée surprenante sans son contexte (cf. §3).

## 3. Demander les conditions / le ressenti

Les données Strava ne disent pas **comment Jules se sentait ni dans quelles
conditions il a roulé** — or ça change souvent le diagnostic (une FC élevée peut
être la chaleur, la fatigue, un choix d'allure ; une FC basse, un manque de
récup). C'est l'angle mort à combler avant de conclure.

- Si quelque chose **surprend** dans les données (dérive forte, FC anormale,
  cibles non tenues, séance qui paraît « ratée »), **pose une question courte**
  à Jules avant de trancher : météo/chaleur, sommeil/fatigue, sensations,
  allure choisie. Ne devine pas la cause, ne l'invente pas.
- Pour les séances de qualité, le **RPE (/10)** affine la décision d'ajuster les
  cibles (la règle d'ajustement est dans `plan/02-zones.md`) : demande-le s'il
  n'est pas donné et qu'il pèse sur une décision.
- Si tout est cohérent et conforme à la cible, inutile d'alourdir : une simple
  invitation à compléter (« dis-moi si tu veux noter un ressenti ») suffit.

Intègre la réponse de Jules à l'analyse **et** à la note du journal.

## 4. Rédiger la réponse coach

Style : français, chaleureux et concret, comme un coach qui suit Jules au
quotidien. Va à l'essentiel, valorise ce qui est réussi sans complaisance.

- **Récap chiffré** (distance, durée, D+, FCmoy/max ou watts) — un petit tableau
  pour les blocs d'intervalles marche bien.
- **Verdict** : cible atteinte ? pourquoi (régularité, zone tenue) ?
- **Mise en perspective** : lien avec les séances précédentes, signaux de
  fatigue/forme, ce que ça dit des zones/de la FTP.
- **La suite** : un mot sur la prochaine séance du plan, ajustée si besoin.

## 5. Mettre à jour les fichiers de suivi

Quels fichiers, pour quoi, et les conventions (cases à cocher, retests FTP →
zones, UID du `.ics`, semaines de récup intouchables) : tout est décrit dans le
§ « Conventions du dépôt » de `CLAUDE.md`. Applique-les. En résumé :

- **`suivi/journal.md`** (toujours) : `- [ ]` → `- [x]` + note courte et
  factuelle (chiffres clés + contexte/ressenti recueilli en §3).
- **`suivi/indicateurs.md`** (longues) : dérive et/ou vitesse @135 bpm, avec les
  réserves utiles ; progression distance si nouveau palier.
- **`suivi/tests.md`** (séances de test) : reporter un test non fait plutôt que
  de laisser vide. Après un retest FTP, mettre à jour les zones (`plan/02-zones.md`
  **et** le bloc « Valeurs de référence » de `CLAUDE.md`).

## 6. Créer la PR

Sauf si Jules dit le contraire, termine en ouvrant la PR.

1. `git status` pour voir les modifs.
2. Committer avec un message décrivant la/les séance(s) et les chiffres clés,
   terminé par : `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
3. `git push origin <branche courante>`.
4. S'il existe déjà une PR **ouverte** pour la branche
   (`gh pr list --head <branche> --state open`), le push la met à jour : donner
   son URL. Sinon créer la PR (`gh pr create --base main`) avec titre clair et
   corps résumant quoi/pourquoi, terminé par :
   `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
5. Donner l'URL à Jules dans une balise `<pr-created>...</pr-created>` sur sa
   propre ligne. (Une PR récente mergée et plus de PR ouverte → on en crée une
   nouvelle depuis la même branche, c'est normal.)
