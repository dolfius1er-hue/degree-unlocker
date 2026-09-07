#!/bin/bash
echo "========================================================"
echo "  DegreeUnlocker - Desktop Application (Tauri 1.5)"
echo "========================================================"
echo ""

if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances npm..."
  npm install
fi

echo "Lancement de DegreeUnlocker via Tauri..."
npm run tauri:dev
