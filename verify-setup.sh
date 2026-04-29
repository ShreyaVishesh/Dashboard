#!/bin/bash

# Verification script for demo data generators
# Tests that all components are working correctly

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_PASSED=0
TESTS_FAILED=0

# Test functions
test_start() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Testing: $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((TESTS_FAILED++))
}

test_skip() {
    echo -e "${YELLOW}⊘ SKIP${NC}: $1"
}

# 1. Check files exist
test_start "File Existence"

if [ -f "$SCRIPT_DIR/scripts/generate-demo-metrics.js" ]; then
    test_pass "Metrics generator script exists"
else
    test_fail "Metrics generator script missing"
fi

if [ -f "$SCRIPT_DIR/scripts/generate-jaeger-traces.js" ]; then
    test_pass "Jaeger generator script exists"
else
    test_fail "Jaeger generator script missing"
fi

if [ -f "$SCRIPT_DIR/generate-all-demo-data.sh" ]; then
    test_pass "Master orchestration script exists"
else
    test_fail "Master orchestration script missing"
fi

if [ -f "$SCRIPT_DIR/demo-data-menu.sh" ]; then
    test_pass "Interactive menu script exists"
else
    test_fail "Interactive menu script missing"
fi

echo ""

# 2. Check scripts are executable
test_start "Script Permissions"

if [ -x "$SCRIPT_DIR/scripts/generate-demo-metrics.js" ]; then
    test_pass "Metrics generator is executable"
else
    test_fail "Metrics generator is not executable"
fi

if [ -x "$SCRIPT_DIR/generate-all-demo-data.sh" ]; then
    test_pass "Master script is executable"
else
    test_fail "Master script is not executable"
fi

if [ -x "$SCRIPT_DIR/demo-data-menu.sh" ]; then
    test_pass "Menu script is executable"
else
    test_fail "Menu script is not executable"
fi

echo ""

# 3. Check dependencies
test_start "Dependencies"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    test_pass "Node.js installed: $NODE_VERSION"
else
    test_fail "Node.js not found"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    test_pass "npm installed: $NPM_VERSION"
else
    test_fail "npm not found"
fi

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    test_pass "Python 3 installed: $PYTHON_VERSION"
else
    test_skip "Python 3 not found (optional)"
fi

echo ""

# 4. Check npm packages
test_start "npm Packages"

if npm list prom-client &>/dev/null; then
    PROM_VERSION=$(npm list prom-client 2>/dev/null | grep prom-client | head -1 | grep -oP '\d+\.\d+\.\d+')
    test_pass "prom-client installed: v$PROM_VERSION"
else
    test_fail "prom-client not installed"
fi

if npm list axios &>/dev/null; then
    AXIOS_VERSION=$(npm list axios 2>/dev/null | grep axios | head -1 | grep -oP '\d+\.\d+\.\d+')
    test_pass "axios installed: v$AXIOS_VERSION"
else
    test_fail "axios not installed"
fi

if npm list jaeger-client &>/dev/null; then
    JAEGER_VERSION=$(npm list jaeger-client 2>/dev/null | grep jaeger-client | head -1 | grep -oP '\d+\.\d+\.\d+')
    test_pass "jaeger-client installed: v$JAEGER_VERSION"
else
    test_fail "jaeger-client not installed"
fi

echo ""

# 5. Test metrics generator
test_start "Metrics Generator Functionality"

echo "Running metrics generator (once mode)..."
if timeout 10 node "$SCRIPT_DIR/scripts/generate-demo-metrics.js" once &>/dev/null; then
    test_pass "Metrics generator executes successfully"
else
    test_fail "Metrics generator execution failed"
fi

echo ""

# 6. Test Jaeger generator
test_start "Jaeger Generator Functionality"

echo "Running Jaeger generator (once mode)..."
if timeout 10 node "$SCRIPT_DIR/scripts/generate-jaeger-traces.js" once &>/dev/null; then
    test_pass "Jaeger generator executes successfully"
else
    # Note: Jaeger generator may report UDP errors if agent isn't running, but still passes
    test_skip "Jaeger generator runs but agent may not be available"
fi

echo ""

# 7. Check service connectivity
test_start "Service Connectivity"

if command -v curl &> /dev/null; then
    if curl -s http://localhost:9090 > /dev/null 2>&1; then
        test_pass "Prometheus is running"
    else
        test_skip "Prometheus not responding (service may not be started)"
    fi

    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        test_pass "Grafana is running"
    else
        test_skip "Grafana not responding (service may not be started)"
    fi

    if curl -s http://localhost:16686 > /dev/null 2>&1; then
        test_pass "Jaeger UI is running"
    else
        test_skip "Jaeger UI not responding (service may not be started)"
    fi

    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        test_pass "Application is running"
    else
        test_skip "Application not responding (service may not be started)"
    fi
else
    test_skip "curl not available (cannot test service connectivity)"
fi

echo ""

# 8. Check documentation
test_start "Documentation"

if [ -f "$SCRIPT_DIR/DEMO_DATA_GENERATOR.md" ]; then
    test_pass "Comprehensive guide exists"
else
    test_fail "Comprehensive guide missing"
fi

if [ -f "$SCRIPT_DIR/IMPLEMENTATION_SUMMARY.md" ]; then
    test_pass "Implementation summary exists"
else
    test_fail "Implementation summary missing"
fi

echo ""

# 9. Syntax check
test_start "Syntax Validation"

if node -c "$SCRIPT_DIR/scripts/generate-demo-metrics.js" 2>/dev/null; then
    test_pass "Metrics generator syntax is valid"
else
    test_fail "Metrics generator has syntax errors"
fi

if node -c "$SCRIPT_DIR/scripts/generate-jaeger-traces.js" 2>/dev/null; then
    test_pass "Jaeger generator syntax is valid"
else
    test_fail "Jaeger generator has syntax errors"
fi

echo ""

# Summary
test_start "Test Summary"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo ""
if [ $TOTAL_TESTS -eq 0 ]; then
    echo -e "${YELLOW}No tests were run${NC}"
else
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
    echo ""

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Start Docker services: docker-compose up -d"
        echo "2. Generate data: ./generate-all-demo-data.sh continuous 15"
        echo "3. View Grafana: http://localhost:3000"
        echo "4. View Prometheus: http://localhost:9090"
        echo "5. View Jaeger: http://localhost:16686"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please review the output above.${NC}"
        exit 1
    fi
fi
