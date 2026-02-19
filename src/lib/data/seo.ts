import { createServerSupabase } from '@/lib/supabase/server'
import type { PageSeo } from '@/lib/types'
import type { Metadata } from 'next'

export async function getPageSeo(pageSlug: string): Promise<PageSeo | null> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('pages_seo')
    .select('*')
    .eq('page_slug', pageSlug)
    .single()

  return data as PageSeo | null
}

export function seoToMetadata(seo: PageSeo | null, fallbackTitle: string): Metadata {
  if (!seo) {
    return { title: fallbackTitle }
  }

  return {
    title: seo.meta_title || fallbackTitle,
    description: seo.meta_description || undefined,
    openGraph: {
      title: seo.og_title || seo.meta_title || fallbackTitle,
      description: seo.og_description || seo.meta_description || undefined,
      images: seo.og_image_url ? [seo.og_image_url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.og_title || seo.meta_title || fallbackTitle,
      description: seo.og_description || seo.meta_description || undefined,
    },
  }
}
