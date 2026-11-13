import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useBooking } from '../store/useBooking'
import { useStage } from '../store/useStage'

/** UI on top of the 3D view: shown once the camera has arrived at the seat. */
export function PovOverlay() {
  const view = useBooking((s) => s.view)
  const selectedSeatId = useBooking((s) => s.selectedSeatId)
  const setView = useBooking((s) => s.setView)
  const arrived = useStage((s) => s.arrived)
  const backRef = useRef<HTMLButtonElement>(null)
  const show = view === 'pov' && arrived

  // Escape flies back to the map, even mid-flight.
  useEffect(() => {
    if (view !== 'pov') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setView('map')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, setView])

  useEffect(() => {
    if (show) backRef.current?.focus()
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="pov"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none absolute inset-0 z-20"
        >
          <p className="absolute inset-x-0 top-5 mx-auto w-fit rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15 backdrop-blur">
            View from {selectedSeatId}
          </p>
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-5">
            <button
              ref={backRef}
              type="button"
              onClick={() => setView('map')}
              className="pointer-events-auto rounded-full bg-black/50 px-5 py-2.5 text-sm font-medium ring-1 ring-white/15 backdrop-blur hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              ← Back to seats
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
