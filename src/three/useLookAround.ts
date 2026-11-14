import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { MathUtils } from 'three'
import { deviceLook } from './deviceLook'

/** How far you can look around from the screen centre, degrees. */
export const MAX_YAW = 25
export const MAX_PITCH = 10
/** Degrees of turn per pixel dragged. */
const DRAG_DEG_PER_PX = 0.12
/** How quickly the view follows the finger / springs back (higher = snappier). */
const FOLLOW = 14
const RETURN = 4
/** How quickly the phone's "straight ahead" re-centres while you hold it turned. */
const GYRO_RECENTRE = 0.015

type Look = {
  /** Current offsets in degrees (yaw + = look left, pitch + = look up). */
  yaw: number
  pitch: number
  dragYaw: number
  dragPitch: number
  dragging: boolean
  startX: number
  startY: number
  gyroYaw: number
  gyroPitch: number
  /** Where the phone pointed when the view was centred (yaw/pitch, degrees). */
  base: { yaw: number; pitch: number } | null
}

const wrap180 = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180

type OrientationPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }

/**
 * Look around from the seat by dragging, or by turning the phone (device
 * orientation). Offsets are limited to ±25° sideways and ±10° up/down, and
 * the view eases back to the screen centre when you let go.
 *
 * Returns `update(delta)`, to call every frame; it gives the current offsets
 * in radians and asks for another frame while the view is still moving.
 */
export function useLookAround(enabled: boolean) {
  // get() inside the effect: R3F objects are mutated imperatively, not React state.
  const get = useThree((state) => state.get)
  const invalidate = useThree((state) => state.invalidate)
  const look = useRef<Look>({
    yaw: 0,
    pitch: 0,
    dragYaw: 0,
    dragPitch: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    gyroYaw: 0,
    gyroPitch: 0,
    base: null,
  })

  useEffect(() => {
    const s = look.current
    const canvas = get().gl.domElement
    if (!enabled) {
      s.dragging = false
      s.dragYaw = s.dragPitch = s.gyroYaw = s.gyroPitch = 0
      s.base = null
      invalidate()
      return
    }

    let askedPermission = false
    const onDown = (event: PointerEvent) => {
      s.dragging = true
      s.startX = event.clientX
      s.startY = event.clientY
      canvas.setPointerCapture(event.pointerId)
      canvas.style.cursor = 'grabbing'
      // iOS only lets a page read the gyroscope after a tap and a prompt.
      const permission = (window.DeviceOrientationEvent as OrientationPermission | undefined)
        ?.requestPermission
      if (!askedPermission && permission) {
        askedPermission = true
        permission().catch(() => {})
      }
    }
    const onMove = (event: PointerEvent) => {
      if (!s.dragging) return
      // Drag the scene: moving the finger right turns the view left.
      s.dragYaw = MathUtils.clamp((event.clientX - s.startX) * DRAG_DEG_PER_PX, -MAX_YAW, MAX_YAW)
      s.dragPitch = MathUtils.clamp(
        (event.clientY - s.startY) * DRAG_DEG_PER_PX,
        -MAX_PITCH,
        MAX_PITCH,
      )
      invalidate()
    }
    const onUp = () => {
      s.dragging = false
      s.dragYaw = s.dragPitch = 0 // ease back to the centre
      canvas.style.cursor = 'grab'
      invalidate()
    }
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha === null || event.beta === null) return
      // Where the phone's back points; right in portrait and both landscape directions.
      const now = deviceLook(event.alpha, event.beta, event.gamma ?? 0)
      s.base ??= { ...now }
      const dYaw = wrap180(now.yaw - s.base.yaw)
      const dPitch = now.pitch - s.base.pitch
      // Slowly adopt the current direction as "straight ahead" (eases back to centre).
      s.base.yaw = wrap180(s.base.yaw + dYaw * GYRO_RECENTRE)
      s.base.pitch += dPitch * GYRO_RECENTRE
      s.gyroYaw = MathUtils.clamp(dYaw, -MAX_YAW, MAX_YAW)
      s.gyroPitch = MathUtils.clamp(dPitch, -MAX_PITCH, MAX_PITCH)
      invalidate()
    }

    canvas.style.cursor = 'grab'
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    window.addEventListener('deviceorientation', onOrientation)
    return () => {
      canvas.style.cursor = ''
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }, [enabled, get, invalidate])

  /** Advance the easing by `delta` seconds; returns offsets in radians. */
  return function update(delta: number) {
    const s = look.current
    const dt = Math.min(delta, 1 / 30) // after an idle pause, don't jump
    const targetYaw = MathUtils.clamp(s.dragYaw + s.gyroYaw, -MAX_YAW, MAX_YAW)
    const targetPitch = MathUtils.clamp(s.dragPitch + s.gyroPitch, -MAX_PITCH, MAX_PITCH)
    const speed = s.dragging ? FOLLOW : RETURN
    s.yaw = MathUtils.damp(s.yaw, targetYaw, speed, dt)
    s.pitch = MathUtils.damp(s.pitch, targetPitch, speed, dt)
    if (Math.abs(s.yaw - targetYaw) > 0.01 || Math.abs(s.pitch - targetPitch) > 0.01) invalidate()
    else {
      s.yaw = targetYaw
      s.pitch = targetPitch
    }
    return { yaw: MathUtils.degToRad(s.yaw), pitch: MathUtils.degToRad(s.pitch) }
  }
}
