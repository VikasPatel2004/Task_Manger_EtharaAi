import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoImg from '../assets/etharalogo.png'

const Logo = () => (
  <img src={logoImg} alt="EtharaAI Logo" style={{ height: 28, width: 'auto' }} />
)

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(9,9,11,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Logo />
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Link
            to="/dashboard"
            id="nav-dashboard"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              fontWeight: 500,
              color: isActive('/dashboard') ? 'var(--text)' : 'var(--muted)',
              background: isActive('/dashboard') ? 'var(--surface2)' : 'transparent',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>
          <Link
            to="/projects"
            id="nav-projects"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              fontWeight: 500,
              color: isActive('/projects') ? 'var(--text)' : 'var(--muted)',
              background: isActive('/projects') ? 'var(--surface2)' : 'transparent',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            Projects
          </Link>
        </div>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            id="user-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'transparent', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)', padding: '5px 10px',
              cursor: 'pointer', transition: 'all 0.15s',
              color: 'var(--text)',
            }}
          >
            <span className="avatar avatar-sm">{initials}</span>
            <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 6,
                minWidth: 180, zIndex: 20,
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                animation: 'fadeIn 0.15s ease',
              }}>
                <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 1 }}>{user?.email}</div>
                </div>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  style={{
                    width: '100%', padding: '7px 10px', borderRadius: 'var(--radius)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--danger)', fontSize: 13, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
