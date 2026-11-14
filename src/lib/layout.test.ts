/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { COMPACT_LANDSCAPE_QUERY, isCompactLandscape, sidePanelWidth } from './layout'

describe('compact landscape layout', () => {
  it('is used for phones held sideways', () => {
    expect(isCompactLandscape(844, 390)).toBe(true) // iPhone 12–15
    expect(isCompactLandscape(667, 375)).toBe(true) // iPhone SE
    expect(isCompactLandscape(932, 430)).toBe(true) // iPhone Pro Max
  })

  it('is not used for portrait phones, tablets or desktops', () => {
    expect(isCompactLandscape(390, 844)).toBe(false)
    expect(isCompactLandscape(1024, 768)).toBe(false)
    expect(isCompactLandscape(1440, 900)).toBe(false)
    expect(isCompactLandscape(500, 500)).toBe(false) // square counts as portrait in CSS
  })

  it('matches the CSS variant in index.css', () => {
    const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
    expect(css).toContain(`@custom-variant land (@media ${COMPACT_LANDSCAPE_QUERY})`)
  })

  it('gives the side panel 40% of the width, but never less than 300px', () => {
    expect(sidePanelWidth(844)).toBeCloseTo(337.6)
    expect(sidePanelWidth(667)).toBe(300)
  })
})
