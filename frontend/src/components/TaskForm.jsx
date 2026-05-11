import React, { useState } from 'react'
import { useTask } from '../context/TaskContext'

const PRIORITIES = ['low', 'medium', 'high']
const STATUSES = ['todo', 'in-progress', 'done']

const TaskForm = ({ onClose, editTask = null, projectId, members = [] }) => {
  const { createTask, updateTask } = useTask()
  const [form, setForm] = useState({
    title: editTask?.title || '',
    description: editTask?.description || '',
    priority: editTask?.priority || 'medium',
    status: editTask?.status || 'todo',
    dueDate: editTask?.dueDate ? editTask.dueDate.split('T')[0] : '',
    assignedTo: editTask?.assignedTo?._id || editTask?.assignedTo || '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null }
      if (editTask) {
        await updateTask(projectId, editTask._id, payload)
      } else {
        await createTask(projectId, payload)
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>
            {editTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div>
            <label className="label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              id="task-title"
              name="title"
              className="input"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Design login page"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              id="task-description"
              name="description"
              className="input"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional details..."
              rows={3}
            />
          </div>

          {/* Priority + Status */}
          <div className="grid-2">
            <div>
              <label className="label">Priority</label>
              <select id="task-priority" name="priority" className="input" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select id="task-status" name="status" className="input" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'todo' ? 'To Do' : s === 'in-progress' ? 'In Progress' : 'Done'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Due Date */}
          <div className="grid-2">
            <div>
              <label className="label">Assign To</label>
              <select id="task-assignee" name="assignedTo" className="input" value={form.assignedTo} onChange={handleChange}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                id="task-due-date"
                type="date"
                name="dueDate"
                className="input"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3" style={{ marginTop: 4 }}>
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>
              Cancel
            </button>
            <button id="task-submit-btn" type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
                : editTask ? 'Update Task' : 'Create Task'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm
