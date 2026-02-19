'use client'

import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ProjectEditorPage from '@/components/admin/ProjectEditor'

export default function NewProjectPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-zinc-950">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <ProjectEditorPage />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}
