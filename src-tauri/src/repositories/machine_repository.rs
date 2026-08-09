use rusqlite::{Connection, Result, params, OptionalExtension};
use crate::models::{Machine, Material};

pub struct MachineRepository;

impl MachineRepository {
    pub fn new() -> Self { Self }

    pub fn find_all(&self, conn: &Connection) -> Result<Vec<Machine>> {
        let mut stmt = conn.prepare("SELECT * FROM machines WHERE is_active = 1 ORDER BY display_name")?;
        let machines = stmt.query_map([], |row| {
            Ok(Machine {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                machine_type: row.get(3)?,
                brand: row.get(4)?,
                model: row.get(5)?,
                power: row.get(6)?,
                work_area: row.get(7)?,
                notes: row.get(8)?,
                maintenance_notes: row.get(9)?,
                last_maintenance: row.get(10)?,
                is_active: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(13)?,
                materials: vec![], // Will be populated separately
            })
        })?.collect::<Result<Vec<_>>>()?;

        let mut result = vec![];
        for mut machine in machines {
            machine.materials = self.get_machine_materials(conn, machine.id)?;
            result.push(machine);
        }

        Ok(result)
    }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<Machine>> {
        let mut stmt = conn.prepare("SELECT * FROM machines WHERE id = ?1")?;
        let machine = stmt.query_row(params![id], |row| {
            Ok(Machine {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                machine_type: row.get(3)?,
                brand: row.get(4)?,
                model: row.get(5)?,
                power: row.get(6)?,
                work_area: row.get(7)?,
                notes: row.get(8)?,
                maintenance_notes: row.get(9)?,
                last_maintenance: row.get(10)?,
                is_active: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(13)?,
                materials: vec![],
            })
        }).optional()?;

        Ok(machine)
    }

    fn get_machine_materials(&self, conn: &Connection, machine_id: i64) -> Result<Vec<Material>> {
        let mut stmt = conn.prepare(
            "SELECT m.* FROM materials m
             JOIN machine_materials mm ON m.id = mm.material_id
             WHERE mm.machine_id = ?1 AND m.is_active = 1"
        )?;

        let materials = stmt.query_map(params![machine_id], |row| {
            Ok(Material {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                material_type: row.get(3)?,
                thickness: row.get(4)?,
                size: row.get(5)?,
                color: row.get(6)?,
                notes: row.get(7)?,
                is_active: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(materials)
    }
}

pub struct MaterialRepository;

impl MaterialRepository {
    pub fn new() -> Self { Self }

    pub fn find_all(&self, conn: &Connection) -> Result<Vec<Material>> {
        let mut stmt = conn.prepare("SELECT * FROM materials WHERE is_active = 1 ORDER BY display_name")?;
        let materials = stmt.query_map([], |row| {
            Ok(Material {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                material_type: row.get(3)?,
                thickness: row.get(4)?,
                size: row.get(5)?,
                color: row.get(6)?,
                notes: row.get(7)?,
                is_active: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })?.collect::<Result<Vec<_>>>()?;
        Ok(materials)
    }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<Material>> {
        let mut stmt = conn.prepare("SELECT * FROM materials WHERE id = ?1")?;
        let material = stmt.query_row(params![id], |row| {
            Ok(Material {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                material_type: row.get(3)?,
                thickness: row.get(4)?,
                size: row.get(5)?,
                color: row.get(6)?,
                notes: row.get(7)?,
                is_active: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        }).optional()?;
        Ok(material)
    }
}
