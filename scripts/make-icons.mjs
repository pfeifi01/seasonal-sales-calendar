/**
 * Render the app icons as real PNGs.
 *
 * An installable web app needs raster icons — SVG support in web app
 * manifests is inconsistent across Android launchers. Rather than pull in
 * a rendering dependency for one flat mark, this rasterises the shape
 * directly and encodes the PNG with Node's built-in zlib.
 *
 *   node scripts/make-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public')

const AMBER = [245, 158, 11]
const INK = [11, 13, 20]

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

/** RGBA pixel buffer -> PNG. */
function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  // 10..12 stay zero: deflate, adaptive filtering, no interlace

  // Each scanline is prefixed with its filter byte; 0 = none.
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/** Signed distance to a rounded rectangle, for cheap anti-aliasing. */
function roundedRectInside(x, y, w, h, radius) {
  const dx = Math.max(Math.max(radius - x, x - (w - radius)), 0)
  const dy = Math.max(Math.max(radius - y, y - (h - radius)), 0)
  return radius - Math.hypot(dx, dy)
}

/**
 * The mark, matching favicon.svg: a dark tile carrying an amber price tag —
 * a rounded square turned 45° with a punched hole near one corner.
 *
 * `maskable` fills the whole canvas and shrinks the glyph into the inner
 * safe zone, because Android crops maskable icons to its own shape and a
 * pre-rounded tile would end up clipped twice.
 */
function render(size, { maskable }) {
  const rgba = Buffer.alloc(size * size * 4)
  const ss = 3 // supersampling factor per axis
  const tileRadius = maskable ? 0 : size * 0.22

  const cx = size / 2
  const cy = size / 2
  const half = size * (maskable ? 0.24 : 0.3) // half-width of the tag square
  const tagRadius = half * 0.22
  const holeOffset = half * 0.5
  const holeR = half * 0.19

  const COS = Math.SQRT1_2 // cos(-45°)
  const SIN = -Math.SQRT1_2 // sin(-45°)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let tile = 0
      let tag = 0
      let hole = 0

      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px = x + (sx + 0.5) / ss
          const py = y + (sy + 0.5) / ss

          if (maskable || roundedRectInside(px, py, size, size, tileRadius) >= 0) tile++

          // Rotate the sample into the tag's own frame, where it is an
          // ordinary axis-aligned rounded square.
          const ox = px - cx
          const oy = py - cy
          const rx = ox * COS - oy * SIN
          const ry = ox * SIN + oy * COS

          if (roundedRectInside(rx + half, ry + half, half * 2, half * 2, tagRadius) >= 0) tag++
          if (Math.hypot(rx - holeOffset, ry + holeOffset) <= holeR) hole++
        }
      }

      const total = ss * ss
      const tileA = tile / total
      // The hole only punches through where the tag actually is.
      const tagA = Math.max(tag / total - hole / total, 0)

      const i = (y * size + x) * 4
      rgba[i] = Math.round(INK[0] * (1 - tagA) + AMBER[0] * tagA)
      rgba[i + 1] = Math.round(INK[1] * (1 - tagA) + AMBER[1] * tagA)
      rgba[i + 2] = Math.round(INK[2] * (1 - tagA) + AMBER[2] * tagA)
      rgba[i + 3] = Math.round(255 * Math.max(tileA, tagA))
    }
  }
  return encodePng(size, size, rgba)
}

mkdirSync(OUT_DIR, { recursive: true })

const targets = [
  ['icon-192.png', 192, { maskable: false }],
  ['icon-512.png', 512, { maskable: false }],
  ['icon-maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, { maskable: true }],
]

for (const [name, size, opts] of targets) {
  const png = render(size, opts)
  writeFileSync(resolve(OUT_DIR, name), png)
  console.log(`[make-icons] ${name} (${size}x${size}, ${png.length} bytes)`)
}
