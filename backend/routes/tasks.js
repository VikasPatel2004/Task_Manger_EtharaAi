import express from 'express'
import Task from '../models/Task.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// All task routes are protected
router.use(protect)

// @route  GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id }
    if (req.query.status) filter.status = req.query.status
    if (req.query.priority) filter.priority = req.query.priority

    const tasks = await Task.find(filter).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @route  POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
    })
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @route  PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const { title, description, status, priority, dueDate } = req.body
    if (title !== undefined) task.title = title
    if (description !== undefined) task.description = description
    if (status !== undefined) task.status = status
    if (priority !== undefined) task.priority = priority
    if (dueDate !== undefined) task.dueDate = dueDate || null

    await task.save()
    res.json(task)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @route  DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
