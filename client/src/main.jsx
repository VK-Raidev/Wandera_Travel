import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TripDraftProvider } from './context/TripDraftContext'
import './index.css'
import './site.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TripDraftProvider>
        <App />
      </TripDraftProvider>
    </BrowserRouter>
  </StrictMode>,
)
