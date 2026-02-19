'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { SiteSettings, WorksSectionLink } from '@/lib/types'

export default function SettingsPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-zinc-950">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <SettingsEditor />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}

function SettingsEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [heroTitleTop, setHeroTitleTop] = useState('')
  const [heroTitleBottom, setHeroTitleBottom] = useState('')
  const [heroRole, setHeroRole] = useState('')
  const [heroBased, setHeroBased] = useState('')
  const [aboutTextHtml, setAboutTextHtml] = useState('')
  const [worksSectionTitle, setWorksSectionTitle] = useState('')
  const [worksSectionLinks, setWorksSectionLinks] = useState<WorksSectionLink[]>([])
  const [footerBigName, setFooterBigName] = useState('')
  const [copyrightText, setCopyrightText] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .single()

    if (error) {
      toast.error('Erreur lors du chargement des parametres')
      console.error(error)
    } else if (data) {
      const settings = data as SiteSettings
      setHeroTitleTop(settings.hero_title_top || '')
      setHeroTitleBottom(settings.hero_title_bottom || '')
      setHeroRole(settings.hero_role || '')
      setHeroBased(settings.hero_based || '')
      setAboutTextHtml(settings.about_text_html || '')
      setWorksSectionTitle(settings.works_section_title || '')
      setWorksSectionLinks(settings.works_section_links || [])
      setFooterBigName(settings.footer_big_name || '')
      setCopyrightText(settings.copyright_text || '')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from('site_settings')
      .update({
        hero_title_top: heroTitleTop,
        hero_title_bottom: heroTitleBottom,
        hero_role: heroRole,
        hero_based: heroBased,
        about_text_html: aboutTextHtml,
        works_section_title: worksSectionTitle,
        works_section_links: worksSectionLinks,
        footer_big_name: footerBigName,
        copyright_text: copyrightText,
      })
      .eq('id', 'global')

    if (error) {
      toast.error('Erreur lors de la sauvegarde')
      console.error(error)
    } else {
      toast.success('Parametres enregistres')
    }

    setSaving(false)
  }

  const addLink = () => {
    setWorksSectionLinks((prev) => [...prev, { label: '', href: '' }])
  }

  const removeLink = (index: number) => {
    setWorksSectionLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, field: keyof WorksSectionLink, value: string) => {
    setWorksSectionLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    )
  }

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
          <h1 className="text-2xl font-bold text-white">Parametres du site</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configuration generale du portfolio
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
        {/* Hero Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Section Hero</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Titre Hero (ligne du haut)
              </label>
              <input
                type="text"
                value={heroTitleTop}
                onChange={(e) => setHeroTitleTop(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Titre Hero (ligne du bas)
              </label>
              <input
                type="text"
                value={heroTitleBottom}
                onChange={(e) => setHeroTitleBottom(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Role
              </label>
              <input
                type="text"
                value={heroRole}
                onChange={(e) => setHeroRole(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Base a
              </label>
              <input
                type="text"
                value={heroBased}
                onChange={(e) => setHeroBased(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Section A propos</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Texte A propos (HTML)
            </label>
            <textarea
              value={aboutTextHtml}
              onChange={(e) => setAboutTextHtml(e.target.value)}
              rows={8}
              className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono"
              placeholder="<p>Texte a propos en HTML...</p>"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Vous pouvez utiliser du HTML pour le formatage (liens, italique, etc.)
            </p>
          </div>
        </section>

        {/* Works Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Section Travaux</h2>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Titre de la section
            </label>
            <input
              type="text"
              value={worksSectionTitle}
              onChange={(e) => setWorksSectionTitle(e.target.value)}
              className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">
                Liens de la section
              </label>
              <button
                type="button"
                onClick={addLink}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter un lien
              </button>
            </div>
            <div className="space-y-3">
              {worksSectionLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(i, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateLink(i, 'href', e.target.value)}
                    placeholder="/photography"
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="rounded p-1.5 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {worksSectionLinks.length === 0 && (
                <p className="py-4 text-center text-sm text-zinc-500">
                  Aucun lien configure
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Footer</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Grand nom (footer)
              </label>
              <input
                type="text"
                value={footerBigName}
                onChange={(e) => setFooterBigName(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Texte copyright
              </label>
              <input
                type="text"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
