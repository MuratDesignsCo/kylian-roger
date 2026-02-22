'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { gqlRequest, UPLOAD_URL } from '@/lib/graphql/client'
import { ADMIN_HOMEPAGE_QUERY } from '@/lib/graphql/queries'
import {
  UPDATE_SETTINGS_MUTATION,
  UPDATE_HOMEPAGE_MUTATION,
  UPSERT_SEO_PAGES_MUTATION,
} from '@/lib/graphql/mutations'
import { getAuthToken } from '@/components/admin/AuthGuard'
import toast from 'react-hot-toast'
import { Loader2, Save, Camera } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import RichTextEditor from '@/components/admin/RichTextEditor'
import PageTabs from '@/components/admin/PageTabs'
import SeoTabEditor from '@/components/admin/SeoTabEditor'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type {
  SiteSettings,
  HeroImage,
  HomepageFeaturedWork,
  Project,
  PageSeo,
  WorksSectionLink,
} from '@/lib/types'

// ============================================================
// Local types
// ============================================================

interface HeroImageLocal {
  tempId: string
  image_url: string
}

interface HoverImageLocal {
  link_identifier: string
  image_url: string
}

let tempCounter = 0
function genTempId() {
  return `tmp_${Date.now()}_${++tempCounter}`
}

// Fixed 5 hero image slots
function ensureFiveSlots(images: HeroImageLocal[]): HeroImageLocal[] {
  const result = [...images]
  while (result.length < 5) {
    result.push({ tempId: genTempId(), image_url: '' })
  }
  return result.slice(0, 5)
}

// Site pages for link selector
const SITE_PAGES = [
  { label: 'Accueil', href: '/' },
  { label: 'Photographie', href: '/photography' },
  { label: 'Film & Motion', href: '/film-motion' },
  { label: 'Direction Artistique', href: '/art-direction' },
  { label: 'Contact', href: '/contact' },
]

// ============================================================
// Page shell
// ============================================================

export default function HomepageEditorPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-white">
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
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')

  // Settings
  const [heroTitleTop, setHeroTitleTop] = useState('')
  const [heroTitleBottom, setHeroTitleBottom] = useState('')
  const [heroRole, setHeroRole] = useState('')
  const [heroBased, setHeroBased] = useState('')
  const [heroLogoTopUrl, setHeroLogoTopUrl] = useState('')
  const [heroLogoBottomUrl, setHeroLogoBottomUrl] = useState('')
  const [aboutTextHtml, setAboutTextHtml] = useState('')
  const [worksSectionTitle, setWorksSectionTitle] = useState('')
  const [worksSectionSubtitle, setWorksSectionSubtitle] = useState('')
  const [worksLinks, setWorksLinks] = useState<{ label: string; href: string }[]>([])

  // Homepage data
  const [heroImages, setHeroImages] = useState<HeroImageLocal[]>([])
  const [featuredProjects, setFeaturedProjects] = useState<string[]>(['', '', '', ''])
  const [hoverImages, setHoverImages] = useState<HoverImageLocal[]>([])
  const [hoverImagesDirty, setHoverImagesDirty] = useState(false)

  // All projects for selector
  const [allProjects, setAllProjects] = useState<
    Pick<Project, 'id' | 'title' | 'slug' | 'category' | 'cover_image_url' | 'year'>[]
  >([])

  // SEO
  const [seoData, setSeoData] = useState<PageSeo | null>(null)

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
        settings: SiteSettings
        homepage: {
          heroImages: HeroImage[]
          featuredWorks: HomepageFeaturedWork[]
          hoverImages: { id: string; link_identifier: string; image_url: string }[]
          projects: Pick<Project, 'id' | 'title' | 'slug' | 'category' | 'cover_image_url' | 'year'>[]
        }
        seoPage: PageSeo | null
      }>(ADMIN_HOMEPAGE_QUERY)

      // Settings
      const s = data.settings
      if (s) {
        setHeroTitleTop(s.hero_title_top || '')
        setHeroTitleBottom(s.hero_title_bottom || '')
        setHeroRole(s.hero_role || '')
        setHeroBased(s.hero_based || '')
        setHeroLogoTopUrl(s.hero_logo_top_url || '')
        setHeroLogoBottomUrl(s.hero_logo_bottom_url || '')
        setAboutTextHtml(s.about_text_html || '')
        setWorksSectionTitle(s.works_section_title || '')
        setWorksSectionSubtitle(s.works_section_subtitle || '')

        const links = s.works_section_links || []
        // Ensure exactly 2 links
        setWorksLinks([
          { label: links[0]?.label || 'STILL', href: links[0]?.href || '/photography' },
          { label: links[1]?.label || 'MOTION', href: links[1]?.href || '/film-motion' },
        ])
      }

      // Hero images — ensure exactly 5 slots
      const sortedHero = [...data.homepage.heroImages].sort(
        (a, b) => a.sort_order - b.sort_order
      )
      setHeroImages(
        ensureFiveSlots(
          sortedHero.map((img) => ({
            tempId: genTempId(),
            image_url: img.image_url,
          }))
        )
      )

      // Hover images
      setHoverImages(
        data.homepage.hoverImages.map((hi) => ({
          link_identifier: hi.link_identifier,
          image_url: hi.image_url,
        }))
      )

      // Featured works → map to 4 slots
      const fw = data.homepage.featuredWorks
      const slots = ['', '', '', '']
      const still = fw
        .filter((f) => f.slot_category === 'still')
        .sort((a, b) => a.slot_index - b.slot_index)
      const motion = fw
        .filter((f) => f.slot_category === 'motion')
        .sort((a, b) => a.slot_index - b.slot_index)
      if (still[0]) slots[0] = still[0].project_id
      if (motion[0]) slots[1] = motion[0].project_id
      if (still[1]) slots[2] = still[1].project_id
      if (motion[1]) slots[3] = motion[1].project_id
      setFeaturedProjects(slots)

      // Projects list
      setAllProjects(data.homepage.projects)

      // SEO
      setSeoData(
        data.seoPage || {
          id: '',
          page_slug: 'home',
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

  // ============================================================
  // Save
  // ============================================================

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = getAuthToken()

      if (activeTab === 'content') {
        const settingsPromise = gqlRequest(
          UPDATE_SETTINGS_MUTATION,
          {
            input: {
              hero_title_top: heroTitleTop,
              hero_title_bottom: heroTitleBottom,
              hero_role: heroRole,
              hero_based: heroBased,
              hero_logo_top_url: heroLogoTopUrl,
              hero_logo_bottom_url: heroLogoBottomUrl,
              about_text_html: aboutTextHtml,
              works_section_title: worksSectionTitle,
              works_section_subtitle: worksSectionSubtitle,
              works_section_links: worksLinks.map((l) => ({
                label: l.label,
                href: l.href,
              })),
            },
          },
          token
        )

        const featuredWorks = featuredProjects
          .map((projectId, i) => {
            if (!projectId) return null
            const slotCategory = i % 2 === 0 ? 'still' : 'motion'
            const slotIndex = Math.floor(i / 2)
            return {
              project_id: projectId,
              slot_category: slotCategory,
              slot_index: slotIndex,
              sort_order: i,
            }
          })
          .filter(Boolean)

        const homepageInput: Record<string, unknown> = {
          heroImages: heroImages
            .filter((img) => img.image_url)
            .map((img, i) => ({
              image_url: img.image_url,
              alt_text: '',
              sort_order: i,
            })),
          featuredWorks,
        }
        // Only include hoverImages when they've been modified to avoid
        // accidentally wiping existing data with an empty array
        if (hoverImagesDirty || hoverImages.some((hi) => hi.image_url)) {
          homepageInput.hoverImages = hoverImages
            .filter((hi) => hi.image_url)
            .map((hi) => ({
              link_identifier: hi.link_identifier,
              image_url: hi.image_url,
              alt_text: '',
            }))
        }

        const homepagePromise = gqlRequest(
          UPDATE_HOMEPAGE_MUTATION,
          { input: homepageInput },
          token
        )

        await Promise.all([settingsPromise, homepagePromise])
        toast.success('Contenu enregistré')
      } else {
        if (seoData) {
          await gqlRequest(
            UPSERT_SEO_PAGES_MUTATION,
            {
              input: [
                {
                  id: seoData.id || undefined,
                  page_slug: 'home',
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

  const replaceHeroImage = (tempId: string, url: string) => {
    setHeroImages((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, image_url: url } : i))
    )
  }

  // ============================================================
  // Works links helpers
  // ============================================================

  const updateWorksLink = (
    index: number,
    field: 'label' | 'href',
    value: string
  ) => {
    setWorksLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    )
  }

  // ============================================================
  // Featured projects helpers
  // ============================================================

  const updateFeaturedProject = (index: number, projectId: string) => {
    setFeaturedProjects((prev) =>
      prev.map((id, i) => (i === index ? projectId : id))
    )
  }

  const projectsByCategory = {
    photography: allProjects.filter((p) => p.category === 'photography'),
    'art-direction': allProjects.filter((p) => p.category === 'art-direction'),
  }

  // ============================================================
  // Hover images helpers
  // ============================================================

  const updateHoverImage = (linkIdentifier: string, imageUrl: string) => {
    setHoverImagesDirty(true)
    setHoverImages((prev) => {
      const existing = prev.find((h) => h.link_identifier === linkIdentifier)
      if (existing) {
        if (!imageUrl) {
          return prev.filter((h) => h.link_identifier !== linkIdentifier)
        }
        return prev.map((h) =>
          h.link_identifier === linkIdentifier
            ? { ...h, image_url: imageUrl }
            : h
        )
      }
      if (imageUrl) {
        return [...prev, { link_identifier: linkIdentifier, image_url: imageUrl }]
      }
      return prev
    })
  }

  // ============================================================
  // SEO handler
  // ============================================================

  const handleSeoChange = useCallback((partial: Partial<PageSeo>) => {
    setSeoData((prev) => (prev ? { ...prev, ...partial } : prev))
  }, [])

  // ============================================================
  // Render
  // ============================================================

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
        <h1>Page d&apos;accueil</h1>
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
        <div>
          {/* ============================== */}
          {/* Section Hero */}
          {/* ============================== */}
          <div className="admin-section">
            <h2 className="mb-8">Hero</h2>

            {/* Logos SVG */}
            <div className="mb-10">
              <label className="mb-2 block">Logos SVG</label>
              <p className="mb-4 text-xs text-gray-400">
                Importez vos logos au format SVG en noir. La couleur sera automatiquement adaptée selon le contexte (blanc sur fond sombre).
              </p>
              <div className="grid grid-cols-2 gap-4">
                <LogoUpload
                  label="Logo haut (KYLIAN)"
                  url={heroLogoTopUrl}
                  fallbackSvg="kylian"
                  onChange={setHeroLogoTopUrl}
                />
                <LogoUpload
                  label="Logo bas (ROGER)"
                  url={heroLogoBottomUrl}
                  fallbackSvg="roger"
                  onChange={setHeroLogoBottomUrl}
                />
              </div>
            </div>

            {/* Hero Images — 5 fixed slots, drag to reorder, click to replace */}
            <div className="mb-10">
              <label className="mb-2 block">Images Hero</label>
              <p className="mb-3 text-xs text-gray-400">
                Cliquez sur une image pour la remplacer. Maintenez et glissez pour changer l&apos;ordre.
              </p>
              <HeroImageGrid
                images={heroImages}
                onReorder={setHeroImages}
                onReplace={replaceHeroImage}
              />
            </div>

            {/* Textes */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block">Role</label>
                <input
                  type="text"
                  value={heroRole}
                  onChange={(e) => setHeroRole(e.target.value)}
                  placeholder="MULTIDISCIPLINARY ARTIST"
                />
              </div>
              <div>
                <label className="block">Disponibilité</label>
                <input
                  type="text"
                  value={heroBased}
                  onChange={(e) => setHeroBased(e.target.value)}
                  placeholder="AVAILABLE WORLDWIDE"
                />
              </div>
            </div>
          </div>

          {/* ============================== */}
          {/* Section À propos */}
          {/* ============================== */}
          <div className="admin-section">
            <h2 className="mb-8">À propos</h2>

            <div>
              <label className="mb-2 block">Texte de présentation</label>
              <RichTextEditor
                value={aboutTextHtml}
                onChange={setAboutTextHtml}
                placeholder="Texte de présentation..."
                linkPages={SITE_PAGES}
                hoverImages={hoverImages}
                onHoverImageChange={updateHoverImage}
              />
              <p className="mt-2 text-xs text-gray-400">
                Sélectionnez du texte et cliquez sur l&apos;icône lien pour ajouter un hyperlien avec une image de survol.
              </p>
            </div>
          </div>

          {/* ============================== */}
          {/* Section Latest Works */}
          {/* ============================== */}
          <div className="admin-section">
            <h2 className="mb-8">Latest Works</h2>

            {/* Title & Subtitle */}
            <div className="mb-10 grid grid-cols-2 gap-8">
              <div>
                <label className="block">Titre</label>
                <input
                  type="text"
                  value={worksSectionTitle}
                  onChange={(e) => setWorksSectionTitle(e.target.value)}
                  placeholder="LATEST WORKS"
                />
              </div>
              <div>
                <label className="block">Sous-titre</label>
                <input
                  type="text"
                  value={worksSectionSubtitle}
                  onChange={(e) => setWorksSectionSubtitle(e.target.value)}
                  placeholder="Explore more"
                />
              </div>
            </div>

            {/* 2 fixed buttons — STILL and MOTION */}
            <div className="mb-10">
              <label className="mb-3 block">Boutons de navigation</label>
              <div className="grid grid-cols-2 gap-6">
                {worksLinks.map((link, i) => (
                  <div key={i}>
                    <div className="mb-2">
                      <label className="block">Label</label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateWorksLink(i, 'label', e.target.value)}
                        placeholder={i === 0 ? 'STILL' : 'MOTION'}
                      />
                    </div>
                    <div>
                      <label className="block">Page liée</label>
                      <select
                        value={link.href}
                        onChange={(e) => updateWorksLink(i, 'href', e.target.value)}
                      >
                        <option value="">-- Choisir une page --</option>
                        {SITE_PAGES.map((page) => (
                          <option key={page.href} value={page.href}>
                            {page.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Projects — 4 in a row */}
            <div>
              <label className="mb-3 block">Projets mis en avant</label>
              <div className="grid grid-cols-4 gap-4">
                {featuredProjects.map((projectId, i) => {
                  const selectedProject = allProjects.find(
                    (p) => p.id === projectId
                  )
                  return (
                    <div key={i}>
                      <span className="mb-1 block text-xs text-gray-400">
                        Projet {i + 1}
                      </span>
                      <select
                        value={projectId}
                        onChange={(e) =>
                          updateFeaturedProject(i, e.target.value)
                        }
                      >
                        <option value="">-- Selectionner --</option>
                        {projectsByCategory.photography.length > 0 && (
                          <optgroup label="Photographie">
                            {projectsByCategory.photography.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title} ({p.year})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {projectsByCategory['art-direction'].length > 0 && (
                          <optgroup label="Art Direction">
                            {projectsByCategory['art-direction'].map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title} ({p.year})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      {selectedProject?.cover_image_url && (
                        <div className="mt-2 overflow-hidden">
                          <img
                            src={selectedProject.cover_image_url}
                            alt={selectedProject.title}
                            className="h-16 w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
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

// ============================================================
// HeroImageGrid — 5 fixed slots, drag to reorder, click to replace
// ============================================================

function HeroImageGrid({
  images,
  onReorder,
  onReplace,
}: {
  images: HeroImageLocal[]
  onReorder: (images: HeroImageLocal[]) => void
  onReplace: (tempId: string, url: string) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const ids = images.map((img) => img.tempId)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(images, oldIndex, newIndex))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
        <div className="grid grid-cols-5 gap-3">
          {images.map((img) => (
            <SortableHeroImage
              key={img.tempId}
              item={img}
              onReplace={(url) => onReplace(img.tempId, url)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableHeroImage({
  item,
  onReplace,
}: {
  item: HeroImageLocal
  onReplace: (url: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.tempId })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = getAuthToken()
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      onReplace(data.url)
    } catch {
      toast.error('Erreur upload')
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only open file dialog on click (not on drag release)
    if (!isDragging) {
      fileInputRef.current?.click()
    }
    e.stopPropagation()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="hero-image-thumb" onClick={handleClick}>
        {item.image_url ? (
          <>
            <img src={item.image_url} alt="" draggable={false} />
            <div className="hero-image-overlay">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-50">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <Camera className="h-5 w-5 text-gray-300" />
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

// ============================================================
// LogoUpload — simple SVG upload with black preview
// ============================================================

function LogoUpload({
  label,
  url,
  fallbackSvg,
  onChange,
}: {
  label: string
  url: string
  fallbackSvg: 'kylian' | 'roger'
  onChange: (url: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = getAuthToken()
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      onChange(data.url)
    } catch {
      toast.error('Erreur upload')
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs text-gray-400">{label}</span>
      <div
        className="svg-logo-preview is-light group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-black" />
        ) : url ? (
          <img
            src={url}
            alt={label}
            className="h-6 w-full object-contain"
          />
        ) : fallbackSvg === 'kylian' ? (
          <svg viewBox="0 0 1049 106" fill="black" xmlns="http://www.w3.org/2000/svg" className="h-6 w-full">
            <path d="M191.65 4.67L97.3 50.6V51.38L196.33 101.2V105.87H120.19L45.77 68.5H43.28V105.87H0V0H43.28V36.43H45.77L120.51 0H191.66V4.67H191.65Z"/>
            <path d="M297.95 33.16H298.26L335.16 0H396.2V1.55L319.75 70.06V105.87H276.47V70.06L200.02 1.55V0H261.05L297.95 33.16Z"/>
            <path d="M450.659 70.68H563.849V105.87H407.369V0H450.649V70.69L450.659 70.68Z"/>
            <path d="M619.87 105.87H576.59V0H619.87V105.87Z"/>
            <path d="M902.87 48.88V105.87H859.59V0H893.53L1005.48 56.98V0H1048.76V105.87H1014.97L902.87 48.88Z"/>
            <path d="M756.468 0H724.398L631.908 104V105.87H684.848L739.968 41.57H741.208L796.328 105.87H849.268V104L756.468 0Z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 1049 111" fill="black" xmlns="http://www.w3.org/2000/svg" className="h-6 w-full">
            <path d="M0 2.19043H122.69C171.89 2.19043 181.7 20.0904 181.7 42.6704C181.7 61.0404 169.56 73.1904 145.89 77.8604V78.3304C145.89 78.3304 150.4 80.9804 153.83 83.6204L185.28 106.66V108.06H125.96L87.66 79.5704H43.29V108.06H0.00999832V2.19043H0ZM43.28 37.3704V48.1104H125.8C135.45 48.1104 137.79 46.4004 137.79 42.6604C137.79 39.5404 135.61 37.3704 125.8 37.3704H43.28Z"/>
            <path d="M226.152 14.95C241.562 6.23001 268.502 0 305.872 0C343.242 0 370.332 6.23001 385.902 14.95C400.072 22.89 407.382 33.94 407.382 55.12C407.382 76.3 400.062 87.35 385.902 95.29C370.332 104.01 343.392 110.24 305.872 110.24C268.352 110.24 241.562 104.01 226.152 95.29C211.512 87.35 204.512 76.29 204.512 55.12C204.512 33.95 211.672 22.89 226.152 14.95ZM258.692 70.38C266.792 73.49 286.252 75.05 305.872 75.05C325.492 75.05 344.952 73.49 353.202 70.38C360.212 67.58 363.482 63.22 363.482 55.12C363.482 47.02 360.052 42.66 353.202 40.02C344.952 36.75 325.642 35.19 305.872 35.19C286.102 35.19 266.792 36.74 258.692 40.02C251.842 42.67 248.412 47.03 248.412 55.12C248.412 63.21 251.832 67.58 258.692 70.38Z"/>
            <path d="M525.921 43.4495H619.881V98.5695C601.511 103.86 561.961 110.25 527.081 110.25C485.821 110.25 463.551 107.14 446.581 98.1095C432.411 90.6395 423.691 76.6195 423.691 57.0095C423.691 37.3995 433.031 23.8495 446.111 15.8995C461.991 6.24954 487.681 0.0195312 527.081 0.0195312C564.291 0.0195312 599.321 4.37953 615.981 7.17953L611.471 38.4795C582.821 35.2095 557.131 33.0295 527.081 33.0295C501.391 33.0295 484.261 35.3595 476.171 39.8795C468.701 44.0795 467.611 50.9295 467.611 57.0095C467.611 62.4595 469.631 69.4595 476.801 72.7295C484.741 76.3095 499.691 77.2495 527.091 77.2495C542.501 77.2495 562.591 76.3095 576.601 74.7595V69.6195H525.921V43.4495Z"/>
            <path d="M694.591 68.9804V78.1704H829.891V108.06H651.301V2.19043H829.891V32.0804H694.591V41.2704H822.731V68.9804H694.591Z"/>
            <path d="M863.49 2.19043H986.18C1035.38 2.19043 1045.19 20.0904 1045.19 42.6704C1045.19 61.0404 1033.05 73.1904 1009.38 77.8604V78.3304C1009.38 78.3304 1013.89 80.9804 1017.32 83.6204L1048.77 106.66V108.06H989.45L951.15 79.5704H906.78V108.06H863.5V2.19043H863.49ZM906.78 37.3704V48.1104H989.3C998.95 48.1104 1001.29 46.4004 1001.29 42.6604C1001.29 39.5404 999.11 37.3704 989.3 37.3704H906.78Z"/>
          </svg>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-4 w-4 text-black" />
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

