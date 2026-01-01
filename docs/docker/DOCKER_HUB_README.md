# Agentic Flow - Production AI Agent Orchestration

[![Docker Pulls](https://img.shields.io/docker/pulls/ruvnet/agentic-flow)](https://hub.docker.com/r/ruvnet/agentic-flow)
[![Image Size](https://img.shields.io/docker/image-size/ruvnet/agentic-flow/latest)](https://hub.docker.com/r/ruvnet/agentic-flow)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ruvnet/agentic-flow/docker-publish.yml)](https://github.com/ruvnet/agentic-flow/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ruvnet/agentic-flow/blob/main/LICENSE)

> Production-ready AI agent orchestration platform with 66 specialized agents, 213 MCP tools, and 150x faster vector intelligence

## 🚀 Quick Start

```bash
# Pull the image
docker pull ruvnet/agentic-flow:latest

# Run with minimal configuration
docker run -d \
  --name agentic-flow \
  -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your-key-here \
  ruvnet/agentic-flow:latest

# Verify it's running
curl http://localhost:3000/health
```

## 📦 Available Images

| Image | Size | Purpose | Pull Command |
|-------|------|---------|--------------|
| **agentic-flow** | ~300MB | Main platform | `docker pull ruvnet/agentic-flow` |
| **agentic-flow-agentdb** | ~150MB | Vector database | `docker pull ruvnet/agentic-flow-agentdb` |
| **agentic-flow-mcp** | ~200MB | MCP server | `docker pull ruvnet/agentic-flow-mcp` |
| **agentic-flow-swarm** | ~180MB | Swarm coordinator | `docker pull ruvnet/agentic-flow-swarm` |

## ⚡ Features

### Core Capabilities

- **66 Specialized Agents**: Code generation, testing, review, architecture, and more
- **213 MCP Tools**: Complete Model Context Protocol integration
- **AgentDB**: 150x-12,500x faster vector database with RuVector
- **ReasoningBank**: Self-learning from experience with pattern recognition
- **Multi-Agent Swarms**: Hierarchical, mesh, and adaptive topologies
- **SPARC Methodology**: Systematic Test-Driven Development
- **GitHub Integration**: Automated PR review, issue tracking, releases

### Performance Metrics

| Metric | Value |
|--------|-------|
| SWE-Bench Solve Rate | 84.8% |
| Vector Search Speed | 150x-12,500x faster |
| Token Reduction | 32.3% |
| Parallel Speedup | 2.8-4.4x |

## 🔧 Configuration

### Environment Variables

#### Required (choose one)

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...     # Claude (recommended)
OPENROUTER_API_KEY=sk-or-v1-...        # 99% cost savings
GOOGLE_GEMINI_API_KEY=AIzaSy...        # Free tier
HUGGINGFACE_API_KEY=hf_...             # Open models
```

#### Optional Services

```bash
E2B_API_KEY=e2b_...                    # Sandboxed code execution
SUPABASE_ACCESS_TOKEN=sbp_...          # Cloud persistence
```

#### Research Configuration

```bash
RESEARCH_DEPTH=5                       # 1-10 (thoroughness)
RESEARCH_TIME_BUDGET=120               # Max minutes
ANTI_HALLUCINATION_LEVEL=high          # low|medium|high
VERIFICATION_THRESHOLD=0.90            # Quality threshold (0-1)
```

#### AgentDB Configuration

```bash
ENABLE_REASONINGBANK=true              # Self-learning
REASONINGBANK_BACKEND=sqlite           # sqlite|postgresql
REASONINGBANK_MIN_REWARD=0.7           # Min reward to store
REASONINGBANK_MAX_PATTERNS=10000       # Max stored patterns
```

## 🐳 Docker Compose

### Full Stack Deployment

```yaml
version: '3.8'

services:
  agentic-flow:
    image: ruvnet/agentic-flow:latest
    ports:
      - "3000:3000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - AGENTDB_URL=http://agentdb:5432
      - MCP_SERVER_URL=http://mcp-server:8080
    depends_on:
      - agentdb
      - mcp-server
    volumes:
      - app-data:/app/data

  agentdb:
    image: ruvnet/agentic-flow-agentdb:latest
    ports:
      - "5432:5432"
    environment:
      - ENABLE_REASONINGBANK=true
      - REASONINGBANK_BACKEND=sqlite
    volumes:
      - agentdb-data:/app/data

  mcp-server:
    image: ruvnet/agentic-flow-mcp:latest
    ports:
      - "8080:8080"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

  swarm-coordinator:
    image: ruvnet/agentic-flow-swarm:latest
    ports:
      - "9000:9000"
    environment:
      - FEDERATION_MODE=docker
      - FEDERATION_QUIC_ENABLED=true
    volumes:
      - swarm-data:/app/data/swarm

volumes:
  app-data:
  agentdb-data:
  swarm-data:
```

### Start Services

```bash
# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/ruvnet/agentic-flow/main/docker/docker-compose.yml

# Create .env file
cat > .env <<EOF
ANTHROPIC_API_KEY=your-key-here
RESEARCH_DEPTH=5
ENABLE_REASONINGBANK=true
EOF

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🎯 Usage Examples

### 1. Execute an Agent Task

```bash
docker exec -it agentic-flow npx agentic-flow agent run \
  --agent coder \
  --task "Create a REST API with authentication"
```

### 2. Initialize Multi-Agent Swarm

```bash
curl -X POST http://localhost:3000/api/swarm/init \
  -H "Content-Type: application/json" \
  -d '{
    "topology": "hierarchical",
    "maxAgents": 6
  }'
```

### 3. Research with Anti-Hallucination

```bash
curl -X POST http://localhost:3000/api/research/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Best practices for microservices architecture",
    "depth": 7,
    "antiHallucination": "high",
    "citationRequired": true
  }'
```

### 4. Store Learning Pattern in AgentDB

```bash
curl -X POST http://localhost:3000/api/agentdb/pattern/store \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-001",
    "task": "Implement JWT authentication",
    "reward": 0.95,
    "success": true
  }'
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│        Agentic Flow Platform            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │   MCP    │◄─┤  Swarm   │◄─┤AgentDB ││
│  │ 213 Tools│  │Coordinator│  │RuVector││
│  └──────────┘  └──────────┘  └────────┘│
│       ▲             ▲            ▲      │
│       └─────────────┴────────────┘      │
│                     │                   │
│          ┌──────────▼────────┐          │
│          │  66 Agent Network │          │
│          └───────────────────┘          │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │     API Layer (REST/WebSocket)     │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 📊 Comparison

### vs Traditional AI Development

| Feature | Agentic Flow | Traditional |
|---------|--------------|-------------|
| Agent Orchestration | ✅ 66 specialized | ❌ Manual |
| Vector Search | ✅ 150x faster | ⚠️ pgvector |
| Self-Learning | ✅ ReasoningBank | ❌ None |
| Multi-Agent Swarms | ✅ Built-in | ❌ Custom |
| GitHub Integration | ✅ Automated | ⚠️ Manual |
| SPARC Methodology | ✅ Integrated | ❌ None |

### Resource Requirements

| Deployment | CPU | RAM | Storage |
|------------|-----|-----|---------|
| **Minimal** | 2 cores | 4GB | 10GB |
| **Development** | 4 cores | 8GB | 20GB |
| **Production** | 8+ cores | 16GB+ | 50GB+ |

## 🔒 Security

### Best Practices

1. **API Keys**: Use Docker secrets or environment files
2. **Network**: Enable internal network isolation
3. **Resources**: Set CPU/memory limits
4. **Updates**: Pull latest images regularly

### Secure Deployment

```bash
# Use secrets
docker secret create anthropic_key ./api_key.txt

docker service create \
  --name agentic-flow \
  --secret anthropic_key \
  --publish 3000:3000 \
  ruvnet/agentic-flow:latest
```

## 🔧 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs agentic-flow

# Verify environment
docker exec agentic-flow env | grep API_KEY

# Test connectivity
curl http://localhost:3000/health
```

### Memory Issues

```bash
# Increase memory limit
docker run -m 4g ruvnet/agentic-flow:latest

# Check resource usage
docker stats agentic-flow
```

### AgentDB Connection Failed

```bash
# Check AgentDB health
docker exec agentdb test -f /app/data/agentdb/health.check

# Verify network
docker network inspect agentic-network
```

## 📚 Documentation

- **Full Documentation**: https://github.com/ruvnet/agentic-flow
- **API Reference**: https://github.com/ruvnet/agentic-flow/docs/API.md
- **Tutorials**: https://github.com/ruvnet/agentic-flow/docs/tutorials
- **GitHub Issues**: https://github.com/ruvnet/agentic-flow/issues

## 🎓 Tutorials

### 1. Build a Full-Stack App

[Complete tutorial](https://github.com/ruvnet/agentic-flow/docs/tutorials/fullstack-app.md) on using multiple agents to build a REST API with authentication, database, tests, and documentation.

### 2. Self-Learning Patterns

[Learn how](https://github.com/ruvnet/agentic-flow/docs/tutorials/reasoningbank.md) AgentDB learns from experience and improves over time.

### 3. Research Swarms

[Deploy](https://github.com/ruvnet/agentic-flow/docs/tutorials/research-swarm.md) multi-agent research teams with anti-hallucination verification.

### 4. GitHub Automation

[Automate](https://github.com/ruvnet/agentic-flow/docs/tutorials/github-integration.md) code reviews, PR management, and releases.

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/ruvnet/agentic-flow/blob/main/CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](https://github.com/ruvnet/agentic-flow/blob/main/LICENSE) for details.

## 🙏 Acknowledgments

Built by [@ruvnet](https://github.com/ruvnet) with:

- **Anthropic Claude Agent SDK** - Claude integration
- **RuVector** - 150x faster vector database
- **FastMCP** - Model Context Protocol
- **ONNX Runtime** - Neural inference
- **SONA** - Federated learning

## 📞 Support

- **Email**: contact@ruv.io
- **GitHub Issues**: https://github.com/ruvnet/agentic-flow/issues
- **Discord**: Coming soon

---

<div align="center">

**Made with ❤️ by the Agentic Flow team**

[GitHub](https://github.com/ruvnet/agentic-flow) • [Documentation](https://github.com/ruvnet/agentic-flow) • [Issues](https://github.com/ruvnet/agentic-flow/issues)

</div>
