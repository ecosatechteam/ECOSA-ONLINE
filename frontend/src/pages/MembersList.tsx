import React, { useEffect, useState } from 'react'
import { getMembers } from '../services/mockService'
import MemberCard from '../components/MemberCard'

export default function MembersList(){
  const [members,setMembers]=useState<any[]>([])
  const [query,setQuery]=useState('')
  useEffect(()=>{
    let mounted=true
    getMembers().then(m=>{ if(mounted) setMembers(m) }).catch(()=>{})
    return ()=>{ mounted=false }
  },[])
  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">Directory</span>
          <h1 style={{ margin: '10px 0 8px' }}>Members ({members.length})</h1>
          <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
            Search the members directory and view member profiles in a clean, readable layout.
          </p>
        </div>
        <div className="section-actions">
          <div>
            <label>Search</label>
            <input placeholder="Search members by name" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
        </div>
      </section>

      <div className="page-stack">
        {members.length===0 && <div className="card dashboard-empty">No members yet — invite colleagues to join ECOSA</div>}
        {members.filter(m=> (m.name||'').toLowerCase().includes(query.toLowerCase())).map((m,i)=> <MemberCard key={m.id} member={m} index={i+1} />)}
      </div>
    </div>
  )
}
