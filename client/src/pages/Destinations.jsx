import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DestinationCard from '../components/DestinationCard'
import PageFrame from '../components/PageFrame'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import api from '../services/api'

function Destinations() {
  const [searchParams] = useSearchParams()
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [reloadKey, setReloadKey] = useState(0)
  const destination = searchParams.get('destination')
  const date = searchParams.get('date')
  const travelers = searchParams.get('travelers')
  const budget = searchParams.get('budget')
  const hasSearch = Boolean(destination || date || travelers || budget)

  useEffect(() => {
    let isCurrentRequest = true

    Promise.all([api.get('/destinations'), api.get('/packages')])
      .then(([destinationResponse, packageResponse]) => {
        if (!isCurrentRequest) return
        const packages = Array.isArray(packageResponse.data.data) ? packageResponse.data.data : []
        const packageByDestination = new Map()
        packages.forEach((travelPackage) => {
          const destinationId = travelPackage.destination?._id
          if (destinationId && !packageByDestination.has(destinationId)) packageByDestination.set(destinationId, travelPackage)
        })
        const allDestinations = Array.isArray(destinationResponse.data.data) ? destinationResponse.data.data : []
        setDestinations(allDestinations.map((item) => ({ ...item, featuredPackage: packageByDestination.get(item._id) })))
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(requestError.response?.data?.error || 'Destinations could not be loaded. Please try again.')
        }
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [reloadKey])

  const budgetLabels = {
    'under-25000': 'Under INR 25,000',
    '25000-50000': 'INR 25,000 - 50,000',
    '50000-100000': 'INR 50,000 - 1,00,000',
    'over-100000': 'Over INR 1,00,000',
  }
  const destinationLabel = destination
    ? destination.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Anywhere'
  const categories = ['All', ...new Set(destinations.map((item) => item.category).filter(Boolean))]
  const visibleDestinations = destinations.filter((item) => {
    const matchesDestination = !destination || item.slug === destination
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
    const startingPrice = Number(item.startingPrice)
    const matchesBudget = !budget || (budget === 'under-25000' && startingPrice < 25000)
      || (budget === '25000-50000' && startingPrice >= 25000 && startingPrice <= 50000)
      || (budget === '50000-100000' && startingPrice > 50000 && startingPrice <= 100000)
      || (budget === 'over-100000' && startingPrice > 100000)
    return matchesDestination && matchesCategory && matchesBudget
  })

  function retryDestinations() {
    setError('')
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  return (
    <PageFrame
      eyebrow="Pick a direction"
      title="Somewhere is calling."
      description="Browse the places we know and love, then find the kind of trip that fits you."
      loadingLabel="Loading destinations"
    >
      {hasSearch && (
        <div className="search-summary" aria-live="polite">
          <span className="eyebrow">Your trip search</span>
          <strong>{destinationLabel}</strong>
          <span>{date ? new Date(`${date}T00:00:00`).toLocaleDateString() : 'Flexible dates'}</span>
          <span>{travelers || 'Any'} traveler{travelers === '1' ? '' : 's'}</span>
          <span>{budgetLabels[budget] || 'Any budget'}</span>
        </div>
      )}
      <div className="destination-results-heading">
        <p className="destination-count">{loading ? 'Finding places...' : `${visibleDestinations.length} places to explore`}</p>
        <div className="destination-filters" aria-label="Filter destinations by category">
          <span className="filter-label">Category</span>
          {categories.map((category) => (
            <button
              className={`filter-pill${categoryFilter === category ? ' is-selected' : ''}`}
              key={category}
              type="button"
              aria-pressed={categoryFilter === category}
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingPlaceholder label="Loading destinations" />}
      {!loading && error && (
        <div className="destination-message destination-error" role="alert">
          <p>{error}</p>
          <button className="button button-green" type="button" onClick={retryDestinations}>
            Try again
          </button>
        </div>
      )}
      {!loading && !error && visibleDestinations.length > 0 && (
        <div className="destination-grid">
          {visibleDestinations.map((item) => <DestinationCard key={item._id || item.slug} destination={item} />)}
        </div>
      )}
      {!loading && !error && visibleDestinations.length === 0 && (
        <div className="destination-message" role="status">
          <p>No destinations match this selection.</p>
          <button className="text-link" type="button" onClick={() => setCategoryFilter('All')}>
            Clear category filter
          </button>
        </div>
      )}
    </PageFrame>
  )
}

export default Destinations