# 🍪 Ultimate Cookie Clicker

L'expérience ultime de Cookie Clicker avec un système de progression profond, des bonus aléatoires et une persistance complète.

## 🚀 Fonctionnalités Premium

- **Système de Bâtiments Complet** : 7 types de bâtiments (du Curseur au Temple) pour automatiser votre production.
- **Bonus Dorés & Multiplicateurs** : Des cookies dorés apparaissent aléatoirement pour booster votre production jusqu'à x10 pendant 15 secondes.
- **Gamification (Succès)** : Débloquez des trophées uniques avec des notifications visuelles satisfaisantes.
- **Système de Prestige (Ascension)** : Sacrifiez votre progression pour obtenir un bonus permanent de +10% par niveau.
- **Gains Hors-ligne** : Vos bâtiments continuent de produire même quand vous ne jouez pas ! (Efficacité de 50%).
- **Statistiques Détaillées** : Suivez vos clics totaux, votre temps de jeu et votre bonus de prestige en temps réel.
- **Persistance SQLite** : Votre progression est sauvegardée de manière sécurisée en base de données.

## 🛠️ Installation

1. Clonez le dépôt
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Configurez votre port dans le fichier `.env` (par défaut 3001) :
   ```
   PORT=3001
   ```
4. Lancez le serveur :
   ```bash
   npm run dev
   ```

## 🧪 Tests

### Tests Unitaires (Vitest)
Vérifient la logique mathématique du jeu (CPS, multiplicateurs, etc.) :
```bash
npm test
```

### Tests E2E (Playwright)
Vérifient le parcours utilisateur complet dans le navigateur :
```bash
npm run test:e2e
```

## 🏗️ Stack Technique

- **Frontend** : EJS, Vanilla JS, Glassmorphism CSS
- **Backend** : Node.js, Express, Better-SQLite3
- **Authentification** : Sessions Express, BcryptJS
- **Tests** : Vitest, Playwright
