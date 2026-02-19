'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ImageUpload from '@/components/admin/ImageUpload'
import type {
  ContactPage as ContactPageType,
  ContactInfoBlock,
  Award,
  BtsImage,
  MediaKitButton,
} from '@/lib/types'

// ============================================================
// Types
// ============================================================

interface InfoBlockLocal {
  tempId: string
  label: string
  email: string
  phone: string
  sort_order: number
}

interface AwardLocal {
  tempId: string
  award_name: string
  organizer: string
  year: string
  hover_image_url: string
  sort_order: number
}

interface MediaKitButtonLocal {
  tempId: string
  label: string
  file_url: string
  sort_order: number
}

interface BtsImageLocal {
  tempId: string
  image_url: string
  alt_text: string
  sort_order: number
}

let tempCounter = 0
function genTempId() {
  return `tmp_${Date.now()}_${++tempCounter}`
}

// ============================================================
// Page
// ============================================================

export default function ContactAdminPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-zinc-950">
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

  // Main contact page fields
  const [title, setTitle] = useState('')
  const [portraitImageUrl, setPortraitImageUrl] = useState('')
  const [portraitImageAlt, setPortraitImageAlt] = useState('')
  const [bioHtml, setBioHtml] = useState('')
  const [awardsTitle, setAwardsTitle] = useState('')
  const [btsTitle, setBtsTitle] = useState('')

  // Info blocks
  const [infoBlocks, setInfoBlocks] = useState<InfoBlockLocal[]>([])

  // Media kit buttons
  const [mediaKitButtons, setMediaKitButtons] = useState<MediaKitButtonLocal[]>([])

  // Awards
  const [awards, setAwards] = useState<AwardLocal[]>([])

  // BTS images
  const [btsImages, setBtsImages] = useState<BtsImageLocal[]>([])

  // ============================================================
  // Load
  // ============================================================

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    const [contactResult, infoResult, awardsResult, btsResult, mediaKitResult] =
      await Promise.all([
        supabase
          .from('contact_page')
          .select('*')
          .eq('id', 'main')
          .single(),
        supabase
          .from('contact_info_blocks')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('awards')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('bts_images')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('media_kit_buttons')
          .select('*')
          .order('sort_order', { ascending: true }),
      ])

    if (contactResult.error) {
      toast.error('Erreur lors du chargement de la page contact')
      console.error(contactResult.error)
      setLoading(false)
      return
    }

    // Main fields
    const contact = contactResult.data as ContactPageType
    setTitle(contact.title || '')
    setPortraitImageUrl(contact.portrait_image_url || '')
    setPortraitImageAlt(contact.portrait_image_alt || '')
    setBioHtml(contact.bio_html || '')
    setAwardsTitle(contact.awards_title || '')
    setBtsTitle(contact.bts_title || '')

    // Info blocks
    if (infoResult.data) {
      setInfoBlocks(
        (infoResult.data as ContactInfoBlock[]).map((b) => ({
          tempId: genTempId(),
          label: b.label || '',
          email: b.email || '',
          phone: b.phone || '',
          sort_order: b.sort_order,
        }))
      )
    }

    // Awards
    if (awardsResult.data) {
      setAwards(
        (awardsResult.data as Award[]).map((a) => ({
          tempId: genTempId(),
          award_name: a.award_name || '',
          organizer: a.organizer || '',
          year: a.year || '',
          hover_image_url: a.hover_image_url || '',
          sort_order: a.sort_order,
        }))
      )
    }

    // Media kit buttons
    if (mediaKitResult.data) {
      setMediaKitButtons(
        (mediaKitResult.data as MediaKitButton[]).map((btn) => ({
          tempId: genTempId(),
          label: btn.label || '',
          file_url: btn.file_url || '',
          sort_order: btn.sort_order,
        }))
      )
    }

    // BTS images
    if (btsResult.data) {
      setBtsImages(
        (btsResult.data as BtsImage[]).map((img) => ({
          tempId: genTempId(),
          image_url: img.image_url || '',
          alt_text: img.alt_text || '',
          sort_order: img.sort_order,
        }))
      )
    }

    setLoading(false)
  }

  // ============================================================
  // Save
  // ============================================================

  const handleSave = async () => {
    setSaving(true)

    try {
      // Update contact_page main record
      const { error: contactErr } = await supabase
        .from('contact_page')
        .update({
          title,
          portrait_image_url: portraitImageUrl,
          portrait_image_alt: portraitImageAlt,
          bio_html: bioHtml,
          awards_title: awardsTitle,
          bts_title: btsTitle,
        })
        .eq('id', 'main')

      if (contactErr) throw new Error(contactErr.message)

      // --- Info blocks: delete + insert ---
      const { error: deleteInfoErr } = await supabase
        .from('contact_info_blocks')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')

      if (deleteInfoErr) throw new Error(deleteInfoErr.message)

      if (infoBlocks.length > 0) {
        const infoInserts = infoBlocks.map((b, i) => ({
          label: b.label,
          email: b.email,
          phone: b.phone,
          sort_order: i,
        }))
        const { error: insertInfoErr } = await supabase
          .from('contact_info_blocks')
          .insert(infoInserts)
        if (insertInfoErr) throw new Error(insertInfoErr.message)
      }

      // --- Awards: delete + insert ---
      const { error: deleteAwardsErr } = await supabase
        .from('awards')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')

      if (deleteAwardsErr) throw new Error(deleteAwardsErr.message)

      if (awards.length > 0) {
        const awardInserts = awards.map((a, i) => ({
          award_name: a.award_name,
          organizer: a.organizer,
          year: a.year,
          hover_image_url: a.hover_image_url || null,
          sort_order: i,
        }))
        const { error: insertAwardsErr } = await supabase
          .from('awards')
          .insert(awardInserts)
        if (insertAwardsErr) throw new Error(insertAwardsErr.message)
      }

      // --- Media kit buttons: delete + insert ---
      const { error: deleteMediaKitErr } = await supabase
        .from('media_kit_buttons')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')

      if (deleteMediaKitErr) throw new Error(deleteMediaKitErr.message)

      if (mediaKitButtons.length > 0) {
        const mediaKitInserts = mediaKitButtons.map((btn, i) => ({
          label: btn.label,
          file_url: btn.file_url,
          sort_order: i,
        }))
        const { error: insertMediaKitErr } = await supabase
          .from('media_kit_buttons')
          .insert(mediaKitInserts)
        if (insertMediaKitErr) throw new Error(insertMediaKitErr.message)
      }

      // --- BTS images: delete + insert ---
      const { error: deleteBtsErr } = await supabase
        .from('bts_images')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')

      if (deleteBtsErr) throw new Error(deleteBtsErr.message)

      if (btsImages.length > 0) {
        const btsInserts = btsImages.map((img, i) => ({
          image_url: img.image_url,
          alt_text: img.alt_text,
          sort_order: i,
        }))
        const { error: insertBtsErr } = await supabase
          .from('bts_images')
          .insert(btsInserts)
        if (insertBtsErr) throw new Error(insertBtsErr.message)
      }

      toast.success('Page contact mise a jour')
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
    setInfoBlocks((prev) => [
      ...prev,
      {
        tempId: genTempId(),
        label: '',
        email: '',
        phone: '',
        sort_order: prev.length,
      },
    ])
  }

  const removeInfoBlock = (tempId: string) => {
    setInfoBlocks((prev) => prev.filter((b) => b.tempId !== tempId))
  }

  const updateInfoBlock = (tempId: string, field: keyof InfoBlockLocal, value: string) => {
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
      {
        tempId: genTempId(),
        label: '',
        file_url: '',
        sort_order: prev.length,
      },
    ])
  }

  const removeMediaKitButton = (tempId: string) => {
    setMediaKitButtons((prev) => prev.filter((b) => b.tempId !== tempId))
  }

  const updateMediaKitButton = (tempId: string, field: keyof MediaKitButtonLocal, value: string) => {
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
        sort_order: prev.length,
      },
    ])
  }

  const removeAward = (tempId: string) => {
    setAwards((prev) => prev.filter((a) => a.tempId !== tempId))
  }

  const updateAward = (tempId: string, field: keyof AwardLocal, value: string) => {
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
      {
        tempId: genTempId(),
        image_url: '',
        alt_text: '',
        sort_order: prev.length,
      },
    ])
  }

  const removeBtsImage = (tempId: string) => {
    setBtsImages((prev) => prev.filter((i) => i.tempId !== tempId))
  }

  const updateBtsImage = (tempId: string, field: keyof BtsImageLocal, value: string) => {
    setBtsImages((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i))
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Page Contact</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gerez les informations de la page contact
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

      <div className="space-y-8">
        {/* ============================== */}
        {/* Main Fields */}
        {/* ============================== */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Informations principales
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Titre de la page
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="Titre"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Texte alternatif (portrait)
              </label>
              <input
                type="text"
                value={portraitImageAlt}
                onChange={(e) => setPortraitImageAlt(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="Description de l'image portrait"
              />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ImageUpload
              value={portraitImageUrl}
              onChange={setPortraitImageUrl}
              folder="contact"
              label="Image portrait"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Bio (HTML)
              </label>
              <textarea
                value={bioHtml}
                onChange={(e) => setBioHtml(e.target.value)}
                rows={8}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono"
                placeholder="<p>Biographie en HTML...</p>"
              />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Titre section prix
              </label>
              <input
                type="text"
                value={awardsTitle}
                onChange={(e) => setAwardsTitle(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="Awards & Recognition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Titre section BTS
              </label>
              <input
                type="text"
                value={btsTitle}
                onChange={(e) => setBtsTitle(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="Behind The Scenes"
              />
            </div>
          </div>
        </section>

        {/* ============================== */}
        {/* Info Blocks */}
        {/* ============================== */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Blocs d&apos;information ({infoBlocks.length})
            </h2>
            <button
              type="button"
              onClick={addInfoBlock}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>

          <div className="space-y-3">
            {infoBlocks.map((block) => (
              <div
                key={block.tempId}
                className="flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-800 p-3"
              >
                <input
                  type="text"
                  value={block.label}
                  onChange={(e) =>
                    updateInfoBlock(block.tempId, 'label', e.target.value)
                  }
                  placeholder="Label"
                  className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                />
                <input
                  type="email"
                  value={block.email}
                  onChange={(e) =>
                    updateInfoBlock(block.tempId, 'email', e.target.value)
                  }
                  placeholder="Email"
                  className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                />
                <input
                  type="text"
                  value={block.phone}
                  onChange={(e) =>
                    updateInfoBlock(block.tempId, 'phone', e.target.value)
                  }
                  placeholder="Telephone"
                  className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => removeInfoBlock(block.tempId)}
                  className="shrink-0 rounded p-1 text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {infoBlocks.length === 0 && (
              <p className="py-4 text-center text-sm text-zinc-500">
                Aucun bloc d&apos;information
              </p>
            )}
          </div>
        </section>

        {/* ============================== */}
        {/* Media Kit Buttons */}
        {/* ============================== */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Boutons Kit Media ({mediaKitButtons.length})
            </h2>
            <button
              type="button"
              onClick={addMediaKitButton}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>

          <p className="mb-3 text-xs text-zinc-500">
            Boutons de telechargement affiches entre les representations et les awards.
          </p>

          <div className="space-y-3">
            {mediaKitButtons.map((btn) => (
              <div
                key={btn.tempId}
                className="flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-800 p-3"
              >
                <input
                  type="text"
                  value={btn.label}
                  onChange={(e) =>
                    updateMediaKitButton(btn.tempId, 'label', e.target.value)
                  }
                  placeholder="Nom du bouton (ex: Download Kit Media)"
                  className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                />
                <input
                  type="url"
                  value={btn.file_url}
                  onChange={(e) =>
                    updateMediaKitButton(btn.tempId, 'file_url', e.target.value)
                  }
                  placeholder="URL du fichier"
                  className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => removeMediaKitButton(btn.tempId)}
                  className="shrink-0 rounded p-1 text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {mediaKitButtons.length === 0 && (
              <p className="py-4 text-center text-sm text-zinc-500">
                Aucun bouton kit media configure
              </p>
            )}
          </div>
        </section>

        {/* ============================== */}
        {/* Awards */}
        {/* ============================== */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Prix et distinctions ({awards.length})
            </h2>
            <button
              type="button"
              onClick={addAward}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>

          <div className="space-y-4">
            {awards.map((award) => (
              <div
                key={award.tempId}
                className="rounded-md border border-zinc-700 bg-zinc-800 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">
                        Nom du prix
                      </label>
                      <input
                        type="text"
                        value={award.award_name}
                        onChange={(e) =>
                          updateAward(award.tempId, 'award_name', e.target.value)
                        }
                        className="block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                        placeholder="Nom du prix"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">
                        Organisateur
                      </label>
                      <input
                        type="text"
                        value={award.organizer}
                        onChange={(e) =>
                          updateAward(award.tempId, 'organizer', e.target.value)
                        }
                        className="block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                        placeholder="Organisateur"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">
                        Annee
                      </label>
                      <input
                        type="text"
                        value={award.year}
                        onChange={(e) =>
                          updateAward(award.tempId, 'year', e.target.value)
                        }
                        className="block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                        placeholder="2025"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAward(award.tempId)}
                    className="ml-3 shrink-0 rounded p-1 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-w-xs">
                  <ImageUpload
                    value={award.hover_image_url}
                    onChange={(url) =>
                      updateAward(award.tempId, 'hover_image_url', url)
                    }
                    folder="contact/awards"
                    label="Image de survol"
                  />
                </div>
              </div>
            ))}
            {awards.length === 0 && (
              <p className="py-4 text-center text-sm text-zinc-500">
                Aucun prix configure
              </p>
            )}
          </div>
        </section>

        {/* ============================== */}
        {/* BTS Images */}
        {/* ============================== */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Behind The Scenes ({btsImages.length})
            </h2>
            <button
              type="button"
              onClick={addBtsImage}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {btsImages.map((img, i) => (
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
                    onClick={() => removeBtsImage(img.tempId)}
                    className="rounded p-1 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <ImageUpload
                  value={img.image_url}
                  onChange={(url) => updateBtsImage(img.tempId, 'image_url', url)}
                  folder="contact/bts"
                />
                <input
                  type="text"
                  value={img.alt_text}
                  onChange={(e) =>
                    updateBtsImage(img.tempId, 'alt_text', e.target.value)
                  }
                  placeholder="Texte alternatif"
                  className="mt-2 block w-full rounded border border-zinc-600 bg-zinc-700 px-2 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                />
              </div>
            ))}
          </div>

          {btsImages.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">
              Aucune image BTS configuree
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
