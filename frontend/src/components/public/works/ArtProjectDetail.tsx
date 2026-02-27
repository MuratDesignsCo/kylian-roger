'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenisContext } from '@/components/public/LenisProvider'
import Lightbox from '@/components/public/Lightbox'
import type { Project, ProjectHeroSlide, ProjectBlock } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface ArtProjectDetailProps {
  project: Project
  slides: ProjectHeroSlide[]
  blocks: ProjectBlock[]
}

export default function ArtProjectDetail({
  project,
  slides,
  blocks,
}: ArtProjectDetailProps) {
  const lenis = useLenisContext()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Collect all gallery images from blocks for lightbox
  const allGalleryImages = blocks
    .filter((b) => b.block_type === 'gallery')
    .flatMap((b) =>
      (b.project_block_images ?? []).map((img) => ({
        src: img.image_url,
        alt: img.alt_text || project.title,
      }))
    )

  const handleScrollToGallery = useCallback(() => {
    const gallery = document.getElementById('gallery')
    if (!gallery) return
    if (lenis) {
      lenis.scrollTo(gallery, { duration: 1.2 })
    } else {
      gallery.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lenis])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const slideshow = section.querySelector('.project-hero_slideshow')
      const slideEls = section.querySelectorAll<HTMLElement>('.project-hero_slide')

      if (slideshow && slideEls.length) {
        const tl = gsap.timeline({ delay: 0.3 })

        tl.set(slideshow, { visibility: 'visible', scale: 0.9 })
        tl.set(slideEls, { visibility: 'hidden', opacity: 0 })

        slideEls.forEach((slide, i) => {
          if (i > 0) tl.set(slideEls[i - 1], { visibility: 'hidden', opacity: 0 })
          tl.set(slide, { visibility: 'visible', opacity: 1, scale: 1.05 })
          tl.to(slide, { scale: 1, duration: 0.15, ease: 'none' })
        })

        tl.to(slideshow, { scale: 1, duration: 1.2, ease: 'power2.out' }, '-=0.5')

        tl.fromTo(
          section.querySelector('.project-hero_title-back'),
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power3.out' },
          '-=0.8'
        )
        tl.fromTo(
          section.querySelector('.project-hero_title-front'),
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power3.out' },
          '<'
        )

        const infoItems = section.querySelectorAll(
          '.project-hero_info-left, .project-hero_info-center, .project-hero_info-right'
        )
        tl.fromTo(
          infoItems,
          { y: 20 },
          { y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
          '-=0.5'
        )
      }

      section.querySelectorAll<HTMLElement>('.project-gallery_item').forEach((item) => {
        gsap.fromTo(
          item,
          { y: 60 },
          {
            y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' },
          }
        )
      })

      section.querySelectorAll<HTMLElement>('.project-context_block').forEach((block) => {
        const label = block.querySelector('.project-context_label')
        const heading = block.querySelector('.project-context_heading')
        const text = block.querySelector('.project-context_text')

        const ctxTl = gsap.timeline({
          scrollTrigger: { trigger: block, start: 'top 85%', toggleActions: 'play none none none' },
        })

        if (label) ctxTl.fromTo(label, { y: 30 }, { y: 0, duration: 0.6, ease: 'power3.out' })
        if (heading) ctxTl.fromTo(heading, { y: 40 }, { y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
        if (text) ctxTl.fromTo(text, { y: 30 }, { y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      })

      const deliverablesGrid = section.querySelector('.project-deliverables_grid')
      if (deliverablesGrid) {
        const items = deliverablesGrid.querySelectorAll('.project-deliverables_item')
        gsap.fromTo(
          items,
          { y: 30 },
          {
            y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: deliverablesGrid, start: 'top 85%', toggleActions: 'play none none none' },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [slides])

  const getGalleryFlatIndex = (blockIdx: number, imgIdx: number) => {
    const galleryBlocks = blocks.filter((b) => b.block_type === 'gallery')
    let idx = 0
    for (let b = 0; b < blockIdx; b++) {
      idx += (galleryBlocks[b].project_block_images ?? []).length
    }
    return idx + imgIdx
  }

  // Build tags string for hero info
  const tagsString = project.art_tags?.join(' \u00B7 ') || ''

  let galleryBlockIdx = 0

  return (
    <div ref={sectionRef}>
      {/* Breadcrumb */}
      <nav className="project-breadcrumb" aria-label="Fil d'Ariane">
        <div className="padding-global">
          <div className="project-breadcrumb_wrapper">
            <Link href="/art-direction" className="project-breadcrumb_link">ART DIRECTION</Link>
            <span className="project-breadcrumb_separator">/</span>
            <span className="project-breadcrumb_current">{project.title}</span>
          </div>
        </div>
      </nav>

      <main className="main-wrapper">
        {/* Hero Section */}
        {slides.length > 0 && (
          <section className="section_project-hero">
            <div className="project-hero_wrapper" style={{ '--title-len': project.title.length } as React.CSSProperties}>
              <div className="project-hero_title-back" aria-hidden="true">
                <span className="project-hero_title-text">{project.title}</span>
              </div>

              <div className="project-hero_slideshow">
                {slides.map((slide, i) => (
                  <img
                    key={slide.id}
                    src={slide.image_url}
                    alt={slide.alt_text || project.title}
                    className={`project-hero_slide is-slide-${i + 1}`}
                    loading="eager"
                  />
                ))}
              </div>

              <div className="project-hero_title-front">
                <h1 className="project-hero_title-text">{project.title}</h1>
              </div>

              <div className="project-hero_info">
                <div className="padding-global">
                  <div className="project-hero_info-grid">
                    <div className="project-hero_info-left">
                      <div className="overflow-hidden">
                        <div className="project-hero_info-label text-color-secondary">ART DIRECTION</div>
                      </div>
                      <div className="overflow-hidden">
                        <div className="project-hero_info-value">{tagsString || project.art_role || ''}</div>
                      </div>
                    </div>
                    <div className="project-hero_info-center">
                      <button
                        type="button"
                        className="project-hero_scroll-btn"
                        aria-label="Scroll to explore"
                        onClick={handleScrollToGallery}
                      >
                        <div className="overflow-hidden">
                          <div className="project-hero_scroll-text text-color-secondary">SCROLL</div>
                        </div>
                        <div className="overflow-hidden">
                          <div className="project-hero_scroll-text text-color-secondary">TO EXPLORE</div>
                        </div>
                      </button>
                    </div>
                    <div className="project-hero_info-right">
                      <div className="overflow-hidden">
                        <div className="project-hero_info-label text-color-secondary">YEAR</div>
                      </div>
                      <div className="overflow-hidden">
                        <div className="project-hero_info-value">{project.year}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Project Details — Meta + Description */}
        <section id="gallery" className="section_project-details">
          <div className="padding-global">
            <div className="spacer-xxhuge"></div>
            <div className="project-details_grid">
              <div className="project-details_meta">
                {project.art_client && (
                  <div className="project-details_meta-item">
                    <span className="project-details_meta-label text-color-secondary">CLIENT</span>
                    <span className="project-details_meta-value">{project.art_client}</span>
                  </div>
                )}
                {project.art_role && (
                  <div className="project-details_meta-item">
                    <span className="project-details_meta-label text-color-secondary">RÔLE</span>
                    <span className="project-details_meta-value">{project.art_role}</span>
                  </div>
                )}
                <div className="project-details_meta-item">
                  <span className="project-details_meta-label text-color-secondary">ANNÉE</span>
                  <span className="project-details_meta-value">{project.year}</span>
                </div>
                {project.card_label && (
                  <div className="project-details_meta-item">
                    <span className="project-details_meta-label text-color-secondary">FEATURING</span>
                    <span className="project-details_meta-value">{project.card_label}</span>
                  </div>
                )}
                {project.art_tags && project.art_tags.length > 0 && (
                  <div className="project-details_meta-item">
                    <span className="project-details_meta-label text-color-secondary">CATÉGORIE</span>
                    <div className="project-details_tags">
                      {project.art_tags.map((tag) => (
                        <span key={tag} className="project-details_tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {project.art_description && (
                <div className="project-details_description">
                  <p className="text-size-medium">{project.art_description}</p>
                </div>
              )}
            </div>
            <div className="spacer-xxhuge"></div>
          </div>
        </section>

        {/* Content Blocks */}
        {blocks.map((block) => {
          if (block.block_type === 'gallery') {
            const blockGalleryIdx = galleryBlockIdx
            galleryBlockIdx++
            const images = block.project_block_images ?? []
            return (
              <section key={block.id} className="section_project-gallery">
                <div className="padding-global">
                  <div className="project-gallery_grid">
                    {images.map((img, imgIdx) => (
                      <div
                        key={img.id}
                        className={`project-gallery_item is-${img.image_type || 'landscape'}`}
                        onClick={() => setLightboxIndex(getGalleryFlatIndex(blockGalleryIdx, imgIdx))}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="project-gallery_image-wrapper">
                          <img
                            src={img.image_url}
                            alt={img.alt_text || project.title}
                            className="project-gallery_image"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          }

          if (block.block_type === 'context') {
            return (
              <section key={block.id} className="section_project-context">
                <div className="padding-global">
                  <div className="spacer-xxhuge"></div>
                  <div className="project-context_block">
                    {block.context_label && (
                      <div className="project-context_label">
                        <span className="text-color-secondary">{block.context_label}</span>
                      </div>
                    )}
                    <div className="project-context_content">
                      {block.context_heading && (
                        <h2 className="project-context_heading">{block.context_heading}</h2>
                      )}
                      {block.context_text && (
                        <p className="project-context_text">{block.context_text}</p>
                      )}
                    </div>
                  </div>
                  <div className="spacer-xxhuge"></div>
                </div>
              </section>
            )
          }

          if (block.block_type === 'deliverables' && block.deliverables_items) {
            return (
              <section key={block.id} className="section_project-deliverables">
                <div className="padding-global">
                  <div className="project-deliverables_grid">
                    {block.deliverables_items.map((item, i) => (
                      <div key={i} className="project-deliverables_item">
                        <span className="project-deliverables_number text-color-secondary">{item.number}</span>
                        <span className="project-deliverables_name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="spacer-xxhuge"></div>
                </div>
              </section>
            )
          }

          return null
        })}

        {/* Back button */}
        <section className="section_project-gallery">
          <div className="padding-global">
            <div className="spacer-xxhuge"></div>
            <div className="project-gallery_back">
              <Link href="/art-direction" className="button is-primary inline-block">
                <div className="button_text-wrapper">
                  <div className="button_text">ALL WORK</div>
                  <div className="button_text is-absolute">ALL WORK</div>
                </div>
              </Link>
            </div>
            <div className="spacer-xxhuge"></div>
          </div>
        </section>
      </main>

      <Lightbox
        images={allGalleryImages}
        openIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </div>
  )
}
