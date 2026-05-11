import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import { protect } from './middleware/authMiddleware.js'
import Task from './models/Task.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

// GET /api/tasks/mine — tasks assigned to me across all projects
app.get('/api/tasks/mine', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('user', 'name email')
      .sort({ dueDate: 1, createdAt: -1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }))

// MongoDB connection & start
const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })
