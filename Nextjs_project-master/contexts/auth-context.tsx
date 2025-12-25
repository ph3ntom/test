"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  userId: string
  sessionId: string
  mbrId: number
  points?: number
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  updateUserPoints: (points: number) => void
  isLoggedIn: boolean
  isHydrated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // points 속성이 없으면 0으로 초기화
        if (userData.points === undefined) {
          userData.points = 0
        }
        setUser(userData)
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        localStorage.removeItem('user')
      }
    }
    setIsHydrated(true)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isLoggedIn', 'true')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
  }

  const updateUserPoints = (points: number) => {
    if (user) {
      setUser({ ...user, points })
    }
  }

  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserPoints, isLoggedIn, isHydrated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}