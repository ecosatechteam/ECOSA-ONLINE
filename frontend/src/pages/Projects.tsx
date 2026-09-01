import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects } from '../services/mockService'

export default function Projects(){
  const navigate = useNavigate()
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getProjects()
        if (mounted) setProjects(data || [])
      } catch (error) {}
    })()
    return () => {
      mounted = false
    }
  }, [])

  const featuredProjects = projects.filter((project) => project.featured)

  return (
    <div>
      <div className="card">
        <h3>Projects</h3>
        <p>Featured and active ECOSA initiatives. Use the buttons below to contribute or donate.</p>
      </div>
      <section className="card" style={{ marginTop: 24 }}>
        <h3>Featured Projects</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {featuredProjects.length === 0 ? (
            <div className="dashboard-empty">No projects published yet.</div>
          ) : featuredProjects.map((project) => (
            <div key={project.id} style={{ padding: 14, background: '#fafafa', borderRadius: 12, border: '1px solid rgba(0,0,0,.08)' }}>
              <strong>{project.title}</strong>
              <p style={{ margin: '6px 0 0', color: '#4b5563' }}>{project.description}</p>
              <small style={{ color: '#6b7280' }}>{project.status}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h3>All Projects</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {projects.length === 0 ? (
            <div className="dashboard-empty">No projects published yet.</div>
          ) : projects.map((project) => (
            <div key={project.id} style={{ padding: 14, background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,.06)' }}>
              <strong>{project.title}</strong>
              <p style={{ margin: '6px 0 0', color: '#4b5563' }}>{project.description}</p>
              <small style={{ color: '#6b7280' }}>{project.status}</small>
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn" onClick={() => navigate('/payments?purpose=Project+Donation')}>
          Contribute your pay
        </button>
        <button type="button" className="btn" onClick={() => navigate('/payments?purpose=Project+Donation')}>
          Donate
        </button>
      </div>
    </div>
  )
}
