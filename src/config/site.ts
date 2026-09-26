/* =============================================================================
 * SITE CONFIGURATION
 * -----------------------------------------------------------------------------
 * Single place to change everything business-related: brand name, contact
 * details, social profiles and the primary navigation.
 *
 * Social entries with an empty `href` are automatically hidden from the UI, so
 * the site never renders a dead link. Fill one in and it appears everywhere.
 * ========================================================================== */

export interface NavItem {
  readonly label: string
  readonly to: string
}

export interface SocialLink {
  /** Stable identifier, also used as the React key. */
  readonly key: string
  readonly label: string
  /** Full profile URL. Leave empty to hide the link everywhere. */
  readonly href: string
}

export interface SiteDetails {
  /** Short brand name — used in the nav, footer and metadata. */
  readonly name: string
  /** Legal entity name for the footer line and structured data. */
  readonly legalName: string
  /** Short positioning line shown under the wordmark. */
  readonly tagline: string
  /** Default meta description. Keep it 140–160 characters. */
  readonly description: string
  /** Public origin. Override with the `VITE_SITE_URL` environment variable. */
  readonly url: string
  readonly locale: string
  readonly themeColor: string
  /** Absolute or root-relative path to a 1200x630 social share image. */
  readonly ogImage: string
}

/**
 * Resolves the public origin used for canonical URLs, Open Graph and JSON-LD.
 *
 * `VITE_SITE_URL` wins when it holds a usable absolute URL. Otherwise the
 * current runtime origin is used, which keeps metadata correct on preview
 * deployments. The placeholder is only a last resort.
 *
 * Note: `??` is deliberately not used here — it does not catch an empty string,
 * and a blank `VITE_SITE_URL` (easy to set by accident) would otherwise produce
 * an empty base that makes `new URL(path, site.url)` throw and blank the page.
 */
function resolveSiteUrl(): string {
  const placeholder = 'https://example.com'

  const configured = (import.meta.env.VITE_SITE_URL ?? '').trim()
  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      console.warn(
        `[site] Ignoring invalid VITE_SITE_URL "${configured}" — expected an absolute URL such as https://yourdomain.com`,
      )
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return placeholder
}

export const site: SiteDetails = {
  name: 'Pholio',
  legalName: 'Pholio',
  tagline: 'Software Development Studio',
  description:
    'A software development studio designing and engineering web, mobile and custom software — from first sketch to production.',
  url: resolveSiteUrl(),
  locale: 'en',
  themeColor: '#05070b',
  ogImage: '/og-image.png',
}

export interface ContactDetails {
  /** Business inbox — update this. */
  readonly email: string
  /** Optional direct line. Leave empty to hide the row. */
  readonly phone: string
  /** Optional location line. Leave empty to hide the row. */
  readonly location: string
}

export const contact: ContactDetails = {
  email: 'hello@pholio.studio',
  phone: '',
  location: '',
}

export const socials: readonly SocialLink[] = [
  { key: 'github', label: 'GitHub', href: '' },
  { key: 'linkedin', label: 'LinkedIn', href: '' },
  { key: 'x', label: 'X', href: '' },
  { key: 'dribbble', label: 'Dribbble', href: '' },
  { key: 'instagram', label: 'Instagram', href: '' },
] as const

/** Social profiles that are actually configured — safe to render. */
export const activeSocials = socials.filter((social) => social.href.trim().length > 0)

export const navigation: readonly NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
] as const
