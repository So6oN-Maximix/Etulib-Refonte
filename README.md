# Etulib

> Plateforme de mise en relation entre **parents**, **élèves** et **tuteurs** pour le soutien scolaire.

Etulib-Refonte est la réécriture de la première version d'Etulib (Express + HTML/JS) avec **SvelteKit**, **TypeScript** et **Prisma**.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Commandes utiles](#commandes-utiles)
- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [Déploiement avec Docker](#déploiement-avec-docker)
- [Feuille de route](#feuille-de-route)
- [Auteur](#auteur)

## Fonctionnalités

- [x] Inscription avec choix du rôle (parent, élève ou tuteur)
- [x] Mots de passe hachés avec bcrypt, validation des données côté serveur
- [x] Connexion, sessions et déconnexion
- [x] Pages de profil pour chaque rôle
- [ ] Recherche de tuteurs
- [ ] Messagerie et notifications de messages non lus

## Stack technique

| Couche | Technologie |
| --- | --- |
| Front et back | [SvelteKit](https://svelte.dev/docs/kit) (form actions, routes serveur) |
| Langage | TypeScript |
| Base de données | PostgreSQL 16 |
| ORM | [Prisma](https://www.prisma.io/) |
| Authentification | `bcrypt` pour le hachage des mots de passe |
| Conteneurs | Docker et Docker Compose |

## Prérequis

- [Node.js](https://nodejs.org/) **22.17 ou plus récent** (exigé par SvelteKit)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) pour la base de données
- npm (fourni avec Node.js)

## Installation

Pour le développement, le plus simple est de lancer **seulement la base dans Docker** et le site directement sur ta machine.

```bash
# 1. Récupérer le projet
git clone https://github.com/So6oN-Maximix/Etulib-Refonte.git
cd Etulib-Refonte

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.example .env        # sous PowerShell : Copy-Item .env.example .env

# 4. Démarrer PostgreSQL
docker compose up -d db

# 5. Créer les tables
npx prisma migrate dev

# 6. Lancer le site
npm run dev
```

Le site est disponible sur **http://localhost:5173**.

## Variables d'environnement

Crée un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/etulib?schema=public"
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | URL de connexion PostgreSQL. Depuis ta machine, le port est **5433** (celui publié par Docker Compose). |

> Ne commite jamais ton `.env`. Seul `.env.example` (sans secrets) doit être versionné.

## Commandes utiles

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Construit la version de production |
| `npm run preview` | Prévisualise la version de production |
| `npm run check` | Vérifie les types avec `svelte-check` |
| `npx prisma migrate dev --name <nom>` | Crée et applique une migration après modification du schéma |
| `npx prisma studio` | Ouvre une interface web pour consulter les données |
| `npx prisma generate` | Régénère le client Prisma |
| `docker compose up -d db` | Démarre la base de données |
| `docker compose down` | Arrête les conteneurs (les données sont conservées) |

## Structure du projet

```
Etulib-Refonte/
├── prisma/
│   ├── schema.prisma        # Modèles de données
│   └── migrations/          # Historique des migrations
├── src/
│   ├── lib/
│   │   ├── actions/
│   │   │   └── ScollSpy.ts  # Pour le défliement des pages profils
│   │   ├── server/
│   │   │   └── prisma.ts    # Client Prisma (côté serveur uniquement)
│   │   └── ...              # Composants et utilitaires réutilisables
│   ├── routes/
│   │   ├── signup/          # Page d'inscription et son action serveur
│   │   └── ...              # Autres pages
│   ├── app.css              # Styles globaux
│   └── hooks.server.tss     # Middleware pour les routes
├── static/                  # Fichiers statiques
├── Dockerfile               # Image de l'application
├── docker-compose.yml       # PostgreSQL et application
└── prisma.config.ts         # Configuration de Prisma
```

## Base de données

![Schéma de la base de données](prisma/ERD.svg)

Le schéma est décrit dans `prisma/schema.prisma`. Le modèle principal est `User` :

| Champ | Type | Remarque |
| --- | --- | --- |
| `id` | `String` | Identifiant unique (`cuid`) |
| `email` | `String` | Unique |
| `passwordHash` | `String` | Hash bcrypt, jamais le mot de passe en clair |
| `firstName`, `lastName` | `String` | |
| `role` | `Role` | `PARENT`, `STUDENT` ou `TUTOR` |
| `birthDate` | `DateTime?` | Renseignée pour les élèves |
| `createdAt` | `DateTime` | |

Après chaque modification du schéma :

```bash
npx prisma migrate dev --name description_du_changement
```

## Déploiement avec Docker

Pour lancer **toute la stack** (base de données et application) dans des conteneurs :

```bash
docker compose up -d --build
```

- L'application est sur **http://localhost:5173**.
- Au démarrage, le conteneur exécute `prisma migrate deploy`, qui applique les migrations existantes. Le dossier `prisma/migrations` doit donc être présent (et commité).
- Entre conteneurs, l'application joint la base avec l'hôte `db:5432`. Depuis ta machine, la base est sur `localhost:5433`.

## Feuille de route

- [x] Gestion des sessions (cookie + `hooks.server.ts`)
- [x] Page de connexion et déconnexion
- [x] Profils parent, élève et tuteur
- [ ] Recherche et filtrage des tuteurs
- [ ] Messagerie
- [ ] Tests automatisés

## Auteur

**Maxime LEOST et Myriam MIRDAS** ([@So6oN-Maximix](https://github.com/So6oN-Maximix))

Projet réalisé dans le cadre de ma formation à l'EMSE.