import type { SeatType } from '../data/hall'

/** Visual state of a seat on the map (and in the legend). */
export type SeatState = 'available' | 'taken' | 'selected'

/**
 * Tailwind classes for a seat. Shape comes from the seat type (recliners are
 * taller and rounder), colour comes from the state.
 * Class names are written out in full so Tailwind can find them.
 */
export function seatClasses(type: SeatType, state: SeatState): string {
  const shape =
    type === 'recliner'
      ? 'aspect-[1/1.35] rounded-[40%_40%_30%_30%]'
      : 'aspect-[1/1.15] rounded-[35%_35%_20%_20%]'

  const colour =
    state === 'selected'
      ? 'bg-mint shadow-[0_0_12px_rgba(110,231,168,0.65)]'
      : state === 'taken'
        ? 'bg-taken'
        : type === 'recliner'
          ? 'bg-recliner shadow-[inset_0_-3px_0_rgba(0,0,0,0.3)]'
          : 'bg-seat shadow-[inset_0_-3px_0_rgba(0,0,0,0.3)]'

  return `${shape} ${colour}`
}
