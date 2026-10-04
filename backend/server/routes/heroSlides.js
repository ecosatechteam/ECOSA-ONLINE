const crypto = require('crypto')
const express = require('express')
const router = express.Router()
const HeroSlide = require('../models/HeroSlide')
const {
  clone,
  isDbConnected,
  listHeroSlides,
  removeHeroSlide,
  upsertHeroSlide
} = require('../utils/store')
const authMiddleware = require('../middleware/auth')

const allowedImageTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif'
}

function hasValidImageSignature(mime, content) {
  if (mime === 'image/jpeg') return content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff
  if (mime === 'image/png') return content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  if (mime === 'image/webp') return content.toString('ascii', 0, 4) === 'RIFF' && content.toString('ascii', 8, 12) === 'WEBP'
  if (mime === 'image/avif') return content.toString('ascii', 4, 8) === 'ftyp' && /avif|avis/.test(content.toString('ascii', 8, 32))
  return false
}

router.get('/', (req, res, next) => {
  if (req.query.includeInactive === 'true') return authMiddleware(req, res, next)
  next()
}, async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    const allSlides = isDbConnected()
      ? await HeroSlide.find().select('-content').sort({ uploadedAt: 1 }).lean()
      : clone(listHeroSlides()).map(({ content, ...slide }) => slide)
    const visibleSlides = includeInactive ? allSlides : allSlides.filter((slide) => slide.active !== false)
    res.json({
      slides: visibleSlides,
      managed: allSlides.length > 0
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch hero photos' })
  }
})

router.post('/defaults', authMiddleware, async (req, res) => {
  try {
    const defaults = Array.isArray(req.body?.slides) ? req.body.slides : []
    const normalized = defaults.map((slide) => {
      const id = String(slide.id || '')
      const name = String(slide.name || '').slice(0, 200)
      let url
      try {
        url = new URL(String(slide.url || ''))
      } catch {
        return null
      }
      if (!/^builtin-[a-z0-9-]+$/.test(id) || !['http:', 'https:'].includes(url.protocol)) return null
      return { id, name, url: url.href, source: 'builtin', active: true }
    })
    if (normalized.some((slide) => !slide) || normalized.length > 50) {
      return res.status(400).json({ message: 'Invalid built-in hero photo list' })
    }

    for (const slide of normalized) {
      if (isDbConnected()) {
        const existing = await HeroSlide.findOne({ id: slide.id })
        if (existing) {
          existing.name = slide.name
          existing.url = slide.url
          await existing.save()
        } else {
          await HeroSlide.create(slide)
        }
      } else {
        const existing = listHeroSlides().find((item) => item.id === slide.id)
        upsertHeroSlide(existing
          ? { ...existing, name: slide.name, url: slide.url, source: 'builtin' }
          : slide)
      }
    }

    const slides = isDbConnected()
      ? await HeroSlide.find().select('-content').sort({ uploadedAt: 1 }).lean()
      : clone(listHeroSlides()).map(({ content, ...slide }) => slide)
    res.json({ slides, managed: slides.length > 0 })
  } catch (err) {
    console.error('Failed to register built-in hero photos:', err)
    res.status(500).json({ message: 'Failed to register built-in hero photos' })
  }
})

router.get('/:id/image', async (req, res) => {
  try {
    const slide = isDbConnected()
      ? await HeroSlide.findOne({ id: req.params.id }).select('mime content').lean()
      : listHeroSlides().find((item) => item.id === req.params.id)
    if (!slide) return res.status(404).json({ message: 'Hero photo not found' })
    if (slide.active === false) return res.status(404).json({ message: 'Hero photo is not active' })
    res.type(slide.mime).set('Cache-Control', 'public, max-age=3600').send(slide.content)
  } catch (err) {
    res.status(500).json({ message: 'Failed to load hero photo' })
  }
})

router.post('/', authMiddleware, express.raw({ type: 'image/*', limit: '5mb' }), async (req, res) => {
  try {
    const mime = String(req.headers['content-type'] || '').split(';')[0].toLowerCase()
    const extension = allowedImageTypes[mime]
    if (!extension || !Buffer.isBuffer(req.body) || !hasValidImageSignature(mime, req.body)) {
      return res.status(400).json({ message: 'Upload a JPEG, PNG, WebP, or AVIF photo' })
    }

    const id = `slide_${crypto.randomUUID()}`
    const encodedName = String(req.headers['x-file-name'] || '')
    let name = encodedName
    try {
      name = decodeURIComponent(encodedName)
    } catch {
      return res.status(400).json({ message: 'Invalid photo filename' })
    }
    const slide = {
      id,
      name: name.slice(0, 200),
      url: `/api/hero-slides/${id}/image`,
      source: 'upload',
      active: true,
      mime,
      content: req.body,
      uploadedAt: new Date().toISOString()
    }

    if (isDbConnected()) {
      await HeroSlide.create(slide)
    } else {
      upsertHeroSlide(slide)
    }

    const { content, ...publicSlide } = slide
    res.status(201).json(publicSlide)
  } catch (err) {
    console.error('Failed to save hero photo:', err)
    res.status(500).json({ message: 'Failed to save hero photo' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const slide = isDbConnected()
      ? await HeroSlide.findOne({ id: req.params.id })
      : listHeroSlides().find((item) => item.id === req.params.id)
    if (!slide) return res.status(404).json({ message: 'Hero photo not found' })

    if (slide.source === 'builtin') {
      slide.active = false
      if (isDbConnected()) await slide.save()
      else upsertHeroSlide(slide)
    } else if (isDbConnected()) {
      await HeroSlide.deleteOne({ id: req.params.id })
    } else {
      removeHeroSlide(req.params.id)
    }
    res.json({ ok: true })
  } catch (err) {
    console.error('Failed to delete hero photo:', err)
    res.status(500).json({ message: 'Failed to delete hero photo' })
  }
})

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    if (typeof req.body?.active !== 'boolean') {
      return res.status(400).json({ message: 'Provide an active boolean value' })
    }
    const slide = isDbConnected()
      ? await HeroSlide.findOne({ id: req.params.id })
      : listHeroSlides().find((item) => item.id === req.params.id)
    if (!slide) return res.status(404).json({ message: 'Hero photo not found' })
    if (slide.source !== 'builtin') {
      return res.status(400).json({ message: 'Uploaded photos must be removed instead of restored' })
    }
    slide.active = req.body.active
    if (isDbConnected()) await slide.save()
    else upsertHeroSlide(slide)
    const { content, ...publicSlide } = slide.toObject ? slide.toObject() : slide
    res.json(publicSlide)
  } catch (err) {
    console.error('Failed to update hero photo:', err)
    res.status(500).json({ message: 'Failed to update hero photo' })
  }
})

module.exports = router
