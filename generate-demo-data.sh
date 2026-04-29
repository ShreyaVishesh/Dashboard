#!/bin/bash

# Demo Data Generator Script
# Generates demo data for Grafana, Prometheus, and Jaeger

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Demo Data Generator for Dashboard${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
APP_URL="${APP_URL:-http://localhost:8000}"
DEMO_DURATION="${DEMO_DURATION:-5}" # minutes
DEMO_INTERVAL="${DEMO_INTERVAL:-3000}" # milliseconds

echo -e "${YELLOW}Configuration:${NC}"
echo "  App URL: $APP_URL"
echo "  Duration: $DEMO_DURATION minutes"
echo "  Interval: $DEMO_INTERVAL ms"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

# Check if app is running
echo -e "${YELLOW}Checking application health...${NC}"
if ! curl -f -s "$APP_URL/health/live" > /dev/null 2>&1; then
    echo -e "${RED}Error: Application is not responding at $APP_URL${NC}"
    echo -e "${YELLOW}Please ensure the application is running:${NC}"
    echo "  docker-compose up -d app"
    exit 1
fi
echo -e "${GREEN}✓ Application is healthy${NC}"
echo ""

# Check if required Node.js packages are installed
echo -e "${YELLOW}Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Check for specific packages
REQUIRED_PACKAGES=("axios" "dotenv" "@opentelemetry/api")
MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if ! npm list "$package" > /dev/null 2>&1; then
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo -e "${YELLOW}Installing missing packages: ${MISSING_PACKAGES[@]}${NC}"
    npm install "${MISSING_PACKAGES[@]}"
fi

echo -e "${GREEN}✓ Dependencies are satisfied${NC}"
echo ""

# Run the demo data generator
echo -e "${BLUE}Starting demo data generation...${NC}"
echo -e "${YELLOW}(This will run for $DEMO_DURATION minutes)${NC}"
echo -e "${YELLOW}Generating data for:${NC}"
echo "  - Prometheus metrics"
echo "  - Jaeger traces"
echo "  - Grafana dashboards"
echo ""

export APP_URL=$APP_URL
export DEMO_DURATION=$DEMO_DURATION
export DEMO_INTERVAL=$DEMO_INTERVAL
export NODE_ENV=development

node scripts/generate-demo-data.js

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Demo Data Generation Completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Access your dashboards:${NC}"
echo "  Grafana:  ${GREEN}http://localhost:3000${NC} (admin/admin)"
echo "  Prometheus: ${GREEN}http://localhost:9090${NC}"
echo "  Jaeger:   ${GREEN}http://localhost:16686${NC}"
echo ""
echo -e "${YELLOW}Tips:${NC}"
echo "  1. Check Grafana dashboards for metrics"
echo "  2. View Prometheus targets: http://localhost:9090/targets"
echo "  3. View Jaeger traces by service name: 'dashboard-monitoring'"
echo "  4. Run multiple times to accumulate more data"
echo ""
