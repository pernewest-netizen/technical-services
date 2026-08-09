use tauri::State;
use crate::db::AppState;
use crate::models::*;
use crate::repositories::*;
use crate::fs_manager::FileManager;
use std::path::PathBuf;

// ============================================
// AUTH COMMANDS
// ============================================
#[tauri::command]
pub async fn login(state: State<'_, AppState>, req: LoginRequest) -> Result<LoginResponse, String> {
    let auth_service = crate::services::AuthService::new();
    auth_service.login(&state.db, req)
}

#[tauri::command]
pub async fn get_current_user(state: State<'_, AppState>, user_id: i64) -> Result<Option<UserWithRole>, String> {
    let auth_service = crate::services::AuthService::new();
    auth_service.get_current_user(&state.db, user_id)
}

#[tauri::command]
pub async fn get_all_users(state: State<'_, AppState>) -> Result<Vec<UserWithRole>, String> {
    let auth_service = crate::services::AuthService::new();
    auth_service.get_all_users(&state.db)
}

#[tauri::command]
pub async fn get_roles(state: State<'_, AppState>) -> Result<Vec<Role>, String> {
    let auth_service = crate::services::AuthService::new();
    auth_service.get_roles(&state.db)
}

// ============================================
// DASHBOARD COMMANDS
// ============================================
#[tauri::command]
pub async fn get_dashboard_stats(state: State<'_, AppState>) -> Result<DashboardStats, String> {
    let service = crate::services::DashboardService::new();
    service.get_stats(&state.db)
}

// ============================================
// SEASON COMMANDS
// ============================================
#[tauri::command]
pub async fn get_seasons(state: State<'_, AppState>, include_archived: Option<bool>) -> Result<Vec<Season>, String> {
    let repo = SeasonRepository::new();
    let conn = state.db.get_connection();
    repo.find_all(&conn, include_archived.unwrap_or(false)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_season(state: State<'_, AppState>, id: i64) -> Result<Option<Season>, String> {
    let repo = SeasonRepository::new();
    let conn = state.db.get_connection();
    repo.find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_season(state: State<'_, AppState>, req: CreateSeasonRequest) -> Result<i64, String> {
    let repo = SeasonRepository::new();
    let conn = state.db.get_connection();
    repo.create(&conn, &req).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_season(state: State<'_, AppState>, id: i64, req: CreateSeasonRequest) -> Result<bool, String> {
    let repo = SeasonRepository::new();
    let conn = state.db.get_connection();
    repo.update(&conn, id, &req).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn archive_season(state: State<'_, AppState>, id: i64, archive: bool) -> Result<bool, String> {
    let repo = SeasonRepository::new();
    let conn = state.db.get_connection();
    repo.archive(&conn, id, archive).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_season(state: State<'_, AppState>, id: i64) -> Result<bool, String> {
    let repo = SeasonRepository::new();
    let conn = state.db.get_connection();
    repo.delete(&conn, id).map_err(|e| e.to_string())
}

// ============================================
// CATEGORY COMMANDS
// ============================================
#[tauri::command]
pub async fn get_categories(state: State<'_, AppState>) -> Result<Vec<Category>, String> {
    let repo = CategoryRepository::new();
    let conn = state.db.get_connection();
    repo.find_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_category(state: State<'_, AppState>, id: i64) -> Result<Option<Category>, String> {
    let repo = CategoryRepository::new();
    let conn = state.db.get_connection();
    repo.find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_category(state: State<'_, AppState>, name: String, display_name: String,
    description: Option<String>, icon: Option<String>, color: Option<String>, parent_id: Option<i64>) -> Result<i64, String> {
    let repo = CategoryRepository::new();
    let conn = state.db.get_connection();
    repo.create(&conn, &name, &display_name, description.as_deref(), icon.as_deref(), color.as_deref(), parent_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_category(state: State<'_, AppState>, id: i64, display_name: String,
    description: Option<String>, icon: Option<String>, color: Option<String>, sort_order: Option<i64>) -> Result<bool, String> {
    let repo = CategoryRepository::new();
    let conn = state.db.get_connection();
    repo.update(&conn, id, &display_name, description.as_deref(), icon.as_deref(), color.as_deref(), sort_order)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_category(state: State<'_, AppState>, id: i64) -> Result<bool, String> {
    let repo = CategoryRepository::new();
    let conn = state.db.get_connection();
    repo.delete(&conn, id).map_err(|e| e.to_string())
}

// ============================================
// PRODUCT COMMANDS
// ============================================
#[tauri::command]
pub async fn get_products(state: State<'_, AppState>, category_id: Option<i64>,
    season_id: Option<i64>, search: Option<String>, limit: Option<i64>, offset: Option<i64>) -> Result<Vec<Product>, String> {
    let repo = ProductRepository::new();
    let conn = state.db.get_connection();
    repo.find_all(&conn, category_id, season_id, search.as_deref(), limit.unwrap_or(50), offset.unwrap_or(0))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_product(state: State<'_, AppState>, id: i64) -> Result<Option<Product>, String> {
    let repo = ProductRepository::new();
    let conn = state.db.get_connection();
    repo.find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_product(state: State<'_, AppState>, req: CreateProductRequest) -> Result<i64, String> {
    let repo = ProductRepository::new();
    let conn = state.db.get_connection();
    repo.create(&conn, &req).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_product(state: State<'_, AppState>, id: i64, req: CreateProductRequest) -> Result<bool, String> {
    let repo = ProductRepository::new();
    let conn = state.db.get_connection();
    repo.update(&conn, id, &req).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_product(state: State<'_, AppState>, id: i64) -> Result<bool, String> {
    let repo = ProductRepository::new();
    let conn = state.db.get_connection();
    repo.delete(&conn, id).map_err(|e| e.to_string())
}

// ============================================
// SERVICE COMMANDS
// ============================================
#[tauri::command]
pub async fn get_services(state: State<'_, AppState>) -> Result<Vec<Service>, String> {
    let repo = ServiceRepository::new();
    let conn = state.db.get_connection();
    repo.find_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_service(state: State<'_, AppState>, id: i64) -> Result<Option<Service>, String> {
    let repo = ServiceRepository::new();
    let conn = state.db.get_connection();
    repo.find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_service(state: State<'_, AppState>, name: String, display_name: String,
    description: Option<String>, category_id: Option<i64>) -> Result<i64, String> {
    let repo = ServiceRepository::new();
    let conn = state.db.get_connection();
    repo.create(&conn, &name, &display_name, description.as_deref(), category_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_service(state: State<'_, AppState>, id: i64, display_name: String,
    description: Option<String>, category_id: Option<i64>) -> Result<bool, String> {
    let repo = ServiceRepository::new();
    let conn = state.db.get_connection();
    repo.update(&conn, id, &display_name, description.as_deref(), category_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_service(state: State<'_, AppState>, id: i64) -> Result<bool, String> {
    let repo = ServiceRepository::new();
    let conn = state.db.get_connection();
    repo.delete(&conn, id).map_err(|e| e.to_string())
}

// ============================================
// TEMPLATE COMMANDS
// ============================================
#[tauri::command]
pub async fn get_templates(state: State<'_, AppState>, season_id: Option<i64>, category_id: Option<i64>,
    product_id: Option<i64>, material_id: Option<i64>, search: Option<String>, is_favorite: Option<bool>,
    is_archived: Option<bool>, limit: Option<i64>, offset: Option<i64>) -> Result<Vec<Template>, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    repo.find_all(&conn, season_id, category_id, product_id, material_id, search.as_deref(),
        is_favorite, is_archived, limit.unwrap_or(50), offset.unwrap_or(0)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_template(state: State<'_, AppState>, id: i64) -> Result<Option<Template>, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    repo.find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_template(state: State<'_, AppState>, req: CreateTemplateRequest, user_id: i64) -> Result<i64, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    let id = repo.create(&conn, &req, user_id).map_err(|e| e.to_string())?;
    let _ = conn.execute(
        "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, entity_code, details)
         VALUES (?1, 'CREATE', 'template', ?2, ?3, 'Template created')",
        rusqlite::params![user_id, id, req.code],
    );
    Ok(id)
}

#[tauri::command]
pub async fn update_template(state: State<'_, AppState>, id: i64, req: CreateTemplateRequest, user_id: i64) -> Result<bool, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    let result = repo.update(&conn, id, &req).map_err(|e| e.to_string())?;
    if result {
        let _ = conn.execute(
            "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
             VALUES (?1, 'UPDATE', 'template', ?2, 'Template updated')",
            rusqlite::params![user_id, id],
        );
    }
    Ok(result)
}

#[tauri::command]
pub async fn delete_template(state: State<'_, AppState>, id: i64, user_id: i64) -> Result<bool, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    let result = repo.delete(&conn, id).map_err(|e| e.to_string())?;
    if result {
        let _ = conn.execute(
            "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
             VALUES (?1, 'DELETE', 'template', ?2, 'Template deleted')",
            rusqlite::params![user_id, id],
        );
    }
    Ok(result)
}

#[tauri::command]
pub async fn toggle_favorite(state: State<'_, AppState>, id: i64) -> Result<bool, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    repo.toggle_favorite(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn archive_template(state: State<'_, AppState>, id: i64, archive: bool) -> Result<bool, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    repo.archive(&conn, id, archive).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_template_versions(state: State<'_, AppState>, template_id: i64) -> Result<Vec<TemplateVersion>, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    repo.get_versions(&conn, template_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_template_version(state: State<'_, AppState>, template_id: i64,
    change_notes: Option<String>, user_id: i64) -> Result<i64, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    repo.add_version(&conn, template_id, change_notes.as_deref(), user_id).map_err(|e| e.to_string())
}

// ============================================
// MACHINE COMMANDS
// ============================================
#[tauri::command]
pub async fn get_machines(state: State<'_, AppState>) -> Result<Vec<Machine>, String> {
    let repo = MachineRepository::new();
    let conn = state.db.get_connection();
    repo.find_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_machine(state: State<'_, AppState>, id: i64) -> Result<Option<Machine>, String> {
    let repo = MachineRepository::new();
    let conn = state.db.get_connection();
    repo.find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_machine(state: State<'_, AppState>, name: String, display_name: String,
    machine_type: String, brand: Option<String>, model: Option<String>,
    power: Option<String>, work_area: Option<String>, notes: Option<String>) -> Result<i64, String> {
    let conn = state.db.get_connection();
    conn.execute(
        "INSERT INTO machines (name, display_name, machine_type, brand, model, power, work_area, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![name, display_name, machine_type, brand, model, power, work_area, notes],
    ).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub async fn update_machine(state: State<'_, AppState>, id: i64, display_name: String,
    machine_type: String, brand: Option<String>, model: Option<String>,
    power: Option<String>, work_area: Option<String>, notes: Option<String>) -> Result<bool, String> {
    let conn = state.db.get_connection();
    let rows = conn.execute(
        "UPDATE machines SET display_name = ?1, machine_type = ?2, brand = ?3, model = ?4,
         power = ?5, work_area = ?6, notes = ?7, updated_at = CURRENT_TIMESTAMP WHERE id = ?8",
        rusqlite::params![display_name, machine_type, brand, model, power, work_area, notes, id],
    ).map_err(|e| e.to_string())?;
    Ok(rows > 0)
}

#[tauri::command]
pub async fn delete_machine(state: State<'_, AppState>, id: i64) -> Result<bool, String> {
    let conn = state.db.get_connection();
    let rows = conn.execute("DELETE FROM machines WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(rows > 0)
}

// ============================================
// MATERIAL COMMANDS
// ============================================
#[tauri::command]
pub async fn get_materials(state: State<'_, AppState>) -> Result<Vec<Material>, String> {
    let repo = MaterialRepository::new();
    let conn = state.db.get_connection();
    repo.find_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_material(state: State<'_, AppState>, id: i64) -> Result<Option<Material>, String> {
    let repo = MaterialRepository::new();
    let conn = state.db.get_connection();
    repo.find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_material(state: State<'_, AppState>, name: String, display_name: String,
    material_type: String, thickness: Option<String>, size: Option<String>,
    color: Option<String>, notes: Option<String>) -> Result<i64, String> {
    let conn = state.db.get_connection();
    conn.execute(
        "INSERT INTO materials (name, display_name, material_type, thickness, size, color, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![name, display_name, material_type, thickness, size, color, notes],
    ).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub async fn update_material(state: State<'_, AppState>, id: i64, display_name: String,
    material_type: String, thickness: Option<String>, size: Option<String>,
    color: Option<String>, notes: Option<String>) -> Result<bool, String> {
    let conn = state.db.get_connection();
    let rows = conn.execute(
        "UPDATE materials SET display_name = ?1, material_type = ?2, thickness = ?3,
         size = ?4, color = ?5, notes = ?6, updated_at = CURRENT_TIMESTAMP WHERE id = ?7",
        rusqlite::params![display_name, material_type, thickness, size, color, notes, id],
    ).map_err(|e| e.to_string())?;
    Ok(rows > 0)
}

#[tauri::command]
pub async fn delete_material(state: State<'_, AppState>, id: i64) -> Result<bool, String> {
    let conn = state.db.get_connection();
    let rows = conn.execute("DELETE FROM materials WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(rows > 0)
}

// ============================================
// PRODUCTION GUIDE COMMANDS
// ============================================
#[tauri::command]
pub async fn get_production_guides(state: State<'_, AppState>) -> Result<Vec<ProductionGuide>, String> {
    let repo = ProductionGuideRepository::new();
    let conn = state.db.get_connection();
    repo.find_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_production_guide(state: State<'_, AppState>, id: i64) -> Result<Option<ProductionGuide>, String> {
    let repo = ProductionGuideRepository::new();
    let conn = state.db.get_connection();
    repo.find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_production_guide(state: State<'_, AppState>, name: String, description: Option<String>,
    product_id: Option<i64>, service_id: Option<i64>, machine_id: Option<i64>, material_id: Option<i64>) -> Result<i64, String> {
    let repo = ProductionGuideRepository::new();
    let conn = state.db.get_connection();
    repo.create(&conn, &name, description.as_deref(), product_id, service_id, machine_id, material_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_production_guide(state: State<'_, AppState>, id: i64, name: String, description: Option<String>) -> Result<bool, String> {
    let conn = state.db.get_connection();
    let rows = conn.execute(
        "UPDATE production_guides SET name = ?1, description = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?3",
        rusqlite::params![name, description, id],
    ).map_err(|e| e.to_string())?;
    Ok(rows > 0)
}

#[tauri::command]
pub async fn delete_production_guide(state: State<'_, AppState>, id: i64) -> Result<bool, String> {
    let repo = ProductionGuideRepository::new();
    let conn = state.db.get_connection();
    repo.delete(&conn, id).map_err(|e| e.to_string())
}

// ============================================
// FAVORITES COMMANDS
// ============================================
#[tauri::command]
pub async fn get_favorites(state: State<'_, AppState>, user_id: i64) -> Result<Vec<Template>, String> {
    let repo = FavoritesRepository::new();
    let conn = state.db.get_connection();
    repo.get_favorites(&conn, user_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_favorite(state: State<'_, AppState>, user_id: i64, template_id: i64) -> Result<(), String> {
    let repo = FavoritesRepository::new();
    let conn = state.db.get_connection();
    repo.add_favorite(&conn, user_id, template_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn remove_favorite(state: State<'_, AppState>, user_id: i64, template_id: i64) -> Result<(), String> {
    let repo = FavoritesRepository::new();
    let conn = state.db.get_connection();
    repo.remove_favorite(&conn, user_id, template_id).map_err(|e| e.to_string())
}

// ============================================
// SEARCH COMMANDS
// ============================================
#[tauri::command]
pub async fn global_search(state: State<'_, AppState>, req: SearchRequest) -> Result<Vec<SearchResult>, String> {
    let service = crate::services::SearchService::new();
    service.search(&state.db, req)
}

#[tauri::command]
pub async fn search_by_tag(state: State<'_, AppState>, tag_name: String) -> Result<Vec<SearchResult>, String> {
    let service = crate::services::SearchService::new();
    service.search_by_tag(&state.db, &tag_name)
}

// ============================================
// SETTINGS COMMANDS
// ============================================
#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<Vec<Setting>, String> {
    let conn = state.db.get_connection();
    let mut stmt = conn.prepare("SELECT * FROM settings ORDER BY group_name, key")
        .map_err(|e| e.to_string())?;
    let settings = stmt.query_map([], |row| {
        Ok(Setting {
            id: row.get(0)?,
            key: row.get(1)?,
            value: row.get(2)?,
            group_name: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;
    Ok(settings)
}

#[tauri::command]
pub async fn get_setting(state: State<'_, AppState>, key: String) -> Result<Option<Setting>, String> {
    let conn = state.db.get_connection();
    let mut stmt = conn.prepare("SELECT * FROM settings WHERE key = ?1")
        .map_err(|e| e.to_string())?;
    let setting = stmt.query_row(rusqlite::params![key], |row| {
        Ok(Setting {
            id: row.get(0)?,
            key: row.get(1)?,
            value: row.get(2)?,
            group_name: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }).optional().map_err(|e| e.to_string())?;
    Ok(setting)
}

#[tauri::command]
pub async fn update_setting(state: State<'_, AppState>, key: String, value: String) -> Result<bool, String> {
    let conn = state.db.get_connection();
    let rows = conn.execute(
        "UPDATE settings SET value = ?1, updated_at = CURRENT_TIMESTAMP WHERE key = ?2",
        rusqlite::params![value, key],
    ).map_err(|e| e.to_string())?;
    Ok(rows > 0)
}

// ============================================
// BACKUP COMMANDS
// ============================================
#[tauri::command]
pub async fn create_backup(state: State<'_, AppState>, include_files: bool, custom_path: Option<String>) -> Result<String, String> {
    use chrono::Local;
    use std::fs;

    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S");
    let filename = format!("TechnicalServices_Backup_{}.db", timestamp);

    let backup_dir = if let Some(path) = custom_path {
        PathBuf::from(path)
    } else {
        let app_dir = state.db.get_db_path().parent()
            .ok_or("Invalid db path")?.to_path_buf();
        app_dir.join("Backups")
    };

    fs::create_dir_all(&backup_dir).map_err(|e| e.to_string())?;
    let backup_path = backup_dir.join(&filename);

    state.db.backup(&backup_path).map_err(|e| e.to_string())?;

    // Log activity
    let conn = state.db.get_connection();
    let _ = conn.execute(
        "INSERT INTO activity_logs (action, entity_type, entity_code, details)
         VALUES ('BACKUP', 'backup', ?1, 'Backup created')",
        rusqlite::params![filename],
    );

    Ok(backup_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn get_backups(state: State<'_, AppState>) -> Result<Vec<BackupInfo>, String> {
    use std::fs;
    let app_dir = state.db.get_db_path().parent()
        .ok_or("Invalid db path")?.to_path_buf();
    let backup_dir = app_dir.join("Backups");

    let mut backups = vec![];
    if backup_dir.exists() {
        for entry in fs::read_dir(&backup_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let metadata = entry.metadata().map_err(|e| e.to_string())?;
            if metadata.is_file() && entry.file_name().to_string_lossy().ends_with(".db") {
                let modified = metadata.modified()
                    .ok()
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| chrono::DateTime::from_timestamp(d.as_secs() as i64, 0))
                    .flatten()
                    .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
                    .unwrap_or_default();

                backups.push(BackupInfo {
                    filename: entry.file_name().to_string_lossy().to_string(),
                    path: entry.path().to_string_lossy().to_string(),
                    size_mb: (metadata.len() as f64) / (1024.0 * 1024.0),
                    created_at: modified,
                    is_auto: entry.file_name().to_string_lossy().contains("auto"),
                });
            }
        }
    }
    backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(backups)
}

#[tauri::command]
pub async fn restore_backup(state: State<'_, AppState>, path: String) -> Result<bool, String> {
    use std::fs;
    let backup_path = PathBuf::from(&path);
    if !backup_path.exists() {
        return Err("Backup file not found".to_string());
    }

    let db_path = state.db.get_db_path().to_path_buf();
    let backup_original = db_path.with_extension("db.backup");

    // Backup current db first
    fs::copy(&db_path, &backup_original).map_err(|e| e.to_string())?;

    // Restore
    fs::copy(&backup_path, &db_path).map_err(|e| {
        // Rollback on error
        let _ = fs::copy(&backup_original, &db_path);
        e.to_string()
    })?;

    // Clean up temp backup
    let _ = fs::remove_file(&backup_original);

    // Log activity
    let conn = state.db.get_connection();
    let _ = conn.execute(
        "INSERT INTO activity_logs (action, entity_type, details)
         VALUES ('RESTORE', 'backup', 'Database restored')",
        [],
    );

    Ok(true)
}

#[tauri::command]
pub async fn delete_backup(state: State<'_, AppState>, path: String) -> Result<bool, String> {
    use std::fs;
    let backup_path = PathBuf::from(&path);
    if !backup_path.exists() {
        return Ok(false);
    }
    fs::remove_file(&backup_path).map_err(|e| e.to_string())?;
    Ok(true)
}

// ============================================
// FILE MANAGER COMMANDS
// ============================================
#[tauri::command]
pub async fn scan_directory(_state: State<'_, AppState>, path: String) -> Result<Vec<FileSystemEntry>, String> {
    let fm = FileManager::new();
    let entries = fm.scan_directory(PathBuf::from(&path).as_path())
        .map_err(|e| e.to_string())?;
    Ok(entries)
}

#[tauri::command]
pub async fn get_storage_info(_state: State<'_, AppState>) -> Result<StorageInfo, String> {
    // Get root from settings
    let root = PathBuf::from("D:\\TechnicalServices");
    let fm = FileManager::new();
    fm.get_storage_info(&root).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn open_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg("/select,".to_string() + &path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn open_photoshop(state: State<'_, AppState>, file_path: String) -> Result<(), String> {
    let conn = state.db.get_connection();
    let ps_path: Option<String> = conn.query_row(
        "SELECT value FROM settings WHERE key = 'photoshop_path'",
        [],
        |row| row.get(0)
    ).optional().map_err(|e| e.to_string())?;

    let photoshop_exe = if let Some(path) = ps_path {
        PathBuf::from(path)
    } else {
        // Try common paths
        let common_paths = vec![
            "C:\\Program Files\\Adobe\\Adobe Photoshop 2024\\Photoshop.exe",
            "C:\\Program Files\\Adobe\\Adobe Photoshop 2023\\Photoshop.exe",
            "C:\\Program Files\\Adobe\\Adobe Photoshop 2022\\Photoshop.exe",
            "C:\\Program Files (x86)\\Adobe\\Adobe Photoshop\\Photoshop.exe",
        ];
        let mut found = None;
        for path in common_paths {
            let p = PathBuf::from(path);
            if p.exists() {
                found = Some(p);
                break;
            }
        }
        found.ok_or("Photoshop not found. Please set Photoshop path in Settings.")?
    };

    if !photoshop_exe.exists() {
        return Err("Photoshop executable not found at the specified path. Please check Settings.".to_string());
    }

    std::process::Command::new(&photoshop_exe)
        .arg(&file_path)
        .spawn()
        .map_err(|e| format!("Failed to open Photoshop: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_photoshop_path(state: State<'_, AppState>) -> Result<Option<String>, String> {
    let conn = state.db.get_connection();
    let path: Option<String> = conn.query_row(
        "SELECT value FROM settings WHERE key = 'photoshop_path'",
        [],
        |row| row.get(0)
    ).optional().map_err(|e| e.to_string())?;
    Ok(path)
}

#[tauri::command]
pub async fn set_photoshop_path(state: State<'_, AppState>, path: String) -> Result<bool, String> {
    let conn = state.db.get_connection();
    let rows = conn.execute(
        "UPDATE settings SET value = ?1 WHERE key = 'photoshop_path'",
        rusqlite::params![path],
    ).map_err(|e| e.to_string())?;
    Ok(rows > 0)
}

#[tauri::command]
pub async fn delete_file(path: String) -> Result<bool, String> {
    let file_path = PathBuf::from(&path);
    if !file_path.exists() {
        return Ok(false);
    }
    let fm = FileManager::new();
    fm.safe_delete(&file_path).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub async fn check_file_integrity(_state: State<'_, AppState>, file_path: String, expected_checksum: String) -> Result<bool, String> {
    let fm = FileManager::new();
    let path = PathBuf::from(&file_path);
    if !path.exists() {
        return Err("File not found".to_string());
    }
    fm.verify_checksum(&path, &expected_checksum).map_err(|e| e.to_string())
}

// ============================================
// ACTIVITY LOG COMMANDS
// ============================================
#[tauri::command]
pub async fn get_activity_logs(state: State<'_, AppState>, limit: Option<i64>) -> Result<Vec<ActivityLog>, String> {
    let conn = state.db.get_connection();
    let mut stmt = conn.prepare(
        "SELECT a.id, a.user_id, u.display_name as user_name, a.action, 
                a.entity_type, a.entity_id, a.entity_code, a.details, 
                a.ip_address, a.created_at
         FROM activity_logs a
         LEFT JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC
         LIMIT ?1"
    ).map_err(|e| e.to_string())?;

    let logs = stmt.query_map(rusqlite::params![limit.unwrap_or(100)], |row| {
        Ok(ActivityLog {
            id: row.get(0)?,
            user_id: row.get(1)?,
            user_name: row.get(2)?,
            action: row.get(3)?,
            entity_type: row.get(4)?,
            entity_id: row.get(5)?,
            entity_code: row.get(6)?,
            details: row.get(7)?,
            ip_address: row.get(8)?,
            created_at: row.get(9)?,
        })
    }).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

    Ok(logs)
}
