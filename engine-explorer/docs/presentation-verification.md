# F22A6 dashboard redesign — verification

Implemented 9 November 2026 in the existing engine-explorer project.

## Delivered

- Rebuilt complete-engine and individual-parts dashboards with shared IBM Plex typography, matte panel treatments, inset headers, restrained depth and coordinated controls.
- Added original mechanical pictograms for seven views and twelve systems, plus locally bundled Phosphor Duotone utility icons.
- Moved main-engine playback into its viewer frame, consolidated Help, introduced single-row inspector tabs and an expandable mobile catalogue.
- Retained Spanish/English switching, saved accessibility preferences, component URLs, source information and the existing model/media.
- Added a project-owned offline presentation build and a standalone icon overview in both light and dark themes.

## Checks passed

| Check | Evidence |
| --- | --- |
| Main canvas at 1456 × 800, 160% text | 360.70 px tall, previously 227 px; transport fully visible. |
| Main responsive widths | 375, 768, 1024, 1440 px and 812 × 375 landscape; document scroll width equaled viewport width. |
| Catalogue responsive widths | 375, 768, 1024, 1440 px and 812 × 375 landscape; no document horizontal overflow. |
| Enlarged text | Main 240% at 1456 and 375 px without document overflow; catalogue large text at 375 px. |
| Themes | Main dark, light and soft; catalogue dark and light visually inspected. |
| Navigation | All seven main views selected successfully; keyboard arrows changed inspector tabs; Help closing returned focus to its summary. |
| Search and filtering | Main correa + timing filter returned two entries; mobile catalogue pistón search returned six. |
| Live translation | Main selection and paused angle retained; catalogue mechanism progress, rotation and active information tab retained; icons persisted. |
| Mechanics controls | Main step, IAB switch and oil path; catalogue step, rotation and zoom exercised. |
| Links and evidence | Crankshaft reference tab displayed; Locate opened selected crankshaft in the lower-engine view; browser Back restored the catalogue. |
| Media | English video played through its native controls. English → Spanish retained an explicitly sought paused time of 3.931622 s; source and VTT language changed correctly. |
| Narration | Read control entered its active Stop-reading state; pronunciation was not audibly assessed. |
| Browser errors | No error logs in either final viewer. |
| Existing timing checks | All passed during the build. |
| Existing localization checks | Passed: 520 engine string leaves, 102 components, 306 translated steps, 12 systems and both caption languages. |
| Existing anatomy checks | Passed: 102 types, 104 verified OEM links, 74 scene recipes, 102 rendered figures, 918 deterministic pose samples. |

Primary text contrast against panel surfaces ranges from 15.10:1 to 17.30:1; secondary text from 6.38:1 to 11.57:1; control-boundary tokens from 3.44:1 to 4.25:1. Detailed base-token results are in contrast-results.json. These are token calculations, not a complete WCAG conformance audit of every composited pixel or native browser media control.

## Review artifacts

- engine-before.png / engine-after.png
- catalogue-before.png / catalogue-after.png
- engine-details-en.png, engine-motion.png, engine-light.png, engine-text-240.png
- catalogue-reference.png, catalogue-light.png, catalogue-phone-large.png
- icon-overview.html: self-contained icon and state reference, both themes
- design-specification.md: design tokens, responsive rules, build commands and asset licenses

No engine geometry, mechanical calibration, OEM evidence, video files or captions were regenerated. Existing engineering approximations remain identified in the application. Responsive behavior was tested in the desktop in-app browser with viewport overrides, not on physical mobile devices. Browser viewport overrides and the temporary text/theme changes were restored after review.
