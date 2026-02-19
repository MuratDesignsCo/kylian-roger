'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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
        <div className="flex h-screen bg-zinc-950">
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

    const { data, error } = await supabase
      .from('pages_seo')
      .select('*')
      .order('page_slug', { ascending: true })

    if (error) {
      toast.error('Erreur lors du chargement des donnees SEO')
      console.error(error)
    } else if (data) {
      // Sort by our preferred order
      const sorted = PAGE_ORDER.reduce<PageSeo[]>((acc, slug) => {
        const found = data.find((p: PageSeo) => p.page_slug === slug)
        if (found) acc.push(found)
        return acc
      }, [])
      // Add any pages not in our order
      data.forEach((p: PageSeo) => {
        if (!sorted.find((s) => s.id === p.id)) {
          sorted.push(p)
        }
      })
      setPages(sorted)
      // Open first panel by default
      if (sorted.length > 0) {
        setOpenPanel(sorted[0].page_slug)
      }
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
      for (const page of pages) {
        const { error } = await supabase
          .from('pages_seo')
          .update({
            meta_title: page.meta_title,
            meta_description: page.meta_description,
            og_title: page.og_title,
            og_description: page.og_description,
            og_image_url: page.og_image_url,
          })
          .eq('id', page.id)

        if (error) {
          throw new Error(
            `Erreur pour "${PAGE_LABELS[page.page_slug] || page.page_slug}": ${error.message}`
          )
        }
      }

      toast.success('Parametres SEO enregistres')
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
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configurez les meta-donnees de chaque page
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
            >
              {/* Accordion header */}
              <button
                type="button"
                onClick={() =>
                  setOpenPanel(isOpen ? null : page.page_slug)
                }
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    {label}
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                    /{page.page_slug === 'home' ? '' : page.page_slug}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                )}
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div className="border-t border-zinc-800 px-6 py-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Meta Title */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-300">
                          Meta Title
                        </label>
                        <span
                          className={`text-xs ${
                            page.meta_title.length > 60
                              ? 'text-red-400'
                              : 'text-zinc-500'
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
                        className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                        placeholder="Titre de la page"
                      />
                      {page.meta_title.length > 60 && (
                        <p className="mt-1 text-xs text-red-400">
                          Le titre depasse 60 caracteres (recommande)
                        </p>
                      )}
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-300">
                          Meta Description
                        </label>
                        <span
                          className={`text-xs ${
                            page.meta_description.length > 160
                              ? 'text-red-400'
                              : 'text-zinc-500'
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
                        className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                        placeholder="Description de la page"
                      />
                      {page.meta_description.length > 160 && (
                        <p className="mt-1 text-xs text-red-400">
                          La description depasse 160 caracteres (recommande)
                        </p>
                      )}
                    </div>

                    {/* OG Title */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                        OG Title
                      </label>
                      <input
                        type="text"
                        value={page.og_title}
                        onChange={(e) =>
                          updateField(page.page_slug, 'og_title', e.target.value)
                        }
                        className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                        placeholder="Titre Open Graph"
                      />
                    </div>

                    {/* OG Description */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
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
                        className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
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
                      label="Image OG (1200x630 recommande)"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {pages.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 py-16 text-center">
          <p className="text-sm text-zinc-500">
            Aucune page SEO configuree dans la base de donnees
          </p>
        </div>
      )}
    </div>
  )
}
