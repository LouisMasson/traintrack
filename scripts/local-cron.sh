#!/bin/bash

# Local cron script to collect train data every minute
# Usage: ./scripts/local-cron.sh

CRON_SECRET="8ad049b8c7ae020ca7242751faee428ae31af3ce0af6135d5636efce79a828f7"
API_URL="http://localhost:3000/api/cron/collect-trains"

echo "Starting local train data collection (every 60 seconds)"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  TIMESTAMP=$(date '+%H:%M:%S')
  RESPONSE=$(curl -s -H "Authorization: Bearer $CRON_SECRET" "$API_URL")
  COUNT=$(echo "$RESPONSE" | jq -r '.count // "error"')

  if [ "$COUNT" != "error" ]; then
    echo "[$TIMESTAMP] Collected $COUNT trains"
  else
    echo "[$TIMESTAMP] Error: $RESPONSE"
  fi

  sleep 60
done
