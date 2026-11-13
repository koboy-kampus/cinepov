import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useBooking } from './store/useBooking'

// "?seat=F8" opens straight into that seat's 3D view (handy for testing and sharing).
useBooking.getState().openSeatFromQuery(window.location.search)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
