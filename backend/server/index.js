require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const authRoute = require('./routes/auth')
const membersRoute = require('./routes/members')
const paymentsRoute = require('./routes/payments')
const postsRoute = require('./routes/posts')
const resourcesRoute = require('./routes/resources')
const chaptersRoute = require('./routes/chapters')
const leadersRoute = require('./routes/leaders')
const projectsRoute = require('./routes/projects')
const authMiddleware = require('./middleware/auth')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'ECOSA backend is running' })
})

app.use('/api/auth', authRoute)
app.use('/api/members', membersRoute)
app.use('/api/payments', paymentsRoute)
app.use('/api/posts', postsRoute)
app.use('/api/resources', resourcesRoute)
app.use('/api/chapters', chaptersRoute)
app.use('/api/leaders', leadersRoute)
app.use('/api/projects', projectsRoute)

app.get('/api/admin/dashboard', authMiddleware, async (req, res) => {
  res.json({ ok: true, user: req.user })
})

async function start() {
  try {
    if (process.env.SKIP_MONGO === 'true') {
      console.warn('MongoDB startup skipped, continuing with in-memory mode')
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
      return
    }

    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecosa'
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    })
    console.log('MongoDB connected')
  } catch (error) {
    console.warn('MongoDB not available, continuing with in-memory mode', error.message)
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start()
