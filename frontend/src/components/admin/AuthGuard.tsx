'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthSession {
  token: string
  user: { id: string; email: string }
}

interface AuthGuardProps {
  children: (session: AuthSession) => React.ReactNode
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('auth_user')
  if (!token || !userStr) return null
  try {
    const user = JSON.parse(userStr)
    return { token, user }
  } catch {
    return null
  }
}

export function setAuthSession(token: string, user: { id: string; email: string }) {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('auth_user', JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getAuthSession()
    if (!s) {
      router.push('/admin/login')
    } else {
      setSession(s)
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children(session)}</>
}
