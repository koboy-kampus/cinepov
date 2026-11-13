import { motion } from 'framer-motion'
import { useRef, useState, type KeyboardEvent } from 'react'
import { HALL, ROWS, SEATS, SEATS_PER_ROW, type Seat } from '../data/hall'
import { isSeatTaken } from '../data/showtimes'
import { eyePosition } from '../lib/geometry'
import { useBooking } from '../store/useBooking'
import { ScreenArc } from './ScreenArc'
import { seatClasses } from './seatStyles'

/** How far (px) the outermost seats drop, so rows curve like the screen. */
const ROW_CURVE_PX = 10

/** Seats grouped by row: [[A1…A14], [B1…B14], …]. */
const SEATS_BY_ROW = ROWS.map((row) => SEATS.filter((seat) => seat.row === row))

/** Furthest seat from the centre line, used to normalise the curve. */
const MAX_X = Math.max(...SEATS.map((seat) => Math.abs(eyePosition(seat).x)))

/**
 * CSS grid columns for one row: label | 3 seats | aisle | 8 seats | aisle | 3 seats | label.
 * Built from HALL.blocks so the 2D map always matches the hall data.
 */
const GRID_COLUMNS = [
  '1rem',
  HALL.blocks.map((size) => `repeat(${size}, minmax(0, 1fr))`).join(' 0.7fr '),
  '1rem',
].join(' ')

/** Grid column (1-based) of a seat: skip the label column and any aisles before it. */
function seatColumn(seat: Seat): number {
  let aisles = 0
  let seatsSoFar = 0
  for (const size of HALL.blocks) {
    seatsSoFar += size
    if (seat.number <= seatsSoFar) break
    aisles++
  }
  return 1 + seat.number + aisles
}

/** Vertical offset that bends each row into a gentle arc (edges lower). */
function curveOffset(seat: Seat): number {
  const xNorm = eyePosition(seat).x / MAX_X // -1 … 1
  return ROW_CURVE_PX * xNorm * xNorm
}

export function SeatMap() {
  const showtimeId = useBooking((s) => s.showtimeId)
  const selectedSeatId = useBooking((s) => s.selectedSeatId)
  const selectSeat = useBooking((s) => s.selectSeat)
  const clearSeat = useBooking((s) => s.clearSeat)

  // Roving tabindex: only one seat is in the Tab order; arrow keys move between seats.
  const [focusId, setFocusId] = useState<string>(selectedSeatId ?? 'E7')
  const mapRef = useRef<HTMLDivElement>(null)

  function focusSeat(rowIndex: number, number: number) {
    const row = ROWS[Math.min(Math.max(rowIndex, 0), ROWS.length - 1)]
    const n = Math.min(Math.max(number, 1), SEATS_PER_ROW)
    const id = `${row}${n}`
    setFocusId(id)
    mapRef.current?.querySelector<HTMLButtonElement>(`[data-seat="${id}"]`)?.focus()
  }

  function onKeyDown(event: KeyboardEvent, seat: Seat) {
    const rowIndex = ROWS.indexOf(seat.row)
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [rowIndex, seat.number - 1],
      ArrowRight: [rowIndex, seat.number + 1],
      ArrowUp: [rowIndex - 1, seat.number],
      ArrowDown: [rowIndex + 1, seat.number],
      Home: [rowIndex, 1],
      End: [rowIndex, SEATS_PER_ROW],
    }
    const target = moves[event.key]
    if (!target) return // Enter / Space are handled natively by <button>
    event.preventDefault()
    focusSeat(...target)
  }

  function onSeatClick(seat: Seat, taken: boolean) {
    if (taken) return
    if (seat.id === selectedSeatId) clearSeat()
    else selectSeat(seat.id)
  }

  return (
    <div className="px-4">
      <ScreenArc />

      <div ref={mapRef} role="group" aria-label="Seat map" className="mt-5 flex flex-col gap-2.5">
        {SEATS_BY_ROW.map((rowSeats, rowIndex) => {
          const row = ROWS[rowIndex]
          const recliner = rowSeats[0].type === 'recliner'
          return (
            <div
              key={row}
              role="group"
              aria-label={`Row ${row}`}
              className={`grid items-center ${recliner ? 'gap-x-[2px]' : 'gap-x-[3px]'} ${
                // Extra space in front of the first recliner row
                row === 'H' ? 'mt-3' : ''
              }`}
              style={{ gridTemplateColumns: GRID_COLUMNS }}
            >
              <RowLabel row={row} column={1} />
              {rowSeats.map((seat) => {
                const taken = isSeatTaken(showtimeId, seat.id)
                const selected = seat.id === selectedSeatId
                const state = selected ? 'selected' : taken ? 'taken' : 'available'
                return (
                  <motion.button
                    key={seat.id}
                    type="button"
                    data-seat={seat.id}
                    aria-label={`Row ${seat.row}, Seat ${seat.number}, ${seat.type}, ${taken ? 'taken' : 'available'}`}
                    aria-pressed={selected}
                    aria-disabled={taken || undefined}
                    tabIndex={seat.id === focusId ? 0 : -1}
                    onFocus={() => setFocusId(seat.id)}
                    onClick={() => onSeatClick(seat, taken)}
                    onKeyDown={(event) => onKeyDown(event, seat)}
                    whileTap={taken ? undefined : { scale: 0.8 }}
                    animate={selected ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{ y: curveOffset(seat), gridColumn: seatColumn(seat) }}
                    className={`w-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                      taken ? 'cursor-not-allowed' : 'cursor-pointer'
                    } ${seatClasses(seat.type, state)}`}
                  />
                )
              })}
              <RowLabel row={row} column={-1} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Row letter shown on both sides of a row (decorative: seat buttons already say the row). */
function RowLabel({ row, column }: { row: string; column: number }) {
  return (
    <span
      aria-hidden
      className="text-center text-[10px] font-medium text-white/50"
      style={{ gridColumn: column, transform: `translateY(${ROW_CURVE_PX}px)` }}
    >
      {row}
    </span>
  )
}
