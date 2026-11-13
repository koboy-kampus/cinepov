import { lazy, Suspense, useEffect, useRef } from 'react'
import { useBooking } from '../store/useBooking'
import { loadTheaterScene } from '../three/loadScene'

// Lazy: Three.js + React Three Fiber are only downloaded when this screen opens.
const TheaterScene = lazy(loadTheaterScene)

/** The point-of-view screen: the 3D theater seen from the selected seat. */
export function PovScreen() {
  const selectedSeatId = useBooking((s) => s.selectedSeatId)
  const setView = useBooking((s) => s.setView)
  const backRef = useRef<HTMLButtonElement>(null)

  // Move keyboard focus to the new screen.
  useEffect(() => backRef.current?.focus(), [])

  return (
    <div className="relative flex-1 bg-[#050506]">
      <Suspense
        fallback={
          <p className="absolute inset-0 grid place-items-center text-sm text-white/60">
            Loading 3D view…
          </p>
        }
      >
        <TheaterScene />
      </Suspense>

      <p className="pointer-events-none absolute inset-x-0 top-5 mx-auto w-fit rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15 backdrop-blur">
        View from {selectedSeatId}
      </p>

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-5">
        <button
          ref={backRef}
          type="button"
          onClick={() => setView('map')}
          className="rounded-full bg-black/50 px-5 py-2.5 text-sm font-medium ring-1 ring-white/15 backdrop-blur hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          ← Back to seats
        </button>
      </div>
    </div>
  )
}
