import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BedDouble, BusFront, CalendarDays, Check, CircleAlert, MapPin, ShieldCheck, Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import BookingRequestModal from '../components/BookingRequestModal'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import api from '../services/api'
import { formatPrice } from '../utils/formatPrice'

function PackageDetails() {
  const { identifier } = useParams()
  const [packageResult, setPackageResult] = useState({ identifier: '', data: null, error: '', notFound: false })
  const [reloadKey, setReloadKey] = useState(0)
  const [testimonials, setTestimonials] = useState([])
  const [testimonialError, setTestimonialError] = useState('')
  const [testimonialReloadKey, setTestimonialReloadKey] = useState(0)
  const [activeImage, setActiveImage] = useState(0)
  const [brokenImages, setBrokenImages] = useState([])
  const [bookingOpen, setBookingOpen] = useState(false)
  const loading = packageResult.identifier !== identifier
  const travelPackage = loading ? null : packageResult.data
  const destination = travelPackage?.destination || {}
  const images = [...new Set([...(travelPackage?.images || []), destination.image].filter(Boolean))]
    .filter((image) => !brokenImages.includes(image))
  const selectedImage = images[Math.min(activeImage, Math.max(images.length - 1, 0))]
  useDocumentTitle(
    travelPackage?.title || 'Package details',
    travelPackage?.overview || 'Explore package details, itinerary, inclusions, and request a trip quote with Wanderlust Travels.',
  )

  function markImageBroken(image) {
    setBrokenImages((current) => current.includes(image) ? current : [...current, image])
  }

  useEffect(() => {
    let isCurrentRequest = true

    api.get(`/packages/${encodeURIComponent(identifier)}`)
      .then(({ data: response }) => {
        if (isCurrentRequest) {
          setPackageResult({ identifier, data: response.data, error: '', notFound: false })
        }
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          const message = requestError.response?.status === 404
            ? 'We could not find that travel package.'
            : 'Package details could not be loaded. Please try again.'
          setPackageResult({ identifier, data: null, error: message, notFound: requestError.response?.status === 404 })
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [identifier, reloadKey])

  useEffect(() => {
    let isCurrentRequest = true

    api.get('/testimonials')
      .then(({ data: response }) => {
        if (isCurrentRequest) {
          setTestimonials(Array.isArray(response.data) ? response.data.slice(0, 4) : [])
          setTestimonialError('')
        }
      })
      .catch((requestError) => {
        if (isCurrentRequest) setTestimonialError(requestError.response?.data?.error || 'Traveler reviews could not be loaded.')
      })

    return () => {
      isCurrentRequest = false
    }
  }, [testimonialReloadKey])

  if (loading) {
    return <div className="package-detail-loading"><LoadingPlaceholder label="Loading package details" /></div>
  }

  if (!travelPackage) {
    return (
      <section className="package-detail-error">
        <CircleAlert size={28} />
        <h1>Package unavailable</h1>
        <p>{packageResult.error}</p>
        {!packageResult.notFound && <button className="button button-green" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>}
        <Link className="button button-green" to="/domestic"><ArrowLeft size={16} /> Browse trips</Link>
      </section>
    )
  }

  const itinerary = travelPackage.itinerary || []
  const importantInformation = travelPackage.importantInformation || []
  const inclusions = travelPackage.inclusions || []
  const exclusions = travelPackage.exclusions || []
  const backPath = travelPackage.type === 'international' ? '/international' : '/domestic'

  return (
    <div className="package-detail-page">
      <div className="package-detail-topline">
        <Link to={backPath}><ArrowLeft size={15} /> Back to {travelPackage.type === 'international' ? 'international trips' : 'India trips'}</Link>
        <span><MapPin size={14} /> {destination.name}</span>
      </div>

      <section className="package-detail-hero">
        <div className="package-gallery">
          {selectedImage ? (
            <img className="package-gallery-main" src={selectedImage} alt={`${destination.name} travel scenery`} onError={() => markImageBroken(selectedImage)} />
          ) : (
            <div className="package-gallery-empty"><MapPin size={30} /> {destination.name}</div>
          )}
          {images.length > 1 && (
            <div className="package-gallery-thumbnails" aria-label="Package photo gallery">
              {images.map((image, index) => (
                <button
                  className={`package-gallery-thumbnail${activeImage === index ? ' is-active' : ''}`}
                  key={image}
                  type="button"
                  aria-label={`Show package photo ${index + 1}`}
                  aria-pressed={activeImage === index}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt="" loading="lazy" onError={() => markImageBroken(image)} />
                </button>
              ))}
            </div>
          )}
          <span className="package-gallery-caption">{destination.name} | {travelPackage.type === 'international' ? 'Beyond the familiar' : 'A journey through India'}</span>
        </div>

        <aside className="package-booking-panel">
          <p className="package-detail-eyebrow">{travelPackage.type === 'international' ? 'A passport-worthy escape' : 'A considered India journey'}</p>
          <h1>{travelPackage.title}</h1>
          <div className="package-detail-rating"><Star size={16} fill="currentColor" /> <strong>{Number(travelPackage.rating || 0).toFixed(1)}</strong><span>Traveler rating</span></div>
          <div className="package-detail-facts">
            <span><CalendarDays size={17} /> {travelPackage.duration}</span>
            <span><MapPin size={17} /> {destination.name}</span>
          </div>
          <div className="package-detail-price"><span>Starting from</span><strong>{formatPrice(travelPackage.price)}</strong><small>per person | final price confirmed with your dates</small></div>
          <button className="package-quote-button" type="button" onClick={() => setBookingOpen(true)}>
            Book / Request Quote <ArrowRight size={17} />
          </button>
          <p className="package-quote-note"><ShieldCheck size={15} /> No payment required to request a quote.</p>
        </aside>
      </section>

      <nav className="package-detail-nav" aria-label="On this page">
        <a href="#overview">Overview</a>
        <a href="#itinerary">Itinerary</a>
        <a href="#stay-and-travel">Stay & travel</a>
        <a href="#included">Inclusions</a>
        <a href="#reviews">Reviews</a>
      </nav>

      <div className="package-detail-layout">
        <div className="package-detail-content">
          <section className="detail-section" id="overview">
            <p className="package-detail-eyebrow">The feel of the trip</p>
            <h2>Overview</h2>
            <p className="detail-overview">{travelPackage.overview || destination.description || `Discover ${destination.name} with a thoughtfully paced ${travelPackage.duration} journey.`}</p>
          </section>

          <section className="detail-section" id="itinerary">
            <p className="package-detail-eyebrow">Day by day</p>
            <h2>Your itinerary</h2>
            <div className="itinerary-list">
              {itinerary.map((day) => (
                <article className="itinerary-day" key={day.day}>
                  <span className="itinerary-day-number">{String(day.day).padStart(2, '0')}</span>
                  <div><span className="itinerary-day-label">Day {day.day}</span><h3>{day.title}</h3><p>{day.description}</p></div>
                </article>
              ))}
              {itinerary.length === 0 && <p className="detail-muted">A custom day-by-day plan will be shared with your quote.</p>}
            </div>
          </section>

          <section className="detail-section" id="stay-and-travel">
            <p className="package-detail-eyebrow">The practical details</p>
            <h2>Stay & travel</h2>
            <div className="detail-info-grid">
              <article className="detail-info-block"><BedDouble size={20} /><div><h3>Hotel details</h3><ul>{(travelPackage.hotels || []).map((hotel) => <li key={hotel}>{hotel}</li>)}</ul></div></article>
              <article className="detail-info-block"><BusFront size={20} /><div><h3>Transportation</h3><p>{travelPackage.transport || 'Transport details will be confirmed with your itinerary.'}</p></div></article>
            </div>
          </section>

          <section className="detail-section" id="included">
            <p className="package-detail-eyebrow">Know what's covered</p>
            <h2>Inclusions & exclusions</h2>
            <div className="detail-info-grid">
              <article className="detail-list-block detail-inclusions"><h3>Included</h3><ul>{inclusions.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></article>
              <article className="detail-list-block detail-exclusions"><h3>Not included</h3><ul>{exclusions.map((item) => <li key={item}>{item}</li>)}</ul></article>
            </div>
          </section>

          <section className="detail-section detail-policy-section" id="important-information">
            <p className="package-detail-eyebrow">Before you go</p>
            <h2>Important information</h2>
            <ul>{importantInformation.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section className="detail-section detail-policy-section" id="cancellation-policy">
            <p className="package-detail-eyebrow">Plans can change</p>
            <h2>Cancellation policy</h2>
            <p>{travelPackage.cancellationPolicy || 'Cancellation terms vary by supplier and are shared with your confirmed quote.'}</p>
          </section>

          <section className="detail-section" id="reviews">
            <p className="package-detail-eyebrow">Notes from the road</p>
            <h2>Traveler reviews</h2>
            <div className="package-review-grid">
              {testimonials.map((testimonial) => (
                <article className="package-review" key={testimonial._id}>
                  <div className="review-stars" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {Array.from({ length: testimonial.rating }, (_, index) => <Star key={index} size={13} fill="currentColor" />)}
                  </div>
                  <p>{testimonial.message}</p>
                  <div className="review-author"><span>{testimonial.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><strong>{testimonial.name}</strong><small>{testimonial.location}</small></div></div>
                </article>
              ))}
              {testimonialError && <div className="section-api-error" role="alert"><p>{testimonialError}</p><button className="text-link" type="button" onClick={() => setTestimonialReloadKey((key) => key + 1)}>Try again</button></div>}
              {!testimonialError && testimonials.length === 0 && <p className="detail-muted">Traveler reviews will appear here.</p>}
            </div>
          </section>
        </div>

        <aside className="package-side-quote">
          <span className="package-side-quote-mark">“</span>
          <p>Good journeys begin with a conversation.</p>
          <button className="package-quote-button" type="button" onClick={() => setBookingOpen(true)}>
            Book / Request Quote <ArrowRight size={17} />
          </button>
          <span className="package-side-quote-caption">Share your dates. We'll take it from there.</span>
        </aside>
      </div>
      <BookingRequestModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} travelPackage={travelPackage} />
    </div>
  )
}

export default PackageDetails