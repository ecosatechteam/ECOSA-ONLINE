import React, { useEffect, useState } from 'react'
import {
  getResources,
  addResource,
  deleteResource,
} from '../services/mockService'

export default function Resources() {
  const [resources, setResources] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState('constitution')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    let mounted = true

    setSession(() => {
      try {
        return JSON.parse(
          localStorage.getItem('ecosa_session') || 'null'
        )
      } catch {
        return null
      }
    })

    getResources()
      .then((items) => {
        if (mounted) setResources(items || [])
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  const isAdmin =
    session?.role === 'admin' ||
    session?.type === 'admin' ||
    session?.isAdmin === true

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()

    if (!isAdmin) {
      alert('Only administrators can upload documents.')
      return
    }

    if (!file) {
      alert('Choose a file')
      return
    }

    const reader = new FileReader()

    reader.onload = async () => {
      const content = reader.result
      const uploaderName =
        session?.name || session?.email || 'Administrator'

      const resource = {
        id: `res_${Date.now()}`,
        name: title || file.name,
        filename: file.name,
        mime: file.type,
        type,
        content,
        uploadedAt: new Date().toISOString(),
        uploadedBy: uploaderName,
      }

      await addResource(resource)
      setResources((prev) => [resource, ...prev])
      setTitle('')
      setType('constitution')
      setFile(null)
    }

    reader.readAsDataURL(file)
  }

  async function handleDelete(id: string) {
    if (!isAdmin) return
    if (!confirm('Delete this document?')) return

    await deleteResource(id)
    setResources((prev) => prev.filter((resource) => resource.id !== id))
  }

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
          <h1 style={{ margin: '10px 0 8px' }}>Official documents and uploads</h1>
          <p className="muted" style={{ margin: 0, maxWidth: '74ch', lineHeight: 1.8 }}>
            Upload legal and handover documents such as the constitution, registration certificate, bank account details and other official files.
          </p>
        </div>
      </section>

      {isAdmin ? (
        <form onSubmit={handleUpload} className="card dashboard-form">
          <label>Document title</label>
          <input
            placeholder="Document title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="section-actions" style={{ marginTop: 12 }}>
            <div>
              <label>Document type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="constitution">Constitution</option>
                <option value="registration">Registration Certificate</option>
                <option value="bank">Bank Account Details</option>
                <option value="handover">Handover Files</option>
                <option value="other">Other Documents</option>
              </select>
            </div>

            <div>
              <label>Upload file</label>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="btn">Upload</button>
          </div>
        </form>
      ) : (
        <div className="card">
          <strong>Documents</strong>
          <p className="muted" style={{ marginTop: 8 }}>
            Upload is restricted to the ECOSA leadership team.
          </p>

          <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 16 }}>
            {expectedDocuments.map((doc) => {
              const found = resources.find((item) => item.type === doc.type)

              return (
                <article key={doc.type} className="card feature-card" style={{ marginBottom: 0 }}>
                  <span className="feature-kicker">{doc.label}</span>
                  <h3>{found ? 'Available' : 'Pending'}</h3>
                  <p>
                    {found
                      ? `Uploaded ${new Date(found.uploadedAt).toLocaleString()}`
                      : 'Not yet uploaded'}
                  </p>
                  {found ? (
                    <a href={found.content} download={found.filename} className="btn">Download</a>
                  ) : (
                    <button className="btn secondary" onClick={() => alert(`${doc.label} has not yet been uploaded.`)}>
                      Not Uploaded
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}

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
                  {isAdmin && (
                    <button className="btn" style={{ background: '#dc2626' }} onClick={() => handleDelete(resource.id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
