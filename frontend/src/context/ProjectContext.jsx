import React, { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const ProjectContext = createContext()

export const useProject = () => useContext(ProjectContext)

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/projects')
      setProjects(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProject = useCallback(async (id) => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/projects/${id}`)
      setCurrentProject(data)
      return data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createProject = async ({ name, description }) => {
    const { data } = await axios.post('/api/projects', { name, description })
    setProjects((prev) => [data, ...prev])
    toast.success('Project created!')
    return data
  }

  const updateProject = async (id, payload) => {
    const { data } = await axios.put(`/api/projects/${id}`, payload)
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, ...data } : p)))
    if (currentProject?._id === id) setCurrentProject((prev) => ({ ...prev, ...data }))
    toast.success('Project updated!')
    return data
  }

  const deleteProject = async (id) => {
    await axios.delete(`/api/projects/${id}`)
    setProjects((prev) => prev.filter((p) => p._id !== id))
    toast.success('Project deleted')
  }

  const addMember = async (projectId, email, role = 'member') => {
    const { data } = await axios.post(`/api/projects/${projectId}/members`, { email, role })
    setCurrentProject(data)
    toast.success('Member added!')
    return data
  }

  const removeMember = async (projectId, userId) => {
    await axios.delete(`/api/projects/${projectId}/members/${userId}`)
    setCurrentProject((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.user._id !== userId),
    }))
    toast.success('Member removed')
  }

  const changeMemberRole = async (projectId, userId, role) => {
    const { data } = await axios.patch(`/api/projects/${projectId}/members/${userId}`, { role })
    setCurrentProject(data)
    toast.success('Role updated!')
    return data
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loading,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject,
        addMember,
        removeMember,
        changeMemberRole,
        setCurrentProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
