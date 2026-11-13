import type { Price } from '../data/hall'

export type Currency = 'EUR' | 'IDR'

// Formatters are created once and reused (creating Intl objects is relatively slow).
const FORMATTERS: Record<Currency, Intl.NumberFormat> = {
  EUR: new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  IDR: new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
}

/**
 * Formats a seat price in the chosen currency, e.g. "€12.50" or "Rp 50.000".
 * Each currency has its own hand-set amount; we never convert between them.
 */
export function formatPrice(price: Price, currency: Currency): string {
  const amount = currency === 'EUR' ? price.eur : price.idr
  return FORMATTERS[currency].format(amount)
}
