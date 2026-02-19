'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Hook that sets up the WORKS submenu slide animation
 * Used by both Navbar and Footer
 */
export function useMenuAnimation(menuRef: React.RefObject<HTMLElement | null>) {
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return

    const menuMain = menu.querySelector('.nav-menu-main') as HTMLElement | null
    const menuSub = menu.querySelector('.nav-menu-sub') as HTMLElement | null
    if (!menuMain || !menuSub) return

    const worksTrigger = menuMain.querySelector('.nav-works-trigger') as HTMLElement | null
    const backTrigger = menuSub.querySelector('.nav-back-trigger') as HTMLElement | null
    if (!worksTrigger || !backTrigger) return

    const handleWorksClick = () => {
      if (isAnimatingRef.current) return
      isAnimatingRef.current = true

      const mainItems = menuMain.querySelectorAll('.overflow-hidden')
      const subItems = menuSub.querySelectorAll('.overflow-hidden')

      const tl = gsap.timeline({
        onComplete: () => { isAnimatingRef.current = false },
      })

      tl.to(mainItems, {
        y: '-110%',
        opacity: 0,
        duration: 0.35,
        ease: 'power3.in',
        stagger: 0.05,
      })

      tl.call(() => {
        menuMain.style.pointerEvents = 'none'
        menuSub.setAttribute('aria-hidden', 'false')
        gsap.set(subItems, { y: '110%', opacity: 0 })
      })

      tl.to(subItems, {
        y: '0%',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.06,
      })
    }

    const handleBackClick = () => {
      if (isAnimatingRef.current) return
      isAnimatingRef.current = true

      const mainItems = menuMain.querySelectorAll('.overflow-hidden')
      const subItems = menuSub.querySelectorAll('.overflow-hidden')

      const tl = gsap.timeline({
        onComplete: () => { isAnimatingRef.current = false },
      })

      tl.to(subItems, {
        y: '-110%',
        opacity: 0,
        duration: 0.35,
        ease: 'power3.in',
        stagger: 0.05,
      })

      tl.call(() => {
        menuSub.setAttribute('aria-hidden', 'true')
        menuMain.style.pointerEvents = ''
        gsap.set(mainItems, { y: '110%', opacity: 0 })
      })

      tl.to(mainItems, {
        y: '0%',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.06,
      })
    }

    worksTrigger.addEventListener('click', handleWorksClick)
    backTrigger.addEventListener('click', handleBackClick)

    return () => {
      worksTrigger.removeEventListener('click', handleWorksClick)
      backTrigger.removeEventListener('click', handleBackClick)
    }
  }, [menuRef])
}
