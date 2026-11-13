import { expect, it } from 'vitest'
import { formatShowDate } from './date'

it('formats dates like "Fri, 13 Nov"', () => {
  expect(formatShowDate(new Date(2026, 10, 13))).toBe('Fri, 13 Nov')
  expect(formatShowDate(new Date(2026, 0, 5))).toBe('Mon, 5 Jan')
})
