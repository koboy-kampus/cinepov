/**
 * Simple seat models built from boxes, merged into one geometry per seat type
 * so all seats of a type can be drawn in a single InstancedMesh draw call.
 *
 * Local coordinates: origin = the seat's floor position (seatPosition), x right,
 * y up, +z towards the back of the hall. The viewer's eye is at (0, eyeHeight, 0),
 * so the backrest sits just behind the head and never blocks the view.
 */
import { BoxGeometry, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

type Part = {
  size: [number, number, number]
  position: [number, number, number]
  /** Tilt backwards around x, in radians. */
  tilt?: number
}

function build(parts: Part[]): BufferGeometry {
  const boxes = parts.map(({ size, position, tilt = 0 }) => {
    const box = new BoxGeometry(...size)
    if (tilt) box.rotateX(-tilt)
    box.translate(...position)
    return box
  })
  const merged = mergeGeometries(boxes)
  boxes.forEach((box) => box.dispose())
  return merged
}

export function createStandardSeat(): BufferGeometry {
  return build([
    { size: [0.4, 0.3, 0.35], position: [0, 0.15, 0.05] }, // pedestal
    { size: [0.5, 0.14, 0.5], position: [0, 0.38, -0.02] }, // seat cushion
    { size: [0.5, 0.62, 0.1], position: [0, 0.74, 0.27], tilt: 0.12 }, // backrest
    { size: [0.06, 0.26, 0.46], position: [-0.28, 0.5, 0.03] }, // left armrest
    { size: [0.06, 0.26, 0.46], position: [0.28, 0.5, 0.03] }, // right armrest
  ])
}

/** Recliners: chunkier, deeper, with a headrest and a folded leg rest. */
export function createReclinerSeat(): BufferGeometry {
  return build([
    { size: [0.52, 0.32, 0.6], position: [0, 0.16, 0.02] }, // base
    { size: [0.5, 0.16, 0.6], position: [0, 0.39, -0.02] }, // seat cushion
    // Backrest + headrest top out around 1.05 m, like standard seats, so the
    // row behind can see over them (the rake is only 0.3 m per row).
    { size: [0.52, 0.56, 0.16], position: [0, 0.72, 0.34], tilt: 0.2 }, // backrest
    { size: [0.42, 0.12, 0.16], position: [0, 0.98, 0.4], tilt: 0.2 }, // headrest
    { size: [0.08, 0.3, 0.66], position: [-0.29, 0.52, 0.02] }, // left armrest
    { size: [0.08, 0.3, 0.66], position: [0.29, 0.52, 0.02] }, // right armrest
    { size: [0.46, 0.22, 0.08], position: [0, 0.22, -0.35] }, // leg rest (folded)
  ])
}
