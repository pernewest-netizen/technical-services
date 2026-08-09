# Build the Windows Installer with GitHub Actions

This project is configured so you do **not** need Visual Studio, C++ Build Tools, Windows SDK, Rust, or Cargo on your own PC.

GitHub's Windows runner provides the Windows build environment and the workflow builds the Tauri NSIS installer automatically.

## One-time setup

1. Create a new GitHub repository.
2. Upload **all files and folders from this project** to the repository root.
3. Make sure the workflow exists at:
   `.github/workflows/build-windows.yml`
4. Push the files to the `main` branch.

## Get the installer

After GitHub finishes the workflow:

1. Open the repository on GitHub.
2. Open **Actions**.
3. Open **Build Windows Installer**.
4. Open the successful run.
5. At the bottom, under **Artifacts**, download:
   `Technical-Services-Setup`
6. The downloaded artifact contains:
   `Technical-Services-Setup.exe`

## Build manually

Open **Actions → Build Windows Installer → Run workflow**.

## Create a GitHub Release

To create a downloadable GitHub Release automatically, create and push a version tag, for example:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow will build the installer and attach:

`Technical-Services-Setup.exe`

to the release.

## Important

The generated installer is an NSIS setup executable. It installs the desktop application and is configured to use Tauri's offline WebView2 installer mode.
