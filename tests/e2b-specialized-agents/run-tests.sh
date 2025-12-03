#!/bin/bash

# E2B Specialized Agents Test Runner
# Executes comprehensive testing suite with performance monitoring

set -e

echo "🚀 E2B Specialized Agents Testing Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test directory
TEST_DIR="/workspaces/agentic-flow/tests/e2b-specialized-agents"
cd "$TEST_DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Create results directories
mkdir -p results patterns
mkdir -p backend-dev/{scenarios,results,patterns}
mkdir -p api-docs/{scenarios,results,patterns}
mkdir -p ml-developer/{scenarios,results,patterns}
mkdir -p template-generator/{scenarios,results,patterns}

# Function to run a test phase
run_test_phase() {
    local phase=$1
    local description=$2

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$phase${NC}: $description"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Main test execution
main() {
    local start_time=$(date +%s)

    # Phase 1: Pre-flight checks
    run_test_phase "Phase 1" "Pre-flight Checks"

    echo "✓ Test directory: $TEST_DIR"
    echo "✓ Results directory: $TEST_DIR/results"
    echo "✓ Patterns directory: $TEST_DIR/patterns"
    echo ""

    # Phase 2: Execute test suite
    run_test_phase "Phase 2" "Running Test Suite"

    if npm test; then
        echo -e "${GREEN}✅ Test suite completed successfully${NC}"
    else
        echo -e "${RED}❌ Test suite failed${NC}"
        exit 1
    fi
    echo ""

    # Phase 3: Generate analysis
    run_test_phase "Phase 3" "Deep Analysis"

    if npm run analyze; then
        echo -e "${GREEN}✅ Analysis completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Analysis completed with warnings${NC}"
    fi
    echo ""

    # Phase 4: Results summary
    run_test_phase "Phase 4" "Results Summary"

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo "📊 Test Results:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if [ -f "results/specialized-agents-report.json" ]; then
        # Extract key metrics from report
        local total_tests=$(cat results/specialized-agents-report.json | grep -o '"totalTests":[^,]*' | cut -d: -f2 | tr -d ' ')
        local total_patterns=$(cat results/specialized-agents-report.json | grep -o '"totalPatterns":[^,]*' | cut -d: -f2 | tr -d ' ')

        echo "  Total Tests: $total_tests"
        echo "  Total Patterns: $total_patterns"
        echo "  Duration: ${duration}s"
        echo ""
        echo "  📄 Reports Generated:"
        echo "    - results/specialized-agents-report.json"
        echo "    - results/specialized-agents-report.md"
        echo "    - results/deep-analysis-report.json"
        echo "    - results/deep-analysis-report.md"
    fi

    echo ""
    echo -e "${GREEN}✨ All tests completed in ${duration}s${NC}"
    echo ""

    # Display report locations
    echo "📍 View Results:"
    echo "  Main Report: $TEST_DIR/results/specialized-agents-report.md"
    echo "  Deep Analysis: $TEST_DIR/results/deep-analysis-report.md"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    --backend)
        echo "🔧 Testing backend-dev agent only..."
        npm run test:backend
        ;;
    --api-docs)
        echo "📚 Testing api-docs agent only..."
        npm run test:api-docs
        ;;
    --ml)
        echo "🤖 Testing ml-developer agent only..."
        npm run test:ml
        ;;
    --template)
        echo "🎨 Testing base-template-generator agent only..."
        npm run test:template
        ;;
    --analyze)
        echo "🔍 Running analysis only..."
        npm run analyze
        ;;
    --help)
        echo "Usage: ./run-tests.sh [option]"
        echo ""
        echo "Options:"
        echo "  --backend     Test backend-dev agent only"
        echo "  --api-docs    Test api-docs agent only"
        echo "  --ml          Test ml-developer agent only"
        echo "  --template    Test base-template-generator agent only"
        echo "  --analyze     Run analysis only"
        echo "  --help        Show this help message"
        echo ""
        echo "No option runs full test suite"
        ;;
    *)
        main
        ;;
esac
