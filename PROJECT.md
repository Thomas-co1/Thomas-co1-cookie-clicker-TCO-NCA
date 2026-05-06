# PROJECT.md - Cookie Clicker

## But du projet

Ce projet consiste à développer un **Cookie Clicker** complet en JavaScript dans le cadre d'un TP fil rouge. L'objectif est de créer un jeu interactif où l'utilisateur clique sur un cookie pour accumuler des points, tout en respectant les meilleures pratiques de développement logiciel : tests automatisés, intégration continue, et workflow Git professionnel.

Le projet met l'accent sur :
- La qualité du code
- La couverture de tests (≥ 90%)
- L'approche TDD (Test-Driven Development)
- Le travail collaboratif via Git
- L'automatisation (CI/CD)

---

## Fonctionnalités principales

### Fonctionnalités de base
- **Clic sur cookie** : Le joueur clique sur un cookie géant pour gagner des points
- **Compteur de cookies** : Affichage en temps réel du nombre de cookies collectés
- **Cookies par seconde (CPS)** : Production automatique de cookies
- **Sauvegarde automatique** : Persistance des données en localStorage

### Système d'améliorations (Upgrades)
- **Curseur** : Génère automatiquement des cookies
- **Grand-mère** : Production de cookies passive
- **Ferme** : Production de cookies à plus grande échelle
- **Mine** : Production de cookies avancée
- **Usine** : Production de cookies industrielle
- **Banque** : Multiplicateurs de revenus
- **Temple** : Bonus spéciaux

Chaque amélioration :
- A un coût qui augmente progressivement
- Augmente la production de cookies par seconde
- Peut être achetée plusieurs fois

### Système de bonus
- **Multiplicateurs temporaires** : Bonus x2, x5, x10 pendant une durée limitée
- **Cookies dorés** : Apparitions aléatoires pour des bonus instantanés
- **Achievements** : Système de succès/trophées

### Interface utilisateur
- **Dashboard** : Vue d'ensemble des statistiques
- **Panneau d'améliorations** : Liste des upgrades disponibles
- **Indicateurs visuels** : Animations lors des clics et achats
- **Notifications** : Alertes pour les succès et événements
- **Thème responsive** : Adaptation mobile et desktop

### Fonctionnalités avancées
- **Système de prestige** : Reset du jeu avec bonus permanent
- **Statistiques détaillées** : Historique, graphiques de progression
- **Options** : Paramètres de jeu, import/export de sauvegarde
- **Mode hors-ligne** : Calcul des cookies gagnés pendant l'absence

---

## Architecture

### Structure du projet

```
cookie-clicker/
├── app.js                          # Point d'entrée Express
├── bin/
│   └── www                         # Script de démarrage du serveur
├── public/                         # Ressources statiques
│   ├── images/                     # Images (cookie, icons, etc.)
│   ├── javascripts/
│   │   ├── game.js                 # Logique principale du jeu
│   │   ├── clicker.js              # Gestion des clics
│   │   ├── upgrades.js             # Système d'améliorations
│   │   ├── storage.js              # Gestion localStorage
│   │   ├── ui.js                   # Mise à jour de l'interface
│   │   └── utils.js                # Fonctions utilitaires
│   └── stylesheets/
│       └── style.css               # Styles CSS
├── routes/
│   └── index.js                    # Routes Express
├── views/
│   ├── index.ejs                   # Page principale du jeu
│   └── error.ejs                   # Page d'erreur
├── tests/
│   ├── unit/                       # Tests unitaires (Vitest)
│   │   ├── game.test.js
│   │   ├── clicker.test.js
│   │   ├── upgrades.test.js
│   │   └── storage.test.js
│   └── e2e/                        # Tests E2E (Playwright)
│       ├── game-flow.spec.js
│       ├── upgrades.spec.js
│       └── persistence.spec.js
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # Pipeline CI/CD
│   │   └── deploy.yml              # Déploiement automatique
│   ├── PULL_REQUEST_TEMPLATE.md    # Modèle de PR
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md           # Modèle de bug
│       └── feature_request.md      # Modèle de feature
├── package.json                    # Dépendances et scripts
├── vitest.config.js                # Configuration Vitest
├── playwright.config.js            # Configuration Playwright
├── .eslintrc.js                    # Configuration ESLint
├── PROJECT.md                      # Ce fichier
├── README.md                       # Documentation utilisateur
├── TDD.md                          # Scénarios de test
├── RECETTAGE.md                    # Rapport de recettage
└── GUIDELINES.md                   # Conventions de code
```

### Architecture technique

#### Frontend
- **Vanilla JavaScript** (ES6+)
- **EJS** pour le templating
- **CSS3** pour les styles et animations
- **LocalStorage API** pour la persistance

#### Backend
- **Node.js** avec **Express.js**
- **Serveur HTTP** pour servir l'application
- **Routes statiques** pour les assets

#### Modèle de données

```javascript
// Structure de l'état du jeu
const gameState = {
  cookies: 0,                    // Nombre total de cookies
  cookiesPerSecond: 0,           // Production par seconde
  totalCookiesEarned: 0,         // Total historique
  cookiesPerClick: 1,            // Cookies par clic
  upgrades: {
    cursor: { count: 0, cost: 15, production: 0.1 },
    grandma: { count: 0, cost: 100, production: 1 },
    farm: { count: 0, cost: 1100, production: 8 },
    mine: { count: 0, cost: 12000, production: 47 },
    factory: { count: 0, cost: 130000, production: 260 },
    bank: { count: 0, cost: 1400000, production: 1400 },
    temple: { count: 0, cost: 20000000, production: 7800 }
  },
  achievements: [],              // Liste des succès débloqués
  startTime: Date.now(),         // Début de la session
  lastSaveTime: Date.now()       // Dernière sauvegarde
};
```

#### Flux de données

```
Utilisateur clique sur cookie
        ↓
Événement capturé (clicker.js)
        ↓
État du jeu mis à jour (game.js)
        ↓
Interface actualisée (ui.js)
        ↓
Sauvegarde automatique (storage.js)
```

---

## Outils utilisés

### Frameworks et bibliothèques

#### Backend
- **Express.js** (v4.16.1) - Framework web Node.js
- **EJS** (v2.6.1) - Moteur de templates
- **Morgan** - Logger HTTP
- **Cookie-parser** - Gestion des cookies HTTP

#### Frontend
- **Vanilla JavaScript** - Pas de framework pour rester léger
- **CSS3** - Animations et responsive design

### Outils de développement

#### Tests
- **Vitest** - Framework de tests unitaires
  - Rapide et moderne
  - Compatible avec la syntaxe ES modules
  - Couverture de code intégrée
  - Hot reload des tests
  
- **Playwright** - Tests E2E et d'interface
  - Tests cross-browser (Chrome, Firefox, Safari)
  - Screenshots et vidéos des tests
  - API moderne et intuitive
  - Mode headless et headed

#### Qualité de code
- **ESLint** - Linter JavaScript
  - Règles AirBnB ou Standard
  - Détection d'erreurs
  - Application du style de code
  - Intégration IDE

- **Prettier** (optionnel) - Formateur de code
  - Formatage automatique
  - Cohérence du style

#### Intégration Continue
- **GitHub Actions** - CI/CD
  - Workflow automatisé
  - Tests sur chaque push/PR
  - Déploiement automatique
  - Protection des branches

#### Versionnement
- **Git** - Contrôle de version
- **GitHub** - Hébergement du code
  - Issues pour le suivi des tâches
  - Pull Requests pour la revue de code
  - Projects pour la gestion (Kanban)

### DevOps et déploiement

- **VPS de l'école** - Serveur de production
- **PM2** (optionnel) - Gestionnaire de processus Node.js
- **Nginx** (optionnel) - Reverse proxy

---

## Installation et utilisation

### Prérequis
- Node.js ≥ 14.x
- npm ≥ 6.x
- Git

### Commandes npm

```bash
# Installation des dépendances
npm install

# Démarrage du serveur (mode développement)
npm run start

# Linting du code
npm run lint

# Correction automatique du linting
npm run lint:fix

# Tests unitaires
npm test

# Tests unitaires en mode watch
npm run test:watch

# Couverture des tests
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests E2E en mode UI (avec interface Playwright)
npm run test:e2e:ui

# Build (si applicable)
npm run build
```

---

## Méthodologie de développement

### Approche TDD (Test-Driven Development)

1. **Écrire le test** - Définir le comportement attendu
2. **Faire échouer le test** - Vérifier que le test échoue
3. **Écrire le code minimal** - Implémenter la fonctionnalité
4. **Faire passer le test** - Vérifier que le test réussit
5. **Refactoriser** - Améliorer le code sans casser les tests

### Workflow Git

#### Branches
- `main` - Branche de production (protégée)
- `dev` - Branche de développement (protégée)
- `feature/nom-de-la-feature` - Branches de fonctionnalités

#### Règles
- ❌ Pas de push direct sur `main`
- ❌ Pas de push direct sur `dev`
- ✅ Toujours travailler sur des branches `feature/*`
- ✅ Merge `feature/*` → `dev` via Pull Request
- ✅ Merge `dev` → `main` via Pull Request
- ✅ Pull Request validée par un autre membre
- ✅ CI valide obligatoire pour merger

### GitHub Issues

Chaque fonctionnalité ou bug doit avoir une issue avec :
- **Titre clair** et descriptif
- **Description détaillée** du problème/fonctionnalité
- **Critères d'acceptation** (checklist)
- **Labels appropriés** (bug, feature, enhancement, etc.)
- **Assignation** aux membres responsables

### Pull Requests

Chaque PR doit contenir :
- **Référence à l'issue** (ex: `Closes #42`)
- **Description des changements**
- **Captures d'écran** (si applicable)
- **Liste des tests effectués**
- **Checklist de validation**

---

## Pipeline CI/CD

### Étapes de la CI (GitHub Actions)

```
1. Checkout du code
2. Installation de Node.js
3. Installation des dépendances (npm install)
4. Vérification du linting (npm run lint)
5. Tests unitaires (npm test)
6. Vérification de la couverture (≥ 90%)
7. Build de l'application (npm run build)
8. Tests E2E (npm run test:e2e)
9. Déploiement (si branche main et tests OK)
```

### Conditions de blocage

Une PR **ne peut pas être mergée** si :
- ❌ Le linting échoue
- ❌ Les tests unitaires échouent
- ❌ La couverture est < 90%
- ❌ Les tests E2E échouent
- ❌ La CI n'est pas passée
- ❌ Pas de revue approuvée

---

## Objectifs de qualité

### Couverture de tests
- **Minimum requis** : 90%
- **Objectif** : 95%+

### Types de tests

#### Tests unitaires (Vitest)
- Fonctions métier (logique de jeu)
- Calculs (cookies, coûts, production)
- Gestion de l'état
- Fonctions utilitaires

#### Tests d'interface (Playwright)
- Interactions utilisateur
- Affichage des éléments
- Animations et transitions

#### Tests E2E (Playwright)
- Parcours utilisateur complet
- Achat d'améliorations
- Sauvegarde/restauration
- Cas limites (cookies négatifs, etc.)

### Cas de test
- ✅ **Cas normaux** - Utilisation standard
- ✅ **Cas d'erreur** - Gestion des erreurs
- ✅ **Cas limites** - Valeurs extrêmes (0, négatifs, très grands nombres)

---

## Organisation du travail

### Équipe
- Travail en binôme (2 personnes max, 3 si impair)
- Revue de code croisée
- Répartition des tâches via GitHub Issues

### Communication
- Commits explicites et atomiques
- Messages de commit en français ou anglais (convention définie dans GUIDELINES.md)
- Commentaires de code pour la logique complexe

---

## Documentation

### Fichiers de documentation

- **README.md** - Instructions pour les utilisateurs/développeurs
- **PROJECT.md** - Ce fichier (vue d'ensemble du projet)
- **TDD.md** - Scénarios de test en Given/When/Then
- **RECETTAGE.md** - Rapport de recettage et validation
- **GUIDELINES.md** - Conventions de code et bonnes pratiques

---

## Critères d'évaluation

Le projet sera évalué sur :

1. **Fonctionnalités** - Complétude et qualité
2. **Qualité du code** - Lisibilité, maintenabilité
3. **Tests** - Qualité, couverture, pertinence
4. **Workflow Git** - Respect des conventions
5. **Pull Requests** - Clarté, qualité des descriptions
6. **Issues** - Utilisation appropriée
7. **CI/CD** - Fonctionnement et configuration
8. **Recettage** - Complétude du rapport
9. **Organisation** - Structure du projet
10. **Documentation** - Clarté et exhaustivité

---

## Roadmap

### Phase 1 : Setup (Sprint 0)
- [x] Initialisation du projet Express
- [ ] Configuration des outils (ESLint, Vitest, Playwright)
- [ ] Mise en place de la CI
- [ ] Création des templates (PR, Issues)
- [ ] Rédaction des documents (PROJECT.md, TDD.md, GUIDELINES.md)

### Phase 2 : Fonctionnalités de base (Sprint 1)
- [ ] Système de clic sur cookie
- [ ] Compteur de cookies
- [ ] Interface de base
- [ ] Tests unitaires et E2E

### Phase 3 : Système d'améliorations (Sprint 2)
- [ ] Implémentation des upgrades
- [ ] Calcul de production automatique
- [ ] Interface d'achat
- [ ] Tests complets

### Phase 4 : Fonctionnalités avancées (Sprint 3)
- [ ] Système de sauvegarde
- [ ] Achievements
- [ ] Bonus et événements
- [ ] Tests et optimisations

### Phase 5 : Finalisation (Sprint 4)
- [ ] Recettage complet
- [ ] Corrections de bugs
- [ ] Optimisations performances
- [ ] Déploiement en production

---

## Licence

Ce projet est réalisé dans un cadre pédagogique.

---

**Dernière mise à jour** : 6 mai 2026  
**Version** : 1.0.0  
**Statut** : En développement
