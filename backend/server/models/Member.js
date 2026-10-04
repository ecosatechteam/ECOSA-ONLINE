const mongoose = require('mongoose')

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  gender: { type: String, default: '' },
  chapter: { type: String, default: '' },
  yearsAtECI: { type: String, default: '' },
  employment: { type: String, default: '' },
  hasBusiness: { type: Boolean, default: false },
  businessName: { type: String, default: '' },
  businessDescription: { type: String, default: '' },
  membershipNumber: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  confirmedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

memberSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

module.exports = mongoose.model('Member', memberSchema)
