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
    <div>
      <div className="card">
        <h2>ECOSA Chapters</h2>
        <p>
          ECOSA Chapters provide opportunities for alumni to network,
          mentor one another, organize community activities, and support
          the objectives of the Association.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}
      >
        {chapters.map((chapter) => (
          <div key={chapter.name} className="card">
            <h3>{chapter.name} Chapter</h3>

            <p>{chapter.description}</p>

            <hr />

            <p>
              <strong>Chairperson:</strong> {chapter.chairperson}
            </p>

            <p>
              <strong>Registered Members:</strong> {chapter.members}
            </p>

            <p>
              <strong>Status:</strong> {chapter.status || 'Active'}
            </p>

            <button className="btn" disabled>
              Coming Soon
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
