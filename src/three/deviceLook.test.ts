import { Euler, MathUtils, Quaternion } from 'three'
import { describe, expect, it } from 'vitest'
import { deviceLook } from './deviceLook'

const LOOK_AT_HORIZON = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5))

/**
 * The alpha/beta/gamma a phone reports when its back points at (yaw, pitch)
 * and it's turned in its own plane by `roll` (0 = portrait, ±90 = sideways).
 */
function reading(yaw: number, pitch: number, roll: number) {
  const d = MathUtils.degToRad
  const q = new Quaternion().setFromEuler(new Euler(d(pitch), d(yaw), d(roll), 'YXZ'))
  q.multiply(LOOK_AT_HORIZON.clone().invert())
  const e = new Euler().setFromQuaternion(q, 'YXZ')
  return {
    alpha: MathUtils.radToDeg(e.y),
    beta: MathUtils.radToDeg(e.x),
    gamma: -MathUtils.radToDeg(e.z),
  }
}

const look = (r: { alpha: number; beta: number; gamma: number }) =>
  deviceLook(r.alpha, r.beta, r.gamma)

describe('device look-around', () => {
  it('portrait, held upright: looking straight ahead', () => {
    const { yaw, pitch } = deviceLook(0, 90, 0)
    expect(yaw).toBeCloseTo(0)
    expect(pitch).toBeCloseTo(0)
  })

  it('portrait: turning left looks left, tilting the top away looks down', () => {
    expect(deviceLook(20, 90, 0).yaw).toBeCloseTo(20)
    expect(deviceLook(0, 80, 0).pitch).toBeCloseTo(-10)
  })

  it('sideways, both directions: turning and tilting move the view the right way', () => {
    for (const roll of [90, -90]) {
      for (const [yaw, pitch] of [
        [15, 0],
        [-15, 0],
        [0, 8],
        [0, -8],
        [-10, 5],
      ]) {
        const result = look(reading(yaw, pitch, roll))
        expect(result.yaw).toBeCloseTo(yaw)
        expect(result.pitch).toBeCloseTo(pitch)
      }
    }
  })

  it('sideways: sees the tilt, which the raw beta angle misses', () => {
    // Raw angles in landscape: beta stays near 0 whatever the tilt, so the
    // old "beta = pitch" reading couldn't see it at all.
    const level = reading(0, 0, 90)
    const up = reading(0, 8, 90)
    expect(Math.abs(up.beta - level.beta)).toBeLessThan(1)
    expect(look(up).pitch).toBeCloseTo(8)
  })

  it('turning the phone in its own plane (rotating it) doesn’t move the view', () => {
    const portrait = look(reading(12, -4, 0))
    for (const roll of [90, -90, 180]) {
      const turned = look(reading(12, -4, roll))
      expect(turned.yaw).toBeCloseTo(portrait.yaw)
      expect(turned.pitch).toBeCloseTo(portrait.pitch)
    }
  })
})
