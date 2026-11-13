import { MotionConfig } from 'framer-motion'
import { BottomBar } from './components/BottomBar'
import { Header } from './components/Header'
import { Legend } from './components/Legend'
import { PhoneFrame } from './components/PhoneFrame'
import { PovScreen } from './components/PovScreen'
import { SeatMap } from './components/SeatMap'
import { ShowtimePills } from './components/ShowtimePills'
import { useBooking } from './store/useBooking'

function App() {
  const view = useBooking((s) => s.view)

  return (
    // reducedMotion="user": Framer Motion respects the OS "reduce motion" setting.
    <MotionConfig reducedMotion="user">
      <PhoneFrame>
        {view === 'map' ? (
          <>
            <Header />
            <ShowtimePills />
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto py-3">
              {/* my-auto centres the map in the free space, but (unlike justify-center)
                  never cuts off the top when a short screen needs to scroll. */}
              <div className="my-auto flex flex-col gap-5">
                <SeatMap />
                <Legend />
              </div>
            </main>
            <BottomBar />
          </>
        ) : (
          <PovScreen />
        )}
      </PhoneFrame>
    </MotionConfig>
  )
}

export default App
