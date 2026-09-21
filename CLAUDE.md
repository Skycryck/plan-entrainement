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
- ⚠️ **ERG MyWhoosh : perd des watts au-dessus de ~95 rpm** et ne les récupère pas
  (mesuré en S10-A : **218 W à 103 rpm vs 227 W à 94 rpm** dans le même bloc).
  → En ERG, plafonner la cadence à **~90-92 rpm**. Pour les séances où la cadence doit
  rester libre (VO2, test FTP), préférer le **mode libre/slope**

## Valeurs de référence (retest FTP du 21/09/2026 — voir suivi/tests.md)

- **FTP : 215 W** (retest 21/09/2026 : 20 min @ 226 W × 0,95 ; FCmax 191, FC moy de
  l'effort ~177). W/kg ~3,5. **+18 W / +9,1 % sur les 197 W de juillet**, malgré
  3 semaines sans vélo. Test fait le lundi matin sur jambes fraîches (veille écourtée
  exprès). Historique : 155 W (juin, sandbagé) → 197 W (28/07) → 215 W (21/09).
  Pas d'autre test FTP programmé ; test final = chrono boucle S23 (13/11).
- FC max observée : 193 bpm (vraie FCmax probablement 198-203)
- FC seuil lactique (Garmin) : 178 bpm
- VO2max estimé (Garmin) : 52

## Conventions du dépôt

- Cocher les séances dans `suivi/journal.md` (- [ ] → - [x]) avec note éventuelle
- Tout nouveau test (FTP : S8 ✅, S16 ✅ ; chronos : S5 ✅, S23) → `suivi/tests.md` + mise à jour zones (`plan/02-zones.md` et ici)
- Modifications du `.ics` : TOUJOURS conserver les UID existants
  (`plan-velo-s{semaine}-{a|b|c}@claude`) pour éviter les doublons côté calendriers
- Semaine N : lundi = 2026-06-08 + 7×(N-1). A=mardi, B=vendredi, C=dimanche (déplaçables)
- ⚠️ COUPURE VÉLO du 24/08 au 13/09 (vacances dès le 25/08 + rando itinérante, S12-S14) :
  footings Z2 optionnels, la semaine de rando = la charge. Reprise progressive S15,
  retest FTP S16 ✅ fait le 21/09. Le 150 km+ est en S21 (01/11), test final boucle S23 (13/11)
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
- ⚠️ **Laps Strava non fiables sur le DERNIER bloc d'une séance d'intervalles**
  (constaté en S5-A, S7-A, S10-A, S11-A, S15-A) : le dernier lap replie systématiquement le bloc
  **et** le retour au calme, ce qui écrase sa moyenne (S10-A : 141,9 W affichés pour
  223,3 W réels). → Toujours recalculer la moyenne du dernier bloc à la main sur le
  flux `watts` avant de conclure ; vérifier la cohérence `elapsed_time` vs
  `end_index - start_index`
- ⚠️ **Horodatage Strava FAUX sur les activités MyWhoosh (VirtualRide).** Strava tague ces
  activités avec la localisation du **monde virtuel** (Mompóx en Colombie, Dubai…) et en déduit
  un fuseau horaire qui n'est pas celui de Jules. Le `start_local` peut être décalé de plusieurs
  heures, au point de **changer de jour** : le retest FTP du **lun. 21/09 à 9h30** est apparu en
  « dim. 20/09 à 23h51 ». Le **fichier FIT est sain** : les minutes sont intactes (décalage
  d'un nombre entier d'heures = pure translation de fuseau), et le même fichier importé dans
  Garmin Connect affiche l'heure correcte. Puissance, FC, durée et cadence sont donc fiables —
  seule l'étiquette temporelle est fausse. → Ne jamais déduire d'une activité MyWhoosh l'heure
  réelle, la fraîcheur (« il l'a fait à minuit ») ni même la date quand elle est proche de
  minuit ; **demander à Jules**. Les sorties extérieures (GPS réel) ne sont pas concernées.
  ❌ **Pas de contournement simple, ne pas en proposer** : Strava n'autorise pas la modification
  de la date/heure de départ d'une activité, et la date étant *calculée* depuis le fichier, la
  supprimer et la réimporter redonne toujours le même résultat. Garmin→Strava ne relaie pas non
  plus les fichiers importés à la main (seulement ce qui vient d'un appareil Garmin). Seul un
  décalage des horodatages *à l'intérieur* du FIT corrigerait l'affichage — manipulation à
  refaire à chaque séance, pour un gain purement cosmétique : **on ne corrige pas, on note la
  vraie date dans le journal**, qui fait foi pour le dépôt et le dashboard
- ⚠️ **Watts « estimés » Strava en extérieur (pas de capteur) : ne modélisent pas le vent.**
  Ils se déduisent de la vitesse et de la pente → sous-estiment fortement dans le vent de
  face et surestiment dans le dos (S10-C : 73 W affichés face au vent, 185 W dans le dos).
  → En extérieur, juger **uniquement sur la FC** ; ne jamais citer ces watts sur une
  sortie ventée
