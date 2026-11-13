/**
 * App-wide booking state (Zustand).
 *
 * Components read with selectors, e.g. `useBooking((s) => s.selectedSeatId)`,
 * so they only re-render when that piece of state changes.
 */
import { create } from 'zustand'
import { getSeat } from '../data/hall'
import { DEFAULT_SHOWTIME_ID, getShowtime, isSeatTaken } from '../data/showtimes'
import type { Currency } from '../lib/currency'

export type View = 'map' | 'pov' | 'confirm'

export type BookingState = {
  showtimeId: string
  selectedSeatId: string | null
  view: View
  currency: Currency

  /** Switch showtime. Clears the selected seat if it's taken in the new showtime. */
  setShowtime: (id: string) => void
  /** Select a seat. Ignored if the seat doesn't exist or is taken. */
  selectSeat: (id: string) => void
  clearSeat: () => void
  /** Change screen. 'pov' and 'confirm' need a selected seat, otherwise ignored. */
  setView: (view: View) => void
  setCurrency: (currency: Currency) => void
}

export const initialBookingState = {
  showtimeId: DEFAULT_SHOWTIME_ID,
  selectedSeatId: null,
  view: 'map',
  currency: 'EUR',
} satisfies Partial<BookingState>

export const useBooking = create<BookingState>()((set, get) => ({
  ...initialBookingState,

  setShowtime: (id) => {
    if (!getShowtime(id)) return
    const { selectedSeatId } = get()
    const stillFree = selectedSeatId !== null && !isSeatTaken(id, selectedSeatId)
    set({ showtimeId: id, selectedSeatId: stillFree ? selectedSeatId : null })
  },

  selectSeat: (id) => {
    if (!getSeat(id) || isSeatTaken(get().showtimeId, id)) return
    set({ selectedSeatId: id })
  },

  clearSeat: () => set({ selectedSeatId: null, view: 'map' }),

  setView: (view) => {
    if (view !== 'map' && get().selectedSeatId === null) return
    set({ view })
  },

  setCurrency: (currency) => set({ currency }),
}))
