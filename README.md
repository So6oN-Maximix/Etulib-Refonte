# Etulib (refonte)

Plateforme de soutien scolaire : des parents et des élèves trouvent un professeur, réservent des cours et suivent leurs progrès. Projet industriel (EMSE).

Cette version est une refonte de [Etulib](https://github.com/So6oN-Maximix/Etulib) : le front HTML/JS et le serveur Express sont remplacés par une application **SvelteKit** unique, écrite en TypeScript.

> **État : refonte en cours de développement.** L'authentification, les profils (tuteur, parent, élève), la recherche de tuteurs par matière et par ville, la réservation d'un cours, les pages de cours avec pièces jointes chiffrées, la page de documents et le calendrier des cours du tuteur fonctionnent.

## Technologies

- **Framework** : SvelteKit 3 (Svelte 5, mode runes), Vite 8, TypeScript
- **Déploiement** : `@sveltejs/adapter-node`, Docker (`Dockerfile` et `docker-compose.yml`)
- **Base de données** : PostgreSQL, via Prisma (6.x)
- **Authentification** : mots de passe hachés avec `bcrypt` <!-- À compléter : sessions / cookies -->
- **Chiffrement** : AES-256-GCM (module `node:crypto`) pour les messages et les fichiers de cours
- **Variables d'environnement** : déclarées explicitement dans `src/env.ts`
- **Intégration continue** : tests unitaires lancés à chaque push et pull request (GitHub Actions)

## Fonctionnalités

| Domaine                  | Description                                                                                                                      |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Connexion et inscription | Création de compte, connexion, bouton pour afficher ou masquer le mot de passe                                                   |
| Profils                  | Pages de profil pour les tuteurs, les parents et les élèves                                                                       |
| Recherche                | Recherche de tuteurs par matière et par ville, page de résultats                                                                  |
| Fiche d'un tuteur        | Disponibilités chargées depuis la base, réservation d'un créneau, page de confirmation dynamique                                  |
| Espace élève             | Liste de ses cours, page de détails d'un cours, liste de ses tuteurs                                                              |
| Espace tuteur            | Liste de ses cours et de ses élèves, calendrier des cours                                                                         |
| Détails d'un cours       | Pièces jointes échangées entre le tuteur et l'élève, chiffrées avant stockage                                                     |
| Documents                | Page de documents accessible aux tuteurs et aux élèves, avec un état vide quand il n'y a rien à afficher                          |

## Structure

```
src/
  env.ts              déclaration des variables d'environnement
  lib/                code partagé (alias #lib), dont lib/server/ : crypto.ts, uploads.ts
  routes/             pages et endpoints SvelteKit
prisma/
  schema.prisma       modèle de données
  seed.ts             jeu de données de départ
static/               fichiers statiques
Dockerfile            image de l'application
docker-compose.yml    application + base PostgreSQL
vite.config.ts        configuration de Vite et de SvelteKit
```

## Installation

Prérequis : Node.js et une base PostgreSQL (ou Docker).

```bash
npm install
```

Crée un fichier `.env` à la racine (jamais commité) :

```env
DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/etulib"
MESSAGE_KEY_V1=une_cle_hexadecimale_de_64_caracteres
UPLOAD_DIR=./uploads
```

- `MESSAGE_KEY_V1` : clé maîtresse de chiffrement (32 octets, soit 64 caractères hexadécimaux). Pour la générer :

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- `UPLOAD_DIR` : dossier de stockage des fichiers de cours chiffrés. Facultatif, `./uploads` par défaut.

> ⚠️ Ne pas perdre `MESSAGE_KEY_V1` : sans elle, les messages et les fichiers déjà chiffrés ne sont plus lisibles. Changer la clé les rend illisibles.

Puis crée les tables et lance le serveur de développement :

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

Pour remplir la base avec des données de départ :

```bash
npm run seed
```

## Scripts

| Commande          | Description                                           |
|-------------------|-------------------------------------------------------|
| `npm run dev`     | Serveur de développement                              |
| `npm run prepare` | Mise à jour des dépendances + vérification de la typo |
| `npm run build`   | Build de production                                   |
| `npm run preview` | Prévisualisation du build                             |
| `npm run check`   | Synchronise SvelteKit et vérifie les types            |
| `npm run seed`    | Remplit la base avec les données de `prisma/seed.ts`  |
| `npm run test`    | Effectue les tests des fichiers `xxx.test.ts`         |

En production (`adapter-node`), le `.env` n'est pas lu automatiquement : charge-le au lancement.

```bash
npm run build
node --env-file=.env build
```

## Tests

Les tests unitaires sont exécutés automatiquement à chaque push et à chaque pull request.

## Docker

```bash
docker compose up --build
```

## Base de données

![Schéma de la base de données](prisma/ERD.svg)

Le schéma complet est dans `prisma/schema.prisma`.

## Sécurité des données

Les messages et les fichiers de cours sont chiffrés avant d'être stockés (`src/lib/server/crypto.ts`).

- **Messages** : AES-256-GCM, format `v1:iv:tag:données`. L'identifiant de la conversation est lié au chiffrement (AAD) : un message copié dans une autre conversation ne se déchiffre pas. Le préfixe `v1` permet de changer de clé plus tard.
- **Fichiers de cours** : AES-256-GCM avec une clé dérivée de `MESSAGE_KEY_V1` (HKDF-SHA256). L'identifiant du cours est lié au chiffrement. Les fichiers sont écrits sous le nom `<uuid>.enc`, avec les droits `0600`.

### Envoi de fichiers (`src/lib/server/uploads.ts`)

- 10 Mo maximum par fichier, 10 fichiers maximum par envoi
- Formats acceptés : PDF, PNG, JPEG, DOC, DOCX
- Le type est vérifié sur le **contenu** du fichier (signature d'octets), en plus de l'extension
- Les noms de fichiers sont nettoyés avant stockage

## À faire

- Espaces parent et élève : factures, sauvegarde d'informations générales
- Règle de majorité : le parent n'a plus accès au compte d'un enfant devenu majeur
- Règle de minorité : un enfant ne peux pas créer de compte s'il est mineur
- Vérification des tuteurs (diplômes, identité) avant publication de leur fiche
- Mise en ligne : HTTPS, sessions stockées en base