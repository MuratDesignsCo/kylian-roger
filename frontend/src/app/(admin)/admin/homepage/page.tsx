'use client'

import { useEffect, useState } from 'react'
import { gqlRequest } from '@/lib/graphql/client'
import { HOMEPAGE_QUERY } from '@/lib/graphql/queries'
import { UPDATE_HOMEPAGE_MUTATION } from '@/lib/graphql/mutations'
import { getAuthToken } from '@/components/admin/AuthGuard'
import toast from 'react-hot-toast'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ImageUpload from '@/components/admin/ImageUpload'
import type {
  HeroImage,
  HomepageFeaturedWork,
  AboutHoverImage,
  Project,
} from '@/lib/types'

// ============================================================
// Types
// ============================================================

interface HeroImageLocal {
  tempId: string
  image_url: string
  alt_text: string
  sort_order: number
}

interface FeaturedWorkLocal {
  slot_category: 'still' | 'motion'
  slot_index: number
  project_id: string
}

interface HoverImageLocal {
  link_identifier: string
  image_url: string
  alt_text: string
}

let tempCounter = 0
function genTempId() {
  return `tmp_${Date.now()}_${++tempCounter}`
}

// ============================================================
// Page
// ============================================================

export default function HomepagePage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-zinc-950">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <HomepageEditor />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}

// ============================================================
// Editor
// ============================================================

function HomepageEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Hero images
  const [heroImages, setHeroImages] = useState<HeroImageLocal[]>([])

  // Featured works
  const [featuredStill, setFeaturedStill] = useState<FeaturedWorkLocal[]>([
    { slot_category: 'still', slot_index: 0, project_id: '' },
    { slot_category: 'still', slot_index: 1, project_id: '' },
    { slot_category: 'still', slot_index: 2, project_id: '' },
  ])
  const [featuredMotion, setFeaturedMotion] = useState<FeaturedWorkLocal[]>([
    { slot_category: 'motion', slot_index: 0, project_id: '' },
    { slot_category: 'motion', slot_index: 1, project_id: '' },
    { slot_category: 'motion', slot_index: 2, project_id: '' },
  ])

  // Hover images
  const [hoverImages, setHoverImages] = useState<HoverImageLocal[]>([
    { link_identifier: 'photography', image_url: '', alt_text: '' },
    { link_identifier: 'directing', image_url: '', alt_text: '' },
    { link_identifier: 'art-direction', image_url: '', alt_text: '' },
  ])

  // All published projects (for dropdown)
  const [allProjects, setAllProjects] = useState<
    Pick<Project, 'id' | 'title' | 'slug' | 'category'>[]
  >([])

  // ============================================================
  // Load
  // ============================================================

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    try {
      const data = await gqlRequest<{
        homepage: {
          heroImages: HeroImage[]
          featuredWorks: HomepageFeaturedWork[]
          hoverImages: AboutHoverImage[]
          projects: Pick<Project, 'id' | 'title' | 'slug' | 'category'>[]
        }
      }>(HOMEPAGE_QUERY)

      // Hero images
      setHeroImages(
        data.homepage.heroImages.map((img) => ({
          tempId: genTempId(),
          image_url: img.image_url,
          alt_text: img.alt_text || '',
          sort_order: img.sort_order,
        }))
      )

      // Featured works
      const featured = data.homepage.featuredWorks
      const still = [0, 1, 2].map((idx) => {
        const existing = featured.find(
          (f) => f.slot_category === 'still' && f.slot_index === idx
        )
        return {
          slot_category: 'still' as const,
          slot_index: idx,
          project_id: existing?.project_id || '',
        }
      })
      const motion = [0, 1, 2].map((idx) => {
        const existing = featured.find(
          (f) => f.slot_category === 'motion' && f.slot_index === idx
        )
        return {
          slot_category: 'motion' as const,
          slot_index: idx,
          project_id: existing?.project_id || '',
        }
      })
      setFeaturedStill(still)
      setFeaturedMotion(motion)

      // Hover images
      const identifiers = ['photography', 'directing', 'art-direction']
      setHoverImages(
        identifiers.map((id) => {
          const existing = data.homepage.hoverImages.find(
            (h) => h.link_identifier === id
          )
          return {
            link_identifier: id,
            image_url: existing?.image_url || '',
            alt_text: existing?.alt_text || '',
          }
        })
      )

      // All projects
      setAllProjects(data.homepage.projects)
    } catch {
      toast.error('Erreur lors du chargement des donnees')
    }

    setLoading(false)
  }

  // ============================================================
  // Save
  // ============================================================

  const handleSave = async () => {
    setSaving(true)

    try {
      // Build hero images payload (strip tempId)
      const heroPayload = heroImages.map((img, i) => ({
        image_url: img.image_url,
        alt_text: img.alt_text,
        sort_order: i,
      }))

      // Build featured works payload
      const allFeatured = [...featuredStill, ...featuredMotion]
        .filter((f) => f.project_id)
        .map((f, i) => ({
          project_id: f.project_id,
          slot_category: f.slot_category,
          slot_index: f.slot_index,
          sort_order: i,
        }))

      // Build hover images payload
      const hoverPayload = hoverImages.map((h) => ({
        link_identifier: h.link_identifier,
        image_url: h.image_url,
        alt_text: h.alt_text,
      }))

      const token = getAuthToken()
      await gqlRequest(UPDATE_HOMEPAGE_MUTATION, {
        input: {
          heroImages: heroPayload,
          featuredWorks: allFeatured,
          hoverImages: hoverPayload,
        },
      }, token)

      toast.success('Page d\'accueil mise a jour')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      )
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // Hero images helpers
  // ============================================================

  const addHeroImage = () => {
    setHeroImages((prev) => [
      ...prev,
      {
        tempId: genTempId(),
        image_url: '',
        alt_text: '',
        sort_order: prev.length,
      },
    ])
  }

  const removeHeroImage = (tempId: string) => {
    setHeroImages((prev) => prev.filter((i) => i.tempId !== tempId))
  }

  const updateHeroImage = (tempId: string, field: keyof HeroImageLocal, value: string) => {
    setHeroImages((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i))
    )
  }

  // ============================================================
  // Featured works helpers
  // ============================================================

  const updateFeaturedStill = (index: number, projectId: string) => {
    setFeaturedStill((prev) =>
      prev.map((f, i) => (i === index ? { ...f, project_id: projectId } : f))
    )
  }

  const updateFeaturedMotion = (index: number, projectId: string) => {
    setFeaturedMotion((prev) =>
      prev.map((f, i) => (i === index ? { ...f, project_id: projectId } : f))
    )
  }

  // ============================================================
  // Hover images helpers
  // ============================================================

  const updateHoverImage = (identifier: string, field: 'image_url' | 'alt_text', value: string) => {
    setHoverImages((prev) =>
      prev.map((h) =>
        h.link_identifier === identifier ? { ...h, [field]: value } : h
      )
    )
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

  const hoverLabels: Record<string, string> = {
    photography: 'Photographie',
    directing: 'Realisation',
    'art-direction': 'Direction Artistique',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Page d&apos;accueil</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configurez le contenu de la page d&apos;accueil
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer
        </button>
      </div>

      <div className="space-y-8">
        {/* ============================== */}
        {/* Hero Images */}
        {/* ============================== */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Images Hero ({heroImages.length})
            </h2>
            <button
              type="button"
              onClick={addHeroImage}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {heroImages.map((img, i) => (
              <div
                key={img.tempId}
                className="relative rounded-md border border-zinc-700 bg-zinc-800 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">
                    Image {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeHeroImage(img.tempId)}
                    className="rounded p-1 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <ImageUpload
                  value={img.image_url}
                  onChange={(url) => updateHeroImage(img.tempId, 'image_url', url)}
                  folder="homepage/hero"
                />
                <input
                  type="text"
                  value={img.alt_text}
                  onChange={(e) =>
                    updateHeroImage(img.tempId, 'alt_text', e.target.value)
                  }
                  placeholder="Texte alternatif"
                  className="mt-2 block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                />
              </div>
            ))}
          </div>

          {heroImages.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">
              Aucune image hero configuree
            </p>
          )}
        </section>

        {/* ============================== */}
        {/* Featured Works */}
        {/* ============================== */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Travaux mis en avant
          </h2>

          {/* Still */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-zinc-300">
              Still (Photographie)
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {featuredStill.map((slot, i) => (
                <div key={i}>
                  <label className="mb-1 block text-xs text-zinc-500">
                    Emplacement {i + 1}
                  </label>
                  <select
                    value={slot.project_id}
                    onChange={(e) => updateFeaturedStill(i, e.target.value)}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                  >
                    <option value="">-- Aucun --</option>
                    {allProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Motion */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-300">
              Motion (Film)
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {featuredMotion.map((slot, i) => (
                <div key={i}>
                  <label className="mb-1 block text-xs text-zinc-500">
                    Emplacement {i + 1}
                  </label>
                  <select
                    value={slot.project_id}
                    onChange={(e) => updateFeaturedMotion(i, e.target.value)}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                  >
                    <option value="">-- Aucun --</option>
                    {allProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== */}
        {/* Hover Images */}
        {/* ============================== */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Images de survol (A propos)
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {hoverImages.map((hover) => (
              <div key={hover.link_identifier}>
                <h3 className="mb-2 text-sm font-medium text-zinc-300">
                  {hoverLabels[hover.link_identifier] || hover.link_identifier}
                </h3>
                <ImageUpload
                  value={hover.image_url}
                  onChange={(url) =>
                    updateHoverImage(hover.link_identifier, 'image_url', url)
                  }
                  folder="homepage/hover"
                />
                <input
                  type="text"
                  value={hover.alt_text}
                  onChange={(e) =>
                    updateHoverImage(
                      hover.link_identifier,
                      'alt_text',
                      e.target.value
                    )
                  }
                  placeholder="Texte alternatif"
                  className="mt-2 block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
