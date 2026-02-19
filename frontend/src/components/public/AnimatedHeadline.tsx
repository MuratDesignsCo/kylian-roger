'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface AnimatedHeadlineProps {
  children: React.ReactNode
  className?: string
}

export default function AnimatedHeadline({ children, className }: AnimatedHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.fromTo(el, { y: '100%' }, {
        y: '0%',
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  return (
    <h1 ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </h1>
  )
}
