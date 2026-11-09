# La Furia Roja — theme and glyph background

Implemented 9 November 2026.

- One black/red/white palette and IBM Plex typography across the complete-engine dashboard and Anatomy.
- Black workspaces, red instrument bands, white reading text; red model-selection outlines.
- Shared theme and base text-size preferences.
- Fixed language-selector chevron placement in both pages.
- Adapted the supplied glyph shader to local vanilla JavaScript: subtle red glyph clouds, pointer trails and click ripples, behind opaque panels and model canvases.
- No framework migration or added npm dependencies.

## Verified

- Both pages built successfully. Existing timing, localization and 102-component anatomy checks pass.
- Main canvas remains 360.70 px tall at 1456 × 800 / 160% text.
- Anatomy inspected at 1456 px and 375 px with the shared 160% text size; document scroll width equals viewport width. Phone video-tab text wraps inside its button.
- Language switching preserves a single glyph canvas and the language selector remains functional.
- App reduced motion changes the glyph field to static; header screenshots captured across the CPU verification run were byte-identical. Re-enabling motion resumes the effect.
- Both reading themes use the same shared color tokens; white-on-red button/band contrast and reading-text contrast are recorded in furia-roja-contrast.json.

The 60/30/10 distribution is an approximate visual composition, not a measured pixel ratio. Background effects do not alter engine geometry, mechanics or media. On WebGL failure or context loss the page remains usable with its black background. Mobile review used browser viewport overrides rather than physical hardware.

Previews: furia-roja-main.png and furia-roja-anatomy.png.
