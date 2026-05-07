# Guidelines de Développement

Ce document définit les conventions et les processus à respecter pour contribuer au projet Cookie Clicker.

## 🛠️ Workflow Git

Nous utilisons un workflow basé sur les branches de fonctionnalités (Feature Branches).

### Branches
- `main` : Branche de production, stable et protégée.
- `dev` : Branche d'intégration pour les nouvelles fonctionnalités.
- `feature/nom-de-la-feature` : Branche pour travailler sur une tâche spécifique.

### Processus de contribution
1. Créez une branche à partir de `dev` : `git checkout -b feature/ma-fonctionnalite`.
2. Travaillez sur votre tâche en suivant l'approche TDD.
3. Commitez régulièrement avec des messages clairs (voir section Commits).
4. Poussez votre branche : `git push origin feature/ma-fonctionnalite`.
5. Ouvrez une **Pull Request (PR)** vers la branche `dev`.
6. Attendez la validation de la CI et d'un pair avant de merger.

## 📝 Conventions de Nommage

### Commits
Nous suivons une version simplifiée des [Conventional Commits](https://www.conventionalcommits.org/) :
- `feat:` : Nouvelle fonctionnalité.
- `fix:` : Correction de bug.
- `docs:` : Changements dans la documentation.
- `test:` : Ajout ou modification de tests.
- `refactor:` : Modification du code qui ne corrige ni ne rajoute de fonction.

### Code
- **Variables et Fonctions** : `camelCase` (ex: `calculateCookies()`).
- **Classes** : `PascalCase` (ex: `GameManager`).
- **Fichiers** : `kebab-case` (ex: `game-logic.js`).

## 🧪 Méthodologie TDD

Le projet impose une couverture de tests minimale de **90%**. Chaque nouvelle fonctionnalité doit être développée selon le cycle TDD :

1. **RED** : Écrire un test qui échoue pour une fonctionnalité non encore implémentée.
2. **GREEN** : Écrire le code minimal pour faire passer le test.
3. **REFACTOR** : Nettoyer le code tout en s'assurant que les tests passent toujours.

## 📐 Standards de Code

- **ESLint** : Le code doit respecter les règles définies dans `.eslintrc.js`. Exécutez `npm run lint` avant de commiter.
- **JavaScript** : Utilisez les fonctionnalités modernes d'ES6+ (const/let, arrow functions, destructuring, etc.).
- **Commentaires** : Commentez les parties complexes de la logique métier, mais visez un code auto-documenté.

## 📋 Pull Requests et Issues

- **Issues** : Chaque tâche doit être liée à une issue GitHub décrivant le besoin et les critères d'acceptation.
- **PRs** : Utilisez le template fourni. Une PR doit être liée à une issue (ex: `Closes #12`) et ne doit pas être mergée si la CI échoue.

---
En suivant ces règles, nous garantissons la qualité et la maintenabilité du projet sur le long terme.
