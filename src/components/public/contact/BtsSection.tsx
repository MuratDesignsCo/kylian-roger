'use client'

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lightbox from '@/components/public/Lightbox'
import type { BtsImage } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface BtsSectionProps {
  title: string
  images: BtsImage[]
}

export default function BtsSection({ title, images }: BtsSectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const lightboxImages = images.map((img) => ({
    src: img.image_url,
    alt: img.alt_text || 'Behind the scenes',
  }))

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Headline reveal
    section.querySelectorAll<HTMLElement>('.bts_headline').forEach((el) => {
      gsap.fromTo(
        el,
        { y: '50%' },
        {
          y: '0%',
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        }
      )
    })

    // BTS items reveal
    section.querySelectorAll<HTMLElement>('.bts_item').forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 60 },
        {
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
        }
      )
    })

    // BTS images zoom out
    section.querySelectorAll<HTMLElement>('.bts_item-image').forEach((img) => {
      gsap.fromTo(
        img,
        { scale: 1.3 },
        {
          scale: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: img, start: 'top 90%', toggleActions: 'play none none none' },
        }
      )
    })

    return () => {
      ScrollTrigger.getAll()
        .filter((t) => {
          const el = t.trigger
          return el && section.contains(el as Node)
        })
        .forEach((t) => t.kill())
    }
  }, [images])

  return (
    <section className="section_bts" ref={sectionRef}>
      <div className="padding-global">
        <div className="bts_heading">
          <div className="bts_headline">
            <h2 className="heading-style-h1">{title}</h2>
          </div>
        </div>
        <div className="spacer-large"></div>
        <div className="bts_grid">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="bts_item"
              onClick={() => setLightboxIndex(i)}
              style={{ cursor: 'pointer' }}
            >
              <div className="bts_item-image-wrapper">
                <img
                  src={img.image_url}
                  loading="lazy"
                  alt={img.alt_text || 'Behind the scenes'}
                  className="bts_item-image"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="spacer-xxhuge"></div>
      </div>
      <Lightbox
        images={lightboxImages}
        openIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </section>
  )
}
