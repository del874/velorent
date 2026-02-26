'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Admin {
  adminId: string
  email: string
  name: string
  role: 'admin'
}

interface AdminContextType {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAdmin: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshAdmin = async () => {
    try {
      const response = await fetch('/api/admin/me')
      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
      } else {
        setAdmin(null)
      }
    } catch (error) {
      console.error('Failed to fetch admin:', error)
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAdmin()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Login failed')
    }

    const data = await response.json()
    setAdmin({
      adminId: data.admin.id,
      email: data.admin.email,
      name: data.admin.name,
      role: 'admin',
    })
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAdmin(null)
  }

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, refreshAdmin }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
