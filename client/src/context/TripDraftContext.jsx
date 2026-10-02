import { useState } from 'react'
import { TripDraftContext } from './tripDraft'

function TripDraftProvider({ children }) {
  const [draft, setDraft] = useState({
    destination: '',
    travelDate: '',
    travelers: 2,
    notes: '',
  })

  function updateDraft(field, value) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }))
  }

  return (
    <TripDraftContext.Provider value={{ draft, updateDraft }}>
      {children}
    </TripDraftContext.Provider>
  )
}

export { TripDraftProvider }