'use client'

import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenisContext } from '@/components/public/LenisProvider'
import type { HeroImage } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface HeroSectionProps {
  titleTop: string
  titleBottom: string
  role: string
  based: string
  images: HeroImage[]
}

export default function HeroSection({
  titleTop,
  titleBottom,
  role,
  based,
  images,
}: HeroSectionProps) {
  const lenis = useLenisContext()
  const pinWrapperRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const imagesContainerRef = useRef<HTMLDivElement>(null)
  const imageRefsMap = useRef<Map<number, HTMLImageElement>>(new Map())
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)
  const resizeHandlerRef = useRef<(() => void) | null>(null)

  const setImageRef = useCallback(
    (index: number) => (el: HTMLImageElement | null) => {
      if (el) imageRefsMap.current.set(index, el)
      else imageRefsMap.current.delete(index)
    },
    []
  )

  useEffect(() => {
    if (!images.length) return

    const container = imagesContainerRef.current
    const pinWrapper = pinWrapperRef.current
    const section = sectionRef.current
    if (!container || !pinWrapper || !section) return

    // Lock scroll during hero intro
    lenis?.stop()

    const imageEls = Array.from(imageRefsMap.current.values())

    // --- Hero timeline ---
    const heroTl = gsap.timeline({ delay: 0.2 })

    // 1. Container visible at scale(0.9), all images hidden
    heroTl.set(container, { visibility: 'visible', scale: 0.9 })
    heroTl.set(imageEls, { visibility: 'hidden', opacity: 0 })

    // 2. Flash through images rapidly
    imageEls.forEach((img, i) => {
      if (i > 0) {
        heroTl.set(imageEls[i - 1], { visibility: 'hidden', opacity: 0 })
      }
      heroTl.set(img, { visibility: 'visible', opacity: 1, scale: 1.05 })
      heroTl.to(img, { scale: 1, duration: 0.15, ease: 'none' })
    })

    // 3. Scale container from 0.9 to 1
    heroTl.to(container, { scale: 1, duration: 1.2, ease: 'power2.out' })

    // 4. Name text top - clip-path reveal from bottom
    heroTl.fromTo(
      '.home_hero_name-text-top',
      { visibility: 'hidden', clipPath: 'inset(0 0 100% 0)', y: 30 },
      { visibility: 'visible', clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.9, ease: 'power3.out' },
      '-=0.8'
    )

    // 5. Name text bottom - clip-path reveal from top
    heroTl.fromTo(
      '.home_hero_name-text-bottom',
      { visibility: 'hidden', clipPath: 'inset(100% 0 0 0)', y: -30 },
      { visibility: 'visible', clipPath: 'inset(0% 0 0 0)', y: 0, duration: 0.9, ease: 'power3.out' },
      '-=0.7'
    )

    // 6. Role and Based text
    heroTl.fromTo(
      '.home_hero-role',
      { y: 15 },
      { y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.6'
    )

    heroTl.fromTo(
      '.home_hero-based',
      { y: 15 },
      { y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.5'
    )

    // 7. Trigger navbar animation
    heroTl.call(() => {
      ;(window as unknown as Record<string, unknown>).__heroNavReady = true
      window.dispatchEvent(new CustomEvent('heroNavReady'))
    })

    // 8. Setup scroll expansion after intro completes
    const heroPadding = 80
    let cachedFullScale = 1

    const computeFullscreenScale = () => {
      const currentScale = (gsap.getProperty(container, 'scaleX') as number) || 1
      const rect = container.getBoundingClientRect()
      const baseW = rect.width / currentScale
      const baseH = rect.height / currentScale
      const targetW = window.innerWidth - heroPadding * 2
      const targetH = window.innerHeight - heroPadding * 2
      const scaleX = targetW / baseW
      const scaleY = targetH / baseH
      return Math.min(scaleX, scaleY)
    }

    heroTl.call(() => {
      lenis?.start()
      cachedFullScale = computeFullscreenScale()

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: pinWrapper,
        start: 'top top',
        end: 'bottom bottom',
        pin: section,
        scrub: true,
        onUpdate: (self) => {
          const targetScale = 1 + (cachedFullScale - 1) * 0.88 * self.progress
          gsap.set(container, { scale: targetScale })
        },
      })

      const onResize = () => {
        cachedFullScale = computeFullscreenScale()
      }
      resizeHandlerRef.current = onResize
      window.addEventListener('resize', onResize)

      ScrollTrigger.refresh()
    })

    // --- Navbar animation for homepage ---
    // Hide name initially (shown after scrolling past hero)
    gsap.set(['.nav-home_name-desktop', '.nav-home_name-tablet-mobile'], {
      y: '100%',
      visibility: 'hidden',
    })

    const nameScrollTrigger = ScrollTrigger.create({
      trigger: pinWrapper,
      start: 'bottom top',
      onEnter: () => {
        gsap.to(['.nav-home_name-desktop', '.nav-home_name-tablet-mobile'], {
          y: '0%',
          visibility: 'visible',
          duration: 0.5,
          ease: 'power3.out',
        })
      },
      onLeaveBack: () => {
        gsap.to(['.nav-home_name-desktop', '.nav-home_name-tablet-mobile'], {
          y: '100%',
          visibility: 'hidden',
          duration: 0.3,
          ease: 'power3.in',
        })
      },
    })

    return () => {
      heroTl.kill()
      scrollTriggerRef.current?.kill()
      nameScrollTrigger.kill()
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current)
      }
    }
  }, [images, lenis])

  if (!images.length) return null

  return (
    <div className="section_home_hero-pin-wrapper" ref={pinWrapperRef}>
      <section className="section_home_hero" ref={sectionRef}>
        <div className="padding-global">
          <div className="home_hero_wrapper">
            <div className="home_hero_grid is-top">
              <div className="home_hero_name-text-top">
                <svg viewBox="0 0 1049 106" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label={titleTop}>
                  <path d="M191.65 4.67L97.3 50.6V51.38L196.33 101.2V105.87H120.19L45.77 68.5H43.28V105.87H0V0H43.28V36.43H45.77L120.51 0H191.66V4.67H191.65Z"/>
                  <path d="M297.95 33.16H298.26L335.16 0H396.2V1.55L319.75 70.06V105.87H276.47V70.06L200.02 1.55V0H261.05L297.95 33.16Z"/>
                  <path d="M450.659 70.68H563.849V105.87H407.369V0H450.649V70.69L450.659 70.68Z"/>
                  <path d="M619.87 105.87H576.59V0H619.87V105.87Z"/>
                  <path d="M902.87 48.88V105.87H859.59V0H893.53L1005.48 56.98V0H1048.76V105.87H1014.97L902.87 48.88Z"/>
                  <path d="M756.468 0H724.398L631.908 104V105.87H684.848L739.968 41.57H741.208L796.328 105.87H849.268V104L756.468 0Z"/>
                </svg>
              </div>
            </div>
            <div className="home_hero_grid is-middle">
              <div className="home_hero_images" ref={imagesContainerRef}>
                {images.map((img, i) => (
                  <img
                    key={img.id}
                    ref={setImageRef(i)}
                    src={img.image_url}
                    loading="eager"
                    alt={img.alt_text}
                    className={`home_hero_image is-image-${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="home_hero_grid is-bitton">
              <div className="home_hero_role-based">
                <div className="overflow-hidden">
                  <div className="home_hero-role">
                    <h1 className="text-size-regular">{role}</h1>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <div className="home_hero-based">
                    <p>{based}</p>
                  </div>
                </div>
              </div>
              <div className="home_hero_name-text-bottom">
                <svg viewBox="0 0 1049 111" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label={titleBottom}>
                  <path d="M0 2.19043H122.69C171.89 2.19043 181.7 20.0904 181.7 42.6704C181.7 61.0404 169.56 73.1904 145.89 77.8604V78.3304C145.89 78.3304 150.4 80.9804 153.83 83.6204L185.28 106.66V108.06H125.96L87.66 79.5704H43.29V108.06H0.00999832V2.19043H0ZM43.28 37.3704V48.1104H125.8C135.45 48.1104 137.79 46.4004 137.79 42.6604C137.79 39.5404 135.61 37.3704 125.8 37.3704H43.28Z"/>
                  <path d="M226.152 14.95C241.562 6.23001 268.502 0 305.872 0C343.242 0 370.332 6.23001 385.902 14.95C400.072 22.89 407.382 33.94 407.382 55.12C407.382 76.3 400.062 87.35 385.902 95.29C370.332 104.01 343.392 110.24 305.872 110.24C268.352 110.24 241.562 104.01 226.152 95.29C211.512 87.35 204.512 76.29 204.512 55.12C204.512 33.95 211.672 22.89 226.152 14.95ZM258.692 70.38C266.792 73.49 286.252 75.05 305.872 75.05C325.492 75.05 344.952 73.49 353.202 70.38C360.212 67.58 363.482 63.22 363.482 55.12C363.482 47.02 360.052 42.66 353.202 40.02C344.952 36.75 325.642 35.19 305.872 35.19C286.102 35.19 266.792 36.74 258.692 40.02C251.842 42.67 248.412 47.03 248.412 55.12C248.412 63.21 251.832 67.58 258.692 70.38Z"/>
                  <path d="M525.921 43.4495H619.881V98.5695C601.511 103.86 561.961 110.25 527.081 110.25C485.821 110.25 463.551 107.14 446.581 98.1095C432.411 90.6395 423.691 76.6195 423.691 57.0095C423.691 37.3995 433.031 23.8495 446.111 15.8995C461.991 6.24954 487.681 0.0195312 527.081 0.0195312C564.291 0.0195312 599.321 4.37953 615.981 7.17953L611.471 38.4795C582.821 35.2095 557.131 33.0295 527.081 33.0295C501.391 33.0295 484.261 35.3595 476.171 39.8795C468.701 44.0795 467.611 50.9295 467.611 57.0095C467.611 62.4595 469.631 69.4595 476.801 72.7295C484.741 76.3095 499.691 77.2495 527.091 77.2495C542.501 77.2495 562.591 76.3095 576.601 74.7595V69.6195H525.921V43.4495Z"/>
                  <path d="M694.591 68.9804V78.1704H829.891V108.06H651.301V2.19043H829.891V32.0804H694.591V41.2704H822.731V68.9804H694.591Z"/>
                  <path d="M863.49 2.19043H986.18C1035.38 2.19043 1045.19 20.0904 1045.19 42.6704C1045.19 61.0404 1033.05 73.1904 1009.38 77.8604V78.3304C1009.38 78.3304 1013.89 80.9804 1017.32 83.6204L1048.77 106.66V108.06H989.45L951.15 79.5704H906.78V108.06H863.5V2.19043H863.49ZM906.78 37.3704V48.1104H989.3C998.95 48.1104 1001.29 46.4004 1001.29 42.6604C1001.29 39.5404 999.11 37.3704 989.3 37.3704H906.78Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
