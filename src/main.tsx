import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useBooking } from './store/useBooking'
import { stageProgress, useStage } from './store/useStage'

// "?seat=F8" opens straight into that seat's 3D view (handy for testing and sharing).
useBooking.getState().openSeatFromQuery(window.location.search)

// Dev only (removed from production builds): lets the scripts in scripts/
// drive and inspect the transition, using the same store the app uses.
if (import.meta.env.DEV) {
  Object.assign(window, { __cinepov: { stageProgress, useStage, useBooking } })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
