import { MotionConfig } from 'framer-motion'
import { BottomBar } from './components/BottomBar'
import { Header } from './components/Header'
import { Legend } from './components/Legend'
import { PhoneFrame } from './components/PhoneFrame'
import { PovPlaceholder } from './components/PovPlaceholder'
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
            <main className="flex flex-1 flex-col justify-center gap-6 overflow-y-auto py-4">
              <SeatMap />
              <Legend />
            </main>
            <BottomBar />
          </>
        ) : (
          <PovPlaceholder />
        )}
      </PhoneFrame>
    </MotionConfig>
  )
}

export default App
