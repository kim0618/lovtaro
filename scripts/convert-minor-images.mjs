/**
 * Convert minor arcana PNGs to WebP (600x900) + OG PNGs (1200x630 crop).
 * Matches major arcana specs: 600×900 webp in /images/cards/
 *
 * Input:  public/images/mcards/{suit}/{Name}.png   (1024×1536)
 * Output: public/images/cards/{id}.webp             (600×900)
 *         public/images/cards-png/{id}.png          (1200×630, OG)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MCARDS = path.join(ROOT, 'public/images/mcards')
const OUT_WEBP = path.join(ROOT, 'public/images/cards')
const OUT_PNG = path.join(ROOT, 'public/images/cards-png')

const SUITS = ['cups', 'pentacles', 'swords', 'wands']

// "Ace of Cups.png" → "ace-of-cups"
function toId(filename) {
  return filename
    .replace(/\.png$/i, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
}

async function convert() {
  fs.mkdirSync(OUT_WEBP, { recursive: true })
  fs.mkdirSync(OUT_PNG, { recursive: true })

  let count = 0

  for (const suit of SUITS) {
    const dir = path.join(MCARDS, suit)
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'))

    for (const file of files) {
      const id = toId(file)
      const src = path.join(dir, file)

      // WebP 600x900 (card display)
      const webpOut = path.join(OUT_WEBP, `${id}.webp`)
      await sharp(src)
        .resize(600, 900, { fit: 'cover' })
        .webp({ quality: 82 })
        .toFile(webpOut)

      // PNG 1200x630 (OG image - center crop)
      const pngOut = path.join(OUT_PNG, `${id}.png`)
      await sharp(src)
        .resize(1200, 630, { fit: 'cover', position: 'top' })
        .png({ quality: 85 })
        .toFile(pngOut)

      const webpSize = fs.statSync(webpOut).size
      console.log(`  ✓ ${id}.webp (${Math.round(webpSize / 1024)}KB) + og png`)
      count++
    }
  }

  console.log(`\n[convert] ${count} minor arcana images converted`)
}

convert().catch(err => {
  console.error(err)
  process.exit(1)
})
