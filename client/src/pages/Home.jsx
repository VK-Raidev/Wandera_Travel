import { useEffect, useState } from 'react'
import { ArrowDown, ArrowRight, BadgeCheck, BadgeDollarSign, BedDouble, Check, Compass, Headset, MapPin, MessageSquareText, Plane, Route, SlidersHorizontal, Van } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeaturedDestinations from '../components/FeaturedDestinations'
import FaqSection from '../components/FaqSection'
import TestimonialsSection from '../components/TestimonialsSection'
import TripSearchPanel from '../components/TripSearchPanel'
import TravelGallery from '../components/TravelGallery'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import api from '../services/api'

const travelBenefits = [
  { icon: SlidersHorizontal, title: 'Customized Packages', description: 'Shape the pace, places, and little details around you.' },
  { icon: BadgeDollarSign, title: 'Best Price', description: 'Clear quotes that respect the budget you set.' },
  { icon: BadgeCheck, title: 'Verified Hotels', description: 'Stay options checked for comfort, location, and fit.' },
  { icon: Van, title: 'Reliable Transport', description: 'Well-planned transfers, so the journey feels easy.' },
  { icon: Compass, title: 'Experienced Experts', description: 'Thoughtful advice from people who know the route.' },
  { icon: Headset, title: '24/7 Support', description: 'A real team to help when plans shift along the way.' },
]

const tripSteps = [
  { icon: MessageSquareText, title: 'Tell us what you love', description: 'Share your dates, budget, and the kind of trip you want.' },
  { icon: Route, title: 'We shape the route', description: 'A travel expert builds an itinerary around your priorities.' },
  { icon: BedDouble, title: 'Fine-tune the details', description: 'Choose stays and experiences, then confirm your plan.' },
  { icon: Plane, title: 'Take the trip', description: 'Travel with your plans in place and support close by.' },
]

function Home() {
  const [heroDestination, setHeroDestination] = useState(null)
  useDocumentTitle('Home', 'Browse destinations, thoughtful travel packages, and custom trip ideas with Wanderlust Travels.')

  useEffect(() => {
    let isCurrentRequest = true
    api.get('/destinations')
      .then(({ data: response }) => {
        if (isCurrentRequest) setHeroDestination(Array.isArray(response.data) ? response.data[0] || null : null)
      })
      .catch(() => {})
    return () => { isCurrentRequest = false }
  }, [])

  return (
    <>
      <section className="home-hero">
        {heroDestination?.image && <img className="home-hero-image" src={heroDestination.image} alt="" />}
        <div className="hero-copy">
          <p className="hero-kicker"><MapPin size={15} /> {heroDestination ? `${heroDestination.category} | ${heroDestination.name}` : 'Find your elsewhere'}</p>
          <h1>Wanderlust<br />Travels</h1>
          <p className="hero-description">Journeys with room to breathe, people to meet, and stories worth bringing home.</p>
          <div className="hero-actions">
            <Link className="button button-coral" to="/destinations">Explore journeys <ArrowRight size={17} /></Link>
            <Link className="hero-text-link" to="/custom-trip">Make it your own</Link>
          </div>
        </div>
        <a className="hero-scroll" href="#featured" aria-label="Scroll to featured journeys"><ArrowDown size={17} /></a>
        <span className="hero-caption">{heroDestination ? `Discover ${heroDestination.name}` : 'Journeys shaped around you'}</span>
      </section>

      <TripSearchPanel />

      <section className="content-section featured-section" id="featured">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">A good place to begin</p>
            <h2>Journeys for your kind of curious</h2>
          </div>
          <Link className="quiet-link" to="/destinations">All destinations <ArrowRight size={16} /></Link>
        </div>
        <FeaturedDestinations />
      </section>

      <section className="home-note">
        <div className="note-number">01 <span>/ 03</span></div>
        <p>Go further than the itinerary. Find the small moments that make a place stay with you.</p>
        <Link to="/about" aria-label="Read our story"><ArrowRight size={20} /></Link>
      </section>

      <section className="why-section">
        <div className="why-inner">
          <div className="why-heading">
            <p className="eyebrow">Good people. Thoughtful details.</p>
            <h2>Why travel with us</h2>
            <p>Less time juggling logistics. More room for the parts of a trip that stay with you.</p>
          </div>
          <div className="benefit-grid">
            {travelBenefits.map(({ icon: Icon, title, description }, index) => (
              <article className="benefit-item" key={title}>
                <div className="benefit-icon"><Icon size={21} strokeWidth={1.8} /></div>
                <span className="benefit-index">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="how-inner">
          <div className="how-heading">
            <p className="eyebrow">From first thought to takeoff</p>
            <h2>How it works</h2>
          </div>
          <div className="steps-grid">
            {tripSteps.map(({ icon: Icon, title, description }, index) => (
              <article className="trip-step" key={title}>
                <div className="step-marker"><span>0{index + 1}</span><Icon size={20} strokeWidth={1.8} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <TravelGallery />
      <FaqSection />

      <section className="custom-trip-cta">
        <div className="custom-trip-copy">
          <p className="custom-trip-kicker">Made around you</p>
          <h2>Your Trip.<br />Your Budget.<br /><em>Your Way.</em></h2>
          <p className="custom-trip-description">A good trip starts with what matters to you. We'll help bring the pieces together.</p>
          <ul className="customization-list">
            <li><Check size={14} /> The places you want to see</li>
            <li><Check size={14} /> Your pace and travel dates</li>
            <li><Check size={14} /> Stays, transport, and experiences</li>
            <li><Check size={14} /> A budget that feels right</li>
          </ul>
          <Link className="custom-trip-button" to="/custom-trip">Build My Trip <ArrowRight size={17} /></Link>
        </div>
        <div className="custom-trip-image">
          {heroDestination?.image && <img src={heroDestination.image} alt={`Scenery in ${heroDestination.name}`} loading="lazy" />}
        </div>
      </section>
    </>
  )
}

export default Home