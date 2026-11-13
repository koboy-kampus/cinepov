import { AnimatePresence, motion } from 'framer-motion'
import { getSeat } from '../data/hall'
import { formatPrice } from '../lib/currency'
import { useBooking } from '../store/useBooking'
import { loadTheaterScene } from '../three/loadScene'

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export function BottomBar() {
  const selectedSeatId = useBooking((s) => s.selectedSeatId)
  const currency = useBooking((s) => s.currency)
  const setView = useBooking((s) => s.setView)
  const seat = selectedSeatId ? getSeat(selectedSeatId) : undefined

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="mx-3 mb-3 rounded-3xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur"
    >
      {/* aria-live: screen readers announce the seat when it changes */}
      <div aria-live="polite" className="flex min-h-12 items-center justify-between gap-3">
        <AnimatePresence mode="wait" initial={false}>
          {seat ? (
            <motion.div
              key="seat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex w-full items-center justify-between gap-3"
            >
              <div>
                <p className="font-semibold">
                  Row {seat.row} <span aria-hidden>·</span> Seat {seat.number}
                </p>
                <p className="text-sm text-white/60">
                  {capitalise(seat.type)} <span aria-hidden>·</span>{' '}
                  {formatPrice(seat.price, currency)}
                </p>
              </div>
              <button
                type="button"
                data-continue
                onClick={() => setView('pov')}
                // Start downloading the 3D view as soon as the user heads for Continue.
                onPointerEnter={loadTheaterScene}
                onFocus={loadTheaterScene}
                className="rounded-full bg-mint px-6 py-3 text-sm font-semibold text-bg transition-transform hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95"
              >
                Continue
              </button>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full text-center text-white/70"
            >
              Choose your seat
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
