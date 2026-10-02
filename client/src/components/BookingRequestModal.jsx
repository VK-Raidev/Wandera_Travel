import { useEffect, useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CircleAlert, X } from 'lucide-react'
import api from '../services/api'
import { formatPrice } from '../utils/formatPrice'

const stepTitles = ['Traveler details', 'Travel preferences', 'Package summary', 'Submit']

function createInitialForm(travelPackage) {
  return {
    name: '',
    phone: '',
    email: '',
    travelDate: '',
    travelers: '2',
    budget: String(travelPackage.price || ''),
    message: '',
  }
}

function BookingRequestModal({ isOpen, onClose, travelPackage }) {
  const dialogRef = useRef(null)
  const formId = `booking-${useId().replace(/:/g, '')}`
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(() => createInitialForm(travelPackage))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const destination = travelPackage.destination || {}
  const minDate = new Date().toISOString().slice(0, 10)
  const lastStep = stepTitles.length
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
  }

  function validateStep() {
    const nextErrors = {}

    if (step === 1) {
      const phoneDigits = form.phone.replace(/\D/g, '').length
      if (!form.name.trim()) nextErrors.name = 'Enter the traveler name.'
      if (phoneDigits < 7 || phoneDigits > 15) nextErrors.phone = 'Enter a phone number with 7 to 15 digits.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.'
    }

    if (step === 2) {
      if (!form.travelDate) nextErrors.travelDate = 'Choose your preferred travel date.'
      else if (form.travelDate < minDate) nextErrors.travelDate = 'Choose a date that is today or later.'
      if (!Number.isInteger(Number(form.travelers)) || Number(form.travelers) < 1 || Number(form.travelers) > 20) {
        nextErrors.travelers = 'Enter between 1 and 20 travelers.'
      }
      if (form.budget !== '' && (!Number.isFinite(Number(form.budget)) || Number(form.budget) < 0)) {
        nextErrors.budget = 'Enter a budget of zero or more.'
      }
    }

    setErrors(nextErrors)
    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) document.getElementById(`${formId}-${firstInvalidField}`)?.focus()
    return Object.keys(nextErrors).length === 0
  }

  function goNext() {
    if (validateStep()) setStep((current) => Math.min(current + 1, lastStep))
  }

  async function submitInquiry(event) {
    event.preventDefault()

    if (step < lastStep) {
      if (validateStep()) setStep((current) => current + 1)
      return
    }

    setSubmitError('')
    setSubmitting(true)

    try {
      const response = await api.post('/inquiries', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        destination: destination._id || destination.slug,
        travelDate: form.travelDate,
        travelers: Number(form.travelers),
        ...(form.budget !== '' && { budget: Number(form.budget) }),
        message: form.message.trim(),
        packageId: travelPackage._id,
      })
      setConfirmation(response.data.data)
      setStep(lastStep + 1)
    } catch (requestError) {
      setSubmitError(requestError.response?.data?.error || 'Your request could not be sent. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetAndClose() {
    setStep(1)
    setForm(createInitialForm(travelPackage))
    setErrors({})
    setSubmitError('')
    setConfirmation(null)
    onClose()
  }

  return (
    <dialog
      className="booking-wizard-dialog"
      ref={dialogRef}
      aria-label={`Request a quote for ${travelPackage.title}`}
      onClose={resetAndClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      {confirmation ? (
        <section className="booking-confirmation" aria-live="polite">
          <button className="booking-modal-close" type="button" aria-label="Close confirmation" onClick={() => dialogRef.current?.close()}><X size={19} /></button>
          <div className="booking-confirmation-icon"><BadgeCheck size={32} /></div>
          <p className="booking-step-eyebrow">Request received</p>
          <h2>Your trip is in good hands.</h2>
          <p>Thanks, {confirmation.name}. A travel specialist will review your {destination.name} plans and get back to you soon.</p>
          <div className="booking-confirmation-reference"><span>Request reference</span><strong>{confirmation._id}</strong></div>
          <button className="booking-primary-button" type="button" onClick={() => dialogRef.current?.close()}>Done <Check size={16} /></button>
        </section>
      ) : (
        <div className="booking-wizard">
          <header className="booking-modal-header">
            <div><p className="booking-step-eyebrow">Build your trip</p><h2>{travelPackage.title}</h2></div>
            <button className="booking-modal-close" type="button" aria-label="Close booking request" onClick={() => dialogRef.current?.close()}><X size={19} /></button>
          </header>

          <ol className="booking-stepper" aria-label="Booking request progress">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1
              return (
                <li className={`booking-step${stepNumber === step ? ' is-current' : ''}${stepNumber < step ? ' is-complete' : ''}`} key={title} aria-current={stepNumber === step ? 'step' : undefined}>
                  <span>{stepNumber < step ? <Check size={13} /> : stepNumber}</span>
                  <small>{title}</small>
                </li>
              )
            })}
          </ol>

          {submitError && <div className="booking-submit-error" role="alert"><CircleAlert size={16} /> {submitError}</div>}

          <form className="booking-step-content" onSubmit={submitInquiry} noValidate>
            {step === 1 && (
              <section className="booking-step-panel" aria-labelledby={`${formId}-step-heading`}>
                <p className="booking-step-eyebrow">Step 1 of 4</p>
                <h3 id={`${formId}-step-heading`}>Who is traveling?</h3>
                <p className="booking-step-description">Share the best way for our trip specialist to reach you.</p>
                <div className="booking-fields">
                  <label className="booking-field" htmlFor={`${formId}-name`}>Full name
                    <input id={`${formId}-name`} name="name" autoComplete="name" value={form.name} onChange={updateField} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${formId}-name-error` : undefined} />
                    {errors.name && <small className="booking-field-error" id={`${formId}-name-error`}>{errors.name}</small>}
                  </label>
                  <label className="booking-field" htmlFor={`${formId}-phone`}>Phone number
                    <input id={`${formId}-phone`} name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={updateField} placeholder="Include your country code" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? `${formId}-phone-error` : undefined} />
                    {errors.phone && <small className="booking-field-error" id={`${formId}-phone-error`}>{errors.phone}</small>}
                  </label>
                  <label className="booking-field" htmlFor={`${formId}-email`}>Email address
                    <input id={`${formId}-email`} name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${formId}-email-error` : undefined} />
                    {errors.email && <small className="booking-field-error" id={`${formId}-email-error`}>{errors.email}</small>}
                  </label>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="booking-step-panel" aria-labelledby={`${formId}-step-heading`}>
                <p className="booking-step-eyebrow">Step 2 of 4</p>
                <h3 id={`${formId}-step-heading`}>How would you like to travel?</h3>
                <p className="booking-step-description">Set a few preferences. We can fine-tune the details together.</p>
                <div className="booking-fields booking-preference-fields">
                  <label className="booking-field" htmlFor={`${formId}-travelDate`}>Preferred travel date
                    <input id={`${formId}-travelDate`} name="travelDate" type="date" min={minDate} value={form.travelDate} onChange={updateField} aria-invalid={Boolean(errors.travelDate)} aria-describedby={errors.travelDate ? `${formId}-travelDate-error` : undefined} />
                    {errors.travelDate && <small className="booking-field-error" id={`${formId}-travelDate-error`}>{errors.travelDate}</small>}
                  </label>
                  <div className="booking-fields-row">
                    <label className="booking-field" htmlFor={`${formId}-travelers`}>Travelers
                      <input id={`${formId}-travelers`} name="travelers" type="number" min="1" max="20" step="1" value={form.travelers} onChange={updateField} aria-invalid={Boolean(errors.travelers)} aria-describedby={errors.travelers ? `${formId}-travelers-error` : undefined} />
                      {errors.travelers && <small className="booking-field-error" id={`${formId}-travelers-error`}>{errors.travelers}</small>}
                    </label>
                    <label className="booking-field" htmlFor={`${formId}-budget`}>Budget per person (INR)
                      <input id={`${formId}-budget`} name="budget" type="number" min="0" step="1000" value={form.budget} onChange={updateField} aria-invalid={Boolean(errors.budget)} aria-describedby={errors.budget ? `${formId}-budget-error` : undefined} />
                      {errors.budget && <small className="booking-field-error" id={`${formId}-budget-error`}>{errors.budget}</small>}
                    </label>
                  </div>
                  <label className="booking-field" htmlFor={`${formId}-message`}>Notes for your travel specialist <span>Optional</span>
                    <textarea id={`${formId}-message`} name="message" rows="3" maxLength="1200" value={form.message} onChange={updateField} placeholder="Interests, pace, special requests..." />
                  </label>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="booking-step-panel" aria-labelledby={`${formId}-step-heading`}>
                <p className="booking-step-eyebrow">Step 3 of 4</p>
                <h3 id={`${formId}-step-heading`}>Your package, at a glance.</h3>
                <p className="booking-step-description">Review what you have chosen before sending your request.</p>
                <div className="booking-package-summary">
                  {travelPackage.images?.[0] && <img src={travelPackage.images[0]} alt={`${destination.name} trip`} />}
                  <div><span>{destination.name}</span><strong>{travelPackage.title}</strong><small>{travelPackage.duration} | {formatPrice(travelPackage.price)} per person</small></div>
                </div>
                <dl className="booking-review-list">
                  <div><dt>Traveler</dt><dd>{form.name}</dd></div>
                  <div><dt>Contact</dt><dd>{form.email} | {form.phone}</dd></div>
                  <div><dt>Travel date</dt><dd>{form.travelDate}</dd></div>
                  <div><dt>Travelers</dt><dd>{form.travelers}</dd></div>
                  <div><dt>Budget per person</dt><dd>{form.budget ? formatPrice(Number(form.budget)) : 'Flexible'}</dd></div>
                </dl>
              </section>
            )}

            {step === 4 && (
              <section className="booking-step-panel booking-submit-panel" aria-labelledby={`${formId}-step-heading`}>
                <p className="booking-step-eyebrow">Step 4 of 4</p>
                <h3 id={`${formId}-step-heading`}>Ready to start planning?</h3>
                <p className="booking-step-description">Send your request and our travel team will follow up to confirm availability and next steps. No payment is taken now.</p>
                <div className="booking-submit-summary"><Check size={17} /><span>Requesting <strong>{travelPackage.title}</strong> for {form.travelers} traveler{form.travelers === '1' ? '' : 's'} to {destination.name}.</span></div>
                <button className="booking-primary-button booking-final-submit" type="submit" disabled={submitting}>
                  {submitting ? 'Sending request...' : 'Submit trip request'} <ArrowRight size={17} />
                </button>
              </section>
            )}
          </form>

          <footer className="booking-modal-footer">
            {step > 1
              ? <button className="booking-back-button" type="button" onClick={() => { setSubmitError(''); setStep((current) => current - 1) }}><ArrowLeft size={15} /> Back</button>
              : <span className="booking-footer-note">Your details stay with our travel team.</span>}
            {step < lastStep && (
              <button className="booking-primary-button" type="button" onClick={goNext}>
                {step === 3 ? 'Continue to submit' : 'Continue'} <ArrowRight size={16} />
              </button>
            )}
          </footer>
        </div>
      )}
    </dialog>
  )
}

export default BookingRequestModal