import gql from 'graphql-tag'

const typeDefs = gql`
  # ============================================================
  # Types
  # ============================================================

  type SiteSettings {
    id: String!
    hero_title_top: String!
    hero_title_bottom: String!
    hero_role: String!
    hero_based: String!
    about_text_html: String!
    works_section_title: String!
    works_section_links: JSON!
    works_section_subtitle: String!
    hero_logo_top_url: String!
    hero_logo_bottom_url: String!
    footer_big_name: String!
    copyright_text: String!
    navbar_logo_url: String!
    footer_logo_url: String!
    nav_menu_order: JSON!
    nav_dropdown_order: JSON!
    updated_at: String!
  }

  type PageSeo {
    id: ID!
    page_slug: String!
    meta_title: String!
    meta_description: String!
    og_title: String!
    og_description: String!
    og_image_url: String!
    updated_at: String!
  }

  type PageSettings {
    page_slug: String!
    page_title: String
    items_per_page: Int!
    items_per_page_alt: Int
    updated_at: String!
  }

  type HeroImage {
    id: ID!
    image_url: String!
    alt_text: String!
    sort_order: Int!
  }

  type AboutHoverImage {
    id: ID!
    link_identifier: String!
    image_url: String!
    alt_text: String!
  }

  type Project {
    id: ID!
    slug: String!
    category: String!
    title: String!
    cover_image_url: String!
    cover_image_alt: String!
    year: Int!
    project_date: String
    sort_order: Int!
    is_published: Boolean!
    created_at: String!
    updated_at: String!
    photo_subcategory: String
    photo_location: String
    film_video_url: String
    film_bg_image_url: String
    film_subtitle: String
    film_layout: String
    art_client: String
    art_role: String
    art_description: String
    art_tags: [String!]
    art_hero_label: String
    card_label: String
    # SEO fields (per-project meta for /works/[slug] pages)
    meta_title: String!
    meta_description: String!
    og_title: String!
    og_description: String!
    og_image_url: String!
    # Nested relations (resolved on demand)
    gallery_rows: [ProjectGalleryRow!]
    hero_slides: [ProjectHeroSlide!]
    blocks: [ProjectBlock!]
  }

  type ProjectGalleryRow {
    id: ID!
    project_id: ID!
    sort_order: Int!
    layout: String!
    images: [ProjectGalleryImage!]
  }

  type ProjectGalleryImage {
    id: ID!
    row_id: ID!
    project_id: ID!
    image_url: String!
    alt_text: String!
    sort_order: Int!
  }

  type ProjectHeroSlide {
    id: ID!
    project_id: ID!
    image_url: String!
    alt_text: String!
    sort_order: Int!
  }

  type ProjectBlock {
    id: ID!
    project_id: ID!
    block_type: String!
    sort_order: Int!
    context_label: String
    context_heading: String
    context_text: String
    gallery_layout: String
    deliverables_items: JSON
    images: [ProjectBlockImage!]
  }

  type ProjectBlockImage {
    id: ID!
    block_id: ID!
    image_url: String!
    alt_text: String!
    image_type: String!
    sort_order: Int!
  }

  type HomepageFeaturedWork {
    id: ID!
    project_id: ID!
    slot_category: String!
    slot_index: Int!
    sort_order: Int!
    project: Project
  }

  type ContactPage {
    id: String!
    title: String!
    portrait_image_url: String!
    portrait_image_alt: String!
    bio_html: String!
    awards_title: String!
    bts_title: String!
    updated_at: String!
  }

  type ContactInfoBlock {
    id: ID!
    label: String!
    email: String!
    phone: String!
    sort_order: Int!
  }

  type Award {
    id: ID!
    award_name: String!
    organizer: String!
    year: String!
    hover_image_url: String!
    sort_order: Int!
  }

  type BtsImage {
    id: ID!
    image_url: String!
    alt_text: String!
    sort_order: Int!
  }

  type MediaKitButton {
    id: ID!
    label: String!
    file_url: String!
    sort_order: Int!
  }

  # ============================================================
  # Compound types
  # ============================================================

  type HomepageData {
    heroImages: [HeroImage!]!
    featuredWorks: [HomepageFeaturedWork!]!
    hoverImages: [AboutHoverImage!]!
    projects: [Project!]!
  }

  type ContactData {
    page: ContactPage!
    infoBlocks: [ContactInfoBlock!]!
    awards: [Award!]!
    btsImages: [BtsImage!]!
    mediaKitButtons: [MediaKitButton!]!
  }

  type AuthPayload {
    token: String!
    user: AdminUser!
  }

  type AdminUser {
    id: ID!
    email: String!
  }

  type UploadResult {
    url: String!
    path: String!
  }

  # ============================================================
  # Queries (public)
  # ============================================================

  type Query {
    settings: SiteSettings
    seoPages: [PageSeo!]!
    seoPage(slug: String!): PageSeo
    pageSettings(slug: String!): PageSettings
    homepage: HomepageData!
    projects(category: String, published: Boolean): [Project!]!
    project(slug: String!): Project
    projectById(id: ID!): Project
    contact: ContactData!
  }

  # ============================================================
  # Scalar for arbitrary JSON
  # ============================================================

  scalar JSON

  # ============================================================
  # Inputs
  # ============================================================

  input SettingsInput {
    hero_title_top: String
    hero_title_bottom: String
    hero_role: String
    hero_based: String
    about_text_html: String
    works_section_title: String
    works_section_links: JSON
    works_section_subtitle: String
    hero_logo_top_url: String
    hero_logo_bottom_url: String
    footer_big_name: String
    copyright_text: String
    navbar_logo_url: String
    footer_logo_url: String
    nav_menu_order: JSON
    nav_dropdown_order: JSON
  }

  input SeoPageInput {
    id: ID
    page_slug: String!
    meta_title: String!
    meta_description: String!
    og_title: String
    og_description: String
    og_image_url: String
  }

  input PageSettingsInput {
    page_slug: String!
    page_title: String
    items_per_page: Int
    items_per_page_alt: Int
  }

  input ProjectInput {
    slug: String!
    category: String!
    title: String!
    cover_image_url: String
    cover_image_alt: String
    year: Int
    project_date: String
    sort_order: Int
    is_published: Boolean
    photo_subcategory: String
    photo_location: String
    film_video_url: String
    film_bg_image_url: String
    film_subtitle: String
    film_layout: String
    art_client: String
    art_role: String
    art_description: String
    art_tags: [String!]
    art_hero_label: String
    card_label: String
    meta_title: String
    meta_description: String
    og_title: String
    og_description: String
    og_image_url: String
  }

  input HeroImageInput {
    image_url: String!
    alt_text: String
    sort_order: Int
  }

  input FeaturedWorkInput {
    project_id: ID!
    slot_category: String!
    slot_index: Int!
    sort_order: Int
  }

  input HoverImageInput {
    link_identifier: String!
    image_url: String!
    alt_text: String
  }

  input HomepageInput {
    heroImages: [HeroImageInput!]
    featuredWorks: [FeaturedWorkInput!]
    hoverImages: [HoverImageInput!]
  }

  input ContactPageInput {
    title: String
    portrait_image_url: String
    portrait_image_alt: String
    bio_html: String
    awards_title: String
    bts_title: String
  }

  input ContactInfoBlockInput {
    id: ID
    label: String!
    email: String
    phone: String
    sort_order: Int
  }

  input AwardInput {
    id: ID
    award_name: String!
    organizer: String!
    year: String!
    hover_image_url: String
    sort_order: Int
  }

  input BtsImageInput {
    id: ID
    image_url: String!
    alt_text: String
    sort_order: Int
  }

  input MediaKitButtonInput {
    id: ID
    label: String!
    file_url: String!
    sort_order: Int
  }

  input ContactInput {
    page: ContactPageInput
    infoBlocks: [ContactInfoBlockInput!]
    awards: [AwardInput!]
    btsImages: [BtsImageInput!]
    mediaKitButtons: [MediaKitButtonInput!]
  }

  input GalleryRowInput {
    id: ID
    sort_order: Int!
    layout: String!
    images: [GalleryImageInput!]
  }

  input GalleryImageInput {
    id: ID
    image_url: String!
    alt_text: String
    sort_order: Int
  }

  input HeroSlideInput {
    id: ID
    image_url: String!
    alt_text: String
    sort_order: Int
  }

  input ProjectBlockInput {
    id: ID
    block_type: String!
    sort_order: Int!
    context_label: String
    context_heading: String
    context_text: String
    gallery_layout: String
    deliverables_items: JSON
    images: [BlockImageInput!]
  }

  input BlockImageInput {
    id: ID
    image_url: String!
    alt_text: String
    image_type: String
    sort_order: Int
  }

  # ============================================================
  # Mutations (authenticated)
  # ============================================================

  type Mutation {
    # Auth
    login(email: String!, password: String!): AuthPayload!

    # Settings
    updateSettings(input: SettingsInput!): SiteSettings!

    # SEO
    upsertSeoPages(input: [SeoPageInput!]!): [PageSeo!]!

    # Page Settings
    upsertPageSettings(input: PageSettingsInput!): PageSettings!

    # Projects
    createProject(input: ProjectInput!): Project!
    updateProject(id: ID!, input: ProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    # Project nested data
    saveGalleryRows(projectId: ID!, rows: [GalleryRowInput!]!): [ProjectGalleryRow!]!
    saveHeroSlides(projectId: ID!, slides: [HeroSlideInput!]!): [ProjectHeroSlide!]!
    saveProjectBlocks(projectId: ID!, blocks: [ProjectBlockInput!]!): [ProjectBlock!]!

    # Homepage
    updateHomepage(input: HomepageInput!): HomepageData!

    # Contact
    updateContact(input: ContactInput!): ContactData!
  }
`

export default typeDefs
