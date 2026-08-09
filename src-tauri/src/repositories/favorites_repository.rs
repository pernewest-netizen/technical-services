use rusqlite::{Connection, Result, params};
use crate::models::Template;

pub struct FavoritesRepository;

impl FavoritesRepository {
    pub fn new() -> Self { Self }

    pub fn get_favorites(&self, conn: &Connection, user_id: i64) -> Result<Vec<Template>> {
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
             JOIN favorites f ON t.id = f.template_id
             LEFT JOIN seasons s ON t.season_id = s.id
             LEFT JOIN categories c ON t.category_id = c.id
             LEFT JOIN products p ON t.product_id = p.id
             LEFT JOIN materials m ON t.material_id = m.id
             LEFT JOIN machines mac ON t.machine_id = mac.id
             LEFT JOIN users u ON t.created_by = u.id
             WHERE f.user_id = ?1 AND t.is_active = 1
             ORDER BY f.created_at DESC"
        )?;

        let templates = stmt.query_map(params![user_id], |row| {
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
                is_favorite: true,
                is_active: row.get(18)?,
                is_archived: row.get(19)?,
                created_by: row.get(20)?,
                created_by_name: row.get(21)?,
                created_at: row.get(22)?,
                updated_at: row.get(23)?,
                thumbnail_path: row.get(24)?,
                preview_path: row.get(25)?,
                tags: vec![],
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(templates)
    }

    pub fn add_favorite(&self, conn: &Connection, user_id: i64, template_id: i64) -> Result<()> {
        conn.execute(
            "INSERT OR IGNORE INTO favorites (user_id, template_id) VALUES (?1, ?2)",
            params![user_id, template_id],
        )?;
        conn.execute(
            "UPDATE templates SET is_favorite = 1 WHERE id = ?1",
            params![template_id],
        )?;
        Ok(())
    }

    pub fn remove_favorite(&self, conn: &Connection, user_id: i64, template_id: i64) -> Result<()> {
        conn.execute(
            "DELETE FROM favorites WHERE user_id = ?1 AND template_id = ?2",
            params![user_id, template_id],
        )?;
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM favorites WHERE template_id = ?1",
            params![template_id],
            |row| row.get(0)
        )?;
        if count == 0 {
            conn.execute(
                "UPDATE templates SET is_favorite = 0 WHERE id = ?1",
                params![template_id],
            )?;
        }
        Ok(())
    }
}
