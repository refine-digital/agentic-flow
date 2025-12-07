#!/bin/bash

# =============================================================================
# Agentic Flow - Deploy to Docker Hub
# =============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Agentic Flow - Deploy to Docker Hub                  ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# Configuration
# =============================================================================

DOCKER_USERNAME="ruvnet"
DOCKER_TOKEN="${DOCKER_PERSONAL_ACCESS_TOKEN}"
VERSION="2.0.1-alpha"
AGENTDB_VERSION="2.0.0-alpha"

# Images to build and push
declare -A IMAGES=(
    ["agentic-flow"]="docker/Dockerfile.agentic-flow"
    ["agentic-flow-agentdb"]="docker/Dockerfile.agentdb"
    ["agentic-flow-mcp"]="docker/Dockerfile.mcp-server"
    ["agentic-flow-swarm"]="docker/Dockerfile.swarm"
)

# =============================================================================
# Functions
# =============================================================================

check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker not found${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker installed${NC}"

    # Check Docker daemon
    if ! docker info &> /dev/null; then
        echo -e "${RED}✗ Docker daemon not running${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker daemon running${NC}"

    # Check credentials
    if [ -z "$DOCKER_TOKEN" ]; then
        echo -e "${RED}✗ DOCKER_PERSONAL_ACCESS_TOKEN not set${NC}"
        echo "  Please set it in your environment or .env file"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker credentials available${NC}"

    echo ""
}

docker_login() {
    echo -e "${YELLOW}Logging in to Docker Hub...${NC}"

    echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully logged in to Docker Hub${NC}"
    else
        echo -e "${RED}✗ Failed to login to Docker Hub${NC}"
        exit 1
    fi
    echo ""
}

build_image() {
    local image_name=$1
    local dockerfile=$2
    local version=$3

    echo -e "${BLUE}Building ${image_name}:${version}...${NC}"

    # Build with both version tag and latest
    docker build \
        -f "$dockerfile" \
        -t "${DOCKER_USERNAME}/${image_name}:${version}" \
        -t "${DOCKER_USERNAME}/${image_name}:latest" \
        --platform linux/amd64,linux/arm64 \
        --build-arg VERSION="$version" \
        --build-arg BUILD_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
        . || {
        echo -e "${RED}✗ Failed to build ${image_name}${NC}"
        return 1
    }

    echo -e "${GREEN}✓ Successfully built ${image_name}${NC}"
    return 0
}

push_image() {
    local image_name=$1
    local version=$2

    echo -e "${BLUE}Pushing ${image_name}...${NC}"

    # Push version tag
    docker push "${DOCKER_USERNAME}/${image_name}:${version}"
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to push ${image_name}:${version}${NC}"
        return 1
    fi

    # Push latest tag
    docker push "${DOCKER_USERNAME}/${image_name}:latest"
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to push ${image_name}:latest${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ Successfully pushed ${image_name}${NC}"
    return 0
}

verify_image() {
    local image_name=$1

    echo -e "${BLUE}Verifying ${image_name}...${NC}"

    # Pull the image we just pushed
    docker pull "${DOCKER_USERNAME}/${image_name}:latest" &> /dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${image_name} verified on Docker Hub${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to verify ${image_name}${NC}"
        return 1
    fi
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    # Change to project root
    cd "$(dirname "$0")/.."

    # Check prerequisites
    check_prerequisites

    # Login to Docker Hub
    docker_login

    # Build, push, and verify each image
    echo -e "${YELLOW}Building and pushing images...${NC}"
    echo ""

    local failed_images=()

    # Build and push main app
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  [1/4] agentic-flow"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if build_image "agentic-flow" "docker/Dockerfile.agentic-flow" "$VERSION"; then
        if push_image "agentic-flow" "$VERSION"; then
            verify_image "agentic-flow"
        else
            failed_images+=("agentic-flow")
        fi
    else
        failed_images+=("agentic-flow")
    fi
    echo ""

    # Build and push AgentDB
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  [2/4] agentic-flow-agentdb"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if build_image "agentic-flow-agentdb" "docker/Dockerfile.agentdb" "$AGENTDB_VERSION"; then
        if push_image "agentic-flow-agentdb" "$AGENTDB_VERSION"; then
            verify_image "agentic-flow-agentdb"
        else
            failed_images+=("agentic-flow-agentdb")
        fi
    else
        failed_images+=("agentic-flow-agentdb")
    fi
    echo ""

    # Build and push MCP server
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  [3/4] agentic-flow-mcp"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if build_image "agentic-flow-mcp" "docker/Dockerfile.mcp-server" "$VERSION"; then
        if push_image "agentic-flow-mcp" "$VERSION"; then
            verify_image "agentic-flow-mcp"
        else
            failed_images+=("agentic-flow-mcp")
        fi
    else
        failed_images+=("agentic-flow-mcp")
    fi
    echo ""

    # Build and push Swarm coordinator
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  [4/4] agentic-flow-swarm"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if build_image "agentic-flow-swarm" "docker/Dockerfile.swarm" "$VERSION"; then
        if push_image "agentic-flow-swarm" "$VERSION"; then
            verify_image "agentic-flow-swarm"
        else
            failed_images+=("agentic-flow-swarm")
        fi
    else
        failed_images+=("agentic-flow-swarm")
    fi
    echo ""

    # =============================================================================
    # Summary
    # =============================================================================

    echo "╔═══════════════════════════════════════════════════════════╗"
    if [ ${#failed_images[@]} -eq 0 ]; then
        echo -e "║  ${GREEN}✓ All images successfully published to Docker Hub!${NC}    ║"
        echo "╚═══════════════════════════════════════════════════════════╝"
        echo ""
        echo "Published images:"
        echo "  • https://hub.docker.com/r/${DOCKER_USERNAME}/agentic-flow"
        echo "  • https://hub.docker.com/r/${DOCKER_USERNAME}/agentic-flow-agentdb"
        echo "  • https://hub.docker.com/r/${DOCKER_USERNAME}/agentic-flow-mcp"
        echo "  • https://hub.docker.com/r/${DOCKER_USERNAME}/agentic-flow-swarm"
        echo ""
        echo "Users can now pull images with:"
        echo "  docker pull ${DOCKER_USERNAME}/agentic-flow:latest"
        echo ""
        echo "Next steps:"
        echo "  1. Update Docker Hub descriptions with docs/DOCKER_HUB_README.md"
        echo "  2. Create GitHub release with tag v${VERSION}"
        echo "  3. Update main README.md with Docker Hub links"
        echo "  4. Share announcement on social media"
        echo ""
        exit 0
    else
        echo -e "║  ${RED}✗ Some images failed to publish${NC}                     ║"
        echo "╚═══════════════════════════════════════════════════════════╝"
        echo ""
        echo "Failed images:"
        for img in "${failed_images[@]}"; do
            echo "  • $img"
        done
        echo ""
        echo "Check the logs above for error details."
        exit 1
    fi
}

# Run main function
main "$@"
