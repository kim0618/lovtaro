/**
 * 2026-04-16 목요일 shortform scene03 이미지 생성
 * - 1080x1920 (9:16)
 * - High Priestess 카드 작게 좌상단 (18-20% 높이, 약간 기울임)
 * - 골드 구분선
 * - 메인 해석 텍스트 중앙
 * - 하단 CTA 넛지
 *
 * 실행: node scripts/generate-shortform-scene03.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-04-16_thu/shortform')

const W = 1080, H = 1920

function generateStars(count, xMin, xMax, yMin, yMax) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51,0.29,0.94,0.61,0.03,0.76,0.42,0.88,0.17,0.55,0.33,0.69]
  const colors = ['#e8d48b','#c9a84c','#d4b85c']
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = 0.8 + seed[(i + 3) % seed.length] * 1.5
    const opacity = 0.2 + seed[(i + 5) % seed.length] * 0.4
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${colors[i % colors.length]}" opacity="${opacity.toFixed(2)}"/>\n`
  }
  return stars
}

async function loadCard(slug, w, h) {
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) { console.error(`카드 없음: ${p}`); return null }
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

async function generate() {
  // Bigger card: ~25% of 1920 = ~480px height, aspect ~2:3 → width ~320
  const cardH = 480, cardW = 320
  const cardLeft = Math.round((W - cardW) / 2)  // centered
  const cardTop = 120

  const cardImg = await loadCard('high-priestess', cardW, cardH)
  if (!cardImg) { console.error('❌ high-priestess.png 없음'); process.exit(1) }
  const masked = await roundImg(cardImg, cardW, cardH, 16)

  const stars = generateStars(15, 30, 1050, 50, 1870)

  // Gold divider line Y position (below card area)
  const dividerY = cardTop + cardH + 50

  // Main text area (tighter to divider)
  const textStartY = dividerY + 130

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0%" stop-color="#0c0a24"/>
      <stop offset="40%" stop-color="#100e2a"/>
      <stop offset="100%" stop-color="#07060f"/>
    </linearGradient>
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/>
      <stop offset="20%" stop-color="#c9a84c" stop-opacity="0.4"/>
      <stop offset="80%" stop-color="#e8d48b" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
    </linearGradient>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="cardShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Subtle warm haze -->
  <ellipse cx="540" cy="900" rx="400" ry="500" fill="#1a1040" opacity="0.15"/>
  <ellipse cx="250" cy="400" rx="200" ry="200" fill="#2d1b69" opacity="0.06"/>

  <!-- Stars (sparse) -->
  ${stars}

  <!-- Gold divider line -->
  <line x1="80" y1="${dividerY}" x2="1000" y2="${dividerY}" stroke="url(#goldLine)" stroke-width="1.5"/>

  <!-- Main interpretation text (quote block) -->
  <g filter="url(#textGlow)">
    <text x="540" y="${textStartY}" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#f0e6cc" letter-spacing="1" font-weight="500" opacity="0.95">"표현을 못 하는 거지,</text>
    <text x="540" y="${textStartY + 68}" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#f0e6cc" letter-spacing="1" font-weight="500" opacity="0.95">마음이 없는 건 아니야."</text>
  </g>

  <!-- Secondary text -->
  <text x="540" y="${textStartY + 190}" text-anchor="middle" font-family="sans-serif" font-size="38" fill="rgba(240,230,204,0.7)" font-weight="400" letter-spacing="1">그 사람은 지금</text>
  <text x="540" y="${textStartY + 248}" text-anchor="middle" font-family="sans-serif" font-size="38" fill="rgba(240,230,204,0.7)" font-weight="400" letter-spacing="1">말할 타이밍을 기다리고 있어.</text>

  <!-- Bottom CTA nudge (bigger, clearer) -->
  <text x="540" y="${textStartY + 400}" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#c9a84c" opacity="0.5" letter-spacing="2">더 자세한 흐름은 프로필 링크에서</text>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()

  const result = await sharp(base)
    .composite([{
      input: masked,
      left: cardLeft,
      top: cardTop
    }])
    .png({ quality: 90 }).toBuffer()

  mkdirSync(outputDir, { recursive: true })
  const outPath = resolve(outputDir, 'scene03.png')
  writeFileSync(outPath, result)
  console.log(`✅ scene03.png 생성 완료: ${outPath} (${(result.length / 1024).toFixed(0)} KB)`)
}

generate().catch(err => { console.error('❌ 생성 실패:', err); process.exit(1) })
