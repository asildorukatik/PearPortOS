#!/usr/bin/env bash
set -euo pipefail

OWNER="asildorukatik"
REPO="PearPortOS"
cd "$(dirname "${BASH_SOURCE[0]}")"

for cmd in gh git; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing: $cmd. On elementary OS run: sudo apt update && sudo apt install git gh" >&2
    exit 1
  fi
done

if ! gh auth status >/dev/null 2>&1; then
  echo 'Please sign into GitHub in your browser:'
  gh auth login
fi

SIGNED_IN="$(gh api user --jq .login)"
if [[ "$SIGNED_IN" != "$OWNER" ]]; then
  echo "You are signed in as $SIGNED_IN, but this package targets $OWNER." >&2
  echo 'Run gh auth switch or gh auth login with the intended account and try again.' >&2
  exit 1
fi

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "A repository named $OWNER/$REPO already exists. Nothing was overwritten." >&2
  echo "Existing repo: https://github.com/$OWNER/$REPO" >&2
  exit 1
fi

if [[ -d .git ]]; then
  echo 'This folder already has a .git directory; refusing to overwrite it.' >&2
  exit 1
fi

if [[ ! -f index.html || ! -f main.js || ! -f .nojekyll ]]; then
  echo 'Missing expected website files; extract the entire GitHub Pages package and run again.' >&2
  exit 1
fi

echo 'Publishing PearPortOS v0.5.5 publicly with user-provided artwork.'
echo 'The website is a demo, not a secure login. Some image assets may be subject to third-party licenses.'
read -r -p 'Create the PUBLIC GitHub repository and upload this folder? [y/N] ' answer
case "$answer" in y|Y|yes|YES) ;; *) echo 'Cancelled.'; exit 0;; esac

git init -b main
GIT_ID="$(gh api user --jq .id)"
git add .
git -c user.name="$OWNER" -c user.email="${GIT_ID}+${OWNER}@users.noreply.github.com" commit -m 'Publish PearPortOS v0.5.5 web preview'
gh repo create "$OWNER/$REPO" --public --source . --remote origin --push --description 'PearPortOS web desktop prototype'

echo 'Enabling GitHub Pages (main branch, repository root)...'
if gh api -X POST "repos/$OWNER/$REPO/pages" -F 'source[branch]=main' -F 'source[path]=/' >/dev/null 2>&1; then
  echo 'GitHub Pages creation requested.'
elif gh api -X GET "repos/$OWNER/$REPO/pages" >/dev/null 2>&1; then
  echo 'GitHub Pages already exists.'
else
  echo 'GitHub Pages activation needs one manual step:'
  echo "  https://github.com/$OWNER/$REPO/settings/pages"
  echo '  Source: Deploy from a branch → main → /(root) → Save'
fi

echo "Repository: https://github.com/$OWNER/$REPO"
echo "Expected website: https://$OWNER.github.io/$REPO/"
echo 'First deployment may take a few minutes.'
