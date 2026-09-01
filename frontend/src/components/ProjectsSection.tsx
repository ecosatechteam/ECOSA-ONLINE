import React, { useEffect, useState } from 'react'
import { getProjects } from '../services/mockService'

type Project = {
  title: string
  description: string
  status: string
  featured?: boolean
}

export default function ProjectsSection({
  onContribute,
  onDonate,
}: {
  onContribute?: () => void
  onDonate?: () => void
}) {
  const [projects, setProjects] = useState<Project[]>([])

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
  const allProjects = projects.length ? projects : featuredProjects

  return (
    <section className="card" style={{ marginTop: 24 }}>
      <h3>Projects</h3>
      <p>Explore featured ongoing work and all current ECOSA projects. Support the cause by contributing your pay or donating directly.</p>

      <div style={{ display: 'grid', gap: 20 }}>
        <div>
          <h4>Featured Ongoing Projects</h4>
          <div style={{ display: 'grid', gap: 12 }}>
            {featuredProjects.map((project) => (
              <div key={project.title} style={{ padding: 14, background: '#fafafa', borderRadius: 12, border: '1px solid rgba(0,0,0,.08)' }}>
                <strong>{project.title}</strong>
                <p style={{ margin: '6px 0 0', color: '#4b5563' }}>{project.description}</p>
                <small style={{ color: '#6b7280' }}>{project.status}</small>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4>All Projects</h4>
          <div style={{ display: 'grid', gap: 12 }}>
            {allProjects.map((project) => (
              <div key={project.title} style={{ padding: 14, background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,.06)' }}>
                <strong>{project.title}</strong>
                <p style={{ margin: '6px 0 0', color: '#4b5563' }}>{project.description}</p>
                <small style={{ color: '#6b7280' }}>{project.status}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn" onClick={onContribute}>
          Contribute your pay
        </button>
        <button type="button" className="btn" onClick={onDonate}>
          Donate
        </button>
      </div>
    </section>
  )
}
