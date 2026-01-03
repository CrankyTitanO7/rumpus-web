'use client'

import { useEffect } from 'react'

export default function ScrollFallback() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof CSS === 'undefined') return

    // If the browser supports animation-timeline, skip the fallback
    const supportsTimeline = CSS.supports && CSS.supports('animation-timeline', '--card')
    if (supportsTimeline) return

    // Mark the document to activate CSS fallback rules (safer than @supports not)
    document.documentElement.classList.add('timeline-fallback')
    console.info('ScrollFallback: timeline not supported — using JS fallback')

    const observed = new WeakSet<HTMLElement>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) {
            el.classList.add('in-view')
          } else {
            el.classList.remove('in-view')
          }
        })
      },
      { root: null, rootMargin: '0px 0px -20% 0px', threshold: [0, 0.2, 0.5] }
    )

    function observeAll() {
      const items = Array.from(document.querySelectorAll('.c-rumpus__item')) as HTMLElement[]
      items.forEach((item) => {
        if (!observed.has(item)) {
          observer.observe(item)
          observed.add(item)

          // initial state
          const rect = item.getBoundingClientRect()
          if (rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.1) {
            item.classList.add('in-view')
          } else {
            item.classList.remove('in-view')
          }
        }
      })
    }

    observeAll()

    // Fade calculation: as the next card scrolls up near the top, fade the previous card proportionally
    let rafId: number | null = null

    function updateFades() {
      const items = Array.from(document.querySelectorAll('.c-rumpus__item')) as HTMLElement[]

      if (!items.length) return

      // Determine the sticky top offset from computed style (fallback to 50)
      const computedTop = getComputedStyle(items[0]).getPropertyValue('top')
      const stickyOffset = computedTop ? parseInt(computedTop, 10) || 50 : 50

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const next = items[i + 1]
        if (!next) {
          // reset
          item.style.setProperty('--fade', '0')
          continue
        }

        const nextRect = next.getBoundingClientRect()
        // Start fading when the next card gets within `threshold` pixels above the sticky top
        // Use a fraction of next card height so it scales with content
        const threshold = Math.max(120, Math.min(360, next.offsetHeight * 0.6))

        const distanceFromStickyTop = nextRect.top - stickyOffset
        // progress 0 -> no fade, 1 -> fully faded when next reaches sticky top (and beyond)
        const raw = (threshold - distanceFromStickyTop) / threshold
        const progress = Math.max(0, Math.min(1, raw))

        // apply to the previous (current) card
        item.style.setProperty('--fade', String(progress))

        // Debug: log first two items' progress so it's easy to validate in Firefox console
        if (i < 2) {
          // eslint-disable-next-line no-console
          console.debug(`ScrollFallback fade for index ${i}: ${progress.toFixed(3)} (threshold ${threshold}, nextTop ${nextRect.top}, sticky ${stickyOffset})`)
        }
      }
      rafId = null
    }

    function scheduleUpdate() {
      if (rafId == null) rafId = requestAnimationFrame(updateFades)
    }

    // Initial update and observe scroll for continuous updates
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    // Watch for dynamically added/removed items (e.g., after client rendering)
    const listContainer = document.querySelector('.c-rumpus__list') || document.querySelector('.c-rumpus')
    let mo: MutationObserver | null = null
    if (listContainer) {
      mo = new MutationObserver(() => {
        observeAll()
        scheduleUpdate()
      })
      mo.observe(listContainer, { childList: true, subtree: true })
    }

    // Also re-run on orientation change
    const onRerun = () => {
      observeAll()
      scheduleUpdate()
    }
    window.addEventListener('orientationchange', onRerun)

    return () => {
      observer.disconnect()
      if (mo) mo.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('orientationchange', onRerun)
      if (rafId != null) cancelAnimationFrame(rafId)
      document.documentElement.classList.remove('timeline-fallback')
    }
  }, [])

  return null
}
