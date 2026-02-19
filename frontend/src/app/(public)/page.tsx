import { getHomepageData } from '@/lib/data/homepage'
import { getPageSeo, seoToMetadata } from '@/lib/data/seo'
import HeroSection from '@/components/public/homepage/HeroSection'
import AboutSection from '@/components/public/homepage/AboutSection'
import WorksSection from '@/components/public/homepage/WorksSection'
import type { Metadata } from 'next'
import type { HeroImage, WorksSectionLink, HomepageFeaturedWork } from '@/lib/types'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('home')
  return seoToMetadata(
    seo,
    'Kylian Roger — Photographe, Réalisateur & Directeur Artistique'
  )
}

// Fallback hero images (from original static HTML)
const defaultHeroImages: HeroImage[] = [
  { id: 'default-1', image_url: '/images/imgi_4_68c00695995951e6d8cc0eb7_jay-soundo-2HuJsD1LM9Y-unsplash.jpeg', alt_text: 'Photographie par Kylian Roger', sort_order: 0 },
  { id: 'default-2', image_url: '/images/imgi_5_68c006976e4838c42b8e8dbc_jay-soundo-xl1Sa0qgAew-unsplash.jpeg', alt_text: 'Travail de direction artistique par Kylian Roger', sort_order: 1 },
  { id: 'default-3', image_url: '/images/imgi_12_68c0111cf662d28b41daeb7a_jay-soundo-n-C6IyhU-9A-unsplash.jpeg', alt_text: 'Portrait éditorial par Kylian Roger', sort_order: 2 },
  { id: 'default-4', image_url: '/images/imgi_13_68c006ddcdf5732cb5d6f4bd_visualsofdana-tmmMi8FgdR0-unsplash.jpeg', alt_text: 'Projet lifestyle par Kylian Roger', sort_order: 3 },
  { id: 'default-5', image_url: '/images/imgi_14_68c0086f0c4e4446cd89a881_jay-soundo-T2sBYIswIhE-unsplash.jpeg', alt_text: 'Photographie de mode par Kylian Roger', sort_order: 4 },
]

// Fallback about text (from original static HTML)
const defaultAboutHtml = `Kylian works across <a href="/photography" class="about-hover-link" data-hover-img="/images/blank.jpg"><span class="gif photography">photography</span></a>, <a href="/film-motion" class="about-hover-link" data-hover-img="/images/blank.jpg"><span class="gif directing">directing</span></a>, and <a href="/art-direction" class="about-hover-link" data-hover-img="/images/blank.jpg"><span class="gif art-directing">art direction</span></a>, creating advertising work in automotive, sport, and lifestyle, with a parallel editorial practice and independent creative projects that explore identity.`

// Fallback works section links (from original static HTML)
const defaultWorksLinks: WorksSectionLink[] = [
  { label: 'STILL', href: '/photography' },
  { label: 'MOTION', href: '/film-motion' },
]

// Fallback featured works (4 items: still[0], motion[0], still[1], motion[1])
const defaultFeaturedWorks: HomepageFeaturedWork[] = [
  {
    id: 'fw-1', project_id: 'p1', slot_category: 'still', slot_index: 0, sort_order: 0,
    projects: { id: 'p1', slug: 'project-01', title: 'PROJECT 01', category: 'photography', cover_image_url: '/images/imgi_4_68c00695995951e6d8cc0eb7_jay-soundo-2HuJsD1LM9Y-unsplash.jpeg', cover_image_alt: 'Project 01', year: 2026, sort_order: 0, is_published: true, created_at: '', updated_at: '', photo_subcategory: null, photo_location: null, film_video_url: null, film_bg_image_url: null, film_subtitle: null, film_layout: null, art_client: null, art_role: null, art_description: null, art_tags: null, art_hero_label: null, card_label: null },
  },
  {
    id: 'fw-2', project_id: 'p2', slot_category: 'motion', slot_index: 0, sort_order: 1,
    projects: { id: 'p2', slug: 'film-project-01', title: 'PROJECT 01', category: 'film-motion', cover_image_url: '/images/imgi_5_68c006976e4838c42b8e8dbc_jay-soundo-xl1Sa0qgAew-unsplash.jpeg', cover_image_alt: 'Project 01', year: 2025, sort_order: 0, is_published: true, created_at: '', updated_at: '', photo_subcategory: null, photo_location: null, film_video_url: null, film_bg_image_url: null, film_subtitle: null, film_layout: null, art_client: null, art_role: null, art_description: null, art_tags: null, art_hero_label: null, card_label: null },
  },
  {
    id: 'fw-3', project_id: 'p3', slot_category: 'still', slot_index: 1, sort_order: 2,
    projects: { id: 'p3', slug: 'project-02', title: 'PROJECT 02', category: 'photography', cover_image_url: '/images/imgi_12_68c0111cf662d28b41daeb7a_jay-soundo-n-C6IyhU-9A-unsplash.jpeg', cover_image_alt: 'Project 02', year: 2025, sort_order: 1, is_published: true, created_at: '', updated_at: '', photo_subcategory: null, photo_location: null, film_video_url: null, film_bg_image_url: null, film_subtitle: null, film_layout: null, art_client: null, art_role: null, art_description: null, art_tags: null, art_hero_label: null, card_label: null },
  },
  {
    id: 'fw-4', project_id: 'p4', slot_category: 'motion', slot_index: 1, sort_order: 3,
    projects: { id: 'p4', slug: 'film-project-02', title: 'PROJECT 02', category: 'film-motion', cover_image_url: '/images/imgi_13_68c006ddcdf5732cb5d6f4bd_visualsofdana-tmmMi8FgdR0-unsplash.jpeg', cover_image_alt: 'Project 02', year: 2025, sort_order: 1, is_published: true, created_at: '', updated_at: '', photo_subcategory: null, photo_location: null, film_video_url: null, film_bg_image_url: null, film_subtitle: null, film_layout: null, art_client: null, art_role: null, art_description: null, art_tags: null, art_hero_label: null, card_label: null },
  },
]

export default async function HomePage() {
  const { settings, heroImages, featuredWorks, hoverImages } =
    await getHomepageData()

  const resolvedLinks = settings?.works_section_links?.length
    ? settings.works_section_links
    : defaultWorksLinks

  return (
    <>
      <HeroSection
        titleTop={settings?.hero_title_top ?? 'KYLIAN'}
        titleBottom={settings?.hero_title_bottom ?? 'ROGER'}
        role={settings?.hero_role ?? 'MULTIDISCIPLINARY ARTIST'}
        based={settings?.hero_based ?? 'AVAILABLE WORLDWIDE'}
        images={heroImages.length > 0 ? heroImages : defaultHeroImages}
      />
      <AboutSection
        html={settings?.about_text_html || defaultAboutHtml}
        hoverImages={hoverImages}
      />
      <WorksSection
        title={settings?.works_section_title ?? 'LATEST\nWORKS'}
        links={resolvedLinks}
        featuredWorks={featuredWorks.length > 0 ? featuredWorks : defaultFeaturedWorks}
      />
    </>
  )
}
