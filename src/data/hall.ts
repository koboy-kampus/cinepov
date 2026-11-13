/**
 * Hall 3 at the Meridian: physical layout and seat list.
 *
 * Every number that shapes the theatre lives in `HALL`, so tuning the hall means
 * editing this one object. All lengths are in metres.
 */

export const HALL = {
  /** Screen size. 11.4 m wide hits the FOV targets from the concept clip. */
  screenWidth: 11.4,
  screenHeight: 6.0,
  /** Height of the screen's centre above the floor at row A (bottom edge sits at 0.5 m). */
  screenCentreHeight: 3.5,

  /** Floor distance from the screen to row A. */
  distanceToRowA: 4.6,
  /**
   * How far back a row is from the row in front of it, by the row's seat type.
   * Recliners need more legroom, so rows H–I are a bit deeper.
   */
  rowSpacing: { standard: 1.0, recliner: 1.2 },
  /** Stadium seating: each row is this much higher than the row in front. */
  rake: 0.3,

  /** Width of one seat (centre-to-centre). */
  seatWidth: 0.6,
  /** Width of each aisle between seat blocks. */
  aisleWidth: 1.0,
  /** Seats per block, left to right. 3 | 8 | 3 = 14 seats with 2 aisles. */
  blocks: [3, 8, 3],

  /** Eye height above the seat's floor position for a seated adult. */
  eyeHeight: 1.15,
} as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const
export type RowId = (typeof ROWS)[number]

export type SeatType = 'standard' | 'recliner'

/** Prices are set by hand per currency, NOT converted from EUR. */
export type Price = { eur: number; idr: number }

export type Seat = {
  /** Row letter + seat number, e.g. "F8". */
  id: string
  row: RowId
  /** 1-based, counted left to right as you face the screen. */
  number: number
  type: SeatType
  price: Price
}

// ---------------------------------------------------------------------------
// Seat data
// ---------------------------------------------------------------------------

export const SEATS_PER_ROW = HALL.blocks.reduce((sum, n) => sum + n, 0)

export const PRICES: Record<SeatType, Price> = {
  standard: { eur: 12.5, idr: 50000 },
  recliner: { eur: 16, idr: 75000 },
}

const RECLINER_ROWS: readonly RowId[] = ['H', 'I']

export function rowType(row: RowId): SeatType {
  return RECLINER_ROWS.includes(row) ? 'recliner' : 'standard'
}

/** All 126 seats, row by row (A1…A14, B1…B14, …). */
export const SEATS: readonly Seat[] = ROWS.flatMap((row) =>
  Array.from({ length: SEATS_PER_ROW }, (_, i): Seat => {
    const type = rowType(row)
    return { id: `${row}${i + 1}`, row, number: i + 1, type, price: PRICES[type] }
  }),
)

const SEATS_BY_ID = new Map(SEATS.map((seat) => [seat.id, seat]))

/** Look up a seat by its ID ("F8"). Returns `undefined` if it doesn't exist. */
export function getSeat(id: string): Seat | undefined {
  return SEATS_BY_ID.get(id)
}
