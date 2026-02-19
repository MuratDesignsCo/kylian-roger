import type { Metadata } from 'next'
import { getArtDirectionProjects } from '@/lib/data/art-direction'
import { getPageSeo, seoToMetadata } from '@/lib/data/seo'
import { fallbackArtProjects } from '@/lib/data/fallback-projects'
import AnimatedHeadline from '@/components/public/AnimatedHeadline'
import ArtDirectionList from '@/components/public/art-direction/ArtDirectionList'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('art-direction')
  if (seo) return seoToMetadata(seo, 'Direction Artistique — Kylian Roger')
  return {
    title: 'Direction Artistique — Kylian Roger',
    description:
      'Projets de direction artistique par Kylian Roger : campagnes mode, branding, identité visuelle, scénographie et éditorial.',
  }
}

export default async function ArtDirectionPage() {
  const projects = await getArtDirectionProjects()
  const resolved = projects.length > 0 ? projects : fallbackArtProjects

  return (
    <>
      <section className="section_works_list">
        <div className="padding-global">
          <div className="works_list-heading">
            <div className="works_list-headline">
              <AnimatedHeadline className="text-align-center">ART DIRECTION</AnimatedHeadline>
            </div>
          </div>
          <div className="spacer-large"></div>
          <ArtDirectionList projects={resolved} />
          <div className="spacer-xxhuge"></div>
        </div>
      </section>
    </>
  )
}
