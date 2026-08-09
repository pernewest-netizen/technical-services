@echo off
setlocal
title Technical Services - Windows Installer Build

echo ==========================================
echo   Technical Services - Windows Installer
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo Install Node.js 20 LTS or newer, then run this file again.
  pause
  exit /b 1
)

where cargo >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Rust/Cargo is not installed.
  echo Install Rust from https://www.rust-lang.org/tools/install
  echo Then install the Microsoft C++ Build Tools and Windows SDK.
  pause
  exit /b 1
)

echo [1/3] Installing frontend dependencies...
call npm install
if errorlevel 1 goto :error

echo.
echo [2/3] Building the Windows application...
call npm run tauri:build
if errorlevel 1 goto :error

echo.
echo [3/3] Collecting installers...
if not exist "dist-installer" mkdir "dist-installer"
copy /Y "src-tauri\target\release\bundle\nsis\*.exe" "dist-installer\" >nul 2>nul
copy /Y "src-tauri\target\release\bundle\msi\*.msi" "dist-installer\" >nul 2>nul

echo.
echo ==========================================
echo BUILD COMPLETE
echo ==========================================
echo Installers are in:
echo %CD%\dist-installer
echo.
explorer "%CD%\dist-installer"
pause
exit /b 0

:error
echo.
echo ==========================================
echo BUILD FAILED
echo ==========================================
pause
exit /b 1
