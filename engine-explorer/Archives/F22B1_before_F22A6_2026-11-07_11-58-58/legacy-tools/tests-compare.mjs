// Renders the engine from each photograph's viewpoint and places the render beside the photo for review.
// Run: node tests/compare.mjs  → .build/compare/photo-N.jpg  (needs ffmpeg)
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = process.env.SKILL_DIR || path.join(process.env.HOME, '.claude/skills/teardown');
const {chromium} = createRequire(path.join(SKILL, 'node_modules/x.js'))('playwright');
const PHOTOS = path.join(HERE, '../../Pictures of engine');
const out = path.join(HERE, '../.build/compare');
fs.mkdirSync(out, {recursive: true});
// camera per photograph: target (mm), azimuth from the timing end toward the intake side, elevation, distance (m)
const CAMS = {
  'honda 1.jpeg': {t: [10, 110, -30], az: 52, el: 28, d: 1.5},
  'honda 3.jpeg': {t: [-20, 110, 0], az: 2, el: 8, d: 1.45},
  'HONDA 5.jpeg': {t: [0, 160, -20], az: -90, el: 62, d: 1.45},
  'honda 6.jpeg': {t: [-40, 110, 20], az: -42, el: 22, d: 1.55},
  'honda 7.jpeg': {t: [-40, 100, -10], az: -88, el: 6, d: 1.45},
  'honda 8.jpeg': {t: [0, 120, 0], az: 180, el: 8, d: 1.45},
  'honda 9.jpeg': {t: [40, 100, -20], az: 72, el: 10, d: 1.5},
};
const args = process.platform === 'darwin' ? ['--use-angle=metal', '--ignore-gpu-blocklist'] : [];
const b = await chromium.launch({args});
const page = await b.newPage({viewport: {width: 1500, height: 1000}});
await page.goto('file://' + path.join(HERE, '../index.html'));
await page.waitForFunction(() => window.EXPLORER);
await page.evaluate(() => {
  const E = window.EXPLORER;
  E.S.playing = false;
  E.S.th = 30;
  E.S.labelMode = 'none';
  E.S.theme = 'soft';
  document.documentElement.dataset.theme = 'soft';
  E.st.setTheme('soft');
});
for (const [photo, cam] of Object.entries(CAMS)) {
  await page.evaluate((c) => window.EXPLORER.camTo(c, true), cam);
  await page.waitForTimeout(400);
  const shot = path.join(out, 'render.png');
  await page.locator('#gl').screenshot({path: shot});
  const dst = path.join(out, photo.replace(/\s+/g, '-').replace('.jpeg', '.jpg').toLowerCase());
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(PHOTOS, photo), '-i', shot, '-filter_complex', '[0]scale=-2:640[a];[1]scale=-2:640[b];[a][b]hstack', '-q:v', '3', dst]);
  console.log(dst);
}
await b.close();
