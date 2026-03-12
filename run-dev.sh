#!/bin/bash
# Script untuk menjalankan kedua server (API + Web) di luar sandbox environment

# Dapatkan direktori script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Jalankan API server di background
echo "Starting API server on http://127.0.0.1:8787..."
cd "$SCRIPT_DIR/apps/api"
node dist/server/index.js &
API_PID=$!

# Tunggu sebentar untuk API startup
sleep 2

# Jalankan Web app
echo "Starting Web app on http://localhost:6363..."
cd "$SCRIPT_DIR/apps/web"
pnpm dev &
WEB_PID=$!

echo ""
echo "✅ Both servers are running:"
echo "   API:  http://127.0.0.1:8787"
echo "   Web:  http://localhost:6363"
echo ""
echo "Press Ctrl+C to stop both servers"

# Handle Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $API_PID $WEB_PID; exit" INT

# Tunggu kedua process
wait
