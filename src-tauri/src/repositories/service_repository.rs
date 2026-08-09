use rusqlite::{Connection, Result, params, OptionalExtension};
use crate::models::Service;

pub struct ServiceRepository;

impl ServiceRepository {
    pub fn new() -> Self { Self }

    pub fn find_all(&self, conn: &Connection) -> Result<Vec<Service>> {
        let mut stmt = conn.prepare(
            "SELECT s.*, c.display_name as category_name
             FROM services s
             LEFT JOIN categories c ON s.category_id = c.id
             WHERE s.is_active = 1
             ORDER BY s.sort_order, s.display_name"
        )?;
        let services = stmt.query_map([], |row| {
            Ok(Service {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                description: row.get(3)?,
                category_id: row.get(4)?,
                category_name: row.get(8)?,
                is_active: row.get(5)?,
                sort_order: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(9)?,
            })
        })?.collect::<Result<Vec<_>>>()?;
        Ok(services)
    }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<Service>> {
        let mut stmt = conn.prepare(
            "SELECT s.*, c.display_name as category_name
             FROM services s
             LEFT JOIN categories c ON s.category_id = c.id
             WHERE s.id = ?1"
        )?;
        let service = stmt.query_row(params![id], |row| {
            Ok(Service {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                description: row.get(3)?,
                category_id: row.get(4)?,
                category_name: row.get(8)?,
                is_active: row.get(5)?,
                sort_order: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(9)?,
            })
        }).optional()?;
        Ok(service)
    }

    pub fn create(&self, conn: &Connection, name: &str, display_name: &str,
                  description: Option<&str>, category_id: Option<i64>) -> Result<i64> {
        conn.execute(
            "INSERT INTO services (name, display_name, description, category_id)
             VALUES (?1, ?2, ?3, ?4)",
            params![name, display_name, description, category_id],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update(&self, conn: &Connection, id: i64, display_name: &str,
                  description: Option<&str>, category_id: Option<i64>) -> Result<bool> {
        let rows = conn.execute(
            "UPDATE services SET display_name = ?1, description = ?2, category_id = ?3,
             updated_at = CURRENT_TIMESTAMP WHERE id = ?4",
            params![display_name, description, category_id, id],
        )?;
        Ok(rows > 0)
    }

    pub fn delete(&self, conn: &Connection, id: i64) -> Result<bool> {
        let rows = conn.execute("DELETE FROM services WHERE id = ?1", params![id])?;
        Ok(rows > 0)
    }
}
