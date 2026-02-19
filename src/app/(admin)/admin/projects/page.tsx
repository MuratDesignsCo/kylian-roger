'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { Project } from '@/lib/types'

const CATEGORIES = [
  { value: '', label: 'Tous' },
  { value: 'photography', label: 'Photographie' },
  { value: 'film-motion', label: 'Film / Motion' },
  { value: 'art-direction', label: 'Direction Artistique' },
] as const

const categoryLabels: Record<string, string> = {
  photography: 'Photographie',
  'film-motion': 'Film / Motion',
  'art-direction': 'Direction Artistique',
}

export default function ProjectsListPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-zinc-950">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <ProjectsList />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}

function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProjects = async () => {
    setLoading(true)
    let query = supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })

    if (filter) {
      query = query.eq('category', filter)
    }

    const { data, error } = await query

    if (error) {
      toast.error('Erreur lors du chargement des projets')
      console.error(error)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleTogglePublish = async (project: Project) => {
    setTogglingId(project.id)
    const { error } = await supabase
      .from('projects')
      .update({ is_published: !project.is_published })
      .eq('id', project.id)

    if (error) {
      toast.error('Erreur lors de la mise a jour')
    } else {
      toast.success(
        project.is_published ? 'Projet depublie' : 'Projet publie'
      )
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? { ...p, is_published: !p.is_published }
            : p
        )
      )
    }
    setTogglingId(null)
  }

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      `Supprimer le projet "${project.title}" ? Cette action est irreversible.`
    )
    if (!confirmed) return

    setDeletingId(project.id)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)

    if (error) {
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('Projet supprime')
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    }
    setDeletingId(null)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projets</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gerez vos projets portfolio
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Link>
      </div>

      {/* Category filter tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-zinc-900 p-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filter === cat.value
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 py-16 text-center">
          <p className="text-sm text-zinc-500">Aucun projet trouve</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Projet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Categorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Annee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Ordre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="bg-zinc-950 transition-colors hover:bg-zinc-900/50"
                >
                  {/* Project title + cover */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {project.cover_image_url ? (
                        <img
                          src={project.cover_image_url}
                          alt={project.cover_image_alt || project.title}
                          className="h-10 w-14 shrink-0 rounded border border-zinc-800 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-14 shrink-0 rounded border border-zinc-800 bg-zinc-800" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {project.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                          /{project.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                      {categoryLabels[project.category] || project.category}
                    </span>
                  </td>
                  {/* Year */}
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {project.year}
                  </td>
                  {/* Sort order */}
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {project.sort_order}
                  </td>
                  {/* Status toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(project)}
                      disabled={togglingId === project.id}
                      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: project.is_published
                          ? '#22c55e'
                          : '#3f3f46',
                      }}
                    >
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                        style={{
                          transform: project.is_published
                            ? 'translateX(18px)'
                            : 'translateX(3px)',
                        }}
                      />
                    </button>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(project)}
                        disabled={deletingId === project.id}
                        className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400 disabled:opacity-50"
                        title="Supprimer"
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
