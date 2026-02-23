'use client'

import Link from 'next/link'
import { Home, Camera, Film, Palette, Mail } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'

const pages = [
  {
    name: 'Home',
    description: "Page d'accueil du portfolio",
    slug: '/',
    href: '/admin/pages/home',
    icon: Home,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Photography',
    description: 'Page de la galerie photo',
    slug: '/photography',
    href: '/admin/pages/photography',
    icon: Camera,
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    name: 'Film & Motion',
    description: 'Page des projets vidéo',
    slug: '/film-motion',
    href: '/admin/pages/film-motion',
    icon: Film,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    name: 'Art Direction',
    description: 'Page de la direction artistique',
    slug: '/art-direction',
    href: '/admin/pages/art-direction',
    icon: Palette,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    name: 'Contact',
    description: 'Page de contact et informations',
    slug: '/contact',
    href: '/admin/pages/contact',
    icon: Mail,
    color: 'bg-emerald-50 text-emerald-600',
  },
]

export default function PagesListPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-white">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gérez le contenu et le SEO de chaque page
                </p>
              </div>

              {/* Pages grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pages.map((page) => {
                  const Icon = page.icon
                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="group rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300 hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${page.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-semibold text-gray-900 group-hover:text-black">
                          {page.name}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500">
                        {page.description}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          </main>
        </div>
      )}
    </AuthGuard>
  )
}
