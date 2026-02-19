// ============================================================
// Database types matching PostgreSQL schema
// ============================================================

export interface SiteSettings {
  id: string
  hero_title_top: string
  hero_title_bottom: string
  hero_role: string
  hero_based: string
  about_text_html: string
  works_section_title: string
  works_section_links: WorksSectionLink[]
  footer_big_name: string
  copyright_text: string
  updated_at: string
}

export interface WorksSectionLink {
  label: string
  href: string
}

export interface PageSeo {
  id: string
  page_slug: string
  meta_title: string
  meta_description: string
  og_title: string
  og_description: string
  og_image_url: string
  updated_at: string
}

export interface HeroImage {
  id: string
  image_url: string
  alt_text: string
  sort_order: number
}

export interface AboutHoverImage {
  id: string
  link_identifier: string
  image_url: string
  alt_text: string
}

export interface Project {
  id: string
  slug: string
  category: 'photography' | 'film-motion' | 'art-direction'
  title: string
  cover_image_url: string
  cover_image_alt: string
  year: number
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
  // Photography-specific
  photo_subcategory: string | null
  photo_location: string | null
  // Film/Motion-specific
  film_video_url: string | null
  film_bg_image_url: string | null
  film_subtitle: string | null
  film_layout: 'landscape' | 'vertical' | null
  // Art Direction-specific
  art_client: string | null
  art_role: string | null
  art_description: string | null
  art_tags: string[] | null
  art_hero_label: string | null
  // Card display label (free text, replaces year display on photography page)
  card_label: string | null
}

export interface ProjectGalleryRow {
  id: string
  project_id: string
  sort_order: number
  layout: 'full' | 'half' | 'third' | 'quarter'
  project_gallery_images?: ProjectGalleryImage[]
}

export interface ProjectGalleryImage {
  id: string
  row_id: string
  project_id: string
  image_url: string
  alt_text: string
  sort_order: number
}

export interface ProjectHeroSlide {
  id: string
  project_id: string
  image_url: string
  alt_text: string
  sort_order: number
}

export interface ProjectBlock {
  id: string
  project_id: string
  block_type: 'gallery' | 'context' | 'deliverables'
  sort_order: number
  // Context block fields
  context_label: string | null
  context_heading: string | null
  context_text: string | null
  // Gallery block fields
  gallery_layout: 'full' | 'pair' | 'trio' | 'pair-full' | null
  // Deliverables fields
  deliverables_items: DeliverableItem[] | null
  // Nested images
  project_block_images?: ProjectBlockImage[]
}

export interface DeliverableItem {
  number: string
  name: string
}

export interface ProjectBlockImage {
  id: string
  block_id: string
  image_url: string
  alt_text: string
  image_type: 'landscape' | 'portrait' | 'full'
  sort_order: number
}

export interface HomepageFeaturedWork {
  id: string
  project_id: string
  slot_category: 'still' | 'motion'
  slot_index: number
  sort_order: number
  projects?: Project
}

export interface ContactPage {
  id: string
  title: string
  portrait_image_url: string
  portrait_image_alt: string
  bio_html: string
  awards_title: string
  bts_title: string
  updated_at: string
}

export interface ContactInfoBlock {
  id: string
  label: string
  email: string
  phone: string
  sort_order: number
}

export interface Award {
  id: string
  award_name: string
  organizer: string
  year: string
  hover_image_url: string
  sort_order: number
}

export interface BtsImage {
  id: string
  image_url: string
  alt_text: string
  sort_order: number
}

export interface MediaKitButton {
  id: string
  label: string
  file_url: string
  sort_order: number
}
