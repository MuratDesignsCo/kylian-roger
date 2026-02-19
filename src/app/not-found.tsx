'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'

export default function NotFound() {
  useEffect(() => {
    gsap.fromTo(
      '.page-404_headline',
      { visibility: 'hidden', opacity: 0, y: '30%' },
      { visibility: 'visible', opacity: 1, y: '0%', duration: 0.8, ease: 'power3.out', delay: 0.3 }
    )
    gsap.fromTo(
      '.page-404_subheadline',
      { visibility: 'hidden', opacity: 0, y: '30%' },
      { visibility: 'visible', opacity: 1, y: '0%', duration: 0.8, ease: 'power3.out', delay: 0.5 }
    )
    gsap.fromTo(
      '.page-404_button-wrapper',
      { visibility: 'hidden', opacity: 0, y: '30%' },
      { visibility: 'visible', opacity: 1, y: '0%', duration: 0.8, ease: 'power3.out', delay: 0.7 }
    )
  }, [])

  return (
    <main className="main-wrapper">
      <section className="page-404">
        <div className="page-404_image-overlay-wrapper">
          <div className="page-404_image-background">
            <img
              src="/images/Sunlit-Architectural-Scene_1Sunlit-Architectural-Scene.webp"
              loading="lazy"
              alt=""
              className="page-404_image"
            />
          </div>
          <div className="page-404_image-overlay"></div>
        </div>
        <div className="page-404_content-text">
          <div className="padding-global">
            <div className="page-404_heading">
              <div className="page-404_headline">
                <h1 className="text-color-alternate text-align-center">
                  404 PAGE <br />
                  NOT FOUND
                </h1>
              </div>
              <div className="page-404_subheadline">
                <p className="text-size-medium text-color-alternate text-align-center">
                  The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back to the portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="page-404_cta-home">
          <div className="padding-global">
            <div className="page-404_button-wrapper">
              <Link href="/" className="button is-secondary inline-block">
                <div className="button_text-wrapper">
                  <div className="button_text">BACK TO HOME</div>
                  <div className="button_text is-absolute">BACK TO HOME</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
