#!/bin/bash

# Quick reference for Grafana queries with demo data generators
# Use this guide to avoid parse errors and get real data on dashboards

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════╗
║   Grafana Dashboard Setup - Quick Reference Guide                 ║
╚════════════════════════════════════════════════════════════════════╝

🎯 MOST COMMON ISSUE: Parse Errors
═══════════════════════════════════════════════════════════════════

❌ WRONG (Causes parse error):
   Metric: Error percentage
   Query field: Error percentage

✅ RIGHT (Works):
   Query field: http_requests_total

The key difference: You must use VALID PromQL METRIC NAMES, not plain text!

═══════════════════════════════════════════════════════════════════

📋 VALID METRIC NAMES (From Demo Generator)
═══════════════════════════════════════════════════════════════════

These metric names will work in Prometheus/Grafana:

Container Metrics:
  • container_cpu_usage_seconds_total
  • container_memory_usage_bytes
  • container_memory_limit_bytes
  • container_memory_cache_bytes
  • container_network_receive_bytes_total
  • container_network_transmit_bytes_total
  • container_network_receive_packets_total
  • container_network_transmit_packets_total
  • container_network_receive_errors_total
  • container_network_transmit_errors_total
  • container_fs_usage_bytes
  • container_fs_limit_bytes

Application Metrics:
  • http_requests_total
  • http_request_duration_seconds
  • http_active_connections
  • electrode_operations_total
  • electrode_operation_duration_seconds

═══════════════════════════════════════════════════════════════════

🔧 COPY-PASTE READY QUERIES
═══════════════════════════════════════════════════════════════════

Just copy and paste these directly into Grafana query field:

1. TOTAL HTTP REQUESTS (Shows growth over time)
   http_requests_total

2. HTTP REQUEST RATE (Requests per second)
   sum(rate(http_requests_total[1m]))

3. ACTIVE CONNECTIONS (Current count)
   http_active_connections

4. CPU USAGE (Per container)
   rate(container_cpu_usage_seconds_total[1m])

5. MEMORY USAGE (In bytes)
   container_memory_usage_bytes

6. MEMORY USAGE (As percentage of limit)
   (container_memory_usage_bytes / container_memory_limit_bytes) * 100

7. NETWORK RX (Bytes per second)
   rate(container_network_receive_bytes_total[1m])

8. NETWORK TX (Bytes per second)
   rate(container_network_transmit_bytes_total[1m])

9. REQUEST DURATION AVERAGE (Seconds)
   rate(http_request_duration_seconds_sum[1m]) / rate(http_request_duration_seconds_count[1m])

10. REQUEST DURATION P95 (95th percentile)
    histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

11. ELECTRODE OPERATIONS (Per operation type)
    electrode_operations_total

12. ELECTRODE OPERATION DURATION P95
    histogram_quantile(0.95, rate(electrode_operation_duration_seconds_bucket[5m]))

═══════════════════════════════════════════════════════════════════

⚙️ HOW TO FIX PARSE ERROR IN GRAFANA
═══════════════════════════════════════════════════════════════════

If you see:
  "parse error: unexpected identifier"
  
This means you didn't use a valid metric name.

SOLUTION:
1. Clear the query field completely
2. Type one of the metric names above (from VALID METRIC NAMES section)
3. Don't type descriptions like "Error percentage"
4. Do type actual metrics like "http_requests_total"

Example fix:

❌ Before (Error):
   Query field: Error percentage
   Error: parse error: unexpected identifier "percentage"

✅ After (Works):
   Query field: http_requests_total
   Result: Shows metric data

═══════════════════════════════════════════════════════════════════

🚀 STEP BY STEP: Create First Working Dashboard
═══════════════════════════════════════════════════════════════════

1. START DEMO DATA GENERATOR
   $ ./generate-all-demo-data.sh continuous 15
   Wait 30-60 seconds for data to accumulate

2. OPEN GRAFANA
   Go to: http://localhost:3000
   Login: admin / admin

3. ADD PROMETHEUS DATA SOURCE
   • Click: Configuration (gear icon) → Data Sources
   • Click: New Data Source
   • Choose: Prometheus
   • URL: http://prometheus:9090
   • Click: Save & Test
   • Verify: "Data source is working"

4. CREATE NEW DASHBOARD
   • Click: Create (plus icon) → Dashboard
   • Click: Add Panel

5. ADD YOUR FIRST QUERY
   • Data Source: Prometheus
   • Query: http_requests_total
   • Visualization: Graph or Stat (your choice)
   • Panel Title: "Total HTTP Requests"
   • Click: Apply

6. SAVE DASHBOARD
   • Click: Save (Ctrl+S)
   • Name: "Demo Dashboard"
   • Click: Save

🎉 SUCCESS! You now see real metrics from the demo generators!

═══════════════════════════════════════════════════════════════════

📊 WHAT DATA YOU'LL SEE (Expected Values)
═══════════════════════════════════════════════════════════════════

HTTP Metrics:
  • Request Rate: 0.5 - 2 requests/sec
  • Active Connections: 20 - 150 connections
  • Request Duration (Average): 0.1 - 2 seconds
  • Request Duration (P95): 0.3 - 5 seconds

Container Metrics:
  • CPU: 0.1 - 0.8 seconds/sec (depending on container)
  • Memory: 300 - 900 MB (depending on container)
  • Memory %: 30 - 80% of limit

Network Metrics:
  • Network RX: 1 - 50 MB/sec
  • Network TX: 0.5 - 30 MB/sec

Operations:
  • Electrode Operations: 100 - 5000+ total (constantly growing)
  • Operation Duration P95: 0.1 - 10 seconds

═══════════════════════════════════════════════════════════════════

🔍 VERIFY DATA EXISTS IN PROMETHEUS
═══════════════════════════════════════════════════════════════════

1. Open Prometheus: http://localhost:9090

2. Click "Graph" tab

3. In query field, type: http_requests_total

4. Click "Execute"

5. If you see results, data is being generated correctly
   If you see "No data", generators may not be running

═══════════════════════════════════════════════════════════════════

⚡ QUICK TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════

Problem: Parse error in Grafana query
Solution: Use a valid metric name from the VALID METRIC NAMES section

Problem: "No data" in Grafana
Solution: 
  1. Verify generators running: ps aux | grep generate-demo
  2. Check Prometheus: http://localhost:9090
  3. Wait 60 seconds for data accumulation
  4. Check time range (set to Last 1 hour)

Problem: Values look wrong or too high
Solution:
  • Counters only increase - use rate() to see per-second
  • Bytes are raw - Grafana auto-converts, set unit to "Bytes"
  • CPU is seconds - use rate() to see CPU per second

Problem: Generators not running
Solution:
  $ ./generate-all-demo-data.sh continuous 15

═══════════════════════════════════════════════════════════════════

💡 RECOMMENDED DASHBOARD LAYOUT
═══════════════════════════════════════════════════════════════════

Create these panels in order:

Row 1 (System Metrics):
  □ Total HTTP Requests (http_requests_total)
  □ Request Rate (sum(rate(http_requests_total[1m])))
  □ Active Connections (http_active_connections)

Row 2 (Performance):
  □ CPU Usage (rate(container_cpu_usage_seconds_total[1m]))
  □ Memory Usage (container_memory_usage_bytes)
  □ Memory % (container_memory_usage_bytes/limit*100)

Row 3 (Network):
  □ Network RX (rate(container_network_receive_bytes_total[1m]))
  □ Network TX (rate(container_network_transmit_bytes_total[1m]))
  □ Request Duration P95 (histogram_quantile(0.95,...))

═══════════════════════════════════════════════════════════════════

📚 WHERE TO FIND METRIC NAMES
═══════════════════════════════════════════════════════════════════

If you forget a metric name:

1. In Prometheus (http://localhost:9090):
   • Click "Metrics" or start typing in query field
   • Auto-complete will show available metrics
   • All start with: container_, http_, electrode_

2. In README-DEMO-DATA.md:
   • Section: "What Gets Generated"
   • Lists all metric names

═══════════════════════════════════════════════════════════════════

✅ YOU'RE READY!
═══════════════════════════════════════════════════════════════════

Now you can:
1. Create beautiful dashboards with real data
2. Monitor your application metrics
3. Set up alerts based on thresholds
4. Share dashboards with your team

All the data is automatically generated and updated every 15 seconds!

════════════════════════════════════════════════════════════════════

EOF
