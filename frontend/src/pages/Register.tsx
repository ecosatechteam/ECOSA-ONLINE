import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerMember } from '../services/mockService'

const START_YEAR = 2002
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i
)

const CHAPTERS = [
  'Kampala',
  'Ibanda',
  'Mbarara',
  'Fort Portal',
  'Gulu',
  'UAE',
  'USA',
  'Jinja',
  'Kabale'
]

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [profession, setProfession] = useState('')
  const [hasBusiness, setHasBusiness] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [chapter, setChapter] = useState('')

  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !chapter) {
      return alert('Please provide your name, email and chapter.')
    }

    const yearsAtECI =
      yearFrom && yearTo
        ? `${yearFrom}-${yearTo}`
        : yearFrom || yearTo || ''

    try {
      await registerMember({
        name,
        email,
        phone,
        chapter,
        yearsAtECI,
        employment: profession,
        hasBusiness,
        businessName: hasBusiness ? businessName : undefined,
        businessDescription: hasBusiness
          ? businessDescription
          : undefined,
      })

      alert(
        'Registered successfully. Your details have been added to the members list.'
      )

      nav('/members')
    } catch (e) {
      alert('Could not register right now. Please try again later.')
    }
  }

  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">Alumni</span>
          <h1 style={{ margin: '10px 0 8px' }}>Register</h1>
          <p className="muted" style={{ margin: 0, maxWidth: '70ch', lineHeight: 1.8 }}>
            Fill in your details below to join the ECOSA alumni directory automatically.
          </p>
        </div>
        <div className="hero-metric" style={{ minWidth: 220 }}>
          <strong>Process</strong>
          <span>Fast and direct alumni registration</span>
        </div>
      </section>

      <div className="card">
      <form onSubmit={submit} className="dashboard-form">
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Years at ECI</label>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#6b7280' }}>
              From
            </label>
            <select
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
            >
              <option value="">Select year</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#6b7280' }}>
              To
            </label>
            <select
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
            >
              <option value="">Select year</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label>Profession/Career</label>
        <input
          placeholder="e.g. Accountant, Software Engineer"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
        />

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}
        >
          <input
            type="checkbox"
            checked={hasBusiness}
            onChange={(e) => setHasBusiness(e.target.checked)}
          />
          I own a business
        </label>

        {hasBusiness && (
          <div style={{ marginTop: 8 }}>
            <label>Business Name</label>
            <input
              placeholder="e.g. ACME Enterprises"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <label>What does your business do?</label>
            <input
              placeholder="e.g. Retail and wholesale of electronics"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
            />
          </div>
        )}

        <label style={{ marginTop: 16 }}>Chapter</label>
        <select
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          required
        >
          <option value="">Select your chapter</option>
          {CHAPTERS.map((ch) => (
            <option key={ch} value={ch}>
              {ch}
            </option>
          ))}
        </select>

        <div className="actions">
          <button className="btn" type="submit">
            Submit Registration
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}
