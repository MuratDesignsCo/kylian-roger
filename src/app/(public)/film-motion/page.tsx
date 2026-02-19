import { getFilmMotionProjects } from '@/lib/data/film-motion'
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
  const projects = await getFilmMotionProjects()
  const resolved = projects.length > 0 ? projects : fallbackFilmProjects

  return (
    <>
      <section className="section_works_list">
        <div className="padding-global">
          <div className="works_list-heading">
            <div className="works_list-headline">
              <AnimatedHeadline className="text-align-center">FILM / MOTION</AnimatedHeadline>
            </div>
          </div>
        </div>
      </section>
      <div className="spacer-xlarge" />
      <FilmMotionClient projects={resolved} />
    </>
  )
}
