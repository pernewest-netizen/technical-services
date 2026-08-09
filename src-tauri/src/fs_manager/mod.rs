use std::path::{Path, PathBuf};
use std::fs;
use sha2::{Sha256, Digest};
use hex;
use crate::models::{FileSystemEntry, StorageInfo};

pub struct FileManager;

impl FileManager {
    pub fn new() -> Self { Self }

    pub fn ensure_storage_structure(&self, root_path: &Path) -> Result<(), String> {
        let dirs = vec!["Database", "Templates", "Products", "Seasons", "Preview", "Mockups", "Fonts", "Assets", "Exports", "Backups"];
        for dir in dirs {
            let path = root_path.join(dir);
            if !path.exists() {
                fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory {}: {}", dir, e))?;
            }
        }
        Ok(())
    }

    pub fn get_template_folder(&self, root_path: &Path, template_code: &str) -> PathBuf {
        root_path.join("Templates").join(template_code)
    }

    pub fn create_template_structure(&self, root_path: &Path, template_code: &str) -> Result<PathBuf, String> {
        let template_root = self.get_template_folder(root_path, template_code);
        let subdirs = vec!["preview", "source", "fonts", "assets", "mockup"];
        for dir in subdirs {
            let path = template_root.join(dir);
            if !path.exists() {
                fs::create_dir_all(&path).map_err(|e| format!("Failed to create {}: {}", dir, e))?;
            }
        }
        Ok(template_root)
    }

    pub fn calculate_checksum(&self, file_path: &Path) -> Result<String, String> {
        let bytes = fs::read(file_path).map_err(|e| e.to_string())?;
        let mut hasher = Sha256::new();
        hasher.update(&bytes);
        Ok(hex::encode(hasher.finalize()))
    }

    pub fn verify_checksum(&self, file_path: &Path, expected_checksum: &str) -> Result<bool, String> {
        let actual = self.calculate_checksum(file_path)?;
        Ok(actual == expected_checksum)
    }

    pub fn get_directory_size(&self, path: &Path) -> Result<u64, String> {
        let mut total_size = 0u64;
        if path.is_file() {
            total_size = fs::metadata(path).map_err(|e| e.to_string())?.len();
        } else if path.is_dir() {
            for entry in walkdir::WalkDir::new(path) {
                let entry = entry.map_err(|e| e.to_string())?;
                if entry.file_type().is_file() {
                    total_size += entry.metadata().map_err(|e| e.to_string())?.len();
                }
            }
        }
        Ok(total_size)
    }

    pub fn scan_directory(&self, path: &Path) -> Result<Vec<FileSystemEntry>, String> {
        let mut entries = vec![];
        if !path.exists() {
            return Ok(entries);
        }
        for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let metadata = entry.metadata().map_err(|e| e.to_string())?;
            let name = entry.file_name().to_string_lossy().to_string();
            let path_str = entry.path().to_string_lossy().to_string();
            let extension = entry.path().extension().map(|e| e.to_string_lossy().to_string());

            entries.push(FileSystemEntry {
                name,
                path: path_str,
                is_directory: metadata.is_dir(),
                size: if metadata.is_file() { Some(metadata.len() as i64) } else { None },
                modified_at: metadata.modified()
                    .ok()
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs() as i64)
                    .map(|ts| chrono::DateTime::from_timestamp(ts, 0).map(|dt| dt.to_rfc3339()).unwrap_or_default()),
                extension,
            });
        }
        entries.sort_by(|a, b| {
            match (a.is_directory, b.is_directory) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.cmp(&b.name),
            }
        });
        Ok(entries)
    }

    pub fn get_storage_info(&self, root_path: &Path) -> Result<StorageInfo, String> {
        let total_size = self.get_directory_size(root_path).unwrap_or(0);
        let templates_size = self.get_directory_size(&root_path.join("Templates")).unwrap_or(0);
        let previews_size = self.get_directory_size(&root_path.join("Preview")).unwrap_or(0);
        let mockups_size = self.get_directory_size(&root_path.join("Mockups")).unwrap_or(0);
        let fonts_size = self.get_directory_size(&root_path.join("Fonts")).unwrap_or(0);
        let assets_size = self.get_directory_size(&root_path.join("Assets")).unwrap_or(0);
        let backups_size = self.get_directory_size(&root_path.join("Backups")).unwrap_or(0);

        Ok(StorageInfo {
            root_path: root_path.to_string_lossy().to_string(),
            total_size_mb: total_size as f64 / (1024.0 * 1024.0),
            templates_size_mb: templates_size as f64 / (1024.0 * 1024.0),
            previews_size_mb: previews_size as f64 / (1024.0 * 1024.0),
            mockups_size_mb: mockups_size as f64 / (1024.0 * 1024.0),
            fonts_size_mb: fonts_size as f64 / (1024.0 * 1024.0),
            assets_size_mb: assets_size as f64 / (1024.0 * 1024.0),
            backups_size_mb: backups_size as f64 / (1024.0 * 1024.0),
        })
    }

    pub fn safe_delete(&self, path: &Path) -> Result<(), String> {
        if path.is_file() {
            fs::remove_file(path).map_err(|e| e.to_string())?;
        } else if path.is_dir() {
            fs::remove_dir_all(path).map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn safe_move(&self, from: &Path, to: &Path) -> Result<(), String> {
        if to.exists() {
            return Err("Destination already exists".to_string());
        }
        fs::rename(from, to).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn copy_file(&self, from: &Path, to: &Path) -> Result<(), String> {
        if let Some(parent) = to.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
        }
        fs::copy(from, to).map_err(|e| e.to_string())?;
        Ok(())
    }
}
