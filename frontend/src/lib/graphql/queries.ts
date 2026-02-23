// ============================================================
// Public Queries
// ============================================================

export const SETTINGS_QUERY = `
  query Settings {
    settings {
      id
      hero_title_top
      hero_title_bottom
      hero_role
      hero_based
      about_text_html
      works_section_title
      works_section_links
      works_section_subtitle
      hero_logo_top_url
      hero_logo_bottom_url
      footer_big_name
      copyright_text
      navbar_logo_url
      footer_logo_url
      nav_menu_order
      nav_dropdown_order
      updated_at
    }
  }
`

export const HOMEPAGE_QUERY = `
  query Homepage {
    settings {
      id
      hero_title_top
      hero_title_bottom
      hero_role
      hero_based
      about_text_html
      works_section_title
      works_section_links
      works_section_subtitle
      hero_logo_top_url
      hero_logo_bottom_url
      footer_big_name
      copyright_text
      navbar_logo_url
      footer_logo_url
      nav_menu_order
      nav_dropdown_order
    }
    homepage {
      heroImages {
        id
        image_url
        alt_text
        sort_order
      }
      featuredWorks {
        id
        project_id
        slot_category
        slot_index
        sort_order
        projects: project {
          id
          slug
          title
          category
          cover_image_url
          cover_image_alt
          year
          film_video_url
          film_bg_image_url
        }
      }
      hoverImages {
        id
        link_identifier
        image_url
        alt_text
      }
      projects {
        id
        slug
        title
        category
        cover_image_url
      }
    }
  }
`

export const ADMIN_HOMEPAGE_QUERY = `
  query AdminHomepage {
    settings {
      id
      hero_title_top
      hero_title_bottom
      hero_role
      hero_based
      hero_logo_top_url
      hero_logo_bottom_url
      about_text_html
      works_section_title
      works_section_subtitle
      works_section_links
    }
    homepage {
      heroImages {
        id
        image_url
        alt_text
        sort_order
      }
      featuredWorks {
        id
        project_id
        slot_category
        slot_index
        sort_order
        projects: project {
          id
          slug
          title
          category
          cover_image_url
          year
        }
      }
      hoverImages {
        id
        link_identifier
        image_url
        alt_text
      }
      projects {
        id
        slug
        title
        category
        cover_image_url
        year
      }
    }
    seoPage(slug: "home") {
      id
      page_slug
      meta_title
      meta_description
      og_title
      og_description
      og_image_url
    }
  }
`

export const PROJECTS_QUERY = `
  query Projects($category: String, $published: Boolean) {
    projects(category: $category, published: $published) {
      id
      slug
      category
      title
      cover_image_url
      cover_image_alt
      year
      project_date
      sort_order
      is_published
      photo_subcategory
      photo_location
      film_video_url
      film_bg_image_url
      film_subtitle
      film_layout
      art_client
      art_role
      art_description
      art_tags
      art_hero_label
      card_label
    }
  }
`

export const PROJECT_BY_SLUG_QUERY = `
  query ProjectBySlug($slug: String!) {
    project(slug: $slug) {
      id
      slug
      category
      title
      cover_image_url
      cover_image_alt
      year
      project_date
      sort_order
      is_published
      photo_subcategory
      photo_location
      film_video_url
      film_bg_image_url
      film_subtitle
      film_layout
      art_client
      art_role
      art_description
      art_tags
      art_hero_label
      card_label
      meta_title
      meta_description
      og_title
      og_description
      og_image_url
      gallery_rows {
        id
        project_id
        sort_order
        layout
        images {
          id
          row_id
          project_id
          image_url
          alt_text
          sort_order
        }
      }
      hero_slides {
        id
        project_id
        image_url
        alt_text
        sort_order
      }
      blocks {
        id
        project_id
        block_type
        sort_order
        context_label
        context_heading
        context_text
        gallery_layout
        deliverables_items
        images {
          id
          block_id
          image_url
          alt_text
          image_type
          sort_order
        }
      }
    }
  }
`

export const PROJECT_BY_ID_QUERY = `
  query ProjectById($id: ID!) {
    projectById(id: $id) {
      id
      slug
      category
      title
      cover_image_url
      cover_image_alt
      year
      project_date
      sort_order
      is_published
      photo_subcategory
      photo_location
      film_video_url
      film_bg_image_url
      film_subtitle
      film_layout
      art_client
      art_role
      art_description
      art_tags
      art_hero_label
      card_label
      meta_title
      meta_description
      og_title
      og_description
      og_image_url
      gallery_rows {
        id
        project_id
        sort_order
        layout
        images {
          id
          row_id
          project_id
          image_url
          alt_text
          sort_order
        }
      }
      hero_slides {
        id
        project_id
        image_url
        alt_text
        sort_order
      }
      blocks {
        id
        project_id
        block_type
        sort_order
        context_label
        context_heading
        context_text
        gallery_layout
        deliverables_items
        images {
          id
          block_id
          image_url
          alt_text
          image_type
          sort_order
        }
      }
    }
  }
`

export const CONTACT_QUERY = `
  query Contact {
    contact {
      page {
        id
        title
        portrait_image_url
        portrait_image_alt
        bio_html
        awards_title
        bts_title
        updated_at
      }
      infoBlocks {
        id
        label
        email
        phone
        sort_order
      }
      awards {
        id
        award_name
        organizer
        year
        hover_image_url
        sort_order
      }
      btsImages {
        id
        image_url
        alt_text
        sort_order
      }
      mediaKitButtons {
        id
        label
        file_url
        sort_order
      }
    }
  }
`

export const ADMIN_CONTACT_QUERY = `
  query AdminContact {
    contact {
      page {
        id
        title
        portrait_image_url
        portrait_image_alt
        bio_html
        awards_title
        bts_title
        updated_at
      }
      infoBlocks {
        id
        label
        email
        phone
        sort_order
      }
      awards {
        id
        award_name
        organizer
        year
        hover_image_url
        sort_order
      }
      btsImages {
        id
        image_url
        alt_text
        sort_order
      }
      mediaKitButtons {
        id
        label
        file_url
        sort_order
      }
    }
    seoPage(slug: "contact") {
      id
      page_slug
      meta_title
      meta_description
      og_title
      og_description
      og_image_url
    }
  }
`

export const SEO_PAGES_QUERY = `
  query SeoPages {
    seoPages {
      id
      page_slug
      meta_title
      meta_description
      og_title
      og_description
      og_image_url
    }
  }
`

export const ADMIN_PHOTOGRAPHY_PAGE_QUERY = `
  query AdminPhotographyPage {
    pageSettings(slug: "photography") {
      page_slug
      page_title
      items_per_page
      updated_at
    }
    seoPage(slug: "photography") {
      id
      page_slug
      meta_title
      meta_description
      og_title
      og_description
      og_image_url
    }
  }
`

export const ADMIN_ART_DIRECTION_PAGE_QUERY = `
  query AdminArtDirectionPage {
    pageSettings(slug: "art-direction") {
      page_slug
      page_title
      items_per_page
      items_per_page_alt
      updated_at
    }
    seoPage(slug: "art-direction") {
      id
      page_slug
      meta_title
      meta_description
      og_title
      og_description
      og_image_url
    }
  }
`

export const ADMIN_FILM_MOTION_PAGE_QUERY = `
  query AdminFilmMotionPage {
    pageSettings(slug: "film-motion") {
      page_slug
      page_title
      updated_at
    }
    seoPage(slug: "film-motion") {
      id
      page_slug
      meta_title
      meta_description
      og_title
      og_description
      og_image_url
    }
  }
`

export const PAGE_SETTINGS_QUERY = `
  query PageSettings($slug: String!) {
    pageSettings(slug: $slug) {
      page_slug
      page_title
      items_per_page
      items_per_page_alt
    }
  }
`

export const SEO_PAGE_QUERY = `
  query SeoPage($slug: String!) {
    seoPage(slug: $slug) {
      id
      page_slug
      meta_title
      meta_description
      og_title
      og_description
      og_image_url
    }
  }
`
