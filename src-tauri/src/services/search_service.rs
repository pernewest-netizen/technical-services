use rusqlite::Connection;
use crate::db::DatabaseManager;
use crate::models::{SearchResult, SearchRequest};

pub struct SearchService;

impl SearchService {
    pub fn new() -> Self { Self }

    pub fn search(&self, db: &DatabaseManager, req: SearchRequest) -> Result<Vec<SearchResult>, String> {
        let conn = db.get_connection();
        let query = format!("%{}%", req.query);
        let limit = req.limit.unwrap_or(50);

        let mut results = vec![];

        // Search Templates
        let mut stmt = conn.prepare(
            "SELECT t.id, t.code, t.name, t.description,
                    (SELECT relative_path FROM files WHERE template_id = t.id AND file_type = 'THUMBNAIL' LIMIT 1) as thumbnail
             FROM templates t
             WHERE t.is_active = 1 AND (t.name LIKE ?1 OR t.code LIKE ?2 OR t.description LIKE ?3)
             LIMIT ?4"
        ).map_err(|e| e.to_string())?;

        let templates = stmt.query_map(
            rusqlite::params![&query, &query, &query, limit],
            |row| {
                Ok(SearchResult {
                    id: row.get(0)?,
                    entity_type: "template".to_string(),
                    code: row.get(1)?,
                    name: row.get(2)?,
                    description: row.get(3)?,
                    thumbnail_path: row.get(4)?,
                    relevance: 1.0,
                })
            }
        ).map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

        results.extend(templates);

        // Search Products
        let mut stmt = conn.prepare(
            "SELECT id, code, name, description, NULL as thumbnail
             FROM products
             WHERE is_active = 1 AND (name LIKE ?1 OR code LIKE ?2)
             LIMIT ?3"
        ).map_err(|e| e.to_string())?;

        let products = stmt.query_map(
            rusqlite::params![&query, &query, limit],
            |row| {
                Ok(SearchResult {
                    id: row.get(0)?,
                    entity_type: "product".to_string(),
                    code: row.get(1)?,
                    name: row.get(2)?,
                    description: row.get(3)?,
                    thumbnail_path: row.get(4)?,
                    relevance: 0.8,
                })
            }
        ).map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

        results.extend(products);

        // Search Seasons
        let mut stmt = conn.prepare(
            "SELECT id, NULL as code, display_name as name, description, image_path as thumbnail
             FROM seasons
             WHERE is_archived = 0 AND (display_name LIKE ?1 OR name LIKE ?2)
             LIMIT ?3"
        ).map_err(|e| e.to_string())?;

        let seasons = stmt.query_map(
            rusqlite::params![&query, &query, limit],
            |row| {
                Ok(SearchResult {
                    id: row.get(0)?,
                    entity_type: "season".to_string(),
                    code: row.get(1)?,
                    name: row.get(2)?,
                    description: row.get(3)?,
                    thumbnail_path: row.get(4)?,
                    relevance: 0.7,
                })
            }
        ).map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

        results.extend(seasons);

        // Sort by relevance
        results.sort_by(|a, b| b.relevance.partial_cmp(&a.relevance).unwrap());

        Ok(results.into_iter().take(limit as usize).collect())
    }

    pub fn search_by_tag(&self, db: &DatabaseManager, tag_name: &str) -> Result<Vec<SearchResult>, String> {
        let conn = db.get_connection();

        let mut stmt = conn.prepare(
            "SELECT t.id, t.code, t.name, t.description,
                    (SELECT relative_path FROM files WHERE template_id = t.id AND file_type = 'THUMBNAIL' LIMIT 1) as thumbnail
             FROM templates t
             JOIN template_tags tt ON t.id = tt.template_id
             JOIN tags tag ON tt.tag_id = tag.id
             WHERE t.is_active = 1 AND tag.name = ?1"
        ).map_err(|e| e.to_string())?;

        let results = stmt.query_map(rusqlite::params![tag_name], |row| {
            Ok(SearchResult {
                id: row.get(0)?,
                entity_type: "template".to_string(),
                code: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                thumbnail_path: row.get(4)?,
                relevance: 1.0,
            })
        }).map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

        Ok(results)
    }
}
