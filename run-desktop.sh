#!/bin/bash
echo "Starting DegreeLocker StudyVault AI - Desktop App..."
npm run dev &
SERVER_PID=$!
sleep 3
echo "Opening Standalone Desktop Window..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  open -na "Google Chrome" --args --app="http://localhost:3000"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  google-chrome --app="http://localhost:3000" || chromium --app="http://localhost:3000"
fi
wait $SERVER_PID
