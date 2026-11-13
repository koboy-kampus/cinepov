/**
 * The 3D theater. Loaded lazily (React.lazy) so Three.js isn't part of the
 * first download: the seat map shows up fast, the 3D arrives when needed.
 */
import { Canvas } from '@react-three/fiber'
import { lazy, Suspense } from 'react'
import { FlightRig } from './FlightRig'
import { Lights, Room } from './Room'
import { Screen } from './Screen'
import { Seats } from './Seats'
import { SelectedSeat } from './SelectedSeat'

// import.meta.env.DEV is replaced with `false` in production builds, so the
// FPS counter (and its code) is dropped from the production bundle entirely.
const DevStats = import.meta.env.DEV ? lazy(() => import('./DevStats')) : null

const BACKGROUND = '#050506'

export default function TheaterScene() {
  return (
    <Canvas
      // Only draw when something changes (the flight, look-around). While the
      // 3D view is hidden behind the map it costs nothing.
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ near: 0.05, far: 200 }}
      style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
    >
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 20, 45]} />
      <Lights />
      <Room />
      <Screen />
      <Seats />
      <SelectedSeat />
      <FlightRig />
      {DevStats && (
        <Suspense fallback={null}>
          <DevStats />
        </Suspense>
      )}
    </Canvas>
  )
}
