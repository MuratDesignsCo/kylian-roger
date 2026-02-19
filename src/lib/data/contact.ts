import { createServerSupabase } from '@/lib/supabase/server'
import type { ContactPage, ContactInfoBlock, Award, BtsImage, MediaKitButton } from '@/lib/types'

export async function getContactData() {
  const supabase = createServerSupabase()

  const [pageRes, infoRes, awardsRes, btsRes, mediaKitRes] = await Promise.all([
    supabase.from('contact_page').select('*').eq('id', 'main').single(),
    supabase.from('contact_info_blocks').select('*').order('sort_order'),
    supabase.from('awards').select('*').order('sort_order'),
    supabase.from('bts_images').select('*').order('sort_order'),
    supabase.from('media_kit_buttons').select('*').order('sort_order'),
  ])

  return {
    page: pageRes.data as ContactPage | null,
    infoBlocks: (infoRes.data ?? []) as ContactInfoBlock[],
    awards: (awardsRes.data ?? []) as Award[],
    btsImages: (btsRes.data ?? []) as BtsImage[],
    mediaKitButtons: (mediaKitRes.data ?? []) as MediaKitButton[],
  }
}
