import { formatShowDate } from '../lib/date'

export function Header() {
  return (
    <header className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-semibold tracking-tight">Meridian</h1>
      <p className="mt-0.5 text-sm text-white/60">
        Hall 3 <span aria-hidden>·</span> {formatShowDate(new Date())}
      </p>
    </header>
  )
}
