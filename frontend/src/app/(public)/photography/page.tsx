import { getPhotographyProjects } from '@/lib/data/photography'
import { getPageSeo, seoToMetadata } from '@/lib/data/seo'
import { fallbackPhotoProjects } from '@/lib/data/fallback-projects'
import PhotoGallery from '@/components/public/photography/PhotoGallery'
import AnimatedHeadline from '@/components/public/AnimatedHeadline'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('photography')
  return seoToMetadata(seo, 'Photographie — Kylian Roger | Portfolio')
}

export default async function PhotographyPage() {
  const projects = await getPhotographyProjects()
  const resolved = projects.length > 0 ? projects : fallbackPhotoProjects

  return (
    <section className="section_works_list">
      <div className="padding-global">
        <div className="works_list-heading">
          <div className="works_list-headline">
            <AnimatedHeadline className="text-align-center">PHOTOGRAPHY</AnimatedHeadline>
          </div>
        </div>
        <div className="spacer-large" />
        <PhotoGallery projects={resolved} />
        <div className="spacer-xxhuge" />
      </div>
    </section>
  )
}
