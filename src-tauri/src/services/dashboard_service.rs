use crate::db::DatabaseManager;
use crate::models::DashboardStats;
use crate::repositories::{TemplateRepository, ProductRepository, SeasonRepository};
use std::path::PathBuf;

pub struct DashboardService;

impl DashboardService {
    pub fn new() -> Self { Self }

    pub fn get_stats(&self, db: &DatabaseManager) -> Result<DashboardStats, String> {
        let conn = db.get_connection();
        let template_repo = TemplateRepository::new();
        let product_repo = ProductRepository::new();
        let season_repo = SeasonRepository::new();

        let total_templates = template_repo.count(&conn).unwrap_or(0);
        let total_products = product_repo.count(&conn).unwrap_or(0);
        let total_seasons = season_repo.count(&conn).unwrap_or(0);

        let total_files: i64 = conn.query_row(
            "SELECT COUNT(*) FROM files", [], |row| row.get(0)
        ).unwrap_or(0);

        let recent_templates = template_repo.get_recent(&conn, 10)
            .unwrap_or_default();

        let recent_activity = self.get_recent_activity(&conn, 10)?;

        let current_season = self.get_current_season(&conn)?;

        let storage_used_mb = self.calculate_storage(db)?;

        let last_backup = conn.query_row(
            "SELECT created_at FROM activity_logs 
             WHERE action = 'BACKUP' 
             ORDER BY created_at DESC LIMIT 1",
            [],
            |row| row.get::<_, Option<String>>(0)
        ).unwrap_or(None);

        Ok(DashboardStats {
            total_templates,
            total_products,
            total_seasons,
            total_files,
            recent_templates,
            recent_activity,
            current_season,
            storage_used_mb,
            last_backup,
        })
    }

    fn get_recent_activity(&self, conn: &rusqlite::Connection, limit: i64) -> Result<Vec<crate::models::ActivityLog>, String> {
        let mut stmt = conn.prepare(
            "SELECT a.id, a.user_id, u.display_name as user_name, a.action, 
                    a.entity_type, a.entity_id, a.entity_code, a.details, 
                    a.ip_address, a.created_at
             FROM activity_logs a
             LEFT JOIN users u ON a.user_id = u.id
             ORDER BY a.created_at DESC
             LIMIT ?1"
        ).map_err(|e| e.to_string())?;

        let logs = stmt.query_map(rusqlite::params![limit], |row| {
            Ok(crate::models::ActivityLog {
                id: row.get(0)?,
                user_id: row.get(1)?,
                user_name: row.get(2)?,
                action: row.get(3)?,
                entity_type: row.get(4)?,
                entity_id: row.get(5)?,
                entity_code: row.get(6)?,
                details: row.get(7)?,
                ip_address: row.get(8)?,
                created_at: row.get(9)?,
            })
        }).map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

        Ok(logs)
    }

    fn get_current_season(&self, conn: &rusqlite::Connection) -> Result<Option<crate::models::Season>, String> {
        let season_repo = SeasonRepository::new();
        let seasons = season_repo.find_all(conn, false).map_err(|e| e.to_string())?;
        Ok(seasons.into_iter().next())
    }

    fn calculate_storage(&self, db: &DatabaseManager) -> Result<f64, String> {
        let db_path = db.get_db_path();
        let metadata = std::fs::metadata(&db_path).map_err(|e| e.to_string())?;
        let size_mb = metadata.len() as f64 / (1024.0 * 1024.0);
        Ok(size_mb)
    }
}
