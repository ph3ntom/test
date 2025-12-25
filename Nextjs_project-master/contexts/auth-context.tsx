"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { useActivityTracker } from '@/hooks/use-activity-tracker'
import { useSessionTimeout } from '@/hooks/use-session-timeout'
import { SessionWarningModal } from '@/components/session-warning-modal'
import { STORAGE_KEYS } from '@/lib/constants'
import type { User } from '@/types/session'

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  updateUserPoints: (points: number) => void
  extendSession: () => void
  isLoggedIn: boolean
  isHydrated: boolean
  showWarning: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const pathname = usePathname()

  // ⭐ 세션 타임아웃 훅
  const { showWarning, setShowWarning } = useSessionTimeout({
    isLoggedIn: !!user,
    lastActivity,
    onLogout: logout,
  })

  // ⭐ 활동 추적 훅
  const updateActivity = useCallback(() => {
    const now = Date.now()
    setLastActivity(now)
    setShowWarning(false)
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString())

    // ⭐ 백엔드에 실제 활동 알림 (lastActivity 업데이트)
    if (user) {
      apiClient.updateActivity().catch(err => {
        console.error('Failed to update activity:', err)
      })
    }
  }, [setShowWarning, user])

  useActivityTracker({
    onActivity: updateActivity,
    enabled: !!user,
  })

  // ⭐ 페이지 접근 시 세션 검증
  useEffect(() => {
    if (!user || !pathname) return

    const validateOnPageAccess = async () => {
      try {
        await apiClient.validateSession()
        console.log(`✅ Session validated on page access: ${pathname}`)
      } catch (error) {
        console.error('❌ Session validation failed on page access:', error)
        logout()
      }
    }

    validateOnPageAccess()
  }, [pathname, user])

  // ⭐ 초기 로드 (localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    const storedActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY)

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.points === undefined) {
          userData.points = 0
        }
        setUser(userData)

        // 마지막 활동 시간 복원
        if (storedActivity) {
          setLastActivity(parseInt(storedActivity))
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        localStorage.clear()
      }
    }
    setIsHydrated(true)
  }, [])

  // ⭐ 로그인
  const login = useCallback((userData: User) => {
    setUser(userData)
    setLastActivity(Date.now())
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true')
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
  }, [])

  // ⭐ 로그아웃
  async function logout() {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setShowWarning(false)
      localStorage.clear()
      window.location.href = '/auth/login'
    }
  }

  // ⭐ 세션 연장
  const extendSession = useCallback(async () => {
    try {
      await apiClient.extendSession()
      updateActivity()
      console.log('✅ Session extended')
    } catch (error) {
      console.error('Failed to extend session:', error)
      logout()
    }
  }, [updateActivity])

  const updateUserPoints = (points: number) => {
    if (user) {
      const updated = { ...user, points }
      setUser(updated)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUserPoints,
        extendSession,
        isLoggedIn: !!user,
        isHydrated,
        showWarning,
      }}
    >
      {children}

      {/* ⭐ 세션 경고 모달 */}
      <SessionWarningModal
        open={showWarning}
        lastActivity={lastActivity}
        onExtend={extendSession}
        onLogout={logout}
      />
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
