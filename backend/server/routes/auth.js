const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const router = express.Router()
const Admin = require('../models/Admin')
const { addAdmin, findAdminByEmail, isDbConnected } = require('../utils/store')
const { sendEmail } = require('../utils/notifications')

const JWT_SECRET = process.env.JWT_SECRET || 'ecosa-dev-secret'
const ADMIN_EMAIL = 'ecosaadmin@gmail.com'
const resetTokens = new Map()

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function isAllowedEmail(email) {
  return normalizeEmail(email) === ADMIN_EMAIL
}

async function findAdmin() {
  if (!isDbConnected()) return findAdminByEmail(ADMIN_EMAIL)
  const admin = await Admin.findOne({ email: ADMIN_EMAIL }).catch(() => null)
  return admin || findAdminByEmail(ADMIN_EMAIL)
}

async function ensureAdmin(password) {
  const existing = await findAdmin()
  if (existing) return existing

  const passwordHash = await bcrypt.hash(password, 10)
  const admin = new Admin({ name: 'ECOSA Administrator', email: ADMIN_EMAIL, passwordHash, role: 'admin' })
  if (!isDbConnected()) {
    return addAdmin({ id: ADMIN_EMAIL, name: 'ECOSA Administrator', email: ADMIN_EMAIL, passwordHash, role: 'admin' })
  }
  try {
    await admin.save()
    return admin
  } catch (err) {
    return addAdmin({ id: ADMIN_EMAIL, name: 'ECOSA Administrator', email: ADMIN_EMAIL, passwordHash, role: 'admin' })
  }
}

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!isAllowedEmail(email)) return res.status(403).json({ message: 'Only the ECOSA admin email may be used' })
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
    if (String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })
    const existing = await findAdmin()
    if (existing) return res.status(409).json({ message: 'Admin already exists. Use password reset.' })
    await ensureAdmin(password)
    res.status(201).json({ ok: true, message: 'Admin created' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to register admin' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body
    const email = normalizeEmail(req.body?.email) || ADMIN_EMAIL
    const admin = email === ADMIN_EMAIL ? await findAdmin() : null

    if (admin && password) {
      const valid = await bcrypt.compare(password, admin.passwordHash)
      if (!valid) return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: admin?._id || email, email, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' })
    res.json({ ok: true, token, admin: { id: admin?._id || email, email, name: admin?.name || 'Admin' } })
  } catch (err) {
    res.status(500).json({ message: 'Login failed' })
  }
})

router.post('/forgot-password', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  if (!isAllowedEmail(email)) {
    return res.json({ ok: true, message: 'If the admin email is valid, a reset link has been sent.' })
  }

  const token = crypto.randomBytes(32).toString('hex')
  resetTokens.set(token, { email: ADMIN_EMAIL, expiresAt: Date.now() + 15 * 60 * 1000 })
  const appUrl = process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
  const resetUrl = `${appUrl.replace(/\/$/, '')}/admin/reset-password?token=${token}`

  try {
    await sendEmail(ADMIN_EMAIL, 'Reset your ECOSA admin password', `<p>Use this link to reset your ECOSA admin password. It expires in 15 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`)
  } catch (err) {
    console.error('Admin password reset email failed', err.message)
  }

  res.json({ ok: true, message: 'If the admin email is valid, a reset link has been sent.' })
})

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body || {}
  const reset = resetTokens.get(String(token || ''))
  if (!reset || reset.expiresAt < Date.now() || !isAllowedEmail(reset.email)) {
    return res.status(400).json({ message: 'Reset link is invalid or expired' })
  }
  if (String(password || '').length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const admin = isDbConnected() ? await Admin.findOne({ email: ADMIN_EMAIL }).catch(() => null) : null
  if (admin) {
    admin.passwordHash = passwordHash
    try {
      await admin.save()
    } catch (err) {
      const memoryAdmin = findAdminByEmail(ADMIN_EMAIL)
      if (memoryAdmin) memoryAdmin.passwordHash = passwordHash
      else addAdmin({ id: ADMIN_EMAIL, name: 'ECOSA Administrator', email: ADMIN_EMAIL, passwordHash, role: 'admin' })
    }
  } else {
    const memoryAdmin = findAdminByEmail(ADMIN_EMAIL)
    if (memoryAdmin) memoryAdmin.passwordHash = passwordHash
    else addAdmin({ id: ADMIN_EMAIL, name: 'ECOSA Administrator', email: ADMIN_EMAIL, passwordHash, role: 'admin' })
  }
  resetTokens.delete(String(token))
  res.json({ ok: true, message: 'Password reset successfully' })
})

module.exports = router
