'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePathname } from 'next/navigation'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext<Lenis | null>(null)

export function useLenisContext() {
  return useContext(LenisContext)
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })

    lenisRef.current = instance
    setLenis(instance)

    instance.on('scroll', ScrollTrigger.update)
    const tickerCallback = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tickerCallback)
      instance.destroy()
      lenisRef.current = null
    }
  }, [])

  // Refresh ScrollTrigger on route change
  useEffect(() => {
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)
    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  )
}
