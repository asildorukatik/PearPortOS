# Publishing PearPortOS

This folder is already the static website. The entire content belongs at the repository root, **not** under a `dist/` folder.

## Automated route (from your laptop)

1. Install `git` and `gh` (for Ubuntu/elementary OS, `sudo apt update && sudo apt install git gh`).
2. Run `gh auth login` and select GitHub.com, HTTPS, and browser sign-in.
3. From the extracted `PearPortOS-GitHub-Pages-v0.5.5` directory, run `bash publish.sh`.
4. The script creates the public `asildorukatik/PearPortOS` repo and attempts to activate Pages.
5. Check **https://github.com/asildorukatik/PearPortOS/settings/pages** and select Deploy from a branch → `main` → `/(root)` if the Pages API call does not succeed.
6. Open **https://asildorukatik.github.io/PearPortOS/** after the first deployment (may take several minutes).

## Manual route

Create a public GitHub repo named `PearPortOS` with no README; then in this directory:

```sh
git init -b main
git add .
git commit -m "Publish PearPortOS v0.5.5"
git remote add origin https://github.com/asildorukatik/PearPortOS.git
git push -u origin main
```

In GitHub, navigate to repository Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/(root)` and Save.

**Site is public.** The included demo passcodes are not for real security. Some supplied graphic assets may be covered by third-party copyright.
