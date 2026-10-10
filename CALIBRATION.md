# PearPortOS Catalina geometry calibration

**Target:** macOS Catalina 10.15.7, light/dark, 2019. Reference order: `assets/reference/catalina-dark.jpg` (first upload) and `assets/reference/catalina-light.jpg` (second upload). **No additional Catalina UI reference has been provided.**

## Image measurements (observations, not CSS pixels)

| Feature | Dark JPEG measurement | Light JPEG measurement | Status | Interpretation |
| --- | --- | --- | --- | --- |
| Raster resolution | **561 × 351 px** | **565 × 353 px** | MEASURED | Both roughly 1.60:1 (likely heavily resized from a desktop capture) |
| Menu bar horizontal span | full 561 px | full 565 px | MEASURED | Header spans entire viewport |
| Visible menu bar strip | approximately **7–8 raster px** | approximately **7–8 raster px** | MEASURED, low-confidence edge | Blur/JPEG compression prevents an exact pixel boundary |
| Dock shelf top | approximately **raster y 326–328** | approximately **raster y 326–330** | MEASURED, low-confidence edge | Dock shelf near screenshot bottom |
| Dock location | centered | centered | MEASURED | Bottom-centered floating shelf |
| Dock left/right | approximately **x 17–543** | approximately **x 18–550** | MEASURED, low-confidence edge | Dock fills ~93–94% of these thumbnails |
| Dock bottom gap | approximately **3–5 raster px** | approximately **0–4 raster px** | MEASURED, low-confidence edge | Shelf/bottom blurred, probably cropped |
| Dock apps visible | roughly **22–23 slots** including Downloads and Trash | roughly **22–23 slots** including Downloads and Trash | MEASURED (approximate count) | Original screenshot app set differs; use similar density |
| Wallpaper | night rugged island above sea | daytime island, pink-grey sky | MEASURED | Original SVG is a legal approximation, *not* the Catalina image |
| Window borders/chrome | none shown | none shown | UNOBSERVABLE | All window metrics are assumed from written requirements |
| Retina density / device resolution | unknown | unknown | NOT MEASURABLE | Do **not** divide these reduced JPEGs by 2. Calibrate in CSS pixels against an unresized capture with its display resolution noted. |

## Token ledger

The large global stylesheet `core/tokens.css` deliberately contains `/* ASSUMED – verify with screenshot */` annotations on every **unobserved** Catalina chrome / behavior dimension. CSS values remain assumptions even if their visual form is supported by the screenshot. Screenshot-measured raster data remains above, separate from inferred CSS geometry.

| Token | Current CSS value | Status | Screenshot to verify |
| --- | --- | --- | --- |
| `--menu-height` | `22px` | ASSUMED; screenshot bar approximately 7–8 **raster** px | Full-resolution desktop screenshot + display dimensions |
| `--menu-font-size` / `--fs-menu` | `14px` | ASSUMED | Full-resolution menu bar crop |
| `--menu-background` (light / dark) | `rgba(236,236,236,.82)` / `rgba(30,30,30,.8)` | ASSUMED | Both desktop modes, menu open/closed |
| `--status-icon-size` | `15px` | ASSUMED | Full-resolution menu status area |
| `--menu-item-height` | `20px` | ASSUMED | Open Pear menu + open File menu |
| `--menu-popup-radius` | `5px` | ASSUMED | Open Apple-style menu screenshot |
| `--menu-popup-blur` | `20px` | ASSUMED | Open Apple-style menu over the wallpaper |
| `--window-radius` | `5px` | ASSUMED | Active Finder/Pearder window screenshot |
| `--window-title-height` | `22px` | ASSUMED | Title-only active and inactive windows |
| `--window-toolbar-height` | `38px` | ASSUMED | Finder icon and column view |
| `--window-shadow` | `0 22px 70px 4px rgba(0,0,0,.3)` | ASSUMED | Two overlapping active/inactive windows |
| `--window-min-width` / `--window-min-height` | `285px` / `155px` | ASSUMED | Narrow live Finder window |
| `--traffic-size` / `--traffic-gap` / `--traffic-left` | `12px` / `8px` / `8px` | ASSUMED | Close window controls, zoomed screenshot |
| `--traffic-close` / `--traffic-minimize` / `--traffic-zoom` | `#ff5f56` / `#ffbd2e` / `#27c93f` | ASSUMED | Active/inactive Finder window |
| `--dock-icon-size` | `clamp(10px, (100vw - 190px)/22, 52px)` (responsive override ≤800px) | ASSUMED; responsive to fit ~22 icons | Dock screenshot at native resolution without magnification |
| `--dock-radius` | `13px` | ASSUMED | Dock screenshot at native resolution |
| `--dock-padding-y` / `--dock-padding-x` | `5px` / `11px` | ASSUMED | Dock edge crop |
| `--dock-blur` | `25px` | ASSUMED | Dock over textured wallpaper |
| `--dock-bottom-gap` | `6px` | ASSUMED; screenshot gap ~0–5 **raster** px | Native screenshot + screen size |
| `--dock-icon-gap` | `6px` (2px on narrow screens) | ASSUMED | Native Dock screenshot |
| `--dock-indicator-size` | `4px` | ASSUMED | App running indicator close-up |
| `--dock-max-scale` | `2` | ASSUMED | Screenshot with Dock magnification active |
| `--anim-window-open` / `--anim-minimize` | `220ms` / `450ms` | ASSUMED | Screen recording of launch/minimize |
| `--accent` (light/dark) | `#0a64ff` / `#0a84ff` | ASSUMED | Selection in Finder / menu hover |
| `--surface` (light/dark) | `#ececec` / `#282828` | ASSUMED | Window + System Preferences screenshots |
| `--window-content-padding` | `22px` | ASSUMED | Finder/System Preferences interiors |
| `--desktop-cell-width` / `--desktop-cell-height` | `83px` / `88px` | ASSUMED | Screenshot with at least one desktop file icon |
| `--dock-icon-size` (≤800px) | `clamp(10px, (100vw - 90px)/22, 38px)` | ASSUMED; fit-tested, not Catalina-measured | Unscaled native Dock capture at narrow viewport |
| `--dock-magnify-radius` / `--dock-max-scale` | `4` icon widths / `2` | ASSUMED | Native Dock with magnification on, center and end icon |
| `--window-edge-snap-distance` | `12px` | ASSUMED; functional improvement | Screenshot/video of dragging against edge |
| `--window-zoom-bottom-reserve` | `20px` | ASSUMED | Zoomed Finder window with Dock visible |
| `--dock-tooltip-padding-y` / `--dock-tooltip-padding-x` | `5px` / `11px` | ASSUMED | Native Dock tooltip screenshot |
| `--dock-fit-margin` | `14px` | ASSUMED; reserved token | Native narrow Dock screen capture |
| `--compare-opacity` | `.5` | DEBUG DEFAULT | Not a Catalina token; screenshot alignment control |

## How to collect the next batch on the iMac

1. **Native desktop:** press **⌘ Shift 3** to capture the full desktop, keeping the original PNG. Open **Apple menu → About This Mac → Displays** to note the resolution and scaling. Do not resize the PNG before sharing.
2. **Menu:** click the upper-left Apple menu, then **⌘ Shift 4** and drag across the menu (or use **⌘ Shift 5** capture controls). Repeat for **File**.
3. **Two windows (Phase 2):** open two Finder windows (⌘ N twice), overlap them, and take a full-screen screenshot so the active/inactive traffic lights, shadows and titlebar can be compared.
4. **Dock (Phase 2):** hover the middle Dock icon so magnification is visible. Press **⌘ Shift 3** before moving away; take a second screenshot with no hover.
5. For precise colors: launch **Digital Color Meter** (`Applications → Utilities`), switch the color display to **Display in sRGB**, hover the desired pixel and read RGB. On Retina, measurement of an original, full-resolution screenshot may require dividing its *actual pixel dimensions* by the display scale; this does **not** apply to already resized thumbnails.

**Reference calibration is still pending.** The user explicitly authorized advancement through Phase 3 without new screenshots. The initial limited-reference assumptions remain unverified. When the user says “screenshots ready” and attaches images, adjust the calibration tokens and list deltas before redesigning components.

## Phase 2 refinement ledger (v0.2.1)

The reference images have **not changed**. All numeric refinements here are still **ASSUMED** because the only references are the two resized desktop screenshots. No screenshot-derived measurements were overwritten.

| Item | Prior | v0.2.1 | Basis |
| --- | --- | --- | --- |
| Default Dock icon sizing | `clamp(20px, 4.167vw - 10px, 52px)` | `clamp(10px, (100vw - 190px)/22, 52px)`; responsive override on screens ≤800px | Responsive layout behavior, NOT reference pixel evidence |
| Dock magnification | Changed element width; measured `clamp()` with `parseFloat` fallback | Transforms icon scale and neighbor positions; captures resting centers | Fix scaling error and shelf-width overflow |
| Window close/minimize transitions | Transition callbacks could race | Cancellable transitions and closing state | Browser-regression tests |
| Window geometry | No edge snapping on release | Magnetic snap within `12px` | Functional Phase 2 requirement, provisional geometry |
| Pear mark | Old original glyph was visually apple-like | Distinctive original full pear silhouette and leaf | Brand differentiation, NOT Catalina reference evidence |
| Test coverage | Static only | Chromium in-memory behavioral smoke test passed, 0 JS errors | Rendering browser was prohibited from `file://` and localhost navigation by environment policy |

All post-v0.2.1 Phase 3–6 features remain intentionally unimplemented.


## Phase 2 refinement ledger (v0.2.2)

No additional Catalina screenshots were received for this update. **No observed geometric values were changed**; the implementation adds interaction-only tokens, all with `/* ASSUMED – verify with screenshot */` annotations in `core/tokens.css`.

| New token | Current value | Status | Reference needed |
| --- | --- | --- | --- |
| `--dock-reveal-height` / `--dock-hidden-peek` | `8px` / `2px` | ASSUMED | Short capture of Dock auto-hide and reveal |
| `--dock-auto-hide-duration` / `--dock-hide-delay` | `280ms` / `320ms` | ASSUMED | Screen recording of Dock auto-hide |
| `--dock-divider-width` / `--dock-divider-margin` | `1px` / `4px` | ASSUMED | Native Dock close-up at full resolution |
| `--dock-fit-min-size` | `8px` | ASSUMED (responsive fallback) | Capture of Dock on small display |
| `--dock-popup-edge-margin` | `6px` | ASSUMED | Dock contextual menu near right screen edge |
| `--dock-bounce-duration` | `1440ms` | ASSUMED | Screen recording of app launching from Dock |
| `--window-drag-anchor-y` | `11px` | ASSUMED | Video dragging a zoomed window by its titlebar |
| `--dock-drag-indicator-width` | `3px` | ASSUMED | Video rearranging Dock icons |

**Functional changes:** drag to reorder Dock shortcuts; Keep/Remove in Dock with running-app temporary presence; persistent Dock preferences via localStorage where available; Dock auto-hide/reveal; viewport-aware window repositioning; draggable detachment of a zoomed window; fullscreen focus/stacking correction. No Finder, System Preferences, Launchpad, Spotlight, or other Phase 3+ UI was implemented.


## Phase 3 v0.3.0 — assumed dimensions and functional verification

The user explicitly requested proceeding until reaching Phase 4. No native-resolution Catalina screenshots were provided during this build, so **no unobserved dimensions are labeled MEASURED**. Grid and controls follow the 10.15.7 written override rather than later macOS styling.

| Token | Value | Status | Screenshot needed |
|---|---|---|---|
| `--prefs-width` / `--prefs-height` | `724px` / `570px` | ASSUMED | System Preferences icon grid full native resolution |
| `--prefs-toolbar-height` / `--prefs-toolbar-left` | `46px` / `82px` | ASSUMED | Preferences main grid with traffic lights and navigation |
| `--prefs-grid-icon` / `--prefs-grid-gap` | `39px` / `11px` | ASSUMED | Preferences main grid |
| `--prefs-grid-columns` / `--prefs-grid-cell-height` | `5` / `83px` | ASSUMED | Preferences full window |
| `--prefs-search-width` / `--prefs-pane-padding` | `166px` / `24px` | ASSUMED | Preferences toolbar + General pane |
| `--prefs-row-height` / `--ui-row-label-width` | `36px` / `135px` | ASSUMED | General, Dock panes |
| `--ui-button-height` / `--ui-button-radius` | `22px` / `5px` | ASSUMED | Catalina alerts and preferences close-up |
| `--ui-field-height` / `--ui-checkbox-size` | `23px` / `14px` | ASSUMED | Preferences controls close-up |
| `--ui-slider-track-height` / `--ui-slider-knob-size` | `4px` / `16px` | ASSUMED | Dock preferences pane |
| `--ui-focus-ring-size` / `--ui-focus-ring-alpha` | `3px` / `.50` | ASSUMED | Focused macOS Catalina field |
| `--dock-icon-size` (desktop) | changed from max `52px` to `42px`, responsive formula `(100vw - 210px) / 25` | ASSUMED, functional spacing | Native desktop with idle and magnified Dock |
| `--dock-max-scale` | `2` (user adjustable) | ASSUMED | Native magnified Dock screenshot |

**Why the Dock icon size changed:** In v0.2.2 the shelf could occupy over 98% of a 1280px viewport, leaving no room for it to expand when magnified. The 42px provisional cap reserves expansion room so the background follows actual icon layout widths. The maximum effective magnification is reduced automatically on small screens to avoid overflow.

**Behavioral verification:** Chromium interaction tests passed for grid search and navigation, appearance and eight-color accent state, Dock size/autohide/edge positioning, and all pane mounts, in addition to Phase 1/2 regressions. The test environment blocked direct browser navigation, so it used in-memory injection of the same source scripts/styles.

**Next screenshot batch:** Catalina System Preferences icon grid light/dark; General pane with accent choices and appearance; Dock pane with magnification enabled; one sheet/dialog; Native Dock at rest and magnified.


## Phase 4 v0.4.0 — Pearder, Quick Look and Terminal calibration

The only user-supplied visual references remain two low-resolution Catalina desktop screenshots. **None of the dimensions below were measured from actual Finder, Terminal, or Quick Look screenshots.** All are `ASSUMED` and tokenized in `core/tokens.css`.

| Token | Current value | Status | Needed native screenshot |
|---|---|---|---|
| `--pearder-width` | `820px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-height` | `525px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-toolbar-height` | `42px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-toolbar-left` | `82px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-toolbar-pad` | `11px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-toolbar-gap` | `7px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-toolbar-button-height` | `25px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-nav-size` | `24px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-title-max` | `160px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-search-width` | `145px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-search-min` | `75px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-search-pad` | `8px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-width` | `176px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-narrow` | `112px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-bg` | `rgba(195,195,205,.20)` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-blur` | `20px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-padding-y` | `13px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-padding-x` | `8px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-row` | `25px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-radius` | `4px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-icon-gap` | `10px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-symbol-size` | `18px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-sidebar-item-pad` | `8px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-heading-pad` | `7px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-group-gap` | `12px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-grid-cell` | `94px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-grid-gap` | `10px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-grid-padding` | `14px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-file-radius` | `4px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-file-pad` | `5px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-icon-size` | `53px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-icon-gap` | `6px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-name-col-min` | `160px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-date-col-min` | `115px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-size-col` | `80px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-kind-col` | `95px` | ASSUMED | Finder toolbar and sidebar |
| `--pearder-image-preview-max-height` | `170px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-list-min-width` | `500px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-list-row` | `26px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-list-icon` | `18px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-list-pad` | `11px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-list-gap` | `8px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-column-width` | `211px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-column-pad` | `5px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-column-preview-width` | `235px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-gallery-gap` | `10px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-gallery-strip-height` | `91px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-gallery-pad` | `7px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-gallery-thumb-width` | `75px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-gallery-thumb-icon` | `45px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-preview-pad` | `25px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-preview-icon` | `95px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-pathbar-height` | `23px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-pathbar-gap` | `7px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-status-height` | `23px` | ASSUMED | Finder view mode shown at native resolution |
| `--pearder-status-pad` | `12px` | ASSUMED | Finder view mode shown at native resolution |
| `--quicklook-width` | `660px` | ASSUMED | Quick Look of a text document |
| `--quicklook-height` | `475px` | ASSUMED | Quick Look of a text document |
| `--quicklook-header-height` | `31px` | ASSUMED | Quick Look of a text document |
| `--quicklook-header-button-right` | `12px` | ASSUMED | Quick Look of a text document |
| `--quicklook-content-pad` | `22px` | ASSUMED | Quick Look of a text document |
| `--quicklook-footer-height` | `37px` | ASSUMED | Quick Look of a text document |
| `--quicklook-footer-pad` | `12px` | ASSUMED | Quick Look of a text document |
| `--quicklook-generic-icon` | `120px` | ASSUMED | Quick Look of a text document |
| `--terminal-width` | `690px` | ASSUMED | Terminal with a few commands visible |
| `--terminal-height` | `410px` | ASSUMED | Terminal with a few commands visible |
| `--terminal-font-size` | `13px` | ASSUMED | Terminal with a few commands visible |
| `--terminal-line-height` | `18px` | ASSUMED | Terminal with a few commands visible |
| `--terminal-padding` | `10px` | ASSUMED | Terminal with a few commands visible |
| `--terminal-input-gap` | `8px` | ASSUMED | Terminal with a few commands visible |
| `--terminal-bg` | `#ffffff` | ASSUMED | Terminal with a few commands visible |
| `--terminal-fg` | `#161616` | ASSUMED | Terminal with a few commands visible |
| `--terminal-error` | `#bd3636` | ASSUMED | Terminal with a few commands visible |
| `--terminal-command` | `#666666` | ASSUMED | Terminal with a few commands visible |
| `--terminal-prompt` | `#444444` | ASSUMED | Terminal with a few commands visible |


| `--pearder-tabbar-height` | `25px` | ASSUMED | Finder with two tabs open |
| `--pearder-tabbar-inset` | `0px` | ASSUMED | Finder with two tabs open |
| `--pearder-tab-width` | `165px` | ASSUMED | Finder with two tabs open |
| `--pearder-tab-close-size` | `23px` | ASSUMED | Finder with two tabs open |

**Phase 4 screenshot priority:** (1) Finder icon view + toolbar + sidebar in light mode; (2) Finder columns with two nested folders selected; (3) Finder gallery view; (4) Quick Look of a text document; (5) Terminal with several command lines and title bar; (6) Finder dark mode with two overlapping windows. Please keep original screenshot resolution; use ⌘⇧3 (full screen) or ⌘⇧4 then Space (window).

**Functional status:** Chromium in-memory UI tests passed for file views, Quick Look, edits, Terminal and virtual filesystem actions. Browser reload persistence is intended via IndexedDB/localStorage but cannot be verified by cross-navigation in this sandbox. No native-Catalina geometry was measured in this phase.


## Phase 5: unverified Catalina geometry (v0.5.0)

No original-resolution iMac screenshots of Phase 5 overlays were provided. Every major Phase 5 component token is therefore **ASSUMED**, not MEASURED. The tiny Catalina desktop JPEGs can calibrate only menu/Dock proportions, not these overlays. Fine spacing and icon details in `shell/phase5.css` also remain provisional.

| Token | Current value | Status | Screenshot needed to verify |
| --- | --- | --- | --- |
| `--z-phase5` | `5200` | ASSUMED | Mission Control and Spotlight showing stacking over overlapping windows |
| `--z-spotlight` | `5600` | ASSUMED | Mission Control and Spotlight showing stacking over overlapping windows |
| `--z-notification` | `5700` | ASSUMED | Mission Control and Spotlight showing stacking over overlapping windows |
| `--z-banner` | `5750` | ASSUMED | Mission Control and Spotlight showing stacking over overlapping windows |
| `--z-hotcorners` | `5800` | ASSUMED | Mission Control and Spotlight showing stacking over overlapping windows |
| `--z-switcher` | `5850` | ASSUMED | Mission Control and Spotlight showing stacking over overlapping windows |
| `--z-session` | `8900` | ASSUMED | Mission Control and Spotlight showing stacking over overlapping windows |
| `--spotlight-top` | `19vh` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-width` | `680px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-radius` | `10px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-bg` | `rgba(246,246,249,.94)` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-blur` | `28px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-header-height` | `62px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-input-gap` | `13px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-pad` | `19px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-font` | `21px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-results-height` | `386px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-row-height` | `46px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-result-icon` | `31px` | ASSUMED | Spotlight window with search results and preview pane |
| `--spotlight-preview-icon` | `90px` | ASSUMED | Spotlight window with search results and preview pane |
| `--launchpad-blur` | `28px` | ASSUMED | Launchpad screen at native Catalina resolution |
| `--launchpad-pad-top` | `93px` | ASSUMED | Launchpad screen at native Catalina resolution |
| `--launchpad-pad-x` | `55px` | ASSUMED | Launchpad screen at native Catalina resolution |
| `--launchpad-grid-width` | `1030px` | ASSUMED | Launchpad screen at native Catalina resolution |
| `--launchpad-gap-x` | `24px` | ASSUMED | Launchpad screen at native Catalina resolution |
| `--launchpad-gap-y` | `23px` | ASSUMED | Launchpad screen at native Catalina resolution |
| `--launchpad-icon-size` | `78px` | ASSUMED | Launchpad screen at native Catalina resolution |
| `--nc-width` | `342px` | ASSUMED | Notification Center Today and Notifications tabs |
| `--nc-background` | `rgba(233,235,240,.91)` | ASSUMED | Notification Center Today and Notifications tabs |
| `--nc-card-bg` | `rgba(255,255,255,.72)` | ASSUMED | Notification Center Today and Notifications tabs |
| `--nc-card-radius` | `7px` | ASSUMED | Notification Center Today and Notifications tabs |
| `--nc-blur` | `38px` | ASSUMED | Notification Center Today and Notifications tabs |
| `--nc-slide-time` | `280ms` | ASSUMED | Notification Center Today and Notifications tabs |
| `--nc-banner-right` | `15px` | ASSUMED | Notification Center Today and Notifications tabs |
| `--nc-banner-top` | `12px` | ASSUMED | Notification Center Today and Notifications tabs |
| `--siri-offset` | `13px` | ASSUMED | Siri expanded panel |
| `--siri-width` | `320px` | ASSUMED | Siri expanded panel |
| `--siri-radius` | `9px` | ASSUMED | Siri expanded panel |
| `--siri-orb-size` | `35px` | ASSUMED | Siri expanded panel |
| `--mission-blur` | `26px` | ASSUMED | Mission Control with two or more windows |
| `--mission-pad-top` | `42px` | ASSUMED | Mission Control with two or more windows |
| `--mission-pad-x` | `20px` | ASSUMED | Mission Control with two or more windows |
| `--mission-spaces-height` | `103px` | ASSUMED | Mission Control with two or more windows |
| `--mission-space-preview-width` | `85px` | ASSUMED | Mission Control with two or more windows |
| `--mission-space-preview-height` | `51px` | ASSUMED | Mission Control with two or more windows |
| `--mission-cards-top` | `60px` | ASSUMED | Mission Control with two or more windows |
| `--mission-card-width` | `315px` | ASSUMED | Mission Control with two or more windows |
| `--mission-card-height` | `196px` | ASSUMED | Mission Control with two or more windows |
| `--session-blur` | `22px` | ASSUMED | Catalina login / lock screen |
| `--session-avatar-size` | `96px` | ASSUMED | Catalina login / lock screen |
| `--switcher-radius` | `12px` | ASSUMED | Cmd+Tab switcher with three apps |
| `--switcher-icon` | `64px` | ASSUMED | Cmd+Tab switcher with three apps |
| `--hotcorner-size` | `14px` | ASSUMED | Hot corners interaction video |
| `--nc-note-height` | `74px` | ASSUMED | Notification Center Today and Notifications tabs |

**Next screenshot priority:** (1) Spotlight with file result and right preview; (2) Launchpad full screen; (3) Mission Control with two spaces and at least three windows; (4) Notification Center **Today** tab and **Notifications** tab; (5) Siri panel; (6) Cmd+Tab switcher; (7) blurred login screen with user field. Please keep native screenshots, not downsampled versions.


## v0.5.1 Catalina fidelity pass (visual assumptions)

The existing 561×351 and 565×353 JPEG screenshots are compressed visual references. **No new source measurement** was possible. The refinements below remain ASSUMED until original-resolution screenshots arrive; the wallpaper is original design artwork rather than a direct photographic reproduction.

| Token / group | Current approximate value | Status | Reference needed |
|---|---|---|---|
| `--menu-font-size` / `--menu-gap` | 13px / 15px | ASSUMED | Native empty desktop with open File menu |
| `--menu-background` | light rgba(242,242,245,.83), dark rgba(27,29,34,.78) | ASSUMED | Light and dark desktop originals |
| `--dock-background` | light rgba(232,232,236,.54), dark rgba(83,87,99,.46) | ASSUMED | Native Dock over varied wallpaper |
| `--dock-fidelity-shadow` / `--dock-icon-shadow` | See tokens.css | ASSUMED | Idle and magnified Dock screenshot |
| `--window-fidelity-toolbar` / `--window-fidelity-titlebar` | Light silver, dark charcoal gradient | ASSUMED | Active and inactive Catalina Finder screenshots |
| `--sidebar-fidelity-surface` | light rgba(224,224,231,.70), dark rgba(49,49,53,.88) | ASSUMED | Finder icon/list view |
| `--pearder-segment-selected` | light white, dark translucent grey | ASSUMED | Finder toolbar showing four view buttons |
| `--nc-fidelity-background` / `--nc-fidelity-card-bg` | translucent light/dark | ASSUMED | Today and Notifications tabs in Catalina |
| `--catalina-wallpaper-light` / `--catalina-wallpaper-night` | CSS brightness/contrast/filter | ASSUMED (original illustration) | Native Catalina wallpaper screenshot only for overall visual feel |
| `--wallpaper-custom-fit` / `--wallpaper-custom-position` | cover / center center | ASSUMED | User-selected wallpaper fit options |

**Exactly what to photograph next:** Native-resolution Finder icon view with the window active, the same window inactive, menu bar with one dropdown open, and the magnified Dock over the wallpaper. Please do not resize or compress the screenshots. These are the only reliable way to replace assumed token values without a redesign.

## Catalina Accuracy Pass A (2026-10-10) — user-supplied screenshots

Input: high-resolution 1536×960 Catalina System Preferences screenshot, plus
smaller Finder menu and dock screenshots. Measurements below are screenshot-space
pixels; if scaled Retina captures, CSS sizing requires later verification.

| Token | Value | Status | Screenshot to verify |
|---|---|---|---|
| `--menu-height` | 22px | ESTIMATED FROM 1536×960 | Full resolution Finder menu bar |
| `--menu-font-size` | 13px | ESTIMATED FROM 1536×960 | Finder menu bar text |
| `--menu-gap` | 17px (base; final spacing via accuracy CSS) | ESTIMATED | Finder with Go menu |
| `--ca-menu-horizontal-padding` | 9px | ESTIMATED | Finder menu bar |
| `--dock-icon-size` | clamp(28px, 3.3vw, 53px) | ESTIMATED | 1536px system preferences Dock |
| `--dock-icon-gap` | 5px | ESTIMATED | System Preferences Dock |
| `--dock-padding-y` | 4px | ESTIMATED | System Preferences Dock |
| `--dock-radius` | 10px | ESTIMATED | System Preferences Dock |
| `--desktop-icon-size` | 56px | ESTIMATED | Desktop disk icons screenshot |
| Dock background opacity | .56 light/.29 dark | ASSUMED | Screenshot with wallpaper behind Dock |

This pass does not claim pixel-perfect comparison: available Catalina screenshots
have different resolution, scale and active applications. No Catalina Control
Center was added; the rounded Control Center screenshot depicts newer macOS.


## v0.5.3 — User assets replaced approximations

| Asset | Current file / source | Status | Notes |
|---|---|---|---|
| Catalina day | `assets/wallpapers/Catalina-Day.jpg` | USER-SUPPLIED | Exact provided source (700×700) |
| Catalina dusk | `assets/wallpapers/Catalina-Dusk.jpg` | USER-SUPPLIED | Exact provided source (700×393) |
| Catalina night | `assets/wallpapers/Catalina-Night.jpg` | USER-SUPPLIED | Exact provided source (700×700) |
| Application icon set | `assets/icons/user/*.png` | USER-SUPPLIED | Browser-compatible conversions from 72 `.icns` files |
| Launchpad icon | `assets/icons/user/launchpad-launcher.png` | USER-SUPPLIED | Correct rocket graphic rather than settings icon |
| System Preferences icon | `assets/icons/elementary/preferences.svg` | BASED ON ELEMENTARY | Offline vector variant; upstream pinned at `categories/48/preferences-system.svg` |
| Wallpaper display scaling | `cover; center` | ASSUMED | Square user images will crop vertically on widescreen |
| Dynamic Desktop times | 07:00–17:00 / 17:00–20:00 / 20:00–07:00 | ASSUMED | Temporary three-stage simulation; not Apple's original solar calculations |


### Phase v0.5.4 – Assumed values

| Token or measure | Value | Status | Screenshot to verify |
| --- | --- | --- | --- |
| --calendar-width | 920px | ASSUMED | Catalina Calendar month view |
| --calendar-height | 615px | ASSUMED | Catalina Calendar with event inspector |
| Desktop weather widget | 315 × 139px | ASSUMED | PearPortOS/ThanasOS widget reference |
| Analog clock & calendar widgets | 152 × 155px | ASSUMED | Widget reference at native resolution |
| Desktop health widget | 315 × 139px | ASSUMED | Widget reference |
| Launchpad stagger delay | 18ms per icon | ASSUMED | Catalina Launchpad screen recording |

## v0.5.5 — Login preview calibration (2026-10-10)

The two user-provided Catalina login images are small/downscaled references. Values below are all **ASSUMED** and should be remeasured against full-resolution source images before native implementation.

| Parameter | Current value | Status | Reference to verify |
|---|---|---|---|
| User chooser avatar | 106px diameter | ASSUMED | Three-account Catalina chooser |
| Selected user avatar | 98px diameter | ASSUMED | Password-entry Catalina screen |
| User row spacing | `clamp(30px,6vw,95px)` | ASSUMED | Three-account chooser |
| Login field | 230 × 34px, 15px radius | ASSUMED | Password-entry Catalina screen |
| Login backdrop blur | 3.5px chooser / 8px prompt | ASSUMED | Both Catalina login images |
| Account-selection / prompt position | 41% of viewport height | ASSUMED | Both Catalina login images |
| Power buttons | 32px circle, bottom 9vh / min 43px | ASSUMED | Both Catalina login images |
| Transition | 420ms content + 520ms wallpaper crossfade | ASSUMED | Video capture of Catalina login transition |
