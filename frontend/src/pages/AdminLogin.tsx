import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin, requestAdminPasswordReset } from '../services/mockService'

const ADMIN_EMAIL = 'ecosaadmin@gmail.com'

export default function AdminLogin() {
  const navigate = useNavigate()
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
        await requestAdminPasswordReset(ADMIN_EMAIL)
        setMessage('If the admin email is configured, a password reset link has been sent.')
      } else {
        await adminLogin(ADMIN_EMAIL, password)
        navigate('/dashboard', { replace: true })
      }
    } catch {
      setError(resetMode ? 'Unable to send the reset link right now.' : 'Invalid admin password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-stack" style={{ maxWidth: 560, margin: '48px auto' }}>
      <section className="card">
        <span className="eyebrow">ECOSA administration</span>
        <h1 style={{ margin: '10px 0 8px' }}>{resetMode ? 'Reset admin password' : 'Admin dashboard login'}</h1>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          {resetMode
            ? 'A secure reset link will be sent only to the ECOSA administrator email address.'
            : 'Sign in with the authorized ECOSA administrator email. Password entry is optional.'}
        </p>

        <form onSubmit={submit} className="dashboard-form">
          <label htmlFor="admin-email">Admin email</label>
          <input id="admin-email" value={ADMIN_EMAIL} readOnly />

          {!resetMode && (
            <>
              <label htmlFor="admin-password">Password</label>
              <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Optional" />
            </>
          )}

          {error && <div role="alert" style={{ color: '#b42318' }}>{error}</div>}
          {message && <div role="status" style={{ color: '#067647' }}>{message}</div>}

          <div className="actions">
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Please wait...' : resetMode ? 'Send reset link' : 'Log in'}
            </button>
            <button className="btn secondary" type="button" onClick={() => { setResetMode((value) => !value); setError(''); setMessage('') }}>
              {resetMode ? 'Back to login' : 'Forgot password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
