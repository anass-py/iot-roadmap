# learn/ — carnets de révision

Une petite plateforme statique qui lit les trois documents de `docs/` et les
rend consultables : fiches, dossiers de panne, pistes produit, recherche
globale et mode révision.

## Ouvrir

```bash
open learn/index.html          # suffit pour lire
```

Pour que la progression (« révisé ») survive à un rechargement, les navigateurs
exigent une vraie origine — servir le dossier suffit :

```bash
python3 -m http.server 8080 -d learn   # puis http://localhost:8080
```

## Après avoir modifié les documents

Le contenu n'est pas dupliqué : `assets/content.js` est **généré** depuis
`docs/NOTES.md`, `docs/DEBUG.md` et `docs/FRICTIONS.md`. Après toute
modification de ces fichiers :

```bash
python3 learn/build.py
```

Aucune dépendance : bibliothèque standard uniquement.

## Ce que le site fait du Markdown

| Écrit dans le document | Rendu |
|---|---|
| `- **Terme** : définition` | une fiche (masquable en mode révision) |
| `**Symptôme.**` + lignes + `→ remède` | un dossier de panne : signal rouge, cause, remèdes |
| `→ **Leçon** : …` | encadré ambre mis en avant |
| liste numérotée | les réflexes, en gros chiffres |
| bloc ``` | schéma monospace |
| `---` | sépare deux groupes dans le sommaire de gauche |

Une puce qui contient plusieurs `**Terme** :` (les QoS, par exemple) est
découpée en autant de fiches.

## Raccourcis

| Touche | Effet |
|---|---|
| `⌘K` / `Ctrl+K` / `/` | recherche globale (fiches, pannes, remèdes) |
| `↑` `↓` `⏎` | naviguer et ouvrir un résultat |
| `R` | mode révision : masque les réponses, clic pour révéler |
| `T` | thème clair / sombre |

## Fichiers

```
learn/
├── index.html          coque de la page
├── build.py            Markdown -> assets/content.js
├── assets/
│   ├── content.js      GÉNÉRÉ — ne pas éditer
│   ├── style.css       thème, animations
│   └── app.js          rendu, recherche, progression
└── README.md
```
