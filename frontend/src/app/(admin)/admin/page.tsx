'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { gqlRequest } from '@/lib/graphql/client'
import { PROJECTS_QUERY } from '@/lib/graphql/queries'
import { UPDATE_PROJECT_MUTATION } from '@/lib/graphql/mutations'
import { getAuthToken } from '@/components/admin/AuthGuard'
import { Camera, Film, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { Project } from '@/lib/types'

interface ProjectRow {
  id: string
  title: string
  slug: string
  category: string
  updated_at: string
  is_published: boolean
}

interface CategoryCount {
  photography: number
  'film-motion': number
  'art-direction': number
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-zinc-950">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <DashboardContent />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}

function DashboardContent() {
  const [counts, setCounts] = useState<CategoryCount>({
    photography: 0,
    'film-motion': 0,
    'art-direction': 0,
  })
  const [recentProjects, setRecentProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const data = await gqlRequest<{ projects: Project[] }>(PROJECTS_QUERY)
      const allProjects = data.projects || []

      setCounts({
        photography: allProjects.filter((p) => p.category === 'photography').length,
        'film-motion': allProjects.filter((p) => p.category === 'film-motion').length,
        'art-direction': allProjects.filter((p) => p.category === 'art-direction').length,
      })

      // Sort by updated_at descending, take 5
      const sorted = [...allProjects]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
      setRecentProjects(sorted)
    } catch {
      toast.error('Erreur lors du chargement des donn\u00e9es')
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (project: ProjectRow) => {
    try {
      const token = getAuthToken()
      await gqlRequest(UPDATE_PROJECT_MUTATION, {
        id: project.id,
        input: { slug: project.slug, category: project.category, title: project.title, is_published: !project.is_published },
      }, token)

      setRecentProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, is_published: !p.is_published } : p
        )
      )
      toast.success(
        project.is_published ? 'Projet d\u00e9publi\u00e9' : 'Projet publi\u00e9'
      )
    } catch {
      toast.error('Erreur lors de la mise \u00e0 jour')
    }
  }

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case 'photography':
        return 'Photographie'
      case 'film-motion':
        return 'Film & Motion'
      case 'art-direction':
        return 'Direction Artistique'
      default:
        return cat
    }
  }

  const statCards = [
    {
      label: 'Photographie',
      count: counts.photography,
      icon: Camera,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Film & Motion',
      count: counts['film-motion'],
      icon: Film,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: 'Direction Artistique',
      count: counts['art-direction'],
      icon: Palette,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Vue d&apos;ensemble de votre portfolio
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}
                >
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{card.count}</p>
                  <p className="text-xs text-zinc-500">{card.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent projects */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            Projets r&eacute;cents
          </h2>
          <Link
            href="/admin/projects"
            className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Voir tout
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-zinc-600">
            Aucun projet pour le moment
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {recentProjects.map((project) => (
              <li
                key={project.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="text-sm font-medium text-zinc-200 transition-colors hover:text-white"
                  >
                    {project.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-600">
                    <span>{categoryLabel(project.category)}</span>
                    <span>&middot;</span>
                    <span>
                      {new Date(project.updated_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* Publish toggle */}
                <button
                  onClick={() => togglePublish(project)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    project.is_published ? 'bg-green-600' : 'bg-zinc-700'
                  }`}
                  title={project.is_published ? 'Publi\u00e9' : 'Brouillon'}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      project.is_published ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
