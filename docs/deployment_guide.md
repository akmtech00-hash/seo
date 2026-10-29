# Aegis Growth OS — Enterprise Deployment & Infrastructure Guide

This guide details deployment procedures for production environments using Kubernetes, Docker Compose, and Cloudflare Workers.

---

## 1. Quickstart via Docker Compose

Spin up the entire platform (PostgreSQL 15 with TimescaleDB & pgvector, Redis 7.2, Node.js API Gateway, and background workers):

```bash
docker compose up -d
```

Verify services:
```bash
docker compose ps
curl http://localhost:4000/api/v1/health
```

---

## 2. Kubernetes Cluster Deployment

### Secrets ConfigMap (`aegis-secrets.yaml`)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: aegis-vault-secrets
type: Opaque
stringData:
  AEGIS_MASTER_VAULT_KEY: "your_64_char_hex_master_encryption_key"
  DATABASE_URL: "postgresql://aegis_db_admin:secure_password@timescaledb-cluster:5432/aegis_growth_platform"
  REDIS_URL: "redis://redis-cluster:6379"
  GOOGLE_ADS_DEVELOPER_TOKEN: "your_google_ads_dev_token"
  STRIPE_SECRET_KEY: "sk_live_stripe_secret"
```

### Production Deployment Manifest (`aegis-deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aegis-core-gateway
  labels:
    app: aegis-core
spec:
  replicas: 4
  selector:
    matchLabels:
      app: aegis-core
  template:
    metadata:
      labels:
        app: aegis-core
    spec:
      containers:
        - name: gateway
          image: aegis-growth-os:latest
          ports:
            - containerPort: 4000
          envFrom:
            - secretRef:
                name: aegis-vault-secrets
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "2000m"
              memory: "4Gi"
          readinessProbe:
            httpGet:
              path: /api/v1/health
              port: 4000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /api/v1/health
              port: 4000
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: aegis-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: aegis-core-gateway
  minReplicas: 4
  maxReplicas: 24
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

## 3. Cloudflare Worker Edge Interceptor Deployment

To deploy sub-5ms HTML stream personalizations via Cloudflare Workers:

```bash
cd edge
npx wrangler login
npx wrangler deploy --name aegis-edge-worker
```

---

## 4. TimescaleDB Columnar Compression Policy Verification

Confirm that continuous 14-day chunk compactions are active on your database instance:

```sql
SELECT hypertable_name, compression_enabled 
FROM timescaledb_information.hypertables 
WHERE hypertable_name IN ('generative_visibility_metrics', 'co_citation_matrix_ts');
```
Both tables should show `compression_enabled: true`.
