'use client'

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { rewriteCmsLinks } from '@/lib/utils'
import type { AboutHoverImage } from '@/lib/types'

interface AboutSectionProps {
  html: string
  hoverImages: AboutHoverImage[]
}

export default function AboutSection({ html, hoverImages }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorImgRef = useRef<HTMLImageElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  // Build hover image map: link_identifier → image_url (stable ref)
  const hoverImageMap = useMemo(() => {
    const map: Record<string, string> = {}
    hoverImages.forEach((img) => {
      if (img.image_url) map[img.link_identifier] = img.image_url
    })
    return map
  }, [hoverImages])

  // Process HTML: rewrite links, then enrich all <a> tags for hover effect
  const processedHtml = useMemo(() => {
    let result = rewriteCmsLinks(html)

    result = result.replace(/<a\s+([^>]*)>/g, (_match, attrs: string) => {
      const hrefMatch = attrs.match(/href="([^"]*)"/)
      const href = hrefMatch ? hrefMatch[1] : ''
      const imgUrl = hoverImageMap[href] || ''

      let cleanAttrs = attrs
        .replace(/\s*class="[^"]*"/g, '')
        .replace(/\s*data-hover-img="[^"]*"/g, '')
        .trim()

      return `<a class="about-hover-link" data-hover-img="${imgUrl}" ${cleanAttrs}>`
    })

    return result
  }, [html, hoverImageMap])

  // Pre-load hover images so they display instantly on hover
  useEffect(() => {
    Object.values(hoverImageMap).forEach((url) => {
      const img = new Image()
      img.src = url
    })
  }, [hoverImageMap])

  // Setup hover event listeners
  useEffect(() => {
    const section = sectionRef.current
    const cursorEl = cursorRef.current
    const cursorImg = cursorImgRef.current
    if (!section || !cursorEl || !cursorImg) return

    const hoverLinks = section.querySelectorAll<HTMLElement>('.about-hover-link')
    if (!hoverLinks.length) return

    // Ensure cursor starts fully hidden
    gsap.set(cursorEl, { opacity: 0, clipPath: 'inset(50% 50% 50% 50%)' })

    const cleanups: (() => void)[] = []
    let isVisible = false

    hoverLinks.forEach((link) => {
      const onEnter = (e: MouseEvent) => {
        const src = link.getAttribute('data-hover-img')
        if (!src) return

        cursorImg.src = src

        // Position instantly to avoid first-frame lag
        gsap.set(cursorEl, { left: e.clientX, top: e.clientY })

        link.classList.add('is-hovered')
        isVisible = true

        if (tweenRef.current) tweenRef.current.kill()
        tweenRef.current = gsap.to(cursorEl, {
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          duration: 0.5,
          ease: 'power3.out',
        })
      }

      const onLeave = () => {
        link.classList.remove('is-hovered')

        if (tweenRef.current) tweenRef.current.kill()
        tweenRef.current = gsap.to(cursorEl, {
          opacity: 0,
          clipPath: 'inset(50% 50% 50% 50%)',
          scale: 0.9,
          duration: 0.35,
          ease: 'power3.in',
          onComplete: () => {
            isVisible = false
          },
        })
      }

      const onMove = (e: MouseEvent) => {
        if (!isVisible) return
        gsap.to(cursorEl, {
          left: e.clientX,
          top: e.clientY,
          duration: 0.15,
          ease: 'power2.out',
        })
      }

      link.addEventListener('mouseenter', onEnter)
      link.addEventListener('mouseleave', onLeave)
      link.addEventListener('mousemove', onMove)

      cleanups.push(() => {
        link.removeEventListener('mouseenter', onEnter)
        link.removeEventListener('mouseleave', onLeave)
        link.removeEventListener('mousemove', onMove)
      })
    })

    return () => {
      cleanups.forEach((fn) => fn())
      if (tweenRef.current) {
        tweenRef.current.kill()
        tweenRef.current = null
      }
      gsap.set(cursorEl, { opacity: 0, clipPath: 'inset(50% 50% 50% 50%)' })
    }
  }, [processedHtml])

  if (!html) return null

  return (
    <section id="about" className="section_home_about" ref={sectionRef}>
      <div className="padding-global">
        <div className="spacer-xlarge"></div>
        <div className="home_about_wrapper">
          <div className="home_about_sticky">
            <div className="home_about_text-wrapper">
              <div className="home_about_text is-first-text">
                <div
                  className="text-size-large"
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
                <div className="about-hover-cursor" aria-hidden="true" ref={cursorRef}>
                  <img
                    src="/images/blank.jpg"
                    alt=""
                    className="about-hover-cursor-img"
                    ref={cursorImgRef}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="home_about_sticky-spacer"></div>
        </div>
      </div>
    </section>
  )
}
