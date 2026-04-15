/**
 * 2026-04-19 일요일 story 이미지 생성 (story만 운영)
 * - story01: Star 카드 + "이번 주도 수고했어요" 마무리
 * - story02는 사용 안 함 (story01만 생성)
 *
 * 실행: node scripts/generate-story-2026-04-19_sun.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-04-19_sun/story')
const W = 1080, H = 1920

function generateStars(count, xMin, xMax, yMin, yMax) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51,0.29,0.94,0.61,0.03,0.76,0.42,0.88,0.17,0.55,0.33,0.69]
  const colors = ['#e8d48b','#c9a84c','#d4b85c']
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = 1 + seed[(i + 3) % seed.length] * 2.5
    const opacity = 0.3 + seed[(i + 5) % seed.length] * 0.6
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${colors[i % colors.length]}" opacity="${opacity.toFixed(2)}"/>\n`
  }
  return stars
}

async function loadCard(slug, w, h) {
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) return null
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

async function main() {
  console.log('=== 2026-04-19 story 이미지 생성 ===')
  mkdirSync(outputDir, { recursive: true })

  const cW = 600, cH = 800
  const cardTop = 280
  const cardLeft = (W - cW) / 2

  const cardImg = await loadCard('star', cW, cH)
  if (!cardImg) { console.error('❌ star.png 없음'); process.exit(1) }
  const masked = await roundImg(cardImg, cW, cH, 20)

  const stars = generateStars(30, 50, 1030, 50, 1850)
  const textY = cardTop + cH + 80

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0%" stop-color="#08061A"/><stop offset="30%" stop-color="#0E0F2E"/><stop offset="70%" stop-color="#0D0E28"/><stop offset="100%" stop-color="#06050F"/></linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="40%"><stop offset="0%" stop-color="rgba(140,120,220,0.15)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient>
    <filter id="glowF" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
    <filter id="tg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="700" rx="450" ry="500" fill="url(#glow)"/>
  ${stars}
  <text x="540" y="180" font-family="sans-serif" font-size="26" fill="rgba(180,170,230,0.7)" text-anchor="middle" letter-spacing="10" font-weight="300">오늘의 연애 카드</text>
  <line x1="380" y1="200" x2="700" y2="200" stroke="rgba(180,170,230,0.15)" stroke-width="1"/>
  <rect x="${cardLeft - 3}" y="${cardTop - 3}" width="${cW + 6}" height="${cH + 6}" rx="23" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#glowF)"/>
  <g filter="url(#tg)">
    <text x="540" y="${textY}" text-anchor="middle" font-family="sans-serif" font-size="44" fill="#f0e6cc" letter-spacing="2" font-weight="500" opacity="0.95">이번 주도 수고했어요</text>
    <text x="540" y="${textY + 70}" text-anchor="middle" font-family="sans-serif" font-size="30" fill="rgba(232,212,139,0.55)" letter-spacing="3">내일은 새로운 카드가 기다리고 있어요 ✨</text>
  </g>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  const result = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'story01.png'), result)
  console.log(`✅ story01.png (${(result.length / 1024).toFixed(0)} KB)`)
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
