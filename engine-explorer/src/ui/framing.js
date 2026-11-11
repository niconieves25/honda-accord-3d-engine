// Minimum vertical and horizontal field of view for each reference pose.
// The valve view and completed assembly need extra room around their geometry.
const lenses = new Map([
  ['exterior', [36, 42]],
  ['noCover', [42, 48]],
  ['noTiming', [34, 40]],
  ['cutaway', [30, 36]],
  ['lower', [32, 36]],
  ['iab', [30, 38]],
  ['exploded', [30, 38]],
  ['assembly', [50, 50]],
]);
const halfAngle = Math.PI / 360;

export function resizePerspectiveCamera(camera, width, height, view = 'exterior') {
  const w = Math.max(1, Number.isFinite(width) ? width : 1);
  const h = Math.max(1, Number.isFinite(height) ? height : 1);
  const [vertical, horizontal] = lenses.get(view) ?? lenses.get('exterior');
  camera.aspect = w / h;
  // Choose the more constrained axis without a jump at square sizes.
  // Resizing the lens leaves the orbit target, orientation and user zoom intact.
  const tangent = Math.max(Math.tan(vertical * halfAngle), Math.tan(horizontal * halfAngle) / camera.aspect);
  camera.fov = Math.atan(tangent) / halfAngle;
  camera.updateProjectionMatrix();
}
