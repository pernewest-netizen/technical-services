-- Seed Data for Technical Services

-- ============================================
-- ROLES
-- ============================================
INSERT OR IGNORE INTO roles (id, name, display_name, permissions) VALUES
(1, 'admin', 'مدير النظام', '["*"]'),
(2, 'designer', 'مصمم', '["templates:read","templates:write","files:read","files:write","products:read","seasons:read","categories:read","tags:read","tags:write","favorites:read","favorites:write","settings:read"]'),
(3, 'production', 'إنتاج', '["products:read","services:read","machines:read","materials:read","production_guides:read","templates:read","files:read","settings:read"]'),
(4, 'viewer', 'مشاهد', '["templates:read","products:read","services:read","seasons:read","categories:read","machines:read","materials:read","production_guides:read"]');

-- ============================================
-- DEFAULT ADMIN USER (password: admin123)
-- bcrypt hash for 'admin123'
INSERT OR IGNORE INTO users (id, username, display_name, password_hash, role_id, is_active) VALUES
(1, 'admin', 'مدير النظام', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', 1, 1);

-- ============================================
-- SEASONS
-- ============================================
INSERT OR IGNORE INTO seasons (id, name, display_name, description, is_active, sort_order) VALUES
(1, 'ramadan', 'رمضان', 'موسم رمضان الكريم والمناسبات المرتبطة به', 1, 1),
(2, 'eid_fitr', 'عيد الفطر', 'مناسبة عيد الفطر المبارك', 1, 2),
(3, 'eid_adha', 'عيد الأضحى', 'مناسبة عيد الأضحى المبارك', 1, 3),
(4, 'new_year', 'رأس السنة', 'بداية العام الميلادي الجديد', 1, 4),
(5, 'weddings', 'أفراح', 'مناسبات الزفاف والأفراح', 1, 5),
(6, 'graduation', 'تخرج', 'حفلات التخرج والنجاح', 1, 6),
(7, 'birthdays', 'أعياد ميلاد', 'مناسبات أعياد الميلاد', 1, 7),
(8, 'national', 'مناسبات وطنية', 'الأعياد الوطنية والمناسبات الرسمية', 1, 8),
(9, 'schools', 'المدارس', 'موسم العودة للمدارس والجامعات', 1, 9),
(10, 'companies', 'الشركات', 'منتجات وهدايا الشركات', 1, 10);

-- ============================================
-- CATEGORIES (Dynamic - No Hard Coding!)
-- ============================================
INSERT OR IGNORE INTO categories (id, name, display_name, description, icon, color, is_active, sort_order) VALUES
(1, 'printing', 'الطباعة', 'خدمات الطباعة بأنواعها', 'printer', '#3B82F6', 1, 1),
(2, 'laser', 'الليزر', 'قص وحفر الليزر على مختلف الخامات', 'zap', '#EF4444', 1, 2),
(3, 'heat_press', 'المكابس الحرارية', 'الطباعة الحرارية على المنتجات', 'flame', '#F59E0B', 1, 3),
(4, 'binding', 'التجليد', 'خدمات التجليد والتغليف', 'book', '#10B981', 1, 4),
(5, 'packaging', 'التغليف', 'تغليف المنتجات والهدايا', 'package', '#8B5CF6', 1, 5),
(6, 'cutting', 'القص والتجهيز', 'قص وتخريم وتجهيز الخامات', 'scissors', '#EC4899', 1, 6),
(7, 'cards', 'الكروت والدعوات', 'كروت تهنئة ودعوات زفاف ومناسبات', 'credit-card', '#06B6D4', 1, 7),
(8, 'gifts', 'الهدايا', 'منتجات وهدايا متنوعة', 'gift', '#F97316', 1, 8);

-- ============================================
-- PRODUCTS
-- ============================================
INSERT OR IGNORE INTO products (id, code, name, description, category_id, size, is_active) VALUES
(1, 'PROD-001', 'فانوس MDF', 'فانوس رمضان من MDF سماكة 3مم', 2, '30x30 cm', 1),
(2, 'PROD-002', 'مج سيراميك', 'مج سيراميك للطباعة الحرارية', 3, '11 oz', 1),
(3, 'PROD-003', 'تيشيرت قطن', 'تيشيرت قطن 100% للطباعة', 3, 'S-XXL', 1),
(4, 'PROD-004', 'دعوة زفاف', 'دعوة زفاف فاخرة قابلة للتخصيص', 7, '15x21 cm', 1),
(5, 'PROD-005', 'كارت تهنئة', 'كارت تهنئة عام لجميع المناسبات', 7, '10x15 cm', 1),
(6, 'PROD-006', 'أجندة', 'أجندة سنوية للشركات والأفراد', 1, 'A5', 1),
(7, 'PROD-007', 'بوكس هدايا', 'صندوق هدايا خشبي قابل للتخصيص', 2, '20x20x10 cm', 1),
(8, 'PROD-008', 'استيكر فينيل', 'استيكر فينيل للزينة واللصق', 6, 'متنوع', 1),
(9, 'PROD-009', 'لوحة أكريليك', 'لوحة أكريليك شفافة للحفر', 2, '20x30 cm', 1),
(10, 'PROD-010', 'كاب', 'كاب للطباعة الحرارية', 3, 'قابل للتعديل', 1);

-- ============================================
-- SERVICES
-- ============================================
INSERT OR IGNORE INTO services (id, name, display_name, description, category_id, is_active, sort_order) VALUES
(1, 'paper_printing', 'طباعة ورق', 'طباعة على الورق بجميع الأنواع والمقاسات', 1, 1, 1),
(2, 'card_printing', 'طباعة كروت', 'طباعة كروت شخصية ودعوات', 1, 1, 2),
(3, 'flyer_printing', 'طباعة فلاير', 'طباعة منشورات وفلايرات', 1, 1, 3),
(4, 'sticker_printing', 'طباعة استيكر', 'طباعة استيكرات فينيل وورق', 1, 1, 4),
(5, 'poster_printing', 'طباعة بوستر', 'طباعة بوسترات بمقاسات كبيرة', 1, 1, 5),
(6, 'laser_cutting', 'قص ليزر', 'قص بالليزر على MDF وأكريليك وخشب', 2, 1, 6),
(7, 'laser_engraving', 'حفر ليزر', 'حفر بالليزر على مختلف الخامات', 2, 1, 7),
(8, 'heat_press_mug', 'طباعة مج', 'طباعة حرارية على الأمجات', 3, 1, 8),
(9, 'heat_press_tshirt', 'طباعة تيشيرت', 'طباعة حرارية على التيشيرتات', 3, 1, 9),
(10, 'binding_service', 'تجليد', 'تجليد كتب وملفات', 4, 1, 10),
(11, 'packaging_service', 'تغليف', 'تغليف وسلوفان', 5, 1, 11),
(12, 'cutting_service', 'قص وتجهيز', 'قص وتخريم وتكسير', 6, 1, 12);

-- ============================================
-- MACHINES
-- ============================================
INSERT OR IGNORE INTO machines (id, name, display_name, machine_type, brand, model, power, work_area, is_active) VALUES
(1, 'laser_60w', 'ماكينة ليزر 60W', 'laser', 'Thunder Laser', 'Nova 35', '60W', '600x400 mm', 1),
(2, 'laser_100w', 'ماكينة ليزر 100W', 'laser', 'Thunder Laser', 'Nova 51', '100W', '900x600 mm', 1),
(3, 'heat_press_1', 'مكبس حراري 38x38', 'heat_press', 'Geo Knight', 'DK20S', '1800W', '380x380 mm', 1),
(4, 'heat_press_2', 'مكبس حراري 5 في 1', 'heat_press', 'F2C', '5-in-1', '1200W', 'Multiple', 1),
(5, 'printer_epson', 'طابعة إبسون A3', 'printer', 'Epson', 'L1800', 'N/A', 'A3+', 1),
(6, 'printer_canon', 'طابعة كانون A4', 'printer', 'Canon', 'G series', 'N/A', 'A4', 1),
(7, 'cutting_plotter', 'كاتر بلوتتر', 'cutting', 'Roland', 'GS-24', 'N/A', 'N/A', 1),
(8, 'binding_machine', 'ماكينة تجليد', 'binding', 'GBC', 'CombBind', 'N/A', 'N/A', 1);

-- ============================================
-- MATERIALS
-- ============================================
INSERT OR IGNORE INTO materials (id, name, display_name, material_type, thickness, size, is_active) VALUES
(1, 'mdf_3mm', 'MDF 3مم', 'mdf', '3mm', '122x244 cm', 1),
(2, 'mdf_5mm', 'MDF 5مم', 'mdf', '5mm', '122x244 cm', 1),
(3, 'acrylic_3mm', 'أكريليك 3مم', 'acrylic', '3mm', '122x244 cm', 1),
(4, 'acrylic_5mm', 'أكريليك 5مم', 'acrylic', '5mm', '122x244 cm', 1),
(5, 'wood_3mm', 'خشب طبيعي 3مم', 'wood', '3mm', '122x244 cm', 1),
(6, 'paper_a4', 'ورق A4', 'paper', '80gsm', 'A4', 1),
(7, 'paper_a3', 'ورق A3', 'paper', '80gsm', 'A3', 1),
(8, 'vinyl_gloss', 'فينيل لامع', 'vinyl', 'N/A', 'Roll', 1),
(9, 'vinyl_matte', 'فينيل مطفي', 'vinyl', 'N/A', 'Roll', 1),
(10, 'mug_white', 'مج أبيض سيراميك', 'mug', 'N/A', '11 oz', 1),
(11, 'tshirt_white', 'تيشيرت أبيض قطن', 'tshirt', '180gsm', 'S-XXL', 1),
(12, 'tshirt_black', 'تيشيرت أسود قطن', 'tshirt', '180gsm', 'S-XXL', 1);

-- ============================================
-- MACHINE-MATERIAL RELATIONS
-- ============================================
INSERT OR IGNORE INTO machine_materials (machine_id, material_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
(3, 10), (3, 11), (3, 12),
(4, 10), (4, 11), (4, 12),
(5, 6), (5, 7), (5, 8), (5, 9),
(6, 6), (6, 7),
(7, 8), (7, 9);

-- ============================================
-- TAGS
-- ============================================
INSERT OR IGNORE INTO tags (id, name, color) VALUES
(1, 'رمضان', '#F59E0B'),
(2, 'عيد', '#10B981'),
(3, 'ليزر', '#EF4444'),
(4, 'MDF', '#8B5CF6'),
(5, 'أكريليك', '#3B82F6'),
(6, 'فانوس', '#F97316'),
(7, 'تهنئة', '#EC4899'),
(8, 'بوكس', '#06B6D4'),
(9, 'تيشيرت', '#6366F1'),
(10, 'مج', '#84CC16'),
(11, 'دعوة', '#14B8A6'),
(12, 'كارت', '#D946EF'),
(13, 'استيكر', '#F43F5E'),
(14, 'طباعة', '#0EA5E9'),
(15, 'هدايا', '#EAB308');

-- ============================================
-- DEFAULT SETTINGS
-- ============================================
INSERT OR IGNORE INTO settings (key, value, group_name) VALUES
('app_name', 'المعاونة الفنية | Technical Services', 'general'),
('company_name', 'المعاونة الفنية', 'general'),
('language', 'ar', 'general'),
('theme', 'dark', 'ui'),
('root_storage_folder', 'D:\TechnicalServices', 'storage'),
('photoshop_path', '', 'storage'),
('default_preview_size', 'medium', 'ui'),
('backup_location', 'D:\TechnicalServices\Backups', 'storage'),
('auto_backup_enabled', 'false', 'backup'),
('auto_backup_schedule', 'weekly', 'backup'),
('thumbnail_quality', '85', 'storage'),
('thumbnail_size', '400', 'storage'),
('preview_size', '1200', 'storage'),
('cache_size_mb', '500', 'performance'),
('items_per_page', '24', 'ui'),
('grid_view_default', 'true', 'ui'),
('date_format', 'YYYY-MM-DD', 'general'),
('time_format', '24h', 'general');
