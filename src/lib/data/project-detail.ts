import { createServerSupabase } from '@/lib/supabase/server'
import {
  getFallbackProjectBySlug,
  getFallbackPhotoGallery,
  getFallbackArtDetails,
} from '@/lib/data/fallback-projects'
import type { Project, ProjectGalleryRow, ProjectHeroSlide, ProjectBlock } from '@/lib/types'

export async function getProjectHeroSlides(projectId: string): Promise<ProjectHeroSlide[]> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('project_hero_slides')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order')

  if (data && data.length > 0) return data as ProjectHeroSlide[]

  // Fallback to static placeholder data
  const { getFallbackHeroSlides } = await import('@/lib/data/fallback-projects')
  return getFallbackHeroSlides(projectId)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (data) return data as Project

  // Fallback to static placeholder data
  return getFallbackProjectBySlug(slug)
}

export async function getPhotographyGallery(projectId: string): Promise<ProjectGalleryRow[]> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('project_gallery_rows')
    .select('*, project_gallery_images(*)')
    .eq('project_id', projectId)
    .order('sort_order')

  const rows = (data ?? []) as ProjectGalleryRow[]

  if (rows.length > 0) {
    return rows.map((row) => ({
      ...row,
      project_gallery_images: (row.project_gallery_images ?? []).sort(
        (a, b) => a.sort_order - b.sort_order
      ),
    }))
  }

  // Fallback to generated placeholder gallery
  return getFallbackPhotoGallery(projectId)
}

export async function getArtDirectionDetails(projectId: string): Promise<{
  slides: ProjectHeroSlide[]
  blocks: ProjectBlock[]
}> {
  const supabase = createServerSupabase()

  const [slidesRes, blocksRes] = await Promise.all([
    supabase
      .from('project_hero_slides')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order'),
    supabase
      .from('project_blocks')
      .select('*, project_block_images(*)')
      .eq('project_id', projectId)
      .order('sort_order'),
  ])

  const slides = (slidesRes.data ?? []) as ProjectHeroSlide[]
  const blocks = ((blocksRes.data ?? []) as ProjectBlock[]).map((block) => ({
    ...block,
    project_block_images: (block.project_block_images ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  }))

  if (slides.length > 0 || blocks.length > 0) {
    return { slides, blocks }
  }

  // Fallback to generated placeholder details
  return getFallbackArtDetails(projectId)
}
