use tauri::State;
use crate::db::AppState;
use crate::models::{Product, CreateProductRequest};
use crate::repositories::ProductRepository;

#[tauri::command]
pub async fn get_products(
    state: State<'_, AppState>,
    category_id: Option<i64>,
    season_id: Option<i64>,
    search: Option<String>,
    limit: Option<i64>,
    offset: Option<i64>,
) -> Result<Vec<Product>, String> {
    let repo = ProductRepository::new();
    let conn = state.db.get_connection();
    repo.find_all(&conn, category_id, season_id, search.as_deref(), 
                  limit.unwrap_or(50), offset.unwrap_or(0))
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
