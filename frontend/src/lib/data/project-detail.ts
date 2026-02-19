import { gqlRequest } from '@/lib/graphql/client'
import { PROJECT_BY_SLUG_QUERY } from '@/lib/graphql/queries'
import {
  getFallbackProjectBySlug,
  getFallbackPhotoGallery,
  getFallbackArtDetails,
} from '@/lib/data/fallback-projects'
import type { Project, ProjectGalleryRow, ProjectHeroSlide, ProjectBlock, ProjectBlockImage } from '@/lib/types'

interface ProjectResponse {
  project: (Project & {
    gallery_rows?: Array<ProjectGalleryRow & { images?: Array<{ id: string; row_id: string; project_id: string; image_url: string; alt_text: string; sort_order: number }> }>
    hero_slides?: ProjectHeroSlide[]
    blocks?: Array<ProjectBlock & { images?: Array<Pick<ProjectBlockImage, 'id' | 'block_id' | 'image_url' | 'alt_text' | 'image_type' | 'sort_order'>> }>
  }) | null
}

export async function getProjectHeroSlides(projectId: string): Promise<ProjectHeroSlide[]> {
  // This is now fetched as part of getProjectBySlug via nested query
  // Kept for backward compat - callers should use project.hero_slides instead
  const { getFallbackHeroSlides } = await import('@/lib/data/fallback-projects')
  return getFallbackHeroSlides(projectId)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const data = await gqlRequest<ProjectResponse>(PROJECT_BY_SLUG_QUERY, { slug })
    if (data.project) return data.project
  } catch {
    // Fall through to fallback
  }
  return getFallbackProjectBySlug(slug)
}

export async function getPhotographyGallery(projectId: string): Promise<ProjectGalleryRow[]> {
  // Gallery rows are now nested in the project query
  // This function fetches the project by ID and extracts gallery rows
  try {
    const data = await gqlRequest<{ projectById: ProjectResponse['project'] }>(
      `query ProjectGallery($id: ID!) {
        projectById(id: $id) {
          gallery_rows {
            id
            project_id
            sort_order
            layout
            images {
              id
              row_id
              project_id
              image_url
              alt_text
              sort_order
            }
          }
        }
      }`,
      { id: projectId }
    )

    const rows = data.projectById?.gallery_rows ?? []
    if (rows.length > 0) {
      return rows.map((row) => ({
        ...row,
        project_gallery_images: (row.images ?? []).sort(
          (a, b) => a.sort_order - b.sort_order
        ),
      }))
    }
  } catch {
    // Fall through to fallback
  }
  return getFallbackPhotoGallery(projectId)
}

export async function getArtDirectionDetails(projectId: string): Promise<{
  slides: ProjectHeroSlide[]
  blocks: ProjectBlock[]
}> {
  try {
    const data = await gqlRequest<{ projectById: ProjectResponse['project'] }>(
      `query ProjectArtDetails($id: ID!) {
        projectById(id: $id) {
          hero_slides {
            id
            project_id
            image_url
            alt_text
            sort_order
          }
          blocks {
            id
            project_id
            block_type
            sort_order
            context_label
            context_heading
            context_text
            gallery_layout
            deliverables_items
            images {
              id
              block_id
              image_url
              alt_text
              image_type
              sort_order
            }
          }
        }
      }`,
      { id: projectId }
    )

    const slides = data.projectById?.hero_slides ?? []
    const blocks = (data.projectById?.blocks ?? []).map((block) => ({
      ...block,
      project_block_images: (block.images ?? []).sort(
        (a, b) => a.sort_order - b.sort_order
      ),
    }))

    if (slides.length > 0 || blocks.length > 0) {
      return { slides, blocks }
    }
  } catch {
    // Fall through to fallback
  }
  return getFallbackArtDetails(projectId)
}
