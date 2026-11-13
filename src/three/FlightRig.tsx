import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { MathUtils, type AmbientLight, type Fog, type PerspectiveCamera } from 'three'
import { getSeat, type Seat } from '../data/hall'
import { easeInOutCubic, flightTime } from '../lib/transition'
import { useBooking } from '../store/useBooking'
import { stageProgress, useStage } from '../store/useStage'
import { createPose, defaultMapFit, flightPose, povPose, topDownPose } from './flightPath'
import { measureMapFit } from './measureMapFit'

/** Space kept free at the top of the POV for the "View from F8" pill, px. */
const POV_TOP_INSET = 64
/** Extra light while looking down on the hall, so the seats read like the 2D map. */
const TOP_DOWN_LIGHT = 1.6

/**
 * Drives the camera from the transition timeline: top-down over the hall at
 * T = 0, swooping into the seat's eye at T = 1. Rendering is on demand, so
 * the scene only draws while something actually moves.
 */
export function FlightRig() {
  const get = useThree((state) => state.get)
  const invalidate = useThree((state) => state.invalidate)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const view = useBooking((s) => s.view)
  const sheetHeight = useStage((s) => s.sheetHeight)

  const from = useRef(createPose())
  const to = useRef(createPose())
  const now = useRef(createPose())
  const lastSeat = useRef<Seat | null>(null)
  const topLight = useRef<AmbientLight>(null)
  const signalledReady = useRef(false)

  // Line the top-down view up with the 2D map. Measured when a transition
  // starts (view changes) and whenever the canvas is resized.
  useLayoutEffect(() => {
    const fit = measureMapFit(get().gl.domElement) ?? defaultMapFit(width, height)
    topDownPose(fit, from.current)
    invalidate()
  }, [view, width, height, sheetHeight, get, invalidate])

  // Draw a frame whenever the timeline moves.
  useEffect(() => stageProgress.on('change', () => invalidate()), [invalidate])

  useFrame((state) => {
    const camera = state.camera as PerspectiveCamera
    const seatId = useBooking.getState().selectedSeatId
    // Keep the last seat while the selection is briefly empty (e.g. after booking).
    const seat = (seatId && getSeat(seatId)) || lastSeat.current
    if (!seat) return
    lastSeat.current = seat

    povPose(seat, { width, height, top: POV_TOP_INSET, bottom: sheetHeight }, to.current)
    const u = flightTime(stageProgress.get(), useStage.getState().reduced)
    const pose = flightPose(u, from.current, to.current, now.current)

    camera.position.copy(pose.position)
    camera.quaternion.copy(pose.quaternion)
    camera.fov = pose.fov
    // Lens shift: moves the picture up without tilting the camera.
    camera.setViewOffset(width, height, 0, pose.shift * height, width, height)
    camera.updateProjectionMatrix()

    // Seen from high above, the fog would swallow everything: push it away.
    const move = easeInOutCubic(u)
    const fog = state.scene.fog as Fog | null
    if (fog) {
      fog.near = MathUtils.lerp(80, 20, move)
      fog.far = MathUtils.lerp(160, 45, move)
    }
    if (topLight.current) topLight.current.intensity = (1 - move) * TOP_DOWN_LIGHT

    // The first frame compiles shaders and uploads textures; once it's on
    // screen the scene is "ready" and the transition can start smoothly.
    if (!signalledReady.current) {
      signalledReady.current = true
      requestAnimationFrame(() => useStage.setState({ ready: true }))
    }
  })

  return <ambientLight ref={topLight} color="#ffffff" intensity={TOP_DOWN_LIGHT} />
}
