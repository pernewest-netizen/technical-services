# تجهيز نسخة التسطيب — المعاونة الفنية

النسخة الأصلية مبنية بـ Tauri + React، لذلك ملف التسطيب النهائي Windows `.exe` يحتاج عملية Build على Windows (Rust + Microsoft C++ Build Tools).

تم تجهيز المشروع ليُنتج:
- NSIS Installer: `*-setup.exe`
- MSI Installer: `*.msi`
- WebView2 Offline Installer مضمّن داخل حزمة Windows، بحيث لا يحتاج المستخدم للإنترنت أثناء التثبيت. هذا يزيد حجم المثبّت بحوالي 127MB وفق توثيق Tauri v1.

## أسرع طريقة

1. افتح المشروع على Windows.
2. ثبّت Node.js 20 LTS أو أحدث.
3. ثبّت Rust.
4. ثبّت Microsoft C++ Build Tools + Windows SDK.
5. شغّل:
   `scripts\build-windows.bat`
6. ستجد ملفات التسطيب داخل:
   `dist-installer\`

## GitHub Actions

يمكن أيضاً رفع المشروع إلى GitHub ثم تشغيل:
Actions → Build Windows Installer → Run workflow

وسيتم إنشاء ملفات `.exe` و`.msi` كـ Artifacts.

## بعد التثبيت

التطبيق يعمل كتطبيق Desktop مستقل، وقاعدة SQLite يتم إنشاؤها تلقائياً في App Local Data عند أول تشغيل، لذلك لا يحتاج المستخدم إلى Node.js أو Rust بعد تثبيت النسخة النهائية.

الحساب الافتراضي:
- Username: `admin`
- Password: `admin123`
