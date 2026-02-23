import { getFilmMotionProjects } from '@/lib/data/film-motion'
import { getPageSettings } from '@/lib/data/page-settings'
import { getPageSeo, seoToMetadata } from '@/lib/data/seo'
import { fallbackFilmProjects } from '@/lib/data/fallback-projects'
import type { Metadata } from 'next'
import AnimatedHeadline from '@/components/public/AnimatedHeadline'
import FilmMotionClient from './FilmMotionClient'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('film-motion')
  return seoToMetadata(seo, 'Film / Motion — Kylian Roger | Portfolio')
}

export default async function FilmMotionPage() {
  const [projects, settings] = await Promise.all([
    getFilmMotionProjects(),
    getPageSettings('film-motion'),
  ])
  const resolved = projects.length > 0 ? projects : fallbackFilmProjects
  const pageTitle = settings?.page_title || 'FILM / MOTION'

  return (
    <>
      <section className="section_works_list">
        <div className="padding-global">
          <div className="works_list-heading">
            <div className="works_list-headline">
              <AnimatedHeadline className="text-align-center">{pageTitle}</AnimatedHeadline>
            </div>
          </div>
        </div>
      </section>
      <div className="spacer-xlarge" />
      <FilmMotionClient projects={resolved} />
    </>
  )
}
