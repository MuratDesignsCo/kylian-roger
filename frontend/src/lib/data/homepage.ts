import { gqlRequest } from '@/lib/graphql/client'
import { HOMEPAGE_QUERY } from '@/lib/graphql/queries'
import type { SiteSettings, HeroImage, HomepageFeaturedWork, AboutHoverImage, Project } from '@/lib/types'

interface HomepageResponse {
  settings: SiteSettings | null
  homepage: {
    heroImages: HeroImage[]
    featuredWorks: HomepageFeaturedWork[]
    hoverImages: AboutHoverImage[]
    projects: Project[]
  }
}

export async function getHomepageData() {
  try {
    const data = await gqlRequest<HomepageResponse>(HOMEPAGE_QUERY)
    return {
      settings: data.settings,
      heroImages: data.homepage.heroImages,
      featuredWorks: data.homepage.featuredWorks,
      hoverImages: data.homepage.hoverImages,
    }
  } catch {
    return {
      settings: null,
      heroImages: [],
      featuredWorks: [],
      hoverImages: [],
    }
  }
}
