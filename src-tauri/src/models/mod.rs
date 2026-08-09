use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

// ============================================
// USER & AUTH MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Role {
    pub id: i64,
    pub name: String,
    pub display_name: String,
    pub permissions: String, // JSON
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i64,
    pub username: String,
    pub display_name: Option<String>,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub role_id: i64,
    pub is_active: bool,
    pub last_login: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserWithRole {
    #[serde(flatten)]
    pub user: User,
    pub role_name: String,
    pub role_display_name: String,
    pub permissions: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub success: bool,
    pub token: Option<String>,
    pub user: Option<UserWithRole>,
    pub message: String,
}

// ============================================
// SEASON MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Season {
    pub id: i64,
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub image_path: Option<String>,
    pub date_start: Option<String>,
    pub date_end: Option<String>,
    pub is_active: bool,
    pub is_archived: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
    // Computed
    pub product_count: Option<i64>,
    pub template_count: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSeasonRequest {
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub image_path: Option<String>,
    pub date_start: Option<String>,
    pub date_end: Option<String>,
    pub sort_order: Option<i64>,
}

// ============================================
// CATEGORY MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub parent_id: Option<i64>,
    pub is_active: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
    pub product_count: Option<i64>,
    pub template_count: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub parent_id: Option<i64>,
    pub sort_order: Option<i64>,
}

// ============================================
// PRODUCT MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Product {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub category_id: Option<i64>,
    pub category_name: Option<String>,
    pub material_id: Option<i64>,
    pub material_name: Option<String>,
    pub size: Option<String>,
    pub weight: Option<f64>,
    pub production_method_id: Option<i64>,
    pub season_id: Option<i64>,
    pub season_name: Option<String>,
    pub is_active: bool,
    pub is_archived: bool,
    pub created_at: String,
    pub updated_at: String,
    pub template_count: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProductRequest {
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub category_id: Option<i64>,
    pub material_id: Option<i64>,
    pub size: Option<String>,
    pub weight: Option<f64>,
    pub season_id: Option<i64>,
}

// ============================================
// TEMPLATE MODELS (Heart of the System)
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Template {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub season_id: Option<i64>,
    pub season_name: Option<String>,
    pub category_id: Option<i64>,
    pub category_name: Option<String>,
    pub product_id: Option<i64>,
    pub product_name: Option<String>,
    pub material_id: Option<i64>,
    pub material_name: Option<String>,
    pub machine_id: Option<i64>,
    pub machine_name: Option<String>,
    pub size: Option<String>,
    pub is_editable: bool,
    pub current_version: i64,
    pub is_favorite: bool,
    pub is_active: bool,
    pub is_archived: bool,
    pub created_by: Option<i64>,
    pub created_by_name: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub tags: Vec<Tag>,
    pub thumbnail_path: Option<String>,
    pub preview_path: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTemplateRequest {
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub season_id: Option<i64>,
    pub category_id: Option<i64>,
    pub product_id: Option<i64>,
    pub material_id: Option<i64>,
    pub machine_id: Option<i64>,
    pub size: Option<String>,
    pub is_editable: Option<bool>,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TemplateVersion {
    pub id: i64,
    pub template_id: i64,
    pub version_number: i64,
    pub change_notes: Option<String>,
    pub created_by: Option<i64>,
    pub created_by_name: Option<String>,
    pub created_at: String,
}

// ============================================
// FILE MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileRecord {
    pub id: i64,
    pub template_id: i64,
    pub version_id: Option<i64>,
    pub file_type: String,
    pub relative_path: String,
    pub filename: String,
    pub original_name: Option<String>,
    pub file_size: Option<i64>,
    pub checksum: Option<String>,
    pub mime_type: Option<String>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub is_primary: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

// ============================================
// TAG MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: i64,
    pub name: String,
    pub color: Option<String>,
    pub usage_count: i64,
    pub created_at: String,
}

// ============================================
// MACHINE & MATERIAL MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Machine {
    pub id: i64,
    pub name: String,
    pub display_name: String,
    pub machine_type: String,
    pub brand: Option<String>,
    pub model: Option<String>,
    pub power: Option<String>,
    pub work_area: Option<String>,
    pub notes: Option<String>,
    pub maintenance_notes: Option<String>,
    pub last_maintenance: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
    pub materials: Vec<Material>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Material {
    pub id: i64,
    pub name: String,
    pub display_name: String,
    pub material_type: String,
    pub thickness: Option<String>,
    pub size: Option<String>,
    pub color: Option<String>,
    pub notes: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

// ============================================
// SERVICE MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Service {
    pub id: i64,
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub category_id: Option<i64>,
    pub category_name: Option<String>,
    pub is_active: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

// ============================================
// PRODUCTION GUIDE MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProductionGuide {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub product_id: Option<i64>,
    pub product_name: Option<String>,
    pub service_id: Option<i64>,
    pub service_name: Option<String>,
    pub machine_id: Option<i64>,
    pub machine_name: Option<String>,
    pub material_id: Option<i64>,
    pub material_name: Option<String>,
    pub estimated_time: Option<String>,
    pub notes: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
    pub steps: Vec<ProductionStep>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProductionStep {
    pub id: i64,
    pub guide_id: i64,
    pub step_number: i64,
    pub title: String,
    pub description: Option<String>,
    pub image_path: Option<String>,
    pub warning: Option<String>,
    pub required_machine_id: Option<i64>,
    pub required_machine_name: Option<String>,
    pub required_material_id: Option<i64>,
    pub required_material_name: Option<String>,
    pub estimated_time: Option<String>,
    pub is_active: bool,
}

// ============================================
// ACTIVITY LOG MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActivityLog {
    pub id: i64,
    pub user_id: Option<i64>,
    pub user_name: Option<String>,
    pub action: String,
    pub entity_type: String,
    pub entity_id: Option<i64>,
    pub entity_code: Option<String>,
    pub details: Option<String>,
    pub ip_address: Option<String>,
    pub created_at: String,
}

// ============================================
// SETTINGS MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Setting {
    pub id: i64,
    pub key: String,
    pub value: Option<String>,
    pub group_name: String,
    pub created_at: String,
    pub updated_at: String,
}

// ============================================
// DASHBOARD MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardStats {
    pub total_templates: i64,
    pub total_products: i64,
    pub total_seasons: i64,
    pub total_files: i64,
    pub recent_templates: Vec<Template>,
    pub recent_activity: Vec<ActivityLog>,
    pub current_season: Option<Season>,
    pub storage_used_mb: f64,
    pub last_backup: Option<String>,
}

// ============================================
// SEARCH MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub id: i64,
    pub entity_type: String,
    pub code: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub thumbnail_path: Option<String>,
    pub relevance: f64,
}

#[derive(Debug, Deserialize)]
pub struct SearchRequest {
    pub query: String,
    pub filters: Option<SearchFilters>,
    pub limit: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct SearchFilters {
    pub entity_types: Option<Vec<String>>,
    pub season_id: Option<i64>,
    pub category_id: Option<i64>,
    pub product_id: Option<i64>,
    pub material_id: Option<i64>,
    pub tags: Option<Vec<String>>,
}

// ============================================
// FILE SYSTEM MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize)]
pub struct FileSystemEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub size: Option<i64>,
    pub modified_at: Option<String>,
    pub extension: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageInfo {
    pub root_path: String,
    pub total_size_mb: f64,
    pub templates_size_mb: f64,
    pub previews_size_mb: f64,
    pub mockups_size_mb: f64,
    pub fonts_size_mb: f64,
    pub assets_size_mb: f64,
    pub backups_size_mb: f64,
}

// ============================================
// BACKUP MODELS
// ============================================
#[derive(Debug, Serialize, Deserialize)]
pub struct BackupInfo {
    pub filename: String,
    pub path: String,
    pub size_mb: f64,
    pub created_at: String,
    pub is_auto: bool,
}

#[derive(Debug, Deserialize)]
pub struct BackupRequest {
    pub include_files: bool,
    pub custom_path: Option<String>,
}
