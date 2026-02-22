'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HomepageFeaturedWork, WorksSectionLink } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface WorksSectionProps {
  title: string
  subtitle?: string
  links: WorksSectionLink[]
  featuredWorks: HomepageFeaturedWork[]
}

export default function WorksSection({
  title,
  subtitle = 'Explore more',
  links,
  featuredWorks,
}: WorksSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const triggersRef = useRef<ScrollTrigger[]>([])

  // Group featured works by slot
  const stillWorks = featuredWorks
    .filter((w) => w.slot_category === 'still')
    .sort((a, b) => a.slot_index - b.slot_index)
  const motionWorks = featuredWorks
    .filter((w) => w.slot_category === 'motion')
    .sort((a, b) => a.slot_index - b.slot_index)

  // Interleave: still[0], motion[0], still[1], motion[1]
  const interleaved: { work: HomepageFeaturedWork; side: 'left' | 'right' }[] = []
  const maxLen = Math.max(stillWorks.length, motionWorks.length)
  for (let i = 0; i < maxLen; i++) {
    if (stillWorks[i]) interleaved.push({ work: stillWorks[i], side: 'left' })
    if (motionWorks[i]) interleaved.push({ work: motionWorks[i], side: 'right' })
  }

  // Fix link hrefs from .html to Next.js routes
  const fixHref = (href: string) => {
    return href
      .replace('photography.html', '/photography')
      .replace('film-motion.html', '/film-motion')
      .replace('art-direction.html', '/art-direction')
      .replace('contact.html', '/contact')
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const triggers: ScrollTrigger[] = []

    // Headlines reveal
    section
      .querySelectorAll<HTMLElement>(
        '.works_headline--desktop, .works_headline--tablet-mobile'
      )
      .forEach((el) => {
        gsap.fromTo(
          el,
          { y: '50%' },
          {
            y: '0%',
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

    // Buttons reveal
    section
      .querySelectorAll<HTMLElement>(
        '.works_button--desktop, .home_works_button--tablet-mobile'
      )
      .forEach((el) => {
        gsap.fromTo(
          el,
          { y: 20 },
          {
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

    // Work items - slide up
    section
      .querySelectorAll<HTMLElement>('.home_works_item-link')
      .forEach((link) => {
        gsap.fromTo(
          link,
          { y: 60 },
          {
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: link,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

    // Work images - zoom out
    section
      .querySelectorAll<HTMLElement>('.home_works_item-image')
      .forEach((img) => {
        gsap.fromTo(
          img,
          { scale: 1.5 },
          {
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: img,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

    // Magnetic effect
    const magnetStrength = 0.08
    const magneticItems = section.querySelectorAll<HTMLElement>('.home_works_item-link')
    const magnetCleanups: (() => void)[] = []

    magneticItems.forEach((item) => {
      let bounds: DOMRect | null = null

      const onEnter = () => {
        bounds = item.getBoundingClientRect()
      }
      const onMove = (e: MouseEvent) => {
        if (!bounds) return
        const centerX = bounds.left + bounds.width / 2
        const centerY = bounds.top + bounds.height / 2
        const deltaX = (e.clientX - centerX) * magnetStrength
        const deltaY = (e.clientY - centerY) * magnetStrength
        gsap.to(item, { x: deltaX, y: deltaY, duration: 0.8, ease: 'power2.out' })
      }
      const onLeave = () => {
        gsap.to(item, { x: 0, y: 0, duration: 1, ease: 'power3.out' })
      }

      item.addEventListener('mouseenter', onEnter)
      item.addEventListener('mousemove', onMove)
      item.addEventListener('mouseleave', onLeave)

      magnetCleanups.push(() => {
        item.removeEventListener('mouseenter', onEnter)
        item.removeEventListener('mousemove', onMove)
        item.removeEventListener('mouseleave', onLeave)
      })
    })

    triggersRef.current = triggers

    return () => {
      triggers.forEach((t) => t.kill())
      ScrollTrigger.getAll()
        .filter((t) => {
          const el = t.trigger
          return el && section.contains(el as Node)
        })
        .forEach((t) => t.kill())
      magnetCleanups.forEach((fn) => fn())
    }
  }, [featuredWorks])

  return (
    <section id="works" className="section_home_works" ref={sectionRef} style={{ backgroundColor: '#000000' }}>
      <div className="home_works_background">
        <div className="padding-global">
          <div className="home_works_wrapper">
            <div className="home_works_spacer"></div>
            <div className="home_works_headline-button">
              <div className="works_headline--desktop">
                <h2 className="heading-style-h1 text-color-alternate text-align-center">
                  {title}
                </h2>
              </div>
              <div className="works_headline--tablet-mobile">
                <h2 className="heading-style-h1 text-color-alternate text-align-center">
                  {title}
                </h2>
              </div>
              <div className="works_button--desktop">
                <p className="paragraph">{subtitle}</p>
                <div className="button-wrapper">
                  {links.map((link, i) => (
                    <Link
                      key={i}
                      href={fixHref(link.href)}
                      className="button is-secondary inline-block"
                    >
                      <div className="button_text-wrapper">
                        <div className="button_text">{link.label}</div>
                        <div className="button_text is-absolute">{link.label}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="works_button--tablet-mobile">
                <p className="paragraph">{subtitle}</p>
                <div className="button-wrapper">
                  {links.map((link, i) => (
                    <Link
                      key={i}
                      href={fixHref(link.href)}
                      className="button is-secondary inline-block"
                    >
                      <div className="button_text-wrapper">
                        <div className="button_text">{link.label}</div>
                        <div className="button_text is-absolute">{link.label}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="home_works_content">
              {interleaved.map(({ work, side }, i) => {
                const project = work.projects
                if (!project) return null
                const href =
                  project.category === 'film-motion'
                    ? '/film-motion'
                    : `/works/${project.slug}`

                return (
                  <div key={work.id} className="home_works_list-wrapper">
                    <div role="list" className="home_works_list">
                      <div
                        role="listitem"
                        className={`home_works_list-item is-${side === 'left' ? 'left' : 'right'}`}
                      >
                        <Link
                          href={href}
                          className="home_works_item-link inline-block"
                        >
                          <div className="home_works_item-image-overlay-wrapper">
                            <div className="home_works_item-image-wrapper">
                              <img
                                src={project.cover_image_url || '/images/blank.jpg'}
                                loading="lazy"
                                alt={project.cover_image_alt || project.title}
                                className="home_works_item-image"
                              />
                            </div>
                          </div>
                          <div className="home_works_item-info">
                            <div className="overflow-hidden">
                              <div className="home_works_item-name">
                                <div className="text-color-alternate">
                                  {project.title}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="home_works_spacer"></div>
        </div>
      </div>
    </section>
  )
}
