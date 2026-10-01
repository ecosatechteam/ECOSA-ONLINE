import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetAdminPassword } from '../services/mockService'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!token) return setError('This reset link is missing its token.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirmation) return setError('Passwords do not match.')

    setBusy(true)
    try {
      await resetAdminPassword(token, password)
      navigate('/admin/login', { replace: true, state: { message: 'Password reset successfully. You can now log in.' } })
    } catch {
      setError('This reset link is invalid or expired.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-stack" style={{ maxWidth: 560, margin: '48px auto' }}>
      <section className="card">
        <span className="eyebrow">ECOSA administration</span>
        <h1 style={{ margin: '10px 0 8px' }}>Choose a new password</h1>
        <p className="muted" style={{ lineHeight: 1.7 }}>Use a password with at least 8 characters.</p>
        <form onSubmit={submit} className="dashboard-form">
          <label htmlFor="new-password">New password</label>
          <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
          <label htmlFor="confirm-password">Confirm password</label>
          <input id="confirm-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} />
          {error && <div role="alert" style={{ color: '#b42318' }}>{error}</div>}
          <div className="actions">
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Reset password'}</button>
            <Link className="btn secondary" to="/admin/login">Cancel</Link>
          </div>
        </form>
      </section>
    </div>
  )
}
