import { useEffect, useState } from 'react'
import { Compass, LogOut, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const sections = [
  { id: 'inquiries', label: 'Inquiries' },
  { id: 'packages', label: 'Packages' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'testimonials', label: 'Testimonials' },
]

const blankValues = {
  packages: { title: '', overview: '', destination: '', duration: '', price: '', hotels: '', transport: '', inclusions: '', exclusions: '', importantInformation: '', cancellationPolicy: '', itinerary: '[]', rating: '0', images: '', categories: '', type: 'domestic' },
  destinations: { name: '', slug: '', description: '', image: '', startingPrice: '', duration: '', category: '' },
  testimonials: { name: '', location: '', message: '', rating: '5', image: '' },
}

const endpoints = {
  packages: '/admin/packages',
  destinations: '/admin/destinations',
  testimonials: '/admin/testimonials',
}

const inquiryStatuses = ['pending', 'contacted', 'confirmed', 'closed']

function splitList(value) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
}

function toDraft(section, record) {
  const draft = { ...blankValues[section] }
  if (!record) return draft

  if (section === 'packages') {
    return {
      ...record,
      destination: record.destination?._id || record.destination || '',
      hotels: (record.hotels || []).join(', '),
      inclusions: (record.inclusions || []).join(', '),
      exclusions: (record.exclusions || []).join(', '),
      importantInformation: (record.importantInformation || []).join('\n'),
      images: (record.images || []).join('\n'),
      categories: (record.categories || []).join(', '),
      itinerary: JSON.stringify(record.itinerary || [], null, 2),
    }
  }

  return { ...draft, ...record }
}

function serializeDraft(section, draft) {
  if (section === 'packages') {
    return {
      ...draft,
      price: Number(draft.price),
      rating: Number(draft.rating || 0),
      hotels: splitList(draft.hotels),
      inclusions: splitList(draft.inclusions),
      exclusions: splitList(draft.exclusions),
      importantInformation: splitList(draft.importantInformation),
      images: splitList(draft.images),
      categories: splitList(draft.categories),
      itinerary: JSON.parse(draft.itinerary || '[]'),
    }
  }

  if (section === 'destinations') return { ...draft, startingPrice: Number(draft.startingPrice) }
  return { ...draft, rating: Number(draft.rating) }
}

function AdminDashboard() {
  useDocumentTitle('Admin Workspace', 'Manage Wanderlust Travels inquiries, packages, destinations, and testimonials.', 'noindex,nofollow')
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('inquiries')
  const [admin, setAdmin] = useState(null)
  const [records, setRecords] = useState({ inquiries: [], packages: [], destinations: [], testimonials: [] })
  const [destinationOptions, setDestinationOptions] = useState([])
  const [editor, setEditor] = useState(null)
  const [draft, setDraft] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true
    Promise.all([
      api.get('/admin/me'),
      api.get('/admin/inquiries'),
      api.get('/admin/packages'),
      api.get('/admin/destinations'),
      api.get('/admin/testimonials'),
    ]).then(([adminResponse, inquiryResponse, packageResponse, destinationResponse, testimonialResponse]) => {
      if (!isCurrent) return
      setAdmin(adminResponse.data.user)
      setRecords({
        inquiries: inquiryResponse.data.data,
        packages: packageResponse.data.data,
        destinations: destinationResponse.data.data,
        testimonials: testimonialResponse.data.data,
      })
      setDestinationOptions(destinationResponse.data.data)
    }).catch((requestError) => {
      if (!isCurrent) return
      if ([401, 403].includes(requestError.response?.status)) {
        localStorage.removeItem('adminToken')
        navigate('/admin/login', { replace: true })
        return
      }
      setError(requestError.response?.data?.error || 'The admin workspace could not be loaded.')
    }).finally(() => {
      if (isCurrent) setIsLoading(false)
    })

    return () => { isCurrent = false }
  }, [navigate, reloadKey])

  function retryWorkspace() {
    setError('')
    setIsLoading(true)
    setReloadKey((key) => key + 1)
  }

  function openEditor(section, record = null) {
    setError('')
    setNotice('')
    setDraft(toDraft(section, record))
    setEditor({ section, id: record?._id || null })
  }

  function updateDraft(event) {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  async function saveRecord(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSaving(true)

    try {
      const payload = serializeDraft(editor.section, draft)
      const url = editor.id ? `${endpoints[editor.section]}/${editor.id}` : endpoints[editor.section]
      const response = editor.id ? await api.put(url, payload) : await api.post(url, payload)
      const savedRecord = response.data.data
      setRecords((current) => {
        const updated = editor.id
          ? current[editor.section].map((record) => record._id === editor.id ? savedRecord : record)
          : [savedRecord, ...current[editor.section]]
        return { ...current, [editor.section]: updated }
      })
      if (editor.section === 'destinations') {
        setDestinationOptions((current) => editor.id
          ? current.map((record) => record._id === editor.id ? savedRecord : record)
          : [...current, savedRecord])
      }
      setEditor(null)
      setNotice(`${sectionLabel(editor.section).slice(0, -1)} ${editor.id ? 'updated' : 'added'}.`)
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'The changes could not be saved.')
    } finally {
      setIsSaving(false)
    }
  }

  async function removeRecord(section, record) {
    if (!window.confirm(`Delete ${record.title || record.name}? This cannot be undone.`)) return
    setError('')
    setNotice('')
    try {
      await api.delete(`${endpoints[section]}/${record._id}`)
      setRecords((current) => ({ ...current, [section]: current[section].filter((item) => item._id !== record._id) }))
      setNotice('Record deleted.')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'The record could not be deleted.')
    }
  }

  async function updateInquiryStatus(inquiry, status) {
    setError('')
    setNotice('')
    try {
      const { data } = await api.patch(`/admin/inquiries/${inquiry._id}`, { status })
      setRecords((current) => ({
        ...current,
        inquiries: current.inquiries.map((record) => record._id === inquiry._id ? data.data : record),
      }))
      setNotice('Inquiry status updated.')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Inquiry status could not be updated.')
    }
  }

  function signOut() {
    localStorage.removeItem('adminToken')
    navigate('/admin/login', { replace: true })
  }

  if (isLoading) return <main className="admin-dashboard-page"><p className="admin-loading">Loading admin workspace...</p></main>

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <Link className="brand" to="/">
          <span className="brand-mark"><Compass size={20} /></span>
          <span>wanderlust <b>travels</b></span>
        </Link>
        <div className="admin-dashboard-account">
          <span>{admin?.email}</span>
          <button className="admin-signout" type="button" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      </header>

      <div className="admin-dashboard-main">
        <div className="admin-dashboard-title">
          <div><p className="eyebrow">Operations</p><h1>Admin workspace</h1></div>
          <span className="admin-live-indicator">Connected</span>
        </div>

        <nav className="admin-tabs" aria-label="Admin sections" role="tablist">
          {sections.map((section) => (
            <button
              className={`admin-tab${activeSection === section.id ? ' is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeSection === section.id}
              key={section.id}
              onClick={() => { setActiveSection(section.id); setEditor(null); setError(''); setNotice('') }}
            >
              {section.label}<span>{records[section.id].length}</span>
            </button>
          ))}
        </nav>

        {error && <div className="admin-feedback is-error" role="alert"><p>{error}</p><button className="admin-text-button" type="button" onClick={retryWorkspace}>Retry</button></div>}
        {notice && <p className="admin-feedback" role="status">{notice}</p>}

        {activeSection === 'inquiries' && (
          <section className="admin-section" aria-labelledby="inquiries-title">
            <div className="admin-section-heading"><div><p className="eyebrow">Customer requests</p><h2 id="inquiries-title">Inquiries</h2></div></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Traveler</th><th>Destination</th><th>Travel date</th><th>Guests</th><th>Status</th></tr></thead>
                <tbody>{records.inquiries.map((inquiry) => (
                  <tr key={inquiry._id}>
                    <td><strong>{inquiry.name}</strong><small>{inquiry.email} · {inquiry.phone}</small></td>
                    <td>{inquiry.destination?.name || 'Destination unavailable'}{inquiry.packageId?.title && <small>{inquiry.packageId.title}</small>}</td>
                    <td>{new Date(inquiry.travelDate).toLocaleDateString()}</td>
                    <td>{inquiry.travelers}</td>
                    <td><select className={`admin-status-select status-${inquiry.status}`} value={inquiry.status} onChange={(event) => updateInquiryStatus(inquiry, event.target.value)} aria-label={`Status for ${inquiry.name}`}>
                      {inquiryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select></td>
                  </tr>
                ))}</tbody>
              </table>
              {records.inquiries.length === 0 && <p className="admin-empty">No inquiries yet.</p>}
            </div>
          </section>
        )}

        {['packages', 'destinations', 'testimonials'].includes(activeSection) && (
          <section className="admin-section" aria-labelledby={`${activeSection}-title`}>
            <div className="admin-section-heading">
              <div><p className="eyebrow">Public website content</p><h2 id={`${activeSection}-title`}>{sectionLabel(activeSection)}</h2></div>
              {!editor && <button className="admin-primary-button" type="button" onClick={() => openEditor(activeSection)}><Plus size={17} /> Add {singularLabel(activeSection)}</button>}
            </div>

            {editor && <AdminEditor
              editor={editor}
              draft={draft}
              destinations={destinationOptions}
              isSaving={isSaving}
              onChange={updateDraft}
              onCancel={() => setEditor(null)}
              onSubmit={saveRecord}
            />}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr>{tableHeaders(activeSection).map((header) => <th key={header}>{header}</th>)}<th>Actions</th></tr></thead>
                <tbody>{records[activeSection].map((record) => (
                  <tr key={record._id}>
                    {tableCells(activeSection, record)}
                    <td className="admin-row-actions">
                      <button className="admin-icon-button" type="button" title={`Edit ${record.title || record.name}`} aria-label={`Edit ${record.title || record.name}`} onClick={() => openEditor(activeSection, record)}><Pencil size={16} /></button>
                      {activeSection !== 'destinations' && <button className="admin-icon-button is-danger" type="button" title={`Delete ${record.title || record.name}`} aria-label={`Delete ${record.title || record.name}`} onClick={() => removeRecord(activeSection, record)}><Trash2 size={16} /></button>}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
              {records[activeSection].length === 0 && !editor && <p className="admin-empty">No {activeSection} yet.</p>}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function sectionLabel(section) {
  return sections.find((item) => item.id === section)?.label || section
}

function singularLabel(section) {
  return { packages: 'package', destinations: 'destination', testimonials: 'testimonial' }[section]
}

function tableHeaders(section) {
  return {
    packages: ['Package', 'Destination', 'Duration', 'Price', 'Type'],
    destinations: ['Destination', 'Category', 'Duration', 'Starting price'],
    testimonials: ['Traveler', 'Story', 'Rating', 'Location'],
  }[section]
}

function tableCells(section, record) {
  if (section === 'packages') return <>
    <td><strong>{record.title}</strong><small>{record.overview}</small></td>
    <td>{record.destination?.name || 'Destination unavailable'}</td>
    <td>{record.duration}</td>
    <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(record.price)}</td>
    <td>{record.type}</td>
  </>
  if (section === 'destinations') return <>
    <td><strong>{record.name}</strong><small>/{record.slug}</small></td>
    <td>{record.category}</td>
    <td>{record.duration}</td>
    <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(record.startingPrice)}</td>
  </>
  return <>
    <td><strong>{record.name}</strong></td>
    <td className="admin-story-cell">{record.message}</td>
    <td>{record.rating} / 5</td>
    <td>{record.location || '—'}</td>
  </>
}

function AdminEditor({ editor, draft, destinations, isSaving, onChange, onCancel, onSubmit }) {
  const section = editor.section
  const field = (name, label, type = 'text', required = false) => (
    <label className="admin-field" htmlFor={`admin-${name}`} key={name}>{label}
      <input id={`admin-${name}`} name={name} type={type} value={draft[name] ?? ''} onChange={onChange} required={required} min={type === 'number' ? 0 : undefined} />
    </label>
  )
  const textarea = (name, label, rows = 3) => (
    <label className="admin-field admin-field-wide" htmlFor={`admin-${name}`} key={name}>{label}
      <textarea id={`admin-${name}`} name={name} rows={rows} value={draft[name] ?? ''} onChange={onChange} />
    </label>
  )

  return (
    <form className="admin-editor" onSubmit={onSubmit}>
      <div className="admin-editor-heading"><h3>{editor.id ? 'Edit' : 'Add'} {singularLabel(section)}</h3><button className="admin-text-button" type="button" onClick={onCancel}>Cancel</button></div>
      {section === 'packages' && <>
        <div className="admin-form-grid">
          {field('title', 'Title', 'text', true)}
          <label className="admin-field" htmlFor="admin-destination">Destination
            <select id="admin-destination" name="destination" value={draft.destination} onChange={onChange} required>
              <option value="">Choose destination</option>
              {destinations.map((destination) => <option key={destination._id} value={destination._id}>{destination.name}</option>)}
            </select>
          </label>
          {field('duration', 'Duration', 'text', true)}
          {field('price', 'Price (INR)', 'number', true)}
          {field('rating', 'Rating (0-5)', 'number')}
          <label className="admin-field" htmlFor="admin-type">Travel type
            <select id="admin-type" name="type" value={draft.type} onChange={onChange} required><option value="domestic">Domestic</option><option value="international">International</option></select>
          </label>
          {field('transport', 'Transport')}
          {field('categories', 'Categories (comma separated)')}
          {textarea('overview', 'Overview', 3)}
          {textarea('hotels', 'Hotels (comma separated)')}
          {textarea('inclusions', 'Inclusions (comma separated)')}
          {textarea('exclusions', 'Exclusions (comma separated)')}
          {textarea('importantInformation', 'Important information', 3)}
          {textarea('images', 'Image URLs (one per line)', 3)}
          {textarea('cancellationPolicy', 'Cancellation policy', 3)}
          {textarea('itinerary', 'Itinerary (JSON)', 6)}
        </div>
      </>}
      {section === 'destinations' && <div className="admin-form-grid">
        {field('name', 'Name', 'text', true)}
        {field('slug', 'URL slug', 'text', true)}
        {field('category', 'Category', 'text', true)}
        {field('duration', 'Duration', 'text', true)}
        {field('startingPrice', 'Starting price (INR)', 'number', true)}
        {field('image', 'Image URL', 'url', true)}
        {textarea('description', 'Description', 4)}
      </div>}
      {section === 'testimonials' && <div className="admin-form-grid">
        {field('name', 'Traveler name', 'text', true)}
        {field('location', 'Location')}
        {field('rating', 'Rating (1-5)', 'number', true)}
        {field('image', 'Image URL', 'url')}
        {textarea('message', 'Story', 4)}
      </div>}
      <div className="admin-editor-actions">
        <button className="admin-primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save changes'}</button>
        <button className="admin-text-button" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

export default AdminDashboard