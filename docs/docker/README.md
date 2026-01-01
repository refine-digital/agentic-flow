# Docker Documentation

Docker Hub publication and deployment guides for agentic-flow packages.

## 📚 Documentation

1. **[DOCKER_HUB_README.md](./DOCKER_HUB_README.md)**
   - Docker Hub optimized description (5000+ words)
   - Badges, quick start, features
   - Comparison tables, tutorials

2. **[DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)**
   - Enterprise deployment strategies (8000+ words)
   - Single container, Docker Compose, Swarm, Kubernetes
   - Production best practices

3. **[DOCKER_PUBLICATION_SUMMARY.md](./DOCKER_PUBLICATION_SUMMARY.md)**
   - Publication summary and status
   - CI/CD workflow details

## 🐳 Docker Images

### Available Images

```bash
docker pull ruvnet/agentic-flow:latest        # Main application
docker pull ruvnet/agentdb:latest             # AgentDB vector database
docker pull ruvnet/mcp-server:latest          # MCP tools server
docker pull ruvnet/swarm-coordinator:latest   # Multi-agent swarm
```

## 🚀 Quick Start

### Single Container

```bash
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your_key \
  ruvnet/agentic-flow:latest
```

### Docker Compose

```bash
cd /workspaces/agentic-flow
docker-compose -f docker/docker-compose.yml up -d
```

## 📁 Files in This Directory

- `Dockerfile.agentic-flow` - Main application container
- `Dockerfile.agentdb` - AgentDB vector database
- `Dockerfile.mcp-server` - MCP tools server
- `Dockerfile.swarm` - Swarm coordinator
- `docker-compose.yml` - Multi-service orchestration
- `scripts/health-check.sh` - Health verification
- `scripts/diagnostic-tool.sh` - Interactive diagnostics

## 🔗 Related Documentation

- [Deployment](../deployment/) - General deployment docs
- [Architecture](../architecture/) - System architecture
- [Configuration](../configuration/) - Environment setup

---

**Last Updated:** 2025-12-07
**Status:** ✅ Ready for Docker Hub publication
