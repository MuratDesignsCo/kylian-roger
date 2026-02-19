'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenisContext } from '@/components/public/LenisProvider'
import type { Project } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface FilmCarouselProps {
  projects: Project[]
}

const playSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"></polygon></svg>'
const pauseSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
const volumeSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"></polygon><path d="M15.54 8.46a5 5 0 010 7.07"></path><path d="M19.07 4.93a10 10 0 010 14.14"></path></svg>'
const mutedSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>'

function formatTime(s: number) {
  if (isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return m + ':' + (sec < 10 ? '0' : '') + sec
}

export default function FilmCarousel({ projects }: FilmCarouselProps) {
  const lenis = useLenisContext()
  const galleryRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const fsVideoRef = useRef<HTMLVideoElement>(null)
  const backTopRef = useRef<HTMLButtonElement>(null)
  const stateRef = useRef({
    currentIndex: 0,
    isAnimating: false,
    isFullscreen: false,
    galleryActive: false,
    wheelAccum: 0,
    wheelTimer: null as ReturnType<typeof setTimeout> | null,
    touchStartY: null as number | null,
    sourceVideo: null as HTMLVideoElement | null,
    globalVolume: 1,
    globalMuted: false,
  })

  useEffect(() => {
    const gallery = galleryRef.current
    if (!gallery || !projects.length) return

    const items = Array.from(gallery.querySelectorAll<HTMLElement>('.film-gallery_item'))
    if (!items.length) return

    const state = stateRef.current
    const backTopBtn = backTopRef.current

    const SLIDE_DURATION = 0.7
    const SLIDE_EASE = 'power3.inOut'
    const CONTENT_FADE_DURATION = 0.5
    const BG_ZOOM_DURATION = 1.0
    const WHEEL_COOLDOWN = 60
    const TOUCH_THRESHOLD = 30

    // Layout setup
    gsap.set(gallery, {
      position: 'relative',
      overflow: 'hidden',
      height: '100vh',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
    })

    items.forEach((item, i) => {
      gsap.set(item, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        yPercent: i === 0 ? 0 : 100,
        zIndex: i === 0 ? 2 : 1,
      })
      const content = item.querySelector('.film-gallery_content')
      const bgImg = item.querySelector('.film-gallery_bg-img') || item.querySelector('.film-gallery_split-photo-img')
      if (content) gsap.set(content, { opacity: 0, y: 50 })
      if (bgImg) gsap.set(bgImg, { scale: 1.1 })
    })

    // Animate first panel
    requestAnimationFrame(() => {
      const firstContent = items[0].querySelector('.film-gallery_content')
      const firstBg = items[0].querySelector('.film-gallery_bg-img') || items[0].querySelector('.film-gallery_split-photo-img')
      if (firstContent) {
        gsap.to(firstContent, {
          opacity: 1, y: 0,
          duration: CONTENT_FADE_DURATION,
          ease: 'power3.out',
          delay: 0.4,
        })
      }
      if (firstBg) {
        gsap.to(firstBg, {
          scale: 1,
          duration: BG_ZOOM_DURATION,
          ease: 'power2.out',
          delay: 0.2,
        })
      }
    })

    // Panel transition
    function goToPanel(newIndex: number, fast = false) {
      if (state.isAnimating) return
      if (newIndex < 0 || newIndex >= items.length) return
      if (newIndex === state.currentIndex) return

      state.isAnimating = true
      const direction = newIndex > state.currentIndex ? 1 : -1
      const oldItem = items[state.currentIndex]
      const newItem = items[newIndex]

      const prevVideo = oldItem.querySelector<HTMLVideoElement>('.film-gallery_video')
      if (prevVideo && !prevVideo.paused) prevVideo.pause()

      const slideDur = fast ? 0.45 : SLIDE_DURATION
      const contentDur = fast ? 0.3 : CONTENT_FADE_DURATION
      const bgDur = fast ? 0.6 : BG_ZOOM_DURATION

      gsap.set(newItem, { yPercent: direction * 100, zIndex: 3 })
      const newContent = newItem.querySelector('.film-gallery_content')
      const newBg = newItem.querySelector('.film-gallery_bg-img') || newItem.querySelector('.film-gallery_split-photo-img')
      if (newContent) gsap.set(newContent, { opacity: 0, y: 50 })
      if (newBg) gsap.set(newBg, { scale: 1.1 })

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(oldItem, { zIndex: 1 })
          gsap.set(newItem, { zIndex: 2 })
          const oldContent = oldItem.querySelector('.film-gallery_content')
          if (oldContent) gsap.set(oldContent, { opacity: 0 })
          state.currentIndex = newIndex
          state.isAnimating = false
          updateBackTopBtn()
        },
      })

      tl.to(oldItem, { yPercent: -direction * 100, duration: slideDur, ease: SLIDE_EASE }, 0)
      tl.to(newItem, { yPercent: 0, duration: slideDur, ease: SLIDE_EASE }, 0)
      if (newContent) {
        tl.to(newContent, { opacity: 1, y: 0, duration: contentDur, ease: 'power3.out' }, slideDur * 0.35)
      }
      if (newBg) {
        tl.to(newBg, { scale: 1, duration: bgDur, ease: 'power2.out' }, 0.1)
      }
    }

    // ScrollTrigger pin
    const st = ScrollTrigger.create({
      trigger: gallery,
      start: 'top top',
      end: () => '+=' + items.length * window.innerHeight,
      pin: true,
      pinSpacing: true,
      onEnter: () => { state.galleryActive = true; lenis?.stop() },
      onEnterBack: () => { state.galleryActive = true; lenis?.stop() },
      onLeave: () => { state.galleryActive = false; if (!state.isFullscreen) lenis?.start(); updateBackTopBtn() },
      onLeaveBack: () => { state.galleryActive = false; if (!state.isFullscreen) lenis?.start(); updateBackTopBtn() },
    })

    // Wheel handler
    const onWheel = (e: WheelEvent) => {
      if (!state.galleryActive || state.isAnimating || state.isFullscreen) return
      if (state.currentIndex === 0 && e.deltaY < 0) {
        // At first panel scrolling up: jump to pin start so ScrollTrigger can leave
        e.preventDefault()
        st.scroll(st.start)
        return
      }
      if (state.currentIndex === items.length - 1 && e.deltaY > 0) return
      e.preventDefault()
      state.wheelAccum += e.deltaY
      if (state.wheelTimer) clearTimeout(state.wheelTimer)
      state.wheelTimer = setTimeout(() => {
        if (Math.abs(state.wheelAccum) > 5) {
          const dir = state.wheelAccum > 0 ? 1 : -1
          goToPanel(state.currentIndex + dir)
        }
        state.wheelAccum = 0
      }, WHEEL_COOLDOWN)
    }
    window.addEventListener('wheel', onWheel, { passive: false })

    // Touch handlers
    const onTouchStart = (e: TouchEvent) => {
      if (!state.galleryActive || state.isFullscreen) return
      state.touchStartY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!state.galleryActive || state.isAnimating || state.isFullscreen || state.touchStartY === null) return
      const dy = state.touchStartY - e.touches[0].clientY
      if (state.currentIndex === 0 && dy < 0) {
        e.preventDefault()
        st.scroll(st.start)
        state.touchStartY = null
        return
      }
      if (state.currentIndex === items.length - 1 && dy > 0) return
      if (Math.abs(dy) > TOUCH_THRESHOLD) {
        e.preventDefault()
        const dir = dy > 0 ? 1 : -1
        state.touchStartY = null
        goToPanel(state.currentIndex + dir)
      }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })

    // Back to top
    function updateBackTopBtn() {
      if (!backTopBtn) return
      if (state.currentIndex > 0 && state.galleryActive) {
        backTopBtn.classList.add('is-visible')
        backTopBtn.setAttribute('aria-hidden', 'false')
        gsap.to(backTopBtn, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      } else {
        gsap.to(backTopBtn, {
          opacity: 0, duration: 0.3, ease: 'power2.in',
          onComplete: () => {
            backTopBtn.classList.remove('is-visible')
            backTopBtn.setAttribute('aria-hidden', 'true')
          },
        })
      }
    }

    const onBackTop = () => {
      if (state.isAnimating || state.isFullscreen) return
      goToPanel(0, true)
    }
    backTopBtn?.addEventListener('click', onBackTop)

    // Volume helpers
    function updateMuteBtn(btn: HTMLButtonElement | null, muted: boolean) {
      if (!btn) return
      btn.innerHTML = muted ? mutedSvg : volumeSvg
      btn.setAttribute('aria-label', muted ? 'Activer le son' : 'Muter')
    }

    function syncAllInlineVolume() {
      items.forEach((it) => {
        const v = it.querySelector<HTMLVideoElement>('.film-gallery_video')
        const mb = it.querySelector<HTMLButtonElement>('.film-gallery_mute-btn')
        const vs = it.querySelector<HTMLInputElement>('.film-gallery_volume-slider')
        if (v) { v.volume = state.globalVolume; v.muted = state.globalMuted }
        if (vs) vs.value = String(state.globalVolume)
        updateMuteBtn(mb, state.globalMuted)
      })
    }

    // Video controls for each item
    items.forEach((item) => {
      const video = item.querySelector<HTMLVideoElement>('.film-gallery_video')
      const playBtn = item.querySelector<HTMLButtonElement>('.film-gallery_play-btn')
      const progressBar = item.querySelector<HTMLElement>('.film-gallery_progress-bar')
      const progressFill = item.querySelector<HTMLElement>('.film-gallery_progress-fill')
      const timeDisplay = item.querySelector<HTMLElement>('.film-gallery_time')
      const fsBtn = item.querySelector<HTMLButtonElement>('.film-gallery_fullscreen-btn')
      const wrapper = item.querySelector<HTMLElement>('.film-gallery_player-wrapper')
      const muteBtn = item.querySelector<HTMLButtonElement>('.film-gallery_mute-btn')
      const volumeSlider = item.querySelector<HTMLInputElement>('.film-gallery_volume-slider')
      if (!video) return

      // Apply global volume state
      video.volume = state.globalVolume
      video.muted = state.globalMuted
      if (volumeSlider) volumeSlider.value = String(state.globalVolume)
      updateMuteBtn(muteBtn, state.globalMuted)

      const onPlay = () => { if (playBtn) playBtn.innerHTML = pauseSvg }
      const onPause = () => { if (playBtn) playBtn.innerHTML = playSvg }
      const onTimeUpdate = () => {
        if (!video.duration) return
        if (progressFill) progressFill.style.width = (video.currentTime / video.duration) * 100 + '%'
        if (timeDisplay) timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration)
      }
      const onMeta = () => {
        if (timeDisplay) timeDisplay.textContent = '0:00 / ' + formatTime(video.duration)
      }

      video.addEventListener('play', onPlay)
      video.addEventListener('pause', onPause)
      video.addEventListener('timeupdate', onTimeUpdate)
      video.addEventListener('loadedmetadata', onMeta)

      // All clicks on inline player open fullscreen
      const openFs = (e: Event) => { e.stopPropagation(); openFullscreen(video) }
      playBtn?.addEventListener('click', openFs)
      progressBar?.addEventListener('click', openFs)
      muteBtn?.addEventListener('click', openFs)
      if (volumeSlider) {
        volumeSlider.addEventListener('click', openFs)
        volumeSlider.addEventListener('input', (e) => e.stopPropagation())
      }
      video.addEventListener('click', openFs)
      fsBtn?.addEventListener('click', openFs)
      wrapper?.addEventListener('click', () => { openFullscreen(video) })
    })

    // Fullscreen overlay
    const overlay = overlayRef.current
    const fsVideo = fsVideoRef.current

    function openFullscreen(srcVideo: HTMLVideoElement) {
      if (!overlay || !fsVideo) return
      state.isFullscreen = true
      state.sourceVideo = srcVideo
      if (!srcVideo.paused) srcVideo.pause()

      const source = srcVideo.querySelector('source')
      fsVideo.src = source?.src || srcVideo.src

      const savedTime = srcVideo.currentTime
      const onReady = () => {
        fsVideo.currentTime = savedTime
        fsVideo.removeEventListener('loadeddata', onReady)
      }
      fsVideo.addEventListener('loadeddata', onReady)

      overlay.classList.add('is-active')
      overlay.setAttribute('aria-hidden', 'false')
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })

      // Sync volume state
      fsVideo.volume = state.globalVolume
      fsVideo.muted = state.globalMuted
      const fsMuteBtn = overlay.querySelector<HTMLButtonElement>('.film-gallery_fs-mute-btn')
      const fsVolSlider = overlay.querySelector<HTMLInputElement>('.film-gallery_fs-volume-slider')
      updateMuteBtn(fsMuteBtn, state.globalMuted)
      if (fsVolSlider) fsVolSlider.value = String(state.globalVolume)

      lenis?.stop()
      fsVideo.play().catch(() => {})
    }

    function closeFullscreen() {
      if (!overlay || !fsVideo || !overlay.classList.contains('is-active')) return
      if (state.sourceVideo && fsVideo.currentTime) {
        state.sourceVideo.currentTime = fsVideo.currentTime
      }
      fsVideo.pause()
      gsap.to(overlay, {
        opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          overlay.classList.remove('is-active')
          overlay.setAttribute('aria-hidden', 'true')
          fsVideo.removeAttribute('src')
          fsVideo.load()
          state.isFullscreen = false
        },
      })
    }

    const closeBtn = overlay?.querySelector('.film-gallery_close-btn')
    closeBtn?.addEventListener('click', closeFullscreen)

    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') closeFullscreen() }
    document.addEventListener('keydown', onEscape)

    // FS video controls
    const fsPlayBtn = overlay?.querySelector<HTMLButtonElement>('.film-gallery_fs-play-btn')
    const fsProgressBar = overlay?.querySelector<HTMLElement>('.film-gallery_fs-progress-bar')
    const fsProgressFill = overlay?.querySelector<HTMLElement>('.film-gallery_fs-progress-fill')
    const fsTimeDisplay = overlay?.querySelector<HTMLElement>('.film-gallery_fs-time')

    fsPlayBtn?.addEventListener('click', (e) => { e.stopPropagation(); fsVideo?.paused ? fsVideo?.play() : fsVideo?.pause() })
    if (fsVideo) {
      fsVideo.addEventListener('play', () => { if (fsPlayBtn) fsPlayBtn.innerHTML = pauseSvg })
      fsVideo.addEventListener('pause', () => { if (fsPlayBtn) fsPlayBtn.innerHTML = playSvg })
      fsVideo.addEventListener('timeupdate', () => {
        if (!fsVideo.duration || !fsProgressFill) return
        fsProgressFill.style.width = (fsVideo.currentTime / fsVideo.duration) * 100 + '%'
        if (fsTimeDisplay) fsTimeDisplay.textContent = formatTime(fsVideo.currentTime) + ' / ' + formatTime(fsVideo.duration)
      })
      fsVideo.addEventListener('loadedmetadata', () => {
        if (fsTimeDisplay) fsTimeDisplay.textContent = '0:00 / ' + formatTime(fsVideo.duration)
      })
      fsVideo.addEventListener('click', () => { fsVideo.paused ? fsVideo.play() : fsVideo.pause() })
    }
    fsProgressBar?.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!fsVideo) return
      const rect = fsProgressBar.getBoundingClientRect()
      fsVideo.currentTime = ((e.clientX - rect.left) / rect.width) * fsVideo.duration
    })

    // FS volume controls
    const fsMuteBtn = overlay?.querySelector<HTMLButtonElement>('.film-gallery_fs-mute-btn')
    const fsVolumeSlider = overlay?.querySelector<HTMLInputElement>('.film-gallery_fs-volume-slider')

    updateMuteBtn(fsMuteBtn ?? null, state.globalMuted)
    if (fsVolumeSlider) fsVolumeSlider.value = String(state.globalVolume)

    fsMuteBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      state.globalMuted = !state.globalMuted
      if (fsVideo) fsVideo.muted = state.globalMuted
      updateMuteBtn(fsMuteBtn, state.globalMuted)
      if (fsVolumeSlider) fsVolumeSlider.value = String(state.globalVolume)
      syncAllInlineVolume()
    })

    if (fsVolumeSlider) {
      fsVolumeSlider.addEventListener('input', (e) => {
        e.stopPropagation()
        state.globalVolume = parseFloat(fsVolumeSlider.value)
        if (fsVideo) fsVideo.volume = state.globalVolume
        if (state.globalVolume > 0 && state.globalMuted) {
          state.globalMuted = false
          if (fsVideo) fsVideo.muted = false
        }
        if (state.globalVolume === 0) {
          state.globalMuted = true
          if (fsVideo) fsVideo.muted = true
        }
        updateMuteBtn(fsMuteBtn ?? null, state.globalMuted)
        syncAllInlineVolume()
      })
      fsVolumeSlider.addEventListener('click', (e) => e.stopPropagation())
    }

    return () => {
      st.kill()
      ScrollTrigger.getAll().filter((t) => {
        const el = t.trigger
        return el && gallery.contains(el as Node)
      }).forEach((t) => t.kill())
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('keydown', onEscape)
      backTopBtn?.removeEventListener('click', onBackTop)
    }
  }, [projects, lenis])

  if (!projects.length) return null

  return (
    <>
      <section className="film-gallery" ref={galleryRef}>
        {projects.map((project, i) => {
          const isVertical = project.film_layout === 'vertical'
          return (
            <div
              key={project.id}
              className={`film-gallery_item${isVertical ? ' film-gallery_item--vertical' : ''}`}
              data-index={i}
            >
              {isVertical ? (
                /* ── Vertical layout: photo left + vertical video right ── */
                <>
                  <div className="film-gallery_split">
                    <div className="film-gallery_split-photo">
                      <img
                        src={project.film_bg_image_url || project.cover_image_url || '/images/blank.jpg'}
                        loading="lazy"
                        alt={project.cover_image_alt || ''}
                        className="film-gallery_split-photo-img"
                      />
                    </div>
                    <div className="film-gallery_split-video">
                      <div className="film-gallery_split-video-bg">
                        <img
                          src={project.film_bg_image_url || project.cover_image_url || '/images/blank.jpg'}
                          loading="lazy"
                          alt=""
                          className="film-gallery_split-video-bg-img"
                        />
                        <div className="film-gallery_split-video-bg-overlay"></div>
                      </div>
                      <div className="film-gallery_content">
                        <div className="film-gallery_player-wrapper film-gallery_player-wrapper--vertical">
                          <video className="film-gallery_video" preload="metadata" playsInline>
                            {project.film_video_url && (
                              <source src={project.film_video_url} type="video/mp4" />
                            )}
                          </video>
                          <div className="film-gallery_video-controls">
                            <button className="film-gallery_play-btn" aria-label="Play">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"></polygon></svg>
                            </button>
                            <div className="film-gallery_progress-bar">
                              <div className="film-gallery_progress-fill"></div>
                            </div>
                            <span className="film-gallery_time">0:00 / 0:00</span>
                            <button className="film-gallery_mute-btn" aria-label="Muter">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"></polygon><path d="M15.54 8.46a5 5 0 010 7.07"></path><path d="M19.07 4.93a10 10 0 010 14.14"></path></svg>
                            </button>
                            <input type="range" className="film-gallery_volume-slider" min={0} max={1} step={0.01} defaultValue={1} aria-label="Volume" />
                            <button className="film-gallery_fullscreen-btn" aria-label="Plein écran">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"></path></svg>
                            </button>
                          </div>
                        </div>
                        <div className="film-gallery_info">
                          <span className="film-gallery_title">{project.title}</span>
                          <span className="film-gallery_subtitle">{project.film_subtitle || `${project.year}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ── Landscape layout (default) ── */
                <>
                  <div className="film-gallery_bg">
                    <img
                      src={project.film_bg_image_url || project.cover_image_url || '/images/blank.jpg'}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      alt={project.cover_image_alt || ''}
                      className="film-gallery_bg-img"
                    />
                    <div className="film-gallery_bg-overlay"></div>
                  </div>
                  <div className="film-gallery_content">
                    <div className="film-gallery_player-wrapper">
                      <video className="film-gallery_video" preload="metadata" playsInline>
                        {project.film_video_url && (
                          <source src={project.film_video_url} type="video/mp4" />
                        )}
                      </video>
                      <div className="film-gallery_video-controls">
                        <button className="film-gallery_play-btn" aria-label="Play">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"></polygon></svg>
                        </button>
                        <div className="film-gallery_progress-bar">
                          <div className="film-gallery_progress-fill"></div>
                        </div>
                        <span className="film-gallery_time">0:00 / 0:00</span>
                        <button className="film-gallery_mute-btn" aria-label="Muter">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"></polygon><path d="M15.54 8.46a5 5 0 010 7.07"></path><path d="M19.07 4.93a10 10 0 010 14.14"></path></svg>
                        </button>
                        <input type="range" className="film-gallery_volume-slider" min={0} max={1} step={0.01} defaultValue={1} aria-label="Volume" />
                        <button className="film-gallery_fullscreen-btn" aria-label="Plein écran">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"></path></svg>
                        </button>
                      </div>
                    </div>
                    <div className="film-gallery_info">
                      <span className="film-gallery_title">{project.title}</span>
                      <span className="film-gallery_subtitle">{project.film_subtitle || `${project.year}`}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </section>

      <button className="film-gallery_back-top" ref={backTopRef} aria-label="Retour en haut" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
      </button>

      <div className="film-gallery_fullscreen-overlay" ref={overlayRef} aria-hidden="true">
        <video className="film-gallery_fullscreen-video" ref={fsVideoRef} playsInline></video>
        <button className="film-gallery_close-btn" aria-label="Fermer">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div className="film-gallery_fullscreen-controls">
          <button className="film-gallery_fs-play-btn" aria-label="Play">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"></polygon></svg>
          </button>
          <div className="film-gallery_fs-progress-bar">
            <div className="film-gallery_fs-progress-fill"></div>
          </div>
          <span className="film-gallery_fs-time">0:00 / 0:00</span>
          <button className="film-gallery_fs-mute-btn" aria-label="Muter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"></polygon><path d="M15.54 8.46a5 5 0 010 7.07"></path><path d="M19.07 4.93a10 10 0 010 14.14"></path></svg>
          </button>
          <input type="range" className="film-gallery_fs-volume-slider" min={0} max={1} step={0.01} defaultValue={1} aria-label="Volume" />
        </div>
      </div>
    </>
  )
}
