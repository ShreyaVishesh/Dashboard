#!/usr/bin/env python3
"""
Generate realistic cAdvisor-style metrics for Prometheus
Includes container CPU, memory, network, and disk I/O metrics
"""

import requests
import time
import json
import random
import sys
from datetime import datetime, timedelta
import math

# Configuration
PROMETHEUS_URL = "http://localhost:9090"
REMOTE_WRITE_URL = "http://localhost:9009/api/v1/push"  # For remote write if available
METRICS_URL = "http://localhost:8000/api/v1/monitoring/metrics"
CADVISOR_STYLE_URL = "http://localhost:9595/metrics"  # cAdvisor metrics endpoint (if available)

# Container names and IDs
CONTAINERS = [
    {"name": "electrode-app", "id": "abc123def456", "image": "electrode:latest"},
    {"name": "mongodb", "id": "def456ghi789", "image": "mongo:latest"},
    {"name": "prometheus", "id": "ghi789jkl012", "image": "prom/prometheus:latest"},
    {"name": "grafana", "id": "jkl012mno345", "image": "grafana/grafana:latest"},
]

def generate_cpu_metrics():
    """Generate CPU usage metrics for containers"""
    metrics = []
    timestamp = int(time.time() * 1000)
    
    for container in CONTAINERS:
        # Simulate realistic CPU usage patterns
        base_cpu = random.uniform(0.1, 0.5) if container["name"] != "mongodb" else random.uniform(0.3, 0.8)
        cpu_usage = base_cpu + random.uniform(-0.1, 0.2)
        cpu_usage = max(0, min(1, cpu_usage))  # Clamp between 0 and 1
        
        # Convert to nanoseconds (cAdvisor format)
        cpu_ns = cpu_usage * 1e9 * 100  # Simulate accumulated nanoseconds
        
        metrics.append({
            "metric": "container_cpu_usage_seconds_total",
            "labels": {
                "container": container["name"],
                "container_id": container["id"],
                "image": container["image"],
                "pod_name": container["name"],
                "namespace": "default"
            },
            "value": cpu_ns,
            "timestamp": timestamp
        })
        
        # CPU system time
        metrics.append({
            "metric": "container_cpu_system_seconds_total",
            "labels": {
                "container": container["name"],
                "container_id": container["id"],
            },
            "value": cpu_ns * 0.3,
            "timestamp": timestamp
        })
        
        # CPU user time
        metrics.append({
            "metric": "container_cpu_user_seconds_total",
            "labels": {
                "container": container["name"],
                "container_id": container["id"],
            },
            "value": cpu_ns * 0.7,
            "timestamp": timestamp
        })
        
        # CPU load average
        for load_type in [1, 5, 15]:
            metrics.append({
                "metric": "container_load_average",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "interval": str(load_type) + "m"
                },
                "value": random.uniform(0.1, 2.0),
                "timestamp": timestamp
            })
    
    return metrics


def generate_memory_metrics():
    """Generate memory usage metrics"""
    metrics = []
    timestamp = int(time.time() * 1000)
    
    # Memory limits and usage per container
    memory_configs = {
        "electrode-app": {"limit": 512 * 1024 * 1024, "usage": random.uniform(0.3, 0.6)},
        "mongodb": {"limit": 1024 * 1024 * 1024, "usage": random.uniform(0.5, 0.9)},
        "prometheus": {"limit": 512 * 1024 * 1024, "usage": random.uniform(0.4, 0.7)},
        "grafana": {"limit": 256 * 1024 * 1024, "usage": random.uniform(0.3, 0.6)},
    }
    
    for container in CONTAINERS:
        config = memory_configs[container["name"]]
        mem_limit = config["limit"]
        mem_usage = mem_limit * config["usage"]
        
        metrics.append({
            "metric": "container_memory_usage_bytes",
            "labels": {
                "container": container["name"],
                "container_id": container["id"],
                "id": container["id"],
            },
            "value": mem_usage,
            "timestamp": timestamp
        })
        
        metrics.append({
            "metric": "container_memory_max_usage_bytes",
            "labels": {
                "container": container["name"],
                "container_id": container["id"],
            },
            "value": mem_usage * random.uniform(1.0, 1.2),
            "timestamp": timestamp
        })
        
        metrics.append({
            "metric": "container_memory_limit_bytes",
            "labels": {
                "container": container["name"],
                "container_id": container["id"],
            },
            "value": mem_limit,
            "timestamp": timestamp
        })
        
        # Memory cache, swap, rss
        metrics.append({
            "metric": "container_memory_cache_bytes",
            "labels": {
                "container": container["name"],
                "container_id": container["id"],
            },
            "value": mem_usage * 0.2,
            "timestamp": timestamp
        })
        
        metrics.append({
            "metric": "container_memory_rss_bytes",
            "labels": {
                "container": container["name"],
                "container_id": container["id"],
            },
            "value": mem_usage * 0.8,
            "timestamp": timestamp
        })
        
        metrics.append({
            "metric": "container_memory_swap_bytes",
            "labels": {
                "container": container["name"],
                "container_id": container["id"],
            },
            "value": mem_usage * random.uniform(0.0, 0.1),
            "timestamp": timestamp
        })
    
    return metrics


def generate_network_metrics():
    """Generate network I/O metrics"""
    metrics = []
    timestamp = int(time.time() * 1000)
    
    for container in CONTAINERS:
        # Network interface stats
        for interface in ["eth0", "docker0"]:
            # Bytes received
            rx_bytes = random.uniform(1000000, 50000000)
            metrics.append({
                "metric": "container_network_receive_bytes_total",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "interface": interface,
                },
                "value": rx_bytes,
                "timestamp": timestamp
            })
            
            # Packets received
            metrics.append({
                "metric": "container_network_receive_packets_total",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "interface": interface,
                },
                "value": rx_bytes / 1500,  # Average packet size ~1500 bytes
                "timestamp": timestamp
            })
            
            # Bytes transmitted
            tx_bytes = random.uniform(500000, 30000000)
            metrics.append({
                "metric": "container_network_transmit_bytes_total",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "interface": interface,
                },
                "value": tx_bytes,
                "timestamp": timestamp
            })
            
            # Packets transmitted
            metrics.append({
                "metric": "container_network_transmit_packets_total",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "interface": interface,
                },
                "value": tx_bytes / 1500,
                "timestamp": timestamp
            })
            
            # Errors and dropped packets
            metrics.append({
                "metric": "container_network_receive_errors_total",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "interface": interface,
                },
                "value": random.uniform(0, 100),
                "timestamp": timestamp
            })
            
            metrics.append({
                "metric": "container_network_transmit_errors_total",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "interface": interface,
                },
                "value": random.uniform(0, 50),
                "timestamp": timestamp
            })
    
    return metrics


def generate_disk_io_metrics():
    """Generate disk I/O metrics"""
    metrics = []
    timestamp = int(time.time() * 1000)
    
    for container in CONTAINERS:
        # Block device I/O
        for device in ["sda", "sdb"]:
            # Bytes read
            metrics.append({
                "metric": "container_fs_io_current",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "device": device,
                },
                "value": random.uniform(0, 1000),
                "timestamp": timestamp
            })
            
            # Bytes written
            metrics.append({
                "metric": "container_fs_io_time_seconds_total",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "device": device,
                },
                "value": random.uniform(100, 10000),
                "timestamp": timestamp
            })
    
    # Filesystem usage
    for container in CONTAINERS:
        for mount_point in ["/", "/var/lib/docker"]:
            fs_limit = random.uniform(10e9, 100e9)  # 10-100 GB
            fs_usage = fs_limit * random.uniform(0.3, 0.8)
            
            metrics.append({
                "metric": "container_fs_usage_bytes",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "fstype": "ext4",
                    "mountpoint": mount_point,
                },
                "value": fs_usage,
                "timestamp": timestamp
            })
            
            metrics.append({
                "metric": "container_fs_limit_bytes",
                "labels": {
                    "container": container["name"],
                    "container_id": container["id"],
                    "fstype": "ext4",
                    "mountpoint": mount_point,
                },
                "value": fs_limit,
                "timestamp": timestamp
            })
    
    return metrics


def generate_application_metrics():
    """Generate application-specific metrics"""
    metrics = []
    timestamp = int(time.time() * 1000)
    
    # HTTP request metrics
    metrics.append({
        "metric": "http_requests_total",
        "labels": {
            "method": "GET",
            "endpoint": "/api/v1/monitoring/metrics",
            "status": "200"
        },
        "value": random.randint(1000, 10000),
        "timestamp": timestamp
    })
    
    metrics.append({
        "metric": "http_request_duration_seconds_sum",
        "labels": {
            "method": "GET",
            "endpoint": "/api/v1/monitoring/metrics"
        },
        "value": random.uniform(10, 100),
        "timestamp": timestamp
    })
    
    metrics.append({
        "metric": "http_request_duration_seconds_count",
        "labels": {
            "method": "GET",
            "endpoint": "/api/v1/monitoring/metrics"
        },
        "value": random.randint(100, 1000),
        "timestamp": timestamp
    })
    
    # Electrode operations
    for op_type in ["read", "write", "delete"]:
        for status in ["success", "error"]:
            metrics.append({
                "metric": "electrode_operations_total",
                "labels": {
                    "operation_type": op_type,
                    "status": status
                },
                "value": random.randint(100, 5000),
                "timestamp": timestamp
            })
    
    # Active connections
    metrics.append({
        "metric": "http_active_connections",
        "value": random.randint(5, 50),
        "timestamp": timestamp
    })
    
    return metrics


def format_prometheus_metrics(metrics):
    """Convert metrics to Prometheus text format"""
    output = []
    
    for metric in metrics:
        name = metric["metric"]
        labels = metric.get("labels", {})
        value = metric["value"]
        timestamp = metric.get("timestamp", int(time.time() * 1000))
        
        # Format labels
        label_str = ""
        if labels:
            label_pairs = [f'{k}="{v}"' for k, v in labels.items()]
            label_str = "{" + ",".join(label_pairs) + "}"
        
        # Format metric line
        output.append(f"{name}{label_str} {value} {timestamp}")
    
    return "\n".join(output)


def send_metrics_via_http(metrics_text):
    """Send metrics to the application's metrics endpoint"""
    try:
        # Try sending via custom endpoint
        headers = {"Content-Type": "text/plain"}
        response = requests.post(
            "http://localhost:8000/api/v1/monitoring/custom-metrics",
            data=metrics_text,
            headers=headers,
            timeout=5
        )
        print(f"✓ Sent metrics to custom endpoint: {response.status_code}")
        return True
    except Exception as e:
        print(f"✗ Could not send to custom endpoint: {e}")
        return False


def inject_prometheus_metrics(metrics):
    """Write metrics directly if Prometheus remote write is available"""
    try:
        headers = {"Content-Type": "application/x-protobuf"}
        # This would require proper protocol buffer encoding
        # For now, just try to POST the JSON
        response = requests.post(
            "http://localhost:9009/api/v1/write",
            json=metrics,
            timeout=5
        )
        print(f"✓ Injected metrics to Prometheus: {response.status_code}")
        return True
    except Exception as e:
        print(f"✗ Could not inject to Prometheus: {e}")
        return False


def main():
    """Main function to generate and send demo metrics"""
    print("🚀 Generating cAdvisor-style demo metrics...")
    print(f"   Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Generate all metrics
    print("\n📊 Generating metrics...")
    all_metrics = []
    all_metrics.extend(generate_cpu_metrics())
    all_metrics.extend(generate_memory_metrics())
    all_metrics.extend(generate_network_metrics())
    all_metrics.extend(generate_disk_io_metrics())
    all_metrics.extend(generate_application_metrics())
    
    print(f"   ✓ Generated {len(all_metrics)} metrics")
    
    # Format for Prometheus
    prometheus_text = format_prometheus_metrics(all_metrics)
    
    # Save to file
    with open("/Users/shreyavishesh/Desktop/explore/logs/demo-metrics.txt", "w") as f:
        f.write(prometheus_text)
    print(f"   ✓ Saved {len(all_metrics)} metrics to logs/demo-metrics.txt")
    
    # Try to send metrics
    print("\n📡 Sending metrics...")
    
    # Method 1: Try custom endpoint
    send_metrics_via_http(prometheus_text)
    
    # Method 2: Try Prometheus remote write
    inject_prometheus_metrics(all_metrics)
    
    print("\n✅ Demo metrics generation complete!")
    print("\n📈 Metric samples:")
    print(prometheus_text.split('\n')[:10])
    
    return all_metrics


if __name__ == "__main__":
    main()
