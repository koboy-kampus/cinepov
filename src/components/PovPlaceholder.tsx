import { useEffect, useRef } from 'react'
import { useBooking } from '../store/useBooking'

/** Temporary stand-in for the 3D view (Phase 3). */
export function PovPlaceholder() {
  const selectedSeatId = useBooking((s) => s.selectedSeatId)
  const setView = useBooking((s) => s.setView)
  const backRef = useRef<HTMLButtonElement>(null)

  // Move keyboard focus to the new screen.
  useEffect(() => backRef.current?.focus(), [])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
        View from {selectedSeatId}
      </p>
      <h2 className="text-lg font-semibold">3D view coming in Phase 3</h2>
      <button
        ref={backRef}
        type="button"
        onClick={() => setView('map')}
        className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium ring-1 ring-white/15 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        ← Back to seats
      </button>
    </div>
  )
}
