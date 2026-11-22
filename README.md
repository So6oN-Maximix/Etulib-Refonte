# Etulib (refonte)

Plateforme de soutien scolaire : des parents et des élèves trouvent un professeur, réservent des cours et suivent leurs progrès. Projet industriel (EMSE).

Cette version est une refonte de [Etulib](https://github.com/So6oN-Maximix/Etulib) : le front HTML/JS et le serveur Express sont remplacés par une application **SvelteKit** unique, écrite en TypeScript.

> **État : refonte en cours de développement.** L'authentification par sessions, les profils (tuteur, parent, élève), la recherche de tuteurs par matière, ville et rayon géographique, la réservation d'un cours, la messagerie chiffrée avec pièces jointes, les pages de cours avec pièces jointes chiffrées, la page de documents et le calendrier des cours du tuteur fonctionnent.

## Technologies

- **Framework** : SvelteKit 3 (Svelte 5, mode runes), Vite 8, TypeScript
- **Déploiement** : `@sveltejs/adapter-node`, Docker (`Dockerfile` et `docker-compose.yml`)
- **Base de données** : PostgreSQL, via Prisma 7 (`prisma.config.ts` et adaptateur PostgreSQL)
- **Authentification** : mots de passe hachés avec `bcrypt` et sessions stockées en base avec cookie `httpOnly` / `sameSite: "lax"`
- **Chiffrement** : AES-256-GCM (module `node:crypto`) pour les messages et les fichiers joints (cours et messagerie)
- **Données géographiques** : API Géo de l'État (`geo.api.gouv.fr`) et calcul de distance par formule de Haversine (`src/lib/server/geo.ts`)
- **Variables d'environnement** : déclarées explicitement dans `src/env.ts`
- **Intégration continue** : tests unitaires exécutés à chaque push et pull request (GitHub Actions)

## Fonctionnalités

| Domaine                  | Description                                                                                                                                      |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Connexion et inscription | Création de compte (parent, élève, tuteur), vérification de majorité, connexion sécurisée par session en base, affichage/masquage du mot de passe |
| Profils                  | Pages de profil pour les tuteurs (expériences, cours, disponibilités, bio), les parents et les élèves                                            |
| Recherche                | Recherche de tuteurs par matière, par ville et par rayon autour de la ville (`0`, `5`, `10`, `20` ou `50 km`), pagination des résultats          |
| Fiche d'un tuteur        | Disponibilités chargées depuis la base, réservation d'un créneau, page de confirmation dynamique                                                 |
| Messagerie               | Conversations chiffrées entre tuteurs et élèves, consultation en lecture seule pour les parents, envoi et téléchargement de pièces jointes       |
| Espace élève             | Liste de ses cours, page de détails d'un cours, liste de ses tuteurs                                                                             |
| Espace tuteur            | Liste de ses cours et de ses élèves, calendrier des cours                                                                                        |
| Détails d'un cours       | Pièces jointes échangées entre le tuteur et l'élève, chiffrées avant stockage                                                                    |
| Documents                | Page de documents accessible aux tuteurs et aux élèves, avec un état vide quand il n'y a rien à afficher                                         |

## Structure

```
src/
  env.ts              déclaration des variables d'environnement
  hooks.server.ts     vérification de session et contrôle d'accès centralisé (liste blanche)
  lib/                code partagé (alias #lib), dont lib/server/ : crypto.ts, geo.ts, prisma.ts, uploads.ts
  routes/             pages et endpoints SvelteKit
prisma/
  schema.prisma       modèle de données (dont User, Session, Conversation, Message, Attachment, etc.)
  seed.ts             jeu de données de départ
prisma.config.ts      configuration Prisma 7 (connexion et migrations)
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

- `UPLOAD_DIR` : dossier de stockage des fichiers chiffrés (`uploads/lessons/` et `uploads/messages/`). Facultatif, `./uploads` par défaut.

> ⚠️ Ne pas perdre `MESSAGE_KEY_V1` : sans elle, les messages et les fichiers déjà chiffrés ne sont plus lisibles. Changer la clé les rend illisibles.

Puis crée les tables, génère le client Prisma et lance le serveur de développement :

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

Pour réinitialiser complètement la base en développement :

```bash
npx prisma migrate reset
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

Les tests unitaires (Vitest) sont exécutés automatiquement à chaque push et à chaque pull request via GitHub Actions.

## Docker

```bash
docker compose up -d
```

## Base de données

![Schéma de la base de données](prisma/ERD.svg)

Le schéma complet est dans `prisma/schema.prisma`.

## Sécurité et chiffrement

### Authentification et contrôle d'accès (`src/hooks.server.ts`)

- **Sessions en base** : un jeton aléatoire de 32 octets (`crypto.randomBytes(32)`) est stocké en base (`Session`) avec date d'expiration et transmis via un cookie `httpOnly` (`sameSite: "lax"`, `secure` en production).
- **Liste blanche de routes** : seules les routes publiques (`/`, `/login`, `/signup`, `/research`, `/tutor`) sont accessibles sans session ; toutes les autres routes redirigent automatiquement vers `/login`.
- **Contrôle d'appartenance (anti-IDOR)** : chaque action serveur et endpoint vérifie que l'utilisateur connecté est bien propriétaire ou participant de la ressource manipulée (cours, expérience, conversation, pièce jointe).

### Chiffrement des données (`src/lib/server/crypto.ts`)

Les messages et les fichiers joints sont chiffrés avant d'être stockés :

- **Messages** : AES-256-GCM, format `v1:iv:tag:données`. L'identifiant de la conversation est lié au chiffrement (AAD) : un message copié dans une autre conversation ne se déchiffre pas. Le préfixe `v1` permet de changer de clé plus tard.
- **Fichiers (cours et messagerie)** : AES-256-GCM avec une clé dérivée de `MESSAGE_KEY_V1` (HKDF-SHA256). L'identifiant et le contexte (`lessons:<id>` ou `messages:<id>`) sont liés au chiffrement via l'AAD. Les fichiers sont écrits sous le nom `<uuid>.enc` dans `uploads/lessons/` ou `uploads/messages/`, avec les droits `0600`.

### Envoi de fichiers (`src/lib/server/uploads.ts`)

- 10 Mo maximum par fichier, 10 fichiers maximum par envoi
- Formats acceptés : PDF, PNG, JPEG, DOC, DOCX
- Le type est vérifié sur le **contenu** du fichier (signature d'octets), en plus de l'extension
- Les noms de fichiers sont nettoyés avant stockage et les fichiers sont supprimés du disque en cas d'erreur d'enregistrement ou de suppression de la pièce jointe

## À faire

- Espaces parent : factures
- Règle de majorité : le parent n'a plus accès au compte d'un enfant devenu majeur
- Vérification des tuteurs (diplômes, identité) avant publication de leur fiche
- Vérification de majorité des dates de naissances pour les élèves 
- Mise en ligne : configuration HTTPS en production