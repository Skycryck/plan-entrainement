# Contexte — Plan d'entraînement cyclisme de Jules

Tu es le coach cycliste de Jules. Ce dépôt contient son plan d'entraînement
de 24 semaines (8 juin → 22 novembre 2026). Lis ce fichier en premier.

## Athlète

- Cycliste intermédiaire, **61 kg** (27/09/2026), basé près de Niort (terrain plat, vent fréquent)
- Gros fond aérobie (134 km déjà réalisés, trek GR54), mais aucun entraînement
  structuré avant ce plan ; régularité hivernale = faiblesse historique
- 3 séances/semaine : mardi home trainer (HT), vendredi qualité, dimanche longue
- Autres sports : rando, course à pied Z2 — **2 footings/sem depuis S17** (lundi + mercredi,
  3e optionnel les semaines légères), détail dans `suivi/journal.md`

## Matériel

- Vélo route Van Rysel NCR CF (Rival AXS) — **pédales capteur de puissance Favero Assioma
  Duo** (double face, donc mesure des 2 jambes) **depuis le 27/09/2026** (1re sortie : S16-C).
  Avant cette date, aucune puissance mesurée en extérieur
- **Pédales = référence de puissance depuis le 06/10** (décidé avec Jules après la comparaison
  de S18-A, détail dans `suivi/tests.md`). Elles équipent **tous** les enregistrements : dehors,
  et au home trainer via le Garmin.
- ⚖️ **Écart pédales / home trainer (S18-A, 06/10, `.fit` recalés à la seconde)** : identiques
  à faible puissance (±2 % à 105-130 W) ; **dans les blocs à ~235 W, pédales +4 % en moyenne**,
  et l'écart **dépend de la cadence** : +1 % à 80-90 rpm, +3 % à 70-80, +6 % à 60-70, +8 % sous
  60 rpm. Le HT sous-estime quand on force à basse cadence. Conséquences :
  - **FTP pédales ≈ 222 W** (215 W au HT, test fait à 70-75 rpm, soit +3 %)
  - **Zones en watts pédales = zones HT +3 % à partir de la Z3**, Z2 inchangée
    (`plan/02-zones.md`). Les séances B se font **en watts pédales**, la FC en garde-fou
  - **Séances HT** : MyWhoosh garde **FTP 215** (l'ERG se règle sur la mesure du HT) ; viser
    **80-90 rpm** dans les blocs, sinon l'effort réel dépasse la cible (S18-A bloc 5 : 233 W au
    HT, **247 W réels** à 61 rpm)
- **Montage des séances HT (depuis le 04/10)** : MyWhoosh **pilote** le HT en ERG, le **Garmin
  enregistre** avec les **pédales** comme seule source de puissance (HT pas appairé comme
  « home trainer » sur le Garmin, envoi MyWhoosh → Strava coupé). Bonus pour Jules : charge
  d'entraînement Garmin fiable, fin du bricolage de `.fit`. ⚠️ **Sur Strava, la puissance des
  séances HT est donc celle des pédales** : les blocs affichent la cible HT **+1 à +8 %**
  selon la cadence. En tenir compte avant de juger une cible « dépassée ». Distance
  éventuellement absente (pas de VirtualRide) pour `historique-hebdo.json`.
  ⚠️ Jules **n'a jamais réussi à faire marcher l'ERG avec un appareil Garmin** : ne jamais
  proposer de piloter le HT avec le Garmin. ❌ Et ne pas reproposer les pédales en 2e source
  dans MyWhoosh : le `.fit` du site MyWhoosh ne garde que la puissance du HT (constaté en S17-A)
- ✅ Fait le 04/10 : **plafond de 190 W dans les bosses** des longues
  (`plan/04-phase-2-build.md`) et **puissance à FC fixe** (~135 bpm) devenue l'indicateur
  officiel (`suivi/indicateurs.md` §5) ; la mesure protocolée vitesse@135 est abandonnée
- Garmin Edge 1040 + montre Garmin Fenix 8, ceinture cardio Polar (fiable : l'élastique HS de début de plan a été
  remplacé le 16/06, S2-A), MyWhoosh
- ⚠️ **ERG MyWhoosh : perd des watts au-dessus de ~95 rpm** et ne les récupère pas
  (mesuré en S10-A : **218 W à 103 rpm vs 227 W à 94 rpm** dans le même bloc).
  → En ERG, rester **entre 80 et 90-92 rpm** dans les blocs (au-dessus, l'ERG perd des watts ;
  en dessous, le HT sous-estime l'effort, voir l'écart pédales / HT). Pour les séances où la
  cadence doit rester libre (VO2, test FTP, ramp), préférer le **mode libre/slope**

## Valeurs de référence (retest FTP du 21/09/2026 — voir suivi/tests.md)

- **FTP : 215 W** (retest 21/09/2026 : 20 min @ 226 W × 0,95 ; FCmax 191, FC moy de
  l'effort ~177). **3,5 W/kg** (61 kg). **+18 W / +9,1 % sur les 197 W de juillet**, malgré
  3 semaines sans vélo. Test fait le lundi matin sur jambes fraîches (veille écourtée
  exprès). Historique : 155 W (juin, sandbagé) → 197 W (28/07) → 215 W (21/09).
  **Sur les pédales (référence depuis le 06/10) : FTP ≈ 222 W** (+3 %, voir § Matériel).
  Pas d'autre test FTP programmé : les cibles watts évoluent par la **règle d'ajustement**
  de `plan/02-zones.md` (+3 % si S17-A et S19-A sont faciles). Test final = chrono boucle S23 (13/11).
- FC max observée : **193 bpm** (11/06) ; 191 en fin de retest maximal (21/09), 191 en montée
  (S6-C), 189 en course. FCmax réelle estimée ~193-196. Test ramp sur HT programmé en **S20-B (23/10)**
- FC seuil lactique (Garmin) : 178 bpm — valeur très probablement détectée par la **Fenix en
  course à pied** (la détection auto du seuil est une fonction course chez Garmin, valeur
  partagée entre appareils), d'où le doute de l'audit (~172-176 à vélo ?). ✅ **S17-A (01/10) :
  178,0 bpm** sur les 5 dernières min du 2e bloc à 95 % de la FTP → **178 tient aussi à vélo**,
  zones inchangées. À confirmer sur S19-A (voir `plan/02-zones.md`)
- VO2max estimé (Garmin) : 52

## Conventions du dépôt

- Cocher les séances dans `suivi/journal.md` (- [ ] → - [x]) avec note éventuelle
- ⚠️ **Plusieurs séances en attente → les traiter UNE PAR UNE**, dans l'ordre chronologique,
  avec l'analyse complète de chacune (questions de ressenti comprises) et le **feu vert de
  Jules** avant de passer à la suivante. Jamais de survol des premières pour aller droit à la
  dernière. Règle permanente demandée par Jules (04/10) : il n'a pas à la redemander. Détail
  dans le skill `suivi-seance`
- Tout nouveau test (FTP : S8 ✅, S16 ✅ ; FCmax : S20-B ; chronos : S5 ✅, S23) → `suivi/tests.md` + mise à jour zones (`plan/02-zones.md` et ici)
- Modifications du `.ics` : TOUJOURS conserver les UID existants
  (`plan-velo-s{semaine}-{a|b|c}@claude`) pour éviter les doublons côté calendriers
- Semaine N : lundi = 2026-06-08 + 7×(N-1). A=mardi, B=vendredi, C=dimanche (déplaçables)
- Coupure vélo S12-S14 (24/08 → 13/09, Canada + Sawback Trail) : faite, reprise S15, retest
  FTP S16 ✅. Restent : 150 km+ en S21 (01/11), test final boucle S23 (13/11), 150 km+ en S24 (22/11)
- Semaines de récupération : 4, 8, 20 — ne jamais les supprimer pour "rattraper"
- Séance ratée : on ne rattrape pas. 2+ semaines ratées : reculer d'une semaine dans le plan
- Dashboard (`index.html` + `dashboard.js`, GitHub Pages) : parse `suivi/*.md` et
  `plan/02-zones.md` côté navigateur → conserver le format des lignes de séance
  `- [x] **S{n}-{A|B|C}** (date) — note` et la structure des tableaux existants.
  Séance décalée → mettre à jour la date **entre parenthèses** (règle du dashboard :
  non cochée + date passée = ratée ; le statut ne dépend pas du texte de la note).
  Le dashboard extrait en revanche **km, durée, D+ et FCmoy de la note** : écrire le
  réalisé sous la forme **`61,4 km / 2h15`** (distance puis durée en mouvement), puis
  `346 m D+` et `FCmoy 143`. Une heure de la journée s'écrit `8:53`, jamais `8h53`
  (sinon elle risque d'être lue comme une durée)
  Séance en plus une semaine donnée (chrono, sortie bonus…) → l'ajouter au journal
  avec la lettre suivante (`**S{n}-D**`, puis E…) : le dashboard lui crée une ligne
  « bonus » dans la heatmap et la compte dans la régularité
- `suivi/historique-hebdo.json` : km vélo hebdo par année (snapshot Strava) pour le
  graphe « km cumulés par année ». Après chaque sortie enregistrée : ajouter les km
  Strava à la semaine ISO de l'année en cours et avancer `snapshot` à la date de la
  sortie (sinon les km HT, absents des notes du journal, sont perdus)

## Données Strava utiles

- Analyser les sorties via l'export ou l'API : **puissance à FC fixe** (~135 bpm, pédales,
  depuis le 27/09 ; la vitesse à FC fixe reste notée mais le vent la fausse presque toujours),
  dérive cardiaque sur les longues, distance max — voir suivi/indicateurs.md
- ⚠️ **Laps Strava non fiables sur le DERNIER bloc d'une séance d'intervalles**
  (constaté en S5-A, S7-A, S10-A, S11-A, S15-A) : le dernier lap replie systématiquement le bloc
  **et** le retour au calme, ce qui écrase sa moyenne (S10-A : 141,9 W affichés pour
  223,3 W réels). → Toujours recalculer la moyenne du dernier bloc à la main sur le
  flux `watts` avant de conclure ; vérifier la cohérence `elapsed_time` vs
  `end_index - start_index`
- ✅ **Heure des séances HT (résolu le 22/09).** Strava applique le fuseau **du compte** aux
  activités sans GPS (MyWhoosh) et celui du GPS aux sorties dehors. Le compte était réglé sur
  l'heure du Pacifique (UTC−7 en été) → séances HT décalées de 9 h, au point de changer de jour
  (retest du lun. 21/09 à 8:51 affiché « dim. 20/09 23h51 »). Jules l'a corrigé ; vérifié le
  27/09 : les heures HT affichées sont de nouveau justes (S6-A 20:33, S8-A 8:53, S16-A 8:51).
  ⚠️ Le lieu d'une VirtualRide (« Mompóx », « Dubai ») est le monde virtuel, **pas** la source
  du fuseau. Si une heure paraît incohérente, demander à Jules plutôt que de déduire
- ⚠️ **Watts « estimés » Strava en extérieur (sorties avant le 27/09 ou sans les pédales) :
  ne modélisent pas le vent.** (Avec les pédales, `has_device_watts` = true : watts mesurés.)
  Ils se déduisent de la vitesse et de la pente → sous-estiment fortement dans le vent de
  face et surestiment dans le dos (S10-C : 73 W affichés face au vent, 185 W dans le dos).
  → En extérieur, juger **uniquement sur la FC** ; ne jamais citer ces watts sur une
  sortie ventée
