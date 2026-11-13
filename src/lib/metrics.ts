/**
 * Viewing metrics for a seat: how far the screen is, how much of your view it
 * fills, and how far off-centre you sit. All pure functions, no UI.
 */
import { HALL, type Seat } from '../data/hall'
import { eyePosition, SCREEN_CENTRE, type Vec3 } from './geometry'

export type SeatTag = 'Up close' | 'Sweet spot' | 'Full picture' | 'Side view'

export type SeatMetrics = {
  /** Metres from the eye to the screen centre. */
  distance: number
  /** Horizontal field of view the screen covers, in degrees. */
  fov: number
  /** Metres from the hall's centre line; + is right, - is left. */
  offset: number
  tag: SeatTag
}

/** Straight-line (3D Euclidean) distance from the eye to the screen centre, in metres. */
export function distanceToScreen(eye: Vec3): number {
  return Math.hypot(eye.x - SCREEN_CENTRE.x, eye.y - SCREEN_CENTRE.y, eye.z - SCREEN_CENTRE.z)
}

/**
 * How wide the screen looks, as an angle in degrees.
 *
 * Picture a triangle from your eye to the screen centre and to one screen edge:
 * the half-angle is atan(halfWidth / distance), so the full angle is twice that.
 */
export function horizontalFov(distance: number): number {
  const halfAngle = Math.atan(HALL.screenWidth / 2 / distance)
  return (2 * halfAngle * 180) / Math.PI
}

/** Sideways distance from the centre line in metres (+ right, - left). */
export function offsetFromCentre(eye: Vec3): number {
  return eye.x
}

/** "Centre" when within 10 cm of the middle, otherwise e.g. "0.3 m right" / "2.1 m left". */
export function formatOffset(offset: number): string {
  if (Math.abs(offset) < 0.1) return 'Centre'
  return `${Math.abs(offset).toFixed(1)} m ${offset > 0 ? 'right' : 'left'}`
}

/**
 * A one-word verdict for the seat. Rules are checked top to bottom and the
 * first match wins, so they never overlap.
 */
export function seatTag(fov: number, offset: number): SeatTag {
  const sideways = Math.abs(offset)
  if (sideways > 3) return 'Side view' // far off to the side, whatever the distance
  if (fov >= 75) return 'Up close' // screen fills more than your comfortable view
  if (fov < 50) return 'Full picture' // whole screen easily in view
  if (sideways <= 1.5) return 'Sweet spot' // good size and near the middle
  return 'Side view'
}

/** Everything the UI needs about a seat, in one call. */
export function getSeatMetrics(seat: Seat): SeatMetrics {
  const eye = eyePosition(seat)
  const distance = distanceToScreen(eye)
  const fov = horizontalFov(distance)
  const offset = offsetFromCentre(eye)
  return { distance, fov, offset, tag: seatTag(fov, offset) }
}
