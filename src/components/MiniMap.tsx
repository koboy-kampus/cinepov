import { HALL, SEATS } from '../data/hall'
import { isSeatTaken } from '../data/showtimes'
import { eyePosition, seatPosition } from '../lib/geometry'

const SEAT_W = 0.46
const SEAT_D = 0.4
const MAX_X = Math.max(...SEATS.map((seat) => Math.abs(seatPosition(seat).x))) + SEAT_W
const MAX_Z = Math.max(...SEATS.map((seat) => seatPosition(seat).z)) + SEAT_D
const HALF_SCREEN = HALL.screenWidth / 2
const PAD = 0.4

/**
 * A tiny top-down plan of the hall, drawn from the real seat positions (in
 * metres): the screen at the top, all seats, and a mint "view cone" from the
 * selected seat to the screen edges, which is the angle the FOV metric measures.
 */
export function MiniMap({ seatId, showtimeId }: { seatId: string; showtimeId: string }) {
  const seat = SEATS.find((s) => s.id === seatId)
  const eye = seat ? eyePosition(seat) : null
  const halfWidth = Math.max(MAX_X, HALF_SCREEN) + PAD

  return (
    <svg
      viewBox={`${-halfWidth} ${-0.6} ${halfWidth * 2} ${MAX_Z + 0.6 + PAD}`}
      className="h-auto w-28 shrink-0"
      aria-hidden
    >
      {/* Screen */}
      <path
        d={`M${-HALF_SCREEN} 0.15 Q0 -0.35 ${HALF_SCREEN} 0.15`}
        fill="none"
        stroke="white"
        strokeOpacity={0.8}
        strokeWidth={0.18}
        strokeLinecap="round"
      />
      {/* View cone: from the seat to both screen edges */}
      {eye && (
        <polygon
          points={`${eye.x},${eye.z} ${-HALF_SCREEN},0.1 ${HALF_SCREEN},0.1`}
          fill="#6ee7a8"
          fillOpacity={0.14}
          stroke="#6ee7a8"
          strokeOpacity={0.45}
          strokeWidth={0.06}
        />
      )}
      {SEATS.map((s) => {
        const { x, z } = seatPosition(s)
        const selected = s.id === seatId
        const fill = selected
          ? '#6ee7a8'
          : isSeatTaken(showtimeId, s.id)
            ? '#2a2a2e'
            : s.type === 'recliner'
              ? '#b23a48'
              : '#8b1e2b'
        return (
          <rect
            key={s.id}
            x={x - SEAT_W / 2}
            y={z - SEAT_D / 2}
            width={SEAT_W}
            height={SEAT_D}
            rx={0.1}
            fill={fill}
          />
        )
      })}
    </svg>
  )
}
