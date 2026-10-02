import { ArrowUpRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice'

function DestinationCard({ destination }) {
  const packagePath = destination.featuredPackage
    ? `/packages/${destination.featuredPackage._id}`
    : `/destinations?destination=${encodeURIComponent(destination.slug)}`

  return (
    <article className="destination-card">
      <Link
        className="destination-card-image-link"
        to={packagePath}
        aria-label={`View package for ${destination.name}`}
        tabIndex={-1}
      >
        <img
          className="destination-card-image"
          src={destination.image}
          alt={`Scenery in ${destination.name}`}
          loading="lazy"
        />
        <span className="destination-card-category">{destination.category}</span>
      </Link>
      <div className="destination-card-content">
        <div className="destination-card-heading">
          <h2>{destination.name}</h2>
          <span className="destination-price">From {formatPrice(destination.startingPrice)}</span>
        </div>
        <p className="destination-card-description">{destination.description}</p>
        <div className="destination-card-footer">
          <span className="destination-duration"><Clock3 size={15} /> {destination.duration}</span>
          <Link className="destination-view-link" to={packagePath}>
            {destination.featuredPackage ? 'View Package' : 'Explore Destination'} <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default DestinationCard