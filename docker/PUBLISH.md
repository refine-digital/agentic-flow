# Docker Hub Publishing Guide

## Pre-Publication Checklist

- [ ] All Dockerfiles tested and working
- [ ] .env.example complete with all variables
- [ ] README.md comprehensive and up-to-date
- [ ] Health check scripts working
- [ ] GitHub Actions workflow configured
- [ ] Docker Hub account ready
- [ ] Images tagged properly

## Build Commands

```bash
# Build all images locally
cd /workspaces/agentic-flow

# Main application
docker build -f docker/Dockerfile.agentic-flow -t ruvnet/agentic-flow:2.0.1-alpha -t ruvnet/agentic-flow:latest .

# AgentDB
docker build -f docker/Dockerfile.agentdb -t ruvnet/agentic-flow-agentdb:2.0.0-alpha -t ruvnet/agentic-flow-agentdb:latest .

# MCP Server
docker build -f docker/Dockerfile.mcp-server -t ruvnet/agentic-flow-mcp:2.0.1-alpha -t ruvnet/agentic-flow-mcp:latest .

# Swarm Coordinator
docker build -f docker/Dockerfile.swarm -t ruvnet/agentic-flow-swarm:2.0.1-alpha -t ruvnet/agentic-flow-swarm:latest .
```

## Test Locally

```bash
# Test each image
docker run --rm -e ANTHROPIC_API_KEY=test ruvnet/agentic-flow:latest --help
docker run --rm ruvnet/agentic-flow-agentdb:latest --version
docker run --rm -e ANTHROPIC_API_KEY=test ruvnet/agentic-flow-mcp:latest
docker run --rm ruvnet/agentic-flow-swarm:latest

# Test with docker-compose
cd docker
docker-compose up -d
sleep 30
curl http://localhost:3000/health
docker-compose down -v
```

## Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push all images
docker push ruvnet/agentic-flow:2.0.1-alpha
docker push ruvnet/agentic-flow:latest

docker push ruvnet/agentic-flow-agentdb:2.0.0-alpha
docker push ruvnet/agentic-flow-agentdb:latest

docker push ruvnet/agentic-flow-mcp:2.0.1-alpha
docker push ruvnet/agentic-flow-mcp:latest

docker push ruvnet/agentic-flow-swarm:2.0.1-alpha
docker push ruvnet/agentic-flow-swarm:latest
```

## Update Docker Hub Descriptions

For each image on Docker Hub:

1. Go to https://hub.docker.com/r/ruvnet/agentic-flow-*
2. Click "Edit" on Overview
3. Copy content from `docs/DOCKER_HUB_README.md`
4. Save changes

## GitHub Actions Setup

### Required Secrets

Add these to GitHub repository secrets (Settings → Secrets → Actions):

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token
- `ANTHROPIC_API_KEY`: For integration tests
- `OPENROUTER_API_KEY`: Alternative API key for tests

### Trigger Workflow

```bash
# Push to main branch
git add .
git commit -m "feat(docker): Add Docker Hub images and comprehensive documentation"
git push origin main

# Or create a tag
git tag -a v2.0.1-alpha -m "Release v2.0.1-alpha with Docker images"
git push origin v2.0.1-alpha
```

## Post-Publication

### Verify Images

```bash
# Pull and test
docker pull ruvnet/agentic-flow:latest
docker run --rm ruvnet/agentic-flow:latest --version

docker pull ruvnet/agentic-flow-agentdb:latest
docker pull ruvnet/agentic-flow-mcp:latest
docker pull ruvnet/agentic-flow-swarm:latest
```

### Update Documentation

- [ ] Update main README.md with Docker Hub links
- [ ] Update CHANGELOG.md
- [ ] Create GitHub release
- [ ] Update project documentation
- [ ] Share on social media

## Maintenance

### Regular Updates

```bash
# Rebuild images monthly or after major changes
# Update security patches
# Re-scan for vulnerabilities
```

### Version Tagging Strategy

- `latest` - Latest stable release
- `2.0.1-alpha` - Specific version
- `2.0` - Minor version
- `2` - Major version
- `develop` - Development branch (optional)

