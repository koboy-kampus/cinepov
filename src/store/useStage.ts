/**
 * State of the map ⇄ 3D "stage" (kept apart from booking state: none of this
 * is about the booking itself, only about how the transition is playing).
 */
import { motionValue } from 'framer-motion'
import { create } from 'zustand'

/**
 * The transition timeline, 0 = seat map … 1 = seated in 3D (see lib/transition).
 * A motion value, not React state: it changes every frame, and the DOM and
 * the 3D camera read it directly without re-rendering React.
 */
export const stageProgress = motionValue(0)

type StageState = {
  /** The 3D canvas has been opened once; from then on it stays mounted. */
  opened: boolean
  /** The 3D scene has rendered its first frame (shaders compiled, textures made). */
  ready: boolean
  /** The flight has finished and we're seated: sheet and look-around are active. */
  arrived: boolean
  /** No transition running (the timeline is resting at 0 or 1). */
  settled: boolean
  /** prefers-reduced-motion was on when the current transition started. */
  reduced: boolean
  /**
   * How much of the view the seat sheet covers, px: its height when it's a
   * bottom sheet (portrait), its width when it's a side panel (phone sideways).
   * The 3D camera frames the cinema screen in the space that's left.
   */
  sheetBottom: number
  sheetRight: number
}

export const useStage = create<StageState>()(() => ({
  opened: false,
  ready: false,
  arrived: false,
  settled: true,
  reduced: false,
  sheetBottom: 300,
  sheetRight: 0,
}))
