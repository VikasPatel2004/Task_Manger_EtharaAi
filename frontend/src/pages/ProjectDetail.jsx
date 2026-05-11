import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import { useTask } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import MemberRow from '../components/MemberRow'

const COLUMNS = [
  { key: 'todo',        label: 'To Do',       color: 'var(--muted)' },
  { key: 'in-progress', label: 'In Progress',  color: '#60a5fa' },
  { key: 'done',        label: 'Done',         color: 'var(--success)' },
]

const AddMemberModal = ({ onClose, onAdd }) => {
  const [email, setEmail] = useState('')
  const [role, setRole]   = useState('member')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onAdd(email, role); onClose() }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Add Member</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input id="member-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="teammate@example.com" autoFocus />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3" style={{ marginTop: 4 }}>
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
            <button id="add-member-btn" type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Adding…</> : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditProjectModal = ({ project, onClose, onSave }) => {
  const [form, setForm] = useState({ name: project.name, description: project.description || '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave(form); onClose() }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Edit Project</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Project Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="flex gap-3" style={{ marginTop: 4 }}>
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentProject, loading: pLoading, fetchProject, addMember, updateProject, deleteProject } = useProject()
  const { tasks, loading: tLoading, fetchTasks } = useTask()
  const [activeTab, setActiveTab] = useState('tasks')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showEditProject, setShowEditProject] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProject(id)
    fetchTasks(id)
  }, [id, fetchProject, fetchTasks])

  if (pLoading && !currentProject) {
    return (
      <div className="page">
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <span className="spinner spinner-lg" />
        </div>
      </div>
    )
  }

  if (!currentProject) return null

  const isAdmin = currentProject.myRole === 'admin'
  const ownerId = currentProject.owner?._id || currentProject.owner

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const now = new Date()
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done')
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const pct = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0

  const handleDelete = async () => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return
    await deleteProject(id)
    navigate('/projects')
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        {/* Back */}
        <button
          className="btn btn-ghost btn-sm mb-4"
          onClick={() => navigate('/projects')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Projects
        </button>

        {/* Project header */}
        <div className="flex items-start justify-between gap-4 mb-6 animate-fade" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{currentProject.name}</h1>
              <span className={`badge ${isAdmin ? 'badge-indigo' : 'badge-zinc'}`}>{currentProject.myRole}</span>
            </div>
            {currentProject.description && (
              <p style={{ color: 'var(--muted2)', fontSize: 14, marginTop: 2 }}>{currentProject.description}</p>
            )}
            {/* Progress */}
            <div style={{ marginTop: 12, maxWidth: 360 }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 11, color: 'var(--muted2)' }}>
                  {doneTasks.length} / {tasks.length} tasks done
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? 'var(--success)' : 'var(--muted)' }}>
                  {pct}%
                </span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {activeTab === 'tasks' && (
              <button
                id="new-task-btn"
                className="btn btn-primary"
                onClick={() => { setEditTask(null); setShowTaskForm(true) }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                New Task
              </button>
            )}
            {isAdmin && (
              <>
                <button className="btn btn-ghost" onClick={() => setShowEditProject(true)} title="Edit project">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="btn btn-danger" onClick={handleDelete} title="Delete project">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mini stat pills */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { label: 'Total', val: tasks.length, color: 'var(--muted)' },
            { label: 'Overdue', val: overdueTasks.length, color: 'var(--danger)' },
            { label: 'Members', val: currentProject.members?.length, color: 'var(--primary)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              padding: '6px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 99,
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13,
            }}>
              <span style={{ fontWeight: 700, color }}>{val}</span>
              <span style={{ color: 'var(--muted2)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
            Tasks ({tasks.length})
          </button>
          <button className={`tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
            Team ({currentProject.members?.length || 0})
          </button>
        </div>

        {/* Tasks tab */}
        {activeTab === 'tasks' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <input
                className="input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks…"
                style={{ maxWidth: 320 }}
              />
            </div>
            {tLoading ? (
              <div className="flex justify-center" style={{ padding: '60px 0' }}>
                <span className="spinner spinner-lg" />
              </div>
            ) : (
              <div className="kanban">
                {COLUMNS.map((col) => {
                  const colTasks = filteredTasks.filter((t) => t.status === col.key)
                  return (
                    <div key={col.key} className="kanban-col animate-fade">
                      <div className="kanban-col-header">
                        <div className="flex items-center gap-2">
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: col.color }}>{col.label}</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 600 }}>{colTasks.length}</span>
                      </div>
                      {colTasks.length === 0 ? (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted2)', fontSize: 12 }}>
                          No tasks
                        </div>
                      ) : (
                        colTasks.map((task) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            projectId={id}
                            onEdit={(t) => { setEditTask(t); setShowTaskForm(true) }}
                          />
                        ))
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Team tab */}
        {activeTab === 'team' && (
          <div className="card animate-fade" style={{ padding: 8 }}>
            <div className="flex items-center justify-between" style={{ padding: '8px 14px 12px' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {currentProject.members?.length} member{currentProject.members?.length !== 1 ? 's' : ''}
              </span>
              {isAdmin && (
                <button
                  id="add-member-btn"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddMember(true)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                  Add Member
                </button>
              )}
            </div>
            <hr className="divider" style={{ marginBottom: 8 }} />
            {currentProject.members?.map((m) => (
              <MemberRow
                key={m.user._id}
                member={m}
                projectId={id}
                isAdmin={isAdmin}
                isOwner={m.user._id === ownerId}
              />
            ))}
          </div>
        )}
      </div>

      {showTaskForm && (
        <TaskForm
          onClose={() => { setShowTaskForm(false); setEditTask(null) }}
          editTask={editTask}
          projectId={id}
          members={currentProject.members || []}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          onClose={() => setShowAddMember(false)}
          onAdd={(email, role) => addMember(id, email, role)}
        />
      )}
      {showEditProject && (
        <EditProjectModal
          project={currentProject}
          onClose={() => setShowEditProject(false)}
          onSave={(data) => updateProject(id, data)}
        />
      )}
    </div>
  )
}

export default ProjectDetail
