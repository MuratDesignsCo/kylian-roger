'use client'

import { useEffect, useState, useCallback } from 'react'
import { gqlRequest } from '@/lib/graphql/client'
import { ADMIN_FILM_MOTION_PAGE_QUERY } from '@/lib/graphql/queries'
import {
  UPSERT_PAGE_SETTINGS_MUTATION,
  UPSERT_SEO_PAGES_MUTATION,
} from '@/lib/graphql/mutations'
import { getAuthToken } from '@/components/admin/AuthGuard'
import toast from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PageTabs from '@/components/admin/PageTabs'
import SeoTabEditor from '@/components/admin/SeoTabEditor'
import type { PageSeo, PageSettings } from '@/lib/types'

// ============================================================
// Page shell
// ============================================================

export default function FilmMotionEditorPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-white">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <FilmMotionEditor />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}

// ============================================================
// Editor
// ============================================================

function FilmMotionEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')

  // Page settings
  const [pageTitle, setPageTitle] = useState('FILM / MOTION')

  // SEO
  const [seoData, setSeoData] = useState<PageSeo | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await gqlRequest<{
        pageSettings: PageSettings | null
        seoPage: PageSeo | null
      }>(ADMIN_FILM_MOTION_PAGE_QUERY)

      if (data.pageSettings) {
        setPageTitle(data.pageSettings.page_title || 'FILM / MOTION')
      }

      setSeoData(
        data.seoPage || {
          id: '',
          page_slug: 'film-motion',
          meta_title: '',
          meta_description: '',
          og_title: '',
          og_description: '',
          og_image_url: '',
          updated_at: '',
        }
      )
    } catch {
      toast.error('Erreur lors du chargement')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = getAuthToken()

      if (activeTab === 'content') {
        await gqlRequest(
          UPSERT_PAGE_SETTINGS_MUTATION,
          {
            input: {
              page_slug: 'film-motion',
              page_title: pageTitle,
            },
          },
          token
        )
        toast.success('Contenu enregistré')
      } else {
        if (seoData) {
          await gqlRequest(
            UPSERT_SEO_PAGES_MUTATION,
            {
              input: [
                {
                  id: seoData.id || undefined,
                  page_slug: 'film-motion',
                  meta_title: seoData.meta_title,
                  meta_description: seoData.meta_description,
                  og_title: seoData.og_title,
                  og_description: seoData.og_description,
                  og_image_url: seoData.og_image_url,
                },
              ],
            },
            token
          )
          toast.success('SEO enregistré')
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleSeoChange = useCallback((partial: Partial<PageSeo>) => {
    setSeoData((prev) => (prev ? { ...prev, ...partial } : prev))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-10 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1>Film & Motion</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Enregistrer
        </button>
      </div>

      {/* Tabs */}
      <PageTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="admin-section">
          <h2 className="mb-8">Paramètres de la page</h2>

          {/* Page Title */}
          <div>
            <label className="block mb-2 text-sm font-medium">Titre de la page</label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="FILM / MOTION"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Titre affiché en haut de la page publique
            </p>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <SeoTabEditor seoData={seoData} onChange={handleSeoChange} />
      )}
    </div>
  )
}
