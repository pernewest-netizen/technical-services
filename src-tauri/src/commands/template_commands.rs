use tauri::State;
use crate::db::AppState;
use crate::models::{Template, CreateTemplateRequest, TemplateVersion};
use crate::repositories::TemplateRepository;

#[tauri::command]
pub async fn get_templates(
    state: State<'_, AppState>,
    season_id: Option<i64>,
    category_id: Option<i64>,
    product_id: Option<i64>,
    material_id: Option<i64>,
    search: Option<String>,
    is_favorite: Option<bool>,
    is_archived: Option<bool>,
    limit: Option<i64>,
    offset: Option<i64>,
) -> Result<Vec<Template>, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();

    repo.find_all(
        &conn, season_id, category_id, product_id, material_id,
        search.as_deref(), is_favorite, is_archived,
        limit.unwrap_or(50), offset.unwrap_or(0)
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_template(state: State<'_, AppState>, id: i64) -> Result<Option<Template>, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    repo.find_by_id(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_template(
    state: State<'_, AppState>,
    req: CreateTemplateRequest,
    user_id: i64,
) -> Result<i64, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();

    let id = repo.create(&conn, &req, user_id).map_err(|e| e.to_string())?;

    // Log activity
    let _ = conn.execute(
        "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, entity_code, details)
         VALUES (?1, 'CREATE', 'template', ?2, ?3, 'Template created')",
        rusqlite::params![user_id, id, req.code],
    );

    Ok(id)
}

#[tauri::command]
pub async fn update_template(
    state: State<'_, AppState>,
    id: i64,
    req: CreateTemplateRequest,
    user_id: i64,
) -> Result<bool, String> {
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
pub async fn add_template_version(
    state: State<'_, AppState>,
    template_id: i64,
    change_notes: Option<String>,
    user_id: i64,
) -> Result<i64, String> {
    let repo = TemplateRepository::new();
    let conn = state.db.get_connection();
    repo.add_version(&conn, template_id, change_notes.as_deref(), user_id)
        .map_err(|e| e.to_string())
}
