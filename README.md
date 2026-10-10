# PearPortOS 🍐

PearPortOS is a **web-based macOS Catalina-inspired desktop prototype**. This repository hosts v0.5.5 (desktop, apps, Dock, widgets, Calendar, and visual demo login). It is **not** a Linux desktop environment or a secure login system.

**Website:** https://asildorukatik.github.io/PearPortOS/

## Usage
Open the website or run a local static server in this folder:

```sh
python3 -m http.server 8000
```

The demo account passcodes are `pear` (Pear User), `demo` (Developer), and no password for Guest. **Do not use real passwords.** App files and settings live in your browser storage; they do not expose your computer's files.

## Publish on GitHub Pages

The `publish.sh` helper creates a **public** GitHub repository named `PearPortOS`, pushes this folder, and attempts to enable GitHub Pages from `main` → `/`.

```sh
bash publish.sh
```

Requirements: `git`, the GitHub CLI (`gh`), and an authenticated GitHub account (`gh auth login` if needed). To publish manually, create a public repository named `PearPortOS`, upload the **contents of this folder to its root**, and select **Settings → Pages → Deploy from a branch → main → /(root)**.

## Code and artwork

See `PROJECT_GUIDE.md`, `ICON_SOURCES.md`, and `licenses/`. The elementary icon assets have separate GPL-3.0 terms; ThanasOS-derived code/ideas are attributed under MIT. Some icon/wallpaper imagery came from user-supplied references and may carry **third-party copyright restrictions**. Do not assume that public hosting grants permission for redistribution or commercial use.

The live login is a visual browser mock and should never be used to secure personal information.
