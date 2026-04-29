#!/bin/bash

# Quick start script for demo data generation
# This script provides interactive options for generating demo data

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_menu() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   Demo Data Generator - Quick Start Menu   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Choose an option:${NC}"
    echo ""
    echo "  1. Generate metrics once"
    echo "  2. Generate traces once"
    echo "  3. Generate all data once"
    echo ""
    echo "  4. Generate metrics continuously (15s)"
    echo "  5. Generate traces continuously (10s)"
    echo "  6. Generate all data continuously (15s)"
    echo ""
    echo "  7. Custom: Metrics with custom interval"
    echo "  8. Custom: All generators with custom interval"
    echo ""
    echo "  9. View demo data samples"
    echo "  0. Exit"
    echo ""
}

show_samples() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   Demo Data Samples                        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/logs/demo-metrics.txt" ]; then
        echo -e "${GREEN}📊 Metrics Sample (first 10 lines):${NC}"
        head -10 "$SCRIPT_DIR/logs/demo-metrics.txt"
        echo ""
    fi
    
    echo -e "${YELLOW}Generated metrics include:${NC}"
    echo "  • container_cpu_usage_seconds_total"
    echo "  • container_memory_usage_bytes"
    echo "  • container_network_receive_bytes_total"
    echo "  • container_network_transmit_bytes_total"
    echo "  • http_requests_total"
    echo "  • http_request_duration_seconds"
    echo "  • electrode_operations_total"
    echo ""
    
    echo -e "${YELLOW}Generated traces include:${NC}"
    echo "  • HTTP request traces"
    echo "  • Database operation spans"
    echo "  • Cache interactions"
    echo "  • Service-to-service calls"
    echo "  • Error traces"
    echo ""
}

handle_selection() {
    local choice=$1
    
    case $choice in
        1)
            echo -e "${GREEN}Generating metrics once...${NC}\n"
            node "$SCRIPT_DIR/scripts/generate-demo-metrics.js" once
            ;;
        2)
            echo -e "${GREEN}Generating traces once...${NC}\n"
            node "$SCRIPT_DIR/scripts/generate-jaeger-traces.js" once
            ;;
        3)
            echo -e "${GREEN}Generating all data once...${NC}\n"
            "$SCRIPT_DIR/generate-all-demo-data.sh" once
            ;;
        4)
            echo -e "${GREEN}Generating metrics continuously every 15 seconds...${NC}"
            echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"
            node "$SCRIPT_DIR/scripts/generate-demo-metrics.js" continuous 15
            ;;
        5)
            echo -e "${GREEN}Generating traces continuously every 10 seconds...${NC}"
            echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"
            node "$SCRIPT_DIR/scripts/generate-jaeger-traces.js" continuous 10
            ;;
        6)
            echo -e "${GREEN}Generating all data continuously every 15 seconds...${NC}"
            echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"
            "$SCRIPT_DIR/generate-all-demo-data.sh" continuous 15
            ;;
        7)
            echo -n -e "${YELLOW}Enter interval in seconds (default 15): ${NC}"
            read -r interval
            interval=${interval:-15}
            echo -e "${GREEN}Generating metrics continuously every ${interval} seconds...${NC}"
            echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"
            node "$SCRIPT_DIR/scripts/generate-demo-metrics.js" continuous "$interval"
            ;;
        8)
            echo -n -e "${YELLOW}Enter interval in seconds (default 15): ${NC}"
            read -r interval
            interval=${interval:-15}
            echo -e "${GREEN}Generating all data continuously every ${interval} seconds...${NC}"
            echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"
            "$SCRIPT_DIR/generate-all-demo-data.sh" continuous "$interval"
            ;;
        9)
            show_samples
            ;;
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
}

main() {
    # Handle Ctrl+C gracefully
    trap 'echo -e "\n${YELLOW}Exiting...${NC}"; exit 0' INT TERM
    
    while true; do
        show_menu
        echo -n -e "${YELLOW}Enter your choice [0-9]: ${NC}"
        read -r choice
        echo ""
        
        handle_selection "$choice"
        
        echo ""
        echo -n -e "${YELLOW}Press Enter to continue...${NC}"
        read -r
        echo ""
        clear
    done
}

main
