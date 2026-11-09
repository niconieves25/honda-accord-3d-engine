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
