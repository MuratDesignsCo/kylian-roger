'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ThemeToggle from './ThemeToggle'
import { useMenuAnimation } from './useMenuAnimation'
import { useLenisContext } from './LenisProvider'

gsap.registerPlugin(ScrollTrigger)

// Mapping clé → { label, href } pour les items du menu principal
const MAIN_MENU_MAP: Record<string, { label: string; href: string; isDropdown?: boolean }> = {
  home: { label: 'HOME', href: '/' },
  works: { label: 'WORKS', href: '', isDropdown: true },
  contact: { label: 'CONTACT', href: '/contact' },
}

// Mapping clé → { label, href } pour les items du dropdown Works
const DROPDOWN_MAP: Record<string, { label: string; href: string }> = {
  photography: { label: 'PHOTOGRAPHY', href: '/photography' },
  'film-motion': { label: 'FILM/MOTION', href: '/film-motion' },
  'art-direction': { label: 'ART DIRECTION', href: '/art-direction' },
}

// Fallback inline SVG logo "KYLIAN ROGER"
function FallbackLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1273 65" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Kylian Roger" className={className}>
      <path d="M111.32 3.97L56.52 30.65V31.1L114.04 60.04V62.75H69.82L26.59 41.05H25.14V62.75H0V1.26H25.14V22.42H26.59L70 1.26H111.33V3.97H111.32Z"/>
      <path d="M173.24 20.52L194.67 1.26H230.12V2.16L185.71 41.95V62.75H160.57V41.95L116.17 2.16V1.26H151.62L173.05 20.52H173.24Z"/>
      <path d="M261.76 42.32H327.51V62.76H236.62V1.26H261.76V42.32Z"/>
      <path d="M360.05 62.76H334.91V1.26H360.05V62.76Z"/>
      <path d="M524.43 29.66V62.76H499.29V1.26H519L584.02 34.36V1.26H609.16V62.76H589.54L524.43 29.66Z"/>
      <path d="M734.29 1.26C762.87 1.26 768.56 11.66 768.56 24.77C768.56 35.44 761.51 42.5 747.76 45.21V45.48C747.76 45.48 750.38 47.02 752.37 48.55L770.64 61.93V62.74H736.18L713.93 46.19H688.16V62.74H663.02V1.26H734.29ZM688.17 21.7V27.94H736.1C741.71 27.94 743.06 26.95 743.06 24.78C743.06 22.97 741.79 21.71 736.1 21.71H688.17V21.7Z"/>
      <path d="M794.39 8.68C803.34 3.61 818.99 0 840.69 0C862.39 0 878.13 3.62 887.17 8.68C895.4 13.29 899.65 19.71 899.65 32.01C899.65 44.31 895.4 50.73 887.17 55.34C878.12 60.4 862.48 64.02 840.69 64.02C818.9 64.02 803.34 60.4 794.39 55.34C785.89 50.73 781.82 44.31 781.82 32.01C781.82 19.71 785.98 13.29 794.39 8.68ZM813.29 40.87C817.99 42.68 829.3 43.58 840.69 43.58C852.08 43.58 863.39 42.67 868.18 40.87C872.25 39.24 874.15 36.71 874.15 32.01C874.15 27.31 872.16 24.78 868.18 23.24C863.39 21.34 852.17 20.44 840.69 20.44C829.21 20.44 817.99 21.34 813.29 23.24C809.31 24.78 807.32 27.31 807.32 32.01C807.32 36.71 809.31 39.24 813.29 40.87Z"/>
      <path d="M968.51 25.23H1023.09V57.24C1012.42 60.31 989.45 64.02 969.19 64.02C945.22 64.02 932.29 62.21 922.43 56.97C914.2 52.63 909.14 44.49 909.14 33.1C909.14 21.71 914.57 13.84 922.16 9.22C931.39 3.61 946.31 0 969.19 0C990.8 0 1011.15 2.53 1020.83 4.16L1018.21 22.34C1001.57 20.44 986.65 19.17 969.19 19.17C954.27 19.17 944.32 20.53 939.62 23.15C935.28 25.59 934.65 29.57 934.65 33.1C934.65 36.26 935.83 40.33 939.99 42.23C944.6 44.31 953.28 44.85 969.2 44.85C978.15 44.85 989.82 44.31 997.96 43.4V40.41H968.52V25.22L968.51 25.23Z"/>
      <path d="M1066.48 40.06V45.4H1145.07V62.76H1041.34V1.26H1145.07V18.62H1066.48V23.96H1140.91V40.06H1066.48Z"/>
      <path d="M1235.85 1.26C1264.43 1.26 1270.12 11.66 1270.12 24.77C1270.12 35.44 1263.07 42.5 1249.32 45.21V45.48C1249.32 45.48 1251.94 47.02 1253.93 48.55L1272.2 61.93V62.74H1237.74L1215.49 46.19H1189.72V62.74H1164.58V1.26H1235.85ZM1189.73 21.7V27.94H1237.66C1243.27 27.94 1244.62 26.95 1244.62 24.78C1244.62 22.97 1243.35 21.71 1237.66 21.71H1189.73V21.7Z"/>
      <path d="M439.39 1.26H420.76L367.04 61.67V62.76H397.79L429.8 25.41H430.53L462.54 62.76H493.29V61.67L439.39 1.26Z"/>
    </svg>
  )
}

interface NavbarProps {
  logoUrl?: string
  menuOrder?: string[]
  dropdownOrder?: string[]
}

export default function Navbar({ logoUrl, menuOrder, dropdownOrder }: NavbarProps) {
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const animInitRef = useRef(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const lenis = useLenisContext()
  useMenuAnimation(menuRef)

  const mainMenu = (menuOrder && menuOrder.length > 0) ? menuOrder : ['home', 'works', 'contact']
  const subMenu = (dropdownOrder && dropdownOrder.length > 0) ? dropdownOrder : ['photography', 'film-motion', 'art-direction']

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      lenis?.stop()
    } else {
      document.body.style.overflow = ''
      lenis?.start()
    }
    return () => {
      document.body.style.overflow = ''
      lenis?.start()
    }
  }, [mobileMenuOpen, lenis])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  // Force reload when clicking a link to the current page
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault()
      window.location.reload()
    }
  }, [pathname])

  // Build flat list of mobile menu links
  const mobileMenuLinks = mainMenu.flatMap(key => {
    const item = MAIN_MENU_MAP[key]
    if (!item) return []
    if (item.isDropdown) {
      return subMenu
        .map(subKey => DROPDOWN_MAP[subKey])
        .filter(Boolean) as { label: string; href: string }[]
    }
    return [{ label: item.label, href: item.href }]
  })

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    let heroNavHandler: (() => void) | null = null
    let nameScrollTrigger: ScrollTrigger | null = null
    let navTl: gsap.core.Timeline | null = null
    const isHomepage = pathname === '/'

    const runAnimation = () => {
      if (animInitRef.current) return
      animInitRef.current = true

      const menuItems = nav.querySelectorAll('.nav-menu-main .nav-home_menu-item')
      const toggle = nav.querySelector('.nav-home_toggle')
      const nameEls = nav.querySelectorAll('.nav-home_name-desktop, .nav-home_name-tablet-mobile')

      navTl = gsap.timeline()

      // Menu items reveal
      navTl.fromTo(
        menuItems,
        { y: '100%', visibility: 'hidden' },
        {
          y: '0%',
          visibility: 'visible',
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
        }
      )

      // Toggle reveal (after menu items)
      if (toggle) {
        navTl.fromTo(
          toggle,
          { opacity: 0, visibility: 'hidden' },
          {
            opacity: 1,
            visibility: 'visible',
            duration: 0.6,
            ease: 'power3.out',
          }
        )
      }

      if (isHomepage) {
        // On homepage, name appears only after scrolling past the hero section
        const heroPinWrap = document.querySelector('.section_home_hero-pin-wrapper')
        if (heroPinWrap) {
          gsap.set(nameEls, { y: '100%', visibility: 'hidden' })
          nameScrollTrigger = ScrollTrigger.create({
            trigger: heroPinWrap,
            start: 'bottom top',
            onEnter: () => {
              gsap.to(nameEls, {
                y: '0%',
                visibility: 'visible',
                duration: 0.5,
                ease: 'power3.out',
              })
            },
            onLeaveBack: () => {
              gsap.to(nameEls, {
                y: '100%',
                visibility: 'hidden',
                duration: 0.3,
                ease: 'power3.in',
              })
            },
          })
        }
      } else {
        // On other pages, name appears with the menu
        navTl.fromTo(
          nameEls,
          { y: '100%', visibility: 'hidden' },
          {
            y: '0%',
            visibility: 'visible',
            duration: 0.8,
            ease: 'power3.out',
          },
          0
        )
      }
    }

    if (isHomepage) {
      // Wait for hero animation to signal readiness
      const w = window as unknown as Record<string, unknown>
      if (w.__heroNavReady) {
        runAnimation()
      } else {
        heroNavHandler = () => runAnimation()
        window.addEventListener('heroNavReady', heroNavHandler)
      }
    } else {
      // On non-homepage pages, animate immediately
      runAnimation()
    }

    return () => {
      animInitRef.current = false
      if (heroNavHandler) {
        window.removeEventListener('heroNavReady', heroNavHandler)
      }
      if (navTl) {
        navTl.kill()
      }
      if (nameScrollTrigger) {
        nameScrollTrigger.kill()
      }
    }
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const renderLogo = (cssClass: string) => {
    if (logoUrl) {
      return <img src={logoUrl} alt="Kylian Roger" className={`nav-home_name-svg text-color-alternate ${cssClass === 'desktop' ? 'nav-logo-img' : 'nav-logo-img-mobile'}`} />
    }
    return <FallbackLogo className="nav-home_name-svg text-color-alternate" />
  }

  const renderMainMenuItem = (key: string) => {
    const item = MAIN_MENU_MAP[key]
    if (!item) return null

    if (item.isDropdown) {
      return (
        <div key={key} className="overflow-hidden">
          <button
            type="button"
            className="nav-home_menu-item nav-works-trigger inline-block"
          >
            <span className="text-color-alternate">{item.label}</span>
          </button>
        </div>
      )
    }

    return (
      <div key={key} className="overflow-hidden">
        <Link
          href={item.href}
          className="nav-home_menu-item inline-block"
          aria-current={isActive(item.href) ? 'page' : undefined}
          onClick={(e) => handleNavClick(e, item.href)}
        >
          <span className="text-color-alternate">{item.label}</span>
        </Link>
      </div>
    )
  }

  const renderDropdownItem = (key: string) => {
    const item = DROPDOWN_MAP[key]
    if (!item) return null

    return (
      <div key={key} className="overflow-hidden">
        <Link
          href={item.href}
          className="nav-home_menu-item inline-block"
          aria-current={isActive(item.href) ? 'page' : undefined}
          onClick={(e) => handleNavClick(e, item.href)}
        >
          <span className="text-color-alternate">{item.label}</span>
        </Link>
      </div>
    )
  }

  return (
    <header ref={navRef}>
      <nav className={`nav-home_component ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Navigation principale">
        <div className="padding-global">
          <div className="nav-home_wrapper">
            <div className="overflow-hidden hide-tablet">
              <a href="/" className="nav-home_name-desktop hide-tablet inline-block" onClick={(e) => handleNavClick(e, '/')}>
                {renderLogo('desktop')}
              </a>
            </div>
            <div className="overflow-hidden hide-just-desktop">
              <a href="/" className="nav-home_name-tablet-mobile inline-block" onClick={(e) => handleNavClick(e, '/')}>
                {renderLogo('mobile')}
              </a>
            </div>
            {/* Desktop menu */}
            <div className="nav-home_menu nav-home_menu--desktop" ref={menuRef}>
              <div className="nav-menu-main">
                {mainMenu.map(renderMainMenuItem)}
              </div>
              <div className="nav-menu-sub" aria-hidden="true">
                <div className="overflow-hidden">
                  <button
                    type="button"
                    className="nav-home_menu-item nav-back-trigger inline-block"
                  >
                    <span className="text-color-alternate">&larr; BACK</span>
                  </button>
                </div>
                {subMenu.map(renderDropdownItem)}
              </div>
              <ThemeToggle />
            </div>
            {/* Mobile hamburger */}
            <button
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'is-open' : ''}`}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="mobile-menu-nav" aria-label="Menu mobile">
          {mobileMenuLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-menu-link"
              aria-current={isActive(link.href) ? 'page' : undefined}
              onClick={(e) => {
                closeMobileMenu()
                handleNavClick(e, link.href)
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-footer">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
