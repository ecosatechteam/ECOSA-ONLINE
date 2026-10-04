const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const Payment = require('../models/Payment')
const Member = require('../models/Member')
const { upsertPayment, listPayments, upsertMember, listMembers, isDbConnected } = require('../utils/store')
const { generateReceiptPdf, sendSms, sendWhatsApp, sendEmail } = require('../utils/notifications')
const authMiddleware = require('../middleware/auth')

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

function getFlutterwaveSecret() {
  return process.env.FLUTTERWAVE_SECRET_KEY
}

async function callFlutterwave(path, options = {}) {
  const secret = getFlutterwaveSecret()
  if (!secret) {
    const error = new Error('Flutterwave is not configured')
    error.status = 503
    throw error
  }

  let response
  try {
    response = await fetch(`https://api.flutterwave.com/v3${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(15000)
    })
  } catch (cause) {
    const error = new Error('Flutterwave could not be reached')
    error.status = 502
    error.cause = cause
    throw error
  }

  const result = await response.json().catch(() => null)
  if (!response.ok || result?.status !== 'success') {
    const error = new Error('Flutterwave rejected the request')
    error.status = 502
    throw error
  }
  return result.data
}

async function findPaymentByTxRef(txRef) {
  if (!txRef) return null
  if (isDbConnected()) return Payment.findOne({ txRef })
  return listPayments().find((item) => item.txRef === txRef) || null
}

async function persistPayment(payment) {
  if (isDbConnected() && payment.save) {
    await payment.save()
  } else {
    upsertPayment(payment)
  }
}

async function verifyFlutterwaveTransaction(transactionId) {
  if (!/^\d+$/.test(String(transactionId || ''))) {
    const error = new Error('A valid Flutterwave transaction ID is required')
    error.status = 400
    throw error
  }
  return callFlutterwave(`/transactions/${encodeURIComponent(transactionId)}/verify`)
}

function matchesExpectedPayment(transaction, payment) {
  return transaction
    && String(transaction.tx_ref) === String(payment.txRef)
    && String(transaction.currency).toUpperCase() === String(payment.currency).toUpperCase()
    && Number(transaction.amount) >= Number(payment.amount)
}

async function confirmVerifiedPayment(payment, transaction) {
  const alreadyPaid = payment.status === 'paid'
  const now = new Date().toISOString()
  payment.status = 'paid'
  payment.confirmedAt = payment.confirmedAt || now
  payment.gatewayReference = transaction.flw_ref || String(transaction.id)

  let member = null
  if (isDbConnected() && payment.memberId) {
    member = await Member.findById(payment.memberId)
  }
  if (isDbConnected() && !member) {
    member = await Member.findOne({ email: String(payment.email).toLowerCase() })
  }
  if (!member) {
    member = listMembers().find((item) => String(item.email || '').toLowerCase() === String(payment.email || '').toLowerCase()) || null
  }
  if (!member) {
    const memberData = {
      name: payment.memberName || '',
      email: String(payment.email || '').toLowerCase(),
      phone: payment.phone || '',
      paymentStatus: 'paid'
    }
    member = isDbConnected() ? new Member(memberData) : { ...memberData, id: `mem_${Date.now()}` }
  }

  member.paymentStatus = 'paid'
  if (!member.membershipNumber) member.membershipNumber = generateMembershipNumber()
  member.confirmedAt = member.confirmedAt || now
  if (isDbConnected() && member.save) await member.save()
  else upsertMember(member)

  payment.memberId = member._id || member.id
  await persistPayment(payment)
  if (!payment.receiptUrl) {
    try {
      const { fileName } = generateReceiptPdf(member, payment)
      payment.receiptUrl = `/uploads/${fileName}`
      await persistPayment(payment)
    } catch (error) {
      console.error('Could not generate payment receipt:', error.message)
    }
  }

  if (!alreadyPaid) {
    const message = `Your ECOSA payment was successful. Alumni number: ${member.membershipNumber}`
    const notifications = await Promise.allSettled([
      sendSms(member.phone, message),
      sendWhatsApp(member.phone, message),
      sendEmail(member.email, 'ECOSA payment successful', `<p>Thank you for paying. Your membership number is ${member.membershipNumber}</p>`)
    ])
    notifications.forEach((result) => {
      if (result.status === 'rejected') console.error('Payment notification failed:', String(result.reason))
    })
  }
  return { payment, member }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    seedPayments()
    const payments = isDbConnected()
      ? await Payment.find().sort({ createdAt: -1 }).catch(() => [])
      : []
    res.json(payments.length ? payments : listPayments())
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' })
  }
})

router.post('/checkout', async (req, res) => {
  try {
    const member = req.body?.member || {}
    const payment = req.body?.payment || {}
    const amount = Number(payment.amount)
    const email = String(member.email || '').trim().toLowerCase()
    const name = String(member.name || '').trim()
    const phone = String(payment.phone || member.phone || '').trim()
    const method = payment.method

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !Number.isSafeInteger(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Provide a valid name, email, and whole-number UGX amount' })
    }
    if (!['mobile', 'card'].includes(method) || (method === 'mobile' && !/^\+[1-9]\d{7,14}$/.test(phone))) {
      return res.status(400).json({ message: 'Select a supported payment method and provide a phone number for mobile money' })
    }
    if (!getFlutterwaveSecret() || !process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      return res.status(503).json({ message: 'Online payments are not configured. Please contact ECOSA.' })
    }

    const redirectUrl = process.env.FLUTTERWAVE_REDIRECT_URL || process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL
    if (!redirectUrl || !/^https?:\/\//i.test(redirectUrl)) {
      return res.status(503).json({ message: 'Payment return URL is not configured' })
    }

    const txRef = `ecosa-${crypto.randomUUID()}`
    const paymentDoc = new Payment({
      memberName: name,
      email,
      purpose: String(payment.purpose || 'Alumni Dues'),
      amount,
      currency: 'UGX',
      method,
      phone,
      txRef,
      status: 'pending'
    })
    const paymentData = paymentDoc.toObject()
    if (isDbConnected()) await paymentDoc.save()
    else upsertPayment(paymentData)

    const checkout = await callFlutterwave('/payments', {
      method: 'POST',
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency: 'UGX',
        redirect_url: redirectUrl,
        payment_options: method === 'mobile' ? 'mobilemoneyuganda' : 'card',
        customer: { email, name, phonenumber: phone || undefined },
        customizations: { title: 'ECOSA Alumni', description: paymentData.purpose },
        meta: { payment_id: String(paymentDoc._id) }
      })
    })

    if (typeof checkout?.link !== 'string' || !checkout.link.startsWith('https://checkout.flutterwave.com/')) {
      return res.status(502).json({ message: 'Flutterwave did not return a valid checkout link' })
    }
    res.json({ ok: true, paymentId: paymentDoc._id, checkoutUrl: checkout.link })
  } catch (err) {
    console.error('Flutterwave checkout initialization failed:', err.message)
    res.status(err.status || 500).json({
      message: err.status === 502 ? 'Could not start payment checkout. Please try again.' : 'Failed to start payment checkout'
    })
  }
})

router.get('/verify', async (req, res) => {
  try {
    const txRef = String(req.query.tx_ref || '')
    const transactionId = String(req.query.transaction_id || '')
    const payment = await findPaymentByTxRef(txRef)
    if (!payment) return res.status(404).json({ message: 'Payment reference not found' })

    if (payment.status === 'paid') {
      return res.json({ ok: true, status: 'paid' })
    }
    const transaction = await verifyFlutterwaveTransaction(transactionId)
    if (!matchesExpectedPayment(transaction, payment)) {
      return res.status(400).json({ message: 'Payment details could not be verified' })
    }
    if (transaction.status === 'successful') {
      await confirmVerifiedPayment(payment, transaction)
      return res.json({ ok: true, status: 'paid' })
    }
    if (transaction.status === 'failed') {
      payment.status = 'failed'
      await persistPayment(payment)
    }
    res.json({ ok: true, status: payment.status })
  } catch (err) {
    console.error('Flutterwave transaction verification failed:', err.message)
    res.status(err.status || 500).json({ message: err.message || 'Failed to verify payment' })
  }
})

router.post('/initiate', async (req, res) => {
  try {
    const { member, payment } = req.body

    const newPayment = new Payment({
      memberName: member?.name || '',
      email: (member?.email || '').toLowerCase(),
      purpose: payment?.purpose || 'Alumni Dues',
      amount: payment?.amount || 0,
      currency: payment?.currency || 'UGX',
      method: payment?.method || 'mobile',
      phone: payment?.phone || member?.phone || '',
      status: 'pending'
    })

    const paymentData = {
      ...(newPayment.toObject ? newPayment.toObject() : newPayment),
      _id: newPayment._id || Date.now().toString()
    }
    if (isDbConnected()) {
      try {
        await newPayment.save()
      } catch (err) {
        upsertPayment(paymentData)
      }
    } else {
      upsertPayment(paymentData)
    }
    res.json({ ok: true, paymentId: newPayment._id })
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate payment' })
  }
})

router.patch('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const dbConnected = isDbConnected()
    const now = new Date().toISOString()
    const { reference = '' } = req.body || {}

    const paymentDoc = dbConnected ? await Payment.findById(req.params.id).catch(() => null) : null
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
    if (dbConnected && paymentData.memberId) {
      member = await Member.findById(paymentData.memberId).catch(() => null)
    }

    if (dbConnected && !member && paymentData.email) {
      member = await Member.findOne({ email: String(paymentData.email).toLowerCase() }).catch(() => null)
    }

    if (!member) {
      member = listMembers().find((item) => (item.email || '').toLowerCase() === String(paymentData.email || '').toLowerCase()) || null
    }

    if (!member) {
      const memberData = {
        name: paymentData.memberName || '',
        email: paymentData.email || '',
        phone: paymentData.phone || '',
        paymentStatus: 'paid'
      }
      member = dbConnected ? new Member(memberData) : { ...memberData, id: `mem_${Date.now()}` }
    }

    member.paymentStatus = 'paid'
    if (!member.membershipNumber) {
      member.membershipNumber = generateMembershipNumber()
    }
    member.confirmedAt = now

    if (dbConnected && member.save) {
      try {
        await member.save()
      } catch (err) {
        upsertMember(member.toObject ? member.toObject() : member)
      }
    } else {
      upsertMember(member)
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
    const signature = req.headers['verif-hash']
    const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET || ''
    if (!secret) {
      return res.status(503).json({ message: 'Flutterwave webhook verification is not configured' })
    }
    const signatureBuffer = Buffer.from(String(signature || ''))
    const secretBuffer = Buffer.from(secret)
    if (signatureBuffer.length !== secretBuffer.length || !crypto.timingSafeEqual(signatureBuffer, secretBuffer)) {
      return res.status(401).json({ message: 'Invalid webhook signature' })
    }

    const { event, data } = req.body || {}
    if (event !== 'charge.completed' || !data?.id || !data?.tx_ref) {
      return res.status(200).json({ ok: true, ignored: true })
    }
    const payment = await findPaymentByTxRef(String(data.tx_ref))
    if (!payment) return res.status(404).json({ message: 'Payment not found' })

    const transaction = await verifyFlutterwaveTransaction(data.id)
    if (!matchesExpectedPayment(transaction, payment)) {
      return res.status(400).json({ message: 'Payment details could not be verified' })
    }
    if (transaction.status === 'successful') {
      await confirmVerifiedPayment(payment, transaction)
    } else if (transaction.status === 'failed') {
      payment.status = 'failed'
      await persistPayment(payment)
    }

    res.json({ ok: true, payment })
  } catch (err) {
    console.error('Flutterwave webhook processing failed:', err.message)
    res.status(500).json({ message: 'Webhook processing failed' })
  }
})

module.exports = router
