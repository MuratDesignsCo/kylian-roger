import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// ─── Image assets ───

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

const allImages = [...images, ...webpImages]

// ─── Photography data ───

const photoYears = [2025, 2025, 2025, 2025, 2025]
const photoDates = ['2025-12-25', '2025-01-01', '2025-01-01', '2025-01-01', '2025-01-01']
const photoLocations = [
  'Paris, France', 'Los Angeles, USA', 'Tokyo, Japan', 'London, UK', 'Berlin, Germany',
]
const photoCardLabels: (string | null)[] = [
  'Ft. Studio Harcourt', 'Ft. Post-Office', null, 'Ft. Mikros Image', null,
]

// ─── Film data ───

const filmData = [
  { title: 'PROJECT 01', subtitle: 'Brand Film — 2025', year: 2025, date: '2024-12-30', layout: 'landscape' },
  { title: 'PROJECT 02', subtitle: 'Music Video — 2025', year: 2025, date: '2025-01-01', layout: 'landscape' },
  { title: 'REEL SOCIAL 01', subtitle: 'Social Content — 2025', year: 2025, date: '2025-01-01', layout: 'vertical' },
  { title: 'PROJECT 03', subtitle: 'Documentary — 2024', year: 2024, date: '2024-01-01', layout: 'landscape' },
  { title: 'PROJECT 04', subtitle: 'Commercial — 2024', year: 2024, date: '2024-01-01', layout: 'landscape' },
  { title: 'REEL SOCIAL 02', subtitle: 'Social Content — 2024', year: 2024, date: '2024-01-01', layout: 'vertical' },
  { title: 'PROJECT 05', subtitle: 'Short Film — 2024', year: 2024, date: '2024-01-01', layout: 'landscape' },
  { title: 'PROJECT 06', subtitle: 'Motion Design — 2023', year: 2023, date: '2023-01-01', layout: 'landscape' },
  { title: 'REEL SOCIAL 03', subtitle: 'Social Content — 2023', year: 2023, date: '2023-01-01', layout: 'vertical' },
  { title: 'PROJECT 07', subtitle: 'Brand Film — 2023', year: 2023, date: '2023-01-01', layout: 'landscape' },
  { title: 'PROJECT 08', subtitle: 'Music Video — 2023', year: 2023, date: '2023-01-01', layout: 'landscape' },
  { title: 'PROJECT 09', subtitle: 'Commercial — 2022', year: 2022, date: '2022-01-01', layout: 'landscape' },
  { title: 'PROJECT 10', subtitle: 'Short Film — 2022', year: 2022, date: '2022-01-01', layout: 'landscape' },
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

// ─── Art Direction data ───

const artData = [
  { title: 'ECLIPSE URBAINE', slug: 'eclipse-urbaine', year: 2025, date: '2025-12-29', client: 'Maison Eclipse', role: 'Direction artistique, Conception visuelle', desc: 'Direction artistique complète pour une campagne de mode urbaine.', tags: ['Campagne', 'Mode'] },
  { title: 'MAISON VERNE', slug: 'maison-verne', year: 2025, date: '2025-01-01', client: 'Editions Verne & Fils', role: 'Identité visuelle, Direction artistique', desc: "Identité visuelle et direction artistique pour une maison d'édition.", tags: ['Branding', 'Edition'] },
  { title: 'SOLSTICE', slug: 'solstice', year: 2025, date: '2025-01-01', client: 'Festival Solstice', role: 'Direction artistique, Scénographie', desc: "Direction artistique d'un festival de musique électronique.", tags: ['Festival', 'Evénementiel'] },
  { title: 'NOIR MINERAL', slug: 'noir-mineral', year: 2025, date: '2025-01-01', client: 'Noir Cosmetics', role: 'Direction photo, Packaging', desc: 'Série photographique pour une marque de cosmétiques haut de gamme.', tags: ['Cosmétiques', 'Packaging'] },
  { title: 'ATELIER CERAMIQUE', slug: 'atelier-ceramique', year: 2024, date: '2024-01-01', client: 'Atelier Terre & Feu', role: 'Direction éditoriale, Photographie', desc: 'Projet éditorial pour un artisan céramiste.', tags: ['Editorial', 'Artisanat'] },
]

// ─── Helpers ───

async function insertProject(client: pg.PoolClient, data: Record<string, unknown>): Promise<string> {
  const fields = Object.keys(data)
  const placeholders = fields.map((_, i) => `$${i + 1}`)
  const values = fields.map(f => data[f])

  const { rows } = await client.query(
    `INSERT INTO projects (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING id`,
    values
  )
  return rows[0].id
}

async function insertHeroSlides(client: pg.PoolClient, projectId: string, projectIndex: number, title: string, count = 5) {
  const offset = projectIndex * count
  for (let s = 0; s < count; s++) {
    await client.query(
      'INSERT INTO project_hero_slides (project_id, image_url, alt_text, sort_order) VALUES ($1, $2, $3, $4)',
      [projectId, allImages[(offset + s) % allImages.length], title, s]
    )
  }
}

async function insertPhotoGallery(client: pg.PoolClient, projectId: string, projectIndex: number) {
  const offset = projectIndex * 7

  const rowLayouts: { layout: string; imageCount: number }[] = [
    { layout: 'full', imageCount: 1 },
    { layout: 'half', imageCount: 2 },
    { layout: 'third', imageCount: 3 },
    { layout: 'full', imageCount: 1 },
  ]

  let imgIdx = 0
  for (let r = 0; r < rowLayouts.length; r++) {
    const { rows } = await client.query(
      'INSERT INTO project_gallery_rows (project_id, sort_order, layout) VALUES ($1, $2, $3) RETURNING id',
      [projectId, r, rowLayouts[r].layout]
    )
    const rowId = rows[0].id

    for (let img = 0; img < rowLayouts[r].imageCount; img++) {
      await client.query(
        'INSERT INTO project_gallery_images (row_id, project_id, image_url, alt_text, sort_order) VALUES ($1, $2, $3, $4, $5)',
        [rowId, projectId, allImages[(offset + imgIdx) % allImages.length], '', img]
      )
      imgIdx++
    }
  }
}

async function insertArtBlocks(client: pg.PoolClient, projectId: string, projectIndex: number, artClient: string, artRole: string) {
  const offset = projectIndex * 5

  type BlockDef = {
    block_type: string
    sort_order: number
    context_label?: string
    context_heading?: string
    context_text?: string
    gallery_layout?: string
    deliverables_items?: unknown
    images?: { imgOffset: number; type: string }[]
  }

  const blockDefs: BlockDef[] = [
    // 1. KEY VISUAL
    {
      block_type: 'gallery', sort_order: 0, gallery_layout: 'full',
      images: [{ imgOffset: 0, type: 'full' }],
    },
    // 2. THE BRIEF
    {
      block_type: 'context', sort_order: 1,
      context_label: '01 \u2014 THE BRIEF',
      context_heading: `Capturer l'essence de ${artClient}`,
      context_text: `${artClient} souhaitait un projet qui traduise leur vision dans un univers visuel fort. Le brief : créer un dialogue entre la création et l'environnement, en jouant sur les contrastes et les textures. ${artRole}.`,
    },
    // 3. DIRECTION IMAGES
    {
      block_type: 'gallery', sort_order: 2, gallery_layout: 'pair',
      images: [{ imgOffset: 1, type: 'landscape' }, { imgOffset: 2, type: 'landscape' }],
    },
    // 4. THE APPROACH
    {
      block_type: 'context', sort_order: 3,
      context_label: '02 \u2014 THE APPROACH',
      context_heading: 'De la direction artistique au terrain',
      context_text: "Le travail a démarré par un repérage approfondi et une recherche de références visuelles pour définir l'univers du projet. La direction s'est construite autour de gestes simples et d'une attention particulière aux détails, pour que chaque image raconte un instant suspendu.",
    },
    // 5. PORTRAITS
    {
      block_type: 'gallery', sort_order: 4, gallery_layout: 'trio',
      images: [{ imgOffset: 3, type: 'portrait' }, { imgOffset: 4, type: 'portrait' }, { imgOffset: 5, type: 'portrait' }],
    },
    // 6. THE RESULT
    {
      block_type: 'context', sort_order: 5,
      context_label: '03 \u2014 THE RESULT',
      context_heading: 'Un projet qui vit au-delà du support',
      context_text: "Le projet a été décliné sur différents supports : print, digital et espace physique. L'univers visuel créé a permis d'assurer une cohérence forte à travers l'ensemble des déclinaisons, de l'affichage grand format au contenu pour les réseaux sociaux.",
    },
    // 7. DELIVERABLES
    {
      block_type: 'deliverables', sort_order: 6,
      deliverables_items: [
        { number: '01', name: 'Direction artistique' },
        { number: '02', name: 'Conception visuelle' },
        { number: '03', name: 'Direction de shooting' },
        { number: '04', name: 'Déclinaison print & digital' },
        { number: '05', name: 'Scénographie' },
      ],
    },
    // 8. CLOSING VISUAL
    {
      block_type: 'gallery', sort_order: 7, gallery_layout: 'pair-full',
      images: [{ imgOffset: 6, type: 'landscape' }, { imgOffset: 7, type: 'landscape' }, { imgOffset: 8, type: 'full' }],
    },
  ]

  for (const def of blockDefs) {
    const { rows } = await client.query(
      `INSERT INTO project_blocks (project_id, block_type, sort_order, context_label, context_heading, context_text, gallery_layout, deliverables_items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        projectId, def.block_type, def.sort_order,
        def.context_label || null, def.context_heading || null, def.context_text || null,
        def.gallery_layout || null,
        def.deliverables_items ? JSON.stringify(def.deliverables_items) : null,
      ]
    )
    const blockId = rows[0].id

    if (def.images) {
      for (let i = 0; i < def.images.length; i++) {
        const img = def.images[i]
        await client.query(
          'INSERT INTO project_block_images (block_id, image_url, alt_text, image_type, sort_order) VALUES ($1, $2, $3, $4, $5)',
          [blockId, allImages[(offset + 5 + img.imgOffset) % allImages.length], '', img.type, i]
        )
      }
    }
  }
}

// ─── Main ───

async function main() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Clear existing projects (cascades to gallery rows, images, slides, blocks)
    await client.query('DELETE FROM projects')
    console.log('Cleared existing projects')

    let totalProjects = 0

    // ─── Photography projects ───
    console.log('\nSeeding photography projects...')
    for (let i = 0; i < photoYears.length; i++) {
      const num = String(i + 1).padStart(2, '0')
      const projectId = await insertProject(client, {
        slug: `project-${num}`,
        category: 'photography',
        title: `PROJECT ${num}`,
        cover_image_url: images[i % images.length],
        cover_image_alt: `Project ${num}`,
        year: photoYears[i],
        project_date: photoDates[i],
        sort_order: i,
        is_published: true,
        photo_location: photoLocations[i],
        card_label: photoCardLabels[i],
        meta_title: `Project ${num} — Photographie | Kylian Roger`,
        meta_description: `Série photographique Project ${num}, réalisée à ${photoLocations[i]}. Découvrez ce projet par Kylian Roger.`,
        og_title: `Project ${num} — Kylian Roger Photography`,
        og_description: `Série photographique Project ${num} à ${photoLocations[i]} par Kylian Roger, photographe et directeur artistique.`,
        og_image_url: images[i % images.length],
      })

      await insertHeroSlides(client, projectId, i, `PROJECT ${num}`)
      await insertPhotoGallery(client, projectId, i)

      console.log(`  ✓ PROJECT ${num} (${photoLocations[i]})`)
      totalProjects++
    }

    // ─── Film/Motion projects ───
    console.log('\nSeeding film/motion projects...')
    for (let i = 0; i < filmData.length; i++) {
      const d = filmData[i]
      const num = String(i + 1).padStart(2, '0')

      await insertProject(client, {
        slug: `film-project-${num}`,
        category: 'film-motion',
        title: d.title,
        cover_image_url: webpImages[i % webpImages.length],
        cover_image_alt: '',
        year: d.year,
        project_date: d.date,
        sort_order: i,
        is_published: true,
        film_video_url: sampleVideoUrls[i % sampleVideoUrls.length],
        film_bg_image_url: webpImages[i % webpImages.length],
        film_subtitle: d.subtitle,
        film_layout: d.layout,
      })

      console.log(`  ✓ ${d.title} (${d.subtitle})`)
      totalProjects++
    }

    // ─── Art Direction projects ───
    console.log('\nSeeding art direction projects...')
    for (let i = 0; i < artData.length; i++) {
      const d = artData[i]

      const projectId = await insertProject(client, {
        slug: d.slug,
        category: 'art-direction',
        title: d.title,
        cover_image_url: images[i % images.length],
        cover_image_alt: d.title,
        year: d.year,
        project_date: d.date,
        sort_order: i,
        is_published: true,
        art_client: d.client,
        art_role: d.role,
        art_description: d.desc,
        art_tags: d.tags,
        meta_title: `${d.title} — Direction Artistique | Kylian Roger`,
        meta_description: `${d.desc} Projet pour ${d.client}. ${d.role}.`,
        og_title: `${d.title} — Kylian Roger Art Direction`,
        og_description: `Direction artistique pour ${d.client}. ${d.desc}`,
        og_image_url: images[i % images.length],
      })

      await insertHeroSlides(client, projectId, i, d.title)
      await insertArtBlocks(client, projectId, i, d.client, d.role)

      console.log(`  ✓ ${d.title} (${d.client})`)
      totalProjects++
    }

    // ─── Homepage data ───
    console.log('\nSeeding homepage data...')

    // Hero images
    await client.query('DELETE FROM hero_images')
    const heroImagesData = [
      { url: images[0], alt: 'Photographie par Kylian Roger' },
      { url: images[1], alt: 'Travail de direction artistique par Kylian Roger' },
      { url: images[2], alt: 'Portrait editorial par Kylian Roger' },
      { url: images[3], alt: 'Projet lifestyle par Kylian Roger' },
      { url: images[4], alt: 'Photographie de mode par Kylian Roger' },
    ]
    for (let i = 0; i < heroImagesData.length; i++) {
      await client.query(
        'INSERT INTO hero_images (id, image_url, alt_text, sort_order) VALUES (gen_random_uuid(), $1, $2, $3)',
        [heroImagesData[i].url, heroImagesData[i].alt, i]
      )
    }
    console.log(`  ✓ ${heroImagesData.length} hero images`)

    // Site settings (upsert)
    const aboutHtml = `Kylian works across <a href="/photography" class="about-hover-link" data-hover-img="/images/blank.jpg"><span class="gif photography">photography</span></a>, <a href="/film-motion" class="about-hover-link" data-hover-img="/images/blank.jpg"><span class="gif directing">directing</span></a>, and <a href="/art-direction" class="about-hover-link" data-hover-img="/images/blank.jpg"><span class="gif art-direction">art direction</span></a>, creating advertising work in automotive, sport, and lifestyle, with a parallel editorial practice and independent creative projects that explore identity.`
    const worksLinks = JSON.stringify([
      { label: 'STILL', href: '/photography' },
      { label: 'MOTION', href: '/film-motion' },
    ])
    await client.query(`
      INSERT INTO site_settings (id, hero_title_top, hero_title_bottom, hero_role, hero_based, about_text_html, works_section_title, works_section_subtitle, works_section_links, footer_big_name, copyright_text)
      VALUES ('global', 'KYLIAN', 'ROGER', 'MULTIDISCIPLINARY ARTIST', 'AVAILABLE WORLDWIDE', $1, E'LATEST\nWORKS', 'Explore more', $2::jsonb, 'KYLIAN ROGER', '© 2026 KYLIAN ROGER')
      ON CONFLICT (id) DO UPDATE SET
        about_text_html = EXCLUDED.about_text_html,
        works_section_title = EXCLUDED.works_section_title,
        works_section_subtitle = EXCLUDED.works_section_subtitle,
        works_section_links = EXCLUDED.works_section_links
    `, [aboutHtml, worksLinks])
    console.log('  ✓ site_settings updated')

    // Featured works (need project IDs from the projects just inserted)
    await client.query('DELETE FROM homepage_featured_works')
    const { rows: photoProjects } = await client.query(
      "SELECT id FROM projects WHERE category = 'photography' ORDER BY sort_order LIMIT 2"
    )
    const { rows: filmProjects } = await client.query(
      "SELECT id FROM projects WHERE category = 'film-motion' ORDER BY sort_order LIMIT 2"
    )
    if (photoProjects[0] && filmProjects[0]) {
      const fwData = [
        { pid: photoProjects[0].id, cat: 'still', idx: 0, sort: 0 },
        { pid: filmProjects[0].id, cat: 'motion', idx: 0, sort: 1 },
        { pid: photoProjects[1]?.id || photoProjects[0].id, cat: 'still', idx: 1, sort: 2 },
        { pid: filmProjects[1]?.id || filmProjects[0].id, cat: 'motion', idx: 1, sort: 3 },
      ]
      for (const fw of fwData) {
        await client.query(
          'INSERT INTO homepage_featured_works (id, project_id, slot_category, slot_index, sort_order) VALUES (gen_random_uuid(), $1, $2, $3, $4)',
          [fw.pid, fw.cat, fw.idx, fw.sort]
        )
      }
      console.log('  ✓ 4 featured works')
    }

    // About hover images (ensure rows exist)
    await client.query('DELETE FROM about_hover_images')
    for (const identifier of ['photography', 'directing', 'art-direction']) {
      await client.query(
        'INSERT INTO about_hover_images (id, link_identifier, image_url, alt_text) VALUES (gen_random_uuid(), $1, $2, $3)',
        [identifier, '', '']
      )
    }
    console.log('  ✓ 3 hover image slots')

    // ─── Contact page data ───
    console.log('\nSeeding contact page data...')

    // Contact page main record (upsert)
    const contactBioHtml = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`

    await client.query(`
      INSERT INTO contact_page (id, title, portrait_image_url, portrait_image_alt, bio_html, awards_title, bts_title)
      VALUES ('main', 'CONTACT', $1, 'Portrait de Kylian Roger', $2, 'AWARDS', 'BEHIND THE SCENES')
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        portrait_image_url = EXCLUDED.portrait_image_url,
        portrait_image_alt = EXCLUDED.portrait_image_alt,
        bio_html = EXCLUDED.bio_html,
        awards_title = EXCLUDED.awards_title,
        bts_title = EXCLUDED.bts_title
    `, [
      '/images/jay-soundo-E79LvH-0FlA-unsplash_1jay-soundo-E79LvH-0FlA-unsplash.webp',
      contactBioHtml,
    ])
    console.log('  ✓ contact_page')

    // Contact info blocks
    await client.query('DELETE FROM contact_info_blocks')
    const infoBlocksData = [
      { label: 'United States', email: 'kylian@rogerusa.com', phone: '+1 (212) 555-1234' },
      { label: 'France', email: 'kylian@rogerfrance.com', phone: '+33 6 12 34 56 78' },
    ]
    for (let i = 0; i < infoBlocksData.length; i++) {
      const b = infoBlocksData[i]
      await client.query(
        'INSERT INTO contact_info_blocks (label, email, phone, sort_order) VALUES ($1, $2, $3, $4)',
        [b.label, b.email, b.phone, i]
      )
    }
    console.log(`  ✓ ${infoBlocksData.length} contact info blocks`)

    // Awards
    await client.query('DELETE FROM awards')
    const awardsData = [
      { name: 'Honorable Mention', org: 'International Photo Awards', year: '2023', img: webpImages[0] },
      { name: 'Selected Artist', org: 'PhotoVogue', year: '2023', img: webpImages[8] },
      { name: 'Street Fashion Feature', org: 'British Journal of Photography', year: '2022', img: webpImages[2] },
      { name: 'Open Competition', org: 'Sony World Photography Awards', year: '2022', img: webpImages[3] },
      { name: 'Finalist – Portrait Awards', org: 'LensCulture', year: '2021', img: webpImages[4] },
    ]
    for (let i = 0; i < awardsData.length; i++) {
      const a = awardsData[i]
      await client.query(
        'INSERT INTO awards (award_name, organizer, year, hover_image_url, sort_order) VALUES ($1, $2, $3, $4, $5)',
        [a.name, a.org, a.year, a.img, i]
      )
    }
    console.log(`  ✓ ${awardsData.length} awards`)

    // Media kit buttons
    await client.query('DELETE FROM media_kit_buttons')
    await client.query(
      'INSERT INTO media_kit_buttons (label, file_url, sort_order) VALUES ($1, $2, $3)',
      ['Download Kit Média', '#', 0]
    )
    console.log('  ✓ 1 media kit button')

    // BTS images
    await client.query('DELETE FROM bts_images')
    const btsData = [
      { img: webpImages[9], alt: 'Behind the scenes' },
      { img: webpImages[6], alt: 'Behind the scenes' },
      { img: webpImages[7], alt: 'Behind the scenes' },
      { img: webpImages[1], alt: 'Behind the scenes' },
      { img: webpImages[8], alt: 'Behind the scenes' },
      { img: webpImages[3], alt: 'Behind the scenes' },
    ]
    for (let i = 0; i < btsData.length; i++) {
      await client.query(
        'INSERT INTO bts_images (image_url, alt_text, sort_order) VALUES ($1, $2, $3)',
        [btsData[i].img, btsData[i].alt, i]
      )
    }
    console.log(`  ✓ ${btsData.length} BTS images`)

    // ─── Pages SEO ───
    console.log('\nSeeding pages SEO...')

    const pagesSeoData = [
      {
        slug: 'home',
        meta_title: 'Kylian Roger — Photographe, Réalisateur & Directeur Artistique',
        meta_description: "Portfolio de Kylian Roger, artiste multidisciplinaire. Photographie, réalisation et direction artistique pour l'automobile, le sport, le lifestyle et des projets éditoriaux.",
        og_title: 'Kylian Roger — Portfolio',
        og_description: 'Photographe, réalisateur et directeur artistique. Découvrez le portfolio de Kylian Roger.',
      },
      {
        slug: 'photography',
        meta_title: 'Photographie — Kylian Roger | Portfolio',
        meta_description: 'Découvrez les projets photographiques de Kylian Roger : automobile, sport, mode, lifestyle et éditorial. Un regard unique entre lumière et mouvement.',
        og_title: 'Photographie — Kylian Roger',
        og_description: 'Projets photographiques de Kylian Roger : automobile, sport, mode, lifestyle et éditorial.',
      },
      {
        slug: 'film-motion',
        meta_title: 'Film / Motion — Kylian Roger | Portfolio',
        meta_description: 'Projets vidéo et motion design de Kylian Roger : films publicitaires, clips, contenus automobile et sport. Réalisation et direction artistique.',
        og_title: 'Film / Motion — Kylian Roger',
        og_description: 'Films publicitaires, clips et motion design par Kylian Roger.',
      },
      {
        slug: 'art-direction',
        meta_title: 'Direction Artistique — Kylian Roger | Portfolio',
        meta_description: 'Projets de direction artistique par Kylian Roger : campagnes mode, branding, identité visuelle, scénographie et éditorial.',
        og_title: 'Direction Artistique — Kylian Roger',
        og_description: 'Direction artistique par Kylian Roger : campagnes mode, branding, identité visuelle et scénographie.',
      },
      {
        slug: 'contact',
        meta_title: 'Contact — Kylian Roger | Photographe & Directeur Artistique',
        meta_description: "Contactez Kylian Roger pour vos projets photo, film ou direction artistique. Disponible en France et à l'international.",
        og_title: 'Contact — Kylian Roger',
        og_description: 'Contactez Kylian Roger pour vos projets photo, film ou direction artistique.',
      },
    ]

    for (const seo of pagesSeoData) {
      await client.query(
        `INSERT INTO pages_seo (page_slug, meta_title, meta_description, og_title, og_description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (page_slug) DO UPDATE SET
           meta_title = EXCLUDED.meta_title,
           meta_description = EXCLUDED.meta_description,
           og_title = EXCLUDED.og_title,
           og_description = EXCLUDED.og_description`,
        [seo.slug, seo.meta_title, seo.meta_description, seo.og_title, seo.og_description]
      )
    }
    console.log(`  ✓ ${pagesSeoData.length} pages SEO`)

    await client.query('COMMIT')
    console.log(`\n✅ Seed complete: ${totalProjects} projects + homepage + contact + SEO data inserted`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed, rolled back:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
