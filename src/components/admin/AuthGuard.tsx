'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: (session: Session) => React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login')
      } else {
        setSession(session)
      }
      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setSession(null)
        router.push('/admin/login')
      } else {
        setSession(session)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children(session)}</>
}
