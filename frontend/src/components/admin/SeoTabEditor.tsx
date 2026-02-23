'use client'

import ImageUpload from '@/components/admin/ImageUpload'
import type { PageSeo } from '@/lib/types'

interface SeoTabEditorProps {
  seoData: PageSeo | null
  onChange: (data: Partial<PageSeo>) => void
  /** Override the URL displayed in previews (e.g. "works/my-project") */
  displayPath?: string
}

const SLUG_TO_PATH: Record<string, string> = {
  home: '',
  photography: 'photography',
  'film-motion': 'film-motion',
  'art-direction': 'art-direction',
  contact: 'contact',
}

export default function SeoTabEditor({ seoData, onChange, displayPath }: SeoTabEditorProps) {
  if (!seoData) return null

  const pagePath = displayPath ?? (SLUG_TO_PATH[seoData.page_slug] ?? seoData.page_slug)
  const displayUrl = `kylianroger.com${pagePath ? `/${pagePath}` : ''}`

  const metaTitle = seoData.meta_title || ''
  const metaDesc = seoData.meta_description || ''
  const ogTitle = seoData.og_title || ''
  const ogDesc = seoData.og_description || ''

  return (
    <div>
      {/* ============================== */}
      {/* Moteur de recherche */}
      {/* ============================== */}
      <div className="admin-section" style={{ paddingBottom: '3rem' }}>
        <h2 className="mb-6">Moteur de recherche</h2>

        {/* Meta Title */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <label className="block">Meta Title</label>
            <span
              className={`text-xs ${
                metaTitle.length > 60 ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {metaTitle.length}/60
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onChange({ meta_title: e.target.value })}
            placeholder="Titre de la page"
          />
        </div>

        {/* Meta Description */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="block">Meta Description</label>
            <span
              className={`text-xs ${
                metaDesc.length > 160 ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {metaDesc.length}/160
            </span>
          </div>
          <textarea
            value={metaDesc}
            onChange={(e) =>
              onChange({ meta_description: e.target.value })
            }
            rows={3}
            placeholder="Description de la page"
          />
        </div>

        {/* Google Preview */}
        <div>
          <label className="mb-2 block">Aperçu Google</label>
          <div className="border border-gray-100 p-5">
            <p className="text-xs text-gray-400">{displayUrl}</p>
            <p className="mt-1 text-sm font-medium text-blue-700">
              {metaTitle || 'Titre de la page'}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
              {metaDesc || 'Description de la page...'}
            </p>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* Open Graph */}
      {/* ============================== */}
      <div className="admin-section" style={{ paddingTop: '3rem' }}>
        <h2 className="mb-6">Réseaux sociaux (Open Graph)</h2>

        {/* OG Title */}
        <div className="mb-5">
          <label className="block">OG Title</label>
          <input
            type="text"
            value={ogTitle}
            onChange={(e) => onChange({ og_title: e.target.value })}
            placeholder="Titre Open Graph"
          />
        </div>

        {/* OG Description */}
        <div className="mb-6">
          <label className="block">OG Description</label>
          <textarea
            value={ogDesc}
            onChange={(e) =>
              onChange({ og_description: e.target.value })
            }
            rows={3}
            placeholder="Description Open Graph"
          />
        </div>

        {/* OG Image */}
        <div className="mb-6">
          <ImageUpload
            value={seoData.og_image_url || ''}
            onChange={(url) => onChange({ og_image_url: url })}
            folder="seo"
            label="Image OG (1200x630)"
          />
        </div>

        {/* Social Preview */}
        <div>
          <label className="mb-2 block">Aperçu réseaux sociaux</label>
          <div className="overflow-hidden border border-gray-100">
            <div className="flex h-48 items-center justify-center bg-gray-50">
              {seoData.og_image_url ? (
                <img
                  src={seoData.og_image_url}
                  alt="OG preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-300">
                  1200 x 630
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                {displayUrl}
              </p>
              <p className="mt-1 text-sm font-medium text-black">
                {ogTitle || metaTitle || 'Titre de la page'}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                {ogDesc || metaDesc || 'Description de la page...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
