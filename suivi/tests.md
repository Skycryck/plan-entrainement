# Historique des tests

## Tests FTP (20 min, home trainer)
| Date | Sem. | Puissance 20 min | FTP (×0,95) | W/kg | FC moy/max | Notes |
|---|---|---|---|---|---|---|
| 11/06/2026 | S1 | 163 W | **155 W** | 2,5 | 166 / 193 | Négative split marqué (130→196 W, sprint final 427 W) → FTP sous-estimée (retest S8 : 197 W). Cadence 94 rpm. VO2max Garmin : 52. |
| 28/07/2026 | S8 | 207 W | **197 W** | 3,2 | ~167 / 186 | RPE 10, test bien mené : départ direct ~205 W tenu régulier, **PAS de négative split** (l'erreur de juin corrigée). ERG désactivé, le matin (8h53) pour la fraîcheur. **+42 W vs juin** mais juin était sandbagé → gros recalibrage plus que hausse pure ; progression réelle ~+25-30 W vs FTP estimée de juin (165-175). Ancienne "SS" à 144 W = ~73 % FTP = endurance, d'où les RPE 6. |
| 21/09/2026 | S16 | **226 W** | **215 W** | 3,5 (61 kg) | ~177 / **191** | **+18 W (+9,1 %) sur juillet, et ce malgré 3 semaines sans vélo.** ✅ **Conditions correctes** : lundi matin, au lendemain de S15-C (volontairement écourtée à 1h29 pour ça) et après une nuit de sommeil. ⚠️ **Bouton Lap non pressé** → bloc absent des laps, recalculé à la main sur le flux watts : **226,0 W sur 1200 s exactement** (le « 214w » de la description Strava était la FTP, pas la moyenne). ERG bien désactivé (puissance de 144 à 363 W dans l'effort). **Allure par quart : 234 / 228 / 214 / 229 W** — départ trop haut (250 W sur la 1re minute), creux au 3e quart, relance sur la fin (252 W sur la dernière minute). Pas parfaitement régulier, mais **pas de négative split** : test valide. **FCmax 191** (vs 186 en juillet) = effort réellement maximal, à 99 % de la FCmax observée. FC moyenne de l'effort ~177 — sur un effort à 105 % de FTP, donc au-dessus du seuil : ne confirme pas la FC seuil Garmin de 178 (voir `plan/02-zones.md`). Cadence basse (~70-75 rpm). |


## Chronos boucle de référence

Boucle choisie (révisée le 28/06) : **42,9 km · 130 m D+ / 132 m D− · plaine sud-est** (départ sud de Niort → Aiffres → Prahecq / plateau roulant → retour). Tracé figé : **`suivi/boucle-reference.gpx`** — recharger ce GPX à l'identique pour chaque chrono (initial S5 et final S23).
Règles : même sens, départ lancé, solo, sans arrêt, vent < 20 km/h sinon décaler. Échauffement 20 min Z2 avant (hors boucle). Chrono lancé à un point fixe en sortie d'agglo pour neutraliser feux/ronds-points urbains.
| Date | Sem. | Temps | Vitesse moy. | FC moy. | Vent / conditions | Notes |
|---|---|---|---|---|---|---|
| 11/07/2026 | S5 | **1h25:58** | **30,0 km/h** | 159 (max 183) | Vent 2-4 m/s (~7-14 km/h), léger de face au départ — sous la limite ✅ | ⏱️ **Chrono initial = référence de départ.** À l'aube (~20°C), échauffement 4 km Z2, solo, sans arrêt. Splits 5 km très réguliers (9:18-10:42), fin en négatif (FC jusqu'à 183). RPE élevé (« dur ») mais 1er vrai effort d'intensité vélo → marge de progression nette d'ici le test final |
| | S17-S18 | | | | | Optionnel, post-reprise |
| | S23 | | | | | Test final (ven. 13/11) — **objectif 32-33 km/h** (+2/+3 vs le 11/07). Le gain est surtout dans le pilotage : viser FCmoy 165-170 (le chrono initial n'était qu'à 159 = Z3 tempo), pas seulement plus de watts |

## Test FCmax
| Date | Protocole | FCmax atteinte | Notes |
|---|---|---|---|
| 11/06/2026 | Fin de test FTP (sprint final à 427 W) | **193 bpm** | Record actuel |
| 19/07/2026 | Montées de la Sainte-Victoire (S6-C) | 191 bpm | Pas un test, relevé en passant |
| 21/08/2026 | Fin de séance B (S11-B), **sur le plat** : ~5 min à 35-43 km/h | 187 bpm | ❌ Tentative ratée : au km 47, en fin de grosse semaine, sur le plat (la résistance de l'air fait plafonner avant la FC). Protocole abandonné |
| 21/09/2026 | Fin du retest FTP (S16-A), dernière minute à 252 W | 191 bpm | Effort maximal de 20 min |
| 23/10/2026 | S20-B : **ramp sur home trainer**, jambes fraîches | | ⏳ Prévu — protocole ci-dessous |

**Estimation actuelle : FCmax ~193-196.** Toutes les fins d'efforts maximaux plafonnent à
191-193 ; l'hypothèse « 198-203 » de juin n'est étayée par aucune mesure. Enjeu limité : les
zones reposent sur la FTP et la FC seuil, pas sur la FCmax.

**Protocole ramp (S20-B, ven. 23/10)** — semaine de récup, 5 jours après la 130 km, 9 jours
avant le 150 km : effort court, sans impact sur la fraîcheur.
1. MyWhoosh en **mode libre/slope** (pas d'ERG). Échauffement 15 min Z2 + 2×1 min haute cadence.
2. Paliers de **1 min** : départ **140 W**, puis **+20 W chaque minute** (160, 180, 200…).
   Cadence libre, assis.
3. Quand le palier ne tient plus, **tout donner 20-30 s**, puis 10 min très facile.
4. Relever la **FC max de l'Edge** et la noter ici, même si elle reste sous 193.
   Ne pas en déduire de FTP : un ramp n'est pas comparable au test de 20 min.
