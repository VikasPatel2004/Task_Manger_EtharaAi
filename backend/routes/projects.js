import express from 'express'
import User from '../models/User.js'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import { protect } from '../middleware/authMiddleware.js'
import { isMember, isAdmin } from '../middleware/projectMiddleware.js'

const router = express.Router()

// All project routes require authentication
router.use(protect)

// ─────────────────────────────────────────
// GET /api/projects — projects user belongs to
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ updatedAt: -1 })

    // Attach task counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const total = await Task.countDocuments({ project: p._id })
        const done = await Task.countDocuments({ project: p._id, status: 'done' })
        const overdue = await Task.countDocuments({
          project: p._id,
          dueDate: { $lt: new Date() },
          status: { $ne: 'done' },
        })
        return { ...p.toObject(), taskCount: total, doneCount: done, overdueCount: overdue }
      })
    )

    res.json(projectsWithCounts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────
// POST /api/projects — create project (creator becomes admin)
// ─────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ message: 'Project name is required' })

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    })

    const populated = await project.populate('members.user', 'name email')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────
// GET /api/projects/:projectId — project details
// ─────────────────────────────────────────
router.get('/:projectId', isMember, async (req, res) => {
  try {
    res.json({
      ...req.project.toObject(),
      myRole: req.memberRole,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────
// PUT /api/projects/:projectId — update project (admin only)
// ─────────────────────────────────────────
router.put('/:projectId', isMember, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body
    if (name !== undefined) req.project.name = name
    if (description !== undefined) req.project.description = description
    await req.project.save()
    res.json(req.project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────
// DELETE /api/projects/:projectId — delete project (admin only)
// ─────────────────────────────────────────
router.delete('/:projectId', isMember, isAdmin, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.project._id })
    await Project.findByIdAndDelete(req.project._id)
    res.json({ message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────
// POST /api/projects/:projectId/members — add member by email (admin only)
// ─────────────────────────────────────────
router.post('/:projectId/members', isMember, isAdmin, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() })
    if (!userToAdd) {
      return res.status(404).json({ message: 'No account found with that email' })
    }

    const alreadyMember = req.project.members.some(
      (m) => m.user._id.toString() === userToAdd._id.toString()
    )
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' })
    }

    req.project.members.push({ user: userToAdd._id, role })
    await req.project.save()
    const updated = await req.project.populate('members.user', 'name email')
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────
// PATCH /api/projects/:projectId/members/:userId — change member role (admin only)
// ─────────────────────────────────────────
router.patch('/:projectId/members/:userId', isMember, isAdmin, async (req, res) => {
  try {
    const { role } = req.body
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be admin or member' })
    }

    const member = req.project.members.find(
      (m) => m.user._id.toString() === req.params.userId
    )
    if (!member) return res.status(404).json({ message: 'Member not found' })

    member.role = role
    await req.project.save()
    res.json(req.project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────
// DELETE /api/projects/:projectId/members/:userId — remove member (admin only)
// ─────────────────────────────────────────
router.delete('/:projectId/members/:userId', isMember, isAdmin, async (req, res) => {
  try {
    if (req.params.userId === req.project.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove the project owner' })
    }

    req.project.members = req.project.members.filter(
      (m) => m.user._id.toString() !== req.params.userId
    )
    await req.project.save()
    res.json({ message: 'Member removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────────
// TASK ROUTES (scoped to project)
// ─────────────────────────────────────────

// GET /api/projects/:projectId/tasks
router.get('/:projectId/tasks', isMember, async (req, res) => {
  try {
    const filter = { project: req.params.projectId }
    if (req.query.status) filter.status = req.query.status
    if (req.query.priority) filter.priority = req.query.priority
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/projects/:projectId/tasks
router.post('/:projectId/tasks', isMember, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })

    // Validate assignedTo is a project member
    if (assignedTo) {
      const isMem = req.project.members.some(
        (m) => m.user._id.toString() === assignedTo
      )
      if (!isMem) {
        return res.status(400).json({ message: 'Assigned user is not a project member' })
      }
    }

    const task = await Task.create({
      project: req.params.projectId,
      user: req.user._id,
      assignedTo: assignedTo || null,
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
    })

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'user', select: 'name email' },
    ])
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/projects/:projectId/tasks/:taskId
router.put('/:projectId/tasks/:taskId', isMember, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.params.projectId,
    })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const { title, description, status, priority, dueDate, assignedTo } = req.body
    if (title !== undefined) task.title = title
    if (description !== undefined) task.description = description
    if (status !== undefined) task.status = status
    if (priority !== undefined) task.priority = priority
    if (dueDate !== undefined) task.dueDate = dueDate || null
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null

    await task.save()
    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'user', select: 'name email' },
    ])
    res.json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/projects/:projectId/tasks/:taskId
router.delete('/:projectId/tasks/:taskId', isMember, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      project: req.params.projectId,
    })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
