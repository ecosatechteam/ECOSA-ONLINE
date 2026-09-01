import React, { useEffect, useState } from 'react'
import { getPosts } from '../services/mockService'
import PostCard from '../components/PostCard'

export default function Community(){
  const [posts,setPosts]=useState<any[]>([])

  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      try{
        const p = await getPosts()
        if(mounted) setPosts(p)
      }catch(e){}
    })()
    return ()=>{ mounted=false }
  },[])

  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">Community</span>
          <h1 style={{ margin: '10px 0 8px' }}>Alumni Updates</h1>
          <p className="muted" style={{ margin: 0, maxWidth: '72ch', lineHeight: 1.8 }}>
            Latest announcements from ECOSA leadership, presented in a clean read-only feed.
          </p>
        </div>
        <div className="hero-metric" style={{ minWidth: 180 }}>
          <strong>{posts.length}</strong>
          <span>Published update{posts.length === 1 ? '' : 's'}</span>
        </div>
      </section>

      <div style={{ display: 'grid', gap: 16 }}>
        {posts.length===0 && <div className="card dashboard-empty">No alumni updates yet — check back later.</div>}
        {posts.map((post:any)=> (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
