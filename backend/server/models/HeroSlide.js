const mongoose = require('mongoose')

const heroSlideSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  url: { type: String, required: true },
  source: { type: String, enum: ['builtin', 'upload'], default: 'upload' },
  active: { type: Boolean, default: true },
  mime: { type: String, default: '' },
  content: { type: Buffer },
  uploadedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('HeroSlide', heroSlideSchema)
