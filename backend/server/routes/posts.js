const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const { addPost: addToStore, listPosts, isDbConnected, upsertPost, removePost } = require('../utils/store')
const authMiddleware = require('../middleware/auth')

function seedPosts() {
  if (listPosts().length > 0) return

  const now = new Date().toISOString()
  addToStore({
    id: `p_${Date.now()}_1`,
    type: 'event',
    author: 'Behangana Keneth',
    title: 'ECOSA Networking Dinner',
    content: 'You\'re invited — ECOSA Networking Dinner. Reconnect and build partnerships. The event will happen on Friday 27th November, 2026. Tickets: UGX 50,000 — register to secure your seat. Venue: SKYz Hotel Naguru.',
    media: '/sample-event1.svg',
    createdAt: now,
    comments: [],
    likes: [],
    shares: 0,
    rsvps: [],
    eventType: 'register',
    actionLabel: 'Register',
    registerUrl: '/payments?purpose=Event+Ticket&amount=50000'
  })
}

router.get('/', async (req, res) => {
  try {
    seedPosts()
    const posts = isDbConnected()
      ? await Post.find({ isPublished: true }).sort({ createdAt: -1 }).catch(() => [])
      : []
    res.json(posts.length ? posts : listPosts())
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected()) {
      const post = { ...req.body, id: req.body.id || `post_${Date.now()}`, createdAt: req.body.createdAt || new Date().toISOString() }
      upsertPost(post)
      return res.status(201).json(post)
    }
    const post = new Post(req.body)
    try {
      await post.save()
    } catch (err) {
      addToStore({ ...req.body, _id: req.body.id || Date.now().toString() })
    }
    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected()) {
      const existing = listPosts().find((item) => String(item.id || item._id) === String(req.params.id))
      if (!existing) return res.status(404).json({ message: 'Post not found' })
      const post = upsertPost({ ...existing, ...req.body, id: req.params.id })
      return res.json(post)
    }
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(post)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update post' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected()) {
      removePost(req.params.id)
      return res.json({ ok: true })
    }
    await Post.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post' })
  }
})

module.exports = router
