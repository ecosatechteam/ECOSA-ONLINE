import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminGuestLogin } from '../services/mockService'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      adminGuestLogin()
      navigate('/dashboard', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-stack" style={{ maxWidth: 560, margin: '48px auto' }}>
      <section className="card">
        <span className="eyebrow">ECOSA administration</span>
        <h1 style={{ margin: '10px 0 8px' }}>Dashboard access</h1>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          Open the ECOSA dashboard to review members, payments, chapters, resources, leaders, projects,
          and published updates.
        </p>

        <form onSubmit={submit} className="dashboard-form">
          <div className="actions">
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Opening dashboard...' : 'Log in'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
