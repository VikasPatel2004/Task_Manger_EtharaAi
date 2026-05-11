import React, { useEffect, useState } from 'react'
import { useProject } from '../context/ProjectContext'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'

const NewProjectModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onCreate(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>New Project</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Project Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              id="project-name"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Mobile App Redesign"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              id="project-description"
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>
          <div className="flex gap-3" style={{ marginTop: 4 }}>
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
            <button id="create-project-btn" type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating…</>
                : 'Create Project'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Projects = () => {
  const { projects, loading, fetchProjects, createProject } = useProject()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 animate-fade" style={{ flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>Projects</h1>
            <p style={{ color: 'var(--muted2)', marginTop: 4, fontSize: 14 }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} you belong to
            </p>
          </div>
          <button
            id="new-project-btn"
            className="btn btn-primary btn-lg"
            onClick={() => setShowModal(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Project
          </button>
        </div>

        {/* Search */}
        {projects.length > 0 && (
          <div className="mb-6">
            <input
              id="project-search"
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              style={{ maxWidth: 360 }}
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center" style={{ padding: '80px 0' }}>
            <span className="spinner spinner-lg" />
          </div>
        ) : projects.length === 0 ? (
          <div className="empty" style={{ padding: '100px 20px' }}>
            <div className="empty-icon">📁</div>
            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--muted)' }}>No projects yet</p>
            <p style={{ fontSize: 14 }}>Create your first project and invite your team.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => setShowModal(true)}
            >
              Create Project
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <p style={{ fontSize: 15, color: 'var(--muted)' }}>No projects match "{search}"</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreate={createProject}
        />
      )}
    </div>
  )
}

export default Projects
