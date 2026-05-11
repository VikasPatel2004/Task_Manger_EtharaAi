import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import logoImg from '../assets/etharalogo.png'

const Logo = () => (
  <img src={logoImg} alt="EtharaAI Logo" style={{ height: 40, width: 'auto' }} />
)

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to EtharaAI 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <Logo />
          </div>
          <p style={{ color: 'var(--muted2)', fontSize: 13 }}>Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className="input"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              autoComplete="name"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">
              Password
              <span style={{ color: 'var(--muted2)', fontWeight: 400, marginLeft: 4 }}>(min 6 chars)</span>
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="input"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account…</>
              : 'Create Account'
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted2)' }}>
          Already have an account?{' '}
          <Link to="/login" id="go-to-login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
