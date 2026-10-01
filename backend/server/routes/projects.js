const express = require('express')
const router = express.Router()
const { clone, listProjects, upsertProject, removeProject } = require('../utils/store')
const authMiddleware = require('../middleware/auth')

const defaultProjects = [
  { id: 'proj_sacco', title: 'ECOSA SACCO', description: 'A member-owned savings and credit cooperative helping alumni save, access loans, and build financial security together.', status: 'Ongoing', featured: true },
  { id: 'proj_insurance', title: 'ECOSA Medical Insurance', description: 'Affordable group medical cover for alumni and their families, providing access to quality healthcare when it matters most.', status: 'Ongoing', featured: true },
  { id: 'proj_scholarship', title: 'Alumni Scholarship Fund', description: 'Support current students with tuition, mentorship, and career coaching.', status: 'Ongoing', featured: false },
  { id: 'proj_health', title: 'Community Health Drive', description: 'Fund medical camps, clean water projects and health education for alumni families.', status: 'Ongoing', featured: false },
  { id: 'proj_library', title: 'Library Renovation', description: 'Upgrade the college library with new books, furniture and study spaces.', status: 'Planned', featured: false },
  { id: 'proj_bootcamp', title: 'Entrepreneurship Bootcamp', description: 'Run a skills accelerator for alumni-led startups and small businesses.', status: 'Planned', featured: false },
  { id: 'proj_wellness', title: 'Sports & Wellness Hub', description: 'Create a wellness program and equipment fund for students and alumni.', status: 'Ongoing', featured: false }
]

function seedProjects() {
  if (listProjects().length === 0) {
    defaultProjects.forEach((project) => upsertProject(project))
  }
}

router.get('/', async (req, res) => {
  try {
    seedProjects()
    res.json(clone(listProjects()))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const project = {
      ...req.body,
      id: req.body.id || `proj_${Date.now()}`,
      featured: Boolean(req.body.featured)
    }
    upsertProject(project)
    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ message: 'Failed to save project' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const project = {
      ...req.body,
      id: req.params.id,
      featured: Boolean(req.body.featured)
    }
    upsertProject(project)
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    removeProject(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project' })
  }
})

module.exports = router
