#!/bin/bash
# Script untuk menjalankan API server di luar sandbox environment

cd "$(dirname "$0")/apps/api"
echo "Starting API server on http://127.0.0.1:3000..."
node dist/server/index.js
