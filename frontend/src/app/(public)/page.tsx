import { getHomepageData } from '@/lib/data/homepage'
import { getPageSeo, seoToMetadata } from '@/lib/data/seo'
import HeroSection from '@/components/public/homepage/HeroSection'
import AboutSection from '@/components/public/homepage/AboutSection'
import WorksSection from '@/components/public/homepage/WorksSection'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('home')
  return seoToMetadata(seo, 'Kylian Roger — Photographe, Réalisateur & Directeur Artistique')
}

export default async function HomePage() {
  const { settings, heroImages, featuredWorks, hoverImages } =
    await getHomepageData()

  return (
    <>
      <HeroSection
        titleTop={settings?.hero_title_top ?? 'KYLIAN'}
        titleBottom={settings?.hero_title_bottom ?? 'ROGER'}
        role={settings?.hero_role ?? 'MULTIDISCIPLINARY ARTIST'}
        based={settings?.hero_based ?? 'AVAILABLE WORLDWIDE'}
        images={heroImages}
        logoTopUrl={settings?.hero_logo_top_url || undefined}
        logoBottomUrl={settings?.hero_logo_bottom_url || undefined}
      />
      <div className="home_hero_role-mobile">
        <p>{settings?.hero_role ?? 'MULTIDISCIPLINARY ARTIST'}</p>
        <p>{settings?.hero_based ?? 'AVAILABLE WORLDWIDE'}</p>
      </div>
      <AboutSection
        html={settings?.about_text_html || ''}
        hoverImages={hoverImages}
      />
      <WorksSection
        title={settings?.works_section_title ?? 'LATEST WORKS'}
        subtitle={settings?.works_section_subtitle ?? 'Explore more'}
        links={settings?.works_section_links ?? []}
        featuredWorks={featuredWorks}
      />
    </>
  )
}
