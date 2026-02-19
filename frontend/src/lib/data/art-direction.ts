import { gqlRequest } from '@/lib/graphql/client'
import { PROJECTS_QUERY } from '@/lib/graphql/queries'
import type { Project } from '@/lib/types'

export async function getArtDirectionProjects() {
  try {
    const data = await gqlRequest<{ projects: Project[] }>(PROJECTS_QUERY, {
      category: 'art-direction',
      published: true,
    })
    return data.projects
  } catch {
    return []
  }
}
