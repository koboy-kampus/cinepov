/**
 * The map ⇄ 3D transition as one timeline.
 *
 * A single number T runs linearly from 0 (seat map) to 1 (seated in the 3D
 * view). Everything else (map opacity, camera flight, glow) is a pure function
 * of T. Going back just runs T towards 0 again, from wherever it is, so a
 * transition can be reversed halfway through without any jump.
 *
 *   T: 0 ──── 0.22 ─────────────────────────────── 1
 *      │ crossfade │
 *          │ flight (eased in and out) ─────────────│
 */

/** Full transition length, seconds. */
export const TRANSITION_SECONDS = 1.5
/** With prefers-reduced-motion: a short crossfade, no flight. */
export const REDUCED_TRANSITION_SECONDS = 0.35

const FADE_END = 0.22
const FLIGHT_START = 0.12

export const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)

/** Smooth start and stop: zero speed at both ends. */
export function easeInOutCubic(t: number): number {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

/** How far the 2D map has faded out: 0 = fully visible, 1 = gone. */
export function mapFade(T: number, reduced: boolean): number {
  return easeInOutCubic(reduced ? T : T / FADE_END)
}

/**
 * Linear progress of the camera flight, 0 = top-down over the hall,
 * 1 = at the seat's eye. With reduced motion the camera is always at the seat
 * (the crossfade does all the work).
 */
export function flightTime(T: number, reduced: boolean): number {
  if (reduced) return 1
  return clamp01((T - FLIGHT_START) / (1 - FLIGHT_START))
}

/** Seconds needed to run from T = `from` to T = `to`. */
export function transitionDuration(from: number, to: number, reduced: boolean): number {
  return Math.abs(to - from) * (reduced ? REDUCED_TRANSITION_SECONDS : TRANSITION_SECONDS)
}
