import { useEffect, useState } from 'react'
import DestinationCard from './DestinationCard'
import LoadingPlaceholder from './LoadingPlaceholder'
import api from '../services/api'

function FeaturedDestinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true

    Promise.all([api.get('/destinations'), api.get('/packages')])
      .then(([destinationResponse, packageResponse]) => {
        if (isCurrentRequest) {
          const packages = Array.isArray(packageResponse.data.data) ? packageResponse.data.data : []
          const packageByDestination = new Map()
          packages.forEach((travelPackage) => {
            const destinationId = travelPackage.destination?._id
            if (destinationId && !packageByDestination.has(destinationId)) packageByDestination.set(destinationId, travelPackage)
          })
          const results = Array.isArray(destinationResponse.data.data) ? destinationResponse.data.data : []
          setDestinations(results.slice(0, 3).map((destination) => ({
            ...destination,
            featuredPackage: packageByDestination.get(destination._id),
          })))
        }
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(requestError.response?.data?.error || 'Featured destinations could not be loaded.')
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

  if (loading) return <LoadingPlaceholder label="Loading featured journeys" />

  if (error) {
    return (
      <div className="featured-error" role="alert">
        <p>{error}</p>
        <button className="text-link" type="button" onClick={retryRequest}>Try again <span aria-hidden="true">→</span></button>
      </div>
    )
  }

  if (destinations.length === 0) return <p className="section-feedback">Featured journeys are coming soon.</p>

  return (
    <div className="destination-grid featured-destination-grid">
      {destinations.map((destination) => <DestinationCard key={destination._id} destination={destination} />)}
    </div>
  )
}

export default FeaturedDestinations