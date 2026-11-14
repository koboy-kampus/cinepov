import { SHOWTIMES } from '../data/showtimes'
import { useBooking } from '../store/useBooking'

export function ShowtimePills() {
  const showtimeId = useBooking((s) => s.showtimeId)
  const setShowtime = useBooking((s) => s.setShowtime)

  return (
    <div
      role="group"
      aria-label="Showtime"
      className="flex flex-wrap gap-2 px-5 land:col-start-2 land:row-start-2"
    >
      {SHOWTIMES.map((show) => {
        const active = show.id === showtimeId
        return (
          <button
            key={show.id}
            type="button"
            aria-pressed={active}
            onClick={() => setShowtime(show.id)}
            className={`rounded-full px-4 py-2 text-sm land:px-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              active
                ? 'bg-mint text-bg'
                : 'bg-white/5 text-white/80 ring-1 ring-white/10 hover:bg-white/10'
            }`}
          >
            {show.time}
            {show.format !== 'Standard' && (
              <span
                className={`ml-1.5 text-xs font-semibold ${active ? 'text-bg/70' : 'text-white/60'}`}
              >
                {show.format}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
