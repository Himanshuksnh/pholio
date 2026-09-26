import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { contact, site } from '@/config/site'

export interface PageMeta {
  /** Page title without the brand suffix. */
  title: string
  description: string
  /** Absolute or root-relative social share image. */
  image?: string
  type?: 'website' | 'article'
  /** Hide from search engines — used by the 404 route. */
  noIndex?: boolean
  /** Optional JSON-LD payload merged into the page structured data. */
  jsonLd?: Record<string, unknown>
}

const JSON_LD_ID = 'pholio:jsonld'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function toAbsoluteUrl(path: string): string {
  try {
    return new URL(path, site.url).toString()
  } catch {
    // Metadata must never be able to take down the page. If the configured
    // origin is somehow unusable, fall back to a root-relative URL rather than
    // throwing during render and unmounting the whole app.
    return path
  }
}

/**
 * Keeps the document head in sync with the active route: title, description,
 * canonical URL, Open Graph, Twitter card, robots directives and JSON-LD.
 *
 * Implemented directly against the DOM so the site carries no extra SEO
 * dependency.
 */
export function useDocumentMeta({
  title,
  description,
  image = site.ogImage,
  type = 'website',
  noIndex = false,
  jsonLd,
}: PageMeta) {
  const { pathname } = useLocation()

  useEffect(() => {
    const fullTitle = pathname === '/' ? `${site.name} — ${site.tagline}` : `${title} — ${site.name}`
    const url = toAbsoluteUrl(pathname)
    const imageUrl = toAbsoluteUrl(image)

    document.title = fullTitle

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    upsertCanonical(url)

    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', site.name)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('property', 'og:image:alt', `${site.name} — ${site.tagline}`)
    upsertMeta('property', 'og:locale', site.locale)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', imageUrl)

    const payload = {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: site.name,
      legalName: site.legalName,
      description: site.description,
      url: site.url,
      email: contact.email,
      ...jsonLd,
    }

    let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = JSON_LD_ID
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(payload)
  }, [title, description, image, type, noIndex, jsonLd, pathname])
}
