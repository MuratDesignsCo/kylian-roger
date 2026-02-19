import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getProjectBySlug,
  getPhotographyGallery,
  getArtDirectionDetails,
  getProjectHeroSlides,
} from '@/lib/data/project-detail'
import PhotoProjectDetail from '@/components/public/works/PhotoProjectDetail'
import ArtProjectDetail from '@/components/public/works/ArtProjectDetail'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) {
    return { title: 'Projet introuvable — Kylian Roger' }
  }
  return {
    title: `${project.title} — Kylian Roger`,
    description: project.art_description || `Découvrez le projet ${project.title} par Kylian Roger.`,
    openGraph: {
      title: `${project.title} — Kylian Roger`,
      description: project.art_description || `Découvrez le projet ${project.title} par Kylian Roger.`,
      images: project.cover_image_url ? [project.cover_image_url] : undefined,
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
    const [galleryRows, heroSlides] = await Promise.all([
      getPhotographyGallery(project.id),
      getProjectHeroSlides(project.id),
    ])
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
