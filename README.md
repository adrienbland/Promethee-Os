# Prométhée OS

**Prométhée OS** est un tableau de bord et système d'exploitation basé sur l'Intelligence Artificielle (Agentic OS) spécialement conçu pour la gestion centralisée d'un homelab.

## Fonctionnalités Principales

- **Dashboard IA :** Une interface utilisateur moderne et futuriste propulsée par Next.js, Framer Motion et TailwindCSS, permettant d'interagir directement avec l'agent IA de gestion du serveur.
- **Monitoring Docker Actif :** Remonte automatiquement l'état (running/stopped) et la consommation RAM (MB) de tous les conteneurs Docker de la machine via une connexion WebSocket temps réel.
- **Agent IA (Antigravity SDK) :** Un backend FastAPI ultra-léger connecté au modèle Gemini 3.5/3.7 Flash qui peut lire, analyser et exécuter des opérations sur l'environnement de développement.
- **Connexion Sécurisée :** Compatible avec les réseaux privés comme Tailscale.

## Architecture

Le projet est divisé en deux services principaux dockérisés :

1. **Frontend (Next.js 14+) :** `localhost:3005`
   Interface fluide animée, streaming dynamique des tokens de l'IA (pensées et réponses), et récupération des statistiques du homelab.
2. **Backend (FastAPI + Websockets) :** `localhost:8005`
   Serveur asynchrone gérant le SDK Antigravity pour l'interaction avec le LLM Google Gemini, l'exécution des tâches d'agent et l'écoute des statistiques Docker système.

## Déploiement Local

Assurez-vous d'avoir [Docker](https://www.docker.com/) et `docker-compose` installés sur votre serveur.

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/VOTRE_PSEUDO/promethee-os.git
   cd promethee-os
   ```

2. **Configurer les variables d'environnement :**
   Copiez le fichier d'exemple et insérez votre propre clé API Gemini (Google AI Studio).
   ```bash
   cp .env.example .env
   ```
   Éditez `.env` :
   ```env
   GEMINI_API_KEY=AIzaSyVotreCleSecreteIci...
   ```

3. **Lancer les conteneurs :**
   ```bash
   docker-compose up -d --build
   ```

4. **Accéder à l'interface :**
   Ouvrez `http://localhost:3005` dans votre navigateur (ou utilisez l'IP de votre serveur via Tailscale/Local network).

## Technologies Utilisées

- **Frontend :** Next.js (App Router), React, TailwindCSS, Framer Motion, Lucide Icons, React Markdown.
- **Backend :** Python 3, FastAPI, Uvicorn, Docker SDK for Python, Google Antigravity SDK.

## Licence

MIT License
