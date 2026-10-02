import { useEffect, useState } from 'react'
import { ArrowDown, Globe2 } from 'lucide-react'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import PackageCard from '../components/PackageCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import api from '../services/api'

function International() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useDocumentTitle('International Trips', 'Explore international travel packages, destination details, and trip options with Wanderlust Travels.')

  useEffect(() => {
    let isCurrentRequest = true

    api.get('/packages', { params: { type: 'international' } })
      .then(({ data: response }) => {
        if (isCurrentRequest) setPackages(Array.isArray(response.data) ? response.data : [])
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(requestError.response?.data?.error || 'International trips could not be loaded. Please try again.')
        }
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [reloadKey])

  function retryPackages() {
    setError('')
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  return (
    <>
      <section className="international-hero">
        {packages[0] && (packages[0].images?.[0] || packages[0].destination?.image) && (
          <img className="international-hero-image" src={packages[0].images?.[0] || packages[0].destination.image} alt="" />
        )}
        <div className="international-hero-shade" />
        <div className="international-hero-inner">
          <p className="international-kicker"><Globe2 size={16} /> Across borders, into the good stuff</p>
          <h1>There is more<br />world <em>out there.</em></h1>
          <p className="international-intro">Island mornings, bright city nights, and the in-between places you didn't know you needed.</p>
          <a className="international-cta" href="#international-packages">
            Explore International Trips <ArrowDown size={17} />
          </a>
        </div>
        <span className="international-photo-note">{packages.length} journeys | One wider world</span>
      </section>

      <section className="international-packages-section" id="international-packages">
        <div className="international-packages-heading">
          <div>
            <p className="international-section-kicker">The world, well considered</p>
            <h2>Choose your next horizon</h2>
          </div>
          {!loading && !error && <span className="international-package-count">{packages.length} curated trips</span>}
        </div>

        {loading && <LoadingPlaceholder label="Loading international trips" />}
        {!loading && error && (
          <div className="destination-message" role="alert">
            <p>{error}</p>
            <button className="button button-green" type="button" onClick={retryPackages}>Try again</button>
          </div>
        )}
        {!loading && !error && packages.length > 0 && (
          <div className="package-grid international-package-grid">
            {packages.map((travelPackage) => (
              <PackageCard key={travelPackage._id} travelPackage={travelPackage} />
            ))}
          </div>
        )}
        {!loading && !error && packages.length === 0 && (
          <div className="destination-message" role="status">
            <p>No international trips are available right now.</p>
          </div>
        )}
      </section>
    </>
  )
}

export default International