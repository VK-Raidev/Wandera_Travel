import { useContext } from 'react'
import { TripDraftContext } from '../context/tripDraft'

function useTripDraft() {
  const context = useContext(TripDraftContext)
  if (!context) throw new Error('useTripDraft must be used inside TripDraftProvider')
  return context
}

export { useTripDraft }