#!/bin/bash

# =============================================================================
# Agentic Flow - Build and Test All Docker Images
# =============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Agentic Flow - Build and Test Docker Images          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to project root
cd "$(dirname "$0")/.."

# =============================================================================
# Build Images
# =============================================================================

echo -e "${YELLOW}Building Docker images...${NC}"
echo ""

echo -e "${BLUE}[1/4]${NC} Building Main Application..."
docker build -f docker/Dockerfile.agentic-flow \
  -t ruvnet/agentic-flow:2.0.1-alpha \
  -t ruvnet/agentic-flow:latest .
echo -e "${GREEN}✓ Main application built${NC}"
echo ""

echo -e "${BLUE}[2/4]${NC} Building AgentDB..."
docker build -f docker/Dockerfile.agentdb \
  -t ruvnet/agentic-flow-agentdb:2.0.0-alpha \
  -t ruvnet/agentic-flow-agentdb:latest .
echo -e "${GREEN}✓ AgentDB built${NC}"
echo ""

echo -e "${BLUE}[3/4]${NC} Building MCP Server..."
docker build -f docker/Dockerfile.mcp-server \
  -t ruvnet/agentic-flow-mcp:2.0.1-alpha \
  -t ruvnet/agentic-flow-mcp:latest .
echo -e "${GREEN}✓ MCP Server built${NC}"
echo ""

echo -e "${BLUE}[4/4]${NC} Building Swarm Coordinator..."
docker build -f docker/Dockerfile.swarm \
  -t ruvnet/agentic-flow-swarm:2.0.1-alpha \
  -t ruvnet/agentic-flow-swarm:latest .
echo -e "${GREEN}✓ Swarm Coordinator built${NC}"
echo ""

# =============================================================================
# Test Images
# =============================================================================

echo -e "${YELLOW}Testing Docker images...${NC}"
echo ""

# Test main app
echo -n "Testing Main Application: "
if docker run --rm -e ANTHROPIC_API_KEY=test ruvnet/agentic-flow:latest node --version >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    exit 1
fi

# Test AgentDB
echo -n "Testing AgentDB: "
if docker run --rm ruvnet/agentic-flow-agentdb:latest node --version >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    exit 1
fi

# Test MCP Server
echo -n "Testing MCP Server: "
if docker run --rm -e ANTHROPIC_API_KEY=test ruvnet/agentic-flow-mcp:latest node --version >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    exit 1
fi

# Test Swarm Coordinator
echo -n "Testing Swarm Coordinator: "
if docker run --rm ruvnet/agentic-flow-swarm:latest node --version >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    exit 1
fi

echo ""

# =============================================================================
# Integration Test with Docker Compose
# =============================================================================

echo -e "${YELLOW}Running integration test with docker-compose...${NC}"
echo ""

cd docker

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating test .env file...${NC}"
    cat > .env <<TEST_ENV
ANTHROPIC_API_KEY=test-key
OPENROUTER_API_KEY=test-key
RESEARCH_DEPTH=3
ENABLE_REASONINGBANK=true
REASONINGBANK_BACKEND=sqlite
TEST_ENV
fi

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start (30 seconds)..."
sleep 30

# Check health
echo ""
echo "Checking service health..."
./scripts/health-check.sh || {
    echo -e "${RED}Health check failed. Showing logs:${NC}"
    docker-compose logs --tail=50
    docker-compose down -v
    exit 1
}

# Cleanup
echo ""
echo "Cleaning up test environment..."
docker-compose down -v

cd ..

# =============================================================================
# Summary
# =============================================================================

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ All images built and tested successfully!             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Built images:"
echo "  • ruvnet/agentic-flow:2.0.1-alpha"
echo "  • ruvnet/agentic-flow-agentdb:2.0.0-alpha"
echo "  • ruvnet/agentic-flow-mcp:2.0.1-alpha"
echo "  • ruvnet/agentic-flow-swarm:2.0.1-alpha"
echo ""

echo "Next steps:"
echo "  1. Login to Docker Hub:    docker login"
echo "  2. Push images:            docker push ruvnet/agentic-flow:latest"
echo "  3. See PUBLISH.md for complete publishing guide"
echo ""
