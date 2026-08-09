#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod fs_manager;
mod models;
mod repositories;
mod services;
mod utils;

use db::{AppState, DatabaseManager};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let config = app.config().clone();
            let db = DatabaseManager::new(&config)
                .expect("Failed to initialize database");

            app.manage(AppState { db });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::login,
            commands::get_current_user,
            commands::get_all_users,
            commands::get_roles,
            commands::get_dashboard_stats,
            commands::get_seasons,
            commands::get_season,
            commands::create_season,
            commands::update_season,
            commands::archive_season,
            commands::delete_season,
            commands::get_categories,
            commands::get_category,
            commands::create_category,
            commands::update_category,
            commands::delete_category,
            commands::get_products,
            commands::get_product,
            commands::create_product,
            commands::update_product,
            commands::delete_product,
            commands::get_services,
            commands::get_service,
            commands::create_service,
            commands::update_service,
            commands::delete_service,
            commands::get_templates,
            commands::get_template,
            commands::create_template,
            commands::update_template,
            commands::delete_template,
            commands::toggle_favorite,
            commands::archive_template,
            commands::get_template_versions,
            commands::add_template_version,
            commands::get_machines,
            commands::get_machine,
            commands::create_machine,
            commands::update_machine,
            commands::delete_machine,
            commands::get_materials,
            commands::get_material,
            commands::create_material,
            commands::update_material,
            commands::delete_material,
            commands::get_production_guides,
            commands::get_production_guide,
            commands::create_production_guide,
            commands::update_production_guide,
            commands::delete_production_guide,
            commands::get_favorites,
            commands::add_favorite,
            commands::remove_favorite,
            commands::global_search,
            commands::search_by_tag,
            commands::get_settings,
            commands::get_setting,
            commands::update_setting,
            commands::create_backup,
            commands::get_backups,
            commands::restore_backup,
            commands::delete_backup,
            commands::scan_directory,
            commands::get_storage_info,
            commands::open_folder,
            commands::open_photoshop,
            commands::get_photoshop_path,
            commands::set_photoshop_path,
            commands::delete_file,
            commands::check_file_integrity,
            commands::get_activity_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
