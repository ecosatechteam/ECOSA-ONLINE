import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminGuestLogin, requestAdminPasswordReset } from '../services/mockService'

const ADMIN_EMAIL = 'ecosaadmin@gmail.com'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      if (resetMode) {
        await requestAdminPasswordReset(email || ADMIN_EMAIL)
        setMessage('If the admin email is configured, a password reset link has been sent.')
      } else {
        adminGuestLogin()
        navigate('/dashboard', { replace: true })
      }
    } catch {
      setError('Unable to send the reset link right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-stack" style={{ maxWidth: 560, margin: '48px auto' }}>
      <section className="card">
        <span className="eyebrow">ECOSA administration</span>
        <h1 style={{ margin: '10px 0 8px' }}>{resetMode ? 'Reset admin password' : 'Dashboard access'}</h1>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          {resetMode
            ? 'Enter the admin email to request a password reset link.'
            : 'Open the ECOSA dashboard to review members, payments, chapters, resources, leaders, projects, and published updates.'}
        </p>

        <form onSubmit={submit} className="dashboard-form">
          <label htmlFor="admin-email">Admin email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter admin email"
          />

          {!resetMode && (
            <>
              <label htmlFor="admin-password">Admin password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
              />
            </>
          )}

          {error && <div role="alert" style={{ color: '#b42318' }}>{error}</div>}
          {message && <div role="status" style={{ color: '#067647' }}>{message}</div>}

          <div className="actions">
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Please wait...' : resetMode ? 'Send reset link' : 'Log in'}
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => { setResetMode((value) => !value); setError(''); setMessage('') }}
            >
              {resetMode ? 'Back to login' : 'Forgot password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
