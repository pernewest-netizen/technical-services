-- Technical Services Database Schema
-- SQLite with Foreign Keys & Full Text Search

PRAGMA foreign_keys = ON;

-- ============================================
-- CORE: Users, Roles, Permissions
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    permissions TEXT NOT NULL DEFAULT '[]', -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- ============================================
-- CORE: Settings
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    group_name TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MODULES: Seasons & Categories (Dynamic)
-- ============================================

CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    image_path TEXT,
    date_start TEXT, -- ISO 8601
    date_end TEXT,
    is_active BOOLEAN DEFAULT 1,
    is_archived BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================
-- MODULES: Products & Services (Dynamic)
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER,
    material_id INTEGER,
    size TEXT,
    weight REAL,
    production_method_id INTEGER,
    season_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    is_archived BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================
-- MODULES: Machines & Materials
-- ============================================

CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    machine_type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    power TEXT,
    work_area TEXT,
    notes TEXT,
    maintenance_notes TEXT,
    last_maintenance TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    material_type TEXT NOT NULL,
    thickness TEXT,
    size TEXT,
    color TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Relations
CREATE TABLE IF NOT EXISTS machine_materials (
    machine_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    PRIMARY KEY (machine_id, material_id),
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_materials (
    product_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, material_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);

-- ============================================
-- CORE: Templates (Heart of the System)
-- ============================================

CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    season_id INTEGER,
    category_id INTEGER,
    product_id INTEGER,
    material_id INTEGER,
    machine_id INTEGER,
    size TEXT,
    is_editable BOOLEAN DEFAULT 1,
    current_version INTEGER DEFAULT 1,
    is_favorite BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    is_archived BOOLEAN DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS template_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    change_notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(template_id, version_number)
);

-- ============================================
-- CORE: Files
-- ============================================

CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    version_id INTEGER,
    file_type TEXT NOT NULL CHECK(file_type IN ('PSD','AI','PDF','SVG','PNG','JPG','JPEG','FONT','ASSET','MOCKUP','PREVIEW','THUMBNAIL','OTHER')),
    relative_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    file_size INTEGER,
    checksum TEXT,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    is_primary BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES template_versions(id) ON DELETE SET NULL
);

CREATE INDEX idx_files_template ON files(template_id);
CREATE INDEX idx_files_type ON files(file_type);
CREATE INDEX idx_files_checksum ON files(checksum);

-- ============================================
-- CORE: Tags (Dynamic)
-- ============================================

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS template_tags (
    template_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (template_id, tag_id),
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_template_tags_tag ON template_tags(tag_id);

-- ============================================
-- CORE: Favorites (Per User)
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    UNIQUE(user_id, template_id)
);

-- ============================================
-- MODULES: Production Guides
-- ============================================

CREATE TABLE IF NOT EXISTS production_guides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    product_id INTEGER,
    service_id INTEGER,
    machine_id INTEGER,
    material_id INTEGER,
    estimated_time TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS production_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guide_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_path TEXT,
    warning TEXT,
    required_machine_id INTEGER,
    required_material_id INTEGER,
    estimated_time TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (guide_id) REFERENCES production_guides(id) ON DELETE CASCADE,
    FOREIGN KEY (required_machine_id) REFERENCES machines(id) ON DELETE SET NULL,
    FOREIGN KEY (required_material_id) REFERENCES materials(id) ON DELETE SET NULL
);

-- ============================================
-- CORE: Activity Log (Audit Trail)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    entity_code TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- ============================================
-- CORE: Full Text Search (FTS5)
-- ============================================

CREATE VIRTUAL TABLE IF NOT EXISTS templates_fts USING fts5(
    code,
    name,
    description,
    content='templates',
    content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS templates_fts_insert AFTER INSERT ON templates BEGIN
    INSERT INTO templates_fts(rowid, code, name, description)
    VALUES (new.id, new.code, new.name, new.description);
END;

CREATE TRIGGER IF NOT EXISTS templates_fts_delete AFTER DELETE ON templates BEGIN
    INSERT INTO templates_fts(templates_fts, rowid, code, name, description)
    VALUES ('delete', old.id, old.code, old.name, old.description);
END;

CREATE TRIGGER IF NOT EXISTS templates_fts_update AFTER UPDATE ON templates BEGIN
    INSERT INTO templates_fts(templates_fts, rowid, code, name, description)
    VALUES ('delete', old.id, old.code, old.name, old.description);
    INSERT INTO templates_fts(rowid, code, name, description)
    VALUES (new.id, new.code, new.name, new.description);
END;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_templates_season ON templates(season_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category_id);
CREATE INDEX IF NOT EXISTS idx_templates_product ON templates(product_id);
CREATE INDEX IF NOT EXISTS idx_templates_material ON templates(material_id);
CREATE INDEX IF NOT EXISTS idx_templates_code ON templates(code);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_season ON products(season_id);

-- ============================================
-- VIEWS
-- ============================================

CREATE VIEW IF NOT EXISTS v_template_summary AS
SELECT 
    t.id,
    t.code,
    t.name,
    t.description,
    t.is_editable,
    t.current_version,
    t.is_favorite,
    t.is_active,
    t.is_archived,
    t.created_at,
    t.updated_at,
    s.name as season_name,
    c.name as category_name,
    p.name as product_name,
    m.name as material_name,
    u.display_name as created_by_name,
    (SELECT relative_path FROM files WHERE template_id = t.id AND file_type = 'THUMBNAIL' AND is_primary = 1 LIMIT 1) as thumbnail_path,
    (SELECT relative_path FROM files WHERE template_id = t.id AND file_type = 'PREVIEW' AND is_primary = 1 LIMIT 1) as preview_path
FROM templates t
LEFT JOIN seasons s ON t.season_id = s.id
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN products p ON t.product_id = p.id
LEFT JOIN materials m ON t.material_id = m.id
LEFT JOIN users u ON t.created_by = u.id;
