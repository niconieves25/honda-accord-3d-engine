// Drives the built page in headless Chromium: screenshots every view, and checks the controls and accessibility
// behaviour. Run: node tests/ui.mjs [outDir]   (macOS needs the Metal backend for WebGL, passed below)
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = process.env.SKILL_DIR || path.join(process.env.HOME, '.claude/skills/teardown');
const {chromium} = createRequire(path.join(SKILL, 'node_modules/x.js'))('playwright');
const out = path.resolve(process.argv[2] || path.join(HERE, '../.build/shots'));
fs.mkdirSync(out, {recursive: true});
const page_ = path.join(HERE, '../index.html');
const args = process.platform === 'darwin' ? ['--use-angle=metal', '--ignore-gpu-blocklist'] : ['--ignore-gpu-blocklist'];
const b = await chromium.launch({args});
const page = await b.newPage({viewport: {width: 1600, height: 1000}});
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await page.goto('file://' + page_);
await page.waitForFunction(() => window.EXPLORER, null, {timeout: 30000});
await page.waitForTimeout(1500);

let fails = 0;
const ok = (c, m) => {
  if (!c) fails++;
  console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`);
};
const shot = async (name) => page.screenshot({path: path.join(out, name + '.png')});

// pause so frames are comparable, put the crank at a known angle
await page.evaluate(() => {
  const E = window.EXPLORER;
  E.S.playing = false;
  E.S.th = 30;
});
const views = ['exterior', 'noCover', 'noTiming', 'cutaway', 'lower', 'vtec', 'exploded'];
for (const v of views) {
  await page.click(`[data-view="${v}"]`);
  await page.waitForTimeout(1600);
  await shot(`view-${v}`);
  ok((await page.getAttribute(`[data-view="${v}"]`, 'aria-checked')) === 'true', `view button "${v}" reports itself selected`);
}
await page.click('[data-view="exterior"]');
await page.waitForTimeout(1300);

// select from the list, the details fill in, the outline is set
await page.click('#tab-parts');
await page.fill('#parts-search', 'alternator');
await page.waitForTimeout(200);
await page.click('[data-part="alternator"]');
await page.waitForTimeout(400);
ok((await page.textContent('#det-body')).includes('Alternator'), 'choosing a part in the list shows its details');
ok((await page.getAttribute('#tab-details', 'aria-selected')) === 'true', 'choosing a part opens the Details tab');
ok((await page.evaluate(() => window.EXPLORER.st.scene && window.EXPLORER.S.selected)) === 'alternator', 'selection state follows the list');
await shot('select-alternator');

// click on the engine: the valve cover sits at the top centre in the exterior view
await page.click('#tab-parts');
await page.fill('#parts-search', '');
const hit = await page.evaluate(() => {
  const E = window.EXPLORER;
  const p = E.st.project(E.st.eng.anchorOf('valveCover'));
  const r = document.getElementById('gl').getBoundingClientRect();
  return [p[0] + r.left, p[1] + r.top];
});
await page.mouse.click(hit[0], hit[1]);
await page.waitForTimeout(300);
ok((await page.evaluate(() => window.EXPLORER.S.selected)) === 'valveCover', 'clicking the valve cover in 3D selects it');

// keyboard: Escape clears, N picks the next part, V toggles VTEC, focus ring visible on Tab
await page.keyboard.press('Escape');
ok((await page.evaluate(() => window.EXPLORER.S.selected)) === null, 'Escape clears the selection');
await page.focus('#gl');
await page.keyboard.press('n');
ok((await page.evaluate(() => window.EXPLORER.S.selected)) !== null, 'N selects a part');
await page.keyboard.press('Escape');
await page.keyboard.press('v');
ok((await page.getAttribute('#btn-vtec', 'aria-checked')) === 'true', 'V switches VTEC on (switch reports aria-checked)');
const az0 = await page.evaluate(() => window.EXPLORER.st.camera.position.x);
await page.focus('#gl');
await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(100);
ok(Math.abs((await page.evaluate(() => window.EXPLORER.st.camera.position.x)) - az0) > 1e-4, 'arrow keys turn the engine when it has focus');
await page.focus('#btn-play');
const ring = await page.evaluate(() => getComputedStyle(document.activeElement).outlineWidth);
ok(parseFloat(ring) >= 3, `focused controls show a thick focus ring (${ring})`);

// VTEC switches only on the base circle: step and check each cylinder's lock against its lift
const vt = await page.evaluate(async () => {
  const E = window.EXPLORER;
  E.S.vtec = false;
  E.stepBy(720);
  await new Promise((r) => setTimeout(r, 100));
  E.S.vtec = true;
  const log = [];
  for (let k = 0; k < 72; k++) {
    E.stepBy(10);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    log.push([...E.S.locked]);
  }
  return log;
});
ok(vt.at(-1).every((x) => x === 1), 'after a full cycle every cylinder has switched to VTEC');
ok(vt.some((row) => row.some((x) => x === 1) && row.some((x) => x === 0)), 'cylinders switch one at a time, each when its valves are closed');

// VTEC close-up while switched on
await page.click('[data-view="vtec"]');
await page.waitForTimeout(1600);
await shot('vtec-on');

// text size: 240 % makes body text much larger
await page.click('#btn-settings');
await page.fill('#text-size', '2.4');
await page.dispatchEvent('#text-size', 'input');
await page.waitForTimeout(400);
const fs24 = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('app')).fontSize));
ok(fs24 >= 40, `text scales to ${fs24}px at 240 %`);
await shot('text-240');
await page.fill('#text-size', '1.25');
await page.dispatchEvent('#text-size', 'input');
await page.selectOption('#theme-select', 'light');
await page.selectOption('#label-mode', 'view');
await page.click('[data-close="settings"]');
await page.click('[data-view="exterior"]');
await page.waitForTimeout(1500);
await shot('light-labels');

// flows on in the cutaway
await page.click('#btn-settings');
await page.selectOption('#theme-select', 'dark');
await page.click('[data-close="settings"]');
await page.click('#tab-motion');
for (const f of ['air', 'exhaust', 'oil', 'coolant']) await page.check(`[data-flow="${f}"]`);
await page.click('[data-view="lower"]');
await page.waitForTimeout(1600);
await shot('flows-lower');

// images and buttons all have accessible names
const unnamed = await page.evaluate(() => [...document.querySelectorAll('button, select, input')].filter((e) => !(e.getAttribute('aria-label') || e.textContent.trim() || e.labels?.length || e.getAttribute('placeholder'))).map((e) => e.id || e.outerHTML.slice(0, 60)));
ok(unnamed.length === 0, `every control has an accessible name${unnamed.length ? ': ' + unnamed.join(', ') : ''}`);

const fps = await page.evaluate(() => new Promise((r) => {
  let n = 0;
  const t0 = performance.now();
  const f = () => (n++, performance.now() - t0 < 2000 ? requestAnimationFrame(f) : r(n / 2));
  requestAnimationFrame(f);
}));
console.log(`frame rate ~${fps} fps`);
ok(errs.length === 0, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`);
console.log(fails ? `\n${fails} check(s) failed` : '\nall UI checks passed');
console.log(`screenshots in ${out}`);
await b.close();
process.exit(fails ? 1 : 0);
