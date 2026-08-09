use crate::models::{LoginRequest, LoginResponse, UserWithRole};
use crate::repositories::{UserRepository, RoleRepository};
use crate::db::DatabaseManager;

pub struct AuthService {
    user_repo: UserRepository,
    role_repo: RoleRepository,
}

impl AuthService {
    pub fn new() -> Self {
        Self {
            user_repo: UserRepository::new(),
            role_repo: RoleRepository::new(),
        }
    }

    pub fn login(&self, db: &DatabaseManager, req: LoginRequest) -> Result<LoginResponse, String> {
        let conn = db.get_connection();

        let user = match self.user_repo.find_by_username(&conn, &req.username) {
            Ok(Some(u)) => u,
            Ok(None) => return Ok(LoginResponse {
                success: false,
                token: None,
                user: None,
                message: "اسم المستخدم أو كلمة المرور غير صحيحة".to_string(),
            }),
            Err(e) => return Err(format!("Database error: {}", e)),
        };

        if !user.is_active {
            return Ok(LoginResponse {
                success: false,
                token: None,
                user: None,
                message: "الحساب معطل. تواصل مع المدير".to_string(),
            });
        }

        if !self.user_repo.verify_password(&req.password, &user.password_hash) {
            return Ok(LoginResponse {
                success: false,
                token: None,
                user: None,
                message: "اسم المستخدم أو كلمة المرور غير صحيحة".to_string(),
            });
        }

        let _ = self.user_repo.update_last_login(&conn, user.id);

        let user_with_role = self.user_repo.find_by_id(&conn, user.id)
            .map_err(|e| format!("Database error: {}", e))?
            .ok_or("User not found")?;

        let _ = conn.execute(
            "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
             VALUES (?1, 'LOGIN', 'user', ?2, 'User logged in')",
            rusqlite::params![user.id, user.id],
        );

        let token = format!("token_{}_{}", user.id, chrono::Utc::now().timestamp());

        Ok(LoginResponse {
            success: true,
            token: Some(token),
            user: Some(user_with_role),
            message: "تم تسجيل الدخول بنجاح".to_string(),
        })
    }

    pub fn get_current_user(&self, db: &DatabaseManager, user_id: i64) -> Result<Option<UserWithRole>, String> {
        let conn = db.get_connection();
        self.user_repo.find_by_id(&conn, user_id)
            .map_err(|e| format!("Database error: {}", e))
    }

    pub fn get_all_users(&self, db: &DatabaseManager) -> Result<Vec<UserWithRole>, String> {
        let conn = db.get_connection();
        self.user_repo.find_all(&conn)
            .map_err(|e| format!("Database error: {}", e))
    }

    pub fn get_roles(&self, db: &DatabaseManager) -> Result<Vec<crate::models::Role>, String> {
        let conn = db.get_connection();
        self.role_repo.find_all(&conn)
            .map_err(|e| format!("Database error: {}", e))
    }
}
