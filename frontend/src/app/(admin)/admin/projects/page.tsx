'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { gqlRequest } from '@/lib/graphql/client'
import { PROJECTS_QUERY } from '@/lib/graphql/queries'
import { DELETE_PROJECT_MUTATION } from '@/lib/graphql/mutations'
import { getAuthToken } from '@/components/admin/AuthGuard'
import toast from 'react-hot-toast'
import { Camera, Film, Palette, Plus, Trash2, Loader2, ArrowLeft, ArrowUpDown } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { Project } from '@/lib/types'

const PORTFOLIO_CATEGORIES = [
  {
    name: 'Photography',
    description: 'Projets photographiques du portfolio',
    slug: 'photography',
    icon: Camera,
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    name: 'Film & Motion',
    description: 'Projets vidéo et motion',
    slug: 'film-motion',
    icon: Film,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    name: 'Art Direction',
    description: 'Projets de direction artistique',
    slug: 'art-direction',
    icon: Palette,
    color: 'bg-amber-50 text-amber-600',
  },
] as const

const categoryLabels: Record<string, string> = {
  photography: 'Photography',
  'film-motion': 'Film & Motion',
  'art-direction': 'Art Direction',
}

export default function ProjectsListPage() {
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
              <ProjectsContent />
            </Suspense>
          </main>
        </div>
      )}
    </AuthGuard>
  )
}

function ProjectsContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')

  if (category) {
    return <CategoryProjectList category={category} />
  }
  return <CategoryCards />
}

// ============================================================
// Vue 1 : Cards des catégories
// ============================================================

function CategoryCards() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez vos projets par catégorie
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PORTFOLIO_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/admin/projects?category=${cat.slug}`}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${cat.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900 group-hover:text-black">
                  {cat.name}
                </h2>
              </div>
              <p className="text-sm text-gray-500">{cat.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// Vue 2 : Liste filtrée par catégorie
// ============================================================

type SortOrder = 'recent' | 'oldest'

function CategoryProjectList({ category }: { category: string }) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOrder>('recent')

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const data = await gqlRequest<{ projects: Project[] }>(PROJECTS_QUERY, { category })
      setProjects(data.projects || [])
    } catch {
      toast.error('Erreur lors du chargement des projets')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    e.stopPropagation()

    const confirmed = window.confirm(
      `Supprimer le projet "${project.title}" ? Cette action est irréversible.`
    )
    if (!confirmed) return

    setDeletingId(project.id)
    try {
      const token = getAuthToken()
      await gqlRequest(DELETE_PROJECT_MUTATION, { id: project.id }, token)
      toast.success('Projet supprimé')
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
    setDeletingId(null)
  }

  const sortedProjects = [...projects].sort((a, b) => {
    const dateA = a.project_date || `${a.year}-01-01`
    const dateB = b.project_date || `${b.year}-01-01`
    return sort === 'recent'
      ? dateB.localeCompare(dateA)
      : dateA.localeCompare(dateB)
  })

  const label = categoryLabels[category] || category

  const formatDate = (project: Project) => {
    if (project.project_date) {
      return new Date(project.project_date + 'T00:00:00').toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
    return String(project.year)
  }

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{label}</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              {projects.length} projet{projects.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/projects/new?category=${category}`}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Link>
      </div>

      {/* Sort */}
      {projects.length > 1 && (
        <div className="mb-6 flex items-center gap-3">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setSort('recent')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                sort === 'recent'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Plus récents
            </button>
            <button
              type="button"
              onClick={() => setSort('oldest')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                sort === 'oldest'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Plus anciens
            </button>
          </div>
        </div>
      )}

      {/* Project list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-sm text-gray-400">Aucun projet</p>
          <Link
            href={`/admin/projects/new?category=${category}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            Créer votre premier projet
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedProjects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.id}`}
              className="group flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-md"
            >
              {/* Cover */}
              {project.cover_image_url ? (
                <img
                  src={project.cover_image_url}
                  alt={project.cover_image_alt || project.title}
                  className="h-20 w-28 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Camera className="h-5 w-5 text-gray-300" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-black">
                  {project.title}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {formatDate(project)}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => handleDelete(e, project)}
                disabled={deletingId === project.id}
                className="shrink-0 rounded-lg p-2.5 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
                title="Supprimer"
              >
                {deletingId === project.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
