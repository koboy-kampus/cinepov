import { describe, expect, it } from 'vitest'
import { HALL, SEATS } from '../data/hall'
import { eyePosition, seatPosition } from '../lib/geometry'
import { verticalFov } from './cameraMath'
import {
  AISLE_X,
  PLATFORMS,
  ROOM,
  SCREEN_ARC_ANGLE,
  SCREEN_EDGE_DEPTH,
  SCREEN_RADIUS,
} from './hallLayout'

describe('3D hall layout', () => {
  it('puts every seat on top of its row platform', () => {
    for (const seat of SEATS) {
      const pos = seatPosition(seat)
      const platform = PLATFORMS.find((p) => p.row === seat.row)!
      expect(pos.y).toBeCloseTo(platform.top)
      expect(pos.z).toBeGreaterThan(platform.zFront)
      expect(pos.z).toBeLessThan(platform.zBack)
    }
  })

  it('makes platforms touch with no gaps, each one step higher', () => {
    for (let i = 1; i < PLATFORMS.length; i++) {
      expect(PLATFORMS[i].zFront).toBeCloseTo(PLATFORMS[i - 1].zBack)
      expect(PLATFORMS[i].top - PLATFORMS[i - 1].top).toBeCloseTo(HALL.rake)
    }
  })

  it('fits all seats and the screen inside the room', () => {
    for (const seat of SEATS) {
      const eye = eyePosition(seat)
      expect(Math.abs(eye.x)).toBeLessThan(ROOM.halfWidth)
      expect(eye.z).toBeLessThan(ROOM.backZ)
      expect(eye.y).toBeLessThan(ROOM.height)
    }
    expect(HALL.screenWidth / 2).toBeLessThan(ROOM.halfWidth)
  })

  it('places aisles symmetrically, between blocks and along the walls', () => {
    expect(AISLE_X).toHaveLength(HALL.blocks.length + 1)
    expect(AISLE_X[0]).toBeCloseTo(-AISLE_X[AISLE_X.length - 1])
    expect(AISLE_X[1]).toBeCloseTo(-AISLE_X[2])
  })

  it('curves the screen so its edge-to-edge width equals HALL.screenWidth', () => {
    const chord = 2 * SCREEN_RADIUS * Math.sin(SCREEN_ARC_ANGLE / 2)
    expect(chord).toBeCloseTo(HALL.screenWidth)
    expect(SCREEN_EDGE_DEPTH).toBeGreaterThan(0)
    expect(SCREEN_EDGE_DEPTH).toBeLessThan(1) // a subtle curve
  })
})

describe('verticalFov', () => {
  it('equals the horizontal FOV on a square viewport', () => {
    expect(verticalFov(80, 1)).toBeCloseTo(80)
  })

  it('is wider on portrait screens and narrower on landscape ones', () => {
    expect(verticalFov(80, 0.5)).toBeGreaterThan(80)
    expect(verticalFov(80, 16 / 9)).toBeLessThan(80)
  })
})
