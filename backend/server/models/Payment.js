const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  memberName: { type: String, default: '' },
  email: { type: String, default: '' },
  purpose: { type: String, default: 'Alumni Dues' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'UGX' },
  method: { type: String, default: 'mpesa' },
  recordedBy: { type: String, default: '' },
  phone: { type: String, default: '' },
  txRef: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  gatewayReference: { type: String, default: '' },
  confirmedAt: { type: Date },
  receiptUrl: { type: String, default: '' },
  smsSent: { type: Boolean, default: false },
  whatsappSent: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

module.exports = mongoose.model('Payment', paymentSchema)
