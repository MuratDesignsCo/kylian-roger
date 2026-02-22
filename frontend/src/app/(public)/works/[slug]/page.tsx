import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getProjectBySlug,
  getPhotographyGallery,
  getArtDirectionDetails,
} from '@/lib/data/project-detail'
import PhotoProjectDetail from '@/components/public/works/PhotoProjectDetail'
import ArtProjectDetail from '@/components/public/works/ArtProjectDetail'
import type { ProjectHeroSlide, ProjectGalleryRow } from '@/lib/types'

/** Build hero slides from cover image + first 3 gallery images */
function buildPhotoHeroSlides(
  projectId: string,
  coverUrl: string,
  title: string,
  galleryRows: ProjectGalleryRow[]
): ProjectHeroSlide[] {
  const slides: ProjectHeroSlide[] = []

  // 1. Cover image
  if (coverUrl) {
    slides.push({
      id: `${projectId}-auto-cover`,
      project_id: projectId,
      image_url: coverUrl,
      alt_text: title,
      sort_order: 0,
    })
  }

  // 2. First 3 gallery images
  const galleryImages = galleryRows
    .flatMap((row) => (row.project_gallery_images ?? []).sort((a, b) => a.sort_order - b.sort_order))
  for (let i = 0; i < Math.min(3, galleryImages.length); i++) {
    slides.push({
      id: `${projectId}-auto-gallery-${i}`,
      project_id: projectId,
      image_url: galleryImages[i].image_url,
      alt_text: galleryImages[i].alt_text || title,
      sort_order: slides.length,
    })
  }

  return slides
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) {
    return { title: 'Projet introuvable — Kylian Roger' }
  }

  const fallbackTitle = `${project.title} — Kylian Roger`
  const fallbackDescription = project.art_description || `Découvrez le projet ${project.title} par Kylian Roger.`

  const title = project.meta_title || fallbackTitle
  const description = project.meta_description || fallbackDescription
  const ogTitle = project.og_title || project.meta_title || fallbackTitle
  const ogDescription = project.og_description || project.meta_description || fallbackDescription
  const ogImage = project.og_image_url || project.cover_image_url

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
    },
  }
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  if (project.category === 'photography') {
    const galleryRows = await getPhotographyGallery(project.id)

    // Use hero_slides from DB (nested in project query) if available,
    // otherwise auto-generate from cover image + first 3 gallery images
    const dbSlides = (project as unknown as { hero_slides?: ProjectHeroSlide[] }).hero_slides
    let heroSlides: ProjectHeroSlide[] = dbSlides && dbSlides.length > 0 ? dbSlides : []

    if (heroSlides.length === 0) {
      heroSlides = buildPhotoHeroSlides(project.id, project.cover_image_url, project.title, galleryRows)
    }

    return <PhotoProjectDetail project={project} galleryRows={galleryRows} heroSlides={heroSlides} />
  }

  if (project.category === 'art-direction') {
    const { slides, blocks } = await getArtDirectionDetails(project.id)
    return <ArtProjectDetail project={project} slides={slides} blocks={blocks} />
  }

  // film-motion projects redirect to the category page
  if (project.category === 'film-motion') {
    const { redirect } = await import('next/navigation')
    redirect('/film-motion')
  }

  notFound()
}
