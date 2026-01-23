# Déploiement Kubernetes (k8s/)

Ce document décrit les commandes à lancer pour déployer le projet Ticket System sur un cluster Kubernetes en utilisant les manifests présents dans le répertoire `k8s/`. Le namespace utilisé est `ticket-system`.

## Prérequis
- Accès à un cluster Kubernetes et `kubectl` configuré (context actif).
- Ingress Controller compatible (NGINX) et classe d’ingress `nginx` opérationnels.
- Images Docker accessibles par le cluster (registry public/privé ou docker daemon du node du cluster).
- Si vous déployez localement (minikube/kind), activez l’ingress et résolvez le nom d’hôte via `/etc/hosts` ou DNS local.

## Arborescence et ressources importées
- `k8s/00-namespace.yaml` : Namespace `ticket-system`.
- `k8s/01-configmap.yaml` : ConfigMap `ticket-system-config`.
- `k8s/02-secrets.yaml` : Secrets `ticket-system-secrets`.
- `k8s/03-postgres-pvc.yaml`, `k8s/04-redis-pvc.yaml` : PersistentVolumeClaims.
- `k8s/10-postgres.yaml`, `k8s/11-redis.yaml` : Déploiements et services des bases.
- `k8s/20-auth-service.yaml`, `k8s/21-ticket-service.yaml`, `k8s/22-notification-service.yaml`, `k8s/23-api-gateway.yaml`, `k8s/24-frontend.yaml` : Déploiements et Services des microservices.
- `k8s/30-ingress.yaml` : Ingress (NGINX) et règles d’accès.

> Remarque: les manifests utilisent des images nommées comme `auth-service:latest`, `ticket-service:latest`, etc. Assurez-vous que ces images soient accessibles depuis votre cluster (registry ou load dans le cluster local).

## Déploiement pas à pas
- Créez le namespace et déployez les ressources dans l’ordre suivant. Remplacez le chemin par le vôtre si nécessaire.

```bash
# 1) Namespace
kubectl apply -f k8s/00-namespace.yaml

# 2) Secrets et ConfigMap
kubectl apply -f k8s/02-secrets.yaml
kubectl apply -f k8s/01-configmap.yaml

# 3) Persistent Volume Claims (PVCs)
kubectl apply -f k8s/03-postgres-pvc.yaml
kubectl apply -f k8s/04-redis-pvc.yaml

# 4) Bases de données et cache
kubectl apply -f k8s/10-postgres.yaml
kubectl apply -f k8s/11-redis.yaml

# 5) Microservices
kubectl apply -f k8s/20-auth-service.yaml
kubectl apply -f k8s/21-ticket-service.yaml
kubectl apply -f k8s/22-notification-service.yaml
kubectl apply -f k8s/23-api-gateway.yaml
kubectl apply -f k8s/24-frontend.yaml

# 6) Ingress
kubectl apply -f k8s/30-ingress.yaml
```

## Vérifications et surveillance
- Vérifiez les namespaces et pods:

```bash
kubectl get namespaces
kubectl get pods -n ticket-system
kubectl get svc -n ticket-system
kubectl get ingress -n ticket-system
```

- Pour chaque déploiement, vous pouvez suivre le statut du déploiement:

```bash
kubectl rollout status deployment/auth-service -n ticket-system
kubectl rollout status deployment/ticket-service -n ticket-system
kubectl rollout status deployment/notification-service -n ticket-system
kubectl rollout status deployment/api-gateway -n ticket-system
kubectl rollout status deployment/frontend -n ticket-system
```

- Accès via ingress (config DNSlocal ou public): le fichier `k8s/30-ingress.yaml` expose des règles sur l’hôte `ticket-system.local` et éventuellement des règles externes.

  - Ajoutez l’entrée dans `/etc/hosts` (exemple local):

```bash
# Pour le développement local, mappez l’hôte vers l’IP du contrôleur Ingress.
# Obtenez l’IP du load balancer ou du node port selon votre config et adaptez l’entrée suivante.
127.0.0.1 ticket-system.local
```

  - Accédez à l’application
  - Frontend: http://ticket-system.local/ ou via le chemin Ingress défini sur le host.
  - API: http://ticket-system.local/api (redirige vers api-gateway sur le port 8080).

- Si vous utilisez Minikube, vous pouvez activer l’ingress et récupérer l’IP du cluster:

```bash
# Activer l’Ingress sur Minikube (si nécessaire)
minikube addons enable ingress

# Obtenir l’IP du cluster (et configurer le host en conséquence)
minikube ip
```

## Déploiement rapide avec le script fourni
- Le répertoire `k8s/` contient un script pratique pour déployer l’ensemble des manifests dans l’ordre défini:

```bash
bash k8s/deploy.sh
```
- Le script affiche les pods, et propose des commandes pour accéder à l’application et regarder les logs.

## Mise à jour ou nettoyage
- Mettre à jour des images: mettez à jour les tags des images dans les manifests puis réappliquez-les.
- Nettoyage:

```bash
# Supprimer l’ensemble des ressources appliquées
kubectl delete -f k8s/
```

## Conseils et bonnes pratiques
- Assurez-vous que les images soient construites et accessibles par le cluster (registry ou Docker daemon).
- Vérifiez que l’Ingress controller est opérationnel et que l’IngressClass correspond à `nginx`.
- Pour un environnement de développement rapide, vous pouvez porter les ports via port-forward sur les services si vous ne souhaitez pas utiliser un Ingress: par exemple

```bash
kubectl port-forward svc/frontend 8080:3000 -n ticket-system
```

- Documentez les secrets et keys sensibles; ne les committez pas et privilégiez des mécanismes de rotation.

## Bonnes questions à se poser
- Voulez-vous exposer le service via une URL publique ou restez-vous en mode développement local ?
- Taguez-vous les images par `latest` ou par des versions et les poussez-vous vers un registre privé ?
- Votre cluster a-t-il des ressources suffisantes pour supporter 2+ replicas sur chaque service ?
