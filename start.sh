#!/bin/bash
set -e

# BiteLog All-in-One Local Launch Script
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "🌱 Starting BiteLog — Log every bite. Stay on track. Achieve your goal."
echo "=========================================================="

# 1. Start Python FastAPI Backend
PORT="${PORT:-8001}"
echo "Starting local FastAPI backend on http://127.0.0.1:$PORT..."
cd "$ROOT_DIR/Backend"
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    venv/bin/pip install -r requirements.txt
fi

venv/bin/python3 -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT" &
BACKEND_PID=$!

trap "kill $BACKEND_PID 2>/dev/null || true" EXIT

# 2. Wait for backend to be ready
echo "Waiting for backend health check..."
for i in {1..10}; do
    if curl -s "http://127.0.0.1:$PORT/api/health" >/dev/null; then
        echo "✓ Backend is healthy and running offline on port $PORT."
        break
    fi
    sleep 1
done

# 3. Start Frontend
echo "Starting Vite React frontend..."
cd "$ROOT_DIR/Frontend"
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "Opening http://localhost:5173..."
npm run dev

