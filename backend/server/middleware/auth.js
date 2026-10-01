const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'ecosa-dev-secret'

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.email || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = authMiddleware
