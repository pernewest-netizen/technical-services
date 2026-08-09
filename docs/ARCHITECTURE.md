# Architecture Documentation

## Overview

Technical Services is a desktop offline application built with:
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Zustand
- **Backend**: Rust + Tauri
- **Database**: SQLite with FTS5, WAL mode
- **File System**: Local filesystem with SHA-256 integrity checks

## Project Structure

```
technical-services/
├── src/                          # React Frontend
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   └── layout/               # Sidebar, TopBar, MainLayout
│   ├── pages/                    # All page components
│   ├── stores/                   # Zustand state management
│   ├── types/                    # TypeScript interfaces
│   ├── lib/
│   │   ├── api.ts               # Tauri invoke API layer
│   │   └── utils.ts             # Helper functions
│   └── styles/
│       └── index.css            # Tailwind + CSS variables
├── src-tauri/                    # Rust Backend
│   ├── src/
│   │   ├── commands/            # Tauri IPC commands
│   │   ├── db/                  # Database manager
│   │   ├── models/              # Data models
│   │   ├── repositories/        # Data access layer
│   │   ├── services/            # Business logic
│   │   ├── fs_manager/          # File system operations
│   │   └── utils/               # Helper functions
│   ├── migrations/              # SQL migrations
│   └── Cargo.toml
```

## Data Flow

```
User Action
    ↓
React Component
    ↓
Zustand Store / API Layer (invoke)
    ↓
Tauri Command (Rust)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
SQLite / File System
```

## Database Schema

### Core Tables
- `users` - Users with bcrypt passwords
- `roles` - Roles with JSON permissions
- `settings` - Application settings
- `activity_logs` - Audit trail

### Business Tables
- `seasons` - Dynamic seasons/occasions
- `categories` - Dynamic categories
- `products` - Products
- `services` - Services
- `machines` - Equipment
- `materials` - Raw materials
- `machine_materials` - Many-to-many relation

### Template System (Heart)
- `templates` - Design templates
- `template_versions` - Version control
- `files` - File records with checksums
- `tags` - Dynamic tags
- `template_tags` - Many-to-many relation
- `favorites` - User favorites

### Production
- `production_guides` - Production guides
- `production_steps` - Step-by-step instructions

### Search
- `templates_fts` - Full-text search virtual table

## Security

- Passwords hashed with bcrypt
- Role-based permissions (JSON array)
- File operations restricted to storage root
- Checksum verification for file integrity
- Activity logging for all operations

## File System

### Storage Structure
```
D:\TechnicalServices├── Database/           - SQLite database
├── Templates/          - Template folders
├── Products/           - Product files
├── Seasons/            - Season images
├── Preview/            - Preview images
├── Mockups/            - Mockup files
├── Fonts/              - Font files
├── Assets/             - Shared assets
├── Exports/            - Export outputs
└── Backups/            - Database backups
```

### Template Folder Structure
```
Templates/[CODE]/
├── preview/            - Preview images
├── source/             - PSD/AI source files
├── fonts/              - Required fonts
├── assets/             - Additional assets
└── mockup/             - Mockup files
```

## API Layer

All frontend-backend communication goes through Tauri's `invoke` API:

```typescript
// Example
const templates = await invoke('get_templates', { 
  seasonId: 1, 
  limit: 50 
});
```

## State Management

### Zustand Stores
- `authStore` - Authentication state
- `uiStore` - UI state (theme, sidebar, toasts, etc.)
- `dataStore` - Cached reference data

## Theme System

CSS variables with `dark` class toggle:
```css
:root { /* Light mode variables */ }
.dark { /* Dark mode variables */ }
```

## Build Process

1. `npm run build` - Builds React frontend
2. `cargo build` - Builds Rust backend
3. `tauri build` - Bundles into Windows installer
