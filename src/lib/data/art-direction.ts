import { createServerSupabase } from '@/lib/supabase/server'
import type { Project } from '@/lib/types'

export async function getArtDirectionProjects() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('category', 'art-direction')
    .eq('is_published', true)
    .order('sort_order')

  return (data ?? []) as Project[]
}
