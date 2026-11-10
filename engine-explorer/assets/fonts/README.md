# Local font assets

The additional `ibm-plex-sans-condensed-latin-700-normal.woff2` used by the
main explorer's view titles is the unmodified Latin, normal-style, 700-weight
file from `@fontsource/ibm-plex-sans-condensed` version **5.3.0**.

- Package: https://www.npmjs.com/package/@fontsource/ibm-plex-sans-condensed/v/5.3.0
- Package archive: https://registry.npmjs.org/@fontsource/ibm-plex-sans-condensed/-/ibm-plex-sans-condensed-5.3.0.tgz
- Upstream family: https://github.com/IBM/plex
- License: SIL Open Font License 1.1; see `IBM-Plex-Sans-Condensed-OFL.txt`
  for the package's complete copyright notice and license.
- SHA-256: `4768878c107d92c528a65bba206a87cdcf2c694514e75907fb91772cf8a388a5`

The build embeds this extra face only in the main explorer HTML. It makes no
runtime font requests and adds no npm dependency. The pre-existing 400, 500,
and 600 faces and their `OFL.txt` remain as previously bundled.
