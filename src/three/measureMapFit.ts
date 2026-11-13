import type { MapFit } from './flightPath'

/**
 * Measures where the 2D map's corner seats are on screen, relative to the
 * canvas. The map stays laid out (just faded) while the 3D view is open,
 * so this works in both directions of the transition.
 */
export function measureMapFit(canvas: HTMLElement): MapFit | null {
  const box = canvas.getBoundingClientRect()
  if (box.width === 0 || box.height === 0) return null

  const centre = (seatId: string) => {
    const seat = document.querySelector(`[data-seat="${seatId}"]`)
    if (!seat) return null
    const r = seat.getBoundingClientRect()
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
  }
  const a1 = centre('A1')
  const a14 = centre('A14')
  const i1 = centre('I1')
  if (!a1 || !a14 || !i1) return null
  return { width: box.width, height: box.height, a1, a14, i1 }
}
