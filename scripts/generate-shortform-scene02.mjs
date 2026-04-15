/**
 * 2026-04-16 목요일 shortform scene02 이미지 생성
 * - 1080x1920 (9:16)
 * - High Priestess 카드 앞면 중앙 배치 (45% 높이)
 * - 상단: "여사제 The High Priestess"
 * - 하단: "숨겨진 감정 · 직감 · 침묵"
 * - 카드 뒤 셀레스티얼 글로우 (reveal moment)
 *
 * 실행: node scripts/generate-shortform-scene02.mjs
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
  const colors = ['#e8d48b','#c9a84c','#d4b85c','#9088b8']
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = 0.8 + seed[(i + 3) % seed.length] * 2
    const opacity = 0.3 + seed[(i + 5) % seed.length] * 0.5
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
  // Card: 45% of 1920 = 864px height, aspect ~2:3 → width ~576
  const cardH = 864, cardW = 576
  const cardLeft = Math.round((W - cardW) / 2)
  const cardTop = 380

  const cardImg = await loadCard('high-priestess', cardW, cardH)
  if (!cardImg) { console.error('❌ high-priestess.png 없음'); process.exit(1) }
  const masked = await roundImg(cardImg, cardW, cardH, 20)

  const stars = generateStars(25, 30, 1050, 50, 1870)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#1a1040"/>
      <stop offset="40%" stop-color="#110d2e"/>
      <stop offset="100%" stop-color="#07060f"/>
    </radialGradient>
    <radialGradient id="revealGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0.18"/>
      <stop offset="30%" stop-color="#8b6fb0" stop-opacity="0.1"/>
      <stop offset="70%" stop-color="#4a2d8a" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#1a1040" stop-opacity="0"/>
    </radialGradient>
    <filter id="bigGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="80"/>
    </filter>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="25" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <filter id="borderGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bgGlow)"/>

  <!-- Lighter haze for reveal mood -->
  <ellipse cx="540" cy="750" rx="450" ry="500" fill="#2d1b69" opacity="0.12"/>
  <ellipse cx="540" cy="800" rx="350" ry="400" fill="#3d2080" opacity="0.06"/>

  <!-- Reveal glow behind card -->
  <ellipse cx="540" cy="${cardTop + cardH / 2}" rx="380" ry="500" fill="url(#revealGlow)" filter="url(#bigGlow)"/>
  <ellipse cx="540" cy="${cardTop + cardH / 2 - 40}" rx="200" ry="280" fill="#c9a84c" opacity="0.04" filter="url(#bigGlow)"/>

  <!-- Stars -->
  ${stars}

  <!-- Card border glow -->
  <rect x="${cardLeft - 6}" y="${cardTop - 6}" width="${cardW + 12}" height="${cardH + 12}" rx="24" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#borderGlow)"/>

  <!-- Card name (above card) -->
  <g filter="url(#textGlow)">
    <text x="540" y="280" text-anchor="middle" font-family="sans-serif" font-size="52" fill="#f0e6cc" letter-spacing="4" font-weight="500" opacity="0.95">여사제</text>
    <text x="540" y="330" text-anchor="middle" font-family="sans-serif" font-size="18" fill="rgba(200,190,240,0.45)" letter-spacing="6" font-weight="300">The High Priestess</text>
  </g>

  <!-- Keywords (below card) -->
  <g filter="url(#textGlow)">
    <text x="540" y="${cardTop + cardH + 80}" text-anchor="middle" font-family="sans-serif" font-size="30" fill="rgba(200,180,140,0.6)" letter-spacing="6">숨겨진 감정 · 직감 · 침묵</text>
  </g>

  <!-- Scene02 interpretation text (condensed) -->
  <text x="540" y="${cardTop + cardH + 155}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="rgba(240,230,204,0.8)" font-weight="400">그 사람은 지금</text>
  <text x="540" y="${cardTop + cardH + 205}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="rgba(240,230,204,0.8)" font-weight="400">꺼내지 못하고 있는 상태야.</text>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  const result = await sharp(base)
    .composite([{ input: masked, left: cardLeft, top: cardTop }])
    .png({ quality: 90 }).toBuffer()

  mkdirSync(outputDir, { recursive: true })
  const outPath = resolve(outputDir, 'scene02.png')
  writeFileSync(outPath, result)
  console.log(`✅ scene02.png 생성 완료: ${outPath} (${(result.length / 1024).toFixed(0)} KB)`)
}

generate().catch(err => { console.error('❌ 생성 실패:', err); process.exit(1) })
