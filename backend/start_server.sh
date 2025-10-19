#!/bin/bash

echo "🚀 Starting Flask Server"
echo "========================"

# Kill any existing Flask processes
echo "Checking for existing Flask processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null && echo "✓ Killed existing process" || echo "✓ No existing process"

# Start Flask
echo ""
echo "Starting Flask on http://localhost:5000"
echo "Press Ctrl+C to stop"
echo ""

python app.py

