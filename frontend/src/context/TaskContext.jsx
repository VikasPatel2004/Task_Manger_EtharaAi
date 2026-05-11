import React, { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const TaskContext = createContext()

export const useTask = () => useContext(TaskContext)

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch tasks for a specific project
  const fetchTasks = useCallback(async (projectId, filters = {}) => {
    if (!projectId) return
    setLoading(true)
    try {
      const params = new URLSearchParams(filters).toString()
      const { data } = await axios.get(`/api/projects/${projectId}/tasks?${params}`)
      setTasks(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch tasks assigned to the current user across all projects
  const fetchMyTasks = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/tasks/mine')
      setMyTasks(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch your tasks')
    }
  }, [])

  const createTask = async (projectId, taskData) => {
    try {
      const { data } = await axios.post(`/api/projects/${projectId}/tasks`, taskData)
      setTasks((prev) => [data, ...prev])
      toast.success('Task created!')
      return data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
      throw err
    }
  }

  const updateTask = async (projectId, id, taskData) => {
    try {
      const { data } = await axios.put(`/api/projects/${projectId}/tasks/${id}`, taskData)
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)))
      toast.success('Task updated!')
      return data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task')
      throw err
    }
  }

  const deleteTask = async (projectId, id) => {
    try {
      await axios.delete(`/api/projects/${projectId}/tasks/${id}`)
      setTasks((prev) => prev.filter((t) => t._id !== id))
      toast.success('Task deleted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task')
      throw err
    }
  }

  return (
    <TaskContext.Provider
      value={{ tasks, myTasks, loading, fetchTasks, fetchMyTasks, createTask, updateTask, deleteTask, setTasks }}
    >
      {children}
    </TaskContext.Provider>
  )
}
