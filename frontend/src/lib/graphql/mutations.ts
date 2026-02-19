// ============================================================
// Authenticated Mutations
// ============================================================

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`

export const UPDATE_SETTINGS_MUTATION = `
  mutation UpdateSettings($input: SettingsInput!) {
    updateSettings(input: $input) {
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
  }
`

export const UPSERT_SEO_PAGES_MUTATION = `
  mutation UpsertSeoPages($input: [SeoPageInput!]!) {
    upsertSeoPages(input: $input) {
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

export const CREATE_PROJECT_MUTATION = `
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      slug
      category
      title
    }
  }
`

export const UPDATE_PROJECT_MUTATION = `
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      slug
      category
      title
      cover_image_url
      cover_image_alt
      year
      sort_order
      is_published
    }
  }
`

export const DELETE_PROJECT_MUTATION = `
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`

export const SAVE_GALLERY_ROWS_MUTATION = `
  mutation SaveGalleryRows($projectId: ID!, $rows: [GalleryRowInput!]!) {
    saveGalleryRows(projectId: $projectId, rows: $rows) {
      id
      sort_order
      layout
      images {
        id
        image_url
        alt_text
        sort_order
      }
    }
  }
`

export const SAVE_HERO_SLIDES_MUTATION = `
  mutation SaveHeroSlides($projectId: ID!, $slides: [HeroSlideInput!]!) {
    saveHeroSlides(projectId: $projectId, slides: $slides) {
      id
      image_url
      alt_text
      sort_order
    }
  }
`

export const SAVE_PROJECT_BLOCKS_MUTATION = `
  mutation SaveProjectBlocks($projectId: ID!, $blocks: [ProjectBlockInput!]!) {
    saveProjectBlocks(projectId: $projectId, blocks: $blocks) {
      id
      block_type
      sort_order
      images {
        id
        image_url
        alt_text
        image_type
        sort_order
      }
    }
  }
`

export const UPDATE_HOMEPAGE_MUTATION = `
  mutation UpdateHomepage($input: HomepageInput!) {
    updateHomepage(input: $input) {
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

export const UPDATE_CONTACT_MUTATION = `
  mutation UpdateContact($input: ContactInput!) {
    updateContact(input: $input) {
      page {
        id
        title
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
    }
  }
`
