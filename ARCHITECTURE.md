# Projet Jarvis - Dashboard Agentic OS

## Architecture et Planification

Ce document décrit l'architecture et le plan de développement du projet Jarvis, validé avec l'utilisateur.

### 1. Stack Technique
*   **Frontend :** Next.js (React), TailwindCSS, Framer Motion.
    *   **Port prévu :** `3005` (les ports 3000 et 8000 étant déjà occupés par AdGuard et Portainer).
*   **Backend :** Python (FastAPI).
    *   **Port prévu :** `8005`.
*   **Base de données / Mémoire :** Fichiers Markdown locaux dans le dossier Obsidian (`/home/snow/homelab/homelab/obsidian/`).
*   **Moteur IA :**
    *   **Principal :** API Gemini (Modèle `gemini-1.5-pro`) connecté à l'abonnement du compte.
    *   **Mémoire Contextuelle :** Les anciens prompts et notes d'Obsidian seront indexés pour que Gemini se souvienne des échanges passés, à la manière d'Antigravity.

### 2. Organisation du Répertoire (`/home/snow/dev/jarvis_dashboard/`)
*   `frontend/` : Application Next.js.
*   `backend/` : Application FastAPI (incluant la logique IA et Semantic Router).
*   `.env` : Fichier de variables d'environnement (clés API Pterodactyl, Groq, URLs, etc.). Ne sera **jamais** commité.
*   `docker-compose.yml` : Pour lancer les deux services facilement en développement, avec les bons montages de volumes.

### 3. Fonctionnalités - Phase 1 (Développement Étape par Étape)
1.  **Interface Graphique (Hub Central) :**
    *   Design Dark Mode, accents néon bleu/violet.
    *   Composant central (Orbe/Graphe) dynamique.
    *   Widgets latéraux pour les métriques.
    *   Menu "Burger" pour la navigation.
    *   Intégration Web Speech API (Vocal/Texte) pour communiquer avec l'IA.
2.  **Gestion de l'Infrastructure :**
    *   Intégration Pterodactyl API (Statut, Start, Stop des serveurs).
    *   Intégration Docker Socket (Lecture pour Portainer/Prod, Écriture pour Dev) pour lister/interagir avec les conteneurs.
    *   Pages dédiées pour ces gestions, accessibles via le menu.
3.  **Cerveau Obsidian (Mémoire) :**
    *   Accès au dossier Obsidian de l'utilisateur.
    *   Génération de "Daily Notes".
    *   Lecture/Modification de l'agenda et de la liste des tâches (compatible avec le plugin Tasks).

### 4. Sécurité et Self-Healing
*   **Human-in-the-Loop :** Connexion WebSocket entre FastAPI et Next.js. Toute action critique (ex: `stop server`, `restart container`) mettra l'agent en pause et affichera un pop-up d'autorisation sur l'interface (PWA / navigateur).
*   **Auto-Maintenance :** L'IA disposera d'outils (via Semantic Router) pour mettre à jour son propre code ou redémarrer ses services (uniquement après validation WebSocket).

### 5. Prochaines Étapes
*   [ ] Validation de cette architecture et des ports (3005 / 8005).
*   [ ] Création du `.env.example`.
*   [ ] Initialisation du projet Next.js dans `frontend/`.
*   [ ] Initialisation du projet FastAPI dans `backend/`.
*   [ ] Test de communication de base (Ping/Pong) entre Frontend et Backend, et test WebSocket.
