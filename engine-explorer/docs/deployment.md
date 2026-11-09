# Publication / Publicación

- GitHub: `https://github.com/niconieves25/honda-accord-3d-engine`
- Vercel project: `honda-accord-1993`
- Intended domain: `proyectohonda.jniconieves.me`
- Vercel root directory: `engine-explorer`
- Include source files outside the root directory: enabled, for the sibling OEM reference library.
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`

The production build uses project-owned, pinned esbuild and Three.js dependencies. It builds the existing dashboards without changing model geometry, then generates a small bilingual landing page from `landing/`.

Public layout:

```text
/                                      bilingual landing / portada bilingüe
/engine-explorer/index.html             complete engine / motor completo
/engine-explorer/anatomy.html?piece=…    individual components / piezas
/engine-explorer/anatomy-media/f22a6/    videos, posters and captions / subtítulos
/Honda Reference Library/F22A6_1993_5MT/01_OEM_Diagrams/   OEM diagrams
```

Keep the local project layout unchanged. `scripts/package-site.mjs` copies only the active publishable assets to `dist/`; credentials, Node dependencies, tests and previous-version archives are not served.

Vercel is connected to the GitHub repository. Successful pushes to `main` trigger production builds. Follow the repository's `AGENTS.md`: commit completed work, push it, verify the remote SHA and explicitly report failures. The local `.vercel/` linkage and `.env.local` remain ignored.

The subdomain uses a CNAME record at the existing external DNS provider. Use the exact target returned by Vercel for this project. Adding the subdomain does not require purchasing another domain.

## Verified deployment · 2026-11-09

- Public site: `https://honda-accord-1993.vercel.app/`
- The landing and portable build were published from commit `6dd24c7c6b0259cf6a80708158792786352949b9` on `main`.
- Vercel reported the production deployment ready. The landing, both dashboards, preview image, English captions and an OEM diagram returned HTTP 200; video byte-range playback returned HTTP 206.
- Packaging verified all 612 component media files and 104 catalogue diagram references.
- Landing reviewed at 375, 768, 1024 and 1456 px, plus phone landscape. Spanish/English switching and entry into the dashboard with the chosen language were verified.
- All source, references and historical material were pushed. The dated branch `backup/f22a6-2026-11-09` preserves the same project tree as the landing commit, in addition to the original history on `main`.

The owner chose to finish DNS later. Vercel has the subdomain attached, but it is **not active** until this external DNS record is added and verified:

| Field | Value |
| --- | --- |
| Type | CNAME |
| Host | `proyectohonda` |
| Target | `8573559664c0f3d8.vercel-dns-017.com` |
| TTL | Automatic / provider default |

Re-check the recommendation with `vercel domains verify proyectohonda.jniconieves.me` before changing DNS if Vercel settings have changed. Confirm HTTPS after the record propagates. The root portfolio domain remains assigned to its original Vercel project.
