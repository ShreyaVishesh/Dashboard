#!/bin/bash

# 🚀 Electrode Monitoring - Quick Commands
# Usage: ./quick-commands.sh [command]

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${BLUE}⚡ Electrode Monitoring - Quick Commands${NC}"
    echo "=============================================="
    echo
    echo "Available commands:"
    echo -e "  ${GREEN}start${NC}        - Start all services"
    echo -e "  ${GREEN}stop${NC}         - Stop all services"
    echo -e "  ${GREEN}restart${NC}      - Restart all services"
    echo -e "  ${GREEN}status${NC}       - Check service status"
    echo -e "  ${GREEN}logs${NC}         - View application logs"
    echo -e "  ${GREEN}metrics${NC}      - View current metrics"
    echo -e "  ${GREEN}health${NC}       - Quick health check"
    echo -e "  ${GREEN}clean${NC}        - Clean up containers and volumes"
    echo -e "  ${GREEN}update${NC}       - Update and rebuild services"
    echo -e "  ${GREEN}dashboard${NC}    - Open all monitoring URLs"
    echo -e "  ${GREEN}backup${NC}       - Backup configuration"
    echo
    echo "Examples:"
    echo "  ./quick-commands.sh start"
    echo "  ./quick-commands.sh logs"
    echo "  ./quick-commands.sh dashboard"
}

start_services() {
    echo -e "${YELLOW}🚀 Starting all services...${NC}"
    
    # Start monitoring stack
    docker compose up -d prometheus grafana jaeger node-exporter cadvisor
    
    # Start application
    if ! pgrep -f "node app.js" > /dev/null; then
        echo -e "${YELLOW}Starting Node.js application...${NC}"
        npm start > /dev/null 2>&1 &
        sleep 3
    fi
    
    echo -e "${GREEN}✅ All services started!${NC}"
    ./check-monitoring.sh
}

stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    # Stop Node.js application
    pkill -f "node app.js" || true
    
    # Stop Docker services
    docker compose down
    
    echo -e "${GREEN}✅ All services stopped!${NC}"
}

restart_services() {
    echo -e "${YELLOW}🔄 Restarting all services...${NC}"
    stop_services
    sleep 2
    start_services
}

check_status() {
    ./check-monitoring.sh
}

view_logs() {
    echo -e "${BLUE}📋 Application Logs (last 50 lines):${NC}"
    echo "=================================="
    
    if [ -f "logs/combined-$(date +%Y-%m-%d).log" ]; then
        tail -50 "logs/combined-$(date +%Y-%m-%d).log"
    else
        echo "No log file found for today"
    fi
    
    echo
    echo -e "${BLUE}📋 Docker Logs:${NC}"
    echo "==============="
    docker compose logs --tail=20
}

view_metrics() {
    echo -e "${BLUE}📊 Current Metrics:${NC}"
    echo "=================="
    
    echo "Health Status:"
    curl -s http://localhost:8000/health | jq '.' || echo "❌ Health endpoint not accessible"
    
    echo
    echo "Monitoring Status:"
    curl -s http://localhost:8000/monitoring-status | jq '.' || echo "❌ Monitoring endpoint not accessible"
    
    echo
    echo "Sample Metrics:"
    curl -s http://localhost:8000/metrics | grep -E "http_requests_total|process_cpu_seconds_total" | head -5 || echo "❌ Metrics endpoint not accessible"
}

quick_health() {
    echo -e "${BLUE}🏥 Quick Health Check:${NC}"
    echo "====================="
    
    # Check application
    if curl -s http://localhost:8000/health > /dev/null; then
        echo -e "Application: ${GREEN}✅ Online${NC}"
    else
        echo -e "Application: ${RED}❌ Offline${NC}"
    fi
    
    # Check Prometheus
    if curl -s http://localhost:9090/-/healthy > /dev/null; then
        echo -e "Prometheus: ${GREEN}✅ Online${NC}"
    else
        echo -e "Prometheus: ${RED}❌ Offline${NC}"
    fi
    
    # Check Grafana
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo -e "Grafana: ${GREEN}✅ Online${NC}"
    else
        echo -e "Grafana: ${RED}❌ Offline${NC}"
    fi
    
    # Check Jaeger
    if curl -s http://localhost:16686 > /dev/null; then
        echo -e "Jaeger: ${GREEN}✅ Online${NC}"
    else
        echo -e "Jaeger: ${RED}❌ Offline${NC}"
    fi
}

clean_services() {
    echo -e "${YELLOW}🧹 Cleaning up containers and volumes...${NC}"
    
    # Stop services first
    stop_services
    
    # Remove containers and volumes
    docker compose down -v --remove-orphans
    
    # Clean up unused Docker resources
    docker system prune -f
    
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
}

update_services() {
    echo -e "${YELLOW}🔄 Updating services...${NC}"
    
    # Pull latest images
    docker compose pull
    
    # Rebuild application image
    docker compose build --no-cache
    
    # Restart services
    restart_services
    
    echo -e "${GREEN}✅ Update completed!${NC}"
}

open_dashboards() {
    echo -e "${BLUE}🌐 Opening monitoring dashboards...${NC}"
    
    urls=(
        "http://localhost:8000"
        "http://localhost:8000/system-status.html"
        "http://localhost:9090"
        "http://localhost:3000"
        "http://localhost:16686"
    )
    
    for url in "${urls[@]}"; do
        echo "Opening: $url"
        open "$url" 2>/dev/null || echo "Could not open $url automatically"
    done
    
    echo
    echo "Dashboard URLs:"
    echo "• Main App: http://localhost:8000"
    echo "• System Status: http://localhost:8000/system-status.html"
    echo "• Prometheus: http://localhost:9090"
    echo "• Grafana: http://localhost:3000 (admin/admin)"
    echo "• Jaeger: http://localhost:16686"
}

backup_config() {
    echo -e "${YELLOW}💾 Creating configuration backup...${NC}"
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="backups/config_backup_$timestamp"
    
    mkdir -p "$backup_dir"
    
    # Copy configuration files
    cp -r grafana/ "$backup_dir/"
    cp docker-compose.yml "$backup_dir/"
    cp prometheus-conf.yml "$backup_dir/"
    cp electrode-alerts.yml "$backup_dir/"
    cp app.js "$backup_dir/"
    cp package.json "$backup_dir/"
    
    # Create archive
    tar -czf "config_backup_$timestamp.tar.gz" -C backups "config_backup_$timestamp"
    rm -rf "$backup_dir"
    
    echo -e "${GREEN}✅ Backup created: config_backup_$timestamp.tar.gz${NC}"
}

# Main command handling
case "${1:-help}" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        check_status
        ;;
    "logs")
        view_logs
        ;;
    "metrics")
        view_metrics
        ;;
    "health")
        quick_health
        ;;
    "clean")
        clean_services
        ;;
    "update")
        update_services
        ;;
    "dashboard")
        open_dashboards
        ;;
    "backup")
        backup_config
        ;;
    "help"|*)
        show_help
        ;;
esac
