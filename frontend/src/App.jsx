import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TaskProvider } from './context/TaskContext'
import { ProjectProvider } from './context/ProjectContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
            <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
          </Routes>
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App
