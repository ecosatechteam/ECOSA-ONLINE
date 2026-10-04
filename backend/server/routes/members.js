const express = require('express')
const router = express.Router()
const Member = require('../models/Member')
const { upsertMember, listMembers, clone, isDbConnected } = require('../utils/store')
const authMiddleware = require('../middleware/auth')

const defaultMembers = [
  { id: 'EC-001', name: 'Agaba Francis' },
  { id: 'EC-002', name: 'Benard Mugumya' },
  { id: 'EC-003', name: 'Harriet Kyomugisha' },
  { id: 'EC-004', name: 'Kizito Mwebaze' },
  { id: 'EC-005', name: 'Evas Turinawe' },
  { id: 'EC-006', name: 'Henry Tumusiime' },
  { id: 'EC-007', name: 'Keneth Behangana' },
  { id: 'EC-008', name: 'Atuhe Roman' },
  { id: 'EC-009', name: 'Noel Mjitu' },
  { id: 'EC-010', name: 'Nyakarungi Grace' },
  { id: 'EC-011', name: 'Muhwezi Moses' },
  { id: 'EC-012', name: 'Kakuru Benard' },
  { id: 'EC-013', name: 'Africano' },
  { id: 'EC-014', name: 'Dorothy Asiimwe' },
  { id: 'EC-015', name: 'Ndeeba Stephenson' },
  { id: 'EC-016', name: 'Ayebare Sperio Ssalongo' },
  { id: 'EC-017', name: 'Arinda Olivia' },
  { id: 'EC-018', name: 'Joy Ninshaba' }
].map((member) => ({
  ...member,
  membershipNumber: member.id,
  paymentStatus: 'paid',
  isAdmin: ['EC-001', 'EC-002'].includes(member.id)
}))

function seedMembers() {
  if (listMembers().length === 0) {
    defaultMembers.forEach((member) => upsertMember(member))
  }
}

router.get('/', (req, res, next) => {
  if (req.query.all === 'true') return authMiddleware(req, res, next)
  next()
}, async (req, res) => {
  try {
    seedMembers()
    const allMembersRequested = req.query.all === 'true'
    const query = { paymentStatus: 'paid' }
    if (allMembersRequested) {
      delete query.paymentStatus
    }

    const members = isDbConnected()
      ? await Member.find(query).sort({ createdAt: -1 }).catch(() => [])
      : []
    const storedMembers = members.length
      ? members.map((member) => (member.toObject ? member.toObject() : member))
      : allMembersRequested
        ? listMembers()
        : listMembers().filter((member) => member.paymentStatus === 'paid' || member.membershipNumber)
    const storedIds = new Set(storedMembers.map((member) => member.id || member.membershipNumber || String(member._id)))
    const rosterMembers = defaultMembers.filter((member) => !storedIds.has(member.id))
    const result = [...storedMembers, ...rosterMembers]
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch members' })
  }
})

router.post('/register', async (req, res) => {
  try {
    const existing = isDbConnected()
      ? await Member.findOne({ email: req.body.email }).catch(() => null)
      : null
    if (existing) {
      Object.assign(existing, req.body)
      try {
        await existing.save()
      } catch (err) {
        // fall back to memory store
      }
      return res.json(existing)
    }

    const member = new Member(req.body)
    if (!isDbConnected()) {
      return res.status(201).json(upsertMember({ ...req.body, _id: req.body.id || Date.now().toString() }))
    }
    try {
      await member.save()
    } catch (err) {
      return res.status(201).json(upsertMember({ ...req.body, _id: req.body.id || Date.now().toString() }))
    }
    res.status(201).json(member)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create member' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const existing = isDbConnected()
      ? await Member.findOne({ email: req.body.email }).catch(() => null)
      : null
    if (existing) {
      Object.assign(existing, req.body)
      try {
        await existing.save()
      } catch (err) {
        // fall back to memory store
      }
      return res.json(existing)
    }

    const member = new Member(req.body)
    if (!isDbConnected()) {
      return res.status(201).json(upsertMember({ ...req.body, _id: req.body.id || Date.now().toString() }))
    }
    try {
      await member.save()
    } catch (err) {
      return res.status(201).json(upsertMember({ ...req.body, _id: req.body.id || Date.now().toString() }))
    }
    res.status(201).json(member)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update member' })
  }
})

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const memberId = String(req.params.id || '')
    const originalEmail = String(req.body?.originalEmail || '').trim().toLowerCase()
    const updates = req.body?.member || {}
    const name = String(updates.name || '').trim()
    const email = String(updates.email || '').trim().toLowerCase()
    const chapter = String(updates.chapter || '').trim()
    const gender = String(updates.gender || '').trim()
    const phone = String(updates.phone || '').trim()
    const allowedGenders = ['Female', 'Male', 'Other', 'Prefer not to say']

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !chapter || !allowedGenders.includes(gender)) {
      return res.status(400).json({ message: 'Provide a valid name, email, gender, and chapter' })
    }
    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
      return res.status(400).json({ message: 'Provide a valid phone number including its country calling code' })
    }

    const dbConnected = isDbConnected()
    let member = null
    if (dbConnected) {
      if (Member.schema.path('_id').instance === 'ObjectId' && /^[a-f\d]{24}$/i.test(memberId)) {
        member = await Member.findById(memberId)
      }
      if (!member) member = await Member.findOne({ membershipNumber: memberId })
      if (!member && originalEmail) member = await Member.findOne({ email: originalEmail })
    } else {
      member = listMembers().find((item) =>
        String(item.id || item._id || item.membershipNumber || item.email) === memberId
        || (originalEmail && String(item.email || '').toLowerCase() === originalEmail)
      ) || null
    }

    const rosterMember = defaultMembers.find((item) => item.id === memberId)
    if (!member && !rosterMember) return res.status(404).json({ message: 'Member not found' })

    if (dbConnected) {
      const emailOwner = await Member.findOne({ email })
      if (emailOwner && (!member || String(emailOwner._id) !== String(member._id))) {
        return res.status(409).json({ message: 'Another member already uses this email address' })
      }
    } else {
      const emailOwner = listMembers().find((item) =>
        String(item.email || '').toLowerCase() === email && item !== member
      )
      if (emailOwner) return res.status(409).json({ message: 'Another member already uses this email address' })
    }

    const editableFields = {
      name,
      email,
      phone,
      gender,
      chapter,
      yearsAtECI: String(updates.yearsAtECI || ''),
      employment: String(updates.employment || ''),
      hasBusiness: Boolean(updates.hasBusiness),
      businessName: updates.hasBusiness ? String(updates.businessName || '') : '',
      businessDescription: updates.hasBusiness ? String(updates.businessDescription || '') : ''
    }

    if (dbConnected) {
      const record = member || new Member({
        membershipNumber: rosterMember.id,
        paymentStatus: rosterMember.paymentStatus,
        isAdmin: rosterMember.isAdmin
      })
      Object.assign(record, editableFields)
      await record.save()
      return res.json(record)
    }

    const record = { ...(member || rosterMember), ...editableFields }
    upsertMember(record)
    return res.json(record)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update member information' })
  }
})

module.exports = router
