use tauri::State;
use crate::db::AppState;
use crate::models::{SearchResult, SearchRequest};
use crate::services::SearchService;

#[tauri::command]
pub async fn global_search(state: State<'_, AppState>, req: SearchRequest) -> Result<Vec<SearchResult>, String> {
    let service = SearchService::new();
    service.search(&state.db, req)
}

#[tauri::command]
pub async fn search_by_tag(state: State<'_, AppState>, tag_name: String) -> Result<Vec<SearchResult>, String> {
    let service = SearchService::new();
    service.search_by_tag(&state.db, &tag_name)
}
