import { useState } from 'react'
import { ArrowRight, BedDouble, BusFront, CalendarDays, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import BookingRequestModal from './BookingRequestModal'
import { formatPrice } from '../utils/formatPrice'

function PackageCard({ travelPackage }) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const destination = travelPackage.destination || {}
  const image = travelPackage.images?.[0] || destination.image
  const inclusions = travelPackage.inclusions || []

  return (
    <>
      <article className="package-card">
        <div className="package-card-image-wrap">
          {image && <img className="package-card-image" src={image} alt={`${destination.name || travelPackage.title} trip`} loading="lazy" />}
          <span className="package-card-duration"><CalendarDays size={14} /> {travelPackage.duration}</span>
          <span className="package-card-rating"><Star size={14} fill="currentColor" /> {Number(travelPackage.rating || 0).toFixed(1)}</span>
        </div>
        <div className="package-card-body">
          <div className="package-card-title-row">
            <div>
              <p className="package-destination-name">{destination.name || 'Destination'}</p>
              <h2>{travelPackage.title}</h2>
            </div>
            <div className="package-price"><span>From</span><strong>{formatPrice(travelPackage.price)}</strong></div>
          </div>

          <div className="package-stay-details">
            <p><BedDouble size={16} /><span>{travelPackage.hotels?.join(', ') || 'Accommodation included'}</span></p>
            <p><BusFront size={16} /><span>{travelPackage.transport || 'Transport included'}</span></p>
          </div>

          <div className="package-inclusions">
            <span className="package-section-label">Included</span>
            <div className="inclusion-list">
              {inclusions.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
              {inclusions.length > 3 && <span>+{inclusions.length - 3} more</span>}
            </div>
          </div>

          <div className="package-card-actions">
            <Link className="package-details-button" to={`/packages/${travelPackage._id}`}>View Details <ArrowRight size={15} /></Link>
            <button className="package-book-button" type="button" onClick={() => setBookingOpen(true)}>Book Now</button>
          </div>
        </div>
      </article>
      <BookingRequestModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} travelPackage={travelPackage} />
    </>
  )
}

export default PackageCard