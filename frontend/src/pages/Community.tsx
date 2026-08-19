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
    <div>
      <div className="card">
        <h3>Community Updates</h3>
        <p>Latest announcements from ECOSA administration. This page is read-only; only admins publish updates here.</p>
      </div>

      <div style={{marginTop:12}}>
        {posts.length===0 && <div className="card">No updates yet — check back later.</div>}
        {posts.map((post:any)=> (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
