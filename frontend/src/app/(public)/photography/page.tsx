import { getPhotographyProjects } from '@/lib/data/photography'
import { getPageSettings } from '@/lib/data/page-settings'
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
  const [projects, settings] = await Promise.all([
    getPhotographyProjects(),
    getPageSettings('photography'),
  ])
  const resolved = projects.length > 0 ? projects : fallbackPhotoProjects
  const pageTitle = settings?.page_title || 'PHOTOGRAPHY'
  const initialVisible = settings?.items_per_page ?? 9

  return (
    <section className="section_works_list">
      <div className="padding-global">
        <div className="works_list-heading">
          <div className="works_list-headline">
            <AnimatedHeadline className="text-align-center">{pageTitle}</AnimatedHeadline>
          </div>
        </div>
        <div className="spacer-large" />
        <PhotoGallery projects={resolved} initialVisible={initialVisible} />
        <div className="spacer-xxhuge" />
      </div>
    </section>
  )
}
