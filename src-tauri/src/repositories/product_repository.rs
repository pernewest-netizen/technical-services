use rusqlite::{Connection, Result, params, OptionalExtension};
use crate::models::{Product, CreateProductRequest};

pub struct ProductRepository;

impl ProductRepository {
    pub fn new() -> Self { Self }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<Product>> {
        let mut stmt = conn.prepare(
            "SELECT p.*, c.display_name as category_name, m.display_name as material_name, 
                    s.display_name as season_name,
                    (SELECT COUNT(*) FROM templates WHERE product_id = p.id) as template_count
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN materials m ON p.material_id = m.id
             LEFT JOIN seasons s ON p.season_id = s.id
             WHERE p.id = ?1"
        )?;

        let product = stmt.query_row(params![id], |row| {
            Ok(Product {
                id: row.get(0)?,
                code: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                category_id: row.get(4)?,
                category_name: row.get(13)?,
                material_id: row.get(5)?,
                material_name: row.get(14)?,
                size: row.get(6)?,
                weight: row.get(7)?,
                production_method_id: row.get(8)?,
                season_id: row.get(9)?,
                season_name: row.get(15)?,
                is_active: row.get(10)?,
                is_archived: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(16)?,
                template_count: row.get(17)?,
            })
        }).optional()?;

        Ok(product)
    }

    pub fn find_all(&self, conn: &Connection, category_id: Option<i64>, 
                    season_id: Option<i64>, search: Option<&str>,
                    limit: i64, offset: i64) -> Result<Vec<Product>> {

        let mut where_clauses = vec!["p.is_active = 1".to_string()];
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![];

        if let Some(cid) = category_id {
            where_clauses.push("p.category_id = ?".to_string());
            params_vec.push(Box::new(cid));
        }
        if let Some(sid) = season_id {
            where_clauses.push("p.season_id = ?".to_string());
            params_vec.push(Box::new(sid));
        }
        if let Some(q) = search {
            where_clauses.push("(p.name LIKE ? OR p.code LIKE ? OR p.description LIKE ?)".to_string());
            let like = format!("%{}%", q);
            params_vec.push(Box::new(like.clone()));
            params_vec.push(Box::new(like.clone()));
            params_vec.push(Box::new(like));
        }

        params_vec.push(Box::new(limit));
        params_vec.push(Box::new(offset));

        let sql = format!(
            "SELECT p.*, c.display_name as category_name, m.display_name as material_name, 
                    s.display_name as season_name,
                    (SELECT COUNT(*) FROM templates WHERE product_id = p.id) as template_count
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN materials m ON p.material_id = m.id
             LEFT JOIN seasons s ON p.season_id = s.id
             WHERE {}
             ORDER BY p.updated_at DESC
             LIMIT ? OFFSET ?",
            where_clauses.join(" AND ")
        );

        let param_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

        let mut stmt = conn.prepare(&sql)?;
        let products = stmt.query_map(param_refs.as_slice(), |row| {
            Ok(Product {
                id: row.get(0)?,
                code: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                category_id: row.get(4)?,
                category_name: row.get(13)?,
                material_id: row.get(5)?,
                material_name: row.get(14)?,
                size: row.get(6)?,
                weight: row.get(7)?,
                production_method_id: row.get(8)?,
                season_id: row.get(9)?,
                season_name: row.get(15)?,
                is_active: row.get(10)?,
                is_archived: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(16)?,
                template_count: row.get(17)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(products)
    }

    pub fn create(&self, conn: &Connection, req: &CreateProductRequest) -> Result<i64> {
        conn.execute(
            "INSERT INTO products (code, name, description, category_id, material_id, size, weight, season_id)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                req.code, req.name, req.description, req.category_id,
                req.material_id, req.size, req.weight, req.season_id
            ],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update(&self, conn: &Connection, id: i64, req: &CreateProductRequest) -> Result<bool> {
        let rows = conn.execute(
            "UPDATE products SET 
                code = ?1, name = ?2, description = ?3, category_id = ?4, 
                material_id = ?5, size = ?6, weight = ?7, season_id = ?8,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?9",
            params![
                req.code, req.name, req.description, req.category_id,
                req.material_id, req.size, req.weight, req.season_id, id
            ],
        )?;
        Ok(rows > 0)
    }

    pub fn delete(&self, conn: &Connection, id: i64) -> Result<bool> {
        let rows = conn.execute("DELETE FROM products WHERE id = ?1", params![id])?;
        Ok(rows > 0)
    }

    pub fn count(&self, conn: &Connection) -> Result<i64> {
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM products WHERE is_active = 1", [], |row| row.get(0)
        )?;
        Ok(count)
    }
}
