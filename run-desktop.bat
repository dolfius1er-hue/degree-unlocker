@echo off
title DegreeLocker StudyVault AI - Desktop App
echo Starting DegreeLocker Desktop App...
start /b npm run dev
timeout /t 3 /nobreak > nul
echo Opening Standalone Desktop Window...
start chrome --app=http://localhost:3000
echo DegreeLocker is running as a native desktop application!
pause
