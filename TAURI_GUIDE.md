# Guide d'Exécution & Compilation Desktop Tauri — DegreeUnlocker

DegreeUnlocker est désormais équipé pour s'exécuter comme une **application native de bureau (PC Windows, macOS, Linux)** grâce à **Tauri 1.5** et au composant `DesktopLayoutWrapper` (style Windows 11 Fluent).

---

## 1. Prérequis sur votre PC
Pour exécuter ou compiler Tauri en local sur votre ordinateur :
1. **Node.js (v18+)** : [https://nodejs.org/](https://nodejs.org/)
2. **Rust & Cargo** : Téléchargeable en 1 minute sur [https://rustup.rs/](https://rustup.rs/)
3. **Sur Windows** : Les outils de compilation C++ (C++ Build Tools de Visual Studio ou WebView2, généralement déjà installé sous Windows 10/11).

---

## 2. Lancement en Mode Développement (1 Clic)

### Sous Windows :
Double-cliquez simplement sur le fichier à la racine :
```bash
run-tauri.bat
```
ou dans un terminal PowerShell / CMD :
```bash
npm run tauri:dev
```

### Sous macOS / Linux :
```bash
chmod +x run-tauri.sh
./run-tauri.sh
```

---

## 3. Génération de l'Installateur Exécutable (.msi / .exe)

Pour produire l'exécutable et le paquet d'installation pour vos utilisateurs ou pour votre propre PC :

```bash
npm run tauri:build
```
Les fichiers d'installation générés se trouveront automatiquement dans :
- **Windows** : `src-tauri/target/release/bundle/msi/DegreeUnlocker_1.0.0_x64_en-US.msi`
- **Exécutable portable** : `src-tauri/target/release/degreeunlocker.exe`

---

## 4. Fonctionnalités Desktop Intégrées

- **Fenêtrage Windows 11 Fluent (`DesktopLayoutWrapper`)** :
  - Détection automatique des écrans larges (>= 1024px) avec cadre bordé `win11-window`.
  - Boutons de contrôle natifs dans l'en-tête :
    - **Réduire (`-`)** : minimise la fenêtre vers la barre des tâches.
    - **Agrandir / Restaurer (`□`)** : bascule entre le mode fenêtré 1280x800 et le mode plein écran.
    - **Fermer (`✕`)** : fermeture de la fenêtre avec mise en surbrillance rouge Windows.
  - Barre de titre avec zone déplaçable (`data-tauri-drag-region`).
  - Bascule rapide entre mode fenêtré et plein écran bord-à-bord via le bouton *Fenêtré/Plein écran*.

- **Permissions du Système de Fichiers (`tauri.conf.json`)** :
  - Accès complet au système de fichiers pour l'ingestion de documents de cours (PDF, Word, Excel, Markdown, TXT).
  - Boîtes de dialogue système natives (`dialog`) pour l'ouverture et l'enregistrement de fichiers.
  - Notifications système natives (`notification`) pour les rappels de révision espacée SRS.
  - Copier-coller système étendu (`clipboard`).
