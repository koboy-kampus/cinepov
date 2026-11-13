import { describe, expect, it } from 'vitest'
import { getSeat, SEATS, type Seat } from '../data/hall'
import { eyePosition } from './geometry'
import { distanceToScreen, formatOffset, getSeatMetrics, horizontalFov, seatTag } from './metrics'

/** Test helper: get a seat by ID or fail loudly. */
function seat(id: string): Seat {
  const found = getSeat(id)
  if (!found) throw new Error(`No seat ${id}`)
  return found
}

describe('tuning targets from the concept clip', () => {
  // Allowed error: ±0.5 m distance, ±4° field of view.
  it.each([
    { id: 'B4', distance: 6.3, fov: 86 },
    { id: 'F8', distance: 9.8, fov: 60 },
    { id: 'I12', distance: 13.3, fov: 45 },
  ])('$id ≈ $distance m and $fov°', ({ id, distance, fov }) => {
    const m = getSeatMetrics(seat(id))
    expect(Math.abs(m.distance - distance)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(m.fov - fov)).toBeLessThanOrEqual(4)
  })
})

describe('seat tags', () => {
  it.each([
    { id: 'F8', tag: 'Sweet spot' },
    { id: 'B4', tag: 'Up close' },
    // Row I has 14 seats, so there is no single middle seat: I7 and I8 are equally central.
    { id: 'I7', tag: 'Full picture' },
    { id: 'I8', tag: 'Full picture' },
    { id: 'A1', tag: 'Side view' },
  ])('$id → $tag', ({ id, tag }) => {
    expect(getSeatMetrics(seat(id)).tag).toBe(tag)
  })

  it('checks the rules in order', () => {
    expect(seatTag(90, 3.5)).toBe('Side view') // far to the side beats "Up close"
    expect(seatTag(75, 2)).toBe('Up close') // 75° is the boundary, inclusive
    expect(seatTag(49.9, 2)).toBe('Full picture')
    expect(seatTag(60, 1.5)).toBe('Sweet spot') // 1.5 m is the boundary, inclusive
    expect(seatTag(60, -2)).toBe('Side view')
  })
})

describe('geometry and metrics behaviour', () => {
  it('FOV gets smaller as distance gets bigger', () => {
    const distances = [2, 5, 8, 12, 20]
    const fovs = distances.map(horizontalFov)
    for (let i = 1; i < fovs.length; i++) expect(fovs[i]).toBeLessThan(fovs[i - 1])
  })

  it('rows further back are further from the screen', () => {
    const column = ['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8']
    const distances = column.map((id) => getSeatMetrics(seat(id)).distance)
    for (let i = 1; i < distances.length; i++)
      expect(distances[i]).toBeGreaterThan(distances[i - 1])
  })

  it('mirror-image seats (same row, opposite sides) have the same distance', () => {
    // Seat n and seat 15 - n sit at the same |x| on opposite sides (1↔14, 4↔11, 7↔8).
    for (const s of SEATS) {
      const mirror = seat(`${s.row}${15 - s.number}`)
      const eye = eyePosition(s)
      expect(eyePosition(mirror).x).toBeCloseTo(-eye.x, 10)
      expect(distanceToScreen(eyePosition(mirror))).toBeCloseTo(distanceToScreen(eye), 10)
    }
  })

  it('places aisles between the 3 | 8 | 3 blocks', () => {
    const gap = (a: string, b: string) => eyePosition(seat(b)).x - eyePosition(seat(a)).x
    expect(gap('A1', 'A2')).toBeCloseTo(0.6) // neighbours: one seat width
    expect(gap('A3', 'A4')).toBeCloseTo(1.6) // across an aisle: seat width + aisle
    expect(gap('A11', 'A12')).toBeCloseTo(1.6)
  })
})

describe('formatOffset', () => {
  it.each([
    { offset: 0, text: 'Centre' },
    { offset: 0.09, text: 'Centre' },
    { offset: -0.05, text: 'Centre' },
    { offset: 0.3, text: '0.3 m right' },
    { offset: -2.1, text: '2.1 m left' },
  ])('$offset → "$text"', ({ offset, text }) => {
    expect(formatOffset(offset)).toBe(text)
  })
})
