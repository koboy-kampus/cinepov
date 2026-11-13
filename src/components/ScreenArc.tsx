/**
 * The curved, glowing "SCREEN" at the top of the seat map. The arc bows away
 * from the seats (edges closer to the audience), like the curved 3D screen.
 */
export function ScreenArc() {
  return (
    <div className="relative" aria-hidden>
      <svg viewBox="0 0 360 64" className="w-full overflow-visible">
        <defs>
          {/* Light spilling towards the seats: brightest under the middle, fading out */}
          <radialGradient id="screen-spill" cx="0.5" cy="0" r="0.6">
            <stop offset="0" stopColor="#fff" stopOpacity="0.24" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id="screen-glow" x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <path d="M24 28 Q180 2 336 28 L360 64 L0 64 Z" fill="url(#screen-spill)" />
        <path
          d="M24 28 Q180 2 336 28"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.7"
          strokeWidth="6"
          filter="url(#screen-glow)"
        />
        <path
          d="M24 28 Q180 2 336 28"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <p className="absolute inset-x-0 top-[48%] text-center text-[10px] font-medium tracking-[0.5em] text-white/60">
        SCREEN
      </p>
    </div>
  )
}
