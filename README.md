# Ticket System - Architecture Microservices

Une application de gestion de tickets avec une architecture microservices, utilisant **Vite.js (React)** pour le frontend, et des services backend en **Go**, **Python**, et **Node.js**. Les données sont stockées dans **PostgreSQL** et **Redis** est utilisé pour le cache et la messagerie.

---

## 📌 Architecture

### Services
1. **Frontend** (Vite + React)
   - Port: `3000`
   - Technos: React, TailwindCSS, Axios, Socket.IO (client)

2. **API Gateway** (Node.js)
   - Port: `8080`
   - Rôle: Routage des requêtes vers les services backend.

3. **Auth Service** (Go)
   - Port: `8081`
   - Rôle: Gestion des utilisateurs et authentification (JWT).

4. **Ticket Service** (Python - FastAPI)
   - Port: `8082`
   - Rôle: CRUD des tickets + événements Redis.

5. **Notification Service** (Node.js)
   - Port: `8083`
   - Rôle: Notifications en temps réel (Socket.IO + Redis Pub/Sub).

6. **Redis**
   - Port: `6379`
   - Rôle: Cache + Message Queue (Pub/Sub/Streams).

---

## 🚀 Prérequis
- Docker (ou Podman)
- Kubernetes (pour la production)
- Node.js (v18+)
- Python (v3.10+)
- Go (v1.20+)

---

## 🐳 Commandes Docker/Podman

### 1. Lancer les services avec Docker Compose
```bash
# Construire et démarrer les conteneurs
docker-compose up --build

# Arrêter les conteneurs
docker-compose down

# Vérifier les logs
docker-compose logs -f
```

### 2. Commandes Podman (alternative à Docker)
```bash
# Construire et démarrer avec Podman
podman-compose up --build

# Arrêter
podman-compose down
```

---

## ⚙️ Déploiement Kubernetes

### 1. Appliquer les manifests Kubernetes
```bash
# Créer les ressources
kubectl apply -f k8s/

# Vérifier les pods
kubectl get pods

# Vérifier les services
kubectl get services

# Accéder aux logs d'un pod
kubectl logs -f <pod-name>
```

### 2. Structure des fichiers Kubernetes (`k8s/`)
```
k8s/
├── frontend-deployment.yaml
├── auth-service-deployment.yaml
├── ticket-service-deployment.yaml
├── notification-service-deployment.yaml
├── redis-deployment.yaml
└── api-gateway-deployment.yaml
```

---

## 🛠️ Développement Local

### 1. Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```

### 2. Auth Service (Go)
```bash
cd auth-service
go mod tidy
go run main.go
```

### 3. Ticket Service (Python)
```bash
cd ticket-service
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Notification Service (Node.js)
```bash
cd notification-service
npm install
node index.js
```

### 5. Run Tests
```bash
# Ticket Service
cd ticket-service
TEST=true pytest

# Auth Service
cd auth-service
go test

# Notification Service
cd notification-service
npm test

# API Gateway
cd api-gateway
npm test
```

---

## 📂 Structure du Projet
```
ticket-system/
├── frontend/              # Vite + React
├── auth-service/          # Go (Gin)
├── ticket-service/        # Python (FastAPI)
├── notification-service/  # Node.js (Express)
├── api-gateway/           # Node.js (Express)
├── k8s/                   # Fichiers Kubernetes
├── docker-compose.yml     # Configuration Docker
└── README.md              # Ce fichier
```

---

## 🔧 Configuration

### Variables d'Environnement
- **Redis** : `REDIS_HOST=redis` (nom du service dans Docker/K8s)
- **JWT Secret** : À définir dans `auth-service/.env`

---

## 📝 Notes
- **PostgreSQL** : Base de données centrale partagée entre les services.
- **Redis** : Partagé entre tous les services pour le cache et les événements.
- **CORS** : Configuré dans l'API Gateway pour autoriser le frontend.
