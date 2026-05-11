import React, { useState } from 'react'
import { useTask } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'

const PRIORITY_STYLE = {
  low:    { badge: 'badge badge-green',  dot: '#4ade80' },
  medium: { badge: 'badge badge-amber',  dot: '#fbbf24' },
  high:   { badge: 'badge badge-red',    dot: '#f87171' },
}

const STATUS_STYLE = {
  'todo':        { badge: 'badge badge-zinc',   label: 'To Do' },
  'in-progress': { badge: 'badge badge-indigo', label: 'In Progress' },
  'done':        { badge: 'badge badge-green',  label: 'Done' },
}

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

const TaskCard = ({ task, projectId, onEdit }) => {
  const { deleteTask, updateTask } = useTask()
  const { user } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const [hovered, setHovered] = useState(false)

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    setDeleting(true)
    await deleteTask(projectId, task._id)
    setDeleting(false)
  }

  const cycleStatus = async () => {
    const statuses = ['todo', 'in-progress', 'done']
    const next = statuses[(statuses.indexOf(task.status) + 1) % statuses.length]
    await updateTask(projectId, task._id, { status: next })
  }

  const pStyle = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.medium
  const sStyle = STATUS_STYLE[task.status] || STATUS_STYLE.todo

  return (
    <div
      className="card animate-fade"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        borderColor: hovered ? 'var(--border)' : 'var(--border-subtle)',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.25)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Priority indicator strip */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: pStyle.dot,
        borderRadius: '10px 0 0 10px',
        opacity: 0.8,
      }} />

      <div style={{ paddingLeft: 8 }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2" style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, flex: 1, minWidth: 0 }}>
            {task.title}
          </h3>
          <div className="flex gap-1" style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
            <button
              id={`edit-${task._id}`}
              className="btn-icon btn-sm"
              onClick={() => onEdit(task)}
              title="Edit task"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              id={`delete-${task._id}`}
              className="btn-icon btn-sm"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete task"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
            >
              {deleting
                ? <span className="spinner" style={{ width: 13, height: 13 }} />
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
              }
            </button>
          </div>
        </div>

        {task.description && (
          <p style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.5, marginBottom: 6,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {task.description}
          </p>
        )}

        {/* Footer: badges + assignee */}
        <div className="flex items-center flex-wrap gap-2" style={{ marginTop: 8 }}>
          <span className={pStyle.badge}>{task.priority}</span>
          <button
            id={`status-${task._id}`}
            className={sStyle.badge}
            onClick={cycleStatus}
            title="Click to cycle status"
            style={{ cursor: 'pointer', border: 'inherit', background: 'inherit', font: 'inherit', letterSpacing: 'inherit' }}
          >
            {sStyle.label}
          </button>

          {task.dueDate && (
            <span style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: isOverdue ? 'var(--danger)' : 'var(--muted2)',
              fontWeight: isOverdue ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              {isOverdue && '⚠ '}
              {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}

          {task.assignedTo && (
            <span
              className="avatar avatar-sm"
              title={`Assigned to: ${task.assignedTo.name}`}
              style={{ marginLeft: task.dueDate ? 0 : 'auto' }}
            >
              {getInitials(task.assignedTo.name)}
            </span>
          )}
        </div>

        {/* Project badge (for dashboard view) */}
        {task.project?.name && (
          <div style={{ marginTop: 6 }}>
            <span className="badge badge-violet" style={{ fontSize: 10 }}>
              {task.project.name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard
