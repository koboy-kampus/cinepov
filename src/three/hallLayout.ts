/**
 * Room layout for the 3D scene, derived ONLY from HALL + geometry.ts.
 * Pure numbers (no Three.js), so it can be unit-tested and the 3D always
 * matches the metric math.
 *
 * Same coordinates as geometry.ts: x right, y up, z away from the screen.
 */
import { HALL, ROWS, SEATS } from '../data/hall'
import { SCREEN_CENTRE, seatPosition } from '../lib/geometry'

/** Floor height (y) and depth (z) of each row, A → I. */
export const ROW_LAYOUT = ROWS.map((row) => {
  const firstSeat = SEATS.find((seat) => seat.row === row && seat.number === 1)!
  const { y, z } = seatPosition(firstSeat)
  return { row, y, z }
})

/** Extra floor behind the last row before the back wall. */
const BACK_ROW_DEPTH = 1.0
/** Floor in front of row A that belongs to row A's "step". */
const FRONT_ROW_DEPTH = 0.6

/**
 * Each row stands on a flat platform (stadium seating). A platform runs from
 * halfway to the row in front to halfway to the row behind; its top is the
 * row's floor height.
 */
export const PLATFORMS = ROW_LAYOUT.map((current, i) => {
  const prev = ROW_LAYOUT[i - 1]
  const next = ROW_LAYOUT[i + 1]
  return {
    row: current.row,
    top: current.y,
    zFront: prev ? (prev.z + current.z) / 2 : current.z - FRONT_ROW_DEPTH,
    zBack: next ? (current.z + next.z) / 2 : current.z + BACK_ROW_DEPTH,
  }
})

/** Half the width covered by seats (outermost seat centre + half a seat). */
export const SEATS_HALF_WIDTH =
  Math.max(...SEATS.map((seat) => Math.abs(seatPosition(seat).x))) + HALL.seatWidth / 2

/** Walking space between the outer seats (or screen edge) and the side walls. */
const SIDE_AISLE = 1.5

export const ROOM = {
  halfWidth: Math.max(HALL.screenWidth / 2, SEATS_HALF_WIDTH) + SIDE_AISLE,
  /** The wall behind the screen. */
  frontZ: -0.4,
  backZ: PLATFORMS[PLATFORMS.length - 1].zBack,
  /** Ceiling: 1.5 m above the top of the screen. */
  height: SCREEN_CENTRE.y + HALL.screenHeight / 2 + 1.5,
}

/**
 * x positions of the aisles: the two between seat blocks (from HALL.blocks)
 * plus one along each side wall.
 */
export const AISLE_X: number[] = (() => {
  const rowA = SEATS.filter((seat) => seat.row === 'A')
  const xs: number[] = []
  let seatsSoFar = 0
  for (const size of HALL.blocks.slice(0, -1)) {
    seatsSoFar += size
    const left = seatPosition(rowA[seatsSoFar - 1]).x // last seat of this block
    const right = seatPosition(rowA[seatsSoFar]).x // first seat of the next block
    xs.push((left + right) / 2)
  }
  const sideX = (SEATS_HALF_WIDTH + ROOM.halfWidth) / 2
  return [-sideX, ...xs, sideX]
})()

/**
 * The screen is a slice of a vertical cylinder, curved towards the audience.
 * The radius is large, so the curve is subtle. The arc is sized so the
 * straight-line width between its edges is exactly HALL.screenWidth, which
 * is what the FOV formula assumes.
 */
export const SCREEN_RADIUS = 25
export const SCREEN_ARC_ANGLE = 2 * Math.asin(HALL.screenWidth / 2 / SCREEN_RADIUS)
/** How far the screen edges come towards the audience (the curve's depth). */
export const SCREEN_EDGE_DEPTH = SCREEN_RADIUS * (1 - Math.cos(SCREEN_ARC_ANGLE / 2))
