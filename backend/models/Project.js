import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  { _id: false }
)

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [80, 'Project name too long'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
  },
  { timestamps: true }
)

// Helper — check if a userId is a member
projectSchema.methods.getMemberRole = function (userId) {
  const m = this.members.find((m) => m.user.toString() === userId.toString())
  return m ? m.role : null
}

const Project = mongoose.model('Project', projectSchema)
export default Project
