#!/bin/bash
echo "Starting DegreeLocker StudyVault AI - Desktop App..."
npm run dev &
SERVER_PID=$!

echo "Waiting for development server to start on port 3000..."
# Fast port polling loop (polls every 100ms)
for i in {1..30}; do
  if command -v nc >/dev/null 2>&1; then
    if nc -z localhost 3000 2>/dev/null; then
      break
    fi
  elif command -v curl >/dev/null 2>&1; then
    if curl -s -I http://localhost:3000 >/dev/null 2>&1; then
      break
    fi
  else
    # Fallback if no polling tool is present
    sleep 1
    break
  fi
  sleep 0.1
done

echo "Opening Standalone Desktop Window..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  open -na "Google Chrome" --args --app="http://localhost:3000"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  google-chrome --app="http://localhost:3000" || chromium --app="http://localhost:3000"
fi
wait $SERVER_PID
