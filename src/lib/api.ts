import { invoke } from '@tauri-apps/api/tauri';
import {
  LoginRequest, LoginResponse, UserWithRole, Role,
  Season, CreateSeasonRequest, Product, CreateProductRequest,
  Template, CreateTemplateRequest, TemplateVersion,
  DashboardStats, SearchResult, SearchRequest,
  Machine, Material, Service, Category,
  ActivityLog, Setting, BackupInfo, StorageInfo,
  FileSystemEntry, ProductionGuide,
} from '@/types';

// ============================================
// AUTH API
// ============================================
export const authApi = {
  login: (req: LoginRequest): Promise<LoginResponse> => invoke('login', { req }),
  getCurrentUser: (userId: number): Promise<UserWithRole | null> => invoke('get_current_user', { userId }),
  getAllUsers: (): Promise<UserWithRole[]> => invoke('get_all_users'),
  getRoles: (): Promise<Role[]> => invoke('get_roles'),
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardApi = {
  getStats: (): Promise<DashboardStats> => invoke('get_dashboard_stats'),
};

// ============================================
// SEASONS API
// ============================================
export const seasonApi = {
  getAll: (includeArchived?: boolean): Promise<Season[]> => 
    invoke('get_seasons', { includeArchived }),
  getById: (id: number): Promise<Season | null> => 
    invoke('get_season', { id }),
  create: (req: CreateSeasonRequest): Promise<number> => 
    invoke('create_season', { req }),
  update: (id: number, req: CreateSeasonRequest): Promise<boolean> => 
    invoke('update_season', { id, req }),
  archive: (id: number, archive: boolean): Promise<boolean> => 
    invoke('archive_season', { id, archive }),
  delete: (id: number): Promise<boolean> => 
    invoke('delete_season', { id }),
};

// ============================================
// CATEGORIES API
// ============================================
export const categoryApi = {
  getAll: (): Promise<Category[]> => invoke('get_categories'),
  getById: (id: number): Promise<Category | null> => invoke('get_category', { id }),
  create: (name: string, display_name: string, description?: string | null, icon?: string | null, 
           color?: string | null, parent_id?: number | null): Promise<number> => 
    invoke('create_category', { name, displayName: display_name, description, icon, color, parentId: parent_id }),
  update: (id: number, display_name: string, description?: string | null, icon?: string | null,
           color?: string | null, sort_order?: number | null): Promise<boolean> =>
    invoke('update_category', { id, displayName: display_name, description, icon, color, sortOrder: sort_order }),
  delete: (id: number): Promise<boolean> => invoke('delete_category', { id }),
};

// ============================================
// PRODUCTS API
// ============================================
export const productApi = {
  getAll: (params?: { categoryId?: number; seasonId?: number; search?: string; limit?: number; offset?: number }): Promise<Product[]> => 
    invoke('get_products', params || {}),
  getById: (id: number): Promise<Product | null> => 
    invoke('get_product', { id }),
  create: (req: CreateProductRequest): Promise<number> => 
    invoke('create_product', { req }),
  update: (id: number, req: CreateProductRequest): Promise<boolean> => 
    invoke('update_product', { id, req }),
  delete: (id: number): Promise<boolean> => 
    invoke('delete_product', { id }),
};

// ============================================
// SERVICES API
// ============================================
export const serviceApi = {
  getAll: (): Promise<Service[]> => invoke('get_services'),
  getById: (id: number): Promise<Service | null> => invoke('get_service', { id }),
  create: (name: string, display_name: string, description?: string | null, category_id?: number | null): Promise<number> =>
    invoke('create_service', { name, displayName: display_name, description, categoryId: category_id }),
  update: (id: number, display_name: string, description?: string | null, category_id?: number | null): Promise<boolean> =>
    invoke('update_service', { id, displayName: display_name, description, categoryId: category_id }),
  delete: (id: number): Promise<boolean> => invoke('delete_service', { id }),
};

// ============================================
// TEMPLATES API
// ============================================
export const templateApi = {
  getAll: (params?: {
    seasonId?: number;
    categoryId?: number;
    productId?: number;
    materialId?: number;
    search?: string;
    isFavorite?: boolean;
    isArchived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Template[]> => invoke('get_templates', params || {}),

  getById: (id: number): Promise<Template | null> => 
    invoke('get_template', { id }),

  create: (req: CreateTemplateRequest, userId: number): Promise<number> => 
    invoke('create_template', { req, userId }),

  update: (id: number, req: CreateTemplateRequest, userId: number): Promise<boolean> => 
    invoke('update_template', { id, req, userId }),

  delete: (id: number, userId: number): Promise<boolean> => 
    invoke('delete_template', { id, userId }),

  toggleFavorite: (id: number): Promise<boolean> => 
    invoke('toggle_favorite', { id }),

  archive: (id: number, archive: boolean): Promise<boolean> => 
    invoke('archive_template', { id, archive }),

  getVersions: (templateId: number): Promise<TemplateVersion[]> => 
    invoke('get_template_versions', { templateId }),

  addVersion: (templateId: number, changeNotes: string | null, userId: number): Promise<number> => 
    invoke('add_template_version', { templateId, changeNotes, userId }),
};

// ============================================
// SEARCH API
// ============================================
export const searchApi = {
  global: (req: SearchRequest): Promise<SearchResult[]> => 
    invoke('global_search', { req }),
  byTag: (tagName: string): Promise<SearchResult[]> => 
    invoke('search_by_tag', { tagName }),
};

// ============================================
// MACHINES API
// ============================================
export const machineApi = {
  getAll: (): Promise<Machine[]> => invoke('get_machines'),
  getById: (id: number): Promise<Machine | null> => invoke('get_machine', { id }),
  create: (name: string, display_name: string, machine_type: string, brand?: string | null,
           model?: string | null, power?: string | null, work_area?: string | null, notes?: string | null): Promise<number> =>
    invoke('create_machine', { name, displayName: display_name, machineType: machine_type, brand, model, power, workArea: work_area, notes }),
  update: (id: number, display_name: string, machine_type: string, brand?: string | null,
           model?: string | null, power?: string | null, work_area?: string | null, notes?: string | null): Promise<boolean> =>
    invoke('update_machine', { id, displayName: display_name, machineType: machine_type, brand, model, power, workArea: work_area, notes }),
  delete: (id: number): Promise<boolean> => invoke('delete_machine', { id }),
};

// ============================================
// MATERIALS API
// ============================================
export const materialApi = {
  getAll: (): Promise<Material[]> => invoke('get_materials'),
  getById: (id: number): Promise<Material | null> => invoke('get_material', { id }),
  create: (name: string, display_name: string, material_type: string, thickness?: string | null,
           size?: string | null, color?: string | null, notes?: string | null): Promise<number> =>
    invoke('create_material', { name, displayName: display_name, materialType: material_type, thickness, size, color, notes }),
  update: (id: number, display_name: string, material_type: string, thickness?: string | null,
           size?: string | null, color?: string | null, notes?: string | null): Promise<boolean> =>
    invoke('update_material', { id, displayName: display_name, materialType: material_type, thickness, size, color, notes }),
  delete: (id: number): Promise<boolean> => invoke('delete_material', { id }),
};

// ============================================
// PRODUCTION GUIDES API
// ============================================
export const productionGuideApi = {
  getAll: (): Promise<ProductionGuide[]> => invoke('get_production_guides'),
  getById: (id: number): Promise<ProductionGuide | null> => invoke('get_production_guide', { id }),
  create: (name: string, description?: string | null, product_id?: number | null,
           service_id?: number | null, machine_id?: number | null, material_id?: number | null): Promise<number> =>
    invoke('create_production_guide', { name, description, productId: product_id, serviceId: service_id, machineId: machine_id, materialId: material_id }),
  update: (id: number, name: string, description?: string | null): Promise<boolean> =>
    invoke('update_production_guide', { id, name, description }),
  delete: (id: number): Promise<boolean> => invoke('delete_production_guide', { id }),
};

// ============================================
// FAVORITES API
// ============================================
export const favoritesApi = {
  getAll: (userId: number): Promise<Template[]> => invoke('get_favorites', { userId }),
  add: (userId: number, templateId: number): Promise<void> => invoke('add_favorite', { userId, templateId }),
  remove: (userId: number, templateId: number): Promise<void> => invoke('remove_favorite', { userId, templateId }),
};

// ============================================
// BACKUP API
// ============================================
export const backupApi = {
  getAll: (): Promise<BackupInfo[]> => invoke('get_backups'),
  create: (includeFiles: boolean, customPath?: string): Promise<string> => 
    invoke('create_backup', { includeFiles, customPath }),
  restore: (path: string): Promise<boolean> => 
    invoke('restore_backup', { path }),
  delete: (path: string): Promise<boolean> => 
    invoke('delete_backup', { path }),
};

// ============================================
// SETTINGS API
// ============================================
export const settingsApi = {
  getAll: (): Promise<Setting[]> => invoke('get_settings'),
  getByKey: (key: string): Promise<Setting | null> => invoke('get_setting', { key }),
  update: (key: string, value: string): Promise<boolean> => 
    invoke('update_setting', { key, value }),
};

// ============================================
// FILE MANAGER API
// ============================================
export const fileManagerApi = {
  scanDirectory: (path: string): Promise<FileSystemEntry[]> => 
    invoke('scan_directory', { path }),
  getStorageInfo: (): Promise<StorageInfo> => 
    invoke('get_storage_info'),
  openFolder: (path: string): Promise<void> => 
    invoke('open_folder', { path }),
  openPhotoshop: (filePath: string): Promise<void> => 
    invoke('open_photoshop', { filePath }),
  getPhotoshopPath: (): Promise<string | null> => 
    invoke('get_photoshop_path'),
  setPhotoshopPath: (path: string): Promise<boolean> => 
    invoke('set_photoshop_path', { path }),
  deleteFile: (path: string): Promise<boolean> => 
    invoke('delete_file', { path }),
  checkFileIntegrity: (filePath: string, expectedChecksum: string): Promise<boolean> => 
    invoke('check_file_integrity', { filePath, expectedChecksum }),
};

// ============================================
// ACTIVITY LOG API
// ============================================
export const activityLogApi = {
  getAll: (limit?: number): Promise<ActivityLog[]> => invoke('get_activity_logs', { limit }),
};
