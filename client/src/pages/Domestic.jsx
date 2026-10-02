import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageFrame from '../components/PageFrame'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import PackageCard from '../components/PackageCard'
import api from '../services/api'

function Domestic() {
  const [packages, setPackages] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true

    api.get('/packages', { params: { type: 'domestic' } })
      .then(({ data: response }) => {
        if (isCurrentRequest) setPackages(Array.isArray(response.data) ? response.data : [])
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(requestError.response?.data?.error || 'Packages could not be loaded. Please try again.')
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

  const visiblePackages = packages.filter((travelPackage) => (
    activeFilter === 'All' || travelPackage.categories?.includes(activeFilter)
  ))
  const packageFilters = ['All', ...new Set(packages.flatMap((travelPackage) => travelPackage.categories || []).sort())]

  return (
    <PageFrame
      eyebrow="Closer than you think"
      title="India, at your own pace."
      description="From high mountain air to slow coastal mornings, find a journey that feels like yours."
      loadingLabel="Loading domestic journeys"
    >
      <div className="route-callout">
        <span className="callout-index">01</span>
        <p>Choose your pace, then let the good parts of India unfold around you.</p>
        <Link className="text-link" to="/custom-trip">Plan an India trip <ArrowRight size={16} /></Link>
      </div>
      <section className="packages-section" aria-label="Domestic travel packages">
        <div className="packages-section-heading">
          <div>
            <p className="eyebrow">Made for the way you travel</p>
            <h2>Find your India</h2>
          </div>
          {!loading && !error && <p className="package-result-count">{visiblePackages.length} {visiblePackages.length === 1 ? 'journey' : 'journeys'}</p>}
        </div>

        <div className="package-filter-list" aria-label="Filter packages">
          {packageFilters.map((filter) => (
            <button
              className={`package-filter${activeFilter === filter ? ' is-active' : ''}`}
              key={filter}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading && <LoadingPlaceholder label="Loading domestic packages" />}
        {!loading && error && (
          <div className="destination-message" role="alert">
            <p>{error}</p>
            <button className="button button-green" type="button" onClick={retryPackages}>Try again</button>
          </div>
        )}
        {!loading && !error && visiblePackages.length > 0 && (
          <div className="package-grid">
            {visiblePackages.map((travelPackage) => (
              <PackageCard key={travelPackage._id} travelPackage={travelPackage} />
            ))}
          </div>
        )}
        {!loading && !error && visiblePackages.length === 0 && (
          <div className="destination-message" role="status">
            <p>No packages match this filter.</p>
            <button className="text-link" type="button" onClick={() => setActiveFilter('All')}>Show all packages</button>
          </div>
        )}
      </section>
    </PageFrame>
  )
}

export default Domestic