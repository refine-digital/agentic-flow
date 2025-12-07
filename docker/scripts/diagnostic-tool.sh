#!/bin/bash

# =============================================================================
# Agentic Flow - Diagnostic and Troubleshooting Tool
# =============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# =============================================================================
# Menu Functions
# =============================================================================

show_banner() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║      Agentic Flow - Diagnostic & Troubleshooting          ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
}

show_menu() {
    echo -e "${CYAN}Select diagnostic option:${NC}"
    echo ""
    echo "  1. Full System Diagnostics"
    echo "  2. Check Container Logs"
    echo "  3. Test API Endpoints"
    echo "  4. Check Environment Variables"
    echo "  5. Restart Services"
    echo "  6. Clean and Rebuild"
    echo "  7. Backup Data Volumes"
    echo "  8. Restore Data Volumes"
    echo "  9. Performance Metrics"
    echo " 10. Network Diagnostics"
    echo " 11. Security Scan"
    echo " 12. Exit"
    echo ""
    read -p "Enter option (1-12): " choice
    echo ""
}

# =============================================================================
# Diagnostic Functions
# =============================================================================

full_diagnostics() {
    echo -e "${BLUE}Running full system diagnostics...${NC}"
    echo ""

    # Docker version
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Docker Version:"
    docker --version
    docker-compose --version
    echo ""

    # Container status
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Container Status:"
    docker-compose ps
    echo ""

    # Resource usage
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Resource Usage:"
    docker stats --no-stream
    echo ""

    # Volume status
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Volume Status:"
    docker volume ls | grep agentic-flow
    echo ""

    # Network status
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Network Status:"
    docker network ls | grep agentic
    echo ""

    # Health checks
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Health Checks:"
    ./scripts/health-check.sh
    echo ""
}

check_logs() {
    echo -e "${CYAN}Select service to check logs:${NC}"
    echo ""
    echo "  1. Main Application (agentic-flow)"
    echo "  2. MCP Server"
    echo "  3. Swarm Coordinator"
    echo "  4. AgentDB"
    echo "  5. All Services"
    echo ""
    read -p "Enter option (1-5): " log_choice
    echo ""

    case $log_choice in
        1) docker-compose logs -f --tail=100 agentic-flow ;;
        2) docker-compose logs -f --tail=100 mcp-server ;;
        3) docker-compose logs -f --tail=100 swarm-coordinator ;;
        4) docker-compose logs -f --tail=100 agentdb ;;
        5) docker-compose logs -f --tail=100 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
}

test_endpoints() {
    echo -e "${BLUE}Testing API endpoints...${NC}"
    echo ""

    # Main app
    echo -n "Main Application (http://localhost:3000/health): "
    if curl -f -s http://localhost:3000/health > /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
    fi

    # MCP Server
    echo -n "MCP Server (http://localhost:8080/health): "
    if curl -f -s http://localhost:8080/health > /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
    fi

    # Swarm Coordinator
    echo -n "Swarm Coordinator (http://localhost:9000/health): "
    if curl -f -s http://localhost:9000/health > /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
    fi

    echo ""
}

check_env_vars() {
    echo -e "${BLUE}Checking environment variables...${NC}"
    echo ""

    # Required variables
    local required_vars=(
        "ANTHROPIC_API_KEY"
        "OPENROUTER_API_KEY"
    )

    for var in "${required_vars[@]}"; do
        if docker-compose exec -T agentic-flow env | grep -q "^$var="; then
            echo -e "${GREEN}✓${NC} $var is set"
        else
            echo -e "${RED}✗${NC} $var is NOT set"
        fi
    done

    echo ""
    echo "Full environment (excluding secrets):"
    docker-compose exec -T agentic-flow env | grep -v "KEY=" | grep -v "TOKEN=" | grep -v "PASSWORD="
    echo ""
}

restart_services() {
    echo -e "${YELLOW}Restarting services...${NC}"
    echo ""

    docker-compose restart

    echo ""
    echo -e "${GREEN}Services restarted. Waiting for health checks...${NC}"
    sleep 30

    test_endpoints
}

clean_rebuild() {
    echo -e "${RED}WARNING: This will remove all containers and rebuild from scratch.${NC}"
    echo -e "${YELLOW}Data volumes will be preserved.${NC}"
    read -p "Continue? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        echo ""
        echo -e "${BLUE}Stopping and removing containers...${NC}"
        docker-compose down

        echo -e "${BLUE}Removing unused Docker resources...${NC}"
        docker system prune -f

        echo -e "${BLUE}Rebuilding images...${NC}"
        docker-compose build --no-cache

        echo -e "${BLUE}Starting services...${NC}"
        docker-compose up -d

        echo ""
        echo -e "${GREEN}Clean rebuild complete!${NC}"
    else
        echo "Cancelled."
    fi
}

backup_volumes() {
    local backup_dir="./backups/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"

    echo -e "${BLUE}Backing up volumes to: $backup_dir${NC}"
    echo ""

    # Backup each volume
    docker run --rm \
        -v agentic-flow_agentdb-data:/data \
        -v "$(pwd)/$backup_dir":/backup \
        alpine tar czf /backup/agentdb-data.tar.gz /data
    echo -e "${GREEN}✓${NC} AgentDB data backed up"

    docker run --rm \
        -v agentic-flow_swarm-data:/data \
        -v "$(pwd)/$backup_dir":/backup \
        alpine tar czf /backup/swarm-data.tar.gz /data
    echo -e "${GREEN}✓${NC} Swarm data backed up"

    docker run --rm \
        -v agentic-flow_memory-data:/data \
        -v "$(pwd)/$backup_dir":/backup \
        alpine tar czf /backup/memory-data.tar.gz /data
    echo -e "${GREEN}✓${NC} Memory data backed up"

    echo ""
    echo -e "${GREEN}Backup complete: $backup_dir${NC}"
}

restore_volumes() {
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh ./backups/
    echo ""

    read -p "Enter backup directory name (e.g., 20250101-120000): " backup_name
    local backup_dir="./backups/$backup_name"

    if [ ! -d "$backup_dir" ]; then
        echo -e "${RED}Backup directory not found${NC}"
        return
    fi

    echo -e "${RED}WARNING: This will overwrite existing data!${NC}"
    read -p "Continue? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        echo ""
        echo -e "${BLUE}Stopping services...${NC}"
        docker-compose down

        echo -e "${BLUE}Restoring volumes...${NC}"

        docker run --rm \
            -v agentic-flow_agentdb-data:/data \
            -v "$(pwd)/$backup_dir":/backup \
            alpine sh -c "rm -rf /data/* && tar xzf /backup/agentdb-data.tar.gz -C /"
        echo -e "${GREEN}✓${NC} AgentDB data restored"

        docker run --rm \
            -v agentic-flow_swarm-data:/data \
            -v "$(pwd)/$backup_dir":/backup \
            alpine sh -c "rm -rf /data/* && tar xzf /backup/swarm-data.tar.gz -C /"
        echo -e "${GREEN}✓${NC} Swarm data restored"

        docker run --rm \
            -v agentic-flow_memory-data:/data \
            -v "$(pwd)/$backup_dir":/backup \
            alpine sh -c "rm -rf /data/* && tar xzf /backup/memory-data.tar.gz -C /"
        echo -e "${GREEN}✓${NC} Memory data restored"

        echo ""
        echo -e "${BLUE}Starting services...${NC}"
        docker-compose up -d

        echo -e "${GREEN}Restore complete!${NC}"
    else
        echo "Cancelled."
    fi
}

performance_metrics() {
    echo -e "${BLUE}Performance Metrics:${NC}"
    echo ""

    # Real-time stats
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

    echo ""
    echo "Press Ctrl+C to stop live monitoring or wait for summary..."
    sleep 3

    # Continuous monitoring for 30 seconds
    docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | head -n 20
}

network_diagnostics() {
    echo -e "${BLUE}Network Diagnostics:${NC}"
    echo ""

    # Network info
    echo "Network Information:"
    docker network inspect agentic-flow_agentic-network | jq '.[0] | {Name, Driver, Containers}'

    echo ""
    echo "Port Bindings:"
    docker-compose ps --format "table {{.Name}}\t{{.Ports}}"

    echo ""
    echo "Inter-container connectivity test:"
    docker exec agentic-flow-app ping -c 3 agentdb || echo "Cannot reach agentdb"
    docker exec agentic-flow-app ping -c 3 mcp-server || echo "Cannot reach mcp-server"
    docker exec agentic-flow-app ping -c 3 swarm-coordinator || echo "Cannot reach swarm-coordinator"
}

security_scan() {
    echo -e "${BLUE}Running security scan...${NC}"
    echo ""

    if ! command -v trivy &> /dev/null; then
        echo -e "${YELLOW}Trivy not installed. Installing...${NC}"
        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
    fi

    echo "Scanning images for vulnerabilities..."
    echo ""

    trivy image --severity HIGH,CRITICAL ruvnet/agentic-flow:latest
    trivy image --severity HIGH,CRITICAL ruvnet/agentic-flow-agentdb:latest
    trivy image --severity HIGH,CRITICAL ruvnet/agentic-flow-mcp:latest
    trivy image --severity HIGH,CRITICAL ruvnet/agentic-flow-swarm:latest
}

# =============================================================================
# Main Loop
# =============================================================================

main() {
    # Change to docker directory
    cd "$(dirname "$0")/.." || exit 1

    while true; do
        show_banner
        show_menu

        case $choice in
            1) full_diagnostics ;;
            2) check_logs ;;
            3) test_endpoints ;;
            4) check_env_vars ;;
            5) restart_services ;;
            6) clean_rebuild ;;
            7) backup_volumes ;;
            8) restore_volumes ;;
            9) performance_metrics ;;
            10) network_diagnostics ;;
            11) security_scan ;;
            12)
                echo "Exiting..."
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please try again.${NC}"
                ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main
main "$@"
