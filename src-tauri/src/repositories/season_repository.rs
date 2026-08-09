use rusqlite::{Connection, Result, params, OptionalExtension};
use crate::models::{Season, CreateSeasonRequest};

pub struct SeasonRepository;

impl SeasonRepository {
    pub fn new() -> Self { Self }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<Season>> {
        let mut stmt = conn.prepare(
            "SELECT s.*,
                    (SELECT COUNT(*) FROM products WHERE season_id = s.id) as product_count,
                    (SELECT COUNT(*) FROM templates WHERE season_id = s.id) as template_count
             FROM seasons s WHERE s.id = ?1"
        )?;

        let season = stmt.query_row(params![id], |row| {
            Ok(Season {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                description: row.get(3)?,
                image_path: row.get(4)?,
                date_start: row.get(5)?,
                date_end: row.get(6)?,
                is_active: row.get(7)?,
                is_archived: row.get(8)?,
                sort_order: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
                product_count: row.get(12)?,
                template_count: row.get(13)?,
            })
        }).optional()?;

        Ok(season)
    }

    pub fn find_all(&self, conn: &Connection, include_archived: bool) -> Result<Vec<Season>> {
        let sql = if include_archived {
            "SELECT s.*,
                    (SELECT COUNT(*) FROM products WHERE season_id = s.id) as product_count,
                    (SELECT COUNT(*) FROM templates WHERE season_id = s.id) as template_count
             FROM seasons s
             ORDER BY s.sort_order, s.created_at DESC"
        } else {
            "SELECT s.*,
                    (SELECT COUNT(*) FROM products WHERE season_id = s.id) as product_count,
                    (SELECT COUNT(*) FROM templates WHERE season_id = s.id) as template_count
             FROM seasons s
             WHERE s.is_archived = 0
             ORDER BY s.sort_order, s.created_at DESC"
        };

        let mut stmt = conn.prepare(sql)?;
        let seasons = stmt.query_map([], |row| {
            Ok(Season {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                description: row.get(3)?,
                image_path: row.get(4)?,
                date_start: row.get(5)?,
                date_end: row.get(6)?,
                is_active: row.get(7)?,
                is_archived: row.get(8)?,
                sort_order: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
                product_count: row.get(12)?,
                template_count: row.get(13)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(seasons)
    }

    pub fn create(&self, conn: &Connection, req: &CreateSeasonRequest) -> Result<i64> {
        conn.execute(
            "INSERT INTO seasons (name, display_name, description, image_path, 
             date_start, date_end, sort_order)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                req.name, req.display_name, req.description, req.image_path,
                req.date_start, req.date_end, req.sort_order.unwrap_or(0)
            ],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update(&self, conn: &Connection, id: i64, req: &CreateSeasonRequest) -> Result<bool> {
        let rows = conn.execute(
            "UPDATE seasons SET 
                name = ?1, display_name = ?2, description = ?3, image_path = ?4,
                date_start = ?5, date_end = ?6, sort_order = ?7,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?8",
            params![
                req.name, req.display_name, req.description, req.image_path,
                req.date_start, req.date_end, req.sort_order.unwrap_or(0), id
            ],
        )?;
        Ok(rows > 0)
    }

    pub fn archive(&self, conn: &Connection, id: i64, archive: bool) -> Result<bool> {
        let rows = conn.execute(
            "UPDATE seasons SET is_archived = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
            params![archive, id],
        )?;
        Ok(rows > 0)
    }

    pub fn delete(&self, conn: &Connection, id: i64) -> Result<bool> {
        let rows = conn.execute("DELETE FROM seasons WHERE id = ?1", params![id])?;
        Ok(rows > 0)
    }

    pub fn count(&self, conn: &Connection) -> Result<i64> {
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM seasons WHERE is_archived = 0", [], |row| row.get(0)
        )?;
        Ok(count)
    }
}
