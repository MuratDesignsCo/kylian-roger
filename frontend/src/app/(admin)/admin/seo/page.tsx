'use client'

import { useEffect, useState } from 'react'
import { gqlRequest } from '@/lib/graphql/client'
import { SEO_PAGES_QUERY } from '@/lib/graphql/queries'
import { UPSERT_SEO_PAGES_MUTATION } from '@/lib/graphql/mutations'
import { getAuthToken } from '@/components/admin/AuthGuard'
import toast from 'react-hot-toast'
import { Loader2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ImageUpload from '@/components/admin/ImageUpload'
import type { PageSeo } from '@/lib/types'

// ============================================================
// Page labels
// ============================================================

const PAGE_LABELS: Record<string, string> = {
  home: 'Accueil',
  photography: 'Photographie',
  'film-motion': 'Film / Motion',
  'art-direction': 'Direction Artistique',
  contact: 'Contact',
}

const PAGE_ORDER = ['home', 'photography', 'film-motion', 'art-direction', 'contact']

// ============================================================
// Page
// ============================================================

export default function SeoPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-white">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <SeoEditor />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}

// ============================================================
// Editor
// ============================================================

function SeoEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pages, setPages] = useState<PageSeo[]>([])
  const [openPanel, setOpenPanel] = useState<string | null>(null)

  // ============================================================
  // Load
  // ============================================================

  useEffect(() => {
    loadSeo()
  }, [])

  const loadSeo = async () => {
    setLoading(true)

    try {
      const data = await gqlRequest<{ seoPages: PageSeo[] }>(SEO_PAGES_QUERY)
      const allPages = data.seoPages || []

      const sorted = PAGE_ORDER.reduce<PageSeo[]>((acc, slug) => {
        const found = allPages.find((p) => p.page_slug === slug)
        if (found) acc.push(found)
        return acc
      }, [])
      allPages.forEach((p) => {
        if (!sorted.find((s) => s.id === p.id)) {
          sorted.push(p)
        }
      })
      setPages(sorted)
      if (sorted.length > 0) {
        setOpenPanel(sorted[0].page_slug)
      }
    } catch {
      toast.error('Erreur lors du chargement des données SEO')
    }

    setLoading(false)
  }

  // ============================================================
  // Update field
  // ============================================================

  const updateField = (pageSlug: string, field: keyof PageSeo, value: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.page_slug === pageSlug ? { ...p, [field]: value } : p
      )
    )
  }

  // ============================================================
  // Save
  // ============================================================

  const handleSave = async () => {
    setSaving(true)

    try {
      const token = getAuthToken()
      const seoInput = pages.map((page) => ({
        id: page.id,
        page_slug: page.page_slug,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        og_title: page.og_title,
        og_description: page.og_description,
        og_image_url: page.og_image_url,
      }))

      await gqlRequest(UPSERT_SEO_PAGES_MUTATION, { input: seoInput }, token)

      toast.success('Paramètres SEO enregistrés')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      )
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configurez les métadonnées de chaque page
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer
        </button>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {pages.map((page) => {
          const isOpen = openPanel === page.page_slug
          const label = PAGE_LABELS[page.page_slug] || page.page_slug

          return (
            <div
              key={page.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              {/* Accordion header */}
              <button
                type="button"
                onClick={() =>
                  setOpenPanel(isOpen ? null : page.page_slug)
                }
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {label}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    /{page.page_slug === 'home' ? '' : page.page_slug}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div className="border-t border-gray-200 px-6 py-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Meta Title */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Meta Title
                        </label>
                        <span
                          className={`text-xs ${
                            page.meta_title.length > 60
                              ? 'text-red-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {page.meta_title.length}/60
                        </span>
                      </div>
                      <input
                        type="text"
                        value={page.meta_title}
                        onChange={(e) =>
                          updateField(page.page_slug, 'meta_title', e.target.value)
                        }
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Titre de la page"
                      />
                      {page.meta_title.length > 60 && (
                        <p className="mt-1 text-xs text-red-400">
                          Le titre dépasse 60 caractères (recommandé)
                        </p>
                      )}
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Meta Description
                        </label>
                        <span
                          className={`text-xs ${
                            page.meta_description.length > 160
                              ? 'text-red-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {page.meta_description.length}/160
                        </span>
                      </div>
                      <textarea
                        value={page.meta_description}
                        onChange={(e) =>
                          updateField(
                            page.page_slug,
                            'meta_description',
                            e.target.value
                          )
                        }
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Description de la page"
                      />
                      {page.meta_description.length > 160 && (
                        <p className="mt-1 text-xs text-red-400">
                          La description dépasse 160 caractères (recommandé)
                        </p>
                      )}
                    </div>

                    {/* OG Title */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        OG Title
                      </label>
                      <input
                        type="text"
                        value={page.og_title}
                        onChange={(e) =>
                          updateField(page.page_slug, 'og_title', e.target.value)
                        }
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Titre Open Graph"
                      />
                    </div>

                    {/* OG Description */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        OG Description
                      </label>
                      <textarea
                        value={page.og_description}
                        onChange={(e) =>
                          updateField(
                            page.page_slug,
                            'og_description',
                            e.target.value
                          )
                        }
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Description Open Graph"
                      />
                    </div>
                  </div>

                  {/* OG Image */}
                  <div className="mt-6 max-w-md">
                    <ImageUpload
                      value={page.og_image_url}
                      onChange={(url) =>
                        updateField(page.page_slug, 'og_image_url', url)
                      }
                      folder="seo"
                      label="Image OG (1200x630 recommandé)"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {pages.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
          <p className="text-sm text-gray-500">
            Aucune page SEO configurée dans la base de données
          </p>
        </div>
      )}
    </div>
  )
}
