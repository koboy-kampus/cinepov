import type { SeatType } from '../data/hall'
import { seatClasses, type SeatState } from './seatStyles'

const ITEMS: { label: string; type: SeatType; state: SeatState }[] = [
  { label: 'Available', type: 'standard', state: 'available' },
  { label: 'Taken', type: 'standard', state: 'taken' },
  { label: 'Recliner', type: 'recliner', state: 'available' },
  { label: 'Selected', type: 'standard', state: 'selected' },
]

export function Legend() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-5 text-xs text-white/70">
      {ITEMS.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span aria-hidden className={`block w-3.5 ${seatClasses(item.type, item.state)}`} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
