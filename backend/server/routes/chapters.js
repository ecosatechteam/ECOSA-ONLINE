const express = require('express')
const router = express.Router()
const { clone, listChapters, upsertChapter, removeChapter } = require('../utils/store')

const defaultChapters = [
  { id: 'chap_kampala', name: 'Kampala', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Kampala Chapter brings together ECOSA members living and working in Kampala and the surrounding areas.' },
  { id: 'chap_ibanda', name: 'Ibanda', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Ibanda Chapter serves members residing in Ibanda District and neighboring areas.' },
  { id: 'chap_mbarara', name: 'Mbarara', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Mbarara Chapter connects alumni living and working in Western Uganda.' },
  { id: 'chap_fort_portal', name: 'Fort Portal', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Fort Portal Chapter promotes networking and collaboration among alumni in the Tooro region.' },
  { id: 'chap_gulu', name: 'Gulu', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Gulu Chapter brings together alumni living in Northern Uganda.' },
  { id: 'chap_jinja', name: 'Jinja', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Jinja Chapter supports alumni in Busoga and Eastern Uganda.' },
  { id: 'chap_kabale', name: 'Kabale', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Kabale Chapter represents alumni living in the Kigezi region.' },
  { id: 'chap_uae', name: 'UAE', chairperson: 'TBA', members: 0, status: 'Planned', description: 'The UAE Chapter brings together ECOSA members living and working in the United Arab Emirates.' },
  { id: 'chap_usa', name: 'USA', chairperson: 'TBA', members: 0, status: 'Planned', description: 'The USA Chapter connects ECOSA members across the United States.' }
]

function seedChapters() {
  if (listChapters().length === 0) {
    defaultChapters.forEach((chapter) => upsertChapter(chapter))
  }
}

router.get('/', async (req, res) => {
  try {
    seedChapters()
    res.json(clone(listChapters()))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chapters' })
  }
})

router.post('/', async (req, res) => {
  try {
    const chapter = {
      ...req.body,
      id: req.body.id || `chap_${Date.now()}`,
      members: Number(req.body.members || 0)
    }
    upsertChapter(chapter)
    res.status(201).json(chapter)
  } catch (err) {
    res.status(500).json({ message: 'Failed to save chapter' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const chapter = {
      ...req.body,
      id: req.params.id,
      members: Number(req.body.members || 0)
    }
    upsertChapter(chapter)
    res.json(chapter)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update chapter' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    removeChapter(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chapter' })
  }
})

module.exports = router