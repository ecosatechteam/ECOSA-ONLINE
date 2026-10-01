import React, { useEffect, useState } from 'react'
import { getResources } from '../services/mockService'

export default function Resources() {
  const [resources, setResources] = useState<any[]>([])

  useEffect(() => {
    let mounted = true

    getResources()
      .then((items) => {
        if (mounted) setResources(items || [])
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  const expectedDocuments = [
    { type: 'constitution', label: 'Constitution' },
    { type: 'registration', label: 'Registration Certificate' },
    { type: 'bank', label: 'Bank Account Details' },
    { type: 'handover', label: 'Handover Files' },
    { type: 'other', label: 'Other Documents' },
  ]

  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">Resources</span>
          <h1 style={{ margin: '10px 0 8px' }}>Official documents</h1>
          <p className="muted" style={{ margin: 0, maxWidth: '74ch', lineHeight: 1.8 }}>
            Browse legal and handover documents published by the ECOSA administrator.
          </p>
        </div>
      </section>

      <div className="card dashboard-empty">Documents are published from the admin dashboard.</div>

      {resources.length === 0 ? (
        <div className="card dashboard-empty">No documents uploaded yet.</div>
      ) : (
        <div className="page-stack">
          {resources.map((resource) => (
            <article key={resource.id} className="card feature-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span className="feature-kicker">{resource.type}</span>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>{resource.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>
                    Uploaded {new Date(resource.uploadedAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={resource.content} download={resource.filename} className="btn">Download</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
