# 🚴 Plan d'entraînement cyclisme — 24 semaines

**Période :** 8 juin → 22 novembre 2026
**Objectif principal :** vitesse moyenne sur sorties 1-2h (24-25 → 27-29 km/h)
**Objectif secondaire :** sorties longues jusqu'à 150 km+

## Structure du dépôt

| Dossier / fichier | Contenu |
|---|---|
| `CLAUDE.md` | Contexte pour Claude Code (profil, zones, conventions) |
| `plan/` | Le plan détaillé : bilan initial, zones, les 4 phases |
| `suivi/journal.md` | ✅ Checklist des 72 séances, à cocher au fil de l'eau |
| `suivi/tests.md` | Historique des tests FTP et chronos boucle de référence |
| `suivi/indicateurs.md` | Tableaux de suivi des métriques clés |
| `calendrier/plan-entrainement.ics` | Calendrier abonnable (UID stables → mises à jour sans doublons) |
| `index.html` + `dashboard.{css,js}` | 📊 Dashboard (GitHub Pages) — vue générée depuis `suivi/*.md`, zéro build |

## Workflow

1. Faire la séance (détail dans le calendrier ou `plan/`)
2. Cocher dans `suivi/journal.md` + note rapide si besoin
3. Après chaque test (S1 ✅, S8, S16, S22) : remplir `suivi/tests.md` et mettre à jour les zones dans `plan/02-zones.md` et `CLAUDE.md`
4. Pour décaler des séances : modifier le `.ics` **en gardant les UID identiques**, commit, les calendriers abonnés se mettent à jour

## Dashboard

`index.html` (+ `dashboard.css`, `dashboard.js`) affiche la progression : anneau
d'avancement, heatmap de régularité, graphiques (FTP, vitesse @ ~135 bpm, dérive
cardiaque, sorties longues), jalons, badges, zones et dernières séances.

- **Zéro build, zéro double saisie** : la page fetch `suivi/*.md` et
  `plan/02-zones.md` au chargement et parse tout dans le navigateur.
  Cocher le journal + push = dashboard à jour.
- **Activation GitHub Pages** (une seule fois) : Settings → Pages →
  Source « Deploy from a branch » → branche `main`, dossier `/ (root)` → Save.
  La page sort sur `https://<user>.github.io/<repo>/`.
- En local : `python -m http.server 8000` à la racine puis
  `http://localhost:8000` (le `fetch()` ne marche pas en `file://`).

## Abonnement calendrier

URL raw du fichier `.ics` une fois le dépôt en ligne :
`https://raw.githubusercontent.com/<user>/<repo>/main/calendrier/plan-entrainement.ics`
