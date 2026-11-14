import { AnimatePresence, motion, MotionConfig, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { BottomBar } from './components/BottomBar'
import { ConfirmView } from './components/ConfirmView'
import { Header } from './components/Header'
import { Legend } from './components/Legend'
import { PhoneFrame } from './components/PhoneFrame'
import { PovOverlay } from './components/PovOverlay'
import { SeatMap } from './components/SeatMap'
import { ShowtimePills } from './components/ShowtimePills'
import { Stage, StageLoading } from './components/Stage'
import { useStageDriver } from './components/useStageDriver'
import { mapFade } from './lib/transition'
import { useBooking } from './store/useBooking'
import { stageProgress, useStage } from './store/useStage'
import { loadTheaterScene } from './three/loadScene'

function App() {
  const view = useBooking((s) => s.view)
  const hasSeat = useBooking((s) => s.selectedSeatId !== null)
  const ready = useStage((s) => s.ready)
  const settled = useStage((s) => s.settled)
  useStageDriver()

  // Preload the 3D chunk as soon as a seat is selected.
  useEffect(() => {
    if (hasSeat) loadTheaterScene()
  }, [hasSeat])

  // The map fades out over the 3D view (and back in on the way back).
  const mapOpacity = useTransform(stageProgress, (T) => 1 - mapFade(T, useStage.getState().reduced))
  // Only usable when it's fully back: no blind taps while it's still fading in.
  const mapActive = view === 'map' && settled

  // Back on the map after the 3D view: put keyboard focus on Continue, where
  // the user left off (after React has removed `inert`, or focus would fail).
  const wasActive = useRef(mapActive)
  useEffect(() => {
    if (mapActive && !wasActive.current) {
      document.querySelector<HTMLElement>('[data-continue]')?.focus()
    }
    wasActive.current = mapActive
  }, [mapActive])

  return (
    // reducedMotion="user": Framer Motion respects the OS "reduce motion" setting.
    <MotionConfig reducedMotion="user">
      <PhoneFrame>
        {/* Layers, bottom to top: 3D stage, seat map, POV pill + sheet, loading pill, confirmation. */}
        <Stage />
        <motion.div
          inert={!mapActive}
          style={{ opacity: mapOpacity }}
          // Phone sideways: the seat map on the left, everything else in a panel on the right.
          className={`absolute inset-0 z-10 flex flex-col bg-bg land:grid land:grid-cols-[minmax(0,1fr)_max(18.75rem,40%)] land:grid-rows-[auto_auto_minmax(0,1fr)_auto] ${mapActive ? '' : 'pointer-events-none'}`}
        >
          <Header />
          <ShowtimePills />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain py-3 land:col-start-1 land:row-span-full land:row-start-1 land:py-2">
            {/* my-auto centres the map in the free space, but (unlike justify-center)
                never cuts off the top when a short screen needs to scroll. */}
            <div className="my-auto flex flex-col gap-5">
              <SeatMap />
              <Legend className="land:hidden" />
            </div>
          </main>
          {/* Phone sideways: the legend moves into the side panel, next to the map. */}
          <Legend className="hidden land:col-start-2 land:row-start-3 land:flex land:justify-center" />
          <BottomBar />
        </motion.div>
        <PovOverlay />
        {view === 'pov' && !ready && <StageLoading />}
        <AnimatePresence>{view === 'confirm' && <ConfirmView />}</AnimatePresence>
      </PhoneFrame>
    </MotionConfig>
  )
}

export default App
