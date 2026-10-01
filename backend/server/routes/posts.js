const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const { addPost: addToStore, listPosts } = require('../utils/store')
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
    const posts = await Post.find({ isPublished: true }).sort({ createdAt: -1 }).catch(() => [])
    res.json(posts.length ? posts : listPosts())
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
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
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(post)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update post' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post' })
  }
})

module.exports = router
