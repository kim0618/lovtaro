/**
 * 2026-04-16 목요일 shortform scene01 이미지 생성
 * - 1080x1920 (9:16) 세로형
 * - 다크 네이비/퍼플 우주 배경 + 골드 별
 * - LOVTARO 카드 뒷면 (SVG 렌더링) 중앙 배치
 * - 상단 한국어 텍스트: "연락이 뜸해진 그 사람, / 마음이 없는 걸까?"
 * - 하단 워터마크: @lovtarot_
 *
 * 실행: node scripts/generate-shortform-scene01.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const outputDir = resolve(rootDir, 'content-output/2026-04-16_thu/shortform')

const W = 1080, H = 1920

// Deterministic star generation
function generateStars(count, xMin, xMax, yMin, yMax, goldMode = false) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51,0.29,0.94,0.61,0.03,0.76,0.42,0.88,0.17,0.55,0.33,0.69]
  const goldColors = ['#e8d48b','#c9a84c','#d4b85c']
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = goldMode ? (1 + seed[(i + 3) % seed.length] * 2) : (0.8 + seed[(i + 3) % seed.length] * 1.5)
    const opacity = goldMode ? (0.4 + seed[(i + 5) % seed.length] * 0.5) : (0.2 + seed[(i + 5) % seed.length] * 0.3)
    const fill = goldMode ? goldColors[i % goldColors.length] : `rgba(139,127,176,${opacity.toFixed(2)})`
    const finalOpacity = goldMode ? opacity.toFixed(2) : '1'
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${fill}" opacity="${finalOpacity}"/>\n`
  }
  return stars
}

// Card back SVG (rendered inline, based on brand design)
function cardBackSvg(cx, cy) {
  return `
    <!-- Card back -->
    <g transform="translate(${cx}, ${cy})">
      <!-- Card base -->
      <rect x="-165" y="-240" width="330" height="480" rx="16" ry="16" fill="url(#cardBg)" stroke="url(#cardBorder)" stroke-width="3"/>
      <!-- Inner border -->
      <rect x="-148" y="-223" width="296" height="446" rx="10" ry="10" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.4"/>
      <!-- Corner ornaments -->
      <g stroke="url(#patternGold)" fill="none" stroke-width="1.2" opacity="0.5">
        <path d="M-130,-205 C-130,-185 -115,-185 -110,-205"/>
        <path d="M-130,-205 C-110,-205 -110,-190 -130,-185"/>
        <path d="M130,-205 C130,-185 115,-185 110,-205"/>
        <path d="M130,-205 C110,-205 110,-190 130,-185"/>
        <path d="M-130,205 C-130,185 -115,185 -110,205"/>
        <path d="M-130,205 C-110,205 -110,190 -130,185"/>
        <path d="M130,205 C130,185 115,185 110,205"/>
        <path d="M130,205 C110,205 110,190 130,185"/>
      </g>
      <!-- Outer circle -->
      <circle cx="0" cy="0" r="120" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.3"/>
      <circle cx="0" cy="0" r="105" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>
      <!-- Inner diamond -->
      <polygon points="0,-90 75,0 0,90 -75,0" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.35"/>
      <!-- Star burst -->
      <g stroke="#c9a84c" stroke-width="1" opacity="0.4">
        <line x1="0" y1="-65" x2="0" y2="65"/>
        <line x1="-65" y1="0" x2="65" y2="0"/>
        <line x1="-46" y1="-46" x2="46" y2="46"/>
        <line x1="46" y1="-46" x2="-46" y2="46"/>
      </g>
      <!-- Central circle with crescent -->
      <circle cx="0" cy="0" r="35" fill="none" stroke="#e8d48b" stroke-width="1.5" opacity="0.5"/>
      <path d="M-8,-20 A22,22 0 1,1 -8,20 A16,16 0 1,0 -8,-20" fill="#c9a84c" opacity="0.3"/>
      <!-- Decorative dots -->
      <circle cx="0" cy="-35" r="3" fill="#c9a84c" opacity="0.5"/>
      <circle cx="0" cy="35" r="3" fill="#c9a84c" opacity="0.5"/>
      <circle cx="-35" cy="0" r="3" fill="#c9a84c" opacity="0.5"/>
      <circle cx="35" cy="0" r="3" fill="#c9a84c" opacity="0.5"/>
      <!-- Cardinal stars -->
      <g fill="#e8d48b" opacity="0.45">
        <polygon points="0,-122 3,-115 0,-108 -3,-115"/>
        <polygon points="0,108 3,115 0,122 -3,115"/>
        <polygon points="-122,0 -115,3 -108,0 -115,-3"/>
        <polygon points="108,0 115,3 122,0 115,-3"/>
      </g>
      <!-- Vertical accents -->
      <line x1="-50" y1="-170" x2="-50" y2="-130" stroke="#c9a84c" stroke-width="0.8" opacity="0.25"/>
      <line x1="50" y1="-170" x2="50" y2="-130" stroke="#c9a84c" stroke-width="0.8" opacity="0.25"/>
      <line x1="-50" y1="130" x2="-50" y2="170" stroke="#c9a84c" stroke-width="0.8" opacity="0.25"/>
      <line x1="50" y1="130" x2="50" y2="170" stroke="#c9a84c" stroke-width="0.8" opacity="0.25"/>
      <!-- Top/bottom crescents -->
      <path d="M-25,-155 A15,15 0 0,1 25,-155" fill="none" stroke="#c9a84c" stroke-width="0.8" opacity="0.3"/>
      <path d="M-25,155 A15,15 0 0,0 25,155" fill="none" stroke="#c9a84c" stroke-width="0.8" opacity="0.3"/>
      <!-- LOVTARO text -->
      <text x="0" y="-185" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="6" fill="#c9a84c" opacity="0.45">LOVTARO</text>
      <text x="0" y="198" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="6" fill="#c9a84c" opacity="0.45">LOVTARO</text>
    </g>`
}

async function generate() {
  const goldStars = generateStars(40, 30, 1050, 100, 1800, true)
  const dimStars = generateStars(40, 30, 1050, 100, 1800, false)

  const cardCenterX = 540
  const cardCenterY = 1050

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%" fx="50%" fy="45%">
      <stop offset="0%" stop-color="#1a1040"/>
      <stop offset="40%" stop-color="#110d2e"/>
      <stop offset="100%" stop-color="#07060f"/>
    </radialGradient>
    <radialGradient id="cardGlowBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0.15"/>
      <stop offset="50%" stop-color="#8b6fb0" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#1a1040" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1545"/>
      <stop offset="50%" stop-color="#2a1f5e"/>
      <stop offset="100%" stop-color="#1a1040"/>
    </linearGradient>
    <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c9a84c"/>
      <stop offset="50%" stop-color="#e8d48b"/>
      <stop offset="100%" stop-color="#a08030"/>
    </linearGradient>
    <linearGradient id="patternGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#e8d48b" stop-opacity="0.3"/>
    </linearGradient>
    <filter id="bigGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="90"/>
    </filter>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bgGlow)"/>

  <!-- Atmospheric haze (richer nebula) -->
  <ellipse cx="540" cy="850" rx="550" ry="500" fill="#2d1b69" opacity="0.15"/>
  <ellipse cx="300" cy="500" rx="350" ry="300" fill="#3d2080" opacity="0.08"/>
  <ellipse cx="780" cy="1100" rx="300" ry="280" fill="#2a1560" opacity="0.08"/>
  <ellipse cx="200" cy="1400" rx="250" ry="200" fill="#321a6e" opacity="0.06"/>
  <ellipse cx="850" cy="400" rx="200" ry="180" fill="#2d1b69" opacity="0.05"/>

  <!-- Card glow behind card (wider, softer) -->
  <ellipse cx="${cardCenterX}" cy="${cardCenterY}" rx="380" ry="450" fill="url(#cardGlowBg)" filter="url(#bigGlow)"/>
  <ellipse cx="${cardCenterX}" cy="${cardCenterY - 30}" rx="250" ry="300" fill="#c9a84c" opacity="0.04" filter="url(#bigGlow)"/>
  <ellipse cx="${cardCenterX}" cy="${cardCenterY}" rx="200" ry="250" fill="#8b6fb0" opacity="0.04" filter="url(#bigGlow)"/>

  <!-- Gold stars -->
  ${goldStars}
  <!-- Dim stars -->
  ${dimStars}

  <!-- Card back (centered) -->
  <g filter="url(#cardShadow)">
    ${cardBackSvg(cardCenterX, cardCenterY)}
  </g>

  <!-- Hook text -->
  <g filter="url(#textGlow)">
    <text x="540" y="360" text-anchor="middle" font-family="sans-serif" font-size="54" fill="#f0e6cc" letter-spacing="2" opacity="0.95" font-weight="500">연락이 뜸해진 그 사람,</text>
    <text x="540" y="440" text-anchor="middle" font-family="sans-serif" font-size="54" fill="#f0e6cc" letter-spacing="2" opacity="0.95" font-weight="500">마음이 없는 걸까?</text>
  </g>

  <!-- Bottom watermark -->
  <text x="540" y="1780" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#c9a84c" opacity="0.35" letter-spacing="2">@lovtarot_</text>
</svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()

  mkdirSync(outputDir, { recursive: true })
  const outPath = resolve(outputDir, 'scene01.png')
  writeFileSync(outPath, buf)
  console.log(`✅ scene01.png 생성 완료: ${outPath} (${(buf.length / 1024).toFixed(0)} KB)`)
}

generate().catch(err => { console.error('❌ 생성 실패:', err); process.exit(1) })
