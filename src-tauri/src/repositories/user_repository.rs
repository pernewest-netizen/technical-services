use rusqlite::{Connection, Result, params};
use crate::models::{User, UserWithRole, Role};
use bcrypt::{hash, verify, DEFAULT_COST};

pub struct UserRepository;

impl UserRepository {
    pub fn new() -> Self {
        Self
    }

    pub fn find_by_username(&self, conn: &Connection, username: &str) -> Result<Option<User>> {
        let mut stmt = conn.prepare(
            "SELECT id, username, display_name, password_hash, role_id, is_active, 
                    last_login, created_at, updated_at 
             FROM users WHERE username = ?1"
        )?;

        let user = stmt.query_row(params![username], |row| {
            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                display_name: row.get(2)?,
                password_hash: row.get(3)?,
                role_id: row.get(4)?,
                is_active: row.get(5)?,
                last_login: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        }).optional()?;

        Ok(user)
    }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<UserWithRole>> {
        let mut stmt = conn.prepare(
            "SELECT u.id, u.username, u.display_name, u.password_hash, u.role_id, 
                    u.is_active, u.last_login, u.created_at, u.updated_at,
                    r.name as role_name, r.display_name as role_display_name, r.permissions
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.id = ?1"
        )?;

        let user = stmt.query_row(params![id], |row| {
            let permissions_str: String = row.get(11)?;
            let permissions: Vec<String> = serde_json::from_str(&permissions_str).unwrap_or_default();

            Ok(UserWithRole {
                user: User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    display_name: row.get(2)?,
                    password_hash: row.get(3)?,
                    role_id: row.get(4)?,
                    is_active: row.get(5)?,
                    last_login: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                },
                role_name: row.get(9)?,
                role_display_name: row.get(10)?,
                permissions,
            })
        }).optional()?;

        Ok(user)
    }

    pub fn find_all(&self, conn: &Connection) -> Result<Vec<UserWithRole>> {
        let mut stmt = conn.prepare(
            "SELECT u.id, u.username, u.display_name, u.password_hash, u.role_id, 
                    u.is_active, u.last_login, u.created_at, u.updated_at,
                    r.name as role_name, r.display_name as role_display_name, r.permissions
             FROM users u
             JOIN roles r ON u.role_id = r.id
             ORDER BY u.created_at DESC"
        )?;

        let users = stmt.query_map([], |row| {
            let permissions_str: String = row.get(11)?;
            let permissions: Vec<String> = serde_json::from_str(&permissions_str).unwrap_or_default();

            Ok(UserWithRole {
                user: User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    display_name: row.get(2)?,
                    password_hash: row.get(3)?,
                    role_id: row.get(4)?,
                    is_active: row.get(5)?,
                    last_login: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                },
                role_name: row.get(9)?,
                role_display_name: row.get(10)?,
                permissions,
            })
        })?.collect::<Result<Vec<_>>>()?;

        Ok(users)
    }

    pub fn create(&self, conn: &Connection, username: &str, password: &str, 
                  display_name: Option<&str>, role_id: i64) -> Result<i64> {
        let password_hash = hash(password, DEFAULT_COST)
            .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;

        conn.execute(
            "INSERT INTO users (username, display_name, password_hash, role_id) 
             VALUES (?1, ?2, ?3, ?4)",
            params![username, display_name, password_hash, role_id],
        )?;

        Ok(conn.last_insert_rowid())
    }

    pub fn update(&self, conn: &Connection, id: i64, display_name: Option<&str>, 
                  role_id: Option<i64>, is_active: Option<bool>) -> Result<bool> {
        let mut sets = vec![];
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![];

        if let Some(name) = display_name {
            sets.push("display_name = ?".to_string());
            params.push(Box::new(name.to_string()));
        }
        if let Some(rid) = role_id {
            sets.push("role_id = ?".to_string());
            params.push(Box::new(rid));
        }
        if let Some(active) = is_active {
            sets.push("is_active = ?".to_string());
            params.push(Box::new(active));
        }

        if sets.is_empty() {
            return Ok(false);
        }

        sets.push("updated_at = CURRENT_TIMESTAMP".to_string());
        let sql = format!("UPDATE users SET {} WHERE id = ?", sets.join(", "));
        params.push(Box::new(id));

        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
        let rows = conn.execute(&sql, param_refs.as_slice())?;

        Ok(rows > 0)
    }

    pub fn update_password(&self, conn: &Connection, id: i64, new_password: &str) -> Result<bool> {
        let password_hash = hash(new_password, DEFAULT_COST)
            .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;

        let rows = conn.execute(
            "UPDATE users SET password_hash = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
            params![password_hash, id],
        )?;

        Ok(rows > 0)
    }

    pub fn update_last_login(&self, conn: &Connection, id: i64) -> Result<()> {
        conn.execute(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    pub fn verify_password(&self, password: &str, hash: &str) -> bool {
        verify(password, hash).unwrap_or(false)
    }

    pub fn delete(&self, conn: &Connection, id: i64) -> Result<bool> {
        let rows = conn.execute("DELETE FROM users WHERE id = ?1", params![id])?;
        Ok(rows > 0)
    }

    pub fn count(&self, conn: &Connection) -> Result<i64> {
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))?;
        Ok(count)
    }
}

pub struct RoleRepository;

impl RoleRepository {
    pub fn new() -> Self { Self }

    pub fn find_all(&self, conn: &Connection) -> Result<Vec<Role>> {
        let mut stmt = conn.prepare("SELECT * FROM roles ORDER BY id")?;
        let roles = stmt.query_map([], |row| {
            Ok(Role {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                permissions: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })?.collect::<Result<Vec<_>>>()?;
        Ok(roles)
    }

    pub fn find_by_id(&self, conn: &Connection, id: i64) -> Result<Option<Role>> {
        let mut stmt = conn.prepare("SELECT * FROM roles WHERE id = ?1")?;
        let role = stmt.query_row(params![id], |row| {
            Ok(Role {
                id: row.get(0)?,
                name: row.get(1)?,
                display_name: row.get(2)?,
                permissions: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        }).optional()?;
        Ok(role)
    }
}
