import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Clock3, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import api from '../services/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const configuredPhone = import.meta.env.VITE_CONTACT_PHONE || '+91 98765 43210'
const phoneHref = `tel:${configuredPhone.replace(/[^+\d]/g, '')}`
const whatsappNumber = configuredPhone.replace(/\D/g, '')
const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi, I would like help planning a trip.')}`
const officeMapHref = 'https://www.google.com/maps/search/?api=1&query=India'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  destination: '',
  travelDate: '',
  travelers: '2',
  budget: '',
  message: '',
}

function Contact() {
  useDocumentTitle('Contact', 'Contact Wanderlust Travels or send a trip inquiry to start planning your next journey.')
  const [destinations, setDestinations] = useState([])
  const [destinationsLoading, setDestinationsLoading] = useState(true)
  const [destinationLoadError, setDestinationLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
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
        if (isCurrentRequest) setDestinationsLoading(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [reloadKey])

  function retryDestinations() {
    setDestinationLoadError('')
    setDestinationsLoading(true)
    setReloadKey((key) => key + 1)
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setSuccess('')
    setSubmitError('')
  }

  function validateForm() {
    const errors = {}
    const digitCount = form.phone.replace(/\D/g, '').length
    const travelerCount = Number(form.travelers)
    const budget = form.budget === '' ? null : Number(form.budget)

    if (!form.name.trim()) errors.name = 'Enter your name.'
    if (!form.phone.trim() || digitCount < 7 || digitCount > 15) errors.phone = 'Enter a phone number with 7 to 15 digits.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.'
    if (!form.destination) errors.destination = 'Choose a destination.'
    if (!form.travelDate) errors.travelDate = 'Choose your travel date.'
    else if (form.travelDate < minDate) errors.travelDate = 'Choose a date that is today or later.'
    if (!Number.isInteger(travelerCount) || travelerCount < 1 || travelerCount > 20) errors.travelers = 'Enter between 1 and 20 travelers.'
    if (budget !== null && (!Number.isFinite(budget) || budget < 0)) errors.budget = 'Enter a budget of zero or more.'

    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const errors = validateForm()
    setFieldErrors(errors)
    setSuccess('')

    if (Object.keys(errors).length > 0) {
      document.getElementById(Object.keys(errors)[0])?.focus()
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const response = await api.post('/inquiries', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        destination: form.destination,
        travelDate: form.travelDate,
        travelers: Number(form.travelers),
        ...(form.budget !== '' && { budget: Number(form.budget) }),
        message: form.message.trim(),
      })
      setSuccess(response.data.message || 'Thanks for reaching out. Our travel team will be in touch soon.')
      setForm({ ...initialForm })
      setFieldErrors({})
    } catch (requestError) {
      setSubmitError(requestError.response?.data?.error || 'Your request could not be sent. Please try again or contact us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  function fieldClass(field) {
    return `contact-input${fieldErrors[field] ? ' has-error' : ''}`
  }

  return (
    <div className="contact-page">
      <header className="contact-page-heading">
        <p className="eyebrow">A good trip starts with a conversation</p>
        <h1>Tell us what you're dreaming about.</h1>
        <p>Share a few details and a travel expert will help shape the next step.</p>
      </header>

      <div className="contact-page-grid">
        <section className="inquiry-panel" aria-labelledby="inquiry-heading">
          <div className="inquiry-heading">
            <div><p className="eyebrow">Trip inquiry</p><h2 id="inquiry-heading">Let's plan something good.</h2></div>
            <span className="inquiry-secure"><Check size={14} /> No commitment</span>
          </div>

          {success && <div className="form-success" role="status" aria-live="polite"><span><Check size={17} /></span><div><strong>Request received</strong><p>{success}</p></div></div>}
          {submitError && <div className="form-error-summary" role="alert">{submitError}</div>}
          {destinationLoadError && <div className="form-error-summary" role="alert"><p>{destinationLoadError}</p><button className="text-link" type="button" onClick={retryDestinations}>Retry loading destinations</button></div>}

          <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
            <div className="inquiry-form-row">
              <label className="inquiry-field" htmlFor="name">Name
                <input id="name" className={fieldClass('name')} name="name" value={form.name} onChange={updateField} autoComplete="name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'name-error' : undefined} required />
                {fieldErrors.name && <span className="field-error" id="name-error">{fieldErrors.name}</span>}
              </label>
              <label className="inquiry-field" htmlFor="phone">Phone
                <input id="phone" className={fieldClass('phone')} name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel" placeholder="+91 98765 43210" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'phone-error' : undefined} required />
                {fieldErrors.phone && <span className="field-error" id="phone-error">{fieldErrors.phone}</span>}
              </label>
            </div>

            <label className="inquiry-field" htmlFor="email">Email
              <input id="email" className={fieldClass('email')} name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} required />
              {fieldErrors.email && <span className="field-error" id="email-error">{fieldErrors.email}</span>}
            </label>

            <div className="inquiry-form-row">
              <label className="inquiry-field" htmlFor="destination">Destination
                <select id="destination" className={fieldClass('destination')} name="destination" value={form.destination} onChange={updateField} aria-invalid={Boolean(fieldErrors.destination)} aria-describedby={fieldErrors.destination ? 'destination-error' : undefined} required disabled={destinationsLoading || destinations.length === 0}>
                  <option value="">{destinationsLoading ? 'Loading destinations...' : 'Choose a destination'}</option>
                  {destinations.map((destination) => <option key={destination._id} value={destination.slug}>{destination.name}</option>)}
                </select>
                {fieldErrors.destination && <span className="field-error" id="destination-error">{fieldErrors.destination}</span>}
              </label>
              <label className="inquiry-field" htmlFor="travelDate">Travel date
                <input id="travelDate" className={fieldClass('travelDate')} name="travelDate" type="date" min={minDate} value={form.travelDate} onChange={updateField} aria-invalid={Boolean(fieldErrors.travelDate)} aria-describedby={fieldErrors.travelDate ? 'travelDate-error' : undefined} required />
                {fieldErrors.travelDate && <span className="field-error" id="travelDate-error">{fieldErrors.travelDate}</span>}
              </label>
            </div>

            <div className="inquiry-form-row">
              <label className="inquiry-field" htmlFor="travelers">Number of travelers
                <input id="travelers" className={fieldClass('travelers')} name="travelers" type="number" min="1" max="20" step="1" value={form.travelers} onChange={updateField} aria-invalid={Boolean(fieldErrors.travelers)} aria-describedby={fieldErrors.travelers ? 'travelers-error' : undefined} required />
                {fieldErrors.travelers && <span className="field-error" id="travelers-error">{fieldErrors.travelers}</span>}
              </label>
              <label className="inquiry-field" htmlFor="budget">Budget per person (INR)
                <input id="budget" className={fieldClass('budget')} name="budget" type="number" min="0" step="1000" value={form.budget} onChange={updateField} placeholder="Optional" aria-invalid={Boolean(fieldErrors.budget)} aria-describedby={fieldErrors.budget ? 'budget-error' : undefined} />
                {fieldErrors.budget && <span className="field-error" id="budget-error">{fieldErrors.budget}</span>}
              </label>
            </div>

            <label className="inquiry-field" htmlFor="message">Message <span className="field-optional">Optional</span>
              <textarea id="message" className="contact-input" name="message" rows="4" maxLength="1200" value={form.message} onChange={updateField} placeholder="Anything else you'd like us to know?" />
            </label>

            <button className="inquiry-submit" type="submit" disabled={submitting || destinationsLoading || destinations.length === 0}>
              {submitting ? 'Sending request...' : 'Send trip inquiry'} <ArrowUpRight size={17} />
            </button>
            <p className="inquiry-privacy">Your details are only used to respond to this trip inquiry.</p>
          </form>
        </section>

        <aside className="contact-sidebar">
          <div className="contact-sidebar-block">
            <p className="eyebrow">Talk to a real person</p>
            <a className="contact-detail-link" href={phoneHref}><span className="contact-detail-icon"><Phone size={18} /></span><span><small>Call us</small><strong>{configuredPhone}</strong></span><ArrowUpRight size={15} /></a>
            <a className="contact-detail-link" href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'hello@wanderlust.example'}`}><span className="contact-detail-icon"><Mail size={18} /></span><span><small>Email</small><strong>{import.meta.env.VITE_CONTACT_EMAIL || 'hello@wanderlust.example'}</strong></span><ArrowUpRight size={15} /></a>
            <a className="contact-detail-link" href={whatsappHref} target="_blank" rel="noreferrer"><span className="contact-detail-icon contact-whatsapp-icon"><MessageCircle size={18} /></span><span><small>WhatsApp</small><strong>Chat with our travel team</strong></span><ArrowUpRight size={15} /></a>
          </div>

          <div className="contact-map-card">
            <div className="map-placeholder"><MapPin size={27} /><span>Wanderlust Travels</span><small>India | Planning everywhere</small></div>
            <div className="contact-office-info"><div><p className="eyebrow">Office</p><strong>India | Meetings by appointment</strong></div><a href={officeMapHref} target="_blank" rel="noreferrer">Open Google Maps <ArrowUpRight size={14} /></a></div>
          </div>

          <div className="contact-hours"><Clock3 size={16} /><span><strong>Here when you need us</strong><small>Trip support available around the clock.</small></span></div>
        </aside>
      </div>

      <div className="contact-floating-actions" aria-label="Quick contact">
        <a className="floating-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"><MessageCircle size={18} /><span>WhatsApp</span></a>
        <a className="floating-call" href={phoneHref} aria-label={`Call ${configuredPhone}`}><Phone size={18} /><span>Call</span></a>
      </div>
    </div>
  )
}

export default Contact