import { describe, expect, it } from 'vitest'
import { PRICES } from '../data/hall'
import { formatPrice } from './currency'

/** Intl may put a (non-breaking) space after "Rp"; drop all whitespace so tests stay stable. */
const normalise = (text: string) => text.replace(/\s/g, '')

describe('formatPrice', () => {
  it('formats EUR with 2 decimals', () => {
    expect(normalise(formatPrice(PRICES.standard, 'EUR'))).toBe('€12.50')
    expect(normalise(formatPrice(PRICES.recliner, 'EUR'))).toBe('€16.00')
  })

  it('formats IDR with no decimals and dot thousands separators', () => {
    expect(normalise(formatPrice(PRICES.standard, 'IDR'))).toBe('Rp50.000')
    expect(normalise(formatPrice(PRICES.recliner, 'IDR'))).toBe('Rp75.000')
  })
})
