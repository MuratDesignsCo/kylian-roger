import type { Metadata } from 'next'
import { getContactData } from '@/lib/data/contact'
import { getPageSeo, seoToMetadata } from '@/lib/data/seo'
import { gqlRequest } from '@/lib/graphql/client'
import { SETTINGS_QUERY } from '@/lib/graphql/queries'
import { rewriteCmsLinks } from '@/lib/utils'
import AwardsSection from '@/components/public/contact/AwardsSection'
import BtsSection from '@/components/public/contact/BtsSection'
import type { ContactInfoBlock, Award, BtsImage, MediaKitButton, SiteSettings } from '@/lib/types'

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
  { id: 'default-us', label: 'United States', email: 'kylian@rogerusa.com', phone: '+1 (212) 555-1234', agency_name: '', agency_website: '', sort_order: 0 },
  { id: 'default-fr', label: 'France', email: 'kylian@rogerfrance.com', phone: '+33 6 12 34 56 78', agency_name: '', agency_website: '', sort_order: 1 },
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
  const [contactData, siteSettings] = await Promise.all([
    getContactData(),
    gqlRequest<{ settings: SiteSettings }>(SETTINGS_QUERY).then(d => d.settings).catch(() => null),
  ])
  const { page, infoBlocks, awards, btsImages, mediaKitButtons } = contactData

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
            <div className="bio-text-column">
              <div dangerouslySetInnerHTML={{ __html: rewriteCmsLinks(resolvedBioHtml) }} />
              {(siteSettings?.social_instagram_url || siteSettings?.social_behance_url || siteSettings?.social_linkedin_url) && (
                <div className="bio-socials">
                  {siteSettings.social_instagram_url && (
                    <a href={siteSettings.social_instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                  )}
                  {siteSettings.social_behance_url && (
                    <a href={siteSettings.social_behance_url} target="_blank" rel="noopener noreferrer" aria-label="Behance">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"></path></svg>
                    </a>
                  )}
                  {siteSettings.social_linkedin_url && (
                    <a href={siteSettings.social_linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
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
                  {block.agency_name && (
                    block.agency_website ? (
                      <a href={block.agency_website} target="_blank" rel="noopener noreferrer" className="contact-info_link">
                        {block.agency_name}
                      </a>
                    ) : (
                      <span className="contact-info_link">{block.agency_name}</span>
                    )
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
