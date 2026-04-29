# Grafana Dashboard Configuration Guide

This guide shows how to create Grafana dashboards that display the demo data being generated.

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Demo Data
```bash
./generate-all-demo-data.sh continuous 15
```
**Wait 30 seconds for data to accumulate**

### Step 2: Open Grafana
```
http://localhost:3000
Username: admin
Password: admin
```

### Step 3: Add Prometheus Data Source
1. Configuration → Data Sources → New
2. Choose "Prometheus"
3. URL: `http://prometheus:9090`
4. Click "Save & Test"
5. Should see "Data source is working"

### Step 4: Create Your First Panel
1. Create → Dashboard → New Panel
2. Data Source: Select "Prometheus"
3. In Query field, enter:
   ```
   http_requests_total
   ```
4. Click outside the field or press Enter
5. Should see metrics appearing
6. Title the panel "Total Requests"
7. Click "Save"

**Congratulations!** You now have a working dashboard with real data.

---

## Dashboard Queries

### ✅ Simple & Working Queries (Start Here)

These are the most reliable queries to use:

#### 1. Total HTTP Requests
```promql
http_requests_total
```
**Visualization**: Counter / Stat
**Shows**: Total requests since generator started

#### 2. HTTP Request Rate (Requests/sec)
```promql
sum(rate(http_requests_total[1m]))
```
**Visualization**: Graph
**Legend**: `Total req/sec`
**Expected value**: 0.5-2 req/sec

#### 3. Active Connections
```promql
http_active_connections
```
**Visualization**: Gauge
**Expected value**: 20-150 connections

#### 4. Memory Usage (All Containers)
```promql
container_memory_usage_bytes
```
**Visualization**: Graph
**Legend**: `{{container}}`
**Format**: Bytes (will auto-convert to MB/GB)

#### 5. CPU Usage Rate
```promql
rate(container_cpu_usage_seconds_total[1m])
```
**Visualization**: Graph
**Legend**: `{{container}}`
**Expected**: 0.1-0.8 CPU rate

#### 6. Network Receive Bytes Rate
```promql
rate(container_network_receive_bytes_total[1m])
```
**Visualization**: Graph
**Legend**: `{{container}} RX`

#### 7. Network Transmit Bytes Rate
```promql
rate(container_network_transmit_bytes_total[1m])
```
**Visualization**: Graph
**Legend**: `{{container}} TX`

#### 8. Electrode Operations
```promql
electrode_operations_total
```
**Visualization**: Graph
**Legend**: `{{operation_type}} - {{status}}`

#### 9. Request Duration Average
```promql
rate(http_request_duration_seconds_sum[1m]) / rate(http_request_duration_seconds_count[1m])
```
**Visualization**: Graph
**Unit**: `s` (seconds)
**Legend**: `Average Duration`

#### 10. P95 Request Duration
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```
**Visualization**: Graph
**Unit**: `s` (seconds)
**Legend**: `P95 Duration`

---

### Intermediate Queries (Require Data to Exist)

#### Request Status Distribution
```promql
http_requests_total
```
Then in Grafana legend, group by `status` label

#### Success Rate (%)
```promql
(sum(rate(http_requests_total{status="200"}[5m]))) / (sum(rate(http_requests_total[5m]))) * 100
```

#### Error Rate (%)
```promql
(sum(rate(http_requests_total{status=~"[45].."}[5m]))) / (sum(rate(http_requests_total[5m]))) * 100
```

#### Memory Usage by Container (%)
```promql
(container_memory_usage_bytes / container_memory_limit_bytes) * 100
```
**Legend**: `{{container}}`

#### Filesystem Usage
```promql
container_fs_usage_bytes
```
**Legend**: `{{container}} - {{mountpoint}}`

---

## Dashboard Queries

**Panel Title**: Container CPU Usage

**Query 1**: CPU per container
```promql
rate(container_cpu_usage_seconds_total[5m])
```

**Legend**: `{{container}}`

**Visualization**: Graph/Timeseries

**Y-axis**: CPU Seconds/sec

---

### Memory Usage Panel

**Panel Title**: Memory Usage vs Limit

**Query 1**: Memory used (percent)
```promql
(container_memory_usage_bytes / container_memory_limit_bytes) * 100
```

**Legend**: `{{container}} - Used %`

**Query 2**: Memory limit
```promql
container_memory_limit_bytes / 1024 / 1024 / 1024
```

**Legend**: `{{container}} - Limit (GB)`

**Visualization**: Graph/Timeseries

**Y-axis**: Percentage / GB

---

### HTTP Request Rate Panel

**Panel Title**: HTTP Requests Per Second

**Query**: Request rate
```promql
rate(http_requests_total[1m])
```

**Legend**: `{{method}} {{endpoint}} - {{status}}`

**Visualization**: Graph/Timeseries

**Y-axis**: Requests/sec

---

### HTTP Request Duration Panel

**Panel Title**: HTTP Request Duration

**Query 1**: 95th percentile
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Legend**: `P95`

**Query 2**: 50th percentile (median)
```promql
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))
```

**Legend**: `P50 (Median)`

**Query 3**: Average
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

**Legend**: `Average`

**Visualization**: Graph/Timeseries

**Y-axis**: Duration (seconds)

---

### Active Connections Panel

**Panel Title**: Active HTTP Connections

**Query**: Active connections
```promql
http_active_connections
```

**Visualization**: Gauge / Stat

**Color Mode**: Value

**Thresholds**:
- Green: 0-50
- Yellow: 50-100
- Red: 100+

---

### Electrode Operations Rate Panel

**Panel Title**: Electrode Operations Per Second

**Query**: Operations rate by type
```promql
rate(electrode_operations_total[1m])
```

**Legend**: `{{operation_type}} - {{status}}`

**Visualization**: Graph/Timeseries

**Y-axis**: Operations/sec

---

### Electrode Operation Duration Panel

**Panel Title**: Electrode Operation Duration

**Query**: 95th percentile by operation type
```promql
histogram_quantile(0.95, rate(electrode_operation_duration_seconds_bucket[5m]))
```

**Legend**: `{{operation_type}} - P95`

**Visualization**: Graph/Timeseries

**Y-axis**: Duration (seconds)

---

### Network Traffic Panel

**Panel Title**: Network Traffic

**Query 1**: RX bytes rate
```promql
rate(container_network_receive_bytes_total[1m])
```

**Legend**: `{{container}} RX`

**Query 2**: TX bytes rate
```promql
rate(container_network_transmit_bytes_total[1m])
```

**Legend**: `{{container}} TX`

**Visualization**: Graph/Timeseries

**Y-axis**: Bytes/sec

---

### Filesystem Usage Panel

**Panel Title**: Filesystem Usage

**Query**: FS usage percent
```promql
(container_fs_usage_bytes / container_fs_limit_bytes) * 100
```

**Legend**: `{{container}} @ {{mountpoint}}`

**Visualization**: Graph/Timeseries

**Y-axis**: Percentage

---

### Requests by Status Code Panel

**Panel Title**: Requests by Status Code

**Query**: Total requests by status
```promql
http_requests_total
```

**Legend**: `{{status}} - {{endpoint}}`

**Visualization**: Pie chart / Bar chart

---

### Error Rate Panel

**Panel Title**: HTTP Error Rate

**Query**: Error percentage
```promql
(sum(rate(http_requests_total{status=~"4..|5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100
```

**Legend**: `Error %`

**Visualization**: Gauge / Stat

**Thresholds**:
- Green: 0-1
- Yellow: 1-5
- Red: 5-100

---

### Alternative Error Rate (Simple)

If the above query doesn't work, use this simpler version:

```promql
sum(rate(http_requests_total{status=~"[45].."}[5m]))
```

**Legend**: `Error Rate (req/sec)`

---

## Creating a Complete Dashboard

### Step 1: Create New Dashboard
1. Dashboards → New → New Dashboard

### Step 2: Add Panels
1. Add Panel → Choose visualization type
2. Select Prometheus data source
3. Enter query from above
4. Set legend and display options
5. Save

### Step 3: Dashboard Layout

Suggested layout:

```
┌─────────────────────────────────────────────────────┐
│ CPU Usage           │ Memory Usage      │ Active Conn│
├─────────────────────────────────────────────────────┤
│ HTTP Request Rate              │ HTTP Duration      │
├─────────────────────────────────────────────────────┤
│ Error Rate          │ Status Codes     │ Network TX │
├─────────────────────────────────────────────────────┤
│ Electrode Operations      │ Electrode Duration     │
├─────────────────────────────────────────────────────┤
│ Filesystem Usage              │ Cache Memory       │
└─────────────────────────────────────────────────────┘
```

### Step 4: Set Auto-Refresh
1. Dashboard settings (gear icon)
2. Set refresh interval to 10s or 15s
3. Apply

---

## Advanced Queries

### Request Success Rate (% Success)
```promql
(rate(http_requests_total{status="200"}[5m]) / rate(http_requests_total[5m])) * 100
```

### Top Endpoints by Request Volume
```promql
topk(5, rate(http_requests_total[5m]))
```

### Container CPU vs Memory Correlation
```promql
rate(container_cpu_usage_seconds_total[5m]) * (container_memory_usage_bytes / container_memory_limit_bytes)
```

### Operation Success Ratio
```promql
rate(electrode_operations_total{status="success"}[5m]) / rate(electrode_operations_total[5m])
```

### Network Bytes per Request
```promql
rate(container_network_receive_bytes_total[5m]) / rate(http_requests_total[5m])
```

---

## Dashboard Variables (Optional)

For dynamic dashboards, add variables:

1. **Grafana Dashboard → Settings → Variables**

2. **Variable 1: Container**
   ```
   Name: container
   Type: Query
   Query: label_values(container_cpu_usage_seconds_total, container)
   ```

3. **Variable 2: Endpoint**
   ```
   Name: endpoint
   Type: Query
   Query: label_values(http_requests_total, endpoint)
   ```

4. **Use in queries**:
   ```promql
   rate(http_requests_total{endpoint="$endpoint"}[5m])
   ```

---

## Alerting (Optional)

Set up alerts for:

1. **High CPU**: `rate(container_cpu_usage_seconds_total[5m]) > 0.8`
2. **High Memory**: `container_memory_usage_bytes / container_memory_limit_bytes > 0.85`
3. **High Error Rate**: Error rate > 5%
4. **Slow Requests**: HTTP duration P95 > 2 seconds

---

## Tips for Better Dashboards

1. **Use consistent time ranges** (5m-30m for trending)
2. **Add descriptions** to panels for clarity
3. **Color code** by importance (green/yellow/red)
4. **Use units** (requests/sec, bytes, milliseconds)
5. **Add threshold lines** for SLAs
6. **Use templates** for multi-container dashboards
7. **Set appropriate legend** for readability
8. **Use appropriate visualization** (graph for trends, gauge for current)

---

## Expected Data Patterns

With `./generate-all-demo-data.sh continuous 15`:

- **HTTP Requests**: 0.5-1.5 req/sec per endpoint
- **Request Duration**: 0.05-2 seconds (P95 ~0.5s)
- **Active Connections**: 20-150 active
- **Electrode Operations**: 10-50 ops/sec
- **CPU Usage**: 0.2-0.8 rate/sec (trending up over time)
- **Memory**: 40-80% of container limits
- **Network**: 1-5 MB/sec RX, 0.5-3 MB/sec TX

---

## Troubleshooting

### No Data Showing

1. **Check Prometheus targets**:
   ```
   http://localhost:9090/targets
   ```

2. **Verify demo generators running**:
   ```bash
   ps aux | grep generate-demo-metrics
   ```

3. **Check data in Prometheus**:
   ```
   http://localhost:9090/graph
   ```
   Try these queries to test:
   - `http_requests_total` - should show data
   - `container_cpu_usage_seconds_total` - should show CPU data
   - `container_memory_usage_bytes` - should show memory data

4. **Verify time range** in Grafana:
   - Click time picker (top right)
   - Change to "Last 30 minutes" or "Last 1 hour"
   - Data may take 30-60 seconds to appear

5. **Start fresh data generation**:
   ```bash
   ./generate-all-demo-data.sh continuous 15
   ```

### Query Returns "No data"

**Solution 1: Check if metrics exist in Prometheus**
1. Go to http://localhost:9090/graph
2. Type: `http_requests_total`
3. Click "Execute"
4. If no results, generators are not running

**Solution 2: Wait for data accumulation**
- Counters need at least 2 data points
- Wait 30-60 seconds after starting generator
- Then try the query again

**Solution 3: Use simpler query**
Start with:
```promql
http_requests_total
```
Instead of complex ones with `rate()` or `histogram_quantile()`

### "Parse error" in Query

**Problem**: Query like `Error percentage` returns parse error

**Solution**: 
- Don't use plain text, use proper PromQL
- Use: `http_requests_total` instead of `Error percentage`
- Reference the simple queries section above

### Metrics Are Flat / Not Changing

**Check if generator is running**:
```bash
ps aux | grep generate-demo
```

**If not running, start it**:
```bash
./generate-all-demo-data.sh continuous 15 &
```

**If it says "command not found"**, make sure scripts are executable:
```bash
chmod +x *.sh scripts/*.js
```

### High Values Don't Look Right

**Remember**: 
- Counters only increase (use `rate()` to see per-second)
- Bytes are in raw bytes (Grafana auto-converts, set unit to "Bytes")
- CPU is in seconds (use `rate()` to see per-second)

**Example fixing high values**:
```promql
# Wrong - shows huge numbers
container_cpu_usage_seconds_total

# Right - shows per-second rate
rate(container_cpu_usage_seconds_total[1m])
```

### Still No Data?

1. **Restart everything**:
   ```bash
   docker-compose down
   docker-compose up -d
   sleep 10
   ./generate-all-demo-data.sh continuous 15
   ```

2. **Check container logs**:
   ```bash
   docker-compose logs prometheus
   docker-compose logs grafana
   ```

3. **Verify network connectivity**:
   ```bash
   curl http://localhost:9090
   curl http://localhost:3000
   curl http://localhost:8000/metrics
   ```

---

## Original Troubleshooting

---

## Example JSON Dashboard

Import a pre-built dashboard by:

1. Dashboard → Import
2. Paste the JSON configuration
3. Select Prometheus data source

Or create manually using the queries above.

---

**Last Updated**: April 28, 2026  
**Status**: Ready to use with active demo generators
