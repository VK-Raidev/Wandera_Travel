import { useState } from 'react'
import { Compass, LockKeyhole } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function AdminLogin() {
  useDocumentTitle('Admin Login', 'Sign in to the Wanderlust Travels administration workspace.', 'noindex,nofollow')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('adminToken', data.token)
      navigate('/admin', { replace: true })
    } catch (requestError) {
      if (requestError.response?.data?.error) {
        setError(requestError.response.data.error)
      } else if (requestError.request) {
        setError('Cannot reach the admin server. Make sure the API is running on port 5000.')
      } else {
        setError('Unable to start sign in. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="admin-login-page">
      <header className="admin-login-header">
        <Link className="brand" to="/">
          <span className="brand-mark"><Compass size={20} /></span>
          <span>wanderlust <b>travels</b></span>
        </Link>
        <span className="admin-access-label"><LockKeyhole size={14} /> Private access</span>
      </header>

      <section className="admin-login-content" aria-labelledby="admin-login-title">
        <div className="admin-login-copy">
          <p className="eyebrow">Wanderlust travels / Admin</p>
          <h1 id="admin-login-title">Good to have you back.</h1>
          <p>Sign in to continue to your workspace.</p>
        </div>

        <div className="admin-login-panel">
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <h2>Admin sign in</h2>
            {error && <p className="admin-login-error" role="alert">{error}</p>}
            <label htmlFor="admin-email">Email address
              <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
            </label>
            <label htmlFor="admin-password">Password
              <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            </label>
            <button className="admin-login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
      <footer className="admin-login-footer"><span>Thoughtful journeys, thoughtfully made.</span><Link to="/">Back to the site</Link></footer>
    </main>
  )
}

export default AdminLogin