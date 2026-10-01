const express = require('express')
const router = express.Router()
const { clone, listLeaders, upsertLeader, removeLeader } = require('../utils/store')
const authMiddleware = require('../middleware/auth')

const defaultLeaders = [
  { id: 'l_chair', name: 'Omuteeganda Adson', role: 'Chair (Interim)', regime: 'current', bio: 'Leads the interim ECOSA executive and oversees administrative coordination.' },
  { id: 'l_secretary', name: 'Agaba Francis', role: 'Secretary (Interim)', regime: 'current', bio: 'Coordinates correspondence, records, and executive follow-up.' },
  { id: 'l_treasurer', name: 'Evas Turinawe', role: 'Treasurer (Interim)', regime: 'current', bio: 'Oversees member finances, payments, and financial reporting.' },
  { id: 'l_outreach', name: 'Benard Mugumya', role: 'Outreach Lead', regime: 'current', bio: 'Connects members, chapters, and external partners across the association.' }
]

function seedLeaders() {
  if (listLeaders().length === 0) {
    defaultLeaders.forEach((leader) => upsertLeader(leader))
  }
}

router.get('/', async (req, res) => {
  try {
    seedLeaders()
    const regime = String(req.query.regime || '').toLowerCase()
    const leaders = clone(listLeaders())
    if (!regime || regime === 'current') {
      return res.json(leaders.filter((leader) => (leader.regime || 'current').toLowerCase() === 'current'))
    }
    return res.json(leaders.filter((leader) => String(leader.regime || '').toLowerCase().includes(regime)))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaders' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const leader = {
      ...req.body,
      id: req.body.id || `leader_${Date.now()}`,
      regime: req.body.regime || 'current'
    }
    upsertLeader(leader)
    res.status(201).json(leader)
  } catch (err) {
    res.status(500).json({ message: 'Failed to save leader' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const leader = {
      ...req.body,
      id: req.params.id,
      regime: req.body.regime || 'current'
    }
    upsertLeader(leader)
    res.json(leader)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update leader' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    removeLeader(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete leader' })
  }
})

module.exports = router
