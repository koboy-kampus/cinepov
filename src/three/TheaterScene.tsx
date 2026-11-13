/**
 * The 3D theater. Loaded lazily (React.lazy) so Three.js isn't part of the
 * first download: the seat map shows up fast, the 3D arrives when needed.
 */
import { Canvas } from '@react-three/fiber'
import { lazy, Suspense } from 'react'
import { getSeat } from '../data/hall'
import { useBooking } from '../store/useBooking'
import { Lights, Room } from './Room'
import { SeatCamera } from './SeatCamera'
import { Seats } from './Seats'
import { Screen } from './Screen'

// import.meta.env.DEV is replaced with `false` in production builds, so the
// FPS counter (and its code) is dropped from the production bundle entirely.
const DevStats = import.meta.env.DEV ? lazy(() => import('./DevStats')) : null

const BACKGROUND = '#050506'

export default function TheaterScene() {
  const selectedSeatId = useBooking((s) => s.selectedSeatId)
  const seat = selectedSeatId ? getSeat(selectedSeatId) : undefined

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ near: 0.05, far: 100 }}
      style={{ position: 'absolute', inset: 0 }}
      aria-label={
        seat ? `3D view of the screen from row ${seat.row}, seat ${seat.number}` : '3D theater'
      }
      role="img"
    >
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 20, 45]} />
      <Lights />
      <Room />
      <Screen />
      <Seats />
      {seat && <SeatCamera seat={seat} />}
      {DevStats && (
        <Suspense fallback={null}>
          <DevStats />
        </Suspense>
      )}
    </Canvas>
  )
}
