const express = require('express')
const router = express.Router()
const { clone, listResources, upsertResource, removeResource } = require('../utils/store')

const defaultResources = [
  {
    id: 'res_centenary_1',
    name: 'Centenary Bank Account - ECOSA',
    filename: 'centenary-account.txt',
    mime: 'text/plain',
    type: 'bank',
    content: 'data:text/plain;charset=utf-8,' + encodeURIComponent('Centenary Bank\nAccount Name: ECOSA\nAccount Number: 3100111822\nPlease use your membership name as reference.'),
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Agaba Francis'
  }
]

function seedResources() {
  if (listResources().length === 0) {
    defaultResources.forEach((resource) => upsertResource(resource))
  }
}

router.get('/', async (req, res) => {
  try {
    seedResources()
    res.json(clone(listResources()))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resources' })
  }
})

router.post('/', async (req, res) => {
  try {
    const resource = {
      ...req.body,
      id: req.body.id || `res_${Date.now()}`
    }
    upsertResource(resource)
    res.status(201).json(resource)
  } catch (err) {
    res.status(500).json({ message: 'Failed to save resource' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    removeResource(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resource' })
  }
})

module.exports = router