use tauri::State;
use crate::db::AppState;
use crate::models::DashboardStats;
use crate::services::DashboardService;

#[tauri::command]
pub async fn get_dashboard_stats(state: State<'_, AppState>) -> Result<DashboardStats, String> {
    let service = DashboardService::new();
    service.get_stats(&state.db)
}
