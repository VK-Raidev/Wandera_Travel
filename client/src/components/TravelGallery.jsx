import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Images, X } from 'lucide-react'
import LoadingPlaceholder from './LoadingPlaceholder'
import api from '../services/api'

function TravelGallery() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [activeSrc, setActiveSrc] = useState(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [failedImages, setFailedImages] = useState([])
  const dialogRef = useRef(null)
  const availableImages = destinations
    .filter((destination) => destination.image && !failedImages.includes(destination.image))
    .slice(0, 6)
    .map((destination) => ({
      id: destination._id,
      category: destination.category,
      title: destination.name,
      src: destination.image,
    }))
  const activeImage = availableImages.find((image) => image.src === activeSrc)

  useEffect(() => {
    let isCurrentRequest = true
    api.get('/destinations')
      .then(({ data: response }) => {
        if (isCurrentRequest) setDestinations(Array.isArray(response.data) ? response.data : [])
      })
      .catch((requestError) => {
        if (isCurrentRequest) setError(requestError.response?.data?.error || 'Destination photos could not be loaded.')
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false)
      })
    return () => { isCurrentRequest = false }
  }, [reloadKey])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isLightboxOpen && activeImage && !dialog.open) dialog.showModal()
    if (!isLightboxOpen && dialog.open) dialog.close()
  }, [activeImage, isLightboxOpen])

  function markImageFailed(src) {
    setFailedImages((current) => current.includes(src) ? current : [...current, src])
  }

  function openImage(src) {
    setActiveSrc(src)
    setIsLightboxOpen(true)
  }

  function moveImage(direction) {
    const currentIndex = availableImages.findIndex((image) => image.src === activeSrc)
    const nextIndex = (currentIndex + direction + availableImages.length) % availableImages.length
    setActiveSrc(availableImages[nextIndex]?.src || null)
  }

  function retryGallery() {
    setError('')
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  return (
    <section className="travel-gallery-section">
      <div className="travel-gallery-inner">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">A few ways to get there</p>
            <h2>Places that stay with you</h2>
          </div>
          <span className="gallery-heading-mark"><Images size={18} /> Destination gallery</span>
        </div>
        {loading && <LoadingPlaceholder label="Loading destination photos" />}
        {!loading && error && <div className="section-api-error" role="alert"><p>{error}</p><button className="text-link" type="button" onClick={retryGallery}>Try again</button></div>}
        {!loading && !error && availableImages.length > 0 && <div className={`travel-gallery-grid${availableImages.length < 6 ? ' is-compact' : ''}`}>
          {availableImages.map((image, index) => (
            <button className={`travel-gallery-tile${availableImages.length === 6 ? ` gallery-tile-${index + 1}` : ''}`} key={image.id} type="button" onClick={() => openImage(image.src)}>
              <img src={image.src} alt={image.title} loading="lazy" onError={() => markImageFailed(image.src)} />
              <span className="gallery-tile-shade" />
              <span className="gallery-tile-label">{image.category}</span>
              <span className="gallery-tile-title">{image.title}</span>
            </button>
          ))}
        </div>}
        {!loading && !error && availableImages.length === 0 && <p className="section-feedback">Destination photos will appear here.</p>}
      </div>

      <dialog
        className="travel-lightbox"
        ref={dialogRef}
        aria-label="Travel photo gallery"
        onClose={() => setIsLightboxOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
      >
        {activeImage && (
          <div className="lightbox-content">
            <button className="lightbox-close" type="button" aria-label="Close photo" onClick={() => dialogRef.current?.close()}><X size={20} /></button>
            <button className="lightbox-previous" type="button" aria-label="Previous photo" onClick={() => moveImage(-1)}><ArrowLeft size={20} /></button>
            <img src={activeImage.src} alt={`${activeImage.category}: ${activeImage.title}`} />
            <button className="lightbox-next" type="button" aria-label="Next photo" onClick={() => moveImage(1)}><ArrowRight size={20} /></button>
            <div className="lightbox-caption"><span>{activeImage.category}</span><strong>{activeImage.title}</strong></div>
          </div>
        )}
      </dialog>
    </section>
  )
}

export default TravelGallery