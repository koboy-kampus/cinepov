import { Stats } from '@react-three/drei'

/** FPS counter. Only loaded in development (see TheaterScene), never in production builds. */
export default function DevStats() {
  return <Stats />
}
