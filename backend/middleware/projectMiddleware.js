import Project from '../models/Project.js'

// Verifies user is a member of the project; attaches req.project + req.memberRole
export const isMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      'members.user',
      'name email'
    )
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const membership = project.members.find(
      (m) => m.user._id.toString() === req.user._id.toString()
    )
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this project' })
    }

    req.project = project
    req.memberRole = membership.role
    next()
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Must come after isMember — verifies the member is an admin
export const isAdmin = (req, res, next) => {
  if (req.memberRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}
