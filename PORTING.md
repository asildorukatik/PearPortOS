# PearPortOS portability notes (Phases 1–2)

The web implementation is a **visual debug twin**, not an operating system. It cannot replace GNOME, manage real Wi-Fi/Bluetooth, render another application’s windows, or alter system settings. The code is intentionally vanilla JavaScript with shared CSS design tokens.

| Web component | Future Ubuntu implementation | Limits |
| --- | --- | --- |
| `core/tokens.css` + typography | GTK CSS / GNOME Shell CSS and exported JSON | GTK CSS supports only a subset of web effects |
| `ThemeManager` | GNOME dconf / gsettings adaptor | Apps may still use their own theme |
| `WindowManager` | GNOME Shell extension for decoration/integration, or Wayland compositor for full control | A browser cannot handle native windows; GNOME extension has compositor limits |
| `shell/MenuBar.js` | GNOME Shell panel extension or custom compositor shell | Individual native menus need application integration |
| `shell/Dock.js` | GNOME extension / standalone Wayland layer-shell | Native minimise Genie effect needs compositor/window snapshots |
| `shell/Desktop.js` | GNOME Shell extension or desktop layer-shell client | Native file actions need a real filesystem service |
| `CompareMode` / `DebugPanel` | Debug GTK/Qt window or GTK layer-shell | Pixel-alignment screenshots need matched scaling/display DPI |

Porting contracts to implement later: `WindowService`, `AppLauncher`, `NotificationService`, `FileService`, `SettingsService`, `SearchService`. Current modules expose lightweight class boundaries but these interfaces are not fully implemented until later phases. A real OS port is a separate build, not automatic conversion of the HTML shell.

Fonts: Inter and DejaVu Sans Mono are bundled under their free licenses. No Apple fonts, icons, or wallpapers are included.


## Phase 3 portability

`apps/preferences/Preferences.js` is a Catalina-era web mock. On Ubuntu, map real hardware preferences to NetworkManager/BlueZ/PipeWire/UPower via privileged native services. Do not claim that browser controls have modified OS state. `core/ui/widgets.css` tokens can inform GTK CSS, but GTK/libadwaita will not faithfully render Catalina controls without custom widgets. Dock geometry can be ported to a GNOME Shell extension or Wayland shell; only a compositor can replicate all native transforms.


## Phase 4 portability

`core/VirtualFS.js` implements `get/list/add/rename/move/copy/trash/restore/write` semantics over a tree of browser-owned objects. A native Linux implementation must replace this with an appropriately sandboxed GIO/GLib or portal-based file adapter, with correct permissions and asynchronous error handling. **Do not import localStorage/IndexedDB records directly into real paths without an explicit migration and user authorization.** Pearder views can reuse design tokens, but the web DOM and drag/drop handlers need GTK/Qt rewrites. The mock Terminal is NOT a system shell; a real terminal would require PTY integration, isolation and explicit access controls. Quick Look previews need MIME detection and a sandboxed preview service.


## Phase 5 portability

- `shell/Phase5.js` contains isolated browser implementations of `Spotlight`, `Launchpad`, `NotificationCenter`, `Siri`, `MissionControl`, `Session`, `Switcher`, and `HotCorners` behind a shell coordinator. Keep search, notifications, session actions, and real window management on injectable service boundaries for Linux.
- A native Linux Spotlight equivalent can index via Tracker/localsearch; a browser's `VirtualFS` search is not system file search. Native notifications require the freedesktop notification service, separate from browser UI toast events. Live weather/stocks would require permitted providers and network access.
- A real Wayland compositor or GNOME Shell extension is needed for window thumbnails, multiple workspaces, real fullscreen spaces, hot corners, app switching, and secure screen locking. The browser implementations are **visual and local**; the session lock is not a security boundary.
- Siri in this phase is a local command router. Native voice support requires opt-in microphone permissions, speech recognition infrastructure, and an explicitly configured assistant backend; do not silently dispatch captured utterances to remote services.

## Web prototype -> desktop environment vs kiosk (accuracy pass A)

PearPortOS web is the geometry and interaction debugging twin. For the native
Linux implementation, replace browser adapters (`WindowService`, `SettingsService`,
`FileService`, `NotificationService`) with compositor/Wayland or desktop-native
implementations; preserve design tokens and icon mapping. A GTK app alone cannot
replace the system-wide window manager, status bar, or native app switcher. A full
session shell requires a desktop compositor or existing shell extension.

**Kiosk fallback:** launch the web build in a dedicated Chromium/CEF kiosk session.
It can look like a standalone desktop, but still cannot manage native windows,
networking, Bluetooth, system volume, power, or the real file system without a
separate privileged, audited local bridge. A kiosk webpage is not itself an OS.
