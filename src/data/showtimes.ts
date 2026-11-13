import { seededRandom, shuffle } from '../lib/random'
import { SEATS } from './hall'

export type Showtime = {
  id: string
  /** Local start time, "HH:MM". */
  time: string
  /** Every showtime is in the same studio with the same screen; ATMOS only means Dolby Atmos sound. */
  format: 'Standard' | 'ATMOS'
  /** IDs of seats that are already booked, e.g. ["A3", "F9", …]. */
  takenSeatIds: readonly string[]
}

/**
 * Picks a fixed set of "taken" seats: shuffle all seat IDs with a seeded
 * random function, then take the first `fraction` of them. Same seed =>
 * same seats on every reload and every build.
 */
export function pickTakenSeats(seed: number, fraction: number): string[] {
  const ids = SEATS.map((seat) => seat.id)
  const count = Math.round(ids.length * fraction)
  return shuffle(ids, seededRandom(seed)).slice(0, count)
}

export const SHOWTIMES: readonly Showtime[] = [
  { id: '1730', time: '17:30', format: 'Standard', takenSeatIds: pickTakenSeats(1730, 0.26) },
  { id: '1945', time: '19:45', format: 'ATMOS', takenSeatIds: pickTakenSeats(1945, 0.34) },
  { id: '2215', time: '22:15', format: 'Standard', takenSeatIds: pickTakenSeats(2215, 0.29) },
]

export const DEFAULT_SHOWTIME_ID = '1945'

// Fast lookups: showtime by ID, and the taken seats of each showtime as a Set.
const SHOWTIMES_BY_ID = new Map(SHOWTIMES.map((show) => [show.id, show]))
const TAKEN_BY_SHOWTIME = new Map(SHOWTIMES.map((show) => [show.id, new Set(show.takenSeatIds)]))

export function getShowtime(id: string): Showtime | undefined {
  return SHOWTIMES_BY_ID.get(id)
}

/** True if the seat is already booked for that showtime. */
export function isSeatTaken(showtimeId: string, seatId: string): boolean {
  return TAKEN_BY_SHOWTIME.get(showtimeId)?.has(seatId) ?? false
}
