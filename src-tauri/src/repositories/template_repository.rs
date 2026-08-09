use rusqlite::{Connection, Result, params, OptionalExtension};
use crate::models::{Template, TemplateVersion, Tag, FileRecord, CreateTemplateRequest};

pub struct TemplateRepository;

impl TemplateRepository {
    pub fn new() -> Self { Self }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<Template>> {
        let mut stmt = conn.prepare(
            "SELECT 
                t.id, t.code, t.name, t.description, 
                t.season_id, s.display_name as season_name,
                t.category_id, c.display_name as category_name,
                t.product_id, p.name as product_name,
                t.material_id, m.display_name as material_name,
                t.machine_id, mac.display_name as machine_name,
                t.size, t.is_editable, t.current_version, 
                t.is_favorite, t.is_active, t.is_archived,
                t.created_by, u.display_name as created_by_name,
                t.created_at, t.updated_at,
                (SELECT relative_path FROM files WHERE template_id = t.id AND file_type = 'THUMBNAIL' AND is_primary = 1 LIMIT 1) as thumbnail_path,
                (SELECT relative_path FROM files WHERE template_id = t.id AND file_type = 'PREVIEW' AND is_primary = 1 LIMIT 1) as preview_path
             FROM templates t
             LEFT JOIN seasons s ON t.season_id = s.id
             LEFT JOIN categories c ON t.category_id = c.id
             LEFT JOIN products p ON t.product_id = p.id
             LEFT JOIN materials m ON t.material_id = m.id
             LEFT JOIN machines mac ON t.machine_id = mac.id
             LEFT JOIN users u ON t.created_by = u.id
             WHERE t.id = ?1"
        )?;

        let template = stmt.query_row(params![id], |row| {
            self.map_template_row(row)
        }).optional()?;

        Ok(template)
    }

    pub fn find_all(&self, conn: &Connection, 
                    season_id: Option<i64>, 
                    category_id: Option<i64>,
                    product_id: Option<i64>,
                    material_id: Option<i64>,
                    search: Option<&str>,
                    is_favorite: Option<bool>,
                    is_archived: Option<bool>,
                    limit: i64, 
                    offset: i64) -> Result<Vec<Template>> {

        let mut where_clauses = vec!["t.is_active = 1".to_string()];
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![];

        if let Some(sid) = season_id {
            where_clauses.push("t.season_id = ?".to_string());
            params_vec.push(Box::new(sid));
        }
        if let Some(cid) = category_id {
            where_clauses.push("t.category_id = ?".to_string());
            params_vec.push(Box::new(cid));
        }
        if let Some(pid) = product_id {
            where_clauses.push("t.product_id = ?".to_string());
            params_vec.push(Box::new(pid));
        }
        if let Some(mid) = material_id {
            where_clauses.push("t.material_id = ?".to_string());
            params_vec.push(Box::new(mid));
        }
        if let Some(fav) = is_favorite {
            where_clauses.push("t.is_favorite = ?".to_string());
            params_vec.push(Box::new(fav));
        }
        if let Some(arch) = is_archived {
            where_clauses.push("t.is_archived = ?".to_string());
            params_vec.push(Box::new(arch));
        }
        if let Some(q) = search {
            where_clauses.push("(t.name LIKE ? OR t.code LIKE ? OR t.description LIKE ?)".to_string());
            let like = format!("%{}%", q);
            params_vec.push(Box::new(like.clone()));
            params_vec.push(Box::new(like.clone()));
            params_vec.push(Box::new(like));
        }

        params_vec.push(Box::new(limit));
        params_vec.push(Box::new(offset));

        let sql = format!(
            "SELECT 
                t.id, t.code, t.name, t.description, 
                t.season_id, s.display_name as season_name,
                t.category_id, c.display_name as category_name,
                t.product_id, p.name as product_name,
                t.material_id, m.display_name as material_name,
                t.machine_id, mac.display_name as machine_name,
                t.size, t.is_editable, t.current_version, 
                t.is_favorite, t.is_active, t.is_archived,
                t.created_by, u.display_name as created_by_name,
                t.created_at, t.updated_at,
                (SELECT relative_path FROM files WHERE template_id = t.id AND file_type = 'THUMBNAIL' AND is_primary = 1 LIMIT 1) as thumbnail_path,
                (SELECT relative_path FROM files WHERE template_id = t.id AND file_type = 'PREVIEW' AND is_primary = 1 LIMIT 1) as preview_path
             FROM templates t
             LEFT JOIN seasons s ON t.season_id = s.id
             LEFT JOIN categories c ON t.category_id = c.id
             LEFT JOIN products p ON t.product_id = p.id
             LEFT JOIN materials m ON t.material_id = m.id
             LEFT JOIN machines mac ON t.machine_id = mac.id
             LEFT JOIN users u ON t.created_by = u.id
             WHERE {}
             ORDER BY t.updated_at DESC
             LIMIT ? OFFSET ?",
            where_clauses.join(" AND ")
        );

        let param_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

        let mut stmt = conn.prepare(&sql)?;
        let templates = stmt.query_map(param_refs.as_slice(), |row| {
            self.map_template_row(row)
        })?.collect::<Result<Vec<_>>>()?;

        // Load tags for each template
        let mut result = vec![];
        for mut template in templates {
            template.tags = self.get_template_tags(conn, template.id)?;
            result.push(template);
        }

        Ok(result)
    }

    pub fn create(&self, conn: &Connection, req: &CreateTemplateRequest, user_id: i64) -> Result<i64> {
        conn.execute(
            "INSERT INTO templates (code, name, description, season_id, category_id, 
             product_id, material_id, machine_id, size, is_editable, created_by)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                req.code, req.name, req.description, req.season_id, req.category_id,
                req.product_id, req.material_id, req.machine_id, req.size,
                req.is_editable.unwrap_or(true), user_id
            ],
        )?;

        let template_id = conn.last_insert_rowid();

        // Add tags
        for tag_name in &req.tags {
            self.add_tag_to_template(conn, template_id, tag_name)?;
        }

        // Create initial version
        conn.execute(
            "INSERT INTO template_versions (template_id, version_number, change_notes, created_by)
             VALUES (?1, 1, 'Initial version', ?2)",
            params![template_id, user_id],
        )?;

        Ok(template_id)
    }

    pub fn update(&self, conn: &Connection, id: i64, req: &CreateTemplateRequest) -> Result<bool> {
        let rows = conn.execute(
            "UPDATE templates SET 
                code = ?1, name = ?2, description = ?3, season_id = ?4, 
                category_id = ?5, product_id = ?6, material_id = ?7, 
                machine_id = ?8, size = ?9, is_editable = ?10,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?11",
            params![
                req.code, req.name, req.description, req.season_id, req.category_id,
                req.product_id, req.material_id, req.machine_id, req.size,
                req.is_editable.unwrap_or(true), id
            ],
        )?;

        // Update tags
        conn.execute("DELETE FROM template_tags WHERE template_id = ?1", params![id])?;
        for tag_name in &req.tags {
            self.add_tag_to_template(conn, id, tag_name)?;
        }

        Ok(rows > 0)
    }

    pub fn delete(&self, conn: &Connection, id: i64) -> Result<bool> {
        let rows = conn.execute("DELETE FROM templates WHERE id = ?1", params![id])?;
        Ok(rows > 0)
    }

    pub fn toggle_favorite(&self, conn: &Connection, id: i64) -> Result<bool> {
        conn.execute(
            "UPDATE templates SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?1",
            params![id],
        )?;

        let is_fav: bool = conn.query_row(
            "SELECT is_favorite FROM templates WHERE id = ?1",
            params![id],
            |row| row.get(0)
        )?;

        Ok(is_fav)
    }

    pub fn archive(&self, conn: &Connection, id: i64, archive: bool) -> Result<bool> {
        let rows = conn.execute(
            "UPDATE templates SET is_archived = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
            params![archive, id],
        )?;
        Ok(rows > 0)
    }

    pub fn add_version(&self, conn: &Connection, template_id: i64, 
                       change_notes: Option<&str>, user_id: i64) -> Result<i64> {
        let current_version: i64 = conn.query_row(
            "SELECT current_version FROM templates WHERE id = ?1",
            params![template_id],
            |row| row.get(0)
        )?;

        let new_version = current_version + 1;

        conn.execute(
            "INSERT INTO template_versions (template_id, version_number, change_notes, created_by)
             VALUES (?1, ?2, ?3, ?4)",
            params![template_id, new_version, change_notes, user_id],
        )?;

        conn.execute(
            "UPDATE templates SET current_version = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
            params![new_version, template_id],
        )?;

        Ok(conn.last_insert_rowid())
    }

    pub fn get_versions(&self, conn: &Connection, template_id: i64) -> Result<Vec<TemplateVersion>> {
        let mut stmt = conn.prepare(
            "SELECT v.id, v.template_id, v.version_number, v.change_notes, 
                    v.created_by, u.display_name as created_by_name, v.created_at
             FROM template_versions v
             LEFT JOIN users u ON v.created_by = u.id
             WHERE v.template_id = ?1
             ORDER BY v.version_number DESC"
        )?;

        let versions = stmt.query_map(params![template_id], |row| {
            Ok(TemplateVersion {
                id: row.get(0)?,
                template_id: row.get(1)?,
                version_number: row.get(2)?,
                change_notes: row.get(3)?,
                created_by: row.get(4)?,
                created_by_name: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(versions)
    }

    pub fn count(&self, conn: &Connection) -> Result<i64> {
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM templates WHERE is_active = 1", [], |row| row.get(0))?;
        Ok(count)
    }

    pub fn get_recent(&self, conn: &Connection, limit: i64) -> Result<Vec<Template>> {
        self.find_all(conn, None, None, None, None, None, None, Some(false), limit, 0)
    }

    pub fn get_most_used(&self, conn: &Connection, limit: i64) -> Result<Vec<Template>> {
        // This would require a usage counter - simplified for now
        self.find_all(conn, None, None, None, None, None, None, Some(false), limit, 0)
    }

    // Tags management
    fn add_tag_to_template(&self, conn: &Connection, template_id: i64, tag_name: &str) -> Result<()> {
        // Get or create tag
        let tag_id: i64 = match conn.query_row(
            "SELECT id FROM tags WHERE name = ?1",
            params![tag_name],
            |row| row.get(0)
        ).optional()? {
            Some(id) => id,
            None => {
                conn.execute("INSERT INTO tags (name) VALUES (?1)", params![tag_name])?;
                conn.last_insert_rowid()
            }
        };

        conn.execute(
            "INSERT OR IGNORE INTO template_tags (template_id, tag_id) VALUES (?1, ?2)",
            params![template_id, tag_id],
        )?;

        // Update usage count
        conn.execute(
            "UPDATE tags SET usage_count = (SELECT COUNT(*) FROM template_tags WHERE tag_id = ?1) WHERE id = ?1",
            params![tag_id],
        )?;

        Ok(())
    }

    fn get_template_tags(&self, conn: &Connection, template_id: i64) -> Result<Vec<Tag>> {
        let mut stmt = conn.prepare(
            "SELECT t.id, t.name, t.color, t.usage_count, t.created_at
             FROM tags t
             JOIN template_tags tt ON t.id = tt.tag_id
             WHERE tt.template_id = ?1
             ORDER BY t.name"
        )?;

        let tags = stmt.query_map(params![template_id], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                usage_count: row.get(3)?,
                created_at: row.get(4)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(tags)
    }

    fn map_template_row(&self, row: &rusqlite::Row) -> Result<Template> {
        Ok(Template {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            description: row.get(3)?,
            season_id: row.get(4)?,
            season_name: row.get(5)?,
            category_id: row.get(6)?,
            category_name: row.get(7)?,
            product_id: row.get(8)?,
            product_name: row.get(9)?,
            material_id: row.get(10)?,
            material_name: row.get(11)?,
            machine_id: row.get(12)?,
            machine_name: row.get(13)?,
            size: row.get(14)?,
            is_editable: row.get(15)?,
            current_version: row.get(16)?,
            is_favorite: row.get(17)?,
            is_active: row.get(18)?,
            is_archived: row.get(19)?,
            created_by: row.get(20)?,
            created_by_name: row.get(21)?,
            created_at: row.get(22)?,
            updated_at: row.get(23)?,
            thumbnail_path: row.get(24)?,
            preview_path: row.get(25)?,
            tags: vec![], // Will be populated separately
        })
    }
}
