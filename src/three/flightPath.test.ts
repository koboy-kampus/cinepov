import { PerspectiveCamera, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { getSeat } from '../data/hall'
import { eyePosition, SCREEN_CENTRE, seatPosition } from '../lib/geometry'
import { createPose, flightPose, povPose, topDownPose, type MapFit } from './flightPath'
import { ROOM } from './hallLayout'

const FIT: MapFit = {
  width: 390,
  height: 844,
  a1: { x: 40, y: 250 },
  a14: { x: 350, y: 250 },
  i1: { x: 40, y: 540 },
}
const FRAMING = { width: 390, height: 844, top: 60, bottom: 330 }
const F8 = getSeat('F8')!
const I8 = getSeat('I8')!

/** Where a world point lands on screen (px) for a pose. */
function project(pose: ReturnType<typeof createPose>, point: Vector3, w: number, h: number) {
  const camera = new PerspectiveCamera(pose.fov, w / h, 0.05, 200)
  camera.position.copy(pose.position)
  camera.quaternion.copy(pose.quaternion)
  camera.updateMatrixWorld()
  const ndc = point.clone().project(camera)
  return { x: ((ndc.x + 1) / 2) * w, y: ((1 - ndc.y) / 2) * h }
}

describe('top-down pose', () => {
  it('lines the 3D seats up with the 2D map', () => {
    const pose = topDownPose(FIT)
    const a1 = seatPosition(getSeat('A1')!)
    const a14 = seatPosition(getSeat('A14')!)
    // Seats are measured at cushion height, so allow a few px for perspective.
    const pA1 = project(pose, new Vector3(a1.x, a1.y + 0.55, a1.z + 0.08), 390, 844)
    const pA14 = project(pose, new Vector3(a14.x, a14.y + 0.55, a14.z + 0.08), 390, 844)
    expect(pA1.x).toBeCloseTo(40, -1)
    expect(pA14.x).toBeCloseTo(350, -1)
    expect(Math.abs(pA1.y - 250)).toBeLessThan(20)
  })

  it('looks straight down with the screen at the top', () => {
    const pose = topDownPose(FIT)
    const forward = new Vector3(0, 0, -1).applyQuaternion(pose.quaternion)
    const up = new Vector3(0, 1, 0).applyQuaternion(pose.quaternion)
    expect(forward.y).toBeCloseTo(-1)
    expect(up.z).toBeCloseTo(-1) // screen (z = 0) is towards the top of the phone
  })
})

describe('POV pose', () => {
  it('sits at the eye and faces the screen centre', () => {
    const pose = povPose(F8, FRAMING)
    const eye = eyePosition(F8)
    expect(pose.position.toArray()).toEqual([eye.x, eye.y, eye.z])
    const forward = new Vector3(0, 0, -1).applyQuaternion(pose.quaternion)
    const toScreen = new Vector3(SCREEN_CENTRE.x, SCREEN_CENTRE.y, SCREEN_CENTRE.z)
      .sub(pose.position)
      .normalize()
    expect(forward.dot(toScreen)).toBeCloseTo(1)
  })

  it('shifts the screen into the space above the sheet', () => {
    const pose = povPose(F8, FRAMING)
    // Free area is 60 … 514 px, so the screen centre should land at ~287 px.
    const camera = new PerspectiveCamera(pose.fov, 390 / 844, 0.05, 200)
    camera.position.copy(pose.position)
    camera.quaternion.copy(pose.quaternion)
    camera.setViewOffset(390, 844, pose.shiftX * 390, pose.shiftY * 844, 390, 844)
    camera.updateMatrixWorld()
    const ndc = new Vector3(SCREEN_CENTRE.x, SCREEN_CENTRE.y, SCREEN_CENTRE.z).project(camera)
    expect(((1 - ndc.y) / 2) * 844).toBeCloseTo(287, -1)
  })

  it('never shifts when nothing covers the view', () => {
    const pose = povPose(F8, { width: 390, height: 844, top: 0, bottom: 0 })
    expect([pose.shiftX, pose.shiftY]).toEqual([0, 0])
  })

  it('phone sideways: centres the screen in the area left of the side panel', () => {
    // 844 × 390 with a 338 px panel on the right: free area is 0 … 506 px wide.
    const framing = { width: 844, height: 390, top: 64, bottom: 0, right: 338 }
    const pose = povPose(F8, framing)
    const camera = new PerspectiveCamera(pose.fov, 844 / 390, 0.05, 200)
    camera.position.copy(pose.position)
    camera.quaternion.copy(pose.quaternion)
    camera.setViewOffset(844, 390, pose.shiftX * 844, pose.shiftY * 390, 844, 390)
    camera.updateMatrixWorld()
    const screenAt = (x: number) => {
      const ndc = new Vector3(x, SCREEN_CENTRE.y, SCREEN_CENTRE.z).project(camera)
      return { x: ((ndc.x + 1) / 2) * 844, y: ((1 - ndc.y) / 2) * 390 }
    }
    const centre = screenAt(SCREEN_CENTRE.x)
    expect(centre.x).toBeCloseTo(253, -1)
    expect(centre.y).toBeCloseTo(195, -1)
    // Same 70° horizontal view as portrait, across the free area (506 px):
    // the free area's edges are 35° either side of the view direction.
    const edge = new Vector3(-1, 0, 0).applyQuaternion(pose.quaternion)
    const forward = new Vector3(0, 0, -1).applyQuaternion(pose.quaternion)
    const left = pose.position
      .clone()
      .add(forward.multiplyScalar(5))
      .add(edge.multiplyScalar(5 * Math.tan((35 * Math.PI) / 180)))
    const ndc = left.project(camera)
    expect(((ndc.x + 1) / 2) * 844).toBeCloseTo(0, -1)
  })
})

describe('flight', () => {
  const from = topDownPose(FIT)
  const to = povPose(I8, FRAMING)

  it('starts at the top-down pose and ends exactly at the seat', () => {
    const start = flightPose(0, from, to)
    const end = flightPose(1, from, to)
    expect(start.position.distanceTo(from.position)).toBeCloseTo(0)
    expect(end.position.distanceTo(to.position)).toBeCloseTo(0)
    expect(end.quaternion.angleTo(to.quaternion)).toBeCloseTo(0)
    expect(end.fov).toBeCloseTo(to.fov)
    expect(end.shiftX).toBeCloseTo(to.shiftX)
    expect(end.shiftY).toBeCloseTo(to.shiftY)
  })

  it('moves smoothly: no jumps between frames and a soft landing', () => {
    const frames = 90 // 1.5 s at 60 fps
    const poses = Array.from({ length: frames + 1 }, (_, i) => flightPose(i / frames, from, to))
    const steps = poses.slice(1).map((pose, i) => pose.position.distanceTo(poses[i].position))
    const total = steps.reduce((a, b) => a + b, 0)
    // No single frame moves more than ~4% of the whole path
    expect(Math.max(...steps)).toBeLessThan(total * 0.04)
    // Last frames barely move (ease out, no jolt at the end)
    expect(steps[steps.length - 1]).toBeLessThan(total * 0.001)
    const turns = poses.slice(1).map((pose, i) => pose.quaternion.angleTo(poses[i].quaternion))
    expect(Math.max(...turns)).toBeLessThan(0.06) // < 3.5° per frame
  })

  it('never flies through the back wall', () => {
    for (let i = 0; i <= 100; i++) {
      expect(flightPose(i / 100, from, to).position.z).toBeLessThan(ROOM.backZ)
    }
  })
})
