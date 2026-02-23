import { gqlRequest } from '@/lib/graphql/client'
import { PAGE_SETTINGS_QUERY } from '@/lib/graphql/queries'
import type { PageSettings } from '@/lib/types'

export async function getPageSettings(pageSlug: string): Promise<PageSettings | null> {
  try {
    const data = await gqlRequest<{ pageSettings: PageSettings | null }>(
      PAGE_SETTINGS_QUERY,
      { slug: pageSlug }
    )
    return data.pageSettings
  } catch {
    return null
  }
}
