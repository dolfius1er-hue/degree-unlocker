@echo off
title DegreeUnlocker Academy - Standalone Desktop App
echo Starting DegreeUnlocker Desktop App...
start /b npm run dev

echo Waiting for development server on port 3000...
:wait_loop
curl -s -I http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
  timeout /t 1 /nobreak > nul
  goto wait_loop
)

echo Opening Standalone Desktop Window...
start msedge --app=http://localhost:3000 || start chrome --app=http://localhost:3000
echo DegreeUnlocker Academy is running as a desktop window!
pause
