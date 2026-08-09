use rusqlite::{Connection, Result, params, OptionalExtension};
use crate::models::Category;

pub struct CategoryRepository;

impl CategoryRepository {
    pub fn new() -> Self { Self }

    pub fn find_all(&self, conn: &Connection) -> Result<Vec<Category>> {
        let mut stmt = conn.prepare(
            "SELECT c.*,
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count,
                    (SELECT COUNT(*) FROM templates WHERE category_id = c.id) as template_count
             FROM categories c
             WHERE c.is_active = 1
             ORDER BY c.sort_order, c.display_name"
        )?;
        let categories = stmt.query_map([], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                description: row.get(3)?,
                icon: row.get(4)?,
                color: row.get(5)?,
                parent_id: row.get(6)?,
                is_active: row.get(7)?,
                sort_order: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
                product_count: row.get(11)?,
                template_count: row.get(12)?,
            })
        })?.collect::<Result<Vec<_>>>()?;
        Ok(categories)
    }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<Category>> {
        let mut stmt = conn.prepare("SELECT * FROM categories WHERE id = ?1")?;
        let cat = stmt.query_row(params![id], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                description: row.get(3)?,
                icon: row.get(4)?,
                color: row.get(5)?,
                parent_id: row.get(6)?,
                is_active: row.get(7)?,
                sort_order: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
                product_count: None,
                template_count: None,
            })
        }).optional()?;
        Ok(cat)
    }

    pub fn create(&self, conn: &Connection, name: &str, display_name: &str, 
                  description: Option<&str>, icon: Option<&str>, 
                  color: Option<&str>, parent_id: Option<i64>) -> Result<i64> {
        conn.execute(
            "INSERT INTO categories (name, display_name, description, icon, color, parent_id)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![name, display_name, description, icon, color, parent_id],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update(&self, conn: &Connection, id: i64, display_name: &str,
                  description: Option<&str>, icon: Option<&str>,
                  color: Option<&str>, sort_order: Option<i64>) -> Result<bool> {
        let rows = conn.execute(
            "UPDATE categories SET display_name = ?1, description = ?2, icon = ?3, 
             color = ?4, sort_order = COALESCE(?5, sort_order), updated_at = CURRENT_TIMESTAMP
             WHERE id = ?6",
            params![display_name, description, icon, color, sort_order, id],
        )?;
        Ok(rows > 0)
    }

    pub fn delete(&self, conn: &Connection, id: i64) -> Result<bool> {
        let rows = conn.execute("DELETE FROM categories WHERE id = ?1", params![id])?;
        Ok(rows > 0)
    }
}
