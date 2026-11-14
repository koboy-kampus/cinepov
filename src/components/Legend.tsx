import type { SeatType } from '../data/hall'
import { seatClasses, type SeatState } from './seatStyles'

const ITEMS: { label: string; type: SeatType; state: SeatState }[] = [
  { label: 'Available', type: 'standard', state: 'available' },
  { label: 'Taken', type: 'standard', state: 'taken' },
  { label: 'Recliner', type: 'recliner', state: 'available' },
  { label: 'Selected', type: 'standard', state: 'selected' },
]

export function Legend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-5 text-xs text-white/70">
        {ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span aria-hidden className={`block w-3.5 ${seatClasses(item.type, item.state)}`} />
            {item.label}
          </li>
        ))}
      </ul>
      {/* Explains the app's twist; hidden on short phones where space is tight. */}
      <p className="px-5 text-center text-xs text-white/60 [@media(max-height:700px)]:hidden">
        Tap a seat to preview your view of the screen
      </p>
    </div>
  )
}
