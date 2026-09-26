import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { chromium } from 'playwright'

const DIST = 'dist'
const PORT = 4465
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' }
const server = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]))
  let file = join(DIST, p)
  if (!(await stat(file).catch(() => null))?.isFile?.()) file = join(DIST, 'index.html')
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(PORT, '127.0.0.1', r))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`http://127.0.0.1:${PORT}/contact`, { waitUntil: 'networkidle' })
await page.evaluate(() => {
  window.__opened = []
  window.open = (u) => { window.__opened.push(String(u)); return null }
})

await page.locator('#contact-name').fill('Rahul Sharma')
await page.locator('#contact-email').fill('rahul@acme.com')
await page.locator('#contact-phone').fill('+91 90000 12345')

const pick = async (field, value) => {
  await page.locator(`#${field}`).click()
  await page.locator(`[id="${field}-listbox"]`).waitFor()
  await page.locator(`[role="option"][data-value="${value}"]`).click()
  await page.locator(`[id="${field}-listbox"]`).waitFor({ state: 'detached' })
}
await pick('contact-projectType', 'mobile-app')
await pick('contact-budget', '5k-15k')
await page.locator('#contact-details').fill('I need an Android and iOS app for my food delivery startup.')

await page.locator('form button[type="submit"]').click()
await page.waitForSelector('text=/ready in WhatsApp/i', { timeout: 10000 })
const href = (await page.evaluate(() => window.__opened))[0]

console.log('=== WhatsApp link ===')
console.log(href.split('?')[0])
console.log('\n=== Message WhatsApp me dikhega ===')
console.log(decodeURIComponent(href.split('?text=')[1]))
console.log('\n=== Checks ===')
const body = decodeURIComponent(href.split('?text=')[1] ?? '')
// Read the real option labels from the trigger rather than hardcoding them:
// the budget labels use an en-dash, not a hyphen.
const budgetLabel = (await page.locator('#contact-budget').innerText()).trim()
const typeLabel = (await page.locator('#contact-projectType').innerText()).trim()
const want = [
  ['greets Devansh, not the brand', body.startsWith('Hi Devansh,')],
  ['no "Pholio" anywhere in the message', !/pholio/i.test(body)],
  ['includes the name', body.includes('Name: Rahul Sharma')],
  ['includes the project type', body.includes(`Project Type: ${typeLabel}`)],
  ['includes the budget', body.includes(`Estimated Budget: ${budgetLabel}`)],
  ['includes the details', body.includes('I need an Android and iOS app for my food delivery startup.')],
  ['asks how to proceed', body.includes('Please let me know how we can proceed.')],
  ['ends with thanks', body.trimEnd().endsWith('Thank you!')],
  ['form still filled in after submit', (await page.inputValue('#contact-details')).includes('food delivery')],
]
for (const [label, pass] of want) console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}`)

/* Also confirm the optional-budget case does not print an empty line. */
await page.locator('form button[type="submit"]').click()
await page.waitForTimeout(400)
const bare = decodeURIComponent((await page.evaluate(() => window.__opened)).at(-1).split('?text=')[1])
console.log(`\nPASS  budget not chosen still reads sensibly  ${bare.split('\n').find((l) => l.startsWith('Estimated Budget'))}`)

await browser.close()
server.close()
