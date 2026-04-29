#!/bin/bash

# Demo Data Generator for Grafana, Prometheus, and Jaeger
# This script generates realistic monitoring and tracing data
# Usage: ./generate-all-demo-data.sh [continuous|once] [interval]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="$PROJECT_ROOT/scripts"
NODE_SCRIPT="$SCRIPT_DIR/generate-demo-metrics.js"
PYTHON_SCRIPT="$SCRIPT_DIR/generate-cadvisor-metrics.py"
JAEGER_SCRIPT="$SCRIPT_DIR/generate-jaeger-traces.js"

# Mode and interval
MODE="${1:-once}"
INTERVAL="${2:-15}"

# Check if running in Docker
IN_DOCKER=${IN_DOCKER:-false}

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Demo Data Generator for Grafana/Prometheus/Jaeger   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Mode: $MODE"
echo "  Interval: ${INTERVAL}s"
echo "  Node Script: $NODE_SCRIPT"
echo "  Python Script: $PYTHON_SCRIPT"
echo "  Jaeger Script: $JAEGER_SCRIPT"
echo ""

# Function to check if a service is running
check_service() {
  local service=$1
  local port=$2
  local url="http://localhost:$port"
  
  if command -v curl &> /dev/null; then
    if curl -s "$url" > /dev/null 2>&1 || curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
      echo -e "${GREEN}✓${NC} $service"
      return 0
    else
      echo -e "${RED}✗${NC} $service (not responding)"
      return 1
    fi
  else
    echo -e "${YELLOW}?${NC} $service (curl not available)"
    return 0
  fi
}

# Function to run metrics generator
run_metrics_generator() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}📊 Prometheus & cAdvisor Metrics Generator${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  if [ ! -f "$NODE_SCRIPT" ]; then
    echo -e "${RED}✗ Node script not found: $NODE_SCRIPT${NC}"
    return 1
  fi

  if [ "$MODE" == "continuous" ]; then
    echo -e "${YELLOW}Running metrics generator in continuous mode (every ${INTERVAL}s)...${NC}"
    node "$NODE_SCRIPT" continuous "$INTERVAL"
  else
    echo -e "${YELLOW}Running metrics generator once...${NC}"
    node "$NODE_SCRIPT" once
  fi
}

# Function to run Jaeger trace generator
run_jaeger_generator() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}🔍 Jaeger Distributed Trace Generator${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  if [ ! -f "$JAEGER_SCRIPT" ]; then
    echo -e "${RED}✗ Jaeger script not found: $JAEGER_SCRIPT${NC}"
    return 1
  fi

  if [ "$MODE" == "continuous" ]; then
    echo -e "${YELLOW}Running Jaeger trace generator in continuous mode (every ${INTERVAL}s)...${NC}"
    node "$JAEGER_SCRIPT" continuous "$INTERVAL"
  else
    echo -e "${YELLOW}Running Jaeger trace generator once...${NC}"
    node "$JAEGER_SCRIPT" once
  fi
}

# Function to run Python metrics generator
run_python_generator() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}📈 Python cAdvisor Metrics Generator${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo -e "${RED}✗ Python script not found: $PYTHON_SCRIPT${NC}"
    return 1
  fi

  if [ "$MODE" == "continuous" ]; then
    echo -e "${YELLOW}Running Python generator in continuous mode...${NC}"
    while true; do
      python3 "$PYTHON_SCRIPT"
      sleep "$INTERVAL"
    done
  else
    echo -e "${YELLOW}Running Python generator once...${NC}"
    python3 "$PYTHON_SCRIPT"
  fi
}

# Main execution
main() {
  # Check if services are available
  echo -e "${YELLOW}Checking services...${NC}"
  check_service "Prometheus" 9090
  check_service "Grafana" 3000
  check_service "Jaeger" 16686
  check_service "Application" 8000
  echo ""

  # Validate inputs
  if [[ "$MODE" != "once" && "$MODE" != "continuous" ]]; then
    echo -e "${RED}Error: Invalid mode '$MODE'. Use 'once' or 'continuous'${NC}"
    exit 1
  fi

  # Run generators based on mode
  if [ "$MODE" == "continuous" ]; then
    echo -e "${GREEN}Starting continuous demo data generation...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""

    # Run all generators in background
    (run_metrics_generator) &
    METRICS_PID=$!

    (run_jaeger_generator) &
    JAEGER_PID=$!

    # Wait for both processes
    wait $METRICS_PID $JAEGER_PID

  else
    # Run once
    echo -e "${GREEN}Running one-time demo data generation...${NC}"
    echo ""

    run_metrics_generator
    echo ""
    
    run_jaeger_generator
    echo ""

    echo -e "${GREEN}✅ Demo data generation complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Open Grafana: http://localhost:3000"
    echo "  2. Open Prometheus: http://localhost:9090"
    echo "  3. Open Jaeger: http://localhost:16686"
    echo ""
    echo "For continuous generation, run:"
    echo "  ./generate-all-demo-data.sh continuous 15"
  fi
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}Shutting down...${NC}"; kill $(jobs -p) 2>/dev/null; exit 0' INT TERM

# Run main function
main "$@"
