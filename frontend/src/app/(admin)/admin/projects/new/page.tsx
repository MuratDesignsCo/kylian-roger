'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ProjectEditorPage from '@/components/admin/ProjectEditor'
import { Loader2 } from 'lucide-react'

function NewProjectContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') as 'photography' | 'film-motion' | 'art-direction' | null

  return <ProjectEditorPage defaultCategory={category || undefined} />
}

export default function NewProjectPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-white">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            }>
              <NewProjectContent />
            </Suspense>
          </main>
        </div>
      )}
    </AuthGuard>
  )
}
