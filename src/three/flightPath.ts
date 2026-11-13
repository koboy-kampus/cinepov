/**
 * Camera poses for the map ⇄ seat flight.
 *
 * Start: straight above the hall, looking down, framed so the 3D seats sit
 * where the 2D map's seats were on screen (so the crossfade looks like the
 * map turning into the room). End: the seat's eye, facing the screen.
 */
import { MathUtils, Matrix4, Quaternion, Vector3 } from 'three'
import { getSeat, type Seat } from '../data/hall'
import { eyePosition, SCREEN_CENTRE, seatPosition } from '../lib/geometry'
import { clamp01, easeInOutCubic } from '../lib/transition'
import { POV_HORIZONTAL_FOV, verticalFov } from './cameraMath'
import { ROOM } from './hallLayout'

export type CameraPose = {
  position: Vector3
  quaternion: Quaternion
  /** Vertical field of view, degrees. */
  fov: number
  /** Lens shift: how far the picture moves up, as a fraction of the view height. */
  shift: number
}

export const createPose = (): CameraPose => ({
  position: new Vector3(),
  quaternion: new Quaternion(),
  fov: 50,
  shift: 0,
})

type Point = { x: number; y: number }

/**
 * Where three seats of the 2D map are on screen, in px relative to the canvas:
 * the centres of A1, A14 (front corners) and I1 (back-left corner).
 */
export type MapFit = { width: number; height: number; a1: Point; a14: Point; i1: Point }

/** Narrow lens for the top-down view: less perspective, so it looks like a flat map. */
export const TOP_DOWN_FOV = 40

const A1 = seatPosition(getSeat('A1')!)
const A14 = seatPosition(getSeat('A14')!)
const I1 = seatPosition(getSeat('I1')!)
/** Height of the seat cushions/backs as seen from above, averaged over front and back rows. */
const SEAT_TOP_Y = (A1.y + I1.y) / 2 + 0.55
/** Seats look centred a little behind their floor point (the backrest). */
const SEAT_DEPTH_OFFSET = 0.08

/** A reasonable fit for when the 2D map can't be measured. */
export function defaultMapFit(width: number, height: number): MapFit {
  const half = width * 0.4
  return {
    width,
    height,
    a1: { x: width / 2 - half, y: height * 0.3 },
    a14: { x: width / 2 + half, y: height * 0.3 },
    i1: { x: width / 2 - half, y: height * 0.7 },
  }
}

const UP = new Vector3(0, 1, 0)
const NORTH = new Vector3(0, 0, -1) // towards the screen = up on the phone
const lookMatrix = new Matrix4()

function lookRotation(out: Quaternion, eye: Vector3, target: Vector3, up: Vector3) {
  lookMatrix.lookAt(eye, target, up)
  return out.setFromRotationMatrix(lookMatrix)
}

/** Camera straight above the hall whose picture lines up with the 2D seat map. */
export function topDownPose(fit: MapFit, out = createPose()): CameraPose {
  // Pixels per metre, from the map's width (A1 → A14) and depth (A → I).
  const ppmX = (fit.a14.x - fit.a1.x) / (A14.x - A1.x)
  const ppmZ = (fit.i1.y - fit.a1.y) / (I1.z - A1.z)
  const ppm = Math.max((ppmX + ppmZ) / 2, 1)

  // The world point under the middle of the canvas.
  const mapCentre = { x: (fit.a1.x + fit.a14.x) / 2, y: (fit.a1.y + fit.i1.y) / 2 }
  const worldX = (A1.x + A14.x) / 2 + (fit.width / 2 - mapCentre.x) / ppm
  const worldZ = (A1.z + I1.z) / 2 + SEAT_DEPTH_OFFSET + (fit.height / 2 - mapCentre.y) / ppm

  // Height so that 1 m on the seats = ppm pixels: focal length (px) / ppm.
  const focal = fit.height / 2 / Math.tan(MathUtils.degToRad(TOP_DOWN_FOV / 2))
  out.position.set(worldX, SEAT_TOP_Y + focal / ppm, worldZ)
  const below = out.position.clone().setY(0)
  lookRotation(out.quaternion, out.position, below, NORTH)
  out.fov = TOP_DOWN_FOV
  out.shift = 0
  return out
}

/** Space the POV must leave free, in px: a pill at the top and the sheet at the bottom. */
export type Framing = { width: number; height: number; top: number; bottom: number }

/** Largest lens shift we allow (fraction of the view height). */
const MAX_SHIFT = 0.3

/**
 * The seated view: eye position, looking at the screen centre, same
 * horizontal FOV for every seat. The picture is shifted up (lens shift, so
 * verticals stay straight) so the screen sits in the middle of the area the
 * sheet doesn't cover.
 */
export function povPose(seat: Seat, framing: Framing, out = createPose()): CameraPose {
  const eye = eyePosition(seat)
  out.position.set(eye.x, eye.y, eye.z)
  const target = new Vector3(SCREEN_CENTRE.x, SCREEN_CENTRE.y, SCREEN_CENTRE.z)
  lookRotation(out.quaternion, out.position, target, UP)
  out.fov = verticalFov(POV_HORIZONTAL_FOV, framing.width / framing.height)
  const freeMiddle = (framing.top + framing.height - framing.bottom) / 2
  out.shift = MathUtils.clamp((framing.height / 2 - freeMiddle) / framing.height, 0, MAX_SHIFT)
  return out
}

const c1 = new Vector3()
const c2 = new Vector3()

/** Cubic Bézier point. */
function bezier(out: Vector3, t: number, p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3) {
  const s = 1 - t
  return out
    .copy(p0)
    .multiplyScalar(s * s * s)
    .addScaledVector(p1, 3 * s * s * t)
    .addScaledVector(p2, 3 * s * t * t)
    .addScaledVector(p3, t * t * t)
}

const tanHalf = (fov: number) => Math.tan(MathUtils.degToRad(fov / 2))

/**
 * The camera at linear flight time u (0 = top-down, 1 = seated). Eased in
 * and out, so the camera starts and stops gently. The path drops down first,
 * then swoops into the seat from just behind and above it.
 */
export function flightPose(
  u: number,
  from: CameraPose,
  to: CameraPose,
  out = createPose(),
): CameraPose {
  const move = easeInOutCubic(u)
  // Keep looking down a moment longer before turning to face the screen.
  const turn = easeInOutCubic(clamp01((u - 0.1) / 0.9))

  c1.copy(from.position).setY(MathUtils.lerp(from.position.y, to.position.y, 0.5))
  // Approach from behind, but never from behind the back wall.
  const behind = Math.max(Math.min(2.2, ROOM.backZ - 0.4 - to.position.z), 0)
  c2.copy(to.position).add({ x: 0, y: 1.4, z: behind })
  bezier(out.position, move, from.position, c1, c2, to.position)

  out.quaternion.slerpQuaternions(from.quaternion, to.quaternion, turn)

  // Interpolate the lens in tan space, so the zoom speed feels even.
  const tan = MathUtils.lerp(tanHalf(from.fov), tanHalf(to.fov), move)
  out.fov = MathUtils.radToDeg(2 * Math.atan(tan))
  out.shift = MathUtils.lerp(from.shift, to.shift, move)
  return out
}
