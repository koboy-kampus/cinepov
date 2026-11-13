import type { ReactNode } from 'react'

/**
 * Phone-sized app shell. Full screen on phones; on desktop it's a centred
 * 430px-wide "device" with a subtle outline.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh justify-center md:items-center md:p-6">
      <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden md:h-[min(900px,calc(100dvh-3rem))] md:rounded-[2.5rem] md:shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:ring-1 md:ring-white/10">
        {children}
      </div>
    </div>
  )
}
