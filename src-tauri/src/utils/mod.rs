use chrono::{DateTime, Utc, Local};

pub fn format_datetime(dt: &str) -> String {
    DateTime::parse_from_rfc3339(dt)
        .map(|dt| dt.with_timezone(&Local).format("%Y-%m-%d %H:%M").to_string())
        .unwrap_or_else(|_| dt.to_string())
}

pub fn generate_code(prefix: &str, id: i64) -> String {
    format!("{}-{:04}", prefix, id)
}

pub fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '<' | '>' | ':' | '"' | '/' | '\' | '|' | '?' | '*' => '_',
            _ => c,
        })
        .collect()
}

pub fn format_file_size(size_bytes: i64) -> String {
    if size_bytes < 1024 {
        format!("{} B", size_bytes)
    } else if size_bytes < 1024 * 1024 {
        format!("{:.1} KB", size_bytes as f64 / 1024.0)
    } else if size_bytes < 1024 * 1024 * 1024 {
        format!("{:.1} MB", size_bytes as f64 / (1024.0 * 1024.0))
    } else {
        format!("{:.1} GB", size_bytes as f64 / (1024.0 * 1024.0 * 1024.0))
    }
}
