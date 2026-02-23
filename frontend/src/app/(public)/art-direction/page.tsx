import type { Metadata } from 'next'
import { getArtDirectionProjects } from '@/lib/data/art-direction'
import { getPageSettings } from '@/lib/data/page-settings'
import { getPageSeo, seoToMetadata } from '@/lib/data/seo'
import { fallbackArtProjects } from '@/lib/data/fallback-projects'
import AnimatedHeadline from '@/components/public/AnimatedHeadline'
import ArtDirectionList from '@/components/public/art-direction/ArtDirectionList'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('art-direction')
  if (seo) return seoToMetadata(seo, 'Direction Artistique — Kylian Roger')
  return {
    title: 'Direction Artistique — Kylian Roger',
    description: 'Projets de direction artistique par Kylian Roger : campagnes mode, branding, identité visuelle, scénographie et éditorial.',
  }
}

export default async function ArtDirectionPage() {
  const [projects, settings] = await Promise.all([
    getArtDirectionProjects(),
    getPageSettings('art-direction'),
  ])
  const resolved = projects.length > 0 ? projects : fallbackArtProjects
  const pageTitle = settings?.page_title || 'ART DIRECTION'
  const initialVisible = settings?.items_per_page ?? 6

  return (
    <>
      <section className="section_works_list">
        <div className="padding-global">
          <div className="works_list-heading">
            <div className="works_list-headline">
              <AnimatedHeadline className="text-align-center">{pageTitle}</AnimatedHeadline>
            </div>
          </div>
          <div className="spacer-large"></div>
          <ArtDirectionList projects={resolved} initialVisible={initialVisible} />
          <div className="spacer-xxhuge"></div>
        </div>
      </section>
    </>
  )
}
