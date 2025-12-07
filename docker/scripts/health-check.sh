#!/bin/bash

# =============================================================================
# Agentic Flow - Comprehensive Health Check Script
# =============================================================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_APP_PORT=${PORT:-3000}
MCP_PORT=${MCP_PORT:-8080}
SWARM_PORT=${SWARM_PORT:-9000}
AGENTDB_PORT=${AGENTDB_PORT:-5432}

TIMEOUT=10
RETRY_COUNT=3
RETRY_DELAY=5

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if a service is responding
check_http_endpoint() {
    local url=$1
    local name=$2
    local retry=0

    log_info "Checking $name at $url..."

    while [ $retry -lt $RETRY_COUNT ]; do
        if curl -f -s -m $TIMEOUT "$url" > /dev/null 2>&1; then
            log_success "$name is healthy"
            return 0
        fi

        retry=$((retry + 1))
        if [ $retry -lt $RETRY_COUNT ]; then
            log_warning "$name check failed, retrying ($retry/$RETRY_COUNT)..."
            sleep $RETRY_DELAY
        fi
    done

    log_error "$name is not responding after $RETRY_COUNT attempts"
    return 1
}

# Check Docker container status
check_container() {
    local container_name=$1

    log_info "Checking container: $container_name..."

    if docker ps --filter "name=$container_name" --filter "status=running" | grep -q "$container_name"; then
        log_success "Container $container_name is running"
        return 0
    else
        log_error "Container $container_name is not running"
        docker ps -a --filter "name=$container_name" --format "table {{.Names}}\t{{.Status}}\t{{.State}}"
        return 1
    fi
}

# Check Docker volume
check_volume() {
    local volume_name=$1

    log_info "Checking volume: $volume_name..."

    if docker volume inspect "$volume_name" > /dev/null 2>&1; then
        local size=$(docker volume inspect "$volume_name" | jq -r '.[0].Mountpoint' | xargs du -sh 2>/dev/null || echo "Unknown")
        log_success "Volume $volume_name exists (Size: $size)"
        return 0
    else
        log_error "Volume $volume_name does not exist"
        return 1
    fi
}

# Check AgentDB specific health
check_agentdb_health() {
    log_info "Checking AgentDB health..."

    if docker exec agentic-flow-agentdb test -f /app/data/agentdb/health.check 2>/dev/null; then
        log_success "AgentDB health check file exists"
        return 0
    else
        log_error "AgentDB health check file missing"
        return 1
    fi
}

# Check resource usage
check_resources() {
    log_info "Checking resource usage..."

    echo ""
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | grep "agentic-flow"
    echo ""
}

# Check network connectivity
check_network() {
    log_info "Checking Docker network..."

    if docker network inspect agentic-flow_agentic-network > /dev/null 2>&1; then
        log_success "Network agentic-flow_agentic-network exists"

        local container_count=$(docker network inspect agentic-flow_agentic-network | jq '.[0].Containers | length')
        log_info "Connected containers: $container_count"
        return 0
    else
        log_error "Network agentic-flow_agentic-network does not exist"
        return 1
    fi
}

# =============================================================================
# Main Health Checks
# =============================================================================

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║      Agentic Flow - Comprehensive Health Check           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""

    local all_checks_passed=true

    # Container checks
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  CONTAINER STATUS CHECKS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    check_container "agentic-flow-app" || all_checks_passed=false
    check_container "agentic-flow-mcp" || all_checks_passed=false
    check_container "agentic-flow-swarm" || all_checks_passed=false
    check_container "agentic-flow-agentdb" || all_checks_passed=false

    echo ""

    # HTTP endpoint checks
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  HTTP ENDPOINT CHECKS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    check_http_endpoint "http://localhost:$MAIN_APP_PORT/health" "Main Application" || all_checks_passed=false
    check_http_endpoint "http://localhost:$MCP_PORT/health" "MCP Server" || all_checks_passed=false
    check_http_endpoint "http://localhost:$SWARM_PORT/health" "Swarm Coordinator" || all_checks_passed=false

    echo ""

    # AgentDB specific checks
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  AGENTDB HEALTH CHECKS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    check_agentdb_health || all_checks_passed=false

    echo ""

    # Volume checks
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  VOLUME CHECKS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    check_volume "agentic-flow_agentdb-data" || all_checks_passed=false
    check_volume "agentic-flow_swarm-data" || all_checks_passed=false
    check_volume "agentic-flow_memory-data" || all_checks_passed=false
    check_volume "agentic-flow_app-data" || all_checks_passed=false

    echo ""

    # Network checks
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  NETWORK CHECKS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    check_network || all_checks_passed=false

    echo ""

    # Resource usage
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  RESOURCE USAGE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    check_resources

    echo ""

    # Final summary
    echo "╔═══════════════════════════════════════════════════════════╗"
    if [ "$all_checks_passed" = true ]; then
        echo "║  ${GREEN}✓ ALL HEALTH CHECKS PASSED${NC}                              ║"
        echo "╚═══════════════════════════════════════════════════════════╝"
        exit 0
    else
        echo "║  ${RED}✗ SOME HEALTH CHECKS FAILED${NC}                             ║"
        echo "╚═══════════════════════════════════════════════════════════╝"
        echo ""
        echo "Run 'docker-compose logs <service>' for detailed diagnostics"
        exit 1
    fi
}

# Run main function
main "$@"
