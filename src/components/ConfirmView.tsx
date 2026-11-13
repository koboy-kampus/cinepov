import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { getSeat } from '../data/hall'
import { VENUE_LABEL } from '../data/venue'
import { formatPrice } from '../lib/currency'
import { useBooking } from '../store/useBooking'

/**
 * Booking confirmation. A simple placeholder for now; the ticket with a QR
 * code replaces it in the next phase.
 */
export function ConfirmView() {
  const selectedSeatId = useBooking((s) => s.selectedSeatId)
  const currency = useBooking((s) => s.currency)
  const clearSeat = useBooking((s) => s.clearSeat)
  const seat = selectedSeatId ? getSeat(selectedSeatId) : undefined
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => headingRef.current?.focus(), [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-bg px-8 text-center"
    >
      <p className="text-sm font-medium text-mint">{VENUE_LABEL}</p>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none">
        Booking confirmed
      </h2>
      {seat && (
        <p className="text-white/70">
          Row {seat.row}, Seat {seat.number} <span aria-hidden>·</span>{' '}
          {formatPrice(seat.price, currency)}
        </p>
      )}
      <p className="mt-1 text-xs text-white/40">Demo only: no real booking was made.</p>
      <button
        type="button"
        onClick={clearSeat}
        className="mt-6 rounded-full bg-white/[0.08] px-5 py-3 text-sm font-semibold ring-1 ring-white/10 hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Back to seats
      </button>
    </motion.div>
  )
}
