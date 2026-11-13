import { describe, expect, it } from 'vitest'
import { easeInOutCubic, flightTime, mapFade, transitionDuration } from './transition'

describe('transition timeline', () => {
  it('eases in and out with no overshoot', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5)
    expect(easeInOutCubic(-1)).toBe(0)
    expect(easeInOutCubic(2)).toBe(1)
    // Gentle start and stop: tiny movement in the first and last 2%
    expect(easeInOutCubic(0.02)).toBeLessThan(0.001)
    expect(1 - easeInOutCubic(0.98)).toBeLessThan(0.001)
  })

  it('fades the map out before the flight is under way', () => {
    expect(mapFade(0, false)).toBe(0)
    expect(mapFade(0.22, false)).toBe(1)
    expect(mapFade(1, false)).toBe(1)
    expect(flightTime(0.12, false)).toBe(0)
    expect(flightTime(1, false)).toBe(1)
    // When the map is gone the camera has barely moved yet
    expect(easeInOutCubic(flightTime(0.22, false))).toBeLessThan(0.01)
  })

  it('skips the flight with reduced motion', () => {
    expect(flightTime(0, true)).toBe(1)
    expect(flightTime(0.5, true)).toBe(1)
    expect(mapFade(0.5, true)).toBeCloseTo(0.5)
  })

  it('is time-proportional, so a reversed transition takes as long as it ran', () => {
    expect(transitionDuration(0, 1, false)).toBeCloseTo(1.5)
    expect(transitionDuration(0.4, 0, false)).toBeCloseTo(0.6)
    expect(transitionDuration(1, 0, true)).toBeCloseTo(0.35)
    expect(transitionDuration(1, 1, false)).toBe(0)
  })
})
