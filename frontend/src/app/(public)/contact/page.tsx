import type { Metadata } from 'next'
import { getContactData } from '@/lib/data/contact'
import { getPageSeo, seoToMetadata } from '@/lib/data/seo'
import { rewriteCmsLinks } from '@/lib/utils'
import AwardsSection from '@/components/public/contact/AwardsSection'
import BtsSection from '@/components/public/contact/BtsSection'
import type { ContactInfoBlock, Award, BtsImage, MediaKitButton } from '@/lib/types'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('contact')
  if (seo) return seoToMetadata(seo, 'Contact — Kylian Roger')
  return {
    title: 'Contact — Kylian Roger',
    description: 'Contactez Kylian Roger pour vos projets photo, film ou direction artistique. Disponible en France et à l\'international.',
  }
}

// Fallback data from original static HTML
const defaultBioHtml = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`

const defaultInfoBlocks: ContactInfoBlock[] = [
  { id: 'default-us', label: 'United States', email: 'kylian@rogerusa.com', phone: '+1 (212) 555-1234', sort_order: 0 },
  { id: 'default-fr', label: 'France', email: 'kylian@rogerfrance.com', phone: '+33 6 12 34 56 78', sort_order: 1 },
]

const defaultAwards: Award[] = [
  { id: 'default-a1', award_name: 'Honorable Mention', organizer: 'International Photo Awards', year: '2023', hover_image_url: '/images/jay-soundo-2HuJsD1LM9Y-unsplash_1jay-soundo-2HuJsD1LM9Y-unsplash.webp', sort_order: 0 },
  { id: 'default-a2', award_name: 'Selected Artist', organizer: 'PhotoVogue', year: '2023', hover_image_url: '/images/roman-petrov-zDIbidilZEs-unsplash_1roman-petrov-zDIbidilZEs-unsplash.webp', sort_order: 1 },
  { id: 'default-a3', award_name: 'Street Fashion Feature', organizer: 'British Journal of Photography', year: '2022', hover_image_url: '/images/jay-soundo-n-C6IyhU-9A-unsplash_1jay-soundo-n-C6IyhU-9A-unsplash.webp', sort_order: 2 },
  { id: 'default-a4', award_name: 'Open Competition', organizer: 'Sony World Photography Awards', year: '2022', hover_image_url: '/images/visualsofdana-tmmMi8FgdR0-unsplash_1visualsofdana-tmmMi8FgdR0-unsplash.webp', sort_order: 3 },
  { id: 'default-a5', award_name: 'Finalist – Portrait Awards', organizer: 'LensCulture', year: '2021', hover_image_url: '/images/jay-soundo-T2sBYIswIhE-unsplash_1jay-soundo-T2sBYIswIhE-unsplash.webp', sort_order: 4 },
]

const defaultMediaKitButtons: MediaKitButton[] = [
  { id: 'default-mk1', label: 'Download Kit Média', file_url: '#', sort_order: 0 },
]

const defaultBtsImages: BtsImage[] = [
  { id: 'default-b1', image_url: '/images/jay-soundo-1ZQMIUYTp3c-unsplash_1jay-soundo-1ZQMIUYTp3c-unsplash.webp', alt_text: 'Behind the scenes', sort_order: 0 },
  { id: 'default-b2', image_url: '/images/jay-soundo-Fuc6RrdNk2c-unsplash_1jay-soundo-Fuc6RrdNk2c-unsplash.webp', alt_text: 'Behind the scenes', sort_order: 1 },
  { id: 'default-b3', image_url: '/images/jay-soundo-oUQ0A0wzN7c-unsplash_1jay-soundo-oUQ0A0wzN7c-unsplash.webp', alt_text: 'Behind the scenes', sort_order: 2 },
  { id: 'default-b4', image_url: '/images/jay-soundo-xl1Sa0qgAew-unsplash_1jay-soundo-xl1Sa0qgAew-unsplash.webp', alt_text: 'Behind the scenes', sort_order: 3 },
  { id: 'default-b5', image_url: '/images/roman-petrov-zDIbidilZEs-unsplash_1roman-petrov-zDIbidilZEs-unsplash.webp', alt_text: 'Behind the scenes', sort_order: 4 },
  { id: 'default-b6', image_url: '/images/visualsofdana-tmmMi8FgdR0-unsplash_1visualsofdana-tmmMi8FgdR0-unsplash.webp', alt_text: 'Behind the scenes', sort_order: 5 },
]

export default async function ContactPage() {
  const { page, infoBlocks, awards, btsImages, mediaKitButtons } = await getContactData()

  const resolvedBioHtml = page?.bio_html || defaultBioHtml
  const resolvedInfoBlocks = infoBlocks.length > 0 ? infoBlocks : defaultInfoBlocks
  const resolvedAwards = awards.length > 0 ? awards : defaultAwards
  const resolvedBtsImages = btsImages.length > 0 ? btsImages : defaultBtsImages
  const resolvedMediaKitButtons = mediaKitButtons.length > 0 ? mediaKitButtons : defaultMediaKitButtons

  return (
    <>
      <section className="section_works_list">
        <div className="padding-global">
          <div className="works_list-heading">
            <div className="works_list-headline">
              <h1 className="text-align-center">{page?.title || 'CONTACT'}</h1>
            </div>
          </div>
          <div className="spacer-large"></div>
          <div className="spacer-xxhuge"></div>
          <div className="div-block">
            <img
              src={page?.portrait_image_url || '/images/jay-soundo-E79LvH-0FlA-unsplash_1jay-soundo-E79LvH-0FlA-unsplash.webp'}
              loading="lazy"
              alt={page?.portrait_image_alt || 'Portrait de Kylian Roger'}
              className="pp"
            />
            <div
              className="bio-text-column"
              dangerouslySetInnerHTML={{ __html: rewriteCmsLinks(resolvedBioHtml) }}
            />
          </div>
        </div>
      </section>

      <section className="section_contact-info">
        <div className="padding-global">
          <div className="spacer-xxhuge"></div>
          <div className="contact-info_wrapper">
            {resolvedInfoBlocks.map((block) => (
              <div key={block.id} className="contact-info_column">
                <h2 className="contact-info_label">{block.label}</h2>
                <div className="contact-info_details">
                  {block.email && (
                    <a href={`mailto:${block.email}`} className="contact-info_link">
                      {block.email}
                    </a>
                  )}
                  {block.phone && (
                    <a href={`tel:${block.phone.replace(/\s/g, '')}`} className="contact-info_link">
                      {block.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="spacer-large"></div>
        </div>
      </section>

      <section className="section_media-kit">
        <div className="padding-global">
          <div className="media-kit_wrapper">
            {resolvedMediaKitButtons.map((btn) => (
              <a
                key={btn.id}
                href={btn.file_url || '#'}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="media-kit_button"
              >
                <span className="media-kit_button-label">{btn.label}</span>
                <svg
                  className="media-kit_button-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>

      <AwardsSection title={page?.awards_title || 'AWARDS'} awards={resolvedAwards} />

      <BtsSection title={page?.bts_title || 'BEHIND THE SCENES'} images={resolvedBtsImages} />
    </>
  )
}
