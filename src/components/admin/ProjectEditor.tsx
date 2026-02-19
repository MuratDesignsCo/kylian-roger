'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
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
import type {
  Project,
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

interface HeroSlideLocal {
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

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'photography', label: 'Photographie' },
  { value: 'film-motion', label: 'Film / Motion' },
  { value: 'art-direction', label: 'Direction Artistique' },
]

const LAYOUT_OPTIONS = [
  { value: 'full', label: 'Pleine largeur' },
  { value: 'half', label: 'Moitie (2 cols)' },
  { value: 'third', label: 'Tiers (3 cols)' },
  { value: 'quarter', label: 'Quart (4 cols)' },
] as const

const BLOCK_TYPE_OPTIONS = [
  { value: 'gallery', label: 'Galerie' },
  { value: 'context', label: 'Contexte' },
  { value: 'deliverables', label: 'Livrables' },
] as const

const GALLERY_LAYOUT_OPTIONS = [
  { value: 'full', label: 'Pleine largeur' },
  { value: 'pair', label: 'Paire' },
  { value: 'trio', label: 'Trio' },
  { value: 'pair-full', label: 'Paire + Pleine' },
] as const

const IMAGE_TYPE_OPTIONS = [
  { value: 'landscape', label: 'Paysage' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'full', label: 'Pleine' },
] as const

// ============================================================
// Component
// ============================================================

export default function ProjectEditorPage({ id }: ProjectEditorProps) {
  const router = useRouter()
  const isNew = !id

  // Loading
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  // Common fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState<Category>('photography')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImageAlt, setCoverImageAlt] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [sortOrder, setSortOrder] = useState(0)
  const [isPublished, setIsPublished] = useState(false)
  const [cardLabel, setCardLabel] = useState('')

  // Photography fields
  const [photoSubcategory, setPhotoSubcategory] = useState('')
  const [photoLocation, setPhotoLocation] = useState('')
  const [galleryRows, setGalleryRows] = useState<GalleryRowLocal[]>([])

  // Film/Motion fields
  const [filmVideoUrl, setFilmVideoUrl] = useState('')
  const [filmBgImageUrl, setFilmBgImageUrl] = useState('')
  const [filmSubtitle, setFilmSubtitle] = useState('')

  // Art Direction fields
  const [artClient, setArtClient] = useState('')
  const [artRole, setArtRole] = useState('')
  const [artDescription, setArtDescription] = useState('')
  const [artTags, setArtTags] = useState('')
  const [artHeroLabel, setArtHeroLabel] = useState('')
  const [heroSlides, setHeroSlides] = useState<HeroSlideLocal[]>([])
  const [contentBlocks, setContentBlocks] = useState<ContentBlockLocal[]>([])

  // Auto-generate slug for new projects
  useEffect(() => {
    if (isNew) {
      setSlug(generateSlug(title))
    }
  }, [title, isNew])

  // ============================================================
  // Load existing project
  // ============================================================

  const loadProject = useCallback(async () => {
    if (!id) return

    setLoading(true)

    // Fetch main project
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !project) {
      toast.error('Projet introuvable')
      router.push('/admin/projects')
      return
    }

    // Set common fields
    setTitle(project.title)
    setSlug(project.slug)
    setCategory(project.category)
    setCoverImageUrl(project.cover_image_url || '')
    setCoverImageAlt(project.cover_image_alt || '')
    setYear(project.year)
    setSortOrder(project.sort_order)
    setIsPublished(project.is_published)
    setCardLabel(project.card_label || '')

    // Category-specific fields
    if (project.category === 'photography') {
      setPhotoSubcategory(project.photo_subcategory || '')
      setPhotoLocation(project.photo_location || '')

      // Fetch gallery rows with images
      const { data: rows } = await supabase
        .from('project_gallery_rows')
        .select('*, project_gallery_images(*)')
        .eq('project_id', id)
        .order('sort_order', { ascending: true })

      if (rows) {
        setGalleryRows(
          rows.map((row: ProjectGalleryRow) => ({
            tempId: genTempId(),
            layout: row.layout,
            sort_order: row.sort_order,
            images: (row.project_gallery_images || [])
              .sort((a: ProjectGalleryImage, b: ProjectGalleryImage) => a.sort_order - b.sort_order)
              .map((img: ProjectGalleryImage) => ({
                tempId: genTempId(),
                image_url: img.image_url,
                alt_text: img.alt_text,
                sort_order: img.sort_order,
              })),
          }))
        )
      }
    } else if (project.category === 'film-motion') {
      setFilmVideoUrl(project.film_video_url || '')
      setFilmBgImageUrl(project.film_bg_image_url || '')
      setFilmSubtitle(project.film_subtitle || '')
    } else if (project.category === 'art-direction') {
      setArtClient(project.art_client || '')
      setArtRole(project.art_role || '')
      setArtDescription(project.art_description || '')
      setArtTags((project.art_tags || []).join(', '))
      setArtHeroLabel(project.art_hero_label || '')

      // Fetch hero slides
      const { data: slides } = await supabase
        .from('project_hero_slides')
        .select('*')
        .eq('project_id', id)
        .order('sort_order', { ascending: true })

      if (slides) {
        setHeroSlides(
          slides.map((s: ProjectHeroSlide) => ({
            tempId: genTempId(),
            image_url: s.image_url,
            alt_text: s.alt_text,
            sort_order: s.sort_order,
          }))
        )
      }

      // Fetch content blocks with images
      const { data: blocks } = await supabase
        .from('project_blocks')
        .select('*, project_block_images(*)')
        .eq('project_id', id)
        .order('sort_order', { ascending: true })

      if (blocks) {
        setContentBlocks(
          blocks.map((b: ProjectBlock) => ({
            tempId: genTempId(),
            block_type: b.block_type,
            sort_order: b.sort_order,
            context_label: b.context_label || '',
            context_heading: b.context_heading || '',
            context_text: b.context_text || '',
            gallery_layout: b.gallery_layout || null,
            deliverables_items: b.deliverables_items || [],
            images: (b.project_block_images || [])
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
    if (!slug.trim()) {
      toast.error('Le slug est requis')
      return
    }

    setSaving(true)

    try {
      // Build project record
      const projectData: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim(),
        category,
        cover_image_url: coverImageUrl || null,
        cover_image_alt: coverImageAlt || null,
        year,
        sort_order: sortOrder,
        is_published: isPublished,
        card_label: cardLabel.trim() || null,
        // Photography
        photo_subcategory: category === 'photography' ? photoSubcategory || null : null,
        photo_location: category === 'photography' ? photoLocation || null : null,
        // Film/Motion
        film_video_url: category === 'film-motion' ? filmVideoUrl || null : null,
        film_bg_image_url: category === 'film-motion' ? filmBgImageUrl || null : null,
        film_subtitle: category === 'film-motion' ? filmSubtitle || null : null,
        // Art Direction
        art_client: category === 'art-direction' ? artClient || null : null,
        art_role: category === 'art-direction' ? artRole || null : null,
        art_description: category === 'art-direction' ? artDescription || null : null,
        art_tags:
          category === 'art-direction' && artTags.trim()
            ? artTags.split(',').map((t) => t.trim()).filter(Boolean)
            : null,
        art_hero_label: category === 'art-direction' ? artHeroLabel || null : null,
      }

      let projectId = id

      if (isNew) {
        // Insert new project
        const { data, error } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single()

        if (error) throw new Error(error.message)
        projectId = data.id
      } else {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', id)

        if (error) throw new Error(error.message)
      }

      // ---- Category-specific related data ----

      if (category === 'photography' && projectId) {
        // Delete existing gallery rows + images (cascade)
        if (!isNew) {
          await supabase
            .from('project_gallery_rows')
            .delete()
            .eq('project_id', projectId)
        }

        // Insert new gallery rows and images
        for (let ri = 0; ri < galleryRows.length; ri++) {
          const row = galleryRows[ri]
          const { data: insertedRow, error: rowError } = await supabase
            .from('project_gallery_rows')
            .insert({
              project_id: projectId,
              layout: row.layout,
              sort_order: ri,
            })
            .select()
            .single()

          if (rowError) throw new Error(rowError.message)

          if (row.images.length > 0) {
            const imageInserts = row.images.map((img, ii) => ({
              row_id: insertedRow.id,
              project_id: projectId,
              image_url: img.image_url,
              alt_text: img.alt_text,
              sort_order: ii,
            }))

            const { error: imgError } = await supabase
              .from('project_gallery_images')
              .insert(imageInserts)

            if (imgError) throw new Error(imgError.message)
          }
        }
      }

      if (category === 'art-direction' && projectId) {
        // Delete existing hero slides, blocks, block images
        if (!isNew) {
          await supabase
            .from('project_hero_slides')
            .delete()
            .eq('project_id', projectId)
          await supabase
            .from('project_blocks')
            .delete()
            .eq('project_id', projectId)
        }

        // Insert hero slides
        if (heroSlides.length > 0) {
          const slideInserts = heroSlides.map((s, i) => ({
            project_id: projectId,
            image_url: s.image_url,
            alt_text: s.alt_text,
            sort_order: i,
          }))
          const { error: slideErr } = await supabase
            .from('project_hero_slides')
            .insert(slideInserts)
          if (slideErr) throw new Error(slideErr.message)
        }

        // Insert content blocks + their images
        for (let bi = 0; bi < contentBlocks.length; bi++) {
          const block = contentBlocks[bi]
          const blockData: Record<string, unknown> = {
            project_id: projectId,
            block_type: block.block_type,
            sort_order: bi,
            context_label: block.block_type === 'context' ? block.context_label || null : null,
            context_heading: block.block_type === 'context' ? block.context_heading || null : null,
            context_text: block.block_type === 'context' ? block.context_text || null : null,
            gallery_layout: block.block_type === 'gallery' ? block.gallery_layout : null,
            deliverables_items:
              block.block_type === 'deliverables' && block.deliverables_items.length > 0
                ? block.deliverables_items
                : null,
          }

          const { data: insertedBlock, error: blockErr } = await supabase
            .from('project_blocks')
            .insert(blockData)
            .select()
            .single()

          if (blockErr) throw new Error(blockErr.message)

          if (block.images.length > 0) {
            const imgInserts = block.images.map((img, ii) => ({
              block_id: insertedBlock.id,
              image_url: img.image_url,
              alt_text: img.alt_text,
              image_type: img.image_type,
              sort_order: ii,
            }))
            const { error: imgErr } = await supabase
              .from('project_block_images')
              .insert(imgInserts)
            if (imgErr) throw new Error(imgErr.message)
          }
        }
      }

      toast.success(isNew ? 'Projet cree avec succes' : 'Projet mis a jour')

      if (isNew) {
        router.push('/admin/projects')
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
    setGalleryRows((prev) => [
      ...prev,
      {
        tempId: genTempId(),
        layout: 'full',
        sort_order: prev.length,
        images: [],
      },
    ])
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

  const addGalleryImage = (rowTempId: string) => {
    setGalleryRows((prev) =>
      prev.map((r) =>
        r.tempId === rowTempId
          ? {
              ...r,
              images: [
                ...r.images,
                {
                  tempId: genTempId(),
                  image_url: '',
                  alt_text: '',
                  sort_order: r.images.length,
                },
              ],
            }
          : r
      )
    )
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
  // Hero Slides helpers (Art Direction)
  // ============================================================

  const addHeroSlide = () => {
    setHeroSlides((prev) => [
      ...prev,
      {
        tempId: genTempId(),
        image_url: '',
        alt_text: '',
        sort_order: prev.length,
      },
    ])
  }

  const removeHeroSlide = (tempId: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.tempId !== tempId))
  }

  const updateHeroSlide = (
    tempId: string,
    field: keyof HeroSlideLocal,
    value: string
  ) => {
    setHeroSlides((prev) =>
      prev.map((s) => (s.tempId === tempId ? { ...s, [field]: value } : s))
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

  const addBlockImage = (blockTempId: string) => {
    setContentBlocks((prev) =>
      prev.map((b) =>
        b.tempId === blockTempId
          ? {
              ...b,
              images: [
                ...b.images,
                {
                  tempId: genTempId(),
                  image_url: '',
                  alt_text: '',
                  image_type: 'landscape' as const,
                  sort_order: b.images.length,
                },
              ],
            }
          : b
      )
    )
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

  const updateBlockImage = (
    blockTempId: string,
    imgTempId: string,
    field: keyof BlockImageLocal,
    value: string
  ) => {
    setContentBlocks((prev) =>
      prev.map((b) =>
        b.tempId === blockTempId
          ? {
              ...b,
              images: b.images.map((i) =>
                i.tempId === imgTempId ? { ...i, [field]: value } : i
              ),
            }
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
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isNew ? 'Nouveau projet' : 'Modifier le projet'}
            </h1>
            {!isNew && (
              <p className="mt-1 text-sm text-zinc-500">ID: {id}</p>
            )}
          </div>
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

      <div className="space-y-8">
        {/* ============================================== */}
        {/* Common Fields */}
        {/* ============================================== */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Informations generales
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="Titre du projet"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="slug-du-projet"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Categorie {!isNew && '(non modifiable)'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                disabled={!isNew}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Annee
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            {/* Card label */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Label carte
              </label>
              <input
                type="text"
                value={cardLabel}
                onChange={(e) => setCardLabel(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="Ex: Ft. Studio XYZ"
              />
            </div>

            {/* Sort order */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Ordre de tri
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            {/* Published */}
            <div className="flex items-center gap-3 pt-6">
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors"
                style={{
                  backgroundColor: isPublished ? '#22c55e' : '#3f3f46',
                }}
              >
                <span
                  className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                  style={{
                    transform: isPublished
                      ? 'translateX(18px)'
                      : 'translateX(3px)',
                  }}
                />
              </button>
              <label className="text-sm font-medium text-zinc-300">
                Publie
              </label>
            </div>
          </div>

          {/* Cover image */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ImageUpload
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              folder="projects/covers"
              label="Image de couverture"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Texte alternatif (couverture)
              </label>
              <input
                type="text"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="Description de l'image"
              />
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* Photography Fields */}
        {/* ============================================== */}
        {category === 'photography' && (
          <>
            <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Photographie
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Sous-categorie
                  </label>
                  <input
                    type="text"
                    value={photoSubcategory}
                    onChange={(e) => setPhotoSubcategory(e.target.value)}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    placeholder="Ex: Portrait, Paysage..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={photoLocation}
                    onChange={(e) => setPhotoLocation(e.target.value)}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    placeholder="Ex: Paris, France"
                  />
                </div>
              </div>
            </section>

            {/* Gallery Rows */}
            <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Galerie ({galleryRows.length} rangee{galleryRows.length > 1 ? 's' : ''})
                </h2>
                <button
                  type="button"
                  onClick={addGalleryRow}
                  className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter une rangee
                </button>
              </div>

              <div className="space-y-4">
                {galleryRows.map((row, rowIndex) => (
                  <div
                    key={row.tempId}
                    className="rounded-md border border-zinc-700 bg-zinc-800 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm font-medium text-zinc-300">
                          Rangee {rowIndex + 1}
                        </span>
                        <select
                          value={row.layout}
                          onChange={(e) =>
                            updateGalleryRow(row.tempId, 'layout', e.target.value)
                          }
                          className="rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-white"
                        >
                          {LAYOUT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveGalleryRow(rowIndex, 'up')}
                          disabled={rowIndex === 0}
                          className="rounded p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryRow(rowIndex, 'down')}
                          disabled={rowIndex === galleryRows.length - 1}
                          className="rounded p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryRow(row.tempId)}
                          className="rounded p-1 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Images in row */}
                    <div className="space-y-3">
                      {row.images.map((img) => (
                        <div
                          key={img.tempId}
                          className="flex items-start gap-3 rounded border border-zinc-600 bg-zinc-750 p-3"
                        >
                          <div className="w-40 shrink-0">
                            <ImageUpload
                              value={img.image_url}
                              onChange={(url) =>
                                updateGalleryImage(row.tempId, img.tempId, 'image_url', url)
                              }
                              folder="projects/gallery"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={img.alt_text}
                              onChange={(e) =>
                                updateGalleryImage(
                                  row.tempId,
                                  img.tempId,
                                  'alt_text',
                                  e.target.value
                                )
                              }
                              placeholder="Texte alternatif"
                              className="block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(row.tempId, img.tempId)}
                            className="shrink-0 rounded p-1 text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addGalleryImage(row.tempId)}
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                        Ajouter une image
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ============================================== */}
        {/* Film/Motion Fields */}
        {/* ============================================== */}
        {category === 'film-motion' && (
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Film / Motion
            </h2>
            <div className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={filmSubtitle}
                  onChange={(e) => setFilmSubtitle(e.target.value)}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  placeholder="Sous-titre du film"
                />
              </div>
              <ImageUpload
                value={filmVideoUrl}
                onChange={setFilmVideoUrl}
                folder="projects/videos"
                accept="video"
                label="Video"
              />
              <ImageUpload
                value={filmBgImageUrl}
                onChange={setFilmBgImageUrl}
                folder="projects/film-bg"
                label="Image d'arriere-plan"
              />
            </div>
          </section>
        )}

        {/* ============================================== */}
        {/* Art Direction Fields */}
        {/* ============================================== */}
        {category === 'art-direction' && (
          <>
            <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Direction Artistique
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Client
                  </label>
                  <input
                    type="text"
                    value={artClient}
                    onChange={(e) => setArtClient(e.target.value)}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Role
                  </label>
                  <input
                    type="text"
                    value={artRole}
                    onChange={(e) => setArtRole(e.target.value)}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    placeholder="Votre role"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Description
                </label>
                <textarea
                  value={artDescription}
                  onChange={(e) => setArtDescription(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  placeholder="Description du projet"
                />
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Tags (separes par des virgules)
                  </label>
                  <input
                    type="text"
                    value={artTags}
                    onChange={(e) => setArtTags(e.target.value)}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    placeholder="Branding, Web Design, ..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Label Hero
                  </label>
                  <input
                    type="text"
                    value={artHeroLabel}
                    onChange={(e) => setArtHeroLabel(e.target.value)}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    placeholder="Label affiche sur le hero"
                  />
                </div>
              </div>
            </section>

            {/* Hero Slides */}
            <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Slides Hero ({heroSlides.length})
                </h2>
                <button
                  type="button"
                  onClick={addHeroSlide}
                  className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter un slide
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {heroSlides.map((slide, i) => (
                  <div
                    key={slide.tempId}
                    className="relative rounded-md border border-zinc-700 bg-zinc-800 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">
                        Slide {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeHeroSlide(slide.tempId)}
                        className="rounded p-1 text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <ImageUpload
                      value={slide.image_url}
                      onChange={(url) =>
                        updateHeroSlide(slide.tempId, 'image_url', url)
                      }
                      folder="projects/hero-slides"
                    />
                    <input
                      type="text"
                      value={slide.alt_text}
                      onChange={(e) =>
                        updateHeroSlide(slide.tempId, 'alt_text', e.target.value)
                      }
                      placeholder="Texte alternatif"
                      className="mt-2 block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Content Blocks */}
            <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Blocs de contenu ({contentBlocks.length})
                </h2>
                <button
                  type="button"
                  onClick={addContentBlock}
                  className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter un bloc
                </button>
              </div>

              <div className="space-y-4">
                {contentBlocks.map((block, blockIndex) => (
                  <div
                    key={block.tempId}
                    className="rounded-md border border-zinc-700 bg-zinc-800 p-4"
                  >
                    {/* Block header */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm font-medium text-zinc-300">
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
                          className="rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-white"
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
                          className="rounded p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(blockIndex, 'down')}
                          disabled={blockIndex === contentBlocks.length - 1}
                          className="rounded p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeContentBlock(block.tempId)}
                          className="rounded p-1 text-zinc-500 hover:text-red-400"
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
                            <label className="mb-1 block text-xs font-medium text-zinc-400">
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
                              className="block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                              placeholder="Label du contexte"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-400">
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
                              className="block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                              placeholder="Titre du contexte"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-zinc-400">
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
                            className="block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                            placeholder="Texte du contexte"
                          />
                        </div>
                      </div>
                    )}

                    {/* Gallery block fields */}
                    {block.block_type === 'gallery' && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-zinc-400">
                            Disposition
                          </label>
                          <select
                            value={block.gallery_layout || 'full'}
                            onChange={(e) =>
                              updateContentBlock(
                                block.tempId,
                                'gallery_layout',
                                e.target.value
                              )
                            }
                            className="rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-white"
                          >
                            {GALLERY_LAYOUT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Block images */}
                        <div className="space-y-2">
                          {block.images.map((img) => (
                            <div
                              key={img.tempId}
                              className="flex items-start gap-3 rounded border border-zinc-600 p-3"
                            >
                              <div className="w-32 shrink-0">
                                <ImageUpload
                                  value={img.image_url}
                                  onChange={(url) =>
                                    updateBlockImage(
                                      block.tempId,
                                      img.tempId,
                                      'image_url',
                                      url
                                    )
                                  }
                                  folder="projects/blocks"
                                />
                              </div>
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={img.alt_text}
                                  onChange={(e) =>
                                    updateBlockImage(
                                      block.tempId,
                                      img.tempId,
                                      'alt_text',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Texte alternatif"
                                  className="block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                                />
                                <select
                                  value={img.image_type}
                                  onChange={(e) =>
                                    updateBlockImage(
                                      block.tempId,
                                      img.tempId,
                                      'image_type',
                                      e.target.value
                                    )
                                  }
                                  className="rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-white"
                                >
                                  {IMAGE_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeBlockImage(block.tempId, img.tempId)
                                }
                                className="shrink-0 rounded p-1 text-zinc-500 hover:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addBlockImage(block.tempId)}
                            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                            Ajouter une image
                          </button>
                        </div>
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
                              className="w-16 rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white outline-none focus:border-zinc-500"
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
                              className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                              placeholder="Nom du livrable"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeDeliverable(block.tempId, di)
                              }
                              className="rounded p-1 text-zinc-500 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addDeliverable(block.tempId)}
                          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
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
