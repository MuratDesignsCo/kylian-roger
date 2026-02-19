'use client'

import { useEffect, useRef } from 'react'
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

  // Build hover image map from DB data
  const hoverImageMap: Record<string, string> = {}
  hoverImages.forEach((img) => {
    hoverImageMap[img.link_identifier] = img.image_url
  })

  // Process the HTML to inject hover images and rewrite links
  let processedHtml = rewriteCmsLinks(html)
  // Replace blank.jpg placeholders with actual hover images
  Object.entries(hoverImageMap).forEach(([identifier, url]) => {
    if (url) {
      const regex = new RegExp(
        `(<a[^>]*class="about-hover-link"[^>]*data-hover-img=")([^"]*)(")`,
        'g'
      )
      // Match by link identifier in the span class
      processedHtml = processedHtml.replace(
        new RegExp(
          `(<a[^>]*data-hover-img=")([^"]*)("[^>]*>\\s*<span[^>]*class="gif ${identifier}")`,
          'g'
        ),
        `$1${url}$3`
      )
    }
  })

  useEffect(() => {
    const section = sectionRef.current
    const cursorEl = cursorRef.current
    const cursorImg = cursorImgRef.current
    if (!section || !cursorEl || !cursorImg) return

    const hoverLinks = section.querySelectorAll<HTMLElement>('.about-hover-link')
    if (!hoverLinks.length) return

    let cursorTween: gsap.core.Tween | null = null
    const cleanups: (() => void)[] = []

    hoverLinks.forEach((link) => {
      const onEnter = (e: MouseEvent) => {
        const src = link.getAttribute('data-hover-img')
        if (src) cursorImg.src = src

        cursorEl.style.left = e.clientX + 'px'
        cursorEl.style.top = e.clientY + 'px'

        link.classList.add('is-hovered')

        if (cursorTween) cursorTween.kill()
        cursorTween = gsap.fromTo(
          cursorEl,
          { clipPath: 'inset(50% 50% 50% 50%)', scale: 1.15 },
          { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.6, ease: 'power3.out' }
        )
      }

      const onLeave = () => {
        link.classList.remove('is-hovered')
        if (cursorTween) cursorTween.kill()
        cursorTween = gsap.to(cursorEl, {
          clipPath: 'inset(50% 50% 50% 50%)',
          scale: 0.9,
          duration: 0.4,
          ease: 'power3.in',
        })
      }

      const onMove = (e: MouseEvent) => {
        gsap.to(cursorEl, {
          left: e.clientX + 'px',
          top: e.clientY + 'px',
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
    }
  }, [html])

  if (!html) return null

  return (
    <section id="about" className="section_home_about" ref={sectionRef}>
      <div className="padding-global">
        <div className="spacer-xlarge"></div>
        <div className="home_about_wrapper">
          <div className="home_about_sticky">
            <div className="home_about_text-wrapper">
              <div className="home_about_text is-first-text">
                <p
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
