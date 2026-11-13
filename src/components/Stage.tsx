import { useMotionValueEvent } from 'framer-motion'
import { lazy, Suspense, useRef } from 'react'
import { stageProgress, useStage } from '../store/useStage'
import { loadTheaterScene } from '../three/loadScene'

// Lazy: Three.js + React Three Fiber are only downloaded when needed
// (preloaded as soon as a seat is selected).
const TheaterScene = lazy(loadTheaterScene)

const visibility = (T: number) => (T > 0 ? 'visible' : 'hidden')

/**
 * The 3D layer, underneath the seat map. Mounted the first time the 3D view
 * opens and then kept alive (hidden, not rendering) so reopening is instant.
 */
export function Stage() {
  const opened = useStage((s) => s.opened)
  const arrived = useStage((s) => s.arrived)
  const ref = useRef<HTMLDivElement>(null)

  // Hidden while the map is fully shown: no compositing cost.
  useMotionValueEvent(stageProgress, 'change', (T) => {
    if (ref.current) ref.current.style.visibility = visibility(T)
  })

  if (!opened) return null
  return (
    <div
      ref={ref}
      // Decorative for screen readers: the seat sheet describes the view in words.
      aria-hidden
      className={`absolute inset-0 bg-[#050506] ${arrived ? '' : 'pointer-events-none'}`}
      style={{ visibility: visibility(stageProgress.get()) }}
    >
      <Suspense fallback={null}>
        <TheaterScene />
      </Suspense>
    </div>
  )
}

/** Small "loading" pill over the map, if the 3D isn't ready when Continue is pressed. */
export function StageLoading() {
  return (
    <div
      role="status"
      // Appears only after a short delay, so fast loads never flash it.
      className="pointer-events-none absolute inset-x-0 bottom-28 z-30 mx-auto flex w-fit animate-[stage-fade-in_200ms_150ms_both] flex-col items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white/80 ring-1 ring-white/10 backdrop-blur"
    >
      Loading 3D view…
      <span className="relative block h-0.5 w-24 overflow-hidden rounded-full bg-white/10">
        <span className="absolute inset-y-0 w-1/3 animate-[stage-loading_1s_ease-in-out_infinite] rounded-full bg-mint" />
      </span>
    </div>
  )
}
