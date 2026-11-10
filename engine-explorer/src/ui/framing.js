// Preserve the desktop reference lens; portrait adds breathing room on its
// shorter axis. The actual valve-view accessories and completed assembly crop
// at a 30–36° horizontal lens. A 44° portrait reference contains those canonical
// poses with at least 15 CSS pixels of side clearance on a 375 px phone.
// Projection changes leave the user's orbit target, orientation and zoom intact.
export const PORTRAIT_REFERENCE_FOV = 44;
export function resizePerspectiveCamera(camera, width, height, baseFov = 30, presentationScale = 1) {
  const w = Math.max(1, Number.isFinite(width) ? width : 1);
  const h = Math.max(1, Number.isFinite(height) ? height : 1);
  const aspect = w / h;
  const scale = Number.isFinite(presentationScale) && presentationScale > 0 ? Math.min(1, presentationScale) : 1;
  const referenceFov = aspect < 1 ? Math.max(baseFov, PORTRAIT_REFERENCE_FOV) : baseFov;
  const halfReference = referenceFov * Math.PI / 360;
  camera.aspect = aspect;
  camera.fov = aspect >= 1 && scale === 1 ? baseFov : 2 * Math.atan(Math.tan(halfReference) / Math.min(1, aspect) / scale) * 180 / Math.PI;
  camera.updateProjectionMatrix();
}

// Shift the composition beneath a nonmodal side panel without changing the
// orbit pivot. Positive offsets shift the rendered engine left in CSS pixels.
export function setPerspectivePresentationOffset(camera, width, height, offsetX = 0) {
  const w = Math.max(1, Number.isFinite(width) ? width : 1);
  const h = Math.max(1, Number.isFinite(height) ? height : 1);
  const x = Number.isFinite(offsetX) ? offsetX : 0;
  if (x === 0) camera.clearViewOffset();
  else camera.setViewOffset(w, h, x, 0, w, h);
}
