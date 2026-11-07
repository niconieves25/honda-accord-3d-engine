// Procedural surface textures drawn on canvases at load: cast-aluminium grain, the rust-speckled heat shield, the
// valve-cover lettering (Honda "H" and VTEC, as photographed). No image files, so the page stays one offline file.
import * as THREE from 'three';

const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** a fine noise used as a bump map: the rough sand-cast surface of the block, head and manifold */
export const castBump = () =>
  canvasTex(
    256,
    256,
    (g, w, h) => {
      const r = rng(7);
      const img = g.createImageData(w, h);
      for (let i = 0; i < w * h; i++) {
        const v = 110 + r() * 90;
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
        img.data[i * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    },
    false,
  );

/** weathered grey steel with rust specks, after photos 5–7 */
export const rustShield = () =>
  canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#b4aea3';
    g.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let i = 0; i < 2600; i++) {
      const x = r() * w;
      const y = r() * h;
      const s = 0.6 + r() * 2.8;
      g.fillStyle = `rgba(${120 + r() * 50},${60 + r() * 30},${30 + r() * 20},${0.35 + r() * 0.5})`;
      g.beginPath();
      g.arc(x, y, s, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(150,140,128,${0.15 + r() * 0.2})`;
      g.fillRect(r() * w, r() * h, 20 + r() * 60, 6 + r() * 20);
    }
  });

/** the top of the valve cover: silver paint, the Honda "H" in a rounded box and raised VTEC letters */
export const coverTop = () =>
  canvasTex(1024, 434, (g, w, h) => {
    g.fillStyle = '#a5a59f';
    g.fillRect(0, 0, w, h);
    const r = rng(3);
    for (let i = 0; i < 1500; i++) {
      g.fillStyle = `rgba(90,90,85,${r() * 0.06})`;
      g.fillRect(r() * w, r() * h, 2, 2);
    }
    // the lettering block sits on the intake-side half of the cover (the top of this texture)
    const cy = h * 0.3;
    const emboss = (draw) => {
      g.save();
      g.translate(2, 3);
      g.fillStyle = 'rgba(40,40,38,.55)';
      g.strokeStyle = 'rgba(40,40,38,.55)';
      draw();
      g.restore();
      g.fillStyle = '#d8d8d2';
      g.strokeStyle = '#d8d8d2';
      draw();
    };
    // the H mark: a rounded rectangle outline with an H inside
    emboss(() => {
      g.lineWidth = 9;
      const x = w * 0.28;
      const bw = 110;
      const bh = 96;
      g.beginPath();
      g.roundRect(x - bw / 2, cy - bh / 2, bw, bh, 22);
      g.stroke();
      g.font = '700 74px Arial, Helvetica, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('H', x, cy + 3);
    });
    emboss(() => {
      g.font = '800 132px Arial Black, Arial, sans-serif';
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText('VTEC', w * 0.36, cy + 6);
    });
  });

/** black ribbed plastic for the timing covers */
export const ribs = () =>
  canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#808080';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) {
      g.fillStyle = '#f0f0f0';
      g.fillRect(0, y, w, 3);
    }
  }, false);
