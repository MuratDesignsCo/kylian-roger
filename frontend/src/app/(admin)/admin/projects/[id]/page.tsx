'use client'

import { use } from 'react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ProjectEditorPage from '@/components/admin/ProjectEditor'

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-white">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <ProjectEditorPage id={id} />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}
