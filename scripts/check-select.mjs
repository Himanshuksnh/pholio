import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { chromium } from 'playwright'

const DIST = 'dist'
const PORT = 4461
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}
const server = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]))
  let file = join(DIST, p)
  if (!(await stat(file).catch(() => null))?.isFile?.()) file = join(DIST, 'index.html')
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(PORT, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${PORT}`

/* --color-electric-400, the focus ring colour used by every other control. */
const RING = 'rgb(122, 155, 255)'

const out = []
const log = (label, pass, detail = '') =>
  out.push(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)

/** Locators scoped to one field, so the two menus never collide. */
const listboxOf = (page, field) => page.locator(`[id="${field}-listbox"]`)
const optionsOf = (page, field) => listboxOf(page, field).locator('[role="option"]')
const activeOptionOf = async (page, field) => {
  const id = await page.locator(`#${field}`).getAttribute('aria-activedescendant')
  return page.locator(`[id="${id}"]`)
}

const browser = await chromium.launch()

for (const [name, viewport] of Object.entries({
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
})) {
  const page = await browser.newPage({ viewport })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })

  const trigger = page.locator('#contact-projectType')
  const F = 'contact-projectType'

  log(`${name}: no native <select> remains`, (await page.locator('main select').count()) === 0)
  log(
    `${name}: trigger exposes combobox semantics`,
    (await trigger.getAttribute('role')) === 'combobox' &&
      (await trigger.getAttribute('aria-haspopup')) === 'listbox' &&
      (await trigger.getAttribute('aria-expanded')) === 'false',
  )
  log(
    `${name}: trigger is labelled by the visible field label`,
    (await trigger.evaluate((n) => {
      const id = n.getAttribute('aria-labelledby') ?? document.querySelector(`label[for="${n.id}"]`)?.id
      return Boolean(id) && (n.getAttribute('aria-label') || n.textContent).length > 0
    })) !== false,
  )

  await trigger.click()
  await listboxOf(page, F).waitFor()
  log(`${name}: opens with all options`, (await optionsOf(page, F).count()) === 11)
  log(`${name}: aria-expanded flips to true`, (await trigger.getAttribute('aria-expanded')) === 'true')
  log(
    `${name}: aria-owns binds the popup to the trigger`,
    (await trigger.getAttribute('aria-owns')) === `${F}-listbox`,
  )
  log(
    `${name}: aria-activedescendant resolves to a real option`,
    (await (await activeOptionOf(page, F)).getAttribute('role')) === 'option',
  )
  log(
    `${name}: focus stays on the trigger`,
    await trigger.evaluate((n) => n === document.activeElement),
  )
  log(
    `${name}: popup name comes from the label, not the selection`,
    (await listboxOf(page, F).getAttribute('aria-labelledby')) === `${F}-label` &&
      (await listboxOf(page, F).getAttribute('aria-label')) === null,
  )

  await page.keyboard.press('ArrowDown')
  const first = await trigger.getAttribute('aria-activedescendant')
  await page.keyboard.press('ArrowDown')
  const second = await trigger.getAttribute('aria-activedescendant')
  log(
    `${name}: arrow keys move the active option`,
    Boolean(first) && first !== second,
    `${first} -> ${second}`,
  )

  await page.keyboard.press('m')
  await page.keyboard.press('o')
  const typed = await (await activeOptionOf(page, F)).innerText()
  log(`${name}: type-ahead jumps to a matching option`, /mobile app/i.test(typed), typed)

  await page.keyboard.press('Enter')
  await listboxOf(page, F).waitFor({ state: 'detached' })
  log(`${name}: Enter selects and closes`, /mobile app/i.test(await trigger.innerText()))

  await trigger.click()
  await listboxOf(page, F).waitFor()
  log(
    `${name}: selected option is marked aria-selected`,
    (await listboxOf(page, F).locator('[role="option"][aria-selected="true"]').count()) === 1,
  )
  await page.keyboard.press('Escape')
  await listboxOf(page, F).waitFor({ state: 'detached' })
  log(`${name}: Escape closes without changing value`, /mobile app/i.test(await trigger.innerText()))

  await trigger.click()
  await listboxOf(page, F).waitFor()
  await page.locator('main h1').click()
  await listboxOf(page, F).waitFor({ state: 'detached' })
  log(`${name}: outside click dismisses the menu`, (await listboxOf(page, F).count()) === 0)

  /* Real Tab navigation, so :focus-visible genuinely applies. */
  await page.locator('body').click()
  await page.evaluate(() => document.activeElement?.blur())
  let tabbed = 0
  let reached = false
  for (; tabbed < 25; tabbed += 1) {
    await page.keyboard.press('Tab')
    reached = await trigger.evaluate((n) => n === document.activeElement)
    if (reached) break
  }
  log(`${name}: trigger is reachable by Tab`, reached, `${tabbed + 1} tab stops`)

  // transition-colors also animates outline-color, so wait for it to settle.
  await page.waitForTimeout(600)
  const ring = await trigger.evaluate((n) => {
    const s = getComputedStyle(n)
    return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, fv: n.matches(':focus-visible') }
  })
  log(
    `${name}: keyboard focus ring is visible`,
    ring.fv && ring.style === 'solid' && Number.parseFloat(ring.width) > 0,
    JSON.stringify(ring),
  )
  log(
    `${name}: focus ring colour matches the other controls`,
    ring.color === RING,
    `${ring.color}, expected ${RING}`,
  )

  await trigger.click()
  await listboxOf(page, F).waitFor()
  const box = await listboxOf(page, F).evaluate((n) => {
    const r = n.getBoundingClientRect()
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), vh: window.innerHeight, vw: window.innerWidth }
  })
  log(
    `${name}: menu stays within the viewport`,
    box.top >= 0 && box.left >= 0 && box.bottom <= box.vh + 1 && box.right <= box.vw + 1,
    JSON.stringify(box),
  )
  log(
    `${name}: menu never exceeds a scrollable height`,
    (await listboxOf(page, F).evaluate((n) => n.scrollHeight > n.clientHeight ? n.clientHeight <= 288 : true)),
  )
  await page.keyboard.press('Escape')
  await listboxOf(page, F).waitFor({ state: 'detached' })

  /* The budget field was the second native select. */
  const B = 'contact-budget'
  const budget = page.locator(`#${B}`)
  log(
    `${name}: budget field is a custom menu`,
    (await budget.getAttribute('role')) === 'combobox' &&
      (await budget.getAttribute('aria-haspopup')) === 'listbox',
  )
  await budget.click()
  await listboxOf(page, B).waitFor()
  log(`${name}: budget menu opens with all options`, (await optionsOf(page, B).count()) === 7)
  const bbox = await listboxOf(page, B).evaluate((n) => {
    const r = n.getBoundingClientRect()
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: window.innerHeight }
  })
  log(
    `${name}: budget menu stays within the viewport`,
    bbox.top >= 0 && bbox.bottom <= bbox.vh + 1,
    JSON.stringify(bbox),
  )
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await listboxOf(page, B).waitFor({ state: 'detached' })
  // The placeholder is "Prefer not to say", so assert a real amount was chosen.
  const budgetText = (await budget.innerText()).trim()
  log(
    `${name}: budget selection replaces the placeholder on the trigger`,
    /\$\d/.test(budgetText) && budgetText !== 'Prefer not to say',
    budgetText,
  )

  log(`${name}: no page errors`, errors.length === 0, errors.join(' | '))
  await page.close()
}

/* Selection must reach the form state, not just the DOM. */
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
await page.locator('#contact-name').fill('Test Person')
await page.locator('#contact-email').fill('test@example.com')

await page.locator('#contact-projectType').click()
await listboxOf(page, 'contact-projectType').waitFor()
await page.keyboard.press('ArrowDown')
await page.keyboard.press('Enter')
await page.locator('#contact-budget').click()
await listboxOf(page, 'contact-budget').waitFor()
await page.keyboard.press('ArrowDown')
await page.keyboard.press('Enter')

// Wait for both popups to fully unmount, so their option labels can never be
// mistaken for the selected value.
await page.waitForFunction(() => document.querySelectorAll('[role="listbox"]').length === 0)
const typeText = (await page.locator('#contact-projectType').innerText()).trim()
const budgetText = (await page.locator('#contact-budget').innerText()).trim()
log(
  'project type reaches the form state on the trigger',
  typeText === 'Website Development',
  typeText,
)
log(
  'budget reaches the form state on the trigger',
  budgetText === 'Under $1,000',
  budgetText,
)

// And the real submit path must carry them through, not just the visible label.
// With no endpoint configured the app reports that honestly and offers a
// mailto: handoff, so assert on that anchor's href.
await page.locator('#contact-details').fill('I need a new marketing website for my business.')
await page.locator('form button[type="submit"]').click()
const mailto = await page
  .locator('a[href^="mailto:"][href*="subject="]')
  .first()
  .getAttribute('href', { timeout: 10_000 })
  .catch(() => null)
log(
  'submit carries the chosen values into the mailto handoff',
  Boolean(mailto) &&
    mailto.includes('Website%20Development') &&
    mailto.includes('Under%20%241%2C000') &&
    mailto.includes('marketing%20website'),
  mailto ? decodeURIComponent(mailto).slice(0, 160) : 'no mailto link rendered',
)
await page.close()

console.log(out.join('\n'))
const passed = out.filter((l) => l.startsWith('PASS')).length
console.log(`\n${passed}/${out.length} passed`)
await browser.close()
server.close()
if (passed !== out.length) process.exitCode = 1
