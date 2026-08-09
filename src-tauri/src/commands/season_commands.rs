use tauri::State;
use crate::db::AppState;
use crate::models::{Season, CreateSeasonRequest};
use crate::repositories::SeasonRepository;

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
