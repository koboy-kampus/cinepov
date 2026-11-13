import { describe, expect, it } from 'vitest'
import { getSeat, SEATS } from './hall'
import { pickTakenSeats, SHOWTIMES } from './showtimes'
import { VENUE, VENUE_LABEL } from './venue'

describe('hall seats', () => {
  it('has 9 rows × 14 seats = 126 seats', () => {
    expect(SEATS).toHaveLength(126)
  })

  it('makes rows H–I recliners and the rest standard', () => {
    for (const seat of SEATS) {
      const expected = seat.row === 'H' || seat.row === 'I' ? 'recliner' : 'standard'
      expect(seat.type, seat.id).toBe(expected)
    }
  })

  it('gives every seat a unique ID', () => {
    expect(new Set(SEATS.map((s) => s.id)).size).toBe(SEATS.length)
  })

  it('looks seats up by ID', () => {
    expect(getSeat('F8')).toMatchObject({ row: 'F', number: 8, price: { eur: 12.5, idr: 50000 } })
    expect(getSeat('I12')?.price).toEqual({ eur: 16, idr: 75000 })
    expect(getSeat('Z99')).toBeUndefined()
  })
})

describe('showtimes', () => {
  it('has 17:30, 19:45 ATMOS and 22:15', () => {
    expect(SHOWTIMES.map((s) => `${s.time} ${s.format}`)).toEqual([
      '17:30 Standard',
      '19:45 ATMOS',
      '22:15 Standard',
    ])
  })

  it.each(SHOWTIMES)('$time: taken seats are valid, unique and 25–35% of the hall', (show) => {
    for (const id of show.takenSeatIds) expect(getSeat(id), id).toBeDefined()
    expect(new Set(show.takenSeatIds).size).toBe(show.takenSeatIds.length)
    const share = show.takenSeatIds.length / SEATS.length
    expect(share).toBeGreaterThanOrEqual(0.25)
    expect(share).toBeLessThanOrEqual(0.35)
  })

  it('picks the same taken seats on every run', () => {
    // Re-running the generator with the same seed must give the exact same list.
    expect(pickTakenSeats(1945, 0.34)).toEqual(SHOWTIMES[1].takenSeatIds)
  })

  it('pins the 19:45 taken seats so an accidental change is caught', () => {
    // If you change the seed or the generator on purpose, update this snapshot.
    expect(SHOWTIMES[1].takenSeatIds.slice(0, 5)).toMatchInlineSnapshot(`
      [
        "E14",
        "F5",
        "C3",
        "G13",
        "D4",
      ]
    `)
  })
})

describe('venue', () => {
  it('is Layar · Studio 3', () => {
    expect(VENUE).toEqual({ cinema: 'Layar', studio: 'Studio 3' })
    expect(VENUE_LABEL).toBe('Layar · Studio 3')
  })
})
