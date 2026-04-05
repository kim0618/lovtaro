import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgPath = resolve(__dirname, '../public/og-image.svg')
const pngPath = resolve(__dirname, '../public/og-image.png')

const svg = readFileSync(svgPath)

await sharp(svg, { density: 150 })
  .resize(1200, 630)
  .png({ quality: 90 })
  .toFile(pngPath)

console.log('og-image.png generated (1200x630)')
