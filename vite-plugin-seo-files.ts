/* =============================================================================
 * SEO FILES PLUGIN
 * -----------------------------------------------------------------------------
 * Generates `sitemap.xml` and `robots.txt` at build time (and serves them in
 * dev) from the canonical project data and the configured site origin.
 *
 * Why generate instead of shipping static files in `public/`:
 *   - Every project detail page (`/projects/<slug>`) is listed automatically, so
 *     the sitemap can never drift from `src/data/projects.ts`.
 *   - The origin is read from `VITE_SITE_URL`, so canonical URLs, robots and
 *     sitemap always agree with the metadata the app renders.
 * ========================================================================== */

import type { Plugin } from 'vite'

import { projects } from './src/data/projects.ts'

interface SitemapEntry {
  readonly path: string
  readonly changefreq: 'monthly' | 'yearly'
  readonly priority: string
}

/** Routes that exist independently of the project data. */
const STATIC_ROUTES: readonly SitemapEntry[] = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
  { path: '/projects', changefreq: 'monthly', priority: '0.8' },
  { path: '/services', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'yearly', priority: '0.6' },
] as const

export function buildSitemap(origin: string): string {
  const base = origin.replace(/\/$/, '')

  const entries: SitemapEntry[] = [
    ...STATIC_ROUTES,
    ...projects.map<SitemapEntry>((project) => ({
      path: `/projects/${project.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ]

  const body = entries
    .map(
      ({ path, changefreq, priority }) =>
        [
          '  <url>',
          `    <loc>${base}${path}</loc>`,
          `    <changefreq>${changefreq}</changefreq>`,
          `    <priority>${priority}</priority>`,
          '  </url>',
        ].join('\n'),
    )
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
    '',
  ].join('\n')
}

export function buildRobots(origin: string): string {
  const base = origin.replace(/\/$/, '')
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${base}/sitemap.xml`, ''].join('\n')
}

export function seoFiles(origin: string): Plugin {
  const sitemap = buildSitemap(origin)
  const robots = buildRobots(origin)

  return {
    name: 'pholio:seo-files',

    /* Dev server: intercept the two routes so they are never missing. */
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const [pathname] = (request.url ?? '').split('?')

        if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
          response.setHeader('Content-Type', 'application/xml; charset=utf-8')
          response.end(pathname === '/sitemap.xml' ? sitemap : robots)
          return
        }

        next()
      })
    },

    /* Production build: emit alongside the hashed assets. */
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })
    },
  }
}
