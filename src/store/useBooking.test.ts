import { beforeEach, describe, expect, it } from 'vitest'
import { isSeatTaken } from '../data/showtimes'
import { initialBookingState, useBooking } from './useBooking'

const store = () => useBooking.getState()

describe('useBooking', () => {
  // Zustand stores are module singletons, so reset the data between tests.
  beforeEach(() => useBooking.setState(initialBookingState))

  it('starts on the map with no seat, 19:45 and EUR', () => {
    expect(store()).toMatchObject({
      showtimeId: '1945',
      selectedSeatId: null,
      view: 'map',
      currency: 'EUR',
    })
  })

  it('selects and deselects a seat', () => {
    store().selectSeat('F8')
    expect(store().selectedSeatId).toBe('F8')
    store().clearSeat()
    expect(store().selectedSeatId).toBeNull()
  })

  it('ignores seats that are taken or do not exist', () => {
    expect(isSeatTaken('1945', 'A3')).toBe(true)
    store().selectSeat('A3')
    expect(store().selectedSeatId).toBeNull()
    store().selectSeat('Z99')
    expect(store().selectedSeatId).toBeNull()
  })

  it('clears the selection when the new showtime has that seat taken', () => {
    expect(isSeatTaken('2215', 'B4')).toBe(true)
    store().selectSeat('B4') // free at 19:45
    store().setShowtime('2215')
    expect(store().showtimeId).toBe('2215')
    expect(store().selectedSeatId).toBeNull()
  })

  it('keeps the selection when the seat is still free', () => {
    store().selectSeat('F8')
    store().setShowtime('1730')
    expect(store().selectedSeatId).toBe('F8')
  })

  it('ignores unknown showtimes', () => {
    store().setShowtime('9999')
    expect(store().showtimeId).toBe('1945')
  })

  it('only opens the POV view when a seat is selected', () => {
    store().setView('pov')
    expect(store().view).toBe('map')
    store().selectSeat('F8')
    store().setView('pov')
    expect(store().view).toBe('pov')
    store().clearSeat()
    expect(store().view).toBe('map')
  })

  it('switches currency', () => {
    store().setCurrency('IDR')
    expect(store().currency).toBe('IDR')
  })
})
