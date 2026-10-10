# PearPortOS v0.5.2 — Catalina Accuracy Pass A

**Development direction:** the web build is the visual/interaction debugging twin.
The native Linux desktop environment comes later; a kiosk shell is a fallback,
not a replacement for the native OS integration.

## Elementary icon theme
The app maps to the open-source elementary icon set (GPL-3.0) while online,
with original local SVG fallbacks. To bundle upstream icons for offline use,
run `python3 tools/vendor-elementary-icons.py` on an internet-connected machine,
then open `index.html` or rebuild `dist` with `npm run build`. The icon license
and per-icon source paths are included in `ICON_SOURCES.md`.

## Catalina shell corrections
App-specific menu headings (Pearder vs System Preferences vs Terminal); app-name
menu, Catalina-style flat dropdown selection, revised menu metrics and Dock geometry,
running dots, status icon spacing, desktop label spacing and original icon silhouettes.
The Dock shelf expands with magnification; new icons are not uniformly masked.

The reference images include a later-macOS Control Center, which is excluded from
the Catalina target. Native system control requires a separate Linux service.

---
# PearPortOS v0.5.1 — Catalina 10.15.7-inspired desktop (Phases 1–5)

PearPortOS is an **offline, original-asset, browser-based desktop and UI debug twin**. It is not a replacement for macOS or Linux, and cannot modify OS-wide device settings. The reference is Catalina 10.15.7, **not** Big Sur/Tahoe.

## Launch

1. Extract `PearPortOS-Catalina-Fidelity-v0.5.1.zip`.
2. Open `PearPortOS/index.html` in Chrome, Chromium, or Edge. No installation is necessary.
3. If direct opening is blocked by browser security settings, run `python3 -m http.server 8080` in the `PearPortOS` directory and open `http://localhost:8080`.

Optional: `npm install && npm run dev`, or `npm run build` to produce `dist/`, which is also designed to work offline with direct `index.html` opening.

## Catalina fidelity refinement — v0.5.1 (visual pass)

The browser desktop is still a simulated environment, not macOS itself. This release **does not begin the Linux port** and does not add Apple's proprietary icons, SF Pro files, or wallpapers.

- New **Catalina fidelity CSS layer** (`shell/catalina-fidelity.css`) that uses tokens from `core/tokens.css` to refine the menu-bar translucency, window chrome, Finder/Pearder sidebar, unified toolbar, segmented view buttons, Dock shelf, and Notification Center surfaces in light and dark mode. All newly tuned values are *assumptions*, not measurements from full-resolution native screenshots.
- The original Pear Island SVG has procedural mountain-rock detail, irregular small water highlights, and layered surface texture. It remains original artwork, not the real Catalina image, so it will not be pixel-identical.
- **Choose your own desktop wallpaper:** Right-click the desktop → **Change Desktop Background…** or open **System Preferences → Desktop & Screen Saver → Choose Picture…**. PNG, JPEG, and WebP up to 2 MB work. An image is read in the browser only and applied without artificial darkening; when browser storage is available it is retained locally in `localStorage`, and **Restore Pear Island** removes it. Large images are refused rather than silently truncated. Local storage may be unavailable or cleared by your browser; no upload or remote service is involved.
- Desktop context menu **Show/Hide Desktop Items** now really toggles the icon layer; choice persists locally when browser storage is available. The initial debug welcome notification has been removed from normal startup.
- Existing apps and Phase 5 keyboard shortcuts remain.

Visual test screenshots from the current build are supplied separately; real Catalina geometry still needs the screenshots requested in `CALIBRATION.md`. Browser interactions were exercised through the in-memory Chromium test harness. HTTP/file:// launch and storage persistence could not be verified in this sandbox because navigation to the local server is blocked by administrator policy.

## Important: Dock shelf growth fix

The Dock background now **resizes horizontally (or vertically at the left/right edges) as icon magnification changes**. This corrects v0.2.2, which used icon transforms without changing the layout size. The Dock's space is automatically limited to fit within the viewport; when there is little free screen width, magnification is capped rather than extending beyond the screen. The nominal desktop icon-size token was reduced to 42px (still assumed, not measured). Drag-to-reorder now handles moving an icon forward by one slot correctly.

## Phase 3: System Preferences and controls

Open **System Preferences** from the pear menu or its Dock icon.

- Catalina-style **icon grid** with 26 original preference-pane icons, grouped sections, search, back/forward, and Show All navigation.
- Unified toolbar with traffic lights; move the window by the empty toolbar area.
- General: **Light/Dark/Auto** themes, eight accent colors, settings persistence and a standard-controls preview (buttons, checkboxes, radio choices, segmented controls, tables, disclosures, progress, steppers and sheet dialogs).
- Desktop & Screen Saver: dynamic day/night lighting applied to **original** Pear Island wallpaper independently of app appearance.
- Dock: size, magnification enable, max magnification, **position: left/bottom/right**, auto-hide and reset. Preferences are saved locally in browser storage where permitted.
- Accessibility: reduce motion/transparency options for the web shell.
- Other panes (Network, Bluetooth, Security & Privacy, Software Update, etc.) show truthful mock or informational content because browser apps cannot control real OS hardware. Some pane-level demonstration settings are stored but do **not** yet produce native effects.
- Shared `core/ui/widgets.js` and `core/ui/widgets.css`: push/default buttons, checkboxes, radio, segmented controls, popup/select, slider, input, search, stepper, rows, progress/spinner, table, disclosure, tabs, help and window-sheet markup.

**Known limitations:** System Preferences uses approximated geometry, most hardware panes are informational, and icons are original placeholders rather than your ThanasOS pack. See Phase 4 details below for virtual file storage limitations. Some built-in browser shortcuts may override the simulated OS.

## Existing shell shortcuts

- **Ctrl+Alt+D**: open/close debug inspector. **Ctrl+Alt+C**: screenshot overlay.
- Dock: hover to magnify and expand shelf, drag to reorder, right-click Keep/Remove, auto-hide using preferences or inspector. Running indicators and launch bounce.
- Windows: drag/resize, close/minimize/fullscreen, Option+green or double-click to zoom, drag zoomed window to detach, Escape exits fullscreen.
- **Cmd/Ctrl+W/M/Q**: window close/minimize/quit (subject to browser interception).
- Inspector: screenshots overlay and alignment, measured rectangles, FPS and event log, token export JSON, font switch.

## Project modules

- `core/tokens.css` and `core/typography.css` contain all chrome and control assumptions (unknown real geometry explicitly labeled `ASSUMED`). `CALIBRATION.md` records them and requests verifying screenshots.
- `core/ThemeManager.js`, `core/WindowManager.js`, `core/AppRegistry.js`, `core/EventBus.js`, `core/ui/*` implement reusable browser-agnostic model/service logic plus UI factories.
- `shell/` contains the menu bar, desktop, Dock, compare overlay and inspector.
- `apps/preferences/` contains the Phase 3 preference panes and CSS.
- `core/VirtualFS.js` models a browser-only virtual filesystem with IndexedDB and localStorage persistence.
- `apps/pearder/` provides the Pearder file browser, and `apps/terminal/` the mock Terminal.
- `assets/icons/icons.json` maps 48 original icons to their file paths; none are Apple's. `ICON_SOURCES.md` lists all 48 for review.
- `licenses/` contains Inter and DejaVu font license files; Apple's proprietary fonts and images are not included.

## Testing

Run `python tools/browser-smoke.py` (requires Playwright with Chromium on the test computer). The browser test uses in-memory HTML/CSS/JS injection because local browser navigation was blocked in the development environment. Test categories: layout at 360/565/800/1280px, magnification expands shelf, window geometry and animations, drag-to-reorder, preferences grid/search/pane routing, themes/accents, Dock options, responsive layout. **Chromium in-memory tests passed** with no reported JavaScript exceptions; native `file://` navigation still needs user-machine confirmation.

## Phase 4: Pearder, virtual disk, Quick Look, Terminal

Open Pearder from the Dock (first icon), or choose File → New Window. The initial virtual disk is `Macintosh HD` with `Users/pear/{Desktop,Documents,Downloads,Pictures,Music,Movies}`, `Applications/Utilities`, `System`, and `Trash`.

### Pearder

- Catalina-style integrated toolbar, location title, back/forward history, search field, sort control, **multi-tab browsing** (File → New Tab or Cmd/Ctrl+T; tab bar appears once a second tab is open), and four view modes: **Icons, List, Columns and Gallery**.
- Sidebar sections Favorites, Locations, Tags, Trash. Path bar and status line.
- Single-click selects; Ctrl/Cmd-click selects multiple; double-click opens folders, `.app` shortcuts, or Quick Look.
- Right-click file area or click the actions gear: **New Folder, New Text Document, Import Files, Open, Quick Look, Rename, Get Info, Copy, Move, Paste, add/remove a red tag, Move to Trash, Put Back, Empty Trash**. Internal drag-and-drop moves files into sidebar folders or another displayed folder; hold Alt/Option while dragging to copy. Hover over a folder while dragging for spring-loaded navigation.
- File menu and Go menu partly routed to live Pearder actions. Keyboard shortcuts: **Cmd/Ctrl+1–4** switch view, **Space** opens selected item's Quick Look, **Backspace** opens parent, **Cmd/Ctrl+C/X/V** act on *virtual* files if the browser permits those shortcuts.
- Files in `/Users/pear/Desktop` also show as desktop icons and open into Pearder or Quick Look.
- Import accepts a **single text/image file up to 1 MB each**, using drag-and-drop into the file area or *Import Files…*. Other formats are rejected. Export from toolbar or Quick Look downloads files; this is the only user-initiated bridge back to the host disk.

### Quick Look

Preview text, images, folders and app shortcuts in a modal over the desktop. Escape/Space or × closes it. Text previews additionally offer **Edit Text…** and **Save Changes**. *Quick Look does not use Apple's actual binaries or assets.*

### Terminal

Terminal is a mock shell operating strictly on the same virtual filesystem as Pearder. Try:

```text
pwd
ls ~/Documents
mkdir ~/Documents/MyGame
cd ~/Documents/MyGame
echo Hello PearPortOS > README.txt
cat README.txt
open .
```

Implemented commands include `help`, `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `head`, `echo` (with `>` and `>>` output), `cp`, `mv`, `rm`, `rmdir`, `tree`, `find`, `clear`, `date`, `whoami`, `uname`, `open`, `stat`, `history`, and `reset --factory-files`. Arrow keys cycle prior commands; Tab performs basic filename completion. **This Terminal does not execute Linux shell commands, programs, scripts, network connections, sudo, or modifications to the real computer.**

### Persistence and limits

File operations update an in-memory file tree and attempt to save snapshots to **IndexedDB plus localStorage**. Clearing site/browser data, running a private session, changing origins/browsers, quota failure, or browser restrictions can lose or isolate the virtual files. Back up any important text through Export. This project does not read your real hard drive except small files you explicitly import, and does not send them to a server. Browser-local persistence has a simulated storage round-trip test; cross-browser reload persistence still needs testing on your machine.

### Tests

`python3 tools/phase4-smoke.py` uses Chromium + Playwright and in-memory asset injection. It passed the four views, Finder tabs, internal drag-and-drop, Quick Look, text editing, Terminal-to-Pearder synchronization, create/move/copy/rename/delete/trash/restore, mock snapshot persistence, theme switching, and existing preference/Dock smoke checks with **zero JavaScript exceptions**. `npm run build` produces offline `dist/`. Direct `file://` navigation was blocked in the build's sandbox, so you should verify double-click launch and reload persistence yourself.

## Phase 5: Catalina system overlays and Spaces

**Spotlight:** Click the search glyph in the menu bar, or use **Cmd/Ctrl+Space**. Search for app names and filenames in your browser-local virtual filesystem. Results have a preview pane, arrow-key navigation, and Return to open. Arithmetic such as `5*8+2` and a limited set of unit conversions are recognized. No web search/indexing is connected.

**Launchpad:** Open from the Dock, or use **Ctrl+Alt+L**. Displays installed app shortcuts in a 7-column desktop grid with a live app filter, page indicators, and app opening. Some icons intentionally launch Phase 6 placeholder windows because those applications do not yet exist.

**Mission Control and Spaces:** **F3** or **Ctrl+↑** opens the window overview. Click **+** to add another virtual desktop (up to six), or use **Ctrl+←/→** to switch. The window cards can move windows to a different desktop using their drop-down menu. Spaces are in-memory for the current session, and fullscreen windows currently retain the earlier browser-shell fullscreen handling rather than using truly independent fullscreen Spaces. **Cmd/Ctrl+Tab** switches visible open windows, **Cmd/Ctrl+`** cycles windows in the focused application; these shortcuts depend on browser interception. **F11** hides/restores all windows on the current desktop.

**Notification Center:** Click the **rightmost** menu-bar icon. The Catalina-style full-height right panel has **Notifications** and **Today** tabs. Banners, individual dismissal, and notification history are implemented. Today has Calendar (local date; events are not connected), Weather and Stocks (**explicitly offline placeholders, not live readings**), a persistent browser-local **Reminders** list, and an editable browser-local **Quick Note**. Test notifications can be generated from the Notifications tab.

**Siri:** Click the colorful menu-bar glyph for a top-right panel with original animated orb. The mock command assistant understands `Open Terminal`, `Open Pearder`, `Switch to dark mode`, `Switch to light mode`, `Show notifications`, `Search ...`, `Show Mission Control`, and date/time requests. Optional Web Speech recognition uses browser permissions, if supported. **No remote LLM, Apple Siri service, or microphone access without browser permission.**

**Lock / login, sleep and shutdown:** Pear menu → **Lock Screen** to preview a blurred wallpaper, circular pear avatar, user name and password field. Any input or Return unlocks because this is a **visual-only session lock; it does not secure a computer or a file account**. Sleep/Shut Down simulate session states; Restart reloads the web page. This is not an operating-system power action.

**Hot corners:** Set each of the four corners through **System Preferences → Mission Control** to invoke Mission Control, Launchpad, Desktop, Notification Center, or Lock Screen after a short hover. The target window/screen must be active to detect the corner.

### Testing and known boundaries

Run `python3 tools/phase5-smoke.py` (requires Playwright + Chromium). This test passed launch/search/calculate, virtual files, Launchpad, Notifications, Today reminders, Siri, window Spaces, hot-corner settings, Cmd/Ctrl+Tab, session lock, and existing Dock/Pearder/Terminal/Preferences interactions. The updated `phase4-smoke.py` also passed. **No JavaScript exceptions were recorded in either smoke test**. `file://` direct navigation is blocked by this development environment's administrator policy, so opening `index.html` directly, real browser reload persistence, hardware integrations, and Catalina pixel fidelity still need real-device verification.

### Next: Phase 6 (not started)

Complete the remaining original apps, refine animations/effects, and polish fidelity against new Catalina screenshots. Phase 5 intentionally has no Control Center, Stage Manager, Big Sur-style styling, or modern iOS-style System Settings.


## v0.5.3 — Uploaded icons and Catalina wallpapers

- `Icons.zip` was converted to 72 browser-compatible icons in `assets/icons/user/`. It now takes priority for applications, including Launchpad.
- The System Preferences app now uses the elementary OS system gear (`categories/48/preferences-system.svg`) instead of the display/trackpad picture. The ZIP includes a locally drawable gear fallback; run `python3 tools/vendor-elementary-icons.py` with network access for the exact upstream SVG.
- Catalina Day, Dusk, and Night wallpapers are bundled under `assets/wallpapers/`, and can be changed in System Preferences → Desktop & Screen Saver.
- When Dynamic Desktop is enabled and wallpaper style is Automatic, the image follows the local time: day 07–17, dusk 17–20, night 20–07. Light/Dark mode alone selects day/night when Dynamic Desktop is off.
- User-selected custom wallpapers still override the presets until **Restore Catalina** is clicked.
- These user-supplied icons have not been independently cleared for redistribution. Verify rights before publishing the complete pack.


## v0.5.4: Desktop files, widgets, calendar and Launchpad

- Files and folders inside Pearder can be dragged onto the desktop, and desktop files can be moved into Pearder. Drag desktop icons to rearrange their positions; their coordinates are stored locally. Alt-drag between different folders to copy. Browser file imports are limited to small text/image files (1 MB each), not host filesystem folder access.
- The optional desktop widget stack includes Weather, Clock, Calendar and manually maintained Health Activity rings. Right-click blank desktop → **Edit Widgets…** to remove, add, or reorder them. Right-click → **Hide Widgets** to hide them all. The Catalina Today view also has an Edit Widgets button.
- Weather attempts current conditions using the public Open-Meteo API for a user-selected city; offline displays an unavailable label rather than invented weather. Health rings are manual demo counters and do not read Apple Health or host sensors.
- Calendar now has month, week, day views and local event creation, renaming, deletion, and persistence via browser storage. This is an independent vanilla JS application based on ThanasOS's open-source calendar UX.
- Launchpad gains staggered icon zoom/fade entrance and exit animations inspired by ThanasOS, while retaining the 2019 Catalina layout.
- System Preferences now displays the exact `PrefApp.icns` provided by the user (converted to PNG).
- Catalina did not officially support widgets on the desktop; in Catalina their editable home was Notification Center's Today view. Desktop widgets are a PearPortOS extension.

**License notes:** Concepts adapted from ThanasOS (MIT, Copyright (c) 2026 Thanas R), with attribution in `licenses/ThanasOS-MIT.txt`. The icon and wallpaper assets supplied by the user may require further redistribution permission and should be replaced in public builds unless their licenses permit copying.

---
## v0.5.5 — PearPortOS Login preview

This version starts on a Catalina-inspired account-selection screen before exposing the web desktop. It shows three **demonstration accounts**:

| Account | Demonstration passcode |
|---|---|
| Pear User | `pear` |
| Developer | `demo` |
| Guest User | None — click to sign in |

Click an avatar to open the password prompt. For the two accounts with demo passcodes, entering the exact passcode signs in automatically (no Return/Enter required). A wrong passcode produces a shake/feedback message and then clears the field. The other accounts fade away and the wallpaper transitions from day to night during account selection. **Never enter your actual device/account password into this web demo**; the passcodes are public and embedded in `shell/LoginSession.js`.

The Pear menu offers **Lock Screen** and **Log Out…**: Lock returns to the current demo account's password prompt; Log Out returns to the account picker. The bottom Sleep / Restart / Shut Down controls only simulate these power states, and do not affect the computer. After Sleep, click or press a key to wake; Restart resets to account selection; the Shut Down screen offers Start PearPortOS.

This is not an authentication system. It has no Linux account integration, no server session, no secure storage, no user isolation and no protection against anyone opening the browser developer tools. All demo accounts share the same virtual file system and browser settings. Real Linux authentication must be implemented later through a system greeter/PAM and must **not** validate passwords by comparing text in a browser.

New code: `shell/LoginSession.js`, `shell/login.css`, and `assets/avatars/`. Login integration replaces the previous Enter-to-unlock stub in `shell/Phase5.js`. This is a UI-only update to the existing v0.5.4 desktop.
