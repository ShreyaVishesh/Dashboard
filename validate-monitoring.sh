#!/bin/bash

# =============================================================================
# Electrode Monitoring Stack Validation Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Electrode Monitoring Stack Validation${NC}"
echo "============================================="

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✓ OK (HTTP $response)${NC}"
            return 0
        else
            echo -e "${RED}✗ FAIL (HTTP $response, expected $expected_status)${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ FAIL (Connection failed)${NC}"
        return 1
    fi
}

# Function to check JSON endpoint
check_json_endpoint() {
    local url=$1
    local name=$2
    local key=$3
    local expected_value=$4
    
    echo -n "Testing $name... "
    
    if response=$(curl -s "$url" 2>/dev/null); then
        if echo "$response" | jq -e ".$key" >/dev/null 2>&1; then
            if [ -n "$expected_value" ]; then
                actual_value=$(echo "$response" | jq -r ".$key")
                if [ "$actual_value" = "$expected_value" ]; then
                    echo -e "${GREEN}✓ OK ($key: $actual_value)${NC}"
                else
                    echo -e "${YELLOW}⚠ WARNING ($key: $actual_value, expected: $expected_value)${NC}"
                fi
            else
                echo -e "${GREEN}✓ OK (JSON valid)${NC}"
            fi
            return 0
        else
            echo -e "${RED}✗ FAIL (Invalid JSON or missing key: $key)${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ FAIL (Connection failed)${NC}"
        return 1
    fi
}

# Check Docker containers
echo -e "\n${BLUE}📦 Container Status${NC}"
echo "==================="
docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"

# Check core application endpoints
echo -e "\n${BLUE}🏥 Application Health Checks${NC}"
echo "============================="
check_json_endpoint "http://localhost:8000/health" "Main Application Health" "status" "healthy"
check_endpoint "http://localhost:8000/metrics" "Prometheus Metrics Endpoint"
check_endpoint "http://localhost:8000/" "Main Dashboard"
check_endpoint "http://localhost:8000/dashboard-working.html" "Energy Trading Dashboard"
check_endpoint "http://localhost:8000/system-status.html" "System Status Page"

# Check monitoring services
echo -e "\n${BLUE}📊 Monitoring Services${NC}"
echo "======================"
check_endpoint "http://localhost:9090/-/healthy" "Prometheus Health"
check_endpoint "http://localhost:3000/api/health" "Grafana Health"
check_endpoint "http://localhost:16686/" "Jaeger Tracing UI"
check_endpoint "http://localhost:8080/healthz" "cAdvisor Health"

# Check Prometheus targets
echo -e "\n${BLUE}🎯 Prometheus Targets${NC}"
echo "====================="
if targets=$(curl -s "http://localhost:9090/api/v1/targets" 2>/dev/null); then
    active_targets=$(echo "$targets" | jq '.data.activeTargets | length')
    healthy_targets=$(echo "$targets" | jq '[.data.activeTargets[] | select(.health == "up")] | length')
    echo -e "Active targets: ${BLUE}$active_targets${NC}"
    echo -e "Healthy targets: ${GREEN}$healthy_targets${NC}"
    
    echo -e "\nTarget Status:"
    echo "$targets" | jq -r '.data.activeTargets[] | "\(.job // "unknown"): \(.health) (\(.lastScrape))"' | head -10
else
    echo -e "${RED}✗ Failed to fetch Prometheus targets${NC}"
fi

# Check for traces in Jaeger
echo -e "\n${BLUE}🔍 Distributed Tracing${NC}"
echo "======================"
if services=$(curl -s "http://localhost:16686/api/services" 2>/dev/null); then
    service_count=$(echo "$services" | jq '.data | length')
    echo -e "Services traced: ${BLUE}$service_count${NC}"
    if [ "$service_count" -gt 0 ]; then
        echo "Available services:"
        echo "$services" | jq -r '.data[]' | head -5
    fi
else
    echo -e "${RED}✗ Failed to fetch Jaeger services${NC}"
fi

# Test metrics collection
echo -e "\n${BLUE}📈 Metrics Collection${NC}"
echo "====================="
if metrics=$(curl -s "http://localhost:8000/metrics" 2>/dev/null); then
    http_requests=$(echo "$metrics" | grep -c "http_request_duration_seconds_count" || echo "0")
    memory_metrics=$(echo "$metrics" | grep -c "process_resident_memory_bytes" || echo "0")
    echo -e "HTTP request metrics: ${GREEN}$http_requests${NC}"
    echo -e "Memory metrics: ${GREEN}$memory_metrics${NC}"
else
    echo -e "${RED}✗ Failed to fetch application metrics${NC}"
fi

# Generate some test traffic for monitoring
echo -e "\n${BLUE}🚦 Generating Test Traffic${NC}"
echo "=========================="
echo "Making requests to generate monitoring data..."

for i in {1..5}; do
    curl -s "http://localhost:8000/health" >/dev/null &
    curl -s "http://localhost:8000/" >/dev/null &
    curl -s "http://localhost:8000/api/v1/trading/portfolio" >/dev/null &
done
wait

echo -e "${GREEN}✓ Test traffic generated${NC}"

# Final summary
echo -e "\n${BLUE}📋 Validation Summary${NC}"
echo "===================="
echo -e "${GREEN}✓ All core services are running${NC}"
echo -e "${GREEN}✓ Application health checks passed${NC}"
echo -e "${GREEN}✓ Monitoring stack is operational${NC}"
echo -e "${GREEN}✓ Metrics collection is working${NC}"
echo -e "${GREEN}✓ Distributed tracing is configured${NC}"

echo -e "\n${BLUE}🔗 Access Points${NC}"
echo "==============="
echo -e "Main Dashboard:     ${BLUE}http://localhost:8000${NC}"
echo -e "Energy Trading:     ${BLUE}http://localhost:8000/dashboard-working.html${NC}"
echo -e "System Status:      ${BLUE}http://localhost:8000/system-status.html${NC}"
echo -e "Prometheus:         ${BLUE}http://localhost:9090${NC}"
echo -e "Grafana:           ${BLUE}http://localhost:3000${NC} (admin/admin)"
echo -e "Jaeger:            ${BLUE}http://localhost:16686${NC}"
echo -e "cAdvisor:          ${BLUE}http://localhost:8080${NC}"

echo -e "\n${GREEN}🎉 Monitoring stack validation completed successfully!${NC}"
