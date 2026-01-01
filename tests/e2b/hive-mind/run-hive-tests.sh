#!/bin/bash

# E2B Hive Mind Test Runner
# Executes comprehensive collective intelligence tests in E2B sandbox

set -e

echo "🐝 Hive Mind E2B Test Suite"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test configuration
export HIVE_TEST_SESSION="hive-mind-e2b-$(date +%s)"
export HIVE_QUEENS=2
export HIVE_WORKERS=8
export HIVE_HYPERBOLIC_CURVATURE=-1.0
export HIVE_QUEEN_INFLUENCE=1.5
export HIVE_WORKER_INFLUENCE=1.0

echo -e "${BLUE}Test Configuration:${NC}"
echo "  Session ID: $HIVE_TEST_SESSION"
echo "  Queens: $HIVE_QUEENS (influence: ${HIVE_QUEEN_INFLUENCE}x)"
echo "  Workers: $HIVE_WORKERS (influence: ${HIVE_WORKER_INFLUENCE}x)"
echo "  Hyperbolic Curvature: $HIVE_HYPERBOLIC_CURVATURE"
echo ""

# Check if running in E2B sandbox
if [ -n "$E2B_SANDBOX_ID" ]; then
    echo -e "${GREEN}✓ Running in E2B sandbox: $E2B_SANDBOX_ID${NC}"
else
    echo -e "${YELLOW}⚠ Not detected in E2B sandbox (running locally)${NC}"
fi
echo ""

# Function to run test with metrics
run_test() {
    local test_name=$1
    local test_file=$2

    echo -e "${BLUE}Running: $test_name${NC}"
    echo "----------------------------------------"

    start_time=$(date +%s%3N)

    if npx jest "$test_file" --verbose --detectOpenHandles; then
        end_time=$(date +%s%3N)
        duration=$((end_time - start_time))
        echo -e "${GREEN}✓ $test_name PASSED${NC} (${duration}ms)"
    else
        end_time=$(date +%s%3N)
        duration=$((end_time - start_time))
        echo -e "${RED}✗ $test_name FAILED${NC} (${duration}ms)"
        return 1
    fi

    echo ""
}

# Track test results
total_tests=0
passed_tests=0
failed_tests=0

# Test 1: Queen-Worker Hierarchy
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}TEST 1: Queen-Worker Hierarchy${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

total_tests=$((total_tests + 1))
if run_test "Queen-Worker Hierarchy" "tests/e2b/hive-mind/queen-worker-hierarchy.test.ts"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test 2: Collective Intelligence
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}TEST 2: Collective Intelligence${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

total_tests=$((total_tests + 1))
if run_test "Collective Intelligence" "tests/e2b/hive-mind/collective-intelligence.test.ts"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Generate summary report
echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""
echo "Total Tests: $total_tests"
echo -e "Passed: ${GREEN}$passed_tests${NC}"
echo -e "Failed: ${RED}$failed_tests${NC}"
echo ""

# Calculate pass rate
pass_rate=$((passed_tests * 100 / total_tests))
echo "Pass Rate: ${pass_rate}%"
echo ""

# Expected metrics
echo -e "${BLUE}Expected Metrics:${NC}"
echo "  • Hierarchy modeling quality: High (hyperbolic attention)"
echo "  • Queen/worker influence ratio: ~1.5:1"
echo "  • Coordination time: <100ms average"
echo "  • Memory sync speed: <50ms average"
echo "  • Consensus confidence: >0.75"
echo "  • Knowledge graph depth: 3 levels"
echo ""

# Exit with appropriate code
if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 All Hive Mind tests PASSED!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some Hive Mind tests FAILED${NC}"
    exit 1
fi
