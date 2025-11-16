#!/bin/bash

# Simple Monitoring Status Check
echo "🔍 Electrode Monitoring Dashboard"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_service() {
    local name="$1"
    local url="$2"
    local expected="$3"
    
    echo -n "Checking $name... "
    
    if curl -s "$url" | grep -q "$expected"; then
        echo -e "${GREEN}✅ UP${NC}"
        return 0
    else
        echo -e "${RED}❌ DOWN${NC}"
        return 1
    fi
}

check_http_status() {
    local name="$1"
    local url="$2"
    
    echo -n "Checking $name... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$status" -eq 200 ] || [ "$status" -eq 302 ]; then
        echo -e "${GREEN}✅ UP (HTTP $status)${NC}"
        return 0
    else
        echo -e "${RED}❌ DOWN (HTTP $status)${NC}"
        return 1
    fi
}

echo
echo "📊 Core Services:"
check_service "Application Health" "http://localhost:8000/health" "healthy"
check_service "Application Metrics" "http://localhost:8000/metrics" "http_requests_total"

echo
echo "📈 Monitoring Stack:"
check_service "Prometheus" "http://localhost:9090/-/healthy" "Prometheus Server is Healthy"
check_http_status "Grafana" "http://localhost:3000"
check_http_status "Jaeger UI" "http://localhost:16686"

echo
echo "🔗 Quick Links:"
echo "• Application: http://localhost:8000"
echo "• Health Check: http://localhost:8000/health"
echo "• Metrics: http://localhost:8000/metrics"
echo "• Prometheus: http://localhost:9090"
echo "• Grafana: http://localhost:3000 (admin/admin)"
echo "• Jaeger: http://localhost:16686"

echo
echo "📝 Sample Queries for Prometheus:"
echo "• HTTP Request Rate: rate(http_requests_total[5m])"
echo "• Response Time 95th: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
echo "• Error Rate: rate(http_requests_total{status_code=~\"4..|5..\"}[5m]) / rate(http_requests_total[5m]) * 100"

echo
echo "✨ Your basic monitoring setup is ready!"
