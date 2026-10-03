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
  { id: 'EC-016', name: 'Ayebare Sperio Ssalongo' }
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

router.get('/', async (req, res) => {
  try {
    seedMembers()
    const query = { paymentStatus: 'paid' }
    if (req.query.all === 'true') {
      delete query.paymentStatus
    }

    const members = isDbConnected()
      ? await Member.find(query).sort({ createdAt: -1 }).catch(() => [])
      : []
    const storedMembers = members.length
      ? members.map((member) => (member.toObject ? member.toObject() : member))
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
    const existing = await Member.findOne({ email: req.body.email }).catch(() => null)
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
    const existing = await Member.findOne({ email: req.body.email }).catch(() => null)
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

module.exports = router
