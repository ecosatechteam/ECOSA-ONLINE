import React, { useEffect, useState } from 'react'
import { getLeaders } from '../services/mockService'

export default function Leaders(){
  const [leaders,setLeaders]=useState<any[]>([])
  const [regime,setRegime]=useState<string>('current')
  const [search,setSearch]=useState<string>('')
  const [availableRegimes,setAvailableRegimes]=useState<string[]>(['current'])

  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      try{
        const all = await getLeaders()
        if(!mounted) return
        const regs = new Set<string>(['current'])
        all.forEach((l:any)=> regs.add(l.regime||'current'))
        setAvailableRegimes(Array.from(regs))
      }catch(e){}
    })()
    return ()=>{ mounted = false }
  },[])

  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      try{
        const l = await getLeaders(regime)
        if(mounted) setLeaders(l)
      }catch(e){}
    })()
    return ()=>{ mounted = false }
  },[regime])

  const filtered = leaders.filter(l=> l.name.toLowerCase().includes(search.toLowerCase()) || (l.role||'').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">Leadership</span>
          <h1 style={{ margin: '10px 0 8px' }}>ECOSA Leaders</h1>
          <p className="muted" style={{ margin: 0, maxWidth: '70ch', lineHeight: 1.8 }}>
            A clear roster of the association’s leadership, presented in a more polished and readable layout.
          </p>
        </div>

        <div className="section-actions">
          <div>
            <label>Regime</label>
            <select value={regime} onChange={e=>setRegime(e.target.value)}>
              {availableRegimes.map(r=> <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label>Search</label>
            <input placeholder="Search name or role" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {filtered.map(l=> (
          <article key={l.id} className="card feature-card">
            <span className="feature-kicker">{l.regime || 'current'}</span>
            <h3>{l.name}</h3>
            <p style={{ margin: '0 0 10px' }}>{l.role}</p>
            <p>{l.bio}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
