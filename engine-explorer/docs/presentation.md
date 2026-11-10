# F22A6 instrument panel

## Presentation contract

Both viewers share `src/ui/presentation.css`, the local IBM Plex font assets, and `src/ui/icons.js`. Page styles contain layout and page-specific theme values. Both viewers now use `src/ui/theme.css`: the La Furia Roja black/red/white palette, with matching light and soft accessibility alternatives. Theme and base text size are shared across both viewers through `src/ui/appearance.js`.

- IBM Plex Sans: explanations and controls, weights 400 / 500 / 600.
- IBM Plex Sans Condensed: headings, weights 400 / 500 / 600.
- Tabular numerals: angles, progress, quantities. System monospace: OEM references.
- Spacing: 4 / 8 / 12 / 16 / 24 / 32 px. Corners: 8 px controls, 12 px panels.
- Surfaces: matte panel, inset surface, raised surface. Fine borders, inset edge highlights and shallow shadows separate related regions.
- Controls: minimum 44 px targets, visible focus, reduced-motion CSS. Icon transitions do not change layout bounds.

## Icon vocabulary

Seven view mappings and twelve system mappings are exported from one registry. Mechanical pictograms are original project SVG artwork on a 32-unit grid with 1.7-unit strokes and 18% fill layers. These are navigation symbols, not engineering drawings. Utility controls use selected Phosphor Duotone SVGs at 24 px. Mechanical icons use 32 px except compact identifiers.

Inline SVGs are decorative and hidden from assistive technology. Their owning buttons provide visible text or localized accessible names. Keep `.control-label` spans when updating translations. `setControlText()` updates the label without destroying the icon. `setControlIcon()` updates state icons without replacing the owning button or its listeners. Main-engine static localization retains its original node binding approach.

Use the focus accent rather than the lime accent for meaningful icons on the catalogue's light background. Native selects retain their browser semantics. The complete engine adds a separate pictogram beside its system selector.

## Layout

- Complete engine: compact identity/utilities, scrollable view strip, framed canvas with local transport, and a 380–440 px inspector from 1200 px.
- Below 1200 px, the inspector follows the engine. Above 160% text, the engine and inspector also stack. At 160% text, Spanish inspector tabs remain on one row.
- Catalogue: three columns from 1440 px; explanation below viewer from 1200–1439 px; catalogue above workspace below 1200 px. Below 900 px, its list becomes an explicitly named expandable section. The skip link expands it before focusing search.
- Enlarged text and short screens use scrolling; content is not forced into a clipped viewport.
- Closing a Help dialog returns focus to the Help summary, since its nested menu has closed.

## Build

```
sh scripts/build.sh
node scripts/build-anatomy.mjs
node scripts/build-icon-overview.mjs
```

`scripts/presentation.mjs` embeds the six WOFF2 files and shared styles in both self-contained HTML pages. The build uses the already-installed teardown esbuild dependency without modifying the global skill. The catalogue's existing media revision hash is retained. Media assets remain alongside the page as before.

The original build entry points and active page URLs remain valid. Existing source changes were preserved. A snapshot of touched files from before this redesign was saved in this chat's `work/frontend-before-*` directory.

## Assets and licenses

- IBM Plex WOFF2: Fontsource distributions, version 5.2.5; IBM Plex SIL Open Font License in `assets/fonts/OFL.txt`.
- Selected Phosphor Duotone assets: official `phosphor-icons/core` repository; MIT license in `assets/icons/LICENSE`.
- Fonts and icons require no CDN at runtime. `assets/icons/utility.json` is the local utility SVG registry; keep it synchronized with the selected SVG files if updating them.

Mechanical geometry, kinematics, component inventory, evidence claims, videos and captions were not regenerated for this presentation change.

## La Furia Roja revision

The current composition follows the requested approximate 60% black / 30% red / 10% white direction through black workspaces, red instrument bands, selected surfaces and white reading text. This is an art-direction target, not an exact pixel-area claim. Bright red icon/focus accents are separate from deeper red action surfaces so white button text retains contrast.

The main and Anatomy 3D stages share a black backdrop. Their geometry, materials and studio lights remain the same. Selection outlines now use red. Anatomy also uses the main viewer's base text scale rather than its former independent 18 px base. Its Large text control adds an optional local enlargement.

The language select keeps native semantics and keyboard behavior while its CSS chevron is inset 16 px, with reserved text padding; it no longer touches the button edge.

`src/ui/glyph-background.js` adapts the supplied React component's shader to the existing framework-free app. It draws a black-grounded glyph field, red pointer trails and red click waves behind the interface. Cards and model canvases are transparent under the later revisions below. No React, animation library, Tailwind migration, runtime CDN or new npm dependency is required. The effect caps rendering at 24 fps and DPR at 1.25, pauses when the document is hidden, renders a static frame for OS/app reduced motion, and falls back to the normal black background if WebGL cannot initialize.

## Compact explanations and glyphs inside the viewers

Visible project-name badges were removed from both headers at the user's request. Black/red/white styling remains.

`src/ui/disclosures.js` provides native details/summary controls for the main-engine explanations and all three Anatomy information tabs. Sections start closed, open with mouse or keyboard, and retain their open state by component and section across language changes and revisiting that component. Content, narration and OEM links remain available. An explicit capture before rerender preserves state even during rapid language switching.

Both WebGL model canvases now clear with transparent alpha. `src/ui/glyph-backdrop.js` copies the existing page glyph canvas into a 2D layer below each model canvas, with matching screen coordinates. Models and labels render above the glyphs; the effect adds no WebGL context and no overlay over opaque model pixels. It follows the existing capped 24 fps source, handles scrolling/resizing, and stays static with reduced motion. A single backdrop is reused when switching individual parts.

Verified through visible browser controls: closed summaries expose only their headings; Enter opens a section; Spanish/English switching retains it; motion and OEM sections still reveal their content; changing components keeps one backdrop and one model canvas. Complete-engine selection outlines and labels render correctly over the background. Existing localization and 102-component anatomy checks pass.

## Fully transparent cards

`src/ui/surfaces.css` is embedded last by `scripts/presentation.mjs` in both viewers. Dashboard cards, their structural headers, accordion sections and metric panels have transparent backgrounds without backdrop blur or surface shadows. Borders, red selection accents and fully opaque text preserve structure. Buttons, inputs, model labels and floating dialogs retain their independent readable treatments.

Both pages were rebuilt and visually reviewed. Computed backgrounds for the main viewer, inspector, navigation, transport, catalogue, figure frame and explanation sections are `rgba(0, 0, 0, 0)`. The glyph background is visible through them. This revision changes presentation only.

## Cinematic motorsport view titles

The main explorer uses a dedicated, viewport-centered title row below the compact brand and utilities. It combines a localized counter calculated from `VIEW_ORDER`, an uppercase IBM Plex Sans Condensed 700 heading, and a decorative 72 × 3 px red rule. The local 700 face and its OFL license are bundled only into the main explorer; Anatomy, geometry and videos are unchanged.

At 125% text, headings use 40–52 px on desktop and 26–32 px on phones, scaling proportionally with the existing text preference. Tracking is .035 em and line height is 1.1. Balanced natural wrapping and language-aware hyphenation preserve complete labels. No halo or title shadow is used. Secondary section headings retain their existing scale.

`updateViewHeading` owns the title and counter. Its opacity-only 200 ms entrance runs on actual view changes after initialization. Initial/deep-linked loads, language changes and resizing do not trigger an entrance. Both the application and OS reduced-motion preferences prevent the animation; switching either preference on also cancels an active entrance.

Layout measures the entire title composition before placing menus and docked drawers. The title stays centered when a drawer changes the model's presentation offset. At heights of 500 px or less, the counter omits its word prefix, the heading uses a 26 px base, and the camera becomes a two-column bottom-right grid. Names sits above playback. An open timeline reserves space around both controls and scrolls internally at extreme text enlargement, keeping its controls reachable.

Browser review covers all eight views in Spanish and English across 375, 768, 1024 and 1440 px widths, plus 812 × 375 landscape, at 125%, 160% and 240% text. Evidence and measured results are in `tests/cinematic-title-review/` and `tests/cinematic-title-ui-review.json`. Keyboard view navigation, Escape focus return, centered titles with a panel, reduced motion and language-preserved Assembly progress were also checked.
