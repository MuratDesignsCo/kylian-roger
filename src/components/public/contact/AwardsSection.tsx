'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Award } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface AwardsSectionProps {
  title: string
  awards: Award[]
}

export default function AwardsSection({ title, awards }: AwardsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const floatingImgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Headline reveal
    section.querySelectorAll<HTMLElement>('.home_awards_headline').forEach((el) => {
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

    // Lines reveal
    section.querySelectorAll<HTMLElement>('.home_awards_line').forEach((el, i) => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.out',
          delay: i * 0.05,
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        }
      )
    })

    // Award text reveals
    const awardTextSelectors = [
      '.home_awards_list-text-award',
      '.home_awards_list-text-organizer',
      '.home_awards_list-text-year',
    ]
    awardTextSelectors.forEach((sel) => {
      section.querySelectorAll<HTMLElement>(sel).forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: '100%', visibility: 'hidden' },
          {
            y: '0%',
            visibility: 'visible',
            duration: 0.6,
            ease: 'power3.out',
            delay: i * 0.05,
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          }
        )
      })
    })

    // Floating image hover effect (desktop only)
    const isTouchDevice = window.matchMedia('(hover: none)').matches
    const awardsListContainer = section.querySelector<HTMLElement>('.home_awards_lists')
    const awardItems = section.querySelectorAll<HTMLElement>('.home_awards_list-item')
    const floatingImg = floatingRef.current
    const floatingImgTag = floatingImgRef.current

    if (awardsListContainer && awardItems.length && !isTouchDevice && floatingImg && floatingImgTag) {
      let currentSrc = ''
      const cleanups: (() => void)[] = []

      const onContainerEnter = () => floatingImg.classList.add('is-visible')
      const onContainerLeave = () => floatingImg.classList.remove('is-visible')
      const onContainerMove = (e: MouseEvent) => {
        gsap.to(floatingImg, {
          left: e.clientX,
          top: e.clientY,
          xPercent: -50,
          yPercent: -50,
          duration: 0.6,
          ease: 'power2.out',
        })
      }

      awardsListContainer.addEventListener('mouseenter', onContainerEnter)
      awardsListContainer.addEventListener('mouseleave', onContainerLeave)
      awardsListContainer.addEventListener('mousemove', onContainerMove)

      cleanups.push(() => {
        awardsListContainer.removeEventListener('mouseenter', onContainerEnter)
        awardsListContainer.removeEventListener('mouseleave', onContainerLeave)
        awardsListContainer.removeEventListener('mousemove', onContainerMove)
      })

      awardItems.forEach((item) => {
        const img = item.querySelector<HTMLImageElement>('.awards_list-item-image')
        if (!img) return
        const src = img.currentSrc || img.src

        const onEnter = () => {
          if (src !== currentSrc) {
            floatingImgTag.src = src
            currentSrc = src
          }
        }
        const onMove = (e: MouseEvent) => {
          gsap.to(floatingImg, {
            left: e.clientX,
            top: e.clientY,
            xPercent: -50,
            yPercent: -50,
            duration: 0.6,
            ease: 'power2.out',
          })
        }

        item.addEventListener('mouseenter', onEnter)
        item.addEventListener('mousemove', onMove)

        cleanups.push(() => {
          item.removeEventListener('mouseenter', onEnter)
          item.removeEventListener('mousemove', onMove)
        })
      })

      return () => {
        cleanups.forEach((fn) => fn())
        ScrollTrigger.getAll()
          .filter((t) => {
            const el = t.trigger
            return el && section.contains(el as Node)
          })
          .forEach((t) => t.kill())
      }
    }

    return () => {
      ScrollTrigger.getAll()
        .filter((t) => {
          const el = t.trigger
          return el && section.contains(el as Node)
        })
        .forEach((t) => t.kill())
    }
  }, [awards])

  return (
    <section id="awards" className="section_home_awards" ref={sectionRef}>
      <div className="padding-global">
        <div className="spacer-xxhuge"></div>
        <div className="home_awards_heading">
          <div className="home_awards_headline">
            <h2 className="heading-style-h1">{title}</h2>
          </div>
        </div>
        <div className="spacer-large"></div>
        <div className="home_awards_lists">
          <div className="home_awards_line"></div>
          {awards.map((award) => (
            <div key={award.id} className="home_awards_list-item">
              <div className="home_awards_list-text-background-overlay"></div>
              <div className="home_awards_list-item-image-container">
                <div className="awards_list-item-image-wrapper">
                  <img
                    src={award.hover_image_url || '/images/blank.jpg'}
                    loading="lazy"
                    alt=""
                    className="awards_list-item-image"
                  />
                </div>
              </div>
              <div className="home_awards_list-text-wrapper">
                <div className="home_awards_list-text">
                  <div className="home_awards_list-text-award-organizer-wrapper">
                    <div className="overflow-hidden">
                      <div className="home_awards_list-text-award">
                        <div className="text-size-medium">{award.award_name}</div>
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div className="home_awards_list-text-organizer">
                        <div className="text-size-medium">{award.organizer}</div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <div className="home_awards_list-text-year">
                      <div className="text-size-medium">{award.year}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="home_awards_line"></div>
            </div>
          ))}
        </div>
        <div className="spacer-xxhuge"></div>
      </div>
      {/* Floating hover image (appended via portal-like approach) */}
      <div className="awards_hover-image" ref={floatingRef}>
        <img src="/images/blank.jpg" alt="" ref={floatingImgRef} />
      </div>
    </section>
  )
}
