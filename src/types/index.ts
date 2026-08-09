// ============================================
// AUTH TYPES
// ============================================
export interface Role {
  id: number;
  name: string;
  display_name: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  display_name: string | null;
  role_id: number;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends User {
  role_name: string;
  role_display_name: string;
  permissions: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string | null;
  user: UserWithRole | null;
  message: string;
}

// ============================================
// SEASON TYPES
// ============================================
export interface Season {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  image_path: string | null;
  date_start: string | null;
  date_end: string | null;
  is_active: boolean;
  is_archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_count?: number;
  template_count?: number;
}

export interface CreateSeasonRequest {
  name: string;
  display_name: string;
  description?: string | null;
  image_path?: string | null;
  date_start?: string | null;
  date_end?: string | null;
  sort_order?: number;
}

// ============================================
// CATEGORY TYPES
// ============================================
export interface Category {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parent_id: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_count?: number;
  template_count?: number;
}

// ============================================
// PRODUCT TYPES
// ============================================
export interface Product {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
  material_id: number | null;
  material_name: string | null;
  size: string | null;
  weight: number | null;
  production_method_id: number | null;
  season_id: number | null;
  season_name: string | null;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  template_count?: number;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  description?: string | null;
  category_id?: number | null;
  material_id?: number | null;
  size?: string | null;
  weight?: number | null;
  season_id?: number | null;
}

// ============================================
// SERVICE TYPES
// ============================================
export interface Service {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// TEMPLATE TYPES (Heart of the System)
// ============================================
export interface Template {
  id: number;
  code: string;
  name: string;
  description: string | null;
  season_id: number | null;
  season_name: string | null;
  category_id: number | null;
  category_name: string | null;
  product_id: number | null;
  product_name: string | null;
  material_id: number | null;
  material_name: string | null;
  machine_id: number | null;
  machine_name: string | null;
  size: string | null;
  is_editable: boolean;
  current_version: number;
  is_favorite: boolean;
  is_active: boolean;
  is_archived: boolean;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  thumbnail_path: string | null;
  preview_path: string | null;
}

export interface CreateTemplateRequest {
  code: string;
  name: string;
  description?: string | null;
  season_id?: number | null;
  category_id?: number | null;
  product_id?: number | null;
  material_id?: number | null;
  machine_id?: number | null;
  size?: string | null;
  is_editable?: boolean;
  tags: string[];
}

export interface TemplateVersion {
  id: number;
  template_id: number;
  version_number: number;
  change_notes: string | null;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
}

// ============================================
// FILE TYPES
// ============================================
export interface FileRecord {
  id: number;
  template_id: number;
  version_id: number | null;
  file_type: FileType;
  relative_path: string;
  filename: string;
  original_name: string | null;
  file_size: number | null;
  checksum: string | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type FileType = 'PSD' | 'AI' | 'PDF' | 'SVG' | 'PNG' | 'JPG' | 'JPEG' | 'FONT' | 'ASSET' | 'MOCKUP' | 'PREVIEW' | 'THUMBNAIL' | 'OTHER';

// ============================================
// TAG TYPES
// ============================================
export interface Tag {
  id: number;
  name: string;
  color: string | null;
  usage_count: number;
  created_at: string;
}

// ============================================
// MACHINE & MATERIAL TYPES
// ============================================
export interface Machine {
  id: number;
  name: string;
  display_name: string;
  machine_type: string;
  brand: string | null;
  model: string | null;
  power: string | null;
  work_area: string | null;
  notes: string | null;
  maintenance_notes: string | null;
  last_maintenance: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  materials: Material[];
}

export interface Material {
  id: number;
  name: string;
  display_name: string;
  material_type: string;
  thickness: string | null;
  size: string | null;
  color: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// PRODUCTION GUIDE TYPES
// ============================================
export interface ProductionGuide {
  id: number;
  name: string;
  description: string | null;
  product_id: number | null;
  product_name: string | null;
  service_id: number | null;
  service_name: string | null;
  machine_id: number | null;
  machine_name: string | null;
  material_id: number | null;
  material_name: string | null;
  estimated_time: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps: ProductionStep[];
}

export interface ProductionStep {
  id: number;
  guide_id: number;
  step_number: number;
  title: string;
  description: string | null;
  image_path: string | null;
  warning: string | null;
  required_machine_id: number | null;
  required_machine_name: string | null;
  required_material_id: number | null;
  required_material_name: string | null;
  estimated_time: string | null;
  is_active: boolean;
}

// ============================================
// ACTIVITY LOG TYPES
// ============================================
export interface ActivityLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  entity_code: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

// ============================================
// SETTINGS TYPES
// ============================================
export interface Setting {
  id: number;
  key: string;
  value: string | null;
  group_name: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================
export interface DashboardStats {
  total_templates: number;
  total_products: number;
  total_seasons: number;
  total_files: number;
  recent_templates: Template[];
  recent_activity: ActivityLog[];
  current_season: Season | null;
  storage_used_mb: number;
  last_backup: string | null;
}

// ============================================
// SEARCH TYPES
// ============================================
export interface SearchResult {
  id: number;
  entity_type: string;
  code: string | null;
  name: string;
  description: string | null;
  thumbnail_path: string | null;
  relevance: number;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  limit?: number;
}

export interface SearchFilters {
  entity_types?: string[];
  season_id?: number;
  category_id?: number;
  product_id?: number;
  material_id?: number;
  tags?: string[];
}

// ============================================
// FILE SYSTEM TYPES
// ============================================
export interface FileSystemEntry {
  name: string;
  path: string;
  is_directory: boolean;
  size: number | null;
  modified_at: string | null;
  extension: string | null;
}

export interface StorageInfo {
  root_path: string;
  total_size_mb: number;
  templates_size_mb: number;
  previews_size_mb: number;
  mockups_size_mb: number;
  fonts_size_mb: number;
  assets_size_mb: number;
  backups_size_mb: number;
}

// ============================================
// BACKUP TYPES
// ============================================
export interface BackupInfo {
  filename: string;
  path: string;
  size_mb: number;
  created_at: string;
  is_auto: boolean;
}

// ============================================
// UI TYPES
// ============================================
export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark' | 'system';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}
