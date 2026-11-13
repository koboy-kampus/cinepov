import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { getSeat } from '../data/hall'
import { useBooking } from '../store/useBooking'
import { useStage } from '../store/useStage'
import { SeatSheet } from './SeatSheet'

/** UI on top of the 3D view: the "View from F8" pill and the seat sheet. */
export function PovOverlay() {
  const view = useBooking((s) => s.view)
  const selectedSeatId = useBooking((s) => s.selectedSeatId)
  const setView = useBooking((s) => s.setView)
  const arrived = useStage((s) => s.arrived)
  const seat = selectedSeatId ? getSeat(selectedSeatId) : undefined
  const inPov = view === 'pov' && seat !== undefined
  const show = inPov && arrived

  // Escape flies back to the map, even mid-flight.
  useEffect(() => {
    if (view !== 'pov') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setView('map')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, setView])

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.p
            key="pill"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-x-0 top-5 z-20 mx-auto w-fit rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15 backdrop-blur"
          >
            View from {seat.id}
          </motion.p>
        )}
      </AnimatePresence>
      {/* Mounted for the whole 3D visit (off-screen until the camera lands). */}
      <AnimatePresence>
        {inPov && <SeatSheet key="sheet" seat={seat} visible={show} />}
      </AnimatePresence>
    </>
  )
}
