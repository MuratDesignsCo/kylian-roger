'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { gqlRequest, UPLOAD_URL } from '@/lib/graphql/client'
import { ADMIN_CONTACT_QUERY } from '@/lib/graphql/queries'
import {
  UPDATE_CONTACT_MUTATION,
  UPSERT_SEO_PAGES_MUTATION,
} from '@/lib/graphql/mutations'
import { getAuthToken } from '@/components/admin/AuthGuard'
import toast from 'react-hot-toast'
import { Loader2, Save, Plus, Trash2, Upload, ImagePlus, X } from 'lucide-react'
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
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUpload from '@/components/admin/ImageUpload'
import SortableList from '@/components/admin/SortableList'
import PageTabs from '@/components/admin/PageTabs'
import SeoTabEditor from '@/components/admin/SeoTabEditor'
import type {
  ContactPage as ContactPageType,
  ContactInfoBlock,
  Award,
  BtsImage,
  MediaKitButton,
  PageSeo,
} from '@/lib/types'

// ============================================================
// Local types
// ============================================================

interface InfoBlockLocal {
  tempId: string
  label: string
  email: string
  phone: string
}

interface AwardLocal {
  tempId: string
  award_name: string
  organizer: string
  year: string
  hover_image_url: string
}

interface MediaKitButtonLocal {
  tempId: string
  label: string
  file_url: string
}

interface BtsImageLocal {
  tempId: string
  image_url: string
  alt_text: string
}

let tempCounter = 0
function genTempId() {
  return `tmp_${Date.now()}_${++tempCounter}`
}

// ============================================================
// Page shell
// ============================================================

export default function ContactEditorPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-white">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <ContactEditor />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}

// ============================================================
// Editor
// ============================================================

function ContactEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')

  // Main fields
  const [title, setTitle] = useState('')
  const [portraitImageUrl, setPortraitImageUrl] = useState('')
  const [portraitImageAlt, setPortraitImageAlt] = useState('')
  const [bioHtml, setBioHtml] = useState('')
  const [awardsTitle, setAwardsTitle] = useState('')
  const [btsTitle, setBtsTitle] = useState('')

  // Lists
  const [infoBlocks, setInfoBlocks] = useState<InfoBlockLocal[]>([])
  const [mediaKitButtons, setMediaKitButtons] = useState<MediaKitButtonLocal[]>([])
  const [awards, setAwards] = useState<AwardLocal[]>([])
  const [btsImages, setBtsImages] = useState<BtsImageLocal[]>([])

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
        contact: {
          page: ContactPageType
          infoBlocks: ContactInfoBlock[]
          awards: Award[]
          btsImages: BtsImage[]
          mediaKitButtons: MediaKitButton[]
        }
        seoPage: PageSeo | null
      }>(ADMIN_CONTACT_QUERY)

      const contact = data.contact.page
      setTitle(contact.title || '')
      setPortraitImageUrl(contact.portrait_image_url || '')
      setPortraitImageAlt(contact.portrait_image_alt || '')
      setBioHtml(contact.bio_html || '')
      setAwardsTitle(contact.awards_title || '')
      setBtsTitle(contact.bts_title || '')

      setInfoBlocks(
        data.contact.infoBlocks.map((b) => ({
          tempId: genTempId(),
          label: b.label || '',
          email: b.email || '',
          phone: b.phone || '',
        }))
      )

      setAwards(
        data.contact.awards.map((a) => ({
          tempId: genTempId(),
          award_name: a.award_name || '',
          organizer: a.organizer || '',
          year: a.year || '',
          hover_image_url: a.hover_image_url || '',
        }))
      )

      setMediaKitButtons(
        data.contact.mediaKitButtons.map((btn) => ({
          tempId: genTempId(),
          label: btn.label || '',
          file_url: btn.file_url || '',
        }))
      )

      setBtsImages(
        data.contact.btsImages.map((img) => ({
          tempId: genTempId(),
          image_url: img.image_url || '',
          alt_text: img.alt_text || '',
        }))
      )

      setSeoData(
        data.seoPage || {
          id: '',
          page_slug: 'contact',
          meta_title: '',
          meta_description: '',
          og_title: '',
          og_description: '',
          og_image_url: '',
          updated_at: '',
        }
      )
    } catch {
      toast.error('Erreur lors du chargement de la page contact')
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
        await gqlRequest(
          UPDATE_CONTACT_MUTATION,
          {
            input: {
              page: {
                title,
                portrait_image_url: portraitImageUrl,
                portrait_image_alt: portraitImageAlt,
                bio_html: bioHtml,
                awards_title: awardsTitle,
                bts_title: btsTitle,
              },
              infoBlocks: infoBlocks.map((b, i) => ({
                label: b.label,
                email: b.email,
                phone: b.phone,
                sort_order: i,
              })),
              awards: awards.map((a, i) => ({
                award_name: a.award_name,
                organizer: a.organizer,
                year: a.year,
                hover_image_url: a.hover_image_url || null,
                sort_order: i,
              })),
              btsImages: btsImages.map((img, i) => ({
                image_url: img.image_url,
                alt_text: img.alt_text,
                sort_order: i,
              })),
              mediaKitButtons: mediaKitButtons.map((btn, i) => ({
                label: btn.label,
                file_url: btn.file_url,
                sort_order: i,
              })),
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
                  page_slug: 'contact',
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
  // Info blocks helpers
  // ============================================================

  const addInfoBlock = () => {
    if (infoBlocks.length >= 4) return
    setInfoBlocks((prev) => [
      ...prev,
      { tempId: genTempId(), label: '', email: '', phone: '' },
    ])
  }

  const removeInfoBlock = (tempId: string) => {
    setInfoBlocks((prev) => prev.filter((b) => b.tempId !== tempId))
  }

  const updateInfoBlock = (
    tempId: string,
    field: keyof InfoBlockLocal,
    value: string
  ) => {
    setInfoBlocks((prev) =>
      prev.map((b) => (b.tempId === tempId ? { ...b, [field]: value } : b))
    )
  }

  // ============================================================
  // Media kit buttons helpers
  // ============================================================

  const addMediaKitButton = () => {
    setMediaKitButtons((prev) => [
      ...prev,
      { tempId: genTempId(), label: '', file_url: '' },
    ])
  }

  const removeMediaKitButton = (tempId: string) => {
    setMediaKitButtons((prev) => prev.filter((b) => b.tempId !== tempId))
  }

  const updateMediaKitButton = (
    tempId: string,
    field: keyof MediaKitButtonLocal,
    value: string
  ) => {
    setMediaKitButtons((prev) =>
      prev.map((b) => (b.tempId === tempId ? { ...b, [field]: value } : b))
    )
  }

  // ============================================================
  // Awards helpers
  // ============================================================

  const addAward = () => {
    setAwards((prev) => [
      ...prev,
      {
        tempId: genTempId(),
        award_name: '',
        organizer: '',
        year: '',
        hover_image_url: '',
      },
    ])
  }

  const removeAward = (tempId: string) => {
    setAwards((prev) => prev.filter((a) => a.tempId !== tempId))
  }

  const updateAward = (
    tempId: string,
    field: keyof AwardLocal,
    value: string
  ) => {
    setAwards((prev) =>
      prev.map((a) => (a.tempId === tempId ? { ...a, [field]: value } : a))
    )
  }

  // ============================================================
  // BTS images helpers
  // ============================================================

  const addBtsImage = () => {
    setBtsImages((prev) => [
      ...prev,
      { tempId: genTempId(), image_url: '', alt_text: '' },
    ])
  }

  const removeBtsImage = (tempId: string) => {
    setBtsImages((prev) => prev.filter((i) => i.tempId !== tempId))
  }

  const updateBtsImage = (
    tempId: string,
    field: keyof BtsImageLocal,
    value: string
  ) => {
    setBtsImages((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i))
    )
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
        <h1>Page Contact</h1>
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
          {/* Section: Titre */}
          {/* ============================== */}
          <div className="admin-section">
            <h2 className="mb-8">Titre de la page</h2>
            <div>
              <label className="block">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="CONTACT"
              />
            </div>
          </div>

          {/* ============================== */}
          {/* Section: Bio */}
          {/* ============================== */}
          <div className="admin-section">
            <h2 className="mb-8">Biographie</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <ImageUpload
                  value={portraitImageUrl}
                  onChange={setPortraitImageUrl}
                  folder="contact"
                  label="Image portrait"
                />
                <div className="mt-4">
                  <label className="block">Texte alternatif</label>
                  <input
                    type="text"
                    value={portraitImageAlt}
                    onChange={(e) => setPortraitImageAlt(e.target.value)}
                    placeholder="Description de l'image"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block">Biographie</label>
                <RichTextEditor
                  value={bioHtml}
                  onChange={setBioHtml}
                  placeholder="Écrivez la biographie..."
                />
              </div>
            </div>
          </div>

          {/* ============================== */}
          {/* Section: Info Blocks */}
          {/* ============================== */}
          <div className="admin-section">
            <div className="mb-6 flex items-center justify-between">
              <h2>
                Informations de contact ({infoBlocks.length}/4)
              </h2>
              <button
                type="button"
                onClick={addInfoBlock}
                disabled={infoBlocks.length >= 4}
                className="btn-secondary"
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </button>
            </div>

            <p className="mb-4 text-xs text-gray-400">
              Blocs de contact affichés sur la page (ex: United States, France). Glissez pour réordonner.
            </p>

            <SortableList
              items={infoBlocks}
              onReorder={setInfoBlocks}
              getId={(item) => item.tempId}
              renderItem={(block) => (
                <div className="flex flex-1 items-center gap-4 rounded-md border border-gray-100 bg-gray-50/50 p-4">
                  <div className="grid flex-1 grid-cols-3 gap-4">
                    <div>
                      <label className="block">Label</label>
                      <input
                        type="text"
                        value={block.label}
                        onChange={(e) =>
                          updateInfoBlock(block.tempId, 'label', e.target.value)
                        }
                        placeholder="United States"
                      />
                    </div>
                    <div>
                      <label className="block">Email</label>
                      <input
                        type="email"
                        value={block.email}
                        onChange={(e) =>
                          updateInfoBlock(block.tempId, 'email', e.target.value)
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block">Téléphone</label>
                      <input
                        type="text"
                        value={block.phone}
                        onChange={(e) =>
                          updateInfoBlock(block.tempId, 'phone', e.target.value)
                        }
                        placeholder="+33 6 00 00 00 00"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInfoBlock(block.tempId)}
                    className="shrink-0 rounded p-1 text-gray-300 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            />

            {infoBlocks.length === 0 && (
              <p className="py-8 text-center text-xs text-gray-300">
                Aucun bloc d&apos;information
              </p>
            )}
          </div>

          {/* ============================== */}
          {/* Section: Media Kit */}
          {/* ============================== */}
          <div className="admin-section">
            <div className="mb-6 flex items-center justify-between">
              <h2>Kit Media ({mediaKitButtons.length})</h2>
              <button
                type="button"
                onClick={addMediaKitButton}
                className="btn-secondary"
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </button>
            </div>

            <p className="mb-4 text-xs text-gray-400">
              Boutons de téléchargement (PDF, etc.) affichés sur la page contact.
              Importez un fichier puis donnez-lui un nom.
            </p>

            <SortableList
              items={mediaKitButtons}
              onReorder={setMediaKitButtons}
              getId={(item) => item.tempId}
              renderItem={(btn) => (
                <div className="flex flex-1 items-center gap-4 rounded-md border border-gray-100 bg-gray-50/50 p-4">
                  <div className="grid flex-1 grid-cols-2 gap-4">
                    <div>
                      <label className="block">Nom du bouton</label>
                      <input
                        type="text"
                        value={btn.label}
                        onChange={(e) =>
                          updateMediaKitButton(
                            btn.tempId,
                            'label',
                            e.target.value
                          )
                        }
                        placeholder="Download Kit Media"
                      />
                    </div>
                    <div>
                      <label className="block">Fichier</label>
                      <FileUploadField
                        value={btn.file_url}
                        onChange={(url) =>
                          updateMediaKitButton(btn.tempId, 'file_url', url)
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMediaKitButton(btn.tempId)}
                    className="shrink-0 rounded p-1 text-gray-300 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            />

            {mediaKitButtons.length === 0 && (
              <p className="py-8 text-center text-xs text-gray-300">
                Aucun bouton kit media
              </p>
            )}
          </div>

          {/* ============================== */}
          {/* Section: Awards */}
          {/* ============================== */}
          <div className="admin-section">
            <h2 className="mb-4">Prix et distinctions</h2>
            <div className="mb-6">
              <label className="block">Titre de section</label>
              <input
                type="text"
                value={awardsTitle}
                onChange={(e) => setAwardsTitle(e.target.value)}
                placeholder="AWARDS"
              />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {awards.length} prix
              </span>
              <button
                type="button"
                onClick={addAward}
                className="btn-secondary"
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </button>
            </div>

            <SortableList
              items={awards}
              onReorder={setAwards}
              getId={(item) => item.tempId}
              renderItem={(award) => (
                <div className="flex flex-1 items-center gap-3 rounded-md border border-gray-100 bg-gray-50/50 p-3">
                  {/* Thumbnail image */}
                  <AwardThumbnail
                    value={award.hover_image_url}
                    onChange={(url) =>
                      updateAward(award.tempId, 'hover_image_url', url)
                    }
                  />
                  {/* Fields */}
                  <div className="grid min-w-0 flex-1 grid-cols-[1fr_1fr_80px] gap-3">
                    <input
                      type="text"
                      value={award.award_name}
                      onChange={(e) =>
                        updateAward(award.tempId, 'award_name', e.target.value)
                      }
                      placeholder="Nom du prix"
                    />
                    <input
                      type="text"
                      value={award.organizer}
                      onChange={(e) =>
                        updateAward(award.tempId, 'organizer', e.target.value)
                      }
                      placeholder="Organisateur"
                    />
                    <input
                      type="text"
                      value={award.year}
                      onChange={(e) =>
                        updateAward(award.tempId, 'year', e.target.value)
                      }
                      placeholder="2025"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAward(award.tempId)}
                    className="shrink-0 rounded p-1 text-gray-300 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            />

            {awards.length === 0 && (
              <p className="py-8 text-center text-xs text-gray-300">
                Aucun prix configuré
              </p>
            )}
          </div>

          {/* ============================== */}
          {/* Section: Behind The Scenes */}
          {/* ============================== */}
          <div className="admin-section">
            <h2 className="mb-4">Behind The Scenes</h2>
            <div className="mb-6">
              <label className="block">Titre de section</label>
              <input
                type="text"
                value={btsTitle}
                onChange={(e) => setBtsTitle(e.target.value)}
                placeholder="BEHIND THE SCENES"
              />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {btsImages.length} images
              </span>
              <button
                type="button"
                onClick={addBtsImage}
                className="btn-secondary"
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </button>
            </div>

            {btsImages.length > 0 ? (
              <BtsImageGrid
                images={btsImages}
                onReorder={setBtsImages}
                onRemove={removeBtsImage}
                onUpdateImage={(tempId, url) =>
                  updateBtsImage(tempId, 'image_url', url)
                }
                onUpdateAlt={(tempId, alt) =>
                  updateBtsImage(tempId, 'alt_text', alt)
                }
              />
            ) : (
              <p className="py-8 text-center text-xs text-gray-300">
                Aucune image BTS
              </p>
            )}
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
// FileUploadField — small inline upload for PDF/documents
// ============================================================

function FileUploadField({
  value,
  onChange,
}: {
  value: string
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
      const res = await fetch(
        UPLOAD_URL,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      )
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      onChange(data.url)
    } catch {
      toast.error('Erreur upload')
    }
    setUploading(false)
    e.target.value = ''
  }

  const fileName = value ? value.split('/').pop() : ''

  return (
    <div>
      {value ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate text-xs text-gray-500">
            {fileName}
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 text-xs text-blue-600 hover:text-blue-800"
          >
            Remplacer
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="shrink-0 text-xs text-red-500 hover:text-red-700"
          >
            Supprimer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploading ? 'Upload en cours...' : 'Importer un fichier'}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// ============================================================
// AwardThumbnail — small square image for award hover
// ============================================================

function AwardThumbnail({
  value,
  onChange,
}: {
  value: string
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
      toast.error('Erreur upload image')
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="shrink-0">
      {value ? (
        <div className="group relative h-10 w-10 overflow-hidden rounded border border-gray-200">
          <img
            src={value}
            alt="Hover"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-10 w-10 items-center justify-center rounded border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// ============================================================
// BtsImageGrid — draggable 3-column grid for BTS images
// ============================================================

function BtsImageGrid({
  images,
  onReorder,
  onRemove,
  onUpdateImage,
  onUpdateAlt,
}: {
  images: BtsImageLocal[]
  onReorder: (images: BtsImageLocal[]) => void
  onRemove: (tempId: string) => void
  onUpdateImage: (tempId: string, url: string) => void
  onUpdateAlt: (tempId: string, alt: string) => void
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
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-4">
          {images.map((img) => (
            <SortableBtsImage
              key={img.tempId}
              item={img}
              onRemove={() => onRemove(img.tempId)}
              onUpdateImage={(url) => onUpdateImage(img.tempId, url)}
              onUpdateAlt={(alt) => onUpdateAlt(img.tempId, alt)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableBtsImage({
  item,
  onRemove,
  onUpdateImage,
  onUpdateAlt,
}: {
  item: BtsImageLocal
  onRemove: () => void
  onUpdateImage: (url: string) => void
  onUpdateAlt: (alt: string) => void
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
      onUpdateImage(data.url)
    } catch {
      toast.error('Erreur upload')
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border border-gray-100 bg-gray-50/50 p-3"
    >
      {/* Image zone */}
      <div className="group relative mb-2">
        {/* Drag handle */}
        <div
          className="aspect-[4/3] overflow-hidden rounded-md border border-gray-200 bg-gray-100"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          {...attributes}
          {...listeners}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.alt_text || ''}
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{ cursor: 'pointer' }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <ImagePlus className="h-6 w-6 text-gray-300" />
              )}
            </div>
          )}
        </div>
        {/* X button — outside drag listeners */}
        {item.image_url && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Alt text */}
      <input
        type="text"
        value={item.alt_text}
        onChange={(e) => onUpdateAlt(e.target.value)}
        placeholder="Texte alternatif"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
