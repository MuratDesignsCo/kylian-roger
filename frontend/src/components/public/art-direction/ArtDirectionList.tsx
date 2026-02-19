'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import type { Project } from '@/lib/types'

const INITIAL_VISIBLE = 6
const LOAD_MORE_COUNT = 3

interface ArtDirectionListProps {
  projects: Project[]
}

export default function ArtDirectionList({ projects }: ArtDirectionListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list')
  const [switching, setSwitching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const gsapCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null)

  // Create and cleanup gsap context to prevent removeChild errors
  useEffect(() => {
    gsapCtxRef.current = gsap.context(() => {}, containerRef)
    return () => {
      gsapCtxRef.current?.revert()
    }
  }, [])

  const getVisibleItems = useCallback(() => {
    const list = listRef.current
    if (!list) return []
    return Array.from(list.querySelectorAll<HTMLElement>('.works_list-item.art')).filter(
      (_, i) => i < visibleCount
    )
  }, [visibleCount])

  const handleLoadMore = useCallback(() => {
    const list = listRef.current
    if (!list) return

    const newCount = Math.min(visibleCount + LOAD_MORE_COUNT, projects.length)
    setVisibleCount(newCount)

    requestAnimationFrame(() => {
      const ctx = gsapCtxRef.current
      if (!ctx) return

      const allItems = Array.from(list.querySelectorAll<HTMLElement>('.works_list-item.art'))
      const newItems = allItems.slice(visibleCount, newCount)

      ctx.add(() => {
        newItems.forEach((item) => {
          gsap.set(item, { y: 30 })
        })
        gsap.to(newItems, {
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.1,
          clearProps: 'transform',
        })
      })
    })
  }, [visibleCount, projects.length])

  const handleViewToggle = useCallback(
    (view: 'list' | 'grid') => {
      if (view === currentView || switching) return
      setSwitching(true)

      const list = listRef.current
      const ctx = gsapCtxRef.current
      if (!list || !ctx) return

      const visible = getVisibleItems()
      const firstRects = visible.map((item) => item.getBoundingClientRect())
      const scrollY = window.scrollY

      ctx.add(() => {
        const tl = gsap.timeline()

        tl.to(visible, {
          y: -8,
          duration: 0.3,
          ease: 'power2.in',
          stagger: 0.015,
        })

        tl.call(() => {
          setCurrentView(view)

          requestAnimationFrame(() => {
            const lastRects = visible.map((item) => item.getBoundingClientRect())

            visible.forEach((item, i) => {
              const first = firstRects[i]
              const last = lastRects[i]
              const newScrollY = window.scrollY

              const dx = first.left - last.left
              const dy = first.top + scrollY - (last.top + newScrollY)

              gsap.set(item, { x: dx, y: dy })
            })

            gsap.to(visible, {
              x: 0,
              y: 0,
              duration: 0.6,
              ease: 'power3.out',
              stagger: 0.025,
              clearProps: 'transform',
              onComplete: () => {
                setSwitching(false)
              },
            })
          })
        })
      })
    },
    [currentView, switching, getVisibleItems]
  )

  const allVisible = visibleCount >= projects.length

  return (
    <div ref={containerRef}>
      <div className="art-view_controls">
        <button
          type="button"
          className={`art-view_btn${currentView === 'list' ? ' is-active' : ''}`}
          data-view="list"
          aria-label="Vue liste"
          onClick={() => handleViewToggle('list')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="2" cy="3" r="1.5" fill="currentColor" />
            <rect x="6" y="2" width="14" height="2" rx="1" fill="currentColor" />
            <circle cx="2" cy="10" r="1.5" fill="currentColor" />
            <rect x="6" y="9" width="14" height="2" rx="1" fill="currentColor" />
            <circle cx="2" cy="17" r="1.5" fill="currentColor" />
            <rect x="6" y="16" width="14" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className={`art-view_btn${currentView === 'grid' ? ' is-active' : ''}`}
          data-view="grid"
          aria-label="Vue grille"
          onClick={() => handleViewToggle('grid')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="0" y="0" width="9" height="6" rx="1" fill="currentColor" />
            <rect x="11" y="0" width="9" height="9" rx="1" fill="currentColor" />
            <rect x="0" y="8" width="9" height="12" rx="1" fill="currentColor" />
            <rect x="11" y="11" width="9" height="9" rx="1" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div className="spacer-medium"></div>
      <div className="works_list-list-wrapper art">
        <div
          role="list"
          className="works_list-list art"
          data-art-view={currentView}
          ref={listRef}
        >
          {projects.map((project, i) => {
            const number = String(i + 1).padStart(2, '0')
            return (
              <div
                key={project.id}
                role="listitem"
                className={`works_list-item art${i >= visibleCount ? ' is-hidden' : ''}`}
              >
                <div className="art-item_info">
                  <span className="art-item_number">{number}</span>
                  <h3 className="art-item_title">{project.title}</h3>
                  <div className="art-item_details">
                    {project.art_client && (
                      <div className="art-item_detail-row">
                        <span className="art-item_label">Client</span>
                        <span className="art-item_value">{project.art_client}</span>
                      </div>
                    )}
                    {project.art_role && (
                      <div className="art-item_detail-row">
                        <span className="art-item_label">R&#244;le</span>
                        <span className="art-item_value">{project.art_role}</span>
                      </div>
                    )}
                    <div className="art-item_detail-row">
                      <span className="art-item_label">Ann&#233;e</span>
                      <span className="art-item_value">{project.year}</span>
                    </div>
                  </div>
                  {project.art_description && (
                    <p className="art-item_description">{project.art_description}</p>
                  )}
                  {project.art_tags && project.art_tags.length > 0 && (
                    <div className="art-item_meta">
                      {project.art_tags.map((tag) => (
                        <span key={tag} className="art-item_tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/works/${project.slug}`}
                    className="art-item_link"
                  >
                    {'VOIR LE PROJET \u2192'}
                  </Link>
                </div>
                <div className="art-item_image-wrapper">
                  <img
                    src={project.cover_image_url || '/images/blank.jpg'}
                    loading="lazy"
                    alt={project.cover_image_alt || project.title}
                    className="art-item_image"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {!allVisible && (
        <div className="art-loadmore_wrapper">
          <button
            type="button"
            className="art-loadmore_btn"
            onClick={handleLoadMore}
          >
            VOIR PLUS
          </button>
        </div>
      )}
    </div>
  )
}
