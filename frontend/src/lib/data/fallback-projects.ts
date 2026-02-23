import type { Project, ProjectGalleryRow, ProjectGalleryImage, ProjectHeroSlide, ProjectBlock, ProjectBlockImage } from '@/lib/types'

const images = [
  '/images/imgi_4_68c00695995951e6d8cc0eb7_jay-soundo-2HuJsD1LM9Y-unsplash.jpeg',
  '/images/imgi_5_68c006976e4838c42b8e8dbc_jay-soundo-xl1Sa0qgAew-unsplash.jpeg',
  '/images/imgi_12_68c0111cf662d28b41daeb7a_jay-soundo-n-C6IyhU-9A-unsplash.jpeg',
  '/images/imgi_13_68c006ddcdf5732cb5d6f4bd_visualsofdana-tmmMi8FgdR0-unsplash.jpeg',
  '/images/imgi_14_68c0086f0c4e4446cd89a881_jay-soundo-T2sBYIswIhE-unsplash.jpeg',
]

const webpImages = [
  '/images/jay-soundo-2HuJsD1LM9Y-unsplash_1jay-soundo-2HuJsD1LM9Y-unsplash.webp',
  '/images/jay-soundo-xl1Sa0qgAew-unsplash_1jay-soundo-xl1Sa0qgAew-unsplash.webp',
  '/images/jay-soundo-n-C6IyhU-9A-unsplash_1jay-soundo-n-C6IyhU-9A-unsplash.webp',
  '/images/visualsofdana-tmmMi8FgdR0-unsplash_1visualsofdana-tmmMi8FgdR0-unsplash.webp',
  '/images/jay-soundo-T2sBYIswIhE-unsplash_1jay-soundo-T2sBYIswIhE-unsplash.webp',
  '/images/jay-soundo-E79LvH-0FlA-unsplash_1jay-soundo-E79LvH-0FlA-unsplash.webp',
  '/images/jay-soundo-Fuc6RrdNk2c-unsplash_1jay-soundo-Fuc6RrdNk2c-unsplash.webp',
  '/images/jay-soundo-oUQ0A0wzN7c-unsplash_1jay-soundo-oUQ0A0wzN7c-unsplash.webp',
  '/images/roman-petrov-zDIbidilZEs-unsplash_1roman-petrov-zDIbidilZEs-unsplash.webp',
  '/images/jay-soundo-1ZQMIUYTp3c-unsplash_1jay-soundo-1ZQMIUYTp3c-unsplash.webp',
]

const base: Omit<Project, 'id' | 'slug' | 'category' | 'title' | 'cover_image_url' | 'cover_image_alt' | 'year' | 'sort_order'> = {
  is_published: true,
  project_date: null,
  created_at: '',
  updated_at: '',
  photo_subcategory: null,
  photo_location: null,
  film_video_url: null,
  film_bg_image_url: null,
  film_subtitle: null,
  film_layout: null,
  art_client: null,
  art_role: null,
  art_description: null,
  art_tags: null,
  art_hero_label: null,
  card_label: null,
  meta_title: '',
  meta_description: '',
  og_title: '',
  og_description: '',
  og_image_url: '',
}

// ─── Photography (5 projects) ───
const photoYears = [2025, 2025, 2025, 2025, 2025]
const photoLocations = [
  'Paris, France', 'Los Angeles, USA', 'Tokyo, Japan', 'London, UK', 'Berlin, Germany',
]

const photoCardLabels = [
  'Ft. Studio Harcourt', 'Ft. Post-Office', null, 'Ft. Mikros Image', null,
]

export const fallbackPhotoProjects: Project[] = photoYears.map((year, i) => ({
  ...base,
  id: `photo-${String(i + 1).padStart(2, '0')}`,
  slug: `project-${String(i + 1).padStart(2, '0')}`,
  category: 'photography' as const,
  title: `PROJECT ${String(i + 1).padStart(2, '0')}`,
  cover_image_url: images[i % images.length],
  cover_image_alt: `Project ${String(i + 1).padStart(2, '0')}`,
  year,
  sort_order: i,
  photo_location: photoLocations[i],
  card_label: photoCardLabels[i] ?? null,
}))

// ─── Film / Motion (projects with landscape + vertical layout mix) ───
const filmData: { title: string; subtitle: string; year: number; layout: 'landscape' | 'vertical' }[] = [
  { title: 'PROJECT 01', subtitle: 'Brand Film — 2025', year: 2025, layout: 'landscape' },
  { title: 'PROJECT 02', subtitle: 'Music Video — 2025', year: 2025, layout: 'landscape' },
  { title: 'REEL SOCIAL 01', subtitle: 'Social Content — 2025', year: 2025, layout: 'vertical' },
  { title: 'PROJECT 03', subtitle: 'Documentary — 2024', year: 2024, layout: 'landscape' },
  { title: 'PROJECT 04', subtitle: 'Commercial — 2024', year: 2024, layout: 'landscape' },
  { title: 'REEL SOCIAL 02', subtitle: 'Social Content — 2024', year: 2024, layout: 'vertical' },
  { title: 'PROJECT 05', subtitle: 'Short Film — 2024', year: 2024, layout: 'landscape' },
  { title: 'PROJECT 06', subtitle: 'Motion Design — 2023', year: 2023, layout: 'landscape' },
  { title: 'REEL SOCIAL 03', subtitle: 'Social Content — 2023', year: 2023, layout: 'vertical' },
  { title: 'PROJECT 07', subtitle: 'Brand Film — 2023', year: 2023, layout: 'landscape' },
  { title: 'PROJECT 08', subtitle: 'Music Video — 2023', year: 2023, layout: 'landscape' },
  { title: 'PROJECT 09', subtitle: 'Commercial — 2022', year: 2022, layout: 'landscape' },
  { title: 'PROJECT 10', subtitle: 'Short Film — 2022', year: 2022, layout: 'landscape' },
]

const sampleVideoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
]

export const fallbackFilmProjects: Project[] = filmData.map((d, i) => ({
  ...base,
  id: `film-${String(i + 1).padStart(2, '0')}`,
  slug: `film-project-${String(i + 1).padStart(2, '0')}`,
  category: 'film-motion' as const,
  title: d.title,
  cover_image_url: webpImages[i % webpImages.length],
  cover_image_alt: '',
  year: d.year,
  sort_order: i,
  film_video_url: sampleVideoUrls[i % sampleVideoUrls.length],
  film_bg_image_url: webpImages[i % webpImages.length],
  film_subtitle: d.subtitle,
  film_layout: d.layout,
}))

// ─── Art Direction (5 projects) ───
const artData = [
  { title: 'ECLIPSE URBAINE', slug: 'eclipse-urbaine', year: 2025, client: 'Maison Eclipse', role: 'Direction artistique, Conception visuelle', desc: 'Direction artistique complète pour une campagne de mode urbaine.', tags: ['Campagne', 'Mode'] },
  { title: 'MAISON VERNE', slug: 'maison-verne', year: 2025, client: 'Editions Verne & Fils', role: 'Identité visuelle, Direction artistique', desc: "Identité visuelle et direction artistique pour une maison d'édition.", tags: ['Branding', 'Edition'] },
  { title: 'SOLSTICE', slug: 'solstice', year: 2025, client: 'Festival Solstice', role: 'Direction artistique, Scénographie', desc: "Direction artistique d'un festival de musique électronique.", tags: ['Festival', 'Evénementiel'] },
  { title: 'NOIR MINERAL', slug: 'noir-mineral', year: 2025, client: 'Noir Cosmetics', role: 'Direction photo, Packaging', desc: 'Série photographique pour une marque de cosmétiques haut de gamme.', tags: ['Cosmétiques', 'Packaging'] },
  { title: 'ATELIER CERAMIQUE', slug: 'atelier-ceramique', year: 2024, client: 'Atelier Terre & Feu', role: 'Direction éditoriale, Photographie', desc: 'Projet éditorial pour un artisan céramiste.', tags: ['Editorial', 'Artisanat'] },
]

export const fallbackArtProjects: Project[] = artData.map((d, i) => ({
  ...base,
  id: `art-${String(i + 1).padStart(2, '0')}`,
  slug: d.slug,
  category: 'art-direction' as const,
  title: d.title,
  cover_image_url: images[i % images.length],
  cover_image_alt: d.title,
  year: d.year,
  sort_order: i,
  art_client: d.client,
  art_role: d.role,
  art_description: d.desc,
  art_tags: d.tags,
}))

// ─── Fallback lookup ───

const allFallbackProjects = [
  ...fallbackPhotoProjects,
  ...fallbackFilmProjects,
  ...fallbackArtProjects,
]

export function getFallbackProjectBySlug(slug: string): Project | null {
  return allFallbackProjects.find((p) => p.slug === slug) ?? null
}

// ─── Fallback hero slides for any project ───

const allImages = [...images, ...webpImages]

export function getFallbackHeroSlides(projectId: string): ProjectHeroSlide[] {
  const allProjects = [...fallbackPhotoProjects, ...fallbackArtProjects]
  const idx = allProjects.findIndex((p) => p.id === projectId)
  if (idx === -1) return []

  const project = allProjects[idx]
  const offset = idx * 5

  return [0, 1, 2, 3, 4].map((s) => ({
    id: `${projectId}-slide-${s}`,
    project_id: projectId,
    image_url: allImages[(offset + s) % allImages.length],
    alt_text: project.title,
    sort_order: s,
  }))
}

// ─── Fallback gallery for photography projects ───

export function getFallbackPhotoGallery(projectId: string): ProjectGalleryRow[] {
  const idx = fallbackPhotoProjects.findIndex((p) => p.id === projectId)
  if (idx === -1) return []

  const offset = idx * 7
  const makeImg = (rowId: string, imgIdx: number, sortOrder: number): ProjectGalleryImage => ({
    id: `${rowId}-img-${sortOrder}`,
    row_id: rowId,
    project_id: projectId,
    image_url: allImages[(offset + imgIdx) % allImages.length],
    alt_text: '',
    sort_order: sortOrder,
  })

  const rows: ProjectGalleryRow[] = [
    {
      id: `${projectId}-row-1`,
      project_id: projectId,
      sort_order: 0,
      layout: 'full',
      project_gallery_images: [makeImg(`${projectId}-row-1`, 0, 0)],
    },
    {
      id: `${projectId}-row-2`,
      project_id: projectId,
      sort_order: 1,
      layout: 'half',
      project_gallery_images: [
        makeImg(`${projectId}-row-2`, 1, 0),
        makeImg(`${projectId}-row-2`, 2, 1),
      ],
    },
    {
      id: `${projectId}-row-3`,
      project_id: projectId,
      sort_order: 2,
      layout: 'third',
      project_gallery_images: [
        makeImg(`${projectId}-row-3`, 3, 0),
        makeImg(`${projectId}-row-3`, 4, 1),
        makeImg(`${projectId}-row-3`, 5, 2),
      ],
    },
    {
      id: `${projectId}-row-4`,
      project_id: projectId,
      sort_order: 3,
      layout: 'full',
      project_gallery_images: [makeImg(`${projectId}-row-4`, 6, 0)],
    },
  ]

  return rows
}

// ─── Fallback details for art direction projects ───

export function getFallbackArtDetails(projectId: string): {
  slides: ProjectHeroSlide[]
  blocks: ProjectBlock[]
} {
  const idx = fallbackArtProjects.findIndex((p) => p.id === projectId)
  if (idx === -1) return { slides: [], blocks: [] }

  const project = fallbackArtProjects[idx]
  const offset = idx * 5

  // 5 hero slides
  const slides: ProjectHeroSlide[] = [0, 1, 2, 3, 4].map((s) => ({
    id: `${projectId}-slide-${s}`,
    project_id: projectId,
    image_url: allImages[(offset + s) % allImages.length],
    alt_text: project.title,
    sort_order: s,
  }))

  const img = (blockId: string, imgIdx: number, sortOrder: number, type: 'landscape' | 'portrait' | 'full'): ProjectBlockImage => ({
    id: `${projectId}-${blockId}-img-${sortOrder}`,
    block_id: `${projectId}-${blockId}`,
    image_url: allImages[(offset + 5 + imgIdx) % allImages.length],
    alt_text: project.title,
    image_type: type,
    sort_order: sortOrder,
  })

  const blockBase = {
    project_id: projectId,
    context_label: null,
    context_heading: null,
    context_text: null,
    gallery_layout: null,
    deliverables_items: null,
  }

  const blocks: ProjectBlock[] = [
    // 1. KEY VISUAL — Full-width hero image
    {
      ...blockBase,
      id: `${projectId}-block-g1`,
      block_type: 'gallery',
      sort_order: 0,
      gallery_layout: 'full',
      project_block_images: [img('block-g1', 0, 0, 'full')],
    },
    // 2. THE BRIEF — Context block
    {
      ...blockBase,
      id: `${projectId}-block-c1`,
      block_type: 'context',
      sort_order: 1,
      context_label: '01 \u2014 THE BRIEF',
      context_heading: `Capturer l'essence de ${project.art_client || 'la marque'}`,
      context_text: `${project.art_client || 'Le client'} souhaitait un projet qui traduise leur vision dans un univers visuel fort. Le brief : créer un dialogue entre la création et l'environnement, en jouant sur les contrastes et les textures. ${project.art_role || 'Direction artistique'}.`,
    },
    // 3. DIRECTION IMAGES — Pair landscape
    {
      ...blockBase,
      id: `${projectId}-block-g2`,
      block_type: 'gallery',
      sort_order: 2,
      gallery_layout: 'pair',
      project_block_images: [
        img('block-g2', 1, 0, 'landscape'),
        img('block-g2', 2, 1, 'landscape'),
      ],
    },
    // 4. THE APPROACH — Context block
    {
      ...blockBase,
      id: `${projectId}-block-c2`,
      block_type: 'context',
      sort_order: 3,
      context_label: '02 \u2014 THE APPROACH',
      context_heading: 'De la direction artistique au terrain',
      context_text: `Le travail a démarré par un repérage approfondi et une recherche de références visuelles pour définir l'univers du projet. La direction s'est construite autour de gestes simples et d'une attention particulière aux détails, pour que chaque image raconte un instant suspendu.`,
    },
    // 5. PORTRAITS — Trio portrait
    {
      ...blockBase,
      id: `${projectId}-block-g3`,
      block_type: 'gallery',
      sort_order: 4,
      gallery_layout: 'trio',
      project_block_images: [
        img('block-g3', 3, 0, 'portrait'),
        img('block-g3', 4, 1, 'portrait'),
        img('block-g3', 5, 2, 'portrait'),
      ],
    },
    // 6. THE RESULT — Context block
    {
      ...blockBase,
      id: `${projectId}-block-c3`,
      block_type: 'context',
      sort_order: 5,
      context_label: '03 \u2014 THE RESULT',
      context_heading: 'Un projet qui vit au-delà du support',
      context_text: `Le projet a été décliné sur différents supports : print, digital et espace physique. L'univers visuel créé a permis d'assurer une cohérence forte à travers l'ensemble des déclinaisons, de l'affichage grand format au contenu pour les réseaux sociaux.`,
    },
    // 7. DELIVERABLES — Timeline
    {
      ...blockBase,
      id: `${projectId}-block-deliverables`,
      block_type: 'deliverables',
      sort_order: 6,
      deliverables_items: [
        { number: '01', name: 'Direction artistique' },
        { number: '02', name: 'Conception visuelle' },
        { number: '03', name: 'Direction de shooting' },
        { number: '04', name: 'Déclinaison print & digital' },
        { number: '05', name: 'Scénographie' },
      ],
    },
    // 8. CLOSING VISUAL — Pair + full
    {
      ...blockBase,
      id: `${projectId}-block-g4`,
      block_type: 'gallery',
      sort_order: 7,
      gallery_layout: 'pair-full',
      project_block_images: [
        img('block-g4', 6, 0, 'landscape'),
        img('block-g4', 7, 1, 'landscape'),
        img('block-g4', 8, 2, 'full'),
      ],
    },
  ]

  return { slides, blocks }
}
