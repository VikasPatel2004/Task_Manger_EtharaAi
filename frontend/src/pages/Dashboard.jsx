import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProject } from '../context/ProjectContext'
import { useTask } from '../context/TaskContext'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between mb-1">
      <span className="stat-label">{label}</span>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <span className="stat-value" style={{ color }}>{value}</span>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const { projects, loading: pLoading, fetchProjects } = useProject()
  const { myTasks, loading: tLoading, fetchMyTasks } = useTask()

  useEffect(() => {
    fetchProjects()
    fetchMyTasks()
  }, [fetchProjects, fetchMyTasks])

  const now = new Date()
  const overdue = myTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done')
  const done = myTasks.filter((t) => t.status === 'done')
  const inProgress = myTasks.filter((t) => t.status === 'in-progress')

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="mb-8 animate-fade">
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--muted2)', marginTop: 4, fontSize: 14 }}>
            Here's what's happening across your projects.
          </p>
        </div>

        {/* Stats */}
        <div className="grid-4 mb-8">
          <StatCard label="My Tasks" value={myTasks.length} color="var(--primary)" icon="📋" />
          <StatCard label="In Progress" value={inProgress.length} color="#60a5fa" icon="⚡" />
          <StatCard label="Completed" value={done.length} color="var(--success)" icon="✅" />
          <StatCard label="Overdue" value={overdue.length} color="var(--danger)" icon="⚠️" />
        </div>

        {/* My Tasks section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>My Assigned Tasks</h2>
            <span style={{ fontSize: 12, color: 'var(--muted2)' }}>across all projects</span>
          </div>

          {tLoading ? (
            <div className="flex justify-center" style={{ padding: '40px 0' }}>
              <span className="spinner spinner-lg" />
            </div>
          ) : myTasks.length === 0 ? (
            <div className="empty card" style={{ padding: '48px 20px' }}>
              <div className="empty-icon">🎯</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--muted)' }}>No tasks assigned to you</p>
              <p style={{ fontSize: 13 }}>Join a project and get tasks assigned to you.</p>
              <Link to="/projects" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                Go to Projects
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {myTasks.map((task) => (
                <TaskCard key={task._id} task={task} projectId={task.project?._id} onEdit={() => {}} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Projects</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">View all →</Link>
          </div>

          {pLoading ? (
            <div className="flex justify-center" style={{ padding: '40px 0' }}>
              <span className="spinner spinner-lg" />
            </div>
          ) : projects.length === 0 ? (
            <div className="empty card" style={{ padding: '48px 20px' }}>
              <div className="empty-icon">🚀</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--muted)' }}>No projects yet</p>
              <p style={{ fontSize: 13 }}>Create your first project to get started.</p>
              <Link to="/projects" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                Create Project
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.slice(0, 5).map((p) => {
                const pct = p.taskCount > 0 ? Math.round((p.doneCount / p.taskCount) * 100) : 0
                return (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="card"
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      textDecoration: 'none',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                        {p.overdueCount > 0 && (
                          <span className="badge badge-red">{p.overdueCount} overdue</span>
                        )}
                      </div>
                      <div className="progress-bar" style={{ width: '100%', maxWidth: 300 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? 'var(--success)' : 'var(--text)' }}>
                        {pct}%
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>
                        {p.taskCount} tasks · {p.members?.length} members
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
