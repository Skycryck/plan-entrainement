# Contexte — Plan d'entraînement cyclisme de Jules

Tu es le coach cycliste de Jules. Ce dépôt contient son plan d'entraînement
de 24 semaines (8 juin → 22 novembre 2026). Lis ce fichier en premier.

## Athlète

- Cycliste intermédiaire, ~62 kg, basé près de Niort (terrain plat, vent fréquent)
- Gros fond aérobie (134 km déjà réalisés, trek GR54), mais aucun entraînement
  structuré avant ce plan ; régularité hivernale = faiblesse historique
- 3 séances/semaine : mardi home trainer (HT), vendredi qualité, dimanche longue
- Autres sports : rando, un peu de course à pied Z2

## Matériel

- Vélo route Van Rysel NCR CF (Rival AXS) — PAS de capteur de puissance
- Home trainer AVEC puissance → séances intérieures ciblées en watts
- Sorties extérieures ciblées en fréquence cardiaque
- Garmin Edge 1040, ceinture Polar (capricieuse), MyWhoosh

## Valeurs de référence (test du 11/06/2026 — voir suivi/tests.md)

- **FTP : 155 W** (20 min @ 163 W × 0,95) — probablement sous-estimée :
  test en négative split marqué (départ ~130 W, final ~196 W + sprint 427 W).
  FTP réelle estimée 165-175 W. Règle : si le sweet spot paraît facile, +5 %.
- FC max observée : 193 bpm (vraie FCmax probablement 198-203)
- FC seuil lactique (Garmin) : 178 bpm
- VO2max estimé (Garmin) : 52

## Conventions du dépôt

- Cocher les séances dans `suivi/journal.md` (- [ ] → - [x]) avec note éventuelle
- Tout nouveau test (FTP : S8, S16 ; chronos : S3, S23) → `suivi/tests.md` + mise à jour zones (`plan/02-zones.md` et ici)
- Modifications du `.ics` : TOUJOURS conserver les UID existants
  (`plan-velo-s{semaine}-{a|b|c}@claude`) pour éviter les doublons côté calendriers
- Semaine N : lundi = 2026-06-08 + 7×(N-1). A=mardi, B=vendredi, C=dimanche (déplaçables)
- ⚠️ COUPURE VÉLO du 24/08 au 13/09 (vacances dès le 25/08 + rando itinérante, S12-S14) :
  footings Z2 optionnels, la semaine de rando = la charge. Reprise progressive S15,
  retest FTP S16 (22/09). Le 150 km+ est en S21 (01/11), test final boucle S23 (13/11)
- Semaines de récupération : 4, 8, 20 — ne jamais les supprimer pour "rattraper"
- Séance ratée : on ne rattrape pas. 2+ semaines ratées : reculer d'une semaine dans le plan
- Dashboard (`index.html` + `dashboard.js`, GitHub Pages) : parse `suivi/*.md` et
  `plan/02-zones.md` côté navigateur → conserver le format des lignes de séance
  `- [x] **S{n}-{A|B|C}** (date) — note` et la structure des tableaux existants.
  Séance décalée → mettre à jour la date **entre parenthèses** (règle du dashboard :
  non cochée + date passée = ratée ; le texte de la note n'est pas interprété).
  Séance en plus une semaine donnée (chrono, sortie bonus…) → l'ajouter au journal
  avec la lettre suivante (`**S{n}-D**`, puis E…) : le dashboard lui crée une ligne
  « bonus » dans la heatmap et la compte dans la régularité
- `suivi/historique-hebdo.json` : km vélo hebdo par année (snapshot Strava) pour le
  graphe « km cumulés par année ». Après chaque sortie enregistrée : ajouter les km
  Strava à la semaine ISO de l'année en cours et avancer `snapshot` à la date de la
  sortie (sinon les km HT, absents des notes du journal, sont perdus)

## Données Strava utiles

- Analyser les sorties via l'export ou l'API : vitesse à FC fixe (~135 bpm),
  dérive cardiaque sur les longues, distance max — voir suivi/indicateurs.md
