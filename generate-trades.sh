#!/bin/bash

for i in {1..20}; do
  if [ $((i % 2)) -eq 0 ]; then
    type="buy"
  else
    type="sell"
  fi
  curl -s -X POST http://localhost:8000/api/v1/trade \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"$type\"}" > /dev/null
  sleep 0.1
done

echo "✅ Generated 20 trade operations"
