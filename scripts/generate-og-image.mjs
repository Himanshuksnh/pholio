/**
 * Generates `public/og-image.png` — a 1200x630 abstract brand card used for
 * Open Graph / Twitter share previews.
 *
 * Deliberately typographic-free: it reproduces the site's background treatment
 * (navy-black base, electric wash, masked grid, hairline frame) plus the "P"
 * mark from `public/favicon.svg`. Swap in a designed 1200x630 PNG at the same
 * path if you want a wordmark version — nothing else needs to change.
 *
 * Usage:  node scripts/generate-og-image.mjs
 */

import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const WIDTH = 1200
const HEIGHT = 630
const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og-image.png')

/* -------------------------------------------------------------------------- */
/* Minimal PNG encoder (truecolour, 8-bit, no interlace)                      */
/* -------------------------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let crc = -1
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ -1) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

function encodePng(width, height, rgb) {
  const stride = width * 3
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // colour type: truecolour
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* -------------------------------------------------------------------------- */
/* Drawing helpers                                                            */
/* -------------------------------------------------------------------------- */

const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value)
const mix = (a, b, t) => a + (b - a) * t

/** Radial falloff, 1 at the centre and 0 at `radius`. */
function falloff(distance, radius) {
  const t = clamp01(1 - distance / radius)
  return t * t * (3 - 2 * t)
}

/* -------------------------------------------------------------------------- */
/* Compose the card                                                           */
/* -------------------------------------------------------------------------- */

function render() {
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 3)

  // Base vertical gradient: #080b13 -> #04060a
  const top = [8, 11, 19]
  const bottom = [4, 6, 10]

  // Accent washes
  const washes = [
    { x: 600, y: 90, radius: 760, rgb: [74, 115, 255], strength: 0.26 },
    { x: 1080, y: 600, radius: 560, rgb: [157, 182, 255], strength: 0.11 },
  ]

  // "P" mark geometry
  const markX = WIDTH / 2
  const markY = HEIGHT / 2 - 22
  const markRadius = 92
  const markStroke = 26
  const markCapRadius = markStroke / 2

  // Grid
  const gridStep = 72
  const gridAlpha = 0.05
  const gridWidth = 1

  // Hairline frame
  const frameInset = 26
  const frameWidth = 1.5

  // Accent rule beneath the mark
  const ruleY = markY + 150
  const ruleHalfWidth = 130
  const ruleThickness = 2

  for (let y = 0; y < HEIGHT; y += 1) {
    const vertical = y / (HEIGHT - 1)

    for (let x = 0; x < WIDTH; x += 1) {
      let r = mix(top[0], bottom[0], vertical)
      let g = mix(top[1], bottom[1], vertical)
      let b = mix(top[2], bottom[2], vertical)

      // Electric washes
      for (const wash of washes) {
        const amount = falloff(Math.hypot(x - wash.x, y - wash.y), wash.radius) * wash.strength
        if (amount > 0) {
          r = mix(r, wash.rgb[0], amount)
          g = mix(g, wash.rgb[1], amount)
          b = mix(b, wash.rgb[2], amount)
        }
      }

      // Masked technical grid, faded out towards the edges
      const gridFade = falloff(Math.hypot((x - WIDTH / 2) / 0.9, y / 0.72), HEIGHT * 0.95)
      const onGridX = Math.abs((x % gridStep) - 0) < gridWidth / 2 || Math.abs((x % gridStep) - gridStep) < gridWidth / 2
      const onGridY = Math.abs((y % gridStep) - 0) < gridWidth / 2 || Math.abs((y % gridStep) - gridStep) < gridWidth / 2
      if (onGridX || onGridY) {
        const amount = gridAlpha * gridFade
        r = mix(r, 221, amount)
        g = mix(g, 225, amount)
        b = mix(b, 233, amount)
      }

      // Vignette
      const edge = Math.hypot((x - WIDTH / 2) / (WIDTH / 2), (y - HEIGHT / 2) / (HEIGHT / 2))
      const vignette = 1 - 0.42 * clamp01((edge - 0.55) / 0.75)
      r *= vignette
      g *= vignette
      b *= vignette

      // Mark: open ring on the left with round caps, plus a solid dot
      const ringDistance = Math.abs(Math.hypot(x - markX, y - markY) - markRadius)
      const angle = Math.atan2(-(y - markY), x - markX) // y-up angle
      const onArc = angle >= Math.PI / 2 - 0.02 && angle <= (3 * Math.PI) / 2 + 0.02
      const capDistance = Math.min(
        Math.hypot(x - markX, y - (markY - markRadius)),
        Math.hypot(x - markX, y - (markY + markRadius)),
      )
      const strokeMask = (onArc && ringDistance <= markCapRadius) || capDistance <= markCapRadius

      const dotDistance = Math.hypot(x - (markX + markRadius), y - markY)
      const markMask = strokeMask || dotDistance <= 20

      if (markMask) {
        r = 247
        g = 248
        b = 250
      } else if (dotDistance <= 34 && dotDistance > 20) {
        // soft glow halo around the accent dot
        const halo = (1 - (dotDistance - 20) / 14) * 0.35
        r = mix(r, 74, halo)
        g = mix(g, 115, halo)
        b = mix(b, 255, halo)
      }

      // Accent rule
      if (Math.abs(y - ruleY) <= ruleThickness / 2 && Math.abs(x - markX) <= ruleHalfWidth) {
        r = mix(r, 74, 0.85)
        g = mix(g, 115, 0.85)
        b = mix(b, 255, 0.85)
      }

      // Hairline frame
      const toFrame = Math.min(
        x - frameInset,
        y - frameInset,
        WIDTH - 1 - x - frameInset,
        HEIGHT - 1 - y - frameInset,
      )
      if (toFrame >= 0 && toFrame <= frameWidth) {
        r = mix(r, 157, 0.28)
        g = mix(g, 168, 0.28)
        b = mix(b, 190, 0.28)
      }

      const offset = (y * WIDTH + x) * 3
      pixels[offset] = Math.max(0, Math.min(255, Math.round(r)))
      pixels[offset + 1] = Math.max(0, Math.min(255, Math.round(g)))
      pixels[offset + 2] = Math.max(0, Math.min(255, Math.round(b)))
    }
  }

  return pixels
}

writeFileSync(OUTPUT, encodePng(WIDTH, HEIGHT, render()))
console.log(`Wrote ${OUTPUT} (${WIDTH}x${HEIGHT})`)
