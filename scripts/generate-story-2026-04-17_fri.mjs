/**
 * 2026-04-17 금요일 story 이미지 생성 (마이너 아르카나)
 * - story01: Knight of Cups + "감정을 안고 멈춰 있는 누군가"
 * - 카드 경로: public/images/mcards/cups/Knight of Cups.png
 * - 영어 카드명: Georgia, serif / 한국어 문구: sans-serif
 *
 * 실행: node scripts/generate-story-2026-04-17_fri.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const mcardsDir = resolve(rootDir, 'public/images/mcards')
const outputDir = resolve(rootDir, 'content-output/2026-04-17_fri/story')
const W = 1080, H = 1920

function generateStars(count, xMin, xMax, yMin, yMax) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51,0.29,0.94,0.61,0.03,0.76,0.42,0.88,0.17,0.55,0.33,0.69]
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = 1 + seed[(i + 3) % seed.length] * 2.5
    const opacity = 0.3 + seed[(i + 5) % seed.length] * 0.7
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="rgba(255,255,255,${opacity.toFixed(2)})"/>\n`
  }
  return stars
}

async function loadCard(suit, name, w, h) {
  const p = resolve(mcardsDir, suit, `${name}.png`)
  if (!existsSync(p)) { console.error(`카드 없음: ${p}`); return null }
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

async function main() {
  console.log('=== 2026-04-17 story 이미지 생성 (마이너 아르카나) ===')
  mkdirSync(outputDir, { recursive: true })

  const cW = 680, cH = 930
  const cardLeft = (W - cW) / 2
  const cardTop = 170

  const img = await loadCard('cups', 'Knight of Cups', cW, cH)
  if (!img) { console.error('❌ Knight of Cups.png 없음'); process.exit(1) }
  const masked = await roundImg(img, cW, cH, 20)

  const stars = generateStars(15, 50, 1030, 30, 160)
  const textAreaTop = cardTop + cH + 50
  const engNameY = textAreaTop + 40
  const hookStartY = engNameY + 80
  const hookLines = ['감정을 안고 멈춰 있는 누군가', '곧 움직이기 시작할 거예요']
  const keywords = ['감정의 전달자', '다가옴', '진심']

  const hookSvg = hookLines.map((l, i) =>
    `<text x="540" y="${hookStartY + i * 55}" font-family="sans-serif" font-size="38" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const kwY = hookStartY + hookLines.length * 64 + 35
  const kwText = keywords.map(k => esc(k)).join('  ·  ')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#08061A"/>
      <stop offset="30%" stop-color="#0E0F2E"/>
      <stop offset="70%" stop-color="#0D0E28"/>
      <stop offset="100%" stop-color="#06050F"/>
    </linearGradient>
    <radialGradient id="cardGlow" cx="50%" cy="40%" r="38%">
      <stop offset="0%" stop-color="rgba(140,120,220,0.15)"/>
      <stop offset="60%" stop-color="rgba(100,80,180,0.05)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="${cardTop + cH / 2}" rx="500" ry="650" fill="url(#cardGlow)"/>
  ${stars}
  <text x="540" y="100" font-family="sans-serif" font-size="26" fill="rgba(180,170,230,0.75)" text-anchor="middle" letter-spacing="10" font-weight="300">오늘의 연애 카드</text>
  <line x1="380" y1="120" x2="700" y2="120" stroke="rgba(180,170,230,0.15)" stroke-width="1"/>
  <rect x="${cardLeft - 4}" y="${cardTop - 4}" width="${cW + 8}" height="${cH + 8}" rx="24" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#glow1)"/>
  <!-- 영어 카드명: Georgia, serif italic -->
  <text x="540" y="${engNameY}" font-family="Georgia, serif" font-size="22" font-style="italic" fill="rgba(200,180,140,0.65)" text-anchor="middle">Knight of Cups</text>
  <!-- 한국어 훅: sans-serif -->
  ${hookSvg}
  <text x="540" y="${kwY}" font-family="sans-serif" font-size="20" fill="rgba(180,170,220,0.45)" text-anchor="middle" letter-spacing="2">${kwText}</text>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  const result = await sharp(base)
    .composite([{ input: masked, left: cardLeft, top: cardTop }])
    .png({ quality: 90 }).toBuffer()

  writeFileSync(resolve(outputDir, 'story01.png'), result)
  console.log(`✅ story01.png (${(result.length / 1024).toFixed(0)} KB)`)
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
