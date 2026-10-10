# PearPortOS icon source order (v0.5.3)

1. `assets/icons/user/*.png`: **72** PNGs converted locally from the user-provided `Icons.zip` (`docs/com.doruk.*/...icns`). **This is the default for mapped app icons.** These files were supplied by the project owner. Licensing/redistribution rights are not established by supplying the files, so review their provenance before public redistribution.
2. **System Preferences:** `assets/icons/elementary/preferences.svg`, an offline vector based on the look of elementary OS `categories/48/preferences-system.svg`. For the exact upstream icon, run `python3 tools/vendor-elementary-icons.py` while online; this replaces the fallback. Project: https://github.com/elementary/icons . GPL-3.0 license is in `licenses/elementary-icons-GPL-3.0.txt`.
3. Other missing icons: use locally installed elementary SVGs when available, otherwise the pinned upstream icon file when connected, otherwise the original PearPortOS icon (offline emergency fallback).

Icons preserve their native silhouettes; no mandatory squircle masking. See `assets/icons/user-icons-manifest.js`, `user-icons-catalog.json`, and `elementary-map.json` for mappings.
