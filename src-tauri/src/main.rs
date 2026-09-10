// Empêche l'apparition d'une console d'invite de commande sur Windows en mode release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

/// Commande native Tauri : confirme le mode autonome hors-ligne
#[tauri::command]
fn check_offline_mode() -> Result<String, String> {
    Ok("DegreeUnlocker fonctionne en mode natif autonome 100% hors-ligne (WebView locale sans barre d'outils navigateur).".into())
}

/// Commande native Tauri : retourne la version embarquée de l'application
#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

fn main() {
    tauri::Builder::default()
        // Enregistrement des commandes natives utilisables par le frontend via @tauri-apps/api
        .invoke_handler(tauri::generate_handler![
            check_offline_mode,
            get_app_version
        ])
        .setup(|app| {
            // Configuration de la fenêtre principale en mode fenêtré autonome
            if let Some(main_window) = app.get_window("main") {
                // Décorations fenêtrées système natives (fermer, agrandir, réduire)
                // Sans aucune barre d'outils de navigateur Web ni barre d'adresse
                let _ = main_window.set_decorations(true);
                let _ = main_window.set_resizable(true);
                let _ = main_window.center();

                // Affichage propre et focus direct sur l'application
                let _ = main_window.show();
                let _ = main_window.set_focus();
            }
            Ok(())
        })
        // Injection du contexte généré à partir de tauri.conf.json
        // Embarque les assets locaux du dossier dist sans dépendance à une connexion internet
        .run(tauri::generate_context!())
        .expect("Erreur lors de l'exécution de l'application DegreeUnlocker");
}
