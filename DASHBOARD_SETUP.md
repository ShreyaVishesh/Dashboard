# Dashboard Setup & Verification Guide

## ✅ System Status

All monitoring systems are operational and collecting data.

### Services Running

- **Node.js App**: http://localhost:8000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Jaeger**: http://localhost:16686

## 📊 Grafana Dashboard

### Login Credentials

- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: maths369

### Dashboard: Electrode Monitoring Dashboard

The dashboard contains 4 main visualization panels:

#### 1. **Electrode Operations Rate**

- **Query**: `rate(electrode_operations_total{job="electrode-app"}[5m])`
- **Shows**: Buy/Sell operations per second
- **Label Format**: `{{operation_type}} - {{status}}`
- **Status**: ✅ Data available

#### 2. **Electrode Operation Duration**

- **Query**: `rate(electrode_operation_duration_seconds_sum{job="electrode-app"}[5m]) / rate(electrode_operation_duration_seconds_count{job="electrode-app"}[5m])`
- **Shows**: Average operation duration in seconds
- **Label Format**: `Avg Duration - {{operation_type}}`
- **Status**: ✅ Data available

#### 3. **HTTP Requests by Status Code**

- **Query**: `rate(http_requests_total{job="electrode-app"}[5m])`
- **Shows**: HTTP requests per second by status code
- **Label Format**: `{{status_code}} - {{method}}`
- **Status**: ✅ Data available

#### 4. **System Resources**

- **Queries**:
  - Memory: `process_resident_memory_bytes{job="electrode-app"} / 1024 / 1024` (in MB)
  - CPU: `rate(process_cpu_seconds_total{job="electrode-app"}[5m]) * 100` (% utilization)
- **Shows**: Process memory and CPU usage
- **Status**: ✅ Data available

## 🚀 API Endpoints

### Trade Operations API

- **Endpoint**: `POST /api/v1/trade`
- **Request**:
  ```json
  {
    "type": "buy" | "sell"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Buy order executed successfully",
    "data": {
      "type": "buy",
      "amount": 23,
      "pricePerUnit": "0.138",
      "totalValue": "3.17",
      "timestamp": "2025-11-17T18:13:18.103Z"
    }
  }
  ```

### Test Trade Generation

```bash
# Generate 20 trades
cd /Users/shreyavishesh/Desktop/explore
bash generate-trades.sh

# Or manually
for i in {1..20}; do
  curl -X POST http://localhost:8000/api/v1/trade \
    -H "Content-Type: application/json" \
    -d '{"type":"buy"}' &
done
```

## 📈 Metrics Collection

### Electrode Metrics

- `electrode_operations_total` - Counter of buy/sell operations
- `electrode_operation_duration_seconds` - Histogram of operation durations

### HTTP Metrics

- `http_requests_total` - Counter of HTTP requests
- `http_request_duration_seconds` - Histogram of request durations
- `http_active_connections` - Gauge of active connections

### Process Metrics

- `process_resident_memory_bytes` - Memory usage
- `process_cpu_seconds_total` - CPU time

### Scrape Configuration

- **Prometheus scrape interval**: 15 seconds
- **Metric retention**: 15 days
- **Target**: `app:8000/metrics`

## 🔍 Troubleshooting

### Charts Still Empty?

1. **Refresh Grafana**: Ctrl+F5 or Cmd+Shift+R
2. **Verify data in Prometheus**:
   ```bash
   curl http://localhost:9090/api/v1/query?query=electrode_operations_total
   ```
3. **Generate fresh data**:
   ```bash
   bash /Users/shreyavishesh/Desktop/explore/generate-trades.sh
   ```

### Dashboard Not Loading?

1. Check Grafana is running: `docker ps | grep grafana`
2. Check Prometheus connectivity from Grafana:
   ```bash
   docker exec grafana curl http://prometheus:9090/api/v1/targets
   ```
3. Restart Grafana if needed:
   ```bash
   docker compose restart grafana
   ```

## 📝 Dashboard Configuration Files

- Dashboard JSON: `/Users/shreyavishesh/Desktop/explore/grafana-config/provisioning/dashboards/electrode-monitoring.json`
- Datasource Config: `/Users/shreyavishesh/Desktop/explore/grafana-config/provisioning/datasources/prometheus.yml`
- Dashboard Provisioning: `/Users/shreyavishesh/Desktop/explore/grafana-config/provisioning/dashboards/dashboard.yml`

## ✨ Next Steps

1. Log into Grafana with admin/maths369
2. Navigate to the "Electrode Monitoring Dashboard"
3. Verify all 4 panels are displaying data
4. Use the dashboard's time range selector to zoom into specific periods
5. Click on legend items to toggle series visibility
