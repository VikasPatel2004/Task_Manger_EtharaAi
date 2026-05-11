import express from 'express'
import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// @route  POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @route  POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id)

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @route  GET /api/auth/profile
router.get('/profile', protect, (req, res) => {
  res.json(req.user)
})

export default router
