import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Restores scroll position on navigation.
 *
 * A new route starts at the top; an in-page hash target is scrolled into view
 * instead. Both respect `prefers-reduced-motion`.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth'

    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        target.scrollIntoView({ behavior, block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}
