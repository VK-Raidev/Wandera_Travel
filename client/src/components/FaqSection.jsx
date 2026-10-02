import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import LoadingPlaceholder from './LoadingPlaceholder'
import api from '../services/api'

function FaqSection() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true

    api.get('/faqs')
      .then(({ data: response }) => {
        if (isCurrentRequest) setFaqs(Array.isArray(response.data) ? response.data : [])
      })
      .catch((requestError) => {
        if (isCurrentRequest) setError(requestError.response?.data?.error || 'Frequently asked questions could not be loaded.')
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
    <section className="faq-section" id="faqs">
      <div className="faq-inner">
        <div className="faq-heading">
          <p className="eyebrow">A few useful details</p>
          <h2>Questions, answered.</h2>
          <p>Good plans start with clear answers. Here are a few things travelers often ask.</p>
        </div>
        <div className="faq-list" aria-label="Frequently asked questions">
          {loading && <LoadingPlaceholder label="Loading frequently asked questions" />}
          {!loading && error && (
            <div className="section-api-error" role="alert">
              <p>{error}</p>
              <button className="text-link" type="button" onClick={retryRequest}>Try again <span aria-hidden="true">→</span></button>
            </div>
          )}
          {!loading && !error && faqs.map((faq, index) => {
            const id = faq._id || `faq-${index}`
            const isOpen = openFaq === id
            return (
              <article className={`faq-item${isOpen ? ' is-open' : ''}`} key={id}>
                <h3>
                  <button
                    className="faq-question"
                    id={`question-${id}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`answer-${id}`}
                    onClick={() => setOpenFaq(isOpen ? null : id)}
                  >
                    <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
                    <span>{faq.question}</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq-answer" id={`answer-${id}`} role="region" aria-labelledby={`question-${id}`} aria-hidden={!isOpen}>
                  <div className="faq-answer-inner"><p>{faq.answer}</p></div>
                </div>
              </article>
            )
          })}
          {!loading && !error && faqs.length === 0 && <p className="section-feedback">There are no FAQs to show yet.</p>}
        </div>
      </div>
    </section>
  )
}

export default FaqSection