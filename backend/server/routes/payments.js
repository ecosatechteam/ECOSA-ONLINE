const express = require('express')
const router = express.Router()
const Payment = require('../models/Payment')
const Member = require('../models/Member')
const { upsertPayment, listPayments, upsertMember, listMembers } = require('../utils/store')
const { generateReceiptPdf, sendSms, sendWhatsApp, sendEmail } = require('../utils/notifications')

function seedPayments() {
  if (listPayments().length > 0) return

  const members = listMembers()
  if (!members.length) return

  const now = new Date().toISOString()
  members.forEach((member) => {
    upsertPayment({
      id: `pay_${member.membershipNumber}`,
      memberId: member.id,
      memberName: member.name,
      amount: 20000,
      currency: 'UGX',
      method: 'bank',
      reference: 'Centenary A/C 3100111822 (ECOSA)',
      paid: true,
      status: 'paid',
      at: now
    })
  })
}

function generateMembershipNumber() {
  const stamp = Date.now().toString().slice(-6)
  return `ECOSA-${stamp}`
}

router.get('/', async (req, res) => {
  try {
    seedPayments()
    const payments = await Payment.find().sort({ createdAt: -1 }).catch(() => [])
    res.json(payments.length ? payments : listPayments())
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' })
  }
})

router.post('/initiate', async (req, res) => {
  try {
    const { member, payment } = req.body

    const newPayment = new Payment({
      memberName: member?.name || '',
      email: (member?.email || '').toLowerCase(),
      purpose: payment?.purpose || 'Membership',
      amount: payment?.amount || 0,
      currency: payment?.currency || 'UGX',
      method: payment?.method || 'mobile',
      phone: payment?.phone || member?.phone || '',
      status: 'pending'
    })

    try {
      await newPayment.save()
    } catch (err) {
      upsertPayment({ ...newPayment.toObject ? newPayment.toObject() : newPayment, _id: newPayment._id || Date.now().toString() })
    }
    res.json({ ok: true, paymentId: newPayment._id })
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate payment' })
  }
})

router.patch('/:id/confirm', async (req, res) => {
  try {
    const now = new Date().toISOString()
    const { reference = '' } = req.body || {}

    const paymentDoc = await Payment.findById(req.params.id).catch(() => null)
    let paymentData = paymentDoc ? (paymentDoc.toObject ? paymentDoc.toObject() : paymentDoc) : listPayments().find((item) => String(item._id || item.id) === String(req.params.id))

    if (!paymentData) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    paymentData = {
      ...paymentData,
      status: 'paid',
      paid: true,
      confirmedAt: now,
      gatewayReference: reference || paymentData.gatewayReference || ''
    }

    if (paymentDoc) {
      Object.assign(paymentDoc, paymentData)
      try {
        await paymentDoc.save()
      } catch (err) {
        upsertPayment(paymentData)
      }
    } else {
      upsertPayment(paymentData)
    }

    let member = null
    if (paymentData.memberId) {
      member = await Member.findById(paymentData.memberId).catch(() => null)
    }

    if (!member && paymentData.email) {
      member = await Member.findOne({ email: String(paymentData.email).toLowerCase() }).catch(() => null)
    }

    if (!member) {
      member = listMembers().find((item) => (item.email || '').toLowerCase() === String(paymentData.email || '').toLowerCase()) || null
    }

    if (!member) {
      member = new Member({
        name: paymentData.memberName || '',
        email: paymentData.email || '',
        phone: paymentData.phone || '',
        paymentStatus: 'paid'
      })
    }

    member.paymentStatus = 'paid'
    if (!member.membershipNumber) {
      member.membershipNumber = generateMembershipNumber()
    }
    member.confirmedAt = now

    try {
      await member.save()
    } catch (err) {
      upsertMember(member.toObject ? member.toObject() : member)
    }

    if (paymentDoc && !paymentData.memberId && member._id) {
      paymentDoc.memberId = member._id
      try {
        await paymentDoc.save()
      } catch (err) {
        upsertPayment({ ...paymentData, memberId: member._id })
      }
    }

    res.json({ ok: true, payment: paymentData, member: member.toObject ? member.toObject() : member })
  } catch (err) {
    res.status(500).json({ message: 'Failed to confirm payment' })
  }
})

router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-flutterwave-signature'] || ''
    const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET || ''
    if (secret && signature && signature !== secret) {
      return res.status(401).json({ message: 'Invalid webhook signature' })
    }

    const { paymentId, status, gatewayReference, txRef, transaction_id } = req.body
    const payment = await Payment.findById(paymentId || txRef).catch(() => null)
    if (!payment) return res.status(404).json({ message: 'Payment not found' })

    payment.status = status === 'successful' || status === 'paid' ? 'paid' : 'failed'
    payment.gatewayReference = gatewayReference || transaction_id || txRef || ''
    try {
      await payment.save()
    } catch (err) {
      upsertPayment(payment)
    }

    let member = null
    if (payment.memberId) {
      member = await Member.findById(payment.memberId).catch(() => null)
    }

    if (!member && payment.status === 'paid') {
      member = await Member.findOne({ email: payment.email }).catch(() => null)
      if (!member) {
        member = new Member({
          name: payment.memberName || '',
          email: payment.email,
          phone: payment.phone || '',
          paymentStatus: 'paid'
        })
      } else {
        member.paymentStatus = 'paid'
      }
      if (!member.membershipNumber) {
        member.membershipNumber = generateMembershipNumber()
      }
      try {
        await member.save()
      } catch (err) {
        upsertMember(member)
      }
      if (!payment.memberId && member._id) {
        payment.memberId = member._id
        try {
          await payment.save()
        } catch (err) {
          upsertPayment(payment)
        }
      }
    }

    if (member) {
      member.paymentStatus = payment.status === 'paid' ? 'paid' : 'failed'
      if (payment.status === 'paid' && !member.membershipNumber) {
        member.membershipNumber = generateMembershipNumber()
      }
      try {
        await member.save()
      } catch (err) {
        upsertMember(member)
      }

      if (payment.status === 'paid') {
        const { filePath, fileName } = generateReceiptPdf(member, payment)
        payment.receiptUrl = `/uploads/${fileName}`
        payment.emailSent = true
        payment.smsSent = true
        payment.whatsappSent = true
        try {
          await payment.save()
        } catch (err) {
          upsertPayment(payment)
        }

        const message = `Your ECOSA payment was successful. Membership number: ${member.membershipNumber}`
        await sendSms(member.phone, message)
        await sendWhatsApp(member.phone, message)
        await sendEmail(member.email, 'ECOSA payment successful', `<p>Thank you for paying. Your membership number is ${member.membershipNumber}</p>`)
      }
    }

    res.json({ ok: true, payment })
  } catch (err) {
    res.status(500).json({ message: 'Webhook processing failed' })
  }
})

module.exports = router
