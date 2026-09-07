@echo off
title DegreeUnlocker Desktop (Tauri)
echo ========================================================
echo   DegreeUnlocker - Windows Desktop Application (Tauri)
echo ========================================================
echo.
echo Verification des dependances...
if not exist node_modules (
  echo Installation des dependances npm...
  call npm install
)

echo Lancement du serveur et de la fenetre native Tauri Desktop...
echo (Taille de fenetre: 1280x800, Frame Windows 11 Fluent)
echo.
call npm run tauri:dev
pause
