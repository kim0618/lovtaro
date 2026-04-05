import sharp from 'sharp'
import { mkdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = '/mnt/c/Users/user/Downloads'
const destDir = join(__dirname, '..', 'public', 'images', 'cards')

const nameMap = {
  'The Fool': 'fool',
  'The Magician': 'magician',
  'The High Priestess': 'high-priestess',
  'The Empress': 'empress',
  'The Emperor': 'emperor',
  'The Hierophant': 'hierophant',
  'The Lovers': 'lovers',
  'The Chariot': 'chariot',
  'Strength': 'strength',
  'The Hermit': 'hermit',
  'Wheel of Fortune': 'wheel-of-fortune',
  'Justice': 'justice',
  'The Hanged Man': 'hanged-man',
  'Death': 'death',
  'Temperance': 'temperance',
  'The Devil': 'devil',
  'The Tower': 'tower',
  'The Star': 'star',
  'The Moon': 'moon',
  'The Sun': 'sun',
  'Judgement': 'judgement',
  'The World': 'world',
}

mkdirSync(destDir, { recursive: true })

for (const [origName, slug] of Object.entries(nameMap)) {
  const src = join(srcDir, `${origName}.png`)
  const dest = join(destDir, `${slug}.webp`)
  try {
    await sharp(src)
      .resize(600, 900, { fit: 'cover' })
      .webp({ quality: 82 })
      .toFile(dest)
    const kb = (statSync(dest).size / 1024).toFixed(0)
    console.log(`✓ ${origName} → ${slug}.webp (${kb}KB)`)
  } catch (e) {
    console.log(`✗ ${origName} — ${e.message}`)
  }
}

console.log('\nDone!')
