/**
 * Which layout the app uses. Phones held sideways are too short for the
 * stacked portrait layout, so they get a wide one: content on the left,
 * a panel on the right.
 *
 * Keep in sync with the `land` variant in index.css.
 */
import { useSyncExternalStore } from 'react'

/** Screens at most this tall in landscape use the side-by-side layout, px. */
export const COMPACT_LANDSCAPE_MAX_HEIGHT = 500

export const COMPACT_LANDSCAPE_QUERY = `(orientation: landscape) and (max-height: ${COMPACT_LANDSCAPE_MAX_HEIGHT}px)`

/** Same rule as the media query (CSS "landscape" means wider than tall). */
export function isCompactLandscape(width: number, height: number): boolean {
  return width > height && height <= COMPACT_LANDSCAPE_MAX_HEIGHT
}

/** Width of the right-hand panel in the landscape layout: 40%, at least 300px. */
export function sidePanelWidth(width: number): number {
  return Math.max(300, width * 0.4)
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia?.(COMPACT_LANDSCAPE_QUERY)
  query?.addEventListener('change', onChange)
  return () => query?.removeEventListener('change', onChange)
}

const snapshot = () => window.matchMedia?.(COMPACT_LANDSCAPE_QUERY).matches ?? false

/** True while the phone is sideways (short landscape screen); updates on rotation. */
export function useCompactLandscape(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false)
}
