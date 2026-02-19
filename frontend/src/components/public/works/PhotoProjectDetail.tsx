'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenisContext } from '@/components/public/LenisProvider'
import Lightbox from '@/components/public/Lightbox'
import type { Project, ProjectGalleryRow, ProjectHeroSlide } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface PhotoProjectDetailProps {
  project: Project
  galleryRows: ProjectGalleryRow[]
  heroSlides: ProjectHeroSlide[]
}

// Map row layout to CSS item class
function layoutToClass(layout: string): string {
  switch (layout) {
    case 'full': return 'is-full'
    case 'half': return 'is-landscape'
    case 'third': return 'is-portrait'
    case 'quarter': return 'is-portrait'
    default: return 'is-landscape'
  }
}

export default function PhotoProjectDetail({
  project,
  galleryRows,
  heroSlides,
}: PhotoProjectDetailProps) {
  const lenis = useLenisContext()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Flatten all gallery images for lightbox
  const allImages = galleryRows.flatMap(
    (row) =>
      (row.project_gallery_images ?? []).map((img) => ({
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
      // --- Hero slideshow animation ---
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

      // --- Gallery items reveal on scroll ---
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
    }, sectionRef)

    return () => ctx.revert()
  }, [heroSlides])

  // Compute a flat index from row/image indices for lightbox
  const getFlatIndex = (rowIdx: number, imgIdx: number) => {
    let idx = 0
    for (let r = 0; r < rowIdx; r++) {
      idx += (galleryRows[r].project_gallery_images ?? []).length
    }
    return idx + imgIdx
  }

  return (
    <div ref={sectionRef}>
      {/* Breadcrumb */}
      <nav className="project-breadcrumb" aria-label="Fil d'Ariane">
        <div className="padding-global">
          <div className="project-breadcrumb_wrapper">
            <Link href="/photography" className="project-breadcrumb_link">PHOTOGRAPHY</Link>
            <span className="project-breadcrumb_separator">/</span>
            <span className="project-breadcrumb_current">{project.title}</span>
          </div>
        </div>
      </nav>

      <main className="main-wrapper">
        {/* Hero Section — Slideshow */}
        <section className="section_project-hero">
          <div className="project-hero_wrapper">
            <div className="project-hero_title-back" aria-hidden="true">
              <span className="project-hero_title-text">{project.title}</span>
            </div>

            <div className="project-hero_slideshow">
              {heroSlides.map((slide, i) => (
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
              <span className="project-hero_title-text">{project.title}</span>
            </div>

            <div className="project-hero_info">
              <div className="padding-global">
                <div className="project-hero_info-grid">
                  <div className="project-hero_info-left">
                    <div className="overflow-hidden">
                      <div className="project-hero_info-label text-color-secondary">PHOTOGRAPHY</div>
                    </div>
                    <div className="overflow-hidden">
                      <div className="project-hero_info-value">{project.photo_subcategory || project.photo_location || ''}</div>
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

        {/* Gallery */}
        <section id="gallery" className="section_project-gallery">
          <div className="padding-global">
            <div className="spacer-xxhuge"></div>
            <div className="project-gallery_grid">
              {galleryRows.map((row, rowIdx) =>
                (row.project_gallery_images ?? []).map((image, imgIdx) => (
                  <div
                    key={image.id}
                    className={`project-gallery_item ${layoutToClass(row.layout)}`}
                    onClick={() => setLightboxIndex(getFlatIndex(rowIdx, imgIdx))}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="project-gallery_image-wrapper">
                      <img
                        src={image.image_url}
                        loading="lazy"
                        alt={image.alt_text || project.title}
                        className="project-gallery_image"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="spacer-xxhuge"></div>
            <div className="project-gallery_back">
              <Link href="/photography" className="button is-primary inline-block">
                <div className="button_text-wrapper">
                  <div className="button_text">VIEW ALL WORKS</div>
                  <div className="button_text is-absolute">VIEW ALL WORKS</div>
                </div>
              </Link>
            </div>
            <div className="spacer-xxhuge"></div>
          </div>
        </section>
      </main>

      <Lightbox
        images={allImages}
        openIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </div>
  )
}
