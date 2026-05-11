import React, { useState } from 'react'
import { useProject } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

const MemberRow = ({ member, projectId, isAdmin, isOwner }) => {
  const { removeMember, changeMemberRole } = useProject()
  const { user } = useAuth()
  const [removing, setRemoving] = useState(false)

  const isSelf = member.user._id === user?._id

  const handleRemove = async () => {
    if (!window.confirm(`Remove ${member.user.name} from this project?`)) return
    setRemoving(true)
    try {
      await removeMember(projectId, member.user._id)
    } finally {
      setRemoving(false)
    }
  }

  const handleRoleChange = async (e) => {
    await changeMemberRole(projectId, member.user._id, e.target.value)
  }

  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: '10px 14px',
        borderRadius: 'var(--radius)',
        background: isSelf ? 'var(--primary-glow2)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!isSelf) e.currentTarget.style.background = 'var(--surface2)' }}
      onMouseLeave={(e) => { if (!isSelf) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Avatar */}
      <span className="avatar" title={member.user.name}>{getInitials(member.user.name)}</span>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {member.user.name}
          </span>
          {isOwner && (
            <span className="badge badge-violet" style={{ fontSize: 10 }}>Owner</span>
          )}
          {isSelf && (
            <span className="badge badge-zinc" style={{ fontSize: 10 }}>You</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 1 }}>{member.user.email}</div>
      </div>

      {/* Role selector (admin only, not self if owner) */}
      {isAdmin && !isOwner ? (
        <select
          className="input"
          value={member.role}
          onChange={handleRoleChange}
          style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      ) : (
        <span className={`badge ${member.role === 'admin' ? 'badge-indigo' : 'badge-zinc'}`}>
          {member.role}
        </span>
      )}

      {/* Remove button (admin only, not self if owner) */}
      {isAdmin && !isOwner && (
        <button
          className="btn-icon"
          onClick={handleRemove}
          disabled={removing}
          title="Remove member"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
        >
          {removing
            ? <span className="spinner" style={{ width: 14, height: 14 }} />
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
          }
        </button>
      )}
    </div>
  )
}

export default MemberRow
