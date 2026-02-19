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
      footer_big_name
      copyright_text
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
      footer_big_name
      copyright_text
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
        project {
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
