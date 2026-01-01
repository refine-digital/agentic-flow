# Docker Deployment Guide - Agentic Flow

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation Methods](#installation-methods)
4. [Configuration](#configuration)
5. [Deployment Strategies](#deployment-strategies)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Performance Optimization](#performance-optimization)
8. [Security Hardening](#security-hardening)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers comprehensive Docker deployment strategies for Agentic Flow, from development to production-scale enterprise deployments.

### Available Images

| Image | Purpose | Typical Use |
|-------|---------|-------------|
| `ruvnet/agentic-flow` | Main platform | All-in-one deployment |
| `ruvnet/agentic-flow-agentdb` | Vector database | Distributed deployments |
| `ruvnet/agentic-flow-mcp` | MCP server | Microservices architecture |
| `ruvnet/agentic-flow-swarm` | Swarm coordinator | Multi-agent orchestration |

---

## Prerequisites

### System Requirements

**Minimum (Development)**
- Docker 20.10+
- Docker Compose 2.x+
- 2 CPU cores
- 4GB RAM
- 10GB disk space

**Recommended (Production)**
- Docker 24.x+
- Docker Compose 2.20+
- 8+ CPU cores
- 16GB+ RAM
- 50GB+ SSD storage

**Enterprise**
- Kubernetes 1.24+
- 16+ CPU cores
- 32GB+ RAM
- 100GB+ NVMe storage
- Load balancer
- Monitoring stack

### Required API Keys

At minimum, you need ONE of these:

- **Anthropic Claude** (recommended): `sk-ant-api03-...`
- **OpenRouter** (99% cost savings): `sk-or-v1-...`
- **Google Gemini** (free tier): `AIzaSy...`
- **HuggingFace** (open models): `hf_...`

---

## Installation Methods

### Method 1: Single Container (Quick Start)

**Best for:** Testing, demos, simple deployments

```bash
docker pull ruvnet/agentic-flow:latest

docker run -d \
  --name agentic-flow \
  -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-ant-api03-your-key \
  -v agentic-data:/app/data \
  --restart unless-stopped \
  ruvnet/agentic-flow:latest
```

### Method 2: Docker Compose (Recommended)

**Best for:** Development, small teams, most use cases

```bash
# Clone repository
git clone https://github.com/ruvnet/agentic-flow.git
cd agentic-flow/docker

# Configure environment
cp .env.example .env
nano .env  # Add your API keys

# Start services
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:3000/health
```

### Method 3: Docker Swarm (Multi-Host)

**Best for:** Medium-sized deployments, high availability

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.swarm.yml agentic-flow

# Check status
docker service ls
docker stack ps agentic-flow
```

### Method 4: Kubernetes (Enterprise)

**Best for:** Enterprise, auto-scaling, complex deployments

```bash
# Create namespace
kubectl create namespace agentic-flow

# Create secrets
kubectl create secret generic api-keys \
  --from-literal=anthropic-key=sk-ant-... \
  -n agentic-flow

# Deploy
kubectl apply -f k8s/deployment.yml -n agentic-flow

# Verify
kubectl get pods -n agentic-flow
kubectl get services -n agentic-flow
```

---

## Configuration

### Environment Variables Reference

#### Core Configuration

```bash
# Application
PORT=3000
NODE_ENV=production

# API Keys (required - choose one or more)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_GEMINI_API_KEY=AIzaSy...
HUGGINGFACE_API_KEY=hf_...

# Optional Services
E2B_API_KEY=e2b_...                    # Sandboxed code execution
E2B_ACCESS_TOKEN=sk_e2b_...
SUPABASE_ACCESS_TOKEN=sbp_...          # Cloud persistence
```

#### Research Configuration

```bash
RESEARCH_DEPTH=5                       # 1-10 (how deep to research)
RESEARCH_TIME_BUDGET=120               # Minutes (max execution time)
RESEARCH_FOCUS=balanced                # narrow|balanced|broad
ANTI_HALLUCINATION_LEVEL=high          # low|medium|high
CITATION_REQUIRED=true                 # Require source citations
ED2551_MODE=true                       # Enhanced research mode
MAX_RESEARCH_ITERATIONS=10             # Max recursive depth
VERIFICATION_THRESHOLD=0.90            # Quality threshold (0-1)
```

#### AgentDB & ReasoningBank

```bash
ENABLE_REASONINGBANK=true              # Enable self-learning
REASONINGBANK_BACKEND=sqlite           # sqlite|postgresql
REASONINGBANK_MIN_REWARD=0.7           # Min reward to store (0-1)
REASONINGBANK_MAX_PATTERNS=10000       # Max stored patterns
AGENTDB_PATH=/app/data/agentdb         # Database path
```

#### Federation & Coordination

```bash
ENABLE_FEDERATION=false                # Multi-node coordination
FEDERATION_MODE=docker                 # docker|kubernetes|local
FEDERATION_MIN_NODES=2                 # Minimum cluster size
FEDERATION_MAX_NODES=10                # Maximum cluster size
FEDERATION_QUIC_ENABLED=true           # Fast transport protocol
```

#### Performance & Monitoring

```bash
ENABLE_VERBOSE_LOGGING=true            # Debug output
ENABLE_PERFORMANCE_METRICS=true        # Track metrics
LOG_TOOL_CALLS=true                    # Log MCP tool usage
```

### Volume Configuration

#### Development

```yaml
volumes:
  agentdb-data:
    driver: local
  swarm-data:
    driver: local
  memory-data:
    driver: local
  app-data:
    driver: local
```

#### Production (NFS)

```yaml
volumes:
  agentdb-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=10.0.0.10,rw
      device: ":/mnt/data/agentdb"
```

#### Enterprise (AWS EFS)

```yaml
volumes:
  agentdb-data:
    driver: local
    driver_opts:
      type: nfs4
      o: addr=fs-12345678.efs.us-east-1.amazonaws.com,rw
      device: ":/agentdb"
```

---

## Deployment Strategies

### Strategy 1: Development Environment

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  agentic-flow:
    image: ruvnet/agentic-flow:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - ENABLE_VERBOSE_LOGGING=true
    volumes:
      - ./local-code:/app/code  # Mount local code
      - app-data:/app/data
    command: npm run dev  # Hot reload
```

### Strategy 2: Production (Single Host)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  agentic-flow:
    image: ruvnet/agentic-flow:2.0.1-alpha
    restart: always
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          memory: 4G
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY_FILE=/run/secrets/anthropic_key
    secrets:
      - anthropic_key
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

secrets:
  anthropic_key:
    external: true
```

### Strategy 3: High Availability (Docker Swarm)

```yaml
# docker-compose.swarm.yml
version: '3.8'

services:
  agentic-flow:
    image: ruvnet/agentic-flow:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == worker
    ports:
      - target: 3000
        published: 3000
        mode: host
    networks:
      - agentic-overlay

networks:
  agentic-overlay:
    driver: overlay
    attachable: true
```

### Strategy 4: Kubernetes (Auto-Scaling)

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agentic-flow
  namespace: agentic-flow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agentic-flow
  template:
    metadata:
      labels:
        app: agentic-flow
    spec:
      containers:
      - name: agentic-flow
        image: ruvnet/agentic-flow:latest
        ports:
        - containerPort: 3000
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: anthropic-key
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agentic-flow-hpa
  namespace: agentic-flow
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agentic-flow
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Automated health check script
./docker/scripts/health-check.sh

# Manual checks
curl http://localhost:3000/health
curl http://localhost:8080/health
curl http://localhost:9000/health

# Docker health status
docker inspect --format='{{.State.Health.Status}}' agentic-flow
```

### Log Management

```bash
# View logs
docker-compose logs -f --tail=100 agentic-flow

# Export logs
docker-compose logs --no-color > agentic-flow-logs-$(date +%Y%m%d).log

# Log rotation configuration
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "10",
    "compress": "true"
  }
}
EOF
```

### Metrics & Monitoring

**Prometheus Integration**

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'agentic-flow'
    static_configs:
      - targets: ['agentic-flow:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

**Grafana Dashboard**

```bash
# Import pre-built dashboard
curl -X POST http://grafana:3000/api/dashboards/import \
  -H "Content-Type: application/json" \
  -d @grafana-dashboard.json
```

### Backup & Restore

```bash
# Automated backup script
./docker/scripts/backup-volumes.sh

# Manual backup
docker run --rm \
  -v agentic-flow_agentdb-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/agentdb-$(date +%Y%m%d).tar.gz /data

# Restore
docker run --rm \
  -v agentic-flow_agentdb-data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/agentdb-20250101.tar.gz -C /"
```

---

## Performance Optimization

### Resource Allocation

```yaml
services:
  agentic-flow:
    deploy:
      resources:
        limits:
          cpus: '8'
          memory: 16G
        reservations:
          cpus: '4'
          memory: 8G
    environment:
      - NODE_OPTIONS="--max-old-space-size=12288"
```

### Caching Strategies

```bash
# Enable Redis caching
ENABLE_CACHE=true
CACHE_TTL=3600
CACHE_MAX_SIZE=10000
REDIS_URL=redis://cache:6379
```

### Database Optimization

```bash
# AgentDB tuning
REASONINGBANK_MAX_PATTERNS=50000
AGENTDB_BATCH_SIZE=1000
AGENTDB_CACHE_SIZE=5000
```

---

## Security Hardening

### Use Docker Secrets

```bash
# Create secrets
echo "sk-ant-api03-..." | docker secret create anthropic_key -

# Use in compose
services:
  agentic-flow:
    secrets:
      - anthropic_key
    environment:
      - ANTHROPIC_API_KEY_FILE=/run/secrets/anthropic_key
```

### Network Isolation

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

services:
  agentic-flow:
    networks:
      - frontend
      - backend
  agentdb:
    networks:
      - backend  # Not exposed externally
```

### Security Scanning

```bash
# Scan images for vulnerabilities
docker scan ruvnet/agentic-flow:latest

# Or use Trivy
trivy image --severity HIGH,CRITICAL ruvnet/agentic-flow:latest
```

---

## Troubleshooting

For comprehensive troubleshooting, see the [main Docker README](../docker/README.md#troubleshooting) or run the diagnostic tool:

```bash
./docker/scripts/diagnostic-tool.sh
```

---

## Support & Resources

- **Documentation**: https://github.com/ruvnet/agentic-flow
- **Issues**: https://github.com/ruvnet/agentic-flow/issues
- **Email**: contact@ruv.io

---

Made with ❤️ by [@ruvnet](https://github.com/ruvnet)
