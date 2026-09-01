import React, { useEffect, useState } from 'react'
import { getChapters } from '../services/mockService'

export default function Chapters() {
  const [chapters, setChapters] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    getChapters().then((items) => {
      if (mounted) setChapters(items || [])
    }).catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">Alumni Chapters</span>
          <h1 style={{ margin: '10px 0 8px' }}>ECOSA Chapters</h1>
          <p className="muted" style={{ margin: 0, maxWidth: '74ch', lineHeight: 1.8 }}>
            ECOSA Chapters provide opportunities for alumni to network, mentor one another, organize community activities, and support the objectives of the Association.
          </p>
        </div>
      </section>

      <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {chapters.map((chapter) => (
          <article key={chapter.name} className="card feature-card">
            <span className="feature-kicker">{chapter.status || 'Active'}</span>
            <h3>{chapter.name} Chapter</h3>
            <p>{chapter.description}</p>
            <div className="dashboard-list-meta" style={{ marginTop: 12 }}>
              <div><strong>Chairperson:</strong> {chapter.chairperson}</div>
              <div><strong>Members:</strong> {chapter.members}</div>
            </div>
            <button className="btn" disabled style={{ marginTop: 16 }}>
              Coming Soon
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
