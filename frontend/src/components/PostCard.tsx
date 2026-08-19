import React, { useEffect, useState } from 'react'
import { getSession, sharePost, addRsvp } from '../services/mockService'
import { Link } from 'react-router-dom'
import MemberLink from './MemberLink'

function formatTime(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m`
  if (diff < 86400) return `${Math.floor(diff/3600)}h`
  if (diff < 604800) return `${Math.floor(diff/86400)}d`
  return d.toLocaleString()
}

export default function PostCard({post,refresh}:{post:any,refresh?:()=>void}){
  const session = getSession()

  const postRsvps = post.rsvps || []
  const userRsvp = session ? (postRsvps.find((r:any)=>r.user=== (session.name || session.email))?.status) : undefined

  const countRsvp = (s:'interested'|'going') => postRsvps.filter((r:any)=>r.status===s).length

  const media = post.media
  const mediaIsVideo = !!(media && typeof media === 'object' && !Array.isArray(media) && media.kind === 'video') || (typeof media === 'string' && media.startsWith('data:video/'))
  const mediaSrc = typeof media === 'string'
    ? media
    : Array.isArray(media)
      ? undefined
      : media?.data || media?.url || undefined

  const actionLabel = post.type === 'event'
    ? (post.eventType === 'pay' ? 'Pay now' : 'Register')
    : post.type === 'job'
      ? 'Apply now'
      : post.type === 'announcement'
        ? (post.actionLabel || 'Open')
        : post.registerUrl
          ? 'Open'
          : ''

  const actionUrl = post.type === 'job'
    ? (post.applyUrl || post.registerUrl)
    : post.type === 'event' && post.eventType === 'pay'
      ? (post.registerUrl || `/payments?purpose=Event+Ticket&amount=${encodeURIComponent(String(post.amount || 0))}`)
      : post.registerUrl || post.actionUrl

  const tag = (post.type || 'announcement').toString().toUpperCase()

  const handleShare = async ()=>{
    if(!session) return alert('Login to share')
    await sharePost(post.id, session.name || session.email)
    refresh && refresh()
    alert('Post shared to community')
  }

  const setRsvp = async (status:'interested'|'going')=>{
    if(!session) return alert('Login to RSVP')
    await addRsvp(post.id, session.name || session.email, status)
    refresh && refresh()
  }

  return (
    <div className="card" style={{marginBottom:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontWeight:700}}><MemberLink name={post.author} /></div>
          <div style={{color:'#6b7280',fontSize:12}}>{formatTime(post.createdAt)}</div>
        </div>
        <div className="dashboard-chip">{tag}</div>
      </div>
      <div style={{marginTop:8, fontWeight: 400}}>{post.title || post.content || post.body}</div>
      {post.content && <div style={{marginTop:8}}>{post.content}</div>}
      {post.body && post.body !== post.content && <div style={{marginTop:8}}>{post.body}</div>}
      {post.company && <div style={{marginTop:8, color:'#6b7280'}}>Company: {post.company}</div>}
      {media && (
        <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
          {mediaSrc && (
            <div style={{maxWidth:420}}>
              {mediaIsVideo ? <video src={mediaSrc} style={{width:'100%',borderRadius:6}} controls /> : <img src={mediaSrc} style={{width:'100%',borderRadius:6}} alt="post media" />}
            </div>
          )}
          {Array.isArray(post.media) && post.media.length>0 && post.media.map((m:any,idx:number)=> (
            <div key={idx} style={{maxWidth:200}}>
              {m.type && m.type.startsWith && m.type.startsWith('image/') ? <img src={m.data} style={{width:'100%',borderRadius:6}} alt="post media"/> : (m.data ? <video src={m.data} style={{width:'100%'}} controls /> : null)}
            </div>
          ))}
          {typeof post.media === 'object' && !Array.isArray(post.media) && post.media !== null && (
            // single media object with {type,data} or just a url
            (post.media.data || post.media.url) ? (
              <div style={{maxWidth:400}}>
                <img src={post.media.data || post.media.url} style={{width:'100%',borderRadius:6}} alt="post media" />
              </div>
            ) : null
          )}
        </div>
      )}

      <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
        <button className="btn" onClick={()=>setRsvp('interested')}>Interested ({countRsvp('interested')})</button>
        <button className="btn" onClick={()=>setRsvp('going')}>Going ({countRsvp('going')})</button>
        {actionUrl ? (
          actionUrl.startsWith('/') ? (
            <Link className="btn" to={actionUrl}>{actionLabel || 'Open'}</Link>
          ) : (
            <a className="btn" style={{textDecoration:'none'}} href={actionUrl} target="_blank" rel="noreferrer">{actionLabel || 'Open'}</a>
          )
        ) : null}
        <button className="btn" onClick={handleShare}>Share</button>
      </div>

    </div>
  )
}
