import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const budgetOptions = [
  ['', 'Any budget'],
  ['under-25000', 'Under INR 25,000'],
  ['25000-50000', 'INR 25,000 - 50,000'],
  ['50000-100000', 'INR 50,000 - 1,00,000'],
  ['over-100000', 'Over INR 1,00,000'],
]

function TripSearchPanel() {
  const navigate = useNavigate()
  const [search, setSearch] = useState({ destination: '', date: '', travelers: '2', budget: '' })
  const [destinations, setDestinations] = useState([])
  const [destinationError, setDestinationError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true
    api.get('/destinations')
      .then(({ data: response }) => {
        if (isCurrentRequest) setDestinations(Array.isArray(response.data) ? response.data : [])
      })
      .catch(() => {
        if (isCurrentRequest) setDestinationError('Destinations could not be loaded. You can still browse all destinations.')
      })
    return () => { isCurrentRequest = false }
  }, [reloadKey])

  function retryDestinations() {
    setDestinationError('')
    setReloadKey((key) => key + 1)
  }

  function updateSearch(event) {
    const { name, value } = event.target
    setSearch((current) => ({ ...current, [name]: value }))
  }

  function submitSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    Object.entries(search).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    navigate({ pathname: '/destinations', search: params.toString() ? `?${params}` : '' })
  }

  return (
    <div className="search-panel-wrap">
      <form className="trip-search" onSubmit={submitSearch} aria-label="Search trips">
        <label className="search-field">
          <span>Destination</span>
          <select name="destination" value={search.destination} onChange={updateSearch}>
            <option value="">Anywhere</option>
            {destinations.map((destination) => <option key={destination._id} value={destination.slug}>{destination.name}</option>)}
          </select>
        </label>
        <label className="search-field">
          <span>Date</span>
          <input type="date" name="date" value={search.date} onChange={updateSearch} />
        </label>
        <label className="search-field">
          <span>Travelers</span>
          <input type="number" name="travelers" min="1" max="20" value={search.travelers} onChange={updateSearch} />
        </label>
        <label className="search-field">
          <span>Budget</span>
          <select name="budget" value={search.budget} onChange={updateSearch}>
            {budgetOptions.map(([value, label]) => <option key={value || 'any'} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="search-submit" type="submit"><Search size={17} /> Find a trip</button>
      </form>
      {destinationError && <p className="trip-search-error" role="status">{destinationError} <button type="button" onClick={retryDestinations}>Retry</button></p>}
    </div>
  )
}

export default TripSearchPanel