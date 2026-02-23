'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

const BATCH_SIZE = 3

interface PhotoGalleryProps {
  projects: Project[]
  initialVisible?: number
}

export default function PhotoGallery({ projects, initialVisible = 9 }: PhotoGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisible)
  const galleryRef = useRef<HTMLDivElement>(null)
  const animatedRef = useRef<Set<number>>(new Set())
  const gsapCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null)

  // Create gsap context
  useEffect(() => {
    gsapCtxRef.current = gsap.context(() => {}, galleryRef)
  }, [])

  // Synchronous cleanup before DOM removal
  useLayoutEffect(() => {
    return () => {
      gsapCtxRef.current?.revert()
      gsapCtxRef.current = null
    }
  }, [])

  const animateItems = useCallback((elements: HTMLElement[]) => {
    const ctx = gsapCtxRef.current
    if (!ctx) return

    ctx.add(() => {
      elements.forEach((item) => {
        const wrapper = item.querySelector('.photo-gallery_image-wrapper')
        if (!wrapper) return

        gsap.fromTo(item, { y: 40 }, {
          y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' },
        })
      })
      ScrollTrigger.refresh()
    })
  }, [])

  // Animate initially visible items
  useEffect(() => {
    const gallery = galleryRef.current
    if (!gallery) return

    const timer = setTimeout(() => {
      const items = Array.from(gallery.querySelectorAll<HTMLElement>('.photo-gallery_item'))
      const toAnimate = items.filter((_, i) => i < initialVisible && !animatedRef.current.has(i))
      toAnimate.forEach((_, i) => animatedRef.current.add(i))
      animateItems(toAnimate)
    }, 100)

    return () => clearTimeout(timer)
  }, [projects, animateItems])

  const handleLoadMore = useCallback(() => {
    const newCount = Math.min(visibleCount + BATCH_SIZE, projects.length)
    setVisibleCount(newCount)

    requestAnimationFrame(() => {
      const gallery = galleryRef.current
      if (!gallery) return
      const items = Array.from(gallery.querySelectorAll<HTMLElement>('.photo-gallery_item'))
      const newItems = items.filter((_, i) => i >= visibleCount && i < newCount && !animatedRef.current.has(i))
      newItems.forEach((_, idx) => animatedRef.current.add(visibleCount + idx))
      animateItems(newItems)
    })
  }, [visibleCount, projects.length, animateItems])

  // Hover zoom effect via GSAP (CSS scale conflicts with GSAP inline transforms)
  useEffect(() => {
    const gallery = galleryRef.current
    if (!gallery) return

    const items = gallery.querySelectorAll<HTMLElement>('.photo-gallery_item')
    const handlers: Array<{ el: HTMLElement; enter: () => void; leave: () => void }> = []

    items.forEach((item) => {
      const img = item.querySelector<HTMLElement>('.photo-gallery_image')
      if (!img) return

      const enter = () => { gsap.to(img, { scale: 1.05, duration: 0.5, ease: 'power2.out', overwrite: true }) }
      const leave = () => { gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out', overwrite: true }) }

      item.addEventListener('mouseenter', enter)
      item.addEventListener('mouseleave', leave)
      handlers.push({ el: item, enter, leave })
    })

    return () => {
      handlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
        // Kill any in-flight hover tweens on the image
        const img = el.querySelector<HTMLElement>('.photo-gallery_image')
        if (img) gsap.killTweensOf(img)
      })
    }
  }, [visibleCount, projects])

  const allVisible = visibleCount >= projects.length

  return (
    <>
      <div className="photo-gallery_list" ref={galleryRef}>
        {projects.map((project, i) => (
          <Link
            key={project.id}
            href={`/works/${project.slug}`}
            className={`photo-gallery_item${i >= visibleCount ? ' is-hidden' : ''}`}
          >
            <div className="photo-gallery_image-wrapper">
              <img
                src={project.cover_image_url || '/images/blank.jpg'}
                loading="lazy"
                alt={project.cover_image_alt || project.title}
                className="photo-gallery_image"
              />
            </div>
            <div className="photo-gallery_item-info">
              <div className="overflow-hidden">
                <div className="photo-gallery_item-name">{project.title}</div>
              </div>
              {project.card_label && (
                <div className="overflow-hidden">
                  <div className="photo-gallery_item-year">{project.card_label}</div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="spacer-large"></div>
      {!allVisible && (
        <div className="photo-gallery_load-more-wrapper">
          <button
            type="button"
            className="button is-secondary photo-gallery_load-more"
            onClick={handleLoadMore}
          >
            <span className="photo-gallery_load-more-text">LOAD MORE</span>
          </button>
        </div>
      )}
    </>
  )
}
