"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, Search } from "lucide-react"

interface User {
  userId: string
  name: string
  createdAt: string
}

interface UsersResponse {
  users: User[]
  total: number
  searchQuery?: string
  error?: any
  statusCode?: number
}

// 마스킹 함수들
const maskName = (name: string): string => {
  if (name.length <= 2) {
    return name
  }
  const first = name.charAt(0)
  const last = name.charAt(name.length - 1)
  const middle = '*'.repeat(name.length - 2)
  return first + middle + last
}

const maskUserId = (userId: string): string => {
  if (userId.length <= 2) {
    return userId
  }
  const visible = userId.slice(0, -2)
  const masked = '**'
  return visible + masked
}

export default function UsersPage() {
	useEffect(() => {
    console.log('=== 환경 변수 디버깅 ===')
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('typeof:', typeof process.env.NEXT_PUBLIC_API_URL)
    console.log('전체 env:', process.env)
  }, [])
  const [usersData, setUsersData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`)
      if (response.ok) {
        const data = await response.json()
        setUsersData(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      fetchUsers()
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/search?q=${encodeURIComponent(searchQuery)}`)

      if (response.ok) {
        const data = await response.json()
        setUsersData(data)
      } else {
        // 서버 오류 응답을 JSON으로 파싱하여 상세 정보 추출
        try {
          const errorData = await response.json()
          console.log('Error data received:', errorData) // 디버깅용
          setUsersData({
            users: [],
            total: 0,
            searchQuery,
            error: errorData,
            statusCode: response.status
          })
        } catch (parseError) {
          // JSON 파싱 실패시 텍스트로 처리
          console.log('Failed to parse error as JSON:', parseError)
          const errorText = await response.text()
          console.log('Error text:', errorText)
          setUsersData({
            users: [],
            total: 0,
            searchQuery,
            error: { message: errorText },
            statusCode: response.status
          })
        }
      }
    } catch (error: any) {
      // 네트워크 오류나 기타 오류도 상세히 표시
      setUsersData({
        users: [],
        total: 0,
        searchQuery,
        error: error.message || 'Unknown error occurred'
      })
    } finally {
      setSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers()
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Users</h1>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Users</h1>
        </div>
        <Badge variant="secondary">
          {usersData?.total || 0} users
        </Badge>
      </div>

      {/* 검색 바 */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search users by ID or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          onClick={searchUsers}
          disabled={searching}
          className="px-4"
        >
          <Search className="h-4 w-4" />
          {searching ? 'Searching...' : 'Search'}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery('')
            fetchUsers()
          }}
        >
          Clear
        </Button>
      </div>

      {/* 검색 결과 표시 */}
      {usersData?.searchQuery && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p className="text-sm">
            Search results for: <strong>"{usersData.searchQuery}"</strong>
          </p>
          {usersData.error && (
            <div className="mt-4 border border-gray-300 rounded bg-white">
              {/* 헤더 부분 - 파란색 배경 */}
              <div className="bg-blue-800 text-white px-3 py-2 text-sm font-semibold">
                HTTP 상태 {usersData.statusCode || 500} - 내부 서버 오류
              </div>

              {/* 본문 부분 - 흰색 배경 */}
              <div className="p-4 bg-white">
                <div className="text-sm text-gray-700 mb-2">
                  설명: 예외가 발생했습니다.
                </div>

                <div className="text-sm text-gray-700 mb-4">
                  상세정보: 서버에서 오류가 발생했습니다. 관리자에게 문의 바랍니다.
                </div>

                {/* 오류 상세 내용 */}
                <div className="space-y-3">
                  {/* SQL 오류 메시지 */}
                  {usersData.error?.sqlMessage && (
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">SQL Error Message:</div>
                      <div className="bg-red-50 p-3 rounded border border-red-200">
                        <pre className="text-xs font-mono text-red-800 whitespace-pre-wrap leading-relaxed">
                          {usersData.error.sqlMessage}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* 실행된 SQL 쿼리 */}
                  {usersData.error?.sql && (
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">Executed SQL Query:</div>
                      <div className="bg-gray-50 p-3 rounded border">
                        <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {usersData.error.sql}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* 기타 오류 정보 */}
                  {usersData.error?.code && (
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">Error Details:</div>
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="text-xs font-mono text-blue-800">
                          <div>Code: {usersData.error.code}</div>
                          {usersData.error.errno && <div>Errno: {usersData.error.errno}</div>}
                          {usersData.error.sqlState && <div>SQL State: {usersData.error.sqlState}</div>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 일반 오류 메시지 (fallback) */}
                  {!usersData.error?.sqlMessage && typeof usersData.error === 'string' && (
                    <div className="bg-gray-50 p-3 rounded border">
                      <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {usersData.error}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {usersData?.users.map((user) => (
          <Card key={user.userId} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">@{maskUserId(user.userId)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {usersData?.users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found.
        </div>
      )}
    </div>
  )
}