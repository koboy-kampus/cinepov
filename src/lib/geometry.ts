/**
 * Where things are in the hall, in metres.
 *
 * Coordinate system (matches Three.js, which we'll use later):
 *   x = left/right   0 is the hall's centre line, + is to the right as you face the screen
 *   y = up           0 is the floor at row A
 *   z = depth        0 is the screen, + is further away from it
 */
import { HALL, ROWS, rowType, type Seat } from '../data/hall'

export type Vec3 = { x: number; y: number; z: number }

/** The middle of the screen. All distances are measured to this point. */
export const SCREEN_CENTRE: Vec3 = { x: 0, y: HALL.screenCentreHeight, z: 0 }

/** Total width of one row: all seats plus the aisles between blocks. */
const ROW_WIDTH =
  HALL.blocks.reduce((sum, n) => sum + n, 0) * HALL.seatWidth +
  (HALL.blocks.length - 1) * HALL.aisleWidth

/** How many aisles sit to the left of a seat, e.g. seat 4 (first of the middle block) has 1. */
function aislesBefore(seatNumber: number): number {
  let seatsSoFar = 0
  let aisles = 0
  for (const blockSize of HALL.blocks) {
    seatsSoFar += blockSize
    if (seatNumber <= seatsSoFar) return aisles
    aisles++
  }
  throw new Error(`Seat number ${seatNumber} is outside the row`)
}

/** Left/right position of a seat's centre. The row is centred on x = 0. */
function seatX(seatNumber: number): number {
  const leftEdge = -ROW_WIDTH / 2
  return leftEdge + (seatNumber - 0.5) * HALL.seatWidth + aislesBefore(seatNumber) * HALL.aisleWidth
}

/**
 * Depth (z) of every row. Row A is at `distanceToRowA`; each row after that
 * steps back by the spacing for its seat type (recliner rows are deeper).
 */
const ROW_Z: readonly number[] = ROWS.reduce<number[]>((zs, row, i) => {
  zs.push(i === 0 ? HALL.distanceToRowA : zs[i - 1] + HALL.rowSpacing[rowType(row)])
  return zs
}, [])

/** Floor position of a seat. Each row is one `rake` step higher than the one in front. */
export function seatPosition(seat: Seat): Vec3 {
  const rowIndex = ROWS.indexOf(seat.row) // A = 0, B = 1, …
  return { x: seatX(seat.number), y: rowIndex * HALL.rake, z: ROW_Z[rowIndex] }
}

/** Where a seated viewer's eyes are: the seat position raised by the eye height. */
export function eyePosition(seat: Seat): Vec3 {
  const floor = seatPosition(seat)
  return { ...floor, y: floor.y + HALL.eyeHeight }
}
