import type { ReactNode } from 'react'

/**
 * Phone-sized app shell. Full screen on phones (and the full width when a
 * phone is held sideways); on desktop it's a centred 430px-wide "device"
 * with a subtle outline.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-app justify-center frame:items-center frame:p-6">
      <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden land:max-w-none frame:h-[min(900px,calc(100dvh-3rem))] frame:rounded-[2.5rem] frame:shadow-[0_30px_80px_rgba(0,0,0,0.6)] frame:ring-1 frame:ring-white/10">
        {children}
      </div>
    </div>
  )
}
