import { createServerSupabase } from '@/lib/supabase/server'
import type { SiteSettings, HeroImage, HomepageFeaturedWork, AboutHoverImage } from '@/lib/types'

export async function getHomepageData() {
  const supabase = createServerSupabase()

  const [settingsRes, heroRes, featuredRes, hoverRes] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 'global').single(),
    supabase.from('hero_images').select('*').order('sort_order'),
    supabase
      .from('homepage_featured_works')
      .select('*, projects(id, slug, title, category, cover_image_url, cover_image_alt, year)')
      .order('sort_order'),
    supabase.from('about_hover_images').select('*'),
  ])

  return {
    settings: settingsRes.data as SiteSettings | null,
    heroImages: (heroRes.data ?? []) as HeroImage[],
    featuredWorks: (featuredRes.data ?? []) as HomepageFeaturedWork[],
    hoverImages: (hoverRes.data ?? []) as AboutHoverImage[],
  }
}
