/**
 * Headless smoke test.
 *
 * Serves the production `dist/` build over a minimal static server (with SPA
 * fallback), walks every route at three viewports and reports console errors,
 * page errors, failed requests and a set of DOM assertions (headings, filters,
 * form validation, card counts, no dead links).
 *
 * IMPORTANT: the local server implements SPA fallback itself, so it cannot
 * prove a real host will serve deep links. The hosting configs are therefore
 * asserted separately against the same routing rules.
 *
 * Usage:  npm run build && node scripts/smoke.mjs
 */

import { createReadStream, readFileSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const PORT = 4317
const BASE = `http://127.0.0.1:${PORT}`
const DIST = resolve(fileURLToPath(new URL('../dist', import.meta.url)))

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
}

/* ------------------------------------------------------------------ server */

function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  const candidate = join(DIST, clean)
  return candidate
}

const server = createServer(async (request, response) => {
  const send = (status, file) => {
    response.writeHead(status, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
    createReadStream(file).pipe(response)
  }

  try {
    const target = resolveFile(request.url ?? '/')
    const info = await stat(target).catch(() => null)

    if (info?.isFile()) {
      send(200, target)
      return
    }

    // SPA fallback
    send(200, join(DIST, 'index.html'))
  } catch {
    response.writeHead(500).end()
  }
})

await new Promise((done) => server.listen(PORT, '127.0.0.1', done))

const stopServer = () => server.close()
process.on('exit', stopServer)
process.on('SIGINT', () => {
  stopServer()
  process.exit(1)
})

/* ------------------------------------------------------------------ runner */

const failures = []
const notes = []
const warnings = []
function check(label, condition, detail = '') {
  if (condition) {
    notes.push(`  PASS  ${label}`)
  } else {
    failures.push(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

/**
 * Advisory check. Never fails the run — used for deployment-time configuration
 * that is legitimately unset on a local machine (e.g. the real site origin).
 */
function warn(label, condition, detail = '') {
  if (!condition) {
    warnings.push(`  WARN  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

const ROUTES = ['/', '/projects', '/projects/fleet-pro', '/services', '/contact', '/nope-does-not-exist']
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
]

/**
 * Drives a `SelectMenu` the way a person would: open the popup, click the
 * option carrying the given value. Playwright's `selectOption` only works on a
 * real `<select>`, so it cannot be used against these custom listboxes.
 */
async function chooseOption(page, fieldId, value) {
  await page.locator(`#${fieldId}`).click()
  const listbox = page.locator(`[id="${fieldId}-listbox"]`)
  await listbox.waitFor()
  await listbox.locator(`[role="option"][data-value="${value}"]`).click()
  await listbox.waitFor({ state: 'detached' })
}

async function main() {
  const browser = await chromium.launch()
  const consoleErrors = []
  const pageErrors = []
  const failedRequests = []

  /* ---------------------------------------------------------------------
   * Hosting config: SPA deep links.
   *
   * The local test server falls back to index.html for unknown paths, so it
   * cannot catch a host that would 404 on /projects/<slug>. Assert the deploy
   * configs actually contain a catch-all rewrite instead.
   * ------------------------------------------------------------------- */
  const hostingConfigs = [
    { file: 'vercel.json', root: 'dist' },
    { file: 'firebase.json', root: 'dist' },
  ]

  for (const { file, root } of hostingConfigs) {
    let config = null
    try {
      config = JSON.parse(readFileSync(resolve(DIST, '..', file), 'utf8'))
      check(`${file} is valid JSON`, true)
    } catch (error) {
      check(`${file} is valid JSON`, false, String(error))
      continue
    }

    const vercelRewrites = file === 'vercel.json' ? (config.rewrites ?? []) : null
    const firebaseRewrites =
      file === 'firebase.json' ? (config.hosting?.rewrites ?? []) : null

    if (vercelRewrites || firebaseRewrites) {
      const rules = vercelRewrites ?? firebaseRewrites
      const spaRule = rules.find((rule) => rule.destination === '/index.html')
      check(
        `${file} rewrites unknown paths to /index.html`,
        Boolean(spaRule),
        JSON.stringify(rules),
      )

      /* Only Vercel uses regex sources; Firebase uses globs, and it serves
         matching static files before applying a rewrite. */
      if (spaRule && vercelRewrites) {
        // Vercel matches the path with the leading slash removed.
        const pattern = new RegExp(`^${spaRule.source.replace(/^\//, '')}$`)
        const routed = (path) => pattern.test(path.replace(/^\//, ''))
        const mustRoute = ['projects/cineverse', 'projects/hazirihub-website', 'contact']
        const mustNotRoute = [
          'assets/index-abc123.js',
          'favicon.svg',
          'og-image.png',
          'sitemap.xml',
          'robots.txt',
        ]

        check(
          `${file} rewrite serves app routes`,
          mustRoute.every(routed),
          mustRoute.filter((p) => !routed(p)).join(', '),
        )
        check(
          `${file} rewrite does not shadow real files`,
          mustNotRoute.every((p) => !routed(p)),
          mustNotRoute.filter(routed).join(', '),
        )
      }

      if (spaRule && firebaseRewrites) {
        // A bare glob must still let real files through first.
        check(
          `${file} uses a catch-all rewrite for app routes`,
          spaRule.source === '**' || spaRule.source === '/*',
          spaRule.source,
        )
      }
    }

    if (file === 'vercel.json') {
      check(`${file} publishes the build output`, config.outputDirectory === root)
    }
    if (file === 'firebase.json') {
      check(`${file} publishes the build output`, config.hosting?.public === root)
    }
  }

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      })
      const page = await context.newPage()

      page.on('console', (message) => {
        if (message.type() === 'error') {
          const text = message.text()
          // Google Fonts is unreachable in the sandbox; not an app defect.
          if (/fonts\.(googleapis|gstatic)/.test(text)) return
          consoleErrors.push(`[${viewport.name}] ${text}`)
        }
      })
      page.on('pageerror', (error) => pageErrors.push(`[${viewport.name}] ${error.message}`))
      page.on('requestfailed', (request) => {
        const url = request.url()
        if (/fonts\.(googleapis|gstatic)/.test(url)) return
        failedRequests.push(`[${viewport.name}] ${url} — ${request.failure()?.errorText}`)
      })

      for (const route of ROUTES) {
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
        await page.waitForSelector('main', { timeout: 10_000 })

        const h1 = await page.locator('h1').first().innerText()

        check(
          `${viewport.name} ${route} renders an h1`,
          h1.trim().length > 0,
          `got "${h1}"`,
        )

        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
        check(
          `${viewport.name} ${route} canonical is absolute`,
          Boolean(canonical?.startsWith('http')),
          `got "${canonical}"`,
        )

        /* A blank/invalid VITE_SITE_URL once made `new URL(path, site.url)`
           throw, which blanked every page. Metadata must always resolve to a
           real absolute URL, never a root-relative fallback. */
        const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
        const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
        check(
          `${viewport.name} ${route} og:url and og:image are absolute`,
          Boolean(ogUrl?.startsWith('http')) && Boolean(ogImage?.startsWith('http')),
          `og:url="${ogUrl}" og:image="${ogImage}"`,
        )

        /* The brand mark is an inline SVG, which can silently collapse to zero
           height and leave a header with no logo on some viewports. */
        if (route === '/') {
          const mark = page.locator('header a[aria-label*="home"] svg').first()
          const markBox = await mark.boundingBox()
          check(
            `${viewport.name} brand mark is rendered at a usable size`,
            Boolean(markBox && markBox.width >= 24 && markBox.height >= 24),
            markBox ? `${Math.round(markBox.width)}x${Math.round(markBox.height)}` : 'not visible',
          )

          const wordmark = page.locator('header a[aria-label*="home"]').first()
          check(
            `${viewport.name} wordmark text is visible`,
            (await wordmark.innerText()).includes('Pholio'),
            JSON.stringify(await wordmark.innerText()),
          )
        }

        const description = await page.locator('meta[name="description"]').getAttribute('content')
        check(
          `${viewport.name} ${route} has meta description`,
          Boolean(description && description.length > 30),
        )

        const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
        check(`${viewport.name} ${route} has og:title`, Boolean(ogTitle))

        const jsonLd = await page.locator('script#pholio\\:jsonld').count()
        check(`${viewport.name} ${route} has JSON-LD`, jsonLd === 1)
      }

      /* ------------------------------------------------- route-specific checks */

      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      const homeH1 = (await page.locator('main h1').first().innerText()).replace(/\s+/g, ' ')
      check('home headline reads correctly', homeH1.includes('Software that holds up'), homeH1)

      const ctaLabels = await page.locator('main a, main button').allInnerTexts()
      const flatCtas = ctaLabels.join(' ').replace(/\s+/g, ' ')
      check('home has Explore Projects CTA', flatCtas.includes('Explore Projects'))
      check('home has Start a Project CTA', flatCtas.includes('Start a Project'))

      const homeCards = await page.locator('main ul li article').count()
      check('home renders 6 featured project cards', homeCards === 6, `got ${homeCards}`)

      const homeNested = await page.$$eval('main article article', (nodes) => nodes.length)
      check('home has no nested <article> elements', homeNested === 0, `got ${homeNested}`)

      /* No dead links: every internal href must resolve to a real route. */
      const internalHrefs = await page.$$eval('a[href]', (links) =>
        links
          .map((link) => link.getAttribute('href') ?? '')
          .filter((href) => href.startsWith('/')),
      )
      const routePattern = /^\/(projects(\/[a-z0-9-]+)?|services|contact)?\/?$/
      const badHrefs = [...new Set(internalHrefs.filter((href) => !routePattern.test(href)))]
      check('home has no unknown internal links', badHrefs.length === 0, badHrefs.join(', '))

      const placeholderHrefs = await page.$$eval('a', (links) =>
        links
          .map((link) => link.getAttribute('href') ?? '')
          .filter((href) => href === '#' || href === '' || href === 'javascript:void(0)'),
      )
      check('home has no placeholder (#) links', placeholderHrefs.length === 0, placeholderHrefs.join(', '))

      /* Projects page filters */
      await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle' })
      const totalCards = await page.locator('main ul li article').count()
      check('projects "All" shows 29 cards', totalCards === 29, `got ${totalCards}`)

      const projectNames = await page.$$eval('main ul li article h3', (nodes) =>
        nodes.map((node) => node.textContent?.trim() ?? ''),
      )
      for (const expected of [
        'SayHi-Chat-App',
        'FlutterTube',
        'Fleet-Pro',
        'CineVerse',
        'Devriti',
        'TrackIt',
        'DevAi-User',
        'DevStudio2025',
        'PaperCraft',
        'IRD',
        'DevGPT',
        'CallHub',
        'D-Course',
        'AniClip',
        'AniPlix',
        'BloomeeTunes',
        'instagram_studio',
        'telegram-stream-bot',
        'CineWalls',
        'CalcsHub',
        'Plant Detector',
        'HaziriHub',
        'Snap to PDF',
        'Labour Hisab',
        'Joya Holidays',
        'Caption-Studio-web',
        'MentorHub',
        'My Life Book',
      ]) {
        check(`project present: ${expected}`, projectNames.includes(expected))
      }
      check(
        'HaziriHub appears twice (app + website)',
        projectNames.filter((name) => name === 'HaziriHub').length === 2,
        `got ${projectNames.filter((name) => name === 'HaziriHub').length}`,
      )

      /* Display rule: name, one-line description, `APP · FLUTTER`, View Project */
      const firstCard = page.locator('main ul li article').first()
      const firstCardText = (await firstCard.innerText()).replace(/\s+/g, ' ').trim()
      check(
        'card shows the CATEGORY · TECHNOLOGY line',
        /APP · [A-Z ]+/.test(firstCardText) || /Website · [A-Za-z ]+/.test(firstCardText),
        firstCardText,
      )
      check('card shows View Project', firstCardText.includes('View Project'), firstCardText)

      const stackLine = (await firstCard.locator('p').nth(1).innerText()).trim()
      check(
        'SayHi-Chat-App stack line reads "App · Java" (uppercased by CSS)',
        stackLine.toLowerCase() === 'app · java',
        stackLine,
      )

      const cardDescriptions = await page.$$eval('main ul li article p', (nodes) =>
        nodes.filter((node) => !node.className.includes('label-xs')).map((n) => n.textContent ?? ''),
      )
      check(
        'card descriptions are a single short line each',
        cardDescriptions.every((text) => text.length > 20 && text.length < 110),
        `longest: ${Math.max(...cardDescriptions.map((t) => t.length))}`,
      )

      /* Cards must be text-only: no img/svg/emoji inside project cards. */
      const cardMedia = await page.$$eval('main ul li article', (cards) =>
        cards.flatMap((card) =>
          Array.from(card.querySelectorAll('img, picture, video, canvas')).map(
            (node) => node.tagName,
          ),
        ),
      )
      check('project cards contain no images', cardMedia.length === 0, cardMedia.join(', '))

      const emojiPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u
      const cardText = await page.$$eval('main ul li article', (cards) =>
        cards.map((card) => card.textContent ?? '').join(' '),
      )
      check('project cards contain no emoji', !emojiPattern.test(cardText))

      /* Filters */
      await page.getByRole('button', { name: /^Apps/ }).click()
      await page.waitForFunction(
        () => document.querySelectorAll('main ul li article').length === 25,
        null,
        { timeout: 5000 },
      )
      check('Apps filter shows 25 cards', (await page.locator('main ul li article').count()) === 25)
      check('Apps filter is in the URL', page.url().includes('category=apps'), page.url())

      await page.getByRole('button', { name: /^Websites/ }).click()
      await page.waitForFunction(
        () => document.querySelectorAll('main ul li article').length === 4,
        null,
        { timeout: 5000 },
      )
      check('Websites filter shows 4 cards', (await page.locator('main ul li article').count()) === 4)

      const websiteNames = await page.$$eval('main ul li article h3', (nodes) =>
        nodes.map((node) => node.textContent?.trim() ?? ''),
      )
      check(
        'websites filter shows exactly the 4 website projects',
        ['Caption-Studio-web', 'MentorHub', 'My Life Book', 'HaziriHub'].every((name) =>
          websiteNames.includes(name),
        ) && websiteNames.length === 4,
        websiteNames.join(', '),
      )

      await page.getByRole('button', { name: /^All/ }).click()
      await page.waitForFunction(
        () => document.querySelectorAll('main ul li article').length === 29,
        null,
        { timeout: 5000 },
      )
      check('All filter restores 29 cards', (await page.locator('main ul li article').count()) === 29)

      /* Deep link with a query param */
      await page.goto(`${BASE}/projects?category=websites`, { waitUntil: 'networkidle' })
      check('deep-linked category filter works', (await page.locator('main ul li article').count()) === 4)

      /* Project detail pages */
      await page.goto(`${BASE}/projects/fleet-pro`, { waitUntil: 'networkidle' })
      const detailH1 = (await page.locator('main h1').first().innerText()).trim()
      check('detail page h1 is the project name', detailH1 === 'Fleet-Pro', detailH1)

      const detailText = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
      // The CTA lives in the footer, not inside <main>, so check the whole page.
      const detailBodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
      check('detail page shows the full description', detailText.includes('multiple cars and vehicles'))
      check('detail page shows the full technology list', detailText.includes('Firebase') && detailText.includes('Supabase'))
      check('detail page shows the feature list', detailText.includes('Role-based access'))
      check('detail page offers a Start a Project CTA', detailBodyText.includes('Start a Project'))
      check('detail page links back to all projects', detailText.includes('All projects'))

      const detailTitle = await page.title()
      check('detail page title is namespaced', detailTitle === 'Fleet-Pro — Pholio', detailTitle)
      const detailCanonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      check(
        'detail canonical points at the project',
        detailCanonical?.endsWith('/projects/fleet-pro'),
        detailCanonical ?? '',
      )
      check('detail page is indexable', (await page.locator('meta[name="robots"]').getAttribute('content'))?.includes('index') === true)

      /* The two HaziriHub entries must not collide on one URL */
      const haziriHrefs = await page.$$eval('main ul li article a[href^="/projects/"]', (links) =>
        links.map((link) => link.getAttribute('href')),
      )
      check(
        'all project URLs are unique',
        new Set(haziriHrefs).size === haziriHrefs.length,
        `${new Set(haziriHrefs).size} unique of ${haziriHrefs.length}`,
      )
      await page.goto(`${BASE}/projects/hazirihub`, { waitUntil: 'networkidle' })
      check(
        'hazirihub resolves to the app',
        (await page.locator('main h1').first().innerText()).trim() === 'HaziriHub' &&
          (await page.locator('main').innerText()).includes('75% attendance'),
      )
      await page.goto(`${BASE}/projects/hazirihub-website`, { waitUntil: 'networkidle' })
      check(
        'hazirihub-website resolves to the website',
        (await page.locator('main').innerText()).includes('Present and support the HaziriHub'),
      )

      /* Devanagari copy renders */
      await page.goto(`${BASE}/projects/labour-hisab`, { waitUntil: 'networkidle' })
      check(
        'Labour Hisab renders the Devanagari feature',
        (await page.locator('main').innerText()).includes('हिसाब'),
      )

      /* Unknown project slug */
      await page.goto(`${BASE}/projects/not-a-real-project`, { waitUntil: 'networkidle' })
      const missingText = await page.locator('main').innerText()
      check('unknown project slug shows a friendly state', /could not find that project/i.test(missingText))
      check(
        'unknown project slug is noindex',
        (await page.locator('meta[name="robots"]').getAttribute('content'))?.includes('noindex') === true,
      )

      /* Card click navigates to the detail page */
      await page.goto(`${BASE}/projects?category=websites`, { waitUntil: 'networkidle' })
      await page.locator('main ul li article a[href="/projects/my-life-book"]').click()
      await page.waitForURL('**/projects/my-life-book')
      // The old page stays mounted during the exit animation, so wait for the
      // new heading rather than reading whatever is currently in the DOM.
      await page
        .locator('main h1')
        .filter({ hasText: 'My Life Book' })
        .waitFor({ state: 'visible', timeout: 8000 })
        .catch(() => {})
      check(
        'card click opens the project detail page',
        (await page.locator('main h1').first().innerText()).trim() === 'My Life Book',
      )

      /* Sitemap is generated from the project data, so it must list every
         project page and agree with the rendered origin. */
      const sitemapResponse = await fetch(`${BASE}/sitemap.xml`)
      check('sitemap.xml is served', sitemapResponse.ok, `status ${sitemapResponse.status}`)
      const sitemap = await sitemapResponse.text()
      const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

      check(
        'sitemap lists 4 static routes + all 29 projects',
        sitemapLocations.length === 33,
        `got ${sitemapLocations.length}`,
      )
      check(
        'every project page is in the sitemap',
        haziriHrefs.every((href) => sitemapLocations.some((loc) => loc.endsWith(href))),
        haziriHrefs.filter((href) => !sitemapLocations.some((loc) => loc.endsWith(href))).join(', '),
      )
      check(
        'sitemap has no duplicate URLs',
        new Set(sitemapLocations).size === sitemapLocations.length,
      )
      check(
        'every sitemap URL shares one origin',
        new Set(sitemapLocations.map((loc) => new URL(loc).origin)).size === 1,
      )

      const robotsResponse = await fetch(`${BASE}/robots.txt`)
      const robotsBody = await robotsResponse.text()
      check('robots.txt allows crawling', robotsBody.includes('Allow: /'))
      check(
        'robots.txt points at the served sitemap',
        robotsBody.includes(`Sitemap: ${sitemapLocations[0]?.replace(/\/[^/]*$/, '')}/sitemap.xml`),
        robotsBody.trim(),
      )

      /* Deployment configuration, not a code defect: the placeholder origin is
         the documented local fallback, so this only warns. */
      const usingPlaceholder = sitemapLocations.some((loc) => loc.includes('example.com'))
      warn(
        'VITE_SITE_URL is set (canonical/sitemap use a real origin)',
        !usingPlaceholder,
        'build with VITE_SITE_URL set before deploying',
      )


      /* Services */
      await page.goto(`${BASE}/services`, { waitUntil: 'networkidle' })
      const serviceCount = await page.locator('main ul li article').count()
      check('services page lists 9 services', serviceCount === 9, `got ${serviceCount}`)

      const serviceHeadings = await page.$$eval('main ul li article h2', (nodes) =>
        nodes.map((node) => node.textContent?.trim() ?? ''),
      )
      for (const expected of [
        'Website Development',
        'Mobile App Development',
        'Custom Software Development',
        'UI/UX Design',
        'Admin Panel Development',
        'Backend and Database Integration',
        'Payment Gateway Integration',
        'SEO and Performance Optimization',
        'Deployment, Hosting and Maintenance',
      ]) {
        check(`service present: ${expected}`, serviceHeadings.includes(expected))
      }

      /* Contact form validation */
      await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: /send message/i }).click()
      await page.waitForSelector('[role="alert"]', { timeout: 5000 })

      const summaryText = await page.locator('[role="alert"]').first().innerText()
      check('empty submit shows an error summary', /fix 4 fields/i.test(summaryText), summaryText)
      check(
        'summary links to the name field',
        (await page.locator('a[href="#contact-name"]').count()) === 1,
      )

      const invalidCount = await page.locator('main [aria-invalid="true"]').count()
      check('invalid fields are marked aria-invalid', invalidCount === 4, `got ${invalidCount}`)

      /* Fill it in properly. */
      await page.fill('#contact-name', 'Ada Lovelace')
      await page.fill('#contact-email', 'ada@example.com')
      await chooseOption(page, 'contact-projectType', 'website')
      await page.fill('#contact-details', 'We need a marketing site for a new product line.')
      await page.getByRole('button', { name: /send message/i }).click()

      /* No endpoint is configured, so the honest unconfigured state must show. */
      await page.waitForSelector('text=/not connected to a backend/i', { timeout: 8000 })
      check('unconfigured submission is reported honestly', true)

      const mailtoHref = await page.locator('a:has-text("Open in email app")').getAttribute('href')
      check('mailto fallback is offered', Boolean(mailtoHref?.startsWith('mailto:')), mailtoHref ?? '')
      check(
        'mailto body carries the entered name',
        decodeURIComponent(mailtoHref ?? '').includes('Ada Lovelace'),
      )
      check(
        'form retains values after the unconfigured notice',
        (await page.inputValue('#contact-name')) === 'Ada Lovelace',
      )

      /* Phone validation */
      await page.fill('#contact-phone', 'not a phone')
      await page.locator('#contact-phone').blur()
      await page.waitForTimeout(200)
      check(
        'invalid phone is rejected',
        (await page.locator('#contact-phone').getAttribute('aria-invalid')) === 'true',
      )
      await page.fill('#contact-phone', '+1 555 000 1234')
      await page.locator('#contact-phone').blur()
      await page.waitForTimeout(200)
      check(
        'valid phone clears the error',
        (await page.locator('#contact-phone').getAttribute('aria-invalid')) === null,
      )

      /* 404 */
      await page.goto(`${BASE}/nope-does-not-exist`, { waitUntil: 'networkidle' })
      const notFoundText = await page.locator('main').innerText()
      check('404 route renders a not-found page', /does not exist/i.test(notFoundText))
      const robots = await page.locator('meta[name="robots"]').getAttribute('content')
      check('404 route is noindex', robots?.includes('noindex') === true, robots ?? '')

      /* Mobile menu */
      if (viewport.name === 'mobile') {
        await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
        const toggle = page.getByRole('button', { name: /open menu/i })
        check('mobile menu trigger is visible', await toggle.isVisible())
        check('aria-expanded starts false', (await toggle.getAttribute('aria-expanded')) === 'false')

        await toggle.click()
        await page.waitForSelector('#mobile-menu', { timeout: 5000 })
        check('mobile menu opens', await page.locator('#mobile-menu').isVisible())
        check(
          'aria-expanded becomes true',
          (await page.getByRole('button', { name: /close menu/i }).getAttribute('aria-expanded')) ===
            'true',
        )
        check(
          'body scroll is locked while open',
          (await page.evaluate(() => document.body.style.overflow)) === 'hidden',
        )

        await page.keyboard.press('Escape')
        await page.waitForSelector('#mobile-menu', { state: 'detached', timeout: 5000 })
        check('Escape closes the mobile menu', (await page.locator('#mobile-menu').count()) === 0)
        check(
          'body scroll is restored',
          (await page.evaluate(() => document.body.style.overflow)) !== 'hidden',
        )

        await page.getByRole('button', { name: /open menu/i }).click()
        await page.waitForSelector('#mobile-menu')
        await page.getByRole('link', { name: 'Projects' }).first().click()
        await page.waitForURL('**/projects')
        // The panel exit-animates, so wait for it to detach rather than asserting
        // synchronously.
        await page.waitForSelector('#mobile-menu', { state: 'detached', timeout: 5000 })
        check(
          'mobile menu closes after navigating',
          (await page.locator('#mobile-menu').count()) === 0,
        )
        check('navigation actually moved the route', page.url().endsWith('/projects'))
        check(
          'body scroll is restored after navigating',
          (await page.evaluate(() => document.body.style.overflow)) !== 'hidden',
        )
      }

      /* Keyboard focus visibility */
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => {
        const element = document.activeElement
        if (!element) return null
        const styles = getComputedStyle(element)
        return {
          tag: element.tagName,
          text: (element.textContent ?? '').trim().slice(0, 40),
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
        }
      })
      check(
        'first tab stop is the skip link with a visible outline',
        Boolean(
          focused &&
            focused.tag === 'A' &&
            focused.outlineStyle !== 'none' &&
            Number.parseFloat(focused.outlineWidth) > 0,
        ),
        JSON.stringify(focused),
      )

      /* No horizontal overflow at any viewport. */
      for (const route of ['/', '/projects', '/projects/fleet-pro', '/services', '/contact']) {
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        check(`${viewport.name} ${route} has no horizontal overflow`, overflow <= 1, `${overflow}px`)
      }

      /* Reduced motion */
      const reducedContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      })
      const reducedPage = await reducedContext.newPage()
      await reducedPage.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      const heroOpacity = await reducedPage
        .locator('main h1')
        .first()
        .evaluate((node) => getComputedStyle(node).opacity)
      check('reduced motion still renders the hero fully visible', heroOpacity === '1', heroOpacity)
      await reducedContext.close()

      await context.close()
    }

    /* ---------------------------------------------------------------------
     * Interaction audit (desktop only — these are viewport-independent).
     *
     * Crawls every internal link on every page and confirms each one lands on
     * a real rendered page, then exercises every button on every page and
     * asserts it produces a visible effect. This is what catches "dead"
     * buttons that a per-page snapshot never touches.
     * ------------------------------------------------------------------- */
    const auditContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const auditPage = await auditContext.newPage()

    await auditPage.goto(`${BASE}/projects`, { waitUntil: 'networkidle' })
    const crawledSlugs = await auditPage.$$eval(
      'main ul li article a[href^="/projects/"]',
      (links) => links.map((link) => link.getAttribute('href')),
    )
    const auditRoutes = [
      '/',
      '/projects',
      '/services',
      '/contact',
      ...[...new Set(crawledSlugs)].filter((href) => href !== '/projects'),
    ]

    const brokenLinks = []
    for (const route of auditRoutes) {
      await auditPage.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
      const heading = await auditPage
        .locator('main h1')
        .first()
        .innerText()
        .catch(() => '')
      const isNotFound = /page not found|could not find that project/i.test(
        await auditPage.locator('main').innerText().catch(() => ''),
      )
      if (!heading.trim() || isNotFound) brokenLinks.push(route)
    }
    check(
      `all ${auditRoutes.length} internal destinations render real content`,
      brokenLinks.length === 0,
      brokenLinks.join(', '),
    )

    /* Every button on every page must do something observable. */
    const inertButtons = []
    for (const route of ['/', '/projects', '/services', '/contact', '/projects/fleet-pro']) {
      await auditPage.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
      const buttonCount = await auditPage.locator('main button').count()

      for (let index = 0; index < buttonCount; index += 1) {
        const button = auditPage.locator('main button').nth(index)
        const label = (await button.innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
        if (!label) continue

        const urlBefore = auditPage.url()
        const domBefore = await auditPage.locator('main').innerText()

        await button.scrollIntoViewIfNeeded()
        await button.click({ timeout: 5000 }).catch(() => {})

        const changed =
          auditPage.url() !== urlBefore ||
          (await auditPage.locator('main').innerText()) !== domBefore ||
          (await auditPage.locator('main [role="alert"], main [aria-live]').count()) > 0

        if (!changed) inertButtons.push(`${route} → "${label}"`)
      }
    }
    check(
      'every button produces a visible effect',
      inertButtons.length === 0,
      inertButtons.join(' | '),
    )

    /* A duplicated primary CTA reads as a rendering glitch on mobile, where the
       page CTA and the footer CTA sit within a few dozen pixels of each other.
       CTAs that are far apart (navbar, hero, footer) are intentional, so the
       invariant is proximity, not a global count. */
    const ctaSummary = []
    const adjacentCtas = []
    for (const route of ['/', '/projects', '/services', '/contact', '/projects/fleet-pro']) {
      await auditPage.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
      const boxes = await auditPage
        .locator('a:visible, button:visible')
        .filter({ hasText: /^Start a Project$/ })
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top))

      ctaSummary.push(`${route}=${boxes.length}`)

      const sorted = [...boxes].sort((a, b) => a - b)
      for (let index = 1; index < sorted.length; index += 1) {
        if (Math.abs(sorted[index] - sorted[index - 1]) < 240) {
          adjacentCtas.push(`${route} (${Math.round(sorted[index] - sorted[index - 1])}px apart)`)
        }
      }
    }
    check(
      'no two visible "Start a Project" CTAs are stacked together',
      adjacentCtas.length === 0,
      adjacentCtas.join(', '),
    )

    /* The project detail page previously repeated the footer CTA in its body. */
    await auditPage.goto(`${BASE}/projects/fleet-pro`, { waitUntil: 'networkidle' })
    const detailVisibleCtas = await auditPage
      .locator('main a:visible, main button:visible')
      .filter({ hasText: /^Start a Project$/ })
      .count()
    check(
      'project detail does not duplicate the "Start a Project" CTA',
      detailVisibleCtas === 0,
      `found ${detailVisibleCtas} inside main`,
    )

    /* The bottom "All projects" control should be the name only, no arrow. */
    const allProjectsLinks = auditPage.locator('main a').filter({ hasText: 'All projects' })
    check(
      'project detail has an "All projects" control',
      (await allProjectsLinks.count()) >= 1,
      `found ${await allProjectsLinks.count()}`,
    )
    check(
      'the "All projects" button shows only the name (no arrow icon)',
      (await allProjectsLinks.last().locator('svg').count()) === 0,
    )

    /* Contact form: required fields block submission and report inline. */
    await auditPage.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
    const submitButton = auditPage.locator('main button[type="submit"]')
    if ((await submitButton.count()) > 0) {
      await submitButton.click()
      const alerts = await auditPage.locator('main [role="alert"], main [aria-live]').allInnerTexts()
      check(
        'empty contact submit is blocked and reports inline errors',
        alerts.join(' ').trim().length > 0,
        alerts.join(' | '),
      )
    } else {
      check('contact page exposes a submit button', false, 'no submit button found')
    }

    /* Contact details must be reachable from the page, not just the config. */
    await auditPage.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
    const contactEmail = (await auditPage.locator('a[href^="mailto:"]').first().getAttribute('href')) ?? ''
    check(
      'contact page exposes a mailto link',
      /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim()),
      contactEmail,
    )

    const telAnchor = auditPage.locator('a[href^="tel:"]').first()
    const telHref = await telAnchor.getAttribute('href')
    // The anchor also contains the "Phone" label, so pull the number itself out.
    const telText = ((await telAnchor.innerText()).match(/\+?\d[\d\s()-]{7,}/) ?? [''])[0].trim()
    check(
      'contact page exposes a tel: link',
      /^tel:\+?\d{6,}$/.test((telHref ?? '').trim()),
      telHref ?? '',
    )
    check(
      'tel: link strips formatting from the displayed number',
      (telHref ?? '').replace('tel:', '') === telText.replace(/[^\d+]/g, ''),
      `"${telHref}" vs "${telText}"`,
    )

    const contactJsonLd = await auditPage.evaluate(() => {
      const node = document.getElementById('pholio:jsonld')
      return node?.textContent ?? ''
    })
    check(
      'structured data advertises the contact email',
      contactJsonLd.includes(contactEmail.replace('mailto:', '')),
    )
    check('structured data advertises the phone number', contactJsonLd.includes(telText))

    await auditContext.close()
  } finally {
    await browser.close()
  }

  console.log('\n=== CONSOLE ERRORS ===')
  console.log(consoleErrors.length ? consoleErrors.join('\n') : '  none')
  console.log('\n=== PAGE ERRORS ===')
  console.log(pageErrors.length ? pageErrors.join('\n') : '  none')
  console.log('\n=== FAILED REQUESTS ===')
  console.log(failedRequests.length ? failedRequests.join('\n') : '  none')

  console.log(`\n=== CHECKS (${notes.length} passed) ===`)
  console.log(notes.join('\n'))

  if (failures.length) {
    console.log(`\n=== FAILURES (${failures.length}) ===`)
    console.log(failures.join('\n'))
  }

  if (warnings.length) {
    // The per-viewport loop can surface the same advisory more than once.
    const uniqueWarnings = [...new Set(warnings)]
    console.log(`\n=== WARNINGS (${uniqueWarnings.length}) ===`)
    console.log(uniqueWarnings.join('\n'))
  }

  const total = notes.length + failures.length
  console.log(`\n${notes.length}/${total} checks passed.`)

  if (consoleErrors.length || pageErrors.length || failedRequests.length || failures.length) {
    process.exitCode = 1
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    stopServer()
    await sleep(200)
  })
