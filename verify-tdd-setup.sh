#!/bin/bash

echo "🔍 Verifying TDD London School Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 (missing)"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
        return 0
    else
        echo -e "${RED}❌${NC} $1/ (missing)"
        return 1
    fi
}

PASS=0
FAIL=0

echo "📁 Configuration Files:"
check_file "tests/jest.config.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/jest.setup.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/setup.ts" && ((PASS++)) || ((FAIL++))
check_file ".env.test" && ((PASS++)) || ((FAIL++))
echo ""

echo "🏭 Mock Factories:"
check_file "tests/mocks/MockAgentDB.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/MockRuVectorCore.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/MockAttentionService.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/MockGNNLayer.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/MockReasoningBank.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/MockReflexionMemory.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/MockSkillLibrary.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/MockCausalGraph.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/MockSemanticRouter.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/MockFactory.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/SwarmMockCoordinator.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/mocks/index.ts" && ((PASS++)) || ((FAIL++))
echo ""

echo "📝 Test Templates:"
check_file "tests/templates/unit-test.template.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/templates/integration-test.template.ts" && ((PASS++)) || ((FAIL++))
check_file "tests/templates/e2e-test.template.ts" && ((PASS++)) || ((FAIL++))
echo ""

echo "🧪 Example Tests:"
check_file "tests/unit/example-service.test.ts" && ((PASS++)) || ((FAIL++))
echo ""

echo "🔄 CI/CD:"
check_file ".github/workflows/test.yml" && ((PASS++)) || ((FAIL++))
echo ""

echo "📚 Documentation:"
check_file "docs/TDD-LONDON-SCHOOL.md" && ((PASS++)) || ((FAIL++))
check_file "docs/TDD-IMPLEMENTATION-SUMMARY.md" && ((PASS++)) || ((FAIL++))
check_file "tests/QUICKSTART.md" && ((PASS++)) || ((FAIL++))
check_file "TDD-SETUP-COMPLETE.md" && ((PASS++)) || ((FAIL++))
echo ""

echo "📂 Test Directories:"
check_dir "tests/unit" && ((PASS++)) || ((FAIL++))
check_dir "tests/integration" && ((PASS++)) || ((FAIL++))
check_dir "tests/e2e" && ((PASS++)) || ((FAIL++))
check_dir "tests/performance" && ((PASS++)) || ((FAIL++))
check_dir "tests/backwards" && ((PASS++)) || ((FAIL++))
check_dir "tests/mocks" && ((PASS++)) || ((FAIL++))
check_dir "tests/templates" && ((PASS++)) || ((FAIL++))
check_dir "tests/fixtures" && ((PASS++)) || ((FAIL++))
check_dir "tests/helpers" && ((PASS++)) || ((FAIL++))
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed:${NC} $PASS"
echo -e "${RED}❌ Failed:${NC} $FAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 TDD Setup Verification: PASSED${NC}"
    echo ""
    echo "✅ All files and directories are in place!"
    echo ""
    echo "📖 Quick Start:"
    echo "   1. Read: tests/QUICKSTART.md"
    echo "   2. Run:  npm test -- tests/unit/example-service.test.ts"
    echo "   3. Docs: docs/TDD-LONDON-SCHOOL.md"
    echo ""
    exit 0
else
    echo -e "${RED}❌ TDD Setup Verification: FAILED${NC}"
    echo ""
    echo "Some files are missing. Please check the output above."
    echo ""
    exit 1
fi
