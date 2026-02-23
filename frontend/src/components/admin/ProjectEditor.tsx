'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { gqlRequest } from '@/lib/graphql/client'
import { PROJECT_BY_ID_QUERY } from '@/lib/graphql/queries'
import {
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  SAVE_GALLERY_ROWS_MUTATION,
  SAVE_HERO_SLIDES_MUTATION,
  SAVE_PROJECT_BLOCKS_MUTATION,
} from '@/lib/graphql/mutations'
import { getAuthToken } from '@/components/admin/AuthGuard'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/admin/ImageUpload'
import DatePicker from '@/components/admin/DatePicker'
import PageTabs from '@/components/admin/PageTabs'
import SeoTabEditor from '@/components/admin/SeoTabEditor'
import HeroSlidesEditor, { ensureSlots, type HeroSlideLocal } from '@/components/admin/HeroSlidesEditor'
import { UPLOAD_URL } from '@/lib/graphql/client'
import type {
  Project,
  PageSeo,
  ProjectGalleryRow,
  ProjectGalleryImage,
  ProjectHeroSlide,
  ProjectBlock,
  ProjectBlockImage,
  DeliverableItem,
} from '@/lib/types'

// ============================================================
// Types
// ============================================================

interface ProjectEditorProps {
  id?: string
  defaultCategory?: Category
}

type Category = 'photography' | 'film-motion' | 'art-direction'

interface GalleryRowLocal {
  tempId: string
  layout: 'full' | 'half' | 'third' | 'quarter'
  sort_order: number
  images: GalleryImageLocal[]
}

interface GalleryImageLocal {
  tempId: string
  image_url: string
  alt_text: string
  sort_order: number
}

interface ContentBlockLocal {
  tempId: string
  block_type: 'gallery' | 'context' | 'deliverables'
  sort_order: number
  context_label: string
  context_heading: string
  context_text: string
  gallery_layout: 'full' | 'pair' | 'trio' | 'pair-full' | null
  deliverables_items: DeliverableItem[]
  images: BlockImageLocal[]
}

interface BlockImageLocal {
  tempId: string
  image_url: string
  alt_text: string
  image_type: 'landscape' | 'portrait' | 'full'
  sort_order: number
}

// ============================================================
// Utils
// ============================================================

let tempCounter = 0
function genTempId(): string {
  return `temp_${Date.now()}_${++tempCounter}`
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const BLOCK_TYPE_OPTIONS = [
  { value: 'gallery', label: 'Galerie' },
  { value: 'context', label: 'Contexte' },
  { value: 'deliverables', label: 'Livrables' },
] as const

// ============================================================
// Component
// ============================================================

export default function ProjectEditorPage({ id, defaultCategory }: ProjectEditorProps) {
  const router = useRouter()
  const isNew = !id

  // Loading
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  // Common fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [category, setCategory] = useState<Category>(defaultCategory || 'photography')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImageAlt, setCoverImageAlt] = useState('')
  const [projectDate, setProjectDate] = useState('')
  const [cardLabel, setCardLabel] = useState('')

  // Photography fields
  const [photoLocation, setPhotoLocation] = useState('')
  const [galleryRows, setGalleryRows] = useState<GalleryRowLocal[]>([])

  // Film/Motion fields
  const [filmVideoUrl, setFilmVideoUrl] = useState('')
  const [filmBgImageUrl, setFilmBgImageUrl] = useState('')
  const [filmSubtitle, setFilmSubtitle] = useState('')
  const [filmLayout, setFilmLayout] = useState<'landscape' | 'vertical'>('landscape')

  // Art Direction fields
  const [artClient, setArtClient] = useState('')
  const [artRole, setArtRole] = useState('')
  const [artDescription, setArtDescription] = useState('')
  const [artTags, setArtTags] = useState('')
  const [artHeroLabel, setArtHeroLabel] = useState('')
  const [heroSlides, setHeroSlides] = useState<HeroSlideLocal[]>(() =>
    defaultCategory === 'art-direction' ? ensureSlots([], 5) : []
  )
  const [contentBlocks, setContentBlocks] = useState<ContentBlockLocal[]>([])

  // Tab state (only for photography & art-direction)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')

  // SEO fields
  const [seoData, setSeoData] = useState<PageSeo>({
    id: '',
    page_slug: '',
    meta_title: '',
    meta_description: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    updated_at: '',
  })

  const hasSeoTab = category !== 'film-motion'

  // Auto-generate slug (stops if user manually edits the slug)
  useEffect(() => {
    if (isNew && !slugManuallyEdited) {
      setSlug(generateSlug(title))
    }
  }, [title, isNew, slugManuallyEdited])

  // ============================================================
  // Load existing project
  // ============================================================

  const loadProject = useCallback(async () => {
    if (!id) return

    setLoading(true)

    try {
      const token = getAuthToken()
      const data = await gqlRequest<{ projectById: Project & {
        gallery_rows?: Array<ProjectGalleryRow & { images?: ProjectGalleryImage[] }>
        hero_slides?: ProjectHeroSlide[]
        blocks?: Array<ProjectBlock & { images?: ProjectBlockImage[] }>
      } }>(PROJECT_BY_ID_QUERY, { id }, token)

      const project = data.projectById
      if (!project) {
        toast.error('Projet introuvable')
        router.push('/admin/projects')
        return
      }

      // Set common fields
      setTitle(project.title)
      setSlug(project.slug)
      setSlugManuallyEdited(true) // Existing project = slug already set
      setCategory(project.category)
      setCoverImageUrl(project.cover_image_url || '')
      setCoverImageAlt(project.cover_image_alt || '')
      setProjectDate(project.project_date || '')
      setCardLabel(project.card_label || '')

      // SEO fields
      setSeoData({
        id: project.id,
        page_slug: project.slug,
        meta_title: project.meta_title || '',
        meta_description: project.meta_description || '',
        og_title: project.og_title || '',
        og_description: project.og_description || '',
        og_image_url: project.og_image_url || '',
        updated_at: '',
      })

      // Category-specific fields
      if (project.category === 'photography') {
        setPhotoLocation(project.photo_location || '')

        const rows = project.gallery_rows || []
        setGalleryRows(
          rows.map((row) => ({
            tempId: genTempId(),
            layout: row.layout,
            sort_order: row.sort_order,
            images: (row.images || [])
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((img) => ({
                tempId: genTempId(),
                image_url: img.image_url,
                alt_text: img.alt_text,
                sort_order: img.sort_order,
              })),
          }))
        )
      } else if (project.category === 'film-motion') {
        setFilmVideoUrl(project.film_video_url || '')
        setFilmBgImageUrl(project.film_bg_image_url || '')
        setFilmSubtitle(project.film_subtitle || '')
        setFilmLayout(project.film_layout || 'landscape')
      } else if (project.category === 'art-direction') {
        setArtClient(project.art_client || '')
        setArtRole(project.art_role || '')
        setArtDescription(project.art_description || '')
        setArtTags((project.art_tags || []).join(', '))
        setArtHeroLabel(project.art_hero_label || '')

        const slides = project.hero_slides || []
        setHeroSlides(
          ensureSlots(
            slides.map((s) => ({
              tempId: genTempId(),
              image_url: s.image_url,
              alt_text: s.alt_text || '',
              sort_order: s.sort_order,
            })),
            5
          )
        )

        const blocks = project.blocks || []
        setContentBlocks(
          blocks.map((b) => ({
            tempId: genTempId(),
            block_type: b.block_type,
            sort_order: b.sort_order,
            context_label: b.context_label || '',
            context_heading: b.context_heading || '',
            context_text: b.context_text || '',
            gallery_layout: b.gallery_layout || null,
            deliverables_items: b.deliverables_items || [],
            images: (b.images || b.project_block_images || [])
              .sort((a: ProjectBlockImage, b: ProjectBlockImage) => a.sort_order - b.sort_order)
              .map((img: ProjectBlockImage) => ({
                tempId: genTempId(),
                image_url: img.image_url,
                alt_text: img.alt_text,
                image_type: img.image_type,
                sort_order: img.sort_order,
              })),
          }))
        )
      }
    } catch (err) {
      toast.error('Erreur lors du chargement')
      router.push('/admin/projects')
    }

    setLoading(false)
  }, [id, router])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  // ============================================================
  // Save
  // ============================================================

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Le titre est requis')
      return
    }
    if (category !== 'film-motion' && !slug.trim()) {
      toast.error('Le slug est requis')
      return
    }

    setSaving(true)

    try {
      const token = getAuthToken()

      // Build project input
      const projectInput = {
        title: title.trim(),
        slug: slug.trim(),
        category,
        cover_image_url: coverImageUrl || '',
        cover_image_alt: coverImageAlt || '',
        project_date: projectDate || null,
        year: projectDate ? new Date(projectDate).getFullYear() : new Date().getFullYear(),
        sort_order: 0,
        is_published: true,
        card_label: cardLabel.trim() || null,
        photo_subcategory: null,
        photo_location: category === 'photography' ? photoLocation || null : null,
        film_video_url: category === 'film-motion' ? filmVideoUrl || null : null,
        film_bg_image_url: category === 'film-motion' ? filmBgImageUrl || null : null,
        film_subtitle: category === 'film-motion' ? filmSubtitle || null : null,
        film_layout: category === 'film-motion' ? filmLayout : null,
        art_client: category === 'art-direction' ? artClient || null : null,
        art_role: category === 'art-direction' ? artRole || null : null,
        art_description: category === 'art-direction' ? artDescription || null : null,
        art_tags:
          category === 'art-direction' && artTags.trim()
            ? artTags.split(',').map((t) => t.trim()).filter(Boolean)
            : null,
        art_hero_label: category === 'art-direction' ? artHeroLabel || null : null,
        meta_title: seoData.meta_title || '',
        meta_description: seoData.meta_description || '',
        og_title: seoData.og_title || '',
        og_description: seoData.og_description || '',
        og_image_url: seoData.og_image_url || '',
      }

      let projectId = id

      if (isNew) {
        const data = await gqlRequest<{ createProject: { id: string } }>(
          CREATE_PROJECT_MUTATION,
          { input: projectInput },
          token
        )
        projectId = data.createProject.id
      } else {
        await gqlRequest(
          UPDATE_PROJECT_MUTATION,
          { id, input: projectInput },
          token
        )
      }

      // ---- Category-specific related data ----

      if (category === 'photography' && projectId) {
        const rowsInput = galleryRows
          .filter((row) => row.images.some((img) => img.image_url))
          .map((row, ri) => {
            const validImages = row.images.filter((img) => img.image_url)
            const count = validImages.length
            const autoLayout = count <= 1 ? 'full' : count === 2 ? 'half' : count === 3 ? 'third' : 'quarter'
            return {
              sort_order: ri,
              layout: autoLayout,
              images: validImages.map((img, ii) => ({
                image_url: img.image_url,
                alt_text: img.alt_text,
                sort_order: ii,
              })),
            }
          })
        await gqlRequest(SAVE_GALLERY_ROWS_MUTATION, {
          projectId,
          rows: rowsInput,
        }, token)
      }

      if (category === 'art-direction' && projectId) {
        // Save hero slides (filter out empty slots)
        const validSlides = heroSlides.filter((s) => s.image_url)
        if (validSlides.length > 0) {
          await gqlRequest(SAVE_HERO_SLIDES_MUTATION, {
            projectId,
            slides: validSlides.map((s, i) => ({
              image_url: s.image_url,
              alt_text: s.alt_text,
              sort_order: i,
            })),
          }, token)
        }

        // Save content blocks
        const autoImageType = (count: number) =>
          count <= 1 ? 'full' : count === 2 ? 'landscape' : 'portrait'
        const autoGalleryLayout = (count: number) =>
          count <= 1 ? 'full' : count === 2 ? 'pair' : 'trio'

        const blocksInput = contentBlocks.map((block, bi) => {
          const validImages = block.images.filter((img) => img.image_url)
          const imgType = autoImageType(validImages.length)
          return {
            block_type: block.block_type,
            sort_order: bi,
            context_label: block.block_type === 'context' ? block.context_label || null : null,
            context_heading: block.block_type === 'context' ? block.context_heading || null : null,
            context_text: block.block_type === 'context' ? block.context_text || null : null,
            gallery_layout: block.block_type === 'gallery' ? autoGalleryLayout(validImages.length) : null,
            deliverables_items:
              block.block_type === 'deliverables' && block.deliverables_items.length > 0
                ? block.deliverables_items
                : null,
            images: validImages.map((img, ii) => ({
              image_url: img.image_url,
              alt_text: img.alt_text || '',
              image_type: block.block_type === 'gallery' ? imgType : img.image_type,
              sort_order: ii,
            })),
          }
        })
        await gqlRequest(SAVE_PROJECT_BLOCKS_MUTATION, {
          projectId,
          blocks: blocksInput,
        }, token)
      }

      if (isNew) {
        toast.success('Projet créé avec succès')
        router.push(`/admin/projects?category=${category}`)
      } else {
        toast.success('Projet mis à jour')
        // Reload data from server to confirm persistence
        await loadProject()
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      )
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // Gallery Rows helpers (Photography)
  // ============================================================

  const addGalleryRow = () => {
    const newId = genTempId()
    setGalleryRows((prev) => [
      ...prev,
      {
        tempId: newId,
        layout: 'full',
        sort_order: prev.length,
        images: [],
      },
    ])
    // Scroll vers la nouvelle rangée après le rendu
    requestAnimationFrame(() => {
      document.getElementById(`gallery-row-${newId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const removeGalleryRow = (tempId: string) => {
    setGalleryRows((prev) => prev.filter((r) => r.tempId !== tempId))
  }

  const updateGalleryRow = (
    tempId: string,
    field: keyof GalleryRowLocal,
    value: unknown
  ) => {
    setGalleryRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    )
  }

  const addGalleryImageWithUrl = (rowTempId: string, url: string) => {
    setGalleryRows((prev) =>
      prev.map((r) =>
        r.tempId === rowTempId
          ? {
              ...r,
              images: [
                ...r.images,
                {
                  tempId: genTempId(),
                  image_url: url,
                  alt_text: '',
                  sort_order: r.images.length,
                },
              ],
            }
          : r
      )
    )
  }

  const handleGalleryFileUpload = async (rowTempId: string, files: FileList | null) => {
    if (!files || files.length === 0) return
    const token = getAuthToken()
    const currentRow = galleryRows.find(r => r.tempId === rowTempId)
    const currentCount = currentRow ? currentRow.images.filter(img => img.image_url).length : 0
    const maxToAdd = 3 - currentCount

    for (let i = 0; i < Math.min(files.length, maxToAdd); i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dépasse 5 Mo`)
        continue
      }
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload échoué')
        }
        const data = await res.json()
        addGalleryImageWithUrl(rowTempId, data.url)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur upload')
      }
    }
  }

  const removeGalleryImage = (rowTempId: string, imgTempId: string) => {
    setGalleryRows((prev) =>
      prev.map((r) =>
        r.tempId === rowTempId
          ? { ...r, images: r.images.filter((i) => i.tempId !== imgTempId) }
          : r
      )
    )
  }

  const updateGalleryImage = (
    rowTempId: string,
    imgTempId: string,
    field: keyof GalleryImageLocal,
    value: string
  ) => {
    setGalleryRows((prev) =>
      prev.map((r) =>
        r.tempId === rowTempId
          ? {
              ...r,
              images: r.images.map((i) =>
                i.tempId === imgTempId ? { ...i, [field]: value } : i
              ),
            }
          : r
      )
    )
  }

  // ============================================================
  // Content Blocks helpers (Art Direction)
  // ============================================================

  const addContentBlock = () => {
    setContentBlocks((prev) => [
      ...prev,
      {
        tempId: genTempId(),
        block_type: 'gallery',
        sort_order: prev.length,
        context_label: '',
        context_heading: '',
        context_text: '',
        gallery_layout: 'full',
        deliverables_items: [],
        images: [],
      },
    ])
  }

  const removeContentBlock = (tempId: string) => {
    setContentBlocks((prev) => prev.filter((b) => b.tempId !== tempId))
  }

  const updateContentBlock = (
    tempId: string,
    field: keyof ContentBlockLocal,
    value: unknown
  ) => {
    setContentBlocks((prev) =>
      prev.map((b) => (b.tempId === tempId ? { ...b, [field]: value } : b))
    )
  }

  const handleBlockGalleryUpload = async (blockTempId: string, files: FileList | null) => {
    if (!files || files.length === 0) return
    const token = getAuthToken()
    const currentBlock = contentBlocks.find((b) => b.tempId === blockTempId)
    const currentCount = currentBlock ? currentBlock.images.filter((img) => img.image_url).length : 0
    const maxToAdd = 3 - currentCount

    for (let i = 0; i < Math.min(files.length, maxToAdd); i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dépasse 5 Mo`)
        continue
      }
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload échoué')
        }
        const data = await res.json()
        setContentBlocks((prev) =>
          prev.map((b) =>
            b.tempId === blockTempId
              ? {
                  ...b,
                  images: [
                    ...b.images,
                    {
                      tempId: genTempId(),
                      image_url: data.url,
                      alt_text: '',
                      image_type: 'landscape' as const,
                      sort_order: b.images.length,
                    },
                  ],
                }
              : b
          )
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur upload')
      }
    }
  }

  const removeBlockImage = (blockTempId: string, imgTempId: string) => {
    setContentBlocks((prev) =>
      prev.map((b) =>
        b.tempId === blockTempId
          ? { ...b, images: b.images.filter((i) => i.tempId !== imgTempId) }
          : b
      )
    )
  }

  // Deliverables helpers
  const addDeliverable = (blockTempId: string) => {
    setContentBlocks((prev) =>
      prev.map((b) =>
        b.tempId === blockTempId
          ? {
              ...b,
              deliverables_items: [
                ...b.deliverables_items,
                { number: String(b.deliverables_items.length + 1).padStart(2, '0'), name: '' },
              ],
            }
          : b
      )
    )
  }

  const removeDeliverable = (blockTempId: string, index: number) => {
    setContentBlocks((prev) =>
      prev.map((b) =>
        b.tempId === blockTempId
          ? {
              ...b,
              deliverables_items: b.deliverables_items.filter((_, i) => i !== index),
            }
          : b
      )
    )
  }

  const updateDeliverable = (
    blockTempId: string,
    index: number,
    field: keyof DeliverableItem,
    value: string
  ) => {
    setContentBlocks((prev) =>
      prev.map((b) =>
        b.tempId === blockTempId
          ? {
              ...b,
              deliverables_items: b.deliverables_items.map((d, i) =>
                i === index ? { ...d, [field]: value } : d
              ),
            }
          : b
      )
    )
  }

  // Move block up/down
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setContentBlocks((prev) => {
      const next = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= next.length) return prev
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return next
    })
  }

  const moveGalleryRow = (index: number, direction: 'up' | 'down') => {
    setGalleryRows((prev) => {
      const next = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= next.length) return prev
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return next
    })
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
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/projects?category=${category}`}
            className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'Nouveau projet' : 'Modifier le projet'}
            </h1>
          </div>
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

      {/* Tabs Contenu / SEO (photography & art-direction only) */}
      {hasSeoTab && !isNew && (
        <PageTabs activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* ============================== */}
      {/* SEO Tab */}
      {/* ============================== */}
      {hasSeoTab && !isNew && activeTab === 'seo' && (
        <div className="mt-8">
          <SeoTabEditor
            seoData={seoData}
            onChange={(partial) => setSeoData((prev) => ({ ...prev, ...partial }))}
            displayPath={`works/${slug}`}
          />
        </div>
      )}

      {/* ============================== */}
      {/* Content Tab */}
      {/* ============================== */}
      <div className="space-y-8" style={{ display: (!hasSeoTab || isNew || activeTab === 'content') ? undefined : 'none' }}>
        {/* ============================================== */}
        {/* Common Fields */}
        {/* ============================================== */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Informations générales
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Titre du projet"
              />
            </div>

            {/* Slug — masqué pour film-motion (pas de page individuelle) */}
            {category !== 'film-motion' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value)
                    setSlugManuallyEdited(true)
                  }}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="slug-du-projet"
                />
              </div>
            )}

            {/* Date */}
            <DatePicker
              value={projectDate}
              onChange={setProjectDate}
              label="Date"
            />

            {/* Featuring — masqué pour film-motion */}
            {category !== 'film-motion' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Featuring
                </label>
                <input
                  type="text"
                  value={cardLabel}
                  onChange={(e) => setCardLabel(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: Studio Harcourt"
                />
              </div>
            )}
          </div>

          {/* Cover image — masqué pour film-motion */}
          {category !== 'film-motion' && (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <ImageUpload
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                folder="projects/covers"
                label="Image de couverture"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Texte alternatif (couverture)
                </label>
                <input
                  type="text"
                  value={coverImageAlt}
                  onChange={(e) => setCoverImageAlt(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Description de l'image"
                />
              </div>
            </div>
          )}
        </section>

        {/* ============================================== */}
        {/* Photography Fields */}
        {/* ============================================== */}
        {category === 'photography' && (
          <>
            {/* Lieu */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Détails
              </h2>
              <div className="max-w-md">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Lieu
                </label>
                <input
                  type="text"
                  value={photoLocation}
                  onChange={(e) => setPhotoLocation(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: Paris, France"
                />
              </div>
            </section>

            {/* Gallery Rows — Thumbnails compacts */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Galerie
                </h2>
                <button
                  type="button"
                  onClick={addGalleryRow}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter une rangée
                </button>
              </div>

              <div className="space-y-4">
                {galleryRows.map((row, rowIndex) => (
                  <div
                    key={row.tempId}
                    id={`gallery-row-${row.tempId}`}
                    className="rounded-md border border-gray-200 bg-gray-50 p-4"
                  >
                    {/* Row header */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Rangée {rowIndex + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveGalleryRow(rowIndex, 'up')}
                          disabled={rowIndex === 0}
                          className="rounded p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryRow(rowIndex, 'down')}
                          disabled={rowIndex === galleryRows.length - 1}
                          className="rounded p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryRow(row.tempId)}
                          className="rounded p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Images as horizontal thumbnails */}
                    <div className="flex flex-wrap gap-3">
                      {row.images.filter(img => img.image_url).map((img) => (
                        <div key={img.tempId} className="w-28">
                          <div className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            <img
                              src={img.image_url}
                              alt={img.alt_text || ''}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(row.tempId, img.tempId)}
                              className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-gray-500 opacity-0 shadow-sm transition-opacity hover:text-red-500 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={img.alt_text}
                            onChange={(e) =>
                              updateGalleryImage(row.tempId, img.tempId, 'alt_text', e.target.value)
                            }
                            placeholder="Alt"
                            className="mt-1 w-full rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-600 placeholder-gray-400 outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}

                      {/* Bouton + : ouvre directement le sélecteur de fichiers (max 3 par rangée) */}
                      {row.images.filter(img => img.image_url).length < 3 && (
                        <label className="flex aspect-square w-28 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600">
                          <Plus className="h-5 w-5" />
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              handleGalleryFileUpload(row.tempId, e.target.files)
                              e.target.value = ''
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}

                {galleryRows.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Aucune rangée. Cliquez sur &quot;Ajouter une rangée&quot; pour commencer.
                  </p>
                )}
              </div>
            </section>
          </>
        )}

        {/* ============================================== */}
        {/* Film/Motion Fields */}
        {/* ============================================== */}
        {category === 'film-motion' && (
          <>
            {/* Sous-titre */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Détails
              </h2>
              <div className="max-w-md">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={filmSubtitle}
                  onChange={(e) => setFilmSubtitle(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: Reel 2026"
                />
              </div>
            </section>

            {/* Format vidéo */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Format vidéo
              </h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFilmLayout('landscape')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    filmLayout === 'landscape'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`flex h-16 w-28 items-center justify-center rounded border ${
                    filmLayout === 'landscape' ? 'border-blue-300 bg-blue-100' : 'border-gray-300 bg-gray-100'
                  }`}>
                    <svg width="24" height="14" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="1.5" className={filmLayout === 'landscape' ? 'text-blue-600' : 'text-gray-400'}>
                      <rect x="1" y="1" width="22" height="12" rx="1" />
                      <polygon points="10,4 10,10 15,7" fill="currentColor" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${filmLayout === 'landscape' ? 'text-blue-700' : 'text-gray-600'}`}>
                    Horizontal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilmLayout('vertical')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    filmLayout === 'vertical'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`flex h-16 w-10 items-center justify-center rounded border ${
                    filmLayout === 'vertical' ? 'border-blue-300 bg-blue-100' : 'border-gray-300 bg-gray-100'
                  }`}>
                    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5" className={filmLayout === 'vertical' ? 'text-blue-600' : 'text-gray-400'}>
                      <rect x="1" y="1" width="8" height="12" rx="1" />
                      <polygon points="4,4 4,10 7,7" fill="currentColor" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${filmLayout === 'vertical' ? 'text-blue-700' : 'text-gray-600'}`}>
                    Vertical
                  </span>
                </button>
              </div>
              {filmLayout === 'vertical' && (
                <p className="mt-3 text-xs text-gray-500">
                  Le format vertical affichera la photo de fond à gauche (sans filtre) et la vidéo à droite (avec overlay flou).
                </p>
              )}
            </section>

            {/* Médias */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Médias
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ImageUpload
                  value={filmVideoUrl}
                  onChange={setFilmVideoUrl}
                  folder="projects/videos"
                  accept="video"
                  label="Vidéo"
                  aspectRatio="16/9"
                />
                <ImageUpload
                  value={filmBgImageUrl}
                  onChange={setFilmBgImageUrl}
                  folder="projects/film-bg"
                  label="Image d'arrière-plan"
                  aspectRatio="16/9"
                />
              </div>
            </section>
          </>
        )}

        {/* ============================================== */}
        {/* Art Direction Fields */}
        {/* ============================================== */}
        {category === 'art-direction' && (
          <>
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Direction Artistique
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <input
                    type="text"
                    value={artClient}
                    onChange={(e) => setArtClient(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    value={artRole}
                    onChange={(e) => setArtRole(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Votre rôle"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={artDescription}
                  onChange={(e) => setArtDescription(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Description du projet"
                />
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={artTags}
                  onChange={(e) => setArtTags(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Branding, Web Design, ..."
                />
              </div>
            </section>

            {/* Hero Slides */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Slides Hero
              </h2>
              <HeroSlidesEditor
                slides={heroSlides}
                onSlidesChange={setHeroSlides}
                maxSlots={5}
              />
            </section>

            {/* Content Blocks */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Blocs de contenu ({contentBlocks.length})
                </h2>
                <button
                  type="button"
                  onClick={addContentBlock}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter un bloc
                </button>
              </div>

              <div className="space-y-4">
                {contentBlocks.map((block, blockIndex) => (
                  <div
                    key={block.tempId}
                    className="rounded-md border border-gray-200 bg-gray-50 p-4"
                  >
                    {/* Block header */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Bloc {blockIndex + 1}
                        </span>
                        <select
                          value={block.block_type}
                          onChange={(e) =>
                            updateContentBlock(
                              block.tempId,
                              'block_type',
                              e.target.value
                            )
                          }
                          className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-900"
                        >
                          {BLOCK_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveBlock(blockIndex, 'up')}
                          disabled={blockIndex === 0}
                          className="rounded p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(blockIndex, 'down')}
                          disabled={blockIndex === contentBlocks.length - 1}
                          className="rounded p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeContentBlock(block.tempId)}
                          className="rounded p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Context block fields */}
                    {block.block_type === 'context' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">
                              Label
                            </label>
                            <input
                              type="text"
                              value={block.context_label}
                              onChange={(e) =>
                                updateContentBlock(
                                  block.tempId,
                                  'context_label',
                                  e.target.value
                                )
                              }
                              className="block w-full rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500"
                              placeholder="Label du contexte"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">
                              Titre
                            </label>
                            <input
                              type="text"
                              value={block.context_heading}
                              onChange={(e) =>
                                updateContentBlock(
                                  block.tempId,
                                  'context_heading',
                                  e.target.value
                                )
                              }
                              className="block w-full rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500"
                              placeholder="Titre du contexte"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-500">
                            Texte
                          </label>
                          <textarea
                            value={block.context_text}
                            onChange={(e) =>
                              updateContentBlock(
                                block.tempId,
                                'context_text',
                                e.target.value
                              )
                            }
                            rows={3}
                            className="block w-full rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500"
                            placeholder="Texte du contexte"
                          />
                        </div>
                      </div>
                    )}

                    {/* Gallery block fields */}
                    {block.block_type === 'gallery' && (
                      <div className="flex flex-wrap gap-3">
                        {block.images.filter(img => img.image_url).map((img) => (
                          <div key={img.tempId} className="w-28">
                            <div className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                              <img
                                src={img.image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeBlockImage(block.tempId, img.tempId)}
                                className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-gray-500 opacity-0 shadow-sm transition-opacity hover:text-red-500 group-hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {block.images.filter(img => img.image_url).length < 3 && (
                          <label className="flex aspect-square w-28 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600">
                            <Plus className="h-5 w-5" />
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                handleBlockGalleryUpload(block.tempId, e.target.files)
                                e.target.value = ''
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )}

                    {/* Deliverables block fields */}
                    {block.block_type === 'deliverables' && (
                      <div className="space-y-3">
                        {block.deliverables_items.map((item, di) => (
                          <div
                            key={di}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="text"
                              value={item.number}
                              onChange={(e) =>
                                updateDeliverable(
                                  block.tempId,
                                  di,
                                  'number',
                                  e.target.value
                                )
                              }
                              className="w-16 rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 outline-none focus:border-blue-500"
                              placeholder="01"
                            />
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                updateDeliverable(
                                  block.tempId,
                                  di,
                                  'name',
                                  e.target.value
                                )
                              }
                              className="flex-1 rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500"
                              placeholder="Nom du livrable"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeDeliverable(block.tempId, di)
                              }
                              className="rounded p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addDeliverable(block.tempId)}
                          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                        >
                          <Plus className="h-3 w-3" />
                          Ajouter un livrable
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
