import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import type { PerspectiveCamera } from 'three'
import type { Seat } from '../data/hall'
import { eyePosition, SCREEN_CENTRE } from '../lib/geometry'
import { POV_HORIZONTAL_FOV, verticalFov } from './cameraMath'

/** Puts the camera at the seat's eye position, looking at the centre of the screen. */
export function SeatCamera({ seat }: { seat: Seat }) {
  // Read the camera via get() inside the effect: R3F cameras are meant to be
  // mutated imperatively, not treated as React state.
  const get = useThree((state) => state.get)
  const aspect = useThree((state) => state.size.width / state.size.height)

  useLayoutEffect(() => {
    const camera = get().camera as PerspectiveCamera
    const eye = eyePosition(seat)
    camera.position.set(eye.x, eye.y, eye.z)
    camera.lookAt(SCREEN_CENTRE.x, SCREEN_CENTRE.y, SCREEN_CENTRE.z)
    // Same horizontal view for every window shape, so seats compare fairly.
    camera.fov = verticalFov(POV_HORIZONTAL_FOV, aspect)
    camera.updateProjectionMatrix()
  }, [get, seat, aspect])

  return null
}
