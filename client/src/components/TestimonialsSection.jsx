import { useEffect, useState } from 'react'
import { ArrowRight, Star } from 'lucide-react'
import LoadingPlaceholder from './LoadingPlaceholder'
import api from '../services/api'

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true

    api.get('/testimonials')
      .then(({ data: response }) => {
        if (isCurrentRequest) setTestimonials(Array.isArray(response.data) ? response.data : [])
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(requestError.response?.data?.error || 'Traveler reviews could not be loaded.')
        }
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [reloadKey])

  function retryRequest() {
    setLoading(true)
    setError('')
    setReloadKey((key) => key + 1)
  }

  return (
    <section className="testimonials-section">
      <div className="testimonials-inner">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">Good trips travel home with you</p>
            <h2>Notes from the road</h2>
          </div>
          <span className="reviews-source">Traveler stories</span>
        </div>
        {loading && <LoadingPlaceholder label="Loading traveler reviews" />}
        {!loading && error && (
          <div className="section-api-error" role="alert">
            <p>{error}</p>
            <button className="text-link" type="button" onClick={retryRequest}>Try again <span aria-hidden="true">→</span></button>
          </div>
        )}
        {!loading && !error && testimonials.length > 0 && (
          <div className="testimonials-grid">
            {testimonials.slice(0, 6).map((testimonial) => (
              <article className="testimonial-card" key={testimonial._id}>
                <div className="testimonial-rating" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: Number(testimonial.rating) || 0 }, (_, index) => (
                    <Star key={index} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-message">“{testimonial.message}”</p>
                <div className="testimonial-person">
                  {testimonial.image
                    ? <img src={testimonial.image} alt="" loading="lazy" />
                    : <span className="testimonial-initials">{testimonial.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>}
                  <span><strong>{testimonial.name}</strong><small>{testimonial.location}</small></span>
                  <ArrowRight className="testimonial-arrow" size={15} aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && !error && testimonials.length === 0 && <p className="section-feedback">Traveler stories are on their way.</p>}
      </div>
    </section>
  )
}

export default TestimonialsSection