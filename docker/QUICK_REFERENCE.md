# 🚀 Agentic Flow - Docker Quick Reference

## 📦 Pull Images

```bash
docker pull ruvnet/agentic-flow:latest
docker pull ruvnet/agentic-flow-agentdb:latest
docker pull ruvnet/agentic-flow-mcp:latest
docker pull ruvnet/agentic-flow-swarm:latest
```

## ⚡ Quick Start (30 seconds)

```bash
# 1. Pull and run
docker run -d --name agentic-flow -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-ant-api03-your-key \
  ruvnet/agentic-flow:latest

# 2. Verify
curl http://localhost:3000/health

# 3. Execute agent
docker exec -it agentic-flow npx agentic-flow agent run \
  --agent coder --task "Create a REST API"
```

## 🔧 Docker Compose (Recommended)

```bash
# Setup
git clone https://github.com/ruvnet/agentic-flow.git
cd agentic-flow/docker
cp .env.example .env
nano .env  # Add ANTHROPIC_API_KEY

# Start
docker-compose up -d

# Status
docker-compose ps

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📊 Health Checks

```bash
# All services
./scripts/health-check.sh

# Individual services
curl http://localhost:3000/health  # Main app
curl http://localhost:8080/health  # MCP server
curl http://localhost:9000/health  # Swarm coordinator

# AgentDB
docker exec agentdb test -f /app/data/agentdb/health.check
```

## 🔍 Diagnostics

```bash
# Interactive diagnostic tool
./scripts/diagnostic-tool.sh

# Quick diagnostics
docker-compose ps                    # Container status
docker-compose logs --tail=50        # Recent logs
docker stats                         # Resource usage
docker network inspect agentic-network  # Network info
```

## 🎯 Common Commands

```bash
# Restart services
docker-compose restart

# View logs
docker-compose logs -f agentic-flow

# Execute command in container
docker exec -it agentic-flow bash

# Stop and remove everything
docker-compose down -v

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 💾 Backup & Restore

```bash
# Backup all volumes
./scripts/backup-volumes.sh

# Or manual backup
docker run --rm \
  -v agentic-flow_agentdb-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/agentdb-backup.tar.gz /data

# Restore
docker run --rm \
  -v agentic-flow_agentdb-data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/agentdb-backup.tar.gz -C /"
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | `docker logs <container>` then check .env |
| API key error | `docker exec agentic-flow env \| grep API_KEY` |
| Out of memory | `docker run -m 4g ...` or update compose |
| Connection refused | Check firewall, verify port bindings |
| AgentDB error | `docker-compose restart agentdb` |

## 📈 Performance Tuning

```yaml
# docker-compose.yml
services:
  agentic-flow:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
    environment:
      - NODE_OPTIONS=--max-old-space-size=6144
```

## 🔐 Security

```bash
# Use Docker secrets
echo "sk-ant-api03-..." | docker secret create anthropic_key -

# Reference in compose
services:
  agentic-flow:
    secrets:
      - anthropic_key
    environment:
      - ANTHROPIC_API_KEY_FILE=/run/secrets/anthropic_key
```

## 🎨 Environment Variables

```bash
# Required (choose one)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_GEMINI_API_KEY=AIzaSy...
HUGGINGFACE_API_KEY=hf_...

# Configuration
RESEARCH_DEPTH=5
ENABLE_REASONINGBANK=true
REASONINGBANK_BACKEND=sqlite
FEDERATION_MODE=docker
```

## 📚 Documentation

- **Quick Start**: `docker/README.md`
- **Full Deployment Guide**: `docs/DOCKER_DEPLOYMENT_GUIDE.md`
- **Publishing Guide**: `docker/PUBLISH.md`
- **Troubleshooting**: `docker/README.md#troubleshooting`

## 🆘 Support

- GitHub: https://github.com/ruvnet/agentic-flow/issues
- Email: contact@ruv.io
- Docs: https://github.com/ruvnet/agentic-flow

---

**Last Updated:** 2025-12-07 | **Version:** 2.0.1-alpha
