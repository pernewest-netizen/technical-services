use rusqlite::{Connection, Result, params, OptionalExtension};
use crate::models::{ProductionGuide, ProductionStep};

pub struct ProductionGuideRepository;

impl ProductionGuideRepository {
    pub fn new() -> Self { Self }

    pub fn find_all(&self, conn: &Connection) -> Result<Vec<ProductionGuide>> {
        let mut stmt = conn.prepare(
            "SELECT g.*, p.name as product_name, s.display_name as service_name,
                    m.display_name as machine_name, mat.display_name as material_name
             FROM production_guides g
             LEFT JOIN products p ON g.product_id = p.id
             LEFT JOIN services s ON g.service_id = s.id
             LEFT JOIN machines m ON g.machine_id = m.id
             LEFT JOIN materials mat ON g.material_id = mat.id
             WHERE g.is_active = 1
             ORDER BY g.name"
        )?;
        let guides = stmt.query_map([], |row| {
            Ok(ProductionGuide {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                product_id: row.get(3)?,
                product_name: row.get(10)?,
                service_id: row.get(4)?,
                service_name: row.get(11)?,
                machine_id: row.get(5)?,
                machine_name: row.get(12)?,
                material_id: row.get(6)?,
                material_name: row.get(13)?,
                estimated_time: row.get(7)?,
                notes: row.get(8)?,
                is_active: row.get(9)?,
                created_at: row.get(14)?,
                updated_at: row.get(15)?,
                steps: vec![],
            })
        })?.collect::<Result<Vec<_>>>()?;

        let mut result = vec![];
        for mut guide in guides {
            guide.steps = self.get_steps(conn, guide.id)?;
            result.push(guide);
        }
        Ok(result)
    }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<ProductionGuide>> {
        let mut stmt = conn.prepare(
            "SELECT g.*, p.name as product_name, s.display_name as service_name,
                    m.display_name as machine_name, mat.display_name as material_name
             FROM production_guides g
             LEFT JOIN products p ON g.product_id = p.id
             LEFT JOIN services s ON g.service_id = s.id
             LEFT JOIN machines m ON g.machine_id = m.id
             LEFT JOIN materials mat ON g.material_id = mat.id
             WHERE g.id = ?1"
        )?;
        let mut guide = stmt.query_row(params![id], |row| {
            Ok(ProductionGuide {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                product_id: row.get(3)?,
                product_name: row.get(10)?,
                service_id: row.get(4)?,
                service_name: row.get(11)?,
                machine_id: row.get(5)?,
                machine_name: row.get(12)?,
                material_id: row.get(6)?,
                material_name: row.get(13)?,
                estimated_time: row.get(7)?,
                notes: row.get(8)?,
                is_active: row.get(9)?,
                created_at: row.get(14)?,
                updated_at: row.get(15)?,
                steps: vec![],
            })
        }).optional()?;

        if let Some(ref mut g) = guide {
            g.steps = self.get_steps(conn, g.id)?;
        }
        Ok(guide)
    }

    fn get_steps(&self, conn: &Connection, guide_id: i64) -> Result<Vec<ProductionStep>> {
        let mut stmt = conn.prepare(
            "SELECT ps.*, m.display_name as required_machine_name, mat.display_name as required_material_name
             FROM production_steps ps
             LEFT JOIN machines m ON ps.required_machine_id = m.id
             LEFT JOIN materials mat ON ps.required_material_id = mat.id
             WHERE ps.guide_id = ?1 AND ps.is_active = 1
             ORDER BY ps.step_number"
        )?;
        let steps = stmt.query_map(params![guide_id], |row| {
            Ok(ProductionStep {
                id: row.get(0)?,
                guide_id: row.get(1)?,
                step_number: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                image_path: row.get(5)?,
                warning: row.get(6)?,
                required_machine_id: row.get(7)?,
                required_machine_name: row.get(11)?,
                required_material_id: row.get(8)?,
                required_material_name: row.get(12)?,
                estimated_time: row.get(9)?,
                is_active: row.get(10)?,
            })
        })?.collect::<Result<Vec<_>>>()?;
        Ok(steps)
    }

    pub fn create(&self, conn: &Connection, name: &str, description: Option<&str>,
                  product_id: Option<i64>, service_id: Option<i64>,
                  machine_id: Option<i64>, material_id: Option<i64>) -> Result<i64> {
        conn.execute(
            "INSERT INTO production_guides (name, description, product_id, service_id, machine_id, material_id)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![name, description, product_id, service_id, machine_id, material_id],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn add_step(&self, conn: &Connection, guide_id: i64, step_number: i64,
                    title: &str, description: Option<&str>, warning: Option<&str>) -> Result<i64> {
        conn.execute(
            "INSERT INTO production_steps (guide_id, step_number, title, description, warning)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![guide_id, step_number, title, description, warning],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn delete(&self, conn: &Connection, id: i64) -> Result<bool> {
        conn.execute("DELETE FROM production_steps WHERE guide_id = ?1", params![id])?;
        let rows = conn.execute("DELETE FROM production_guides WHERE id = ?1", params![id])?;
        Ok(rows > 0)
    }
}
