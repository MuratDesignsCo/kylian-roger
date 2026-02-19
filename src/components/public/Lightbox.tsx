'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import gsap from 'gsap'
import { useLenisContext } from '@/components/public/LenisProvider'

interface LightboxImage {
  src: string
  alt: string
}

interface LightboxProps {
  images: LightboxImage[]
  openIndex: number | null
  onClose: () => void
}

export default function Lightbox({ images, openIndex, onClose }: LightboxProps) {
  const lenis = useLenisContext()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const isAnimating = useRef(false)

  const lightboxRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const prevBtnRef = useRef<HTMLButtonElement>(null)
  const nextBtnRef = useRef<HTMLButtonElement>(null)
  const imgContainerRef = useRef<HTMLDivElement>(null)

  const isOpen = openIndex !== null

  // Open animation
  useEffect(() => {
    if (openIndex === null) return
    if (isAnimating.current) return
    isAnimating.current = true

    const idx = openIndex
    setCurrentIndex(idx)
    setIsZoomed(false)

    const overlay = overlayRef.current
    const img = imgRef.current
    const closeBtn = closeBtnRef.current
    const prevBtn = prevBtnRef.current
    const nextBtn = nextBtnRef.current

    if (!overlay || !img || !closeBtn || !prevBtn || !nextBtn) return

    // Set image source
    img.src = images[idx].src

    // Stop scroll
    document.body.style.overflow = 'hidden'
    lenis?.stop()

    // Set initial states
    gsap.set(overlay, { opacity: 0 })
    gsap.set(img, { opacity: 0, scale: 1.08, y: 30 })
    gsap.set(closeBtn, { opacity: 0, y: -10 })
    gsap.set(prevBtn, { opacity: 0, x: -15 })
    gsap.set(nextBtn, { opacity: 0, x: 15 })

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false
      },
    })

    tl.to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    tl.to(img, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.25')
    tl.to(closeBtn, { opacity: 0.7, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.5')
    tl.to(prevBtn, { opacity: 0.6, x: 0, duration: 0.5, ease: 'power3.out' }, '-=0.45')
    tl.to(nextBtn, { opacity: 0.6, x: 0, duration: 0.5, ease: 'power3.out' }, '-=0.45')
  }, [openIndex, images, lenis])

  const resetZoom = useCallback(() => {
    if (isZoomed) {
      setIsZoomed(false)
      if (imgRef.current) gsap.set(imgRef.current, { scale: 1 })
      imgContainerRef.current?.classList.remove('is-zoomed')
    }
  }, [isZoomed])

  const handleClose = useCallback(() => {
    if (isAnimating.current) return
    isAnimating.current = true
    resetZoom()

    const overlay = overlayRef.current
    const img = imgRef.current
    const closeBtn = closeBtnRef.current
    const prevBtn = prevBtnRef.current
    const nextBtn = nextBtnRef.current

    if (!overlay || !img || !closeBtn || !prevBtn || !nextBtn) return

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = ''
        lenis?.start()
        isAnimating.current = false
        gsap.set([overlay, img, closeBtn, prevBtn, nextBtn], { clearProps: 'all' })
        onClose()
      },
    })

    tl.to([closeBtn, prevBtn, nextBtn], { opacity: 0, duration: 0.3, ease: 'power2.in' })
    tl.to(img, { opacity: 0, scale: 0.95, y: -20, duration: 0.45, ease: 'power2.in' }, '-=0.2')
    tl.to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.3')
  }, [lenis, onClose, resetZoom])

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating.current) return
      let newIndex = index
      if (newIndex < 0) newIndex = images.length - 1
      if (newIndex >= images.length) newIndex = 0
      if (newIndex === currentIndex) return

      const direction = newIndex > currentIndex ? 1 : -1
      isAnimating.current = true
      resetZoom()

      const img = imgRef.current
      if (!img) return

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false
        },
      })

      tl.to(img, {
        opacity: 0,
        x: -40 * direction,
        scale: 0.97,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentIndex(newIndex)
          img.src = images[newIndex].src
        },
      })

      tl.set(img, { x: 40 * direction, scale: 0.97 })
      tl.to(img, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'power3.out' })
    },
    [currentIndex, images, resetZoom]
  )

  const toggleZoom = useCallback(() => {
    if (isAnimating.current) return
    const img = imgRef.current

    if (!isZoomed) {
      setIsZoomed(true)
      imgContainerRef.current?.classList.add('is-zoomed')
      gsap.to(img, { scale: 2, duration: 0.6, ease: 'power2.out' })
    } else {
      gsap.to(img, {
        scale: 1,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          setIsZoomed(false)
          imgContainerRef.current?.classList.remove('is-zoomed')
        },
      })
    }
  }, [isZoomed])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1)
      if (e.key === 'ArrowRight') goTo(currentIndex + 1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose, goTo, currentIndex])

  if (!isOpen) return null

  return (
    <div
      className={`lightbox${isOpen ? ' is-open' : ''}`}
      aria-hidden={!isOpen}
      ref={lightboxRef}
    >
      <div className="lightbox_overlay" ref={overlayRef} onClick={handleClose}></div>
      <button
        className="lightbox_close"
        ref={closeBtnRef}
        onClick={handleClose}
        aria-label="Fermer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <button
        className="lightbox_arrow lightbox_arrow--prev"
        ref={prevBtnRef}
        onClick={(e) => {
          e.stopPropagation()
          goTo(currentIndex - 1)
        }}
        aria-label="Image précédente"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className="lightbox_image-container" ref={imgContainerRef}>
        <img
          src={images[currentIndex]?.src || ''}
          alt={images[currentIndex]?.alt || ''}
          className="lightbox_image"
          ref={imgRef}
          onClick={(e) => {
            e.stopPropagation()
            toggleZoom()
          }}
        />
      </div>
      <button
        className="lightbox_arrow lightbox_arrow--next"
        ref={nextBtnRef}
        onClick={(e) => {
          e.stopPropagation()
          goTo(currentIndex + 1)
        }}
        aria-label="Image suivante"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
