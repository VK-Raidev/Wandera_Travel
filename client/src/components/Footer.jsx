import { ArrowUpRight, Camera, CirclePlay, Compass, Mail, MapPin, Phone, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+91 98765 43210'
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'hello@wanderlust.example'

const socialLinks = [
  { label: 'Instagram', href: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/', icon: Camera },
  { label: 'Facebook', href: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/', icon: UsersRound },
  { label: 'YouTube', href: import.meta.env.VITE_YOUTUBE_URL || 'https://www.youtube.com/', icon: CirclePlay },
]

const legalLinks = [
  { label: 'Privacy', subject: 'Privacy policy' },
  { label: 'Terms', subject: 'Travel terms' },
  { label: 'Cancellations', subject: 'Cancellation policy' },
]

function Footer() {
  const [packageLinks, setPackageLinks] = useState({ domestic: [], international: [] })

  useEffect(() => {
    let isCurrentRequest = true
    api.get('/packages')
      .then(({ data: response }) => {
        if (!isCurrentRequest) return
        const packages = Array.isArray(response.data) ? response.data : []
        const makeLinks = (type) => {
          const seenDestinations = new Set()
          return packages.filter((travelPackage) => {
            const destinationId = travelPackage.destination?._id
            if (travelPackage.type !== type || !destinationId || seenDestinations.has(destinationId)) return false
            seenDestinations.add(destinationId)
            return true
          }).slice(0, 3).map((travelPackage) => ({
            label: travelPackage.destination.name,
            packageId: travelPackage._id,
          }))
        }
        setPackageLinks({ domestic: makeLinks('domestic'), international: makeLinks('international') })
      })
      .catch(() => {
        if (isCurrentRequest) setPackageLinks({ domestic: [], international: [] })
      })
    return () => { isCurrentRequest = false }
  }, [])

  return (
    <footer className="site-footer">
      <div className="footer-main footer-link-grid">
        <div className="footer-brand-block">
          <Link className="footer-brand" to="/">
            <Compass size={22} /> Wanderlust Travels
          </Link>
          <p>Thoughtful trips, shaped around the way you like to travel.</p>
          <Link className="footer-plan-link" to="/custom-trip">Plan a trip <ArrowUpRight size={14} /></Link>
        </div>
        <FooterLinkColumn title="Quick links">
          <Link to="/">Home</Link>
          <Link to="/about">Our story</Link>
          <Link to="/destinations">All destinations</Link>
          <Link to="/custom-trip">Build a custom trip</Link>
          <Link to="/admin/login">Admin login</Link>
        </FooterLinkColumn>
        <FooterLinkColumn title="Domestic">
          {packageLinks.domestic.map((place) => <Link key={place.packageId} to={`/packages/${place.packageId}`}>{place.label}</Link>)}
          <Link to="/domestic">All India trips</Link>
        </FooterLinkColumn>
        <FooterLinkColumn title="International">
          {packageLinks.international.map((place) => <Link key={place.packageId} to={`/packages/${place.packageId}`}>{place.label}</Link>)}
          <Link to="/international">All international</Link>
        </FooterLinkColumn>
        <FooterLinkColumn title="Support">
          <Link to="/#faqs">Frequently asked questions</Link>
          <Link to="/contact">Send an inquiry</Link>
          <Link to="/contact">Trip support</Link>
        </FooterLinkColumn>
      </div>

      <div className="footer-utility-grid">
        <div className="footer-utility-contact">
          <h2>Contact</h2>
          <a href={`tel:${contactPhone.replace(/[^+\d]/g, '')}`}><Phone size={14} /> {contactPhone}</a>
          <a href={`mailto:${contactEmail}`}><Mail size={14} /> {contactEmail}</a>
          <span><MapPin size={14} /> India | Meetings by appointment</span>
        </div>
        <div className="footer-social-column">
          <h2>Social</h2>
          <div className="footer-social-links">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a href={href} key={label} aria-label={label} title={label} target="_blank" rel="noreferrer"><Icon size={17} /></a>
            ))}
          </div>
          <span className="footer-social-note">Follow along for a little inspiration.</span>
        </div>
        <div className="footer-legal-column">
          <h2>Legal</h2>
          <div className="footer-legal-links">
            {legalLinks.map((item) => (
              <a key={item.label} href={`mailto:${contactEmail}?subject=${encodeURIComponent(item.subject)}`}>{item.label}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Copyright {new Date().getFullYear()} Wanderlust Travels</span>
        <span>Travel well. Come back changed.</span>
      </div>
    </footer>
  )
}

function FooterLinkColumn({ title, children }) {
  return (
    <div className="footer-link-column">
      <h2>{title}</h2>
      <div className="footer-links">{children}</div>
    </div>
  )
}

export default Footer