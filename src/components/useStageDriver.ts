import { animate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { transitionDuration } from '../lib/transition'
import { useBooking } from '../store/useBooking'
import { stageProgress, useStage } from '../store/useStage'

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * Runs the map ⇄ 3D timeline when the view changes.
 *
 * - map → pov: waits until the 3D scene is ready, then runs T to 1.
 * - pov → map: runs T back to 0 from wherever it is (also mid-flight).
 * - confirm → map: jumps to 0 (the ticket screen covers the change).
 *
 * The timeline is linear in time and every animation starts from the current
 * value, so pressing buttons quickly can never make the camera jump.
 */
export function useStageDriver() {
  const view = useBooking((s) => s.view)
  const ready = useStage((s) => s.ready)
  const previousView = useRef(view)

  useEffect(() => {
    if (view !== 'map') useStage.setState({ opened: true })
  }, [view])

  useEffect(() => {
    const previous = previousView.current
    previousView.current = view

    if (view === 'confirm') return
    if (view === 'map' && previous === 'confirm') {
      stageProgress.jump(0)
      useStage.setState({ arrived: false, settled: true })
      return
    }
    if (view === 'pov' && !ready) return // the loading state shows meanwhile

    const target = view === 'pov' ? 1 : 0
    if (stageProgress.get() === target) {
      useStage.setState({ arrived: target === 1, settled: true })
      return
    }

    const reduced = prefersReducedMotion()
    useStage.setState({ arrived: false, settled: false, reduced })
    const controls = animate(stageProgress, target, {
      duration: transitionDuration(stageProgress.get(), target, reduced),
      ease: 'linear', // the easing lives in lib/transition, per part of the timeline
      onComplete: () => useStage.setState({ arrived: target === 1, settled: true }),
    })
    return () => controls.stop()
  }, [view, ready])
}
