/**
 * Camera field-of-view helpers.
 *
 * Three.js cameras take a VERTICAL field of view. We want every seat to be
 * compared with the same HORIZONTAL view (like your eyes), whatever the
 * shape of the phone or window, so we convert.
 */

/** Horizontal field of view of the POV camera, in degrees. */
export const POV_HORIZONTAL_FOV = 70

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

/** Vertical FOV (degrees) that gives `horizontalFov` on a viewport with this aspect (width / height). */
export function verticalFov(horizontalFov: number, aspect: number): number {
  return toDeg(2 * Math.atan(Math.tan(toRad(horizontalFov) / 2) / aspect))
}
