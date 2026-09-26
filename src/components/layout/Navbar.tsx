import { useCallback, useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { Logo } from '@/components/brand/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { contact, navigation, site } from '@/config/site'
import { cn } from '@/lib/cn'

/** Sticky translucent bar that solidifies once the page is scrolled. */
function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group inline-flex items-center rounded-sm"
      aria-label={`${site.name} — home`}
    >
      <Logo
        className="transition-opacity duration-300 group-hover:opacity-80"
      />
    </Link>
  )
}

function DesktopNavLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'group relative inline-flex h-9 items-center rounded-full px-3.5 text-sm transition-colors duration-300',
          isActive ? 'text-bone-50' : 'text-bone-400 hover:text-bone-100',
        )
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-x-3.5 -bottom-0.5 h-px origin-center bg-electric-400 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]',
              isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
            )}
          />
        </>
      )}
    </NavLink>
  )
}

function MobilePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const prefersReducedMotion = useReducedMotion()
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  // Move focus into the panel so keyboard users are not stranded behind it.
  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => firstLinkRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-panel"
          id="mobile-menu"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 top-0 z-50 origin-top border-b border-line bg-ink-950/95 backdrop-blur-xl lg:hidden"
        >
          <Container className="pb-10 pt-[5.25rem]">
            <nav aria-label="Mobile">
              <ul className="flex flex-col">
                {navigation.map((item, index) => (
                  <motion.li
                    key={item.to}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.045, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-line/70 last:border-b-0"
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      ref={index === 0 ? firstLinkRef : undefined}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between py-4 text-2xl font-medium tracking-[-0.02em] transition-colors duration-300',
                          isActive ? 'text-bone-50' : 'text-bone-300 hover:text-bone-50',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className={cn(
                                'label-xs w-6 transition-colors duration-300',
                                isActive ? 'text-electric-400' : 'text-bone-600',
                              )}
                            >
                              0{index + 1}
                            </span>
                            {item.label}
                          </span>
                          <ArrowUpRight
                            aria-hidden="true"
                            className={cn(
                              'size-4 transition-all duration-300',
                              isActive
                                ? 'text-electric-400'
                                : 'text-bone-600 group-hover:text-bone-300',
                            )}
                          />
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 flex flex-col gap-3">
              <ButtonLink to="/contact" onClick={onClose} variant="primary" size="lg" block>
                Start a Project
              </ButtonLink>
              <a
                href={`mailto:${contact.email}`}
                className="rounded-full border border-line-strong px-6 py-3.5 text-center text-sm text-bone-300 transition-colors duration-300 hover:border-bone-500/45 hover:text-bone-100"
              >
                {contact.email}
              </a>
            </div>
          </Container>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled()
  const location = useLocation()
  const toggleRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // A route change always dismisses the panel — including back/forward
  // navigation. Adjusted during render rather than in an effect so the panel is
  // never visible on the new route.
  const [menuPath, setMenuPath] = useState(location.pathname)
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname)
    if (menuOpen) setMenuOpen(false)
  }

  // Lock the page behind the open panel.
  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  // Escape closes and returns focus to the trigger.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-full bg-bone-50 px-4 py-2 text-sm font-medium text-ink-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          scrolled || menuOpen
            ? 'border-b border-line bg-ink-950/80 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <Container width="wide">
          <div className="flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
            <Wordmark />

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <DesktopNavLink to={item.to} label={item.label} />
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <ButtonLink
                to="/contact"
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Start a Project
              </ButtonLink>

              <button
                ref={toggleRef}
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="inline-flex size-10 items-center justify-center rounded-full border border-line-strong text-bone-200 transition-colors duration-300 hover:bg-white/[0.06] hover:text-bone-50 lg:hidden"
              >
                {menuOpen ? (
                  <X aria-hidden="true" className="size-[1.125rem]" />
                ) : (
                  <Menu aria-hidden="true" className="size-[1.125rem]" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobilePanel open={menuOpen} onClose={closeMenu} />
    </>
  )
}
