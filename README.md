# Pholio — agency portfolio

Marketing site for a software development studio. Built as a static, SEO-ready
React app: no backend required to deploy, and the contact form degrades
gracefully when no form endpoint is configured.

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (CSS-first `@theme` tokens, no config file)
- **Animation:** Framer Motion
- **Routing:** React Router 7
- **Icons:** Lucide
- **Testing:** Playwright-driven smoke suite (`npm run smoke`)

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Dev server with HMR                                       |
| `npm run build`     | Type-check, then build to `dist/`                         |
| `npm run preview`   | Serve the production build locally                        |
| `npm run typecheck` | `tsc -b --noEmit`                                         |
| `npm run lint`      | ESLint over the whole repo                                |
| `npm run smoke`     | Build, serve, and assert the site end-to-end (see below)  |

## Configuration

All business values live in one place: `src/config/site.ts`.

Copy `.env.example` to `.env.local` and adjust as needed:

| Variable                | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `VITE_SITE_URL`         | Public origin. Drives canonical URLs, Open Graph, JSON-LD, and the generated `sitemap.xml` / `robots.txt`. **Set this before deploying** or every canonical will point at the `https://example.com` fallback. |
| `VITE_CONTACT_ENDPOINT` | HTTPS endpoint that receives contact submissions. Leave empty to fall back to a `mailto:` link. |

`src/config/site.ts` also holds the brand name, contact email, and social
profiles. **Social entries with an empty `href` are automatically hidden**, so
the site never renders a dead link — fill one in and it appears in the header,
footer, and structured data.

### Contact form

`src/lib/contact.ts` posts JSON to `VITE_CONTACT_ENDPOINT`. The endpoint must
accept a `POST` and return a 2xx response; no specific provider is assumed, so
Formspree, a serverless function, or your own API all work. If the variable is
unset, the form surfaces a `mailto:` fallback instead of pretending to submit.

## Project data

`src/data/projects.ts` is the single source of truth for every project, its
category, technology list, and feature list. Nothing is hardcoded in components.

- Slugs are derived from the project name by `slugify()` — no manual slugs.
- If two entries ever produce the same slug, the later one is suffixed with a
  singular category label (for example `hazirihub-website`) so URLs stay unique.
- `getProjectBySlug`, `getAdjacentProjects`, and `filterProjects` power routing,
  prev/next navigation, and the category filters respectively.
- `countByCategory` drives the filter counts and the home page "All N projects"
  link, so adding a project updates every count automatically.

Cards show only the project name, a one-line description, and
`CATEGORY · PRIMARY TECHNOLOGY` by design. Full descriptions, complete
technology lists, and feature bullets live on `/projects/<slug>`.

## SEO

- Per-route titles, descriptions, canonical URLs, Open Graph, and Twitter cards
  via `useDocumentMeta` (`src/hooks/useDocumentMeta.ts`).
- JSON-LD structured data (Organization + WebSite on the home page, BreadcrumbList
  on inner pages, CreativeWork on project pages).
- `sitemap.xml` and `robots.txt` are **generated at build time** by
  `vite-plugin-seo-files.ts` from the project data, so they cannot drift out of
  sync and always match `VITE_SITE_URL`.
- Unknown project slugs and the 404 page render `noindex, nofollow`.

## Testing

`npm run smoke` builds the site, serves `dist/` from a local static server, and
runs 379 assertions across mobile, tablet, and desktop viewports: metadata,
internal link integrity, no horizontal overflow, mobile menu behaviour, reduced
motion, project counts and filtering, project detail pages, and sitemap
integrity. It fails the run on any console error, page error, or failed request.

Playwright is a dev dependency, so no separate install step is needed.

## Deployment

The build output is a fully static `dist/` directory, so any static host works.
SPA rewrites are required so `/projects/<slug>` resolves to `index.html`.

### Vercel

`vercel.json` is included. Connect the repository and set `VITE_SITE_URL` in the
project's environment variables — no other configuration is needed.

### Firebase Hosting

```bash
cp .firebaserc.example .firebaserc   # then set your project id
npm run build
firebase deploy --only hosting
```

`firebase.json` configures the public directory, `cleanUrls`, cache headers for
hashed assets, and baseline security headers.

### Other hosts

Upload `dist/` and configure a rewrite of all unmatched paths to `/index.html`
(Nginx `try_files $uri /index.html`, Netlify `_redirects`, S3/CloudFront error
document, and so on).

## Project structure

```
src/
  components/
    contact/     Contact form and validation UI
    home/        Hero, services overview, process, featured projects
    layout/      Header, footer, mobile navigation
    projects/    Project card and category filter
    ui/          Buttons, containers, section primitives, motion wrappers
  config/        Brand, contact, social, navigation
  data/          Projects, services, process steps
  hooks/         Document metadata, scroll lock, media queries
  lib/           Contact transport, class-name helper
  pages/         One file per route
  routes/        Route table and lazy loading
public/          favicon.svg, og-image.png
scripts/         Playwright smoke suite
```
