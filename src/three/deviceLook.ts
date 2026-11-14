/**
 * Turns the phone's orientation (DeviceOrientationEvent alpha/beta/gamma)
 * into where the phone's back is pointing: a heading (yaw) and an elevation
 * (pitch), like looking through the phone as a window.
 *
 * Reading alpha/beta directly only works in portrait. Once the phone is
 * sideways, beta no longer follows the tilt, and gamma sits at ±90°, where
 * alpha and gamma flip by 180° as you tilt. So we build the full 3D
 * orientation (the same maths as three.js's old DeviceOrientationControls)
 * and read the direction from it. That direction doesn't depend on how the
 * screen is rotated (turning the phone in its own plane doesn't change where
 * its back points), so it works in portrait and in both landscape directions
 * without a screen.orientation.angle correction.
 */
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'

const euler = new Euler()
const device = new Quaternion()
const forward = new Vector3()
// Maps the W3C device frame (z out of the screen) onto a camera looking out of the phone's back.
const LOOK_AT_HORIZON = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5))

/** Heading and elevation of the view through the phone, degrees (yaw + = left, pitch + = up). */
export function deviceLook(
  alpha: number,
  beta: number,
  gamma: number,
): { yaw: number; pitch: number } {
  const d = MathUtils.degToRad
  euler.set(d(beta), d(alpha), -d(gamma), 'YXZ')
  device.setFromEuler(euler).multiply(LOOK_AT_HORIZON)
  forward.set(0, 0, -1).applyQuaternion(device)
  return {
    yaw: MathUtils.radToDeg(Math.atan2(-forward.x, -forward.z)),
    pitch: MathUtils.radToDeg(Math.asin(MathUtils.clamp(forward.y, -1, 1))),
  }
}
