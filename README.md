# المعاونة الفنية | Technical Services

نظام إدارة التصميمات والإنتاج للخدمات الفنية - تطبيق Desktop Offline مبني بـ Tauri + React + SQLite.

## المميزات

- **إدارة التصميمات**: مكتبة تصميمات مع Grid/List view, Filters, Search, Favorites
- **إدارة المنتجات**: منتجات ديناميكية مع تصنيفات وخامات
- **المواسم والمناسبات**: إدارة مناسبات ديناميكية (رمضان، أعياد، أفراح...)
- **المعدات والخامات**: إدارة المعدات والخامات مع علاقات بينهما
- **طرق التنفيذ**: دليل خطوات الإنتاج مع تحذيرات وملاحظات
- **إدارة الملفات**: File Manager حقيقي مع Checksum, Missing File Detection
- **النسخ الاحتياطي**: Backup/Restore حقيقي مع Validation
- **Photoshop Integration**: فتح PSD مباشرة من البرنامج
- **Dark/Light Mode**: وضعين للعرض
- **RTL Arabic**: دعم كامل للعربية
- **Role-based Permissions**: أدوار وصلاحيات (Admin, Designer, Production, Viewer)
- **Activity Log**: سجل كامل لكل العمليات

## المتطلبات

- Node.js 18+
- Rust 1.70+
- Windows 10/11 (للتشغيل والبناء)

## التثبيت

```bash
# 1. Clone or extract the project
cd technical-services

# 2. Install frontend dependencies
npm install

# 3. Install Tauri CLI
npm install -g @tauri-apps/cli

# 4. Build and run in development mode
npm run tauri dev

# 5. Build for production
npm run tauri build
```


## نسخة التسطيب Windows

تم تجهيز المشروع لإنتاج نسخة تسطيب Windows بصيغة **NSIS EXE** و **MSI**.

### Build سريع على Windows

```bat
scripts\build-windows.bat
```

بعد انتهاء البناء ستجد ملفات التسطيب داخل:

```text
dist-installer\
```

تم ضبط Windows installer على `offlineInstaller` لـ WebView2، لذلك النسخة النهائية يمكن تثبيتها بدون اتصال إنترنت، مع زيادة متوقعة في حجم المثبّت بحوالي 127MB.

يمكن أيضاً استخدام GitHub Actions من:
`Actions → Build Windows Installer → Run workflow`

> ملاحظة: لا يمكن إنشاء ملف Windows `.exe` النهائي داخل بيئة Linux الحالية لأن المشروع يحتاج Rust/Windows toolchain أثناء عملية Tauri build. ملفات المشروع مهيأة للبناء مباشرة على Windows أو عبر GitHub Actions.

## الاستخدام

### الحساب الافتراضي
- **Username**: `admin`
- **Password**: `admin123`

### هيكل المجلدات
```
D:\TechnicalServices├── Database├── Templates│   └── [Template-Code]│       ├── preview│       ├── source│       ├── fonts│       ├── assets│       └── mockup├── Products├── Seasons├── Preview├── Mockups├── Fonts├── Assets├── Exports└── Backups```

## Architecture

```
Frontend (React + TypeScript + Tailwind)
    ↓ Tauri Commands (IPC)
Backend (Rust)
    ├── Commands Layer (Tauri IPC)
    ├── Services Layer (Business Logic)
    ├── Repositories Layer (Data Access)
    ├── File Manager (SHA-256, Safe Operations)
    └── SQLite + FTS5 + WAL
```

## License

MIT

## GitHub Actions Windows Installer

You can build the Windows installer without installing Visual Studio/C++ Build Tools/Rust on your PC.
See `GITHUB_BUILD.md`.

The GitHub Actions workflow produces:

`Technical-Services-Setup.exe`
