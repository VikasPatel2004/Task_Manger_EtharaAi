import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

const ProjectCard = ({ project }) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const myMembership = project.members?.find(
    (m) => (m.user._id || m.user) === user?._id
  )
  const myRole = myMembership?.role || 'member'

  const pct = project.taskCount > 0
    ? Math.round((project.doneCount / project.taskCount) * 100)
    : 0

  return (
    <div
      className="card card-glow animate-fade"
      onClick={() => navigate(`/projects/${project._id}`)}
      style={{ padding: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.name}
            </h3>
            <span className={`badge ${myRole === 'admin' ? 'badge-indigo' : 'badge-zinc'}`}>
              {myRole}
            </span>
          </div>
          {project.description && (
            <p style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 11, color: 'var(--muted2)', fontWeight: 500 }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: pct === 100 ? 'var(--success)' : 'var(--muted)' }}>
            {pct}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3" style={{ fontSize: 12 }}>
        <span style={{ color: 'var(--muted2)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{project.taskCount || 0}</span> tasks
        </span>
        {project.overdueCount > 0 && (
          <span style={{ color: 'var(--danger)' }}>
            <span style={{ fontWeight: 600 }}>{project.overdueCount}</span> overdue
          </span>
        )}
        <span style={{ marginLeft: 'auto', color: 'var(--muted2)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{project.doneCount || 0}</span> done
        </span>
      </div>

      {/* Members avatars */}
      <div className="flex items-center gap-2">
        <div style={{ display: 'flex' }}>
          {(project.members || []).slice(0, 5).map((m, i) => (
            <span
              key={m.user._id || i}
              className="avatar avatar-sm"
              title={m.user.name}
              style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid var(--surface)', zIndex: 5 - i }}
            >
              {getInitials(m.user.name)}
            </span>
          ))}
          {project.members?.length > 5 && (
            <span className="avatar avatar-sm" style={{ marginLeft: -8, background: 'var(--surface2)', color: 'var(--muted)', border: '2px solid var(--surface)', fontSize: 9 }}>
              +{project.members.length - 5}
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted2)', marginLeft: 4 }}>
          {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted2)' }}>
          {new Date(project.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  )
}

export default ProjectCard
