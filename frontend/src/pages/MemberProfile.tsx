import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMembers } from '../services/mockService'

export default function MemberProfile(){
  const { id } = useParams()
  const [member,setMember] = useState<any>(null)

  useEffect(()=>{
    let mounted = true
    if(!id) return
    getMembers().then(list=>{
      if(!mounted) return
      const m = (list||[]).find((x:any)=> x.id === id || x.membershipNumber === id)
      setMember(m)
    }).catch(()=>{})
    return ()=>{ mounted=false }
  },[id])

  if(!member) return <div className="card">Alumnus not found</div>

  const business = member.hasBusiness && member.businessName
    ? `${member.businessName}${member.businessDescription ? ` - ${member.businessDescription}` : ''}`
    : member.business || 'Not provided'

  const details = [
    ['Membership number', member.membershipNumber || member.id],
    ['Phone', member.phone || 'Not provided'],
    ['Email', member.email || 'Not provided'],
    ['Career', member.employment || 'Not provided'],
    ['Business', business],
    ['Years at ECI', member.yearsAtECI || 'Not provided'],
  ]

  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">Alumni profile</span>
          <h1 style={{ margin: '10px 0 8px' }}>{member.name}</h1>
          <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
            Alumni details and contact information for this ECOSA alumnus.
          </p>
        </div>
        <div className="hero-metric">
          <strong>{member.membershipNumber || member.id}</strong>
          <span>Alumni number</span>
        </div>
      </section>

      <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {details.map(([label, value]) => (
          <article key={label} className="card feature-card">
            <span className="feature-kicker">{label}</span>
            <h3>{value}</h3>
          </article>
        ))}
        {member.location && (
          <article className="card feature-card">
            <span className="feature-kicker">Location</span>
            <h3>{member.location}</h3>
          </article>
        )}
      </div>
    </div>
  )
}
