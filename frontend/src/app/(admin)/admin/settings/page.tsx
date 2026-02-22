'use client'

import { useEffect, useState } from 'react'
import { gqlRequest } from '@/lib/graphql/client'
import { SETTINGS_QUERY } from '@/lib/graphql/queries'
import { UPDATE_SETTINGS_MUTATION } from '@/lib/graphql/mutations'
import { getAuthToken } from '@/components/admin/AuthGuard'
import toast from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ImageUpload from '@/components/admin/ImageUpload'
import SortableList from '@/components/admin/SortableList'
import type { SiteSettings } from '@/lib/types'

// Labels affichés pour les items du menu principal
const MENU_LABELS: Record<string, string> = {
  home: 'Home',
  works: 'Works (dropdown)',
  contact: 'Contact',
}

// Labels affichés pour les items du dropdown Works
const DROPDOWN_LABELS: Record<string, string> = {
  photography: 'Photography',
  'film-motion': 'Film / Motion',
  'art-direction': 'Art Direction',
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      {(session) => (
        <div className="flex h-screen bg-white">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto">
            <SettingsEditor />
          </main>
        </div>
      )}
    </AuthGuard>
  )
}

interface MenuItem {
  id: string
  label: string
}

function SettingsEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Navbar
  const [navbarLogoUrl, setNavbarLogoUrl] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 'home', label: 'Home' },
    { id: 'works', label: 'Works (dropdown)' },
    { id: 'contact', label: 'Contact' },
  ])
  const [dropdownItems, setDropdownItems] = useState<MenuItem[]>([
    { id: 'photography', label: 'Photography' },
    { id: 'film-motion', label: 'Film / Motion' },
    { id: 'art-direction', label: 'Art Direction' },
  ])

  // Footer
  const [footerLogoUrl, setFooterLogoUrl] = useState('')
  const [copyrightText, setCopyrightText] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await gqlRequest<{ settings: SiteSettings }>(SETTINGS_QUERY)
      const s = data.settings
      if (s) {
        setNavbarLogoUrl(s.navbar_logo_url || '')
        setFooterLogoUrl(s.footer_logo_url || '')
        setCopyrightText(s.copyright_text || '')

        // Rebuild menu items from saved order
        if (s.nav_menu_order && Array.isArray(s.nav_menu_order) && s.nav_menu_order.length > 0) {
          setMenuItems(
            s.nav_menu_order.map((key: string) => ({
              id: key,
              label: MENU_LABELS[key] || key,
            }))
          )
        }
        if (s.nav_dropdown_order && Array.isArray(s.nav_dropdown_order) && s.nav_dropdown_order.length > 0) {
          setDropdownItems(
            s.nav_dropdown_order.map((key: string) => ({
              id: key,
              label: DROPDOWN_LABELS[key] || key,
            }))
          )
        }
      }
    } catch {
      toast.error('Erreur lors du chargement des paramètres')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = getAuthToken()
      await gqlRequest(UPDATE_SETTINGS_MUTATION, {
        input: {
          navbar_logo_url: navbarLogoUrl,
          footer_logo_url: footerLogoUrl,
          copyright_text: copyrightText,
          nav_menu_order: menuItems.map((m) => m.id),
          nav_dropdown_order: dropdownItems.map((d) => d.id),
        },
      }, token)
      toast.success('Paramètres enregistrés')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
    setSaving(false)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Paramètres de base</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configuration de la navbar et du footer
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

      <div className="space-y-8">
        {/* Navbar */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">Navbar</h2>

          <div className="space-y-6">
            {/* Logo */}
            <div className="max-w-md">
              <ImageUpload
                value={navbarLogoUrl}
                onChange={setNavbarLogoUrl}
                label="Logo de la navbar (SVG)"
              />
            </div>

            {/* Menu order */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Ordre du menu principal
              </label>
              <div className="max-w-md">
                <SortableList
                  items={menuItems}
                  onReorder={setMenuItems}
                  getId={(item) => item.id}
                  renderItem={(item) => (
                    <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {item.label}
                      </span>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Dropdown order */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Ordre du sous-menu Works
              </label>
              <div className="max-w-md">
                <SortableList
                  items={dropdownItems}
                  onReorder={setDropdownItems}
                  getId={(item) => item.id}
                  renderItem={(item) => (
                    <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {item.label}
                      </span>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">Footer</h2>

          <div className="space-y-6">
            {/* Footer logo */}
            <div className="max-w-md">
              <ImageUpload
                value={footerLogoUrl}
                onChange={setFooterLogoUrl}
                label="Logo du footer (SVG)"
              />
            </div>

            {/* Copyright */}
            <div className="max-w-md">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Texte copyright
              </label>
              <input
                type="text"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
