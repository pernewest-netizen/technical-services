use tauri::State;
use crate::db::AppState;
use crate::models::{LoginRequest, LoginResponse, UserWithRole};
use crate::services::AuthService;

#[tauri::command]
pub async fn login(state: State<'_, AppState>, req: LoginRequest) -> Result<LoginResponse, String> {
    let auth_service = AuthService::new();
    auth_service.login(&state.db, req)
}

#[tauri::command]
pub async fn get_current_user(state: State<'_, AppState>, user_id: i64) -> Result<Option<UserWithRole>, String> {
    let auth_service = AuthService::new();
    auth_service.get_current_user(&state.db, user_id)
}

#[tauri::command]
pub async fn get_all_users(state: State<'_, AppState>) -> Result<Vec<UserWithRole>, String> {
    let auth_service = AuthService::new();
    auth_service.get_all_users(&state.db)
}

#[tauri::command]
pub async fn get_roles(state: State<'_, AppState>) -> Result<Vec<crate::models::Role>, String> {
    let auth_service = AuthService::new();
    auth_service.get_roles(&state.db)
}
