# ⚡ Electrode - Energy Trading & Monitoring Platform

**A comprehensive Node.js energy trading and monitoring platform with real-time dashboards, system health monitoring, and trading capabilities. Built with Express.js, integrated with Prometheus, Grafana, and Jaeger for complete observability.**

## 🌟 Features

### 🎯 Energy Trading Dashboard
- **Real-time Trading Interface**: Interactive energy trading with live price charts
- **Portfolio Management**: Track energy tokens, portfolio value, and trading performance  
- **Market Analytics**: Price predictions, trading volume, and market trends
- **Simulated Trading**: Buy/sell energy tokens with real-time price updates

### 📊 Monitoring & Observability
- **System Health Monitoring**: Real-time status of all system components
- **Prometheus Metrics**: Industry-standard metrics collection and alerting
- **Grafana Dashboards**: Beautiful visualizations and analytics
- **Jaeger Tracing**: Distributed tracing for performance analysis
- **Comprehensive Logging**: Winston-based logging with file rotation

### 🎨 Modern Dashboard Interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Interactive Charts**: Chart.js powered real-time data visualization
- **System Status Page**: Live monitoring of all services and dependencies
- **Dark Theme UI**: Modern, energy-themed interface design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- 4GB+ RAM recommended

### Installation & Setup

```bash
# Clone and install
git clone <repository-url>
cd explore
npm install

# Start the application
npm start

# Or start with full monitoring stack
docker compose up -d
```

### 🔗 Access Points

- **🏠 Main Dashboard**: http://localhost:8000
- **⚡ Energy Trading**: http://localhost:8000/dashboard-working.html  
- **📊 System Status**: http://localhost:8000/system-status.html
- **🏥 Health Check**: http://localhost:8000/health
- **📈 Prometheus**: http://localhost:9090
- **📊 Grafana**: http://localhost:3000 (admin/admin)
- **🔍 Jaeger**: http://localhost:16686
- **📖 API Docs**: http://localhost:8000/api-docs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              ELECTRODE PLATFORM                     │
├─────────────────────────────────────────────────────┤
│  Energy Trading Dashboard    │   System Monitoring  │
│  ├─ Real-time Trading       │   ├─ Prometheus       │
│  ├─ Portfolio Management    │   ├─ Grafana          │
│  ├─ Market Analytics        │   ├─ Jaeger Tracing   │
│  └─ Price Predictions       │   └─ Health Checks    │
├─────────────────────────────────────────────────────┤
│              Express.js API Server                  │
│  Authentication │ Validation │ Metrics │ Logging    │
├─────────────────────────────────────────────────────┤
│              Monitoring Stack                       │
│  Docker │ Prometheus │ Grafana │ Jaeger │ Logs      │
└─────────────────────────────────────────────────────┘
```

## 📡 API Endpoints

### Core System
- `GET /health` - System health and uptime status
- `GET /metrics` - Prometheus metrics endpoint  
- `GET /monitoring-status` - Monitoring services status
- `GET /health/live` - Kubernetes liveness probe
- `GET /health/ready` - Kubernetes readiness probe

### Trading & Analytics
- `GET /api/v1/trading/portfolio` - Portfolio information
- `GET /api/v1/trading/prices` - Current energy prices
- `POST /api/v1/trading/orders` - Place trading orders
- `GET /api/v1/analytics/performance` - Performance metrics

## 🛠️ Quick Commands

We've included a handy script for managing the platform:

```bash
# Make script executable
chmod +x quick-commands.sh

# Available commands
./quick-commands.sh start        # Start all services
./quick-commands.sh stop         # Stop all services
./quick-commands.sh status       # Check system status
./quick-commands.sh logs         # View application logs
./quick-commands.sh health       # Quick health check
./quick-commands.sh dashboard    # Open all monitoring URLs
./quick-commands.sh clean        # Clean up containers
```

## 🐳 Docker Deployment

### Full Stack with Monitoring

```bash
# Start complete monitoring stack
docker compose up -d

# Check container status
docker compose ps

# View logs
docker compose logs -f electrode-app

# Stop everything
docker compose down
```

### Services Included
- **Application Server**: Node.js Express app
- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Dashboard visualization (port 3000)
- **Jaeger**: Distributed tracing (port 16686)
- **cAdvisor**: Container monitoring (port 8080)

## 📈 Monitoring Features

### Real-time Metrics
- HTTP request rates and response times
- System resource usage (CPU, memory, disk)
- Energy trading metrics (volume, prices, portfolio)
- Error rates and application health

### Dashboards Available
- **Application Metrics**: HTTP performance, error rates
- **Infrastructure Monitoring**: System resources, containers
- **Trading Analytics**: Energy prices, portfolio performance  
- **System Health**: Service status, alerts

### Alerting Rules
- High error rates (>5%)
- Slow response times (>2s)
- Service downtime detection
- Resource usage alerts

## 🎮 Using the Energy Trading Interface

### Trading Features
1. **Real-time Price Chart**: Live energy price updates
2. **Buy/Sell Controls**: Simulate energy token trading
3. **Portfolio Tracking**: Monitor token holdings and value
4. **Activity Feed**: Real-time trading activity updates
5. **Market Analytics**: Price trends and predictions

### System Monitoring
1. **Service Status**: Monitor all system components
2. **Performance Metrics**: Track response times and throughput
3. **Health Checks**: Verify system dependencies
4. **Quick Actions**: Easy access to monitoring tools

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration  
PORT=8000
NODE_ENV=production

# Monitoring Configuration
ENABLE_METRICS_COLLECTION=true
ENABLE_DISTRIBUTED_TRACING=true
PROMETHEUS_METRICS_PORT=9464

# Jaeger Configuration
JAEGER_ENDPOINT=http://jaeger:14268/api/traces

# Logging
LOG_LEVEL=info
```

## 🧪 Development & Testing

### Development Mode
```bash
# Start with hot reload
npm run dev

# Run tests
npm test

# Check code coverage
npm run test:coverage

# Lint code
npm run lint
```

### Health Checks
```bash
# Basic health check
curl http://localhost:8000/health

# Check specific services
curl http://localhost:8000/monitoring-status

# Test metrics collection
curl http://localhost:8000/metrics | head -20
```

## 🔍 Troubleshooting

### Common Issues

**Application not starting**
1. Check port availability: `lsof -i :8000`
2. Verify Node.js version: `node --version` (requires 18+)
3. Check logs: `./quick-commands.sh logs`

**Monitoring stack issues**
1. Restart services: `docker compose restart`
2. Check container status: `docker compose ps`  
3. View service logs: `docker compose logs [service-name]`

**Dashboard not loading**
1. Clear browser cache and reload
2. Check JavaScript console for errors
3. Verify all CSS/JS assets are loading

### Performance Tips
- Use `./quick-commands.sh clean` to free up resources
- Monitor system resources with `./quick-commands.sh status`
- Check logs regularly for any warnings or errors

## 🛡️ Security Features

- **Helmet.js**: Security headers and protection
- **Rate Limiting**: API endpoint protection  
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses

## 📱 Mobile Support

The dashboard is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari)
- Mobile devices (iOS Safari, Android Chrome)
- Tablet devices with touch support

## 🚀 Production Deployment

### Recommended Setup
1. Use Docker Compose for easy deployment
2. Configure environment-specific variables
3. Set up log rotation and monitoring alerts
4. Use a reverse proxy (nginx) for SSL termination
5. Implement backup strategies for configuration

### Performance Monitoring
- Monitor response times and error rates
- Set up alerting for critical issues
- Use Grafana dashboards for visualization
- Regular health checks and maintenance

## 📚 API Documentation

Interactive API documentation is available at `/api-docs` when the server is running. The documentation includes:

- Complete endpoint reference
- Request/response examples
- Authentication requirements
- Error code explanations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality  
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Health Endpoint**: Check `/health` for system status
- **Logs**: Use `./quick-commands.sh logs` for debugging
- **Monitoring**: Access Grafana at http://localhost:3000
- **System Status**: Visit `/system-status.html` for live monitoring

---

**⚡ Electrode Platform** - Comprehensive energy trading and monitoring solution built with modern web technologies.

*Last Updated: November 2025*
