import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import PageFrame from '../components/PageFrame'
import { useTripDraft } from '../hooks/useTripDraft'
import api from '../services/api'

function CustomTrip() {
  const { draft, updateDraft } = useTripDraft()
  const [destinations, setDestinations] = useState([])
  const [contact, setContact] = useState({ name: '', email: '', phone: '', budget: '' })
  const [loadingDestinations, setLoadingDestinations] = useState(true)
  const [destinationLoadError, setDestinationLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const minDate = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    let isCurrentRequest = true
    api.get('/destinations')
      .then(({ data: response }) => {
        if (isCurrentRequest) setDestinations(Array.isArray(response.data) ? response.data : [])
      })
      .catch((requestError) => {
        if (isCurrentRequest) setDestinationLoadError(requestError.response?.data?.error || 'Destinations could not be loaded.')
      })
      .finally(() => {
        if (isCurrentRequest) setLoadingDestinations(false)
      })
    return () => { isCurrentRequest = false }
  }, [reloadKey])

  function retryDestinations() {
    setDestinationLoadError('')
    setLoadingDestinations(true)
    setReloadKey((key) => key + 1)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    const phoneDigits = contact.phone.replace(/\D/g, '').length
    if (phoneDigits < 7 || phoneDigits > 15) {
      setError('Enter a phone number with 7 to 15 digits.')
      return
    }

    setSubmitting(true)
    try {
      const { budget, ...contactDetails } = contact
      const response = await api.post('/inquiries', {
        ...contactDetails,
        destination: draft.destination,
        travelDate: draft.travelDate,
        travelers: Number(draft.travelers),
        ...(budget !== '' && { budget: Number(budget) }),
        message: draft.notes,
      })
      setSuccess(response.data.message || 'Your trip request has been sent.')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Your trip request could not be sent. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function updateContact(event) {
    const { name, value } = event.target
    setContact((current) => ({ ...current, [name]: value }))
    setError('')
    setSuccess('')
  }

  return (
    <PageFrame
      eyebrow="A trip that starts with you"
      title="Let's make a little room for wonder."
      description="Tell us what you have in mind and a travel specialist will help shape the next step."
    >
      {destinationLoadError && <p className="admin-feedback is-error" role="alert">{destinationLoadError} <button className="admin-text-button" type="button" onClick={retryDestinations}>Retry loading destinations</button></p>}
      {error && <p className="admin-feedback is-error" role="alert">{error}</p>}
      {success && <p className="admin-feedback" role="status">{success}</p>}
      <form className="trip-form" onSubmit={handleSubmit}>
        <label>
          Your name
          <input name="name" autoComplete="name" value={contact.name} onChange={updateContact} required />
        </label>
        <div className="form-row">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" value={contact.email} onChange={updateContact} required />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" autoComplete="tel" value={contact.phone} onChange={updateContact} required />
          </label>
        </div>
        <label>
          Where would you like to go?
          <select value={draft.destination} onChange={(event) => updateDraft('destination', event.target.value)} required disabled={loadingDestinations || destinations.length === 0}>
            <option value="">{loadingDestinations ? 'Loading destinations...' : 'Choose a destination'}</option>
            {destinations.map((destination) => <option key={destination._id} value={destination.slug}>{destination.name}</option>)}
          </select>
        </label>
        <div className="form-row">
          <label>
            When are you thinking?
            <input type="date" min={minDate} value={draft.travelDate} onChange={(event) => updateDraft('travelDate', event.target.value)} required />
          </label>
          <label>
            Travelers
            <input type="number" min="1" max="20" step="1" value={draft.travelers} onChange={(event) => updateDraft('travelers', event.target.value)} required />
          </label>
        </div>
        <label>
          Budget per person (INR)
          <input name="budget" type="number" min="0" value={contact.budget} onChange={updateContact} />
        </label>
        <label>
          What would make it yours?
          <textarea rows="4" value={draft.notes} onChange={(event) => updateDraft('notes', event.target.value)} placeholder="A slower pace, a favorite kind of place, a milestone to celebrate..." />
        </label>
        <button className="button button-green" type="submit" disabled={submitting || loadingDestinations || destinations.length === 0}>{submitting ? 'Sending request...' : 'Send trip request'} <Send size={16} /></button>
      </form>
    </PageFrame>
  )
}

export default CustomTrip