use rusqlite::{Connection, Result, OpenFlags};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::api::path::app_local_data_dir;
use tauri::Config;

pub struct DatabaseManager {
    connection: Mutex<Connection>,
    db_path: PathBuf,
}

impl DatabaseManager {
    pub fn new(config: &Config) -> Result<Self> {
        let app_dir = app_local_data_dir(config)
            .expect("Failed to get app local data directory");

        let db_path = app_dir.join("technical_services.db");

        std::fs::create_dir_all(&app_dir)
            .expect("Failed to create app data directory");

        let conn = Connection::open_with_flags(
            &db_path,
            OpenFlags::SQLITE_OPEN_READ_WRITE
                | OpenFlags::SQLITE_OPEN_CREATE
                | OpenFlags::SQLITE_OPEN_FULL_MUTEX,
        )?;

        conn.execute("PRAGMA foreign_keys = ON", [])?;
        conn.execute("PRAGMA journal_mode = WAL", [])?;
        conn.execute("PRAGMA synchronous = NORMAL", [])?;
        conn.execute("PRAGMA cache_size = -64000", [])?;
        conn.execute("PRAGMA temp_store = MEMORY", [])?;

        let manager = Self {
            connection: Mutex::new(conn),
            db_path,
        };

        manager.run_migrations()?;

        Ok(manager)
    }

    pub fn get_connection(&self) -> std::sync::MutexGuard<Connection> {
        self.connection.lock().expect("Failed to lock database connection")
    }

    pub fn get_db_path(&self) -> &PathBuf {
        &self.db_path
    }

    fn run_migrations(&self) -> Result<()> {
        let mut conn = self.get_connection();

        conn.execute(
            "CREATE TABLE IF NOT EXISTS __migrations (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        let applied: Vec<String> = conn
            .prepare("SELECT name FROM __migrations ORDER BY id")?
            .query_map([], |row| row.get(0))?
            .collect::<Result<Vec<_>>>()?;

        let migrations = vec![
            ("001_initial_schema.sql", include_str!("../../migrations/001_initial_schema.sql")),
            ("002_seed_data.sql", include_str!("../../migrations/002_seed_data.sql")),
        ];

        for (name, sql) in migrations {
            if !applied.contains(&name.to_string()) {
                conn.execute_batch(sql)?;
                conn.execute(
                    "INSERT INTO __migrations (name) VALUES (?1)",
                    [name],
                )?;
            }
        }

        Ok(())
    }

    pub fn backup(&self, backup_path: &PathBuf) -> Result<()> {
        let conn = self.get_connection();
        conn.execute(
            &format!("VACUUM INTO '{}'", backup_path.to_string_lossy()),
            [],
        )?;
        Ok(())
    }
}

pub struct AppState {
    pub db: DatabaseManager,
}
