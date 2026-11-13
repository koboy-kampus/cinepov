import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Seat } from '../data/hall'
import { formatPrice } from '../lib/currency'
import { formatOffset, getSeatMetrics, type SeatTag } from '../lib/metrics'
import { useBooking } from '../store/useBooking'
import { useStage } from '../store/useStage'
import { MiniMap } from './MiniMap'

const TAG_STYLES: Record<SeatTag, string> = {
  'Sweet spot': 'bg-mint/15 text-mint ring-mint/30',
  'Up close': 'bg-amber-400/10 text-amber-200 ring-amber-300/25',
  'Full picture': 'bg-sky-400/10 text-sky-200 ring-sky-300/25',
  'Side view': 'bg-white/10 text-white/80 ring-white/15',
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Bottom sheet with the seat's details. Mounted (off-screen) as soon as the
 * 3D view opens, so its height is known before the camera lands: the camera
 * frames the cinema screen in the space above it.
 */
export function SeatSheet({ seat, visible }: { seat: Seat; visible: boolean }) {
  const showtimeId = useBooking((s) => s.showtimeId)
  const currency = useBooking((s) => s.currency)
  const setView = useBooking((s) => s.setView)
  const { distance, fov, offset, tag } = getSeatMetrics(seat)
  const price = formatPrice(seat.price, currency)

  const ref = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Report the sheet's height to the 3D camera (and keep it updated).
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const report = () => useStage.setState({ sheetHeight: element.offsetHeight })
    report()
    const observer = new ResizeObserver(report)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Move focus into the sheet when the camera has landed.
  useEffect(() => {
    if (visible) headingRef.current?.focus()
  }, [visible])

  return (
    <motion.section
      ref={ref}
      aria-labelledby="seat-sheet-title"
      inert={!visible}
      initial={{ y: '105%' }}
      animate={{ y: visible ? 0 : '105%' }}
      exit={{ y: '105%' }}
      transition={{ type: 'spring', stiffness: 260, damping: 32 }}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 rounded-t-[1.75rem] bg-[#141416]/95 px-5 pt-3 pb-5 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-md"
    >
      <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${TAG_STYLES[tag]}`}
          >
            {tag}
          </span>
          <h2
            id="seat-sheet-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 text-xl font-semibold tracking-tight outline-none"
          >
            Row {seat.row}, Seat {seat.number}
          </h2>
          <p className="mt-0.5 text-sm text-white/60">
            {capitalise(seat.type)} <span aria-hidden>·</span> {price}
          </p>
        </div>
        <MiniMap seatId={seat.id} showtimeId={showtimeId} />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="To the screen" value={`${distance.toFixed(1)} m`} />
        <Metric label="Screen in view" value={`${Math.round(fov)}°`} />
        <Metric label="From centre" value={formatOffset(offset)} />
      </dl>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setView('map')}
          className="rounded-full bg-white/[0.08] px-5 py-3 text-sm font-semibold ring-1 ring-white/10 hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Change seat
        </button>
        <button
          type="button"
          onClick={() => setView('confirm')}
          className="flex-1 rounded-full bg-mint px-5 py-3 text-sm font-semibold text-bg hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98]"
        >
          Book <span aria-hidden>·</span> {price}
        </button>
      </div>
    </motion.section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse rounded-2xl bg-white/[0.05] px-3 py-2.5 ring-1 ring-white/[0.06]">
      <dt className="mt-0.5 text-[11px] text-white/55">{label}</dt>
      <dd className="text-[15px] font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
