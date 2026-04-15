/**
 * 2026-04-16 목요일 참여형 shortform 이미지 생성
 * - scene01: 질문 훅 + 카드 뒷면 3장 + 번호 표시
 * - scene02: 댓글 CTA 텍스트 + 우주 배경
 *
 * 실행: node scripts/generate-shortform-2026-04-16_thu.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const outputDir = resolve(rootDir, 'content-output/2026-04-16_thu/shortform')

const W = 1080, H = 1920

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

function cardBackSvg(cx, cy, scale = 1) {
  const s = scale
  return `
    <g transform="translate(${cx}, ${cy}) scale(${s})">
      <rect x="-165" y="-240" width="330" height="480" rx="16" ry="16" fill="url(#cardBg)" stroke="url(#cardBorder)" stroke-width="3"/>
      <rect x="-148" y="-223" width="296" height="446" rx="10" ry="10" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.4"/>
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
      <circle cx="0" cy="0" r="120" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.3"/>
      <circle cx="0" cy="0" r="105" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>
      <polygon points="0,-90 75,0 0,90 -75,0" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.35"/>
      <g stroke="#c9a84c" stroke-width="1" opacity="0.4">
        <line x1="0" y1="-65" x2="0" y2="65"/>
        <line x1="-65" y1="0" x2="65" y2="0"/>
        <line x1="-46" y1="-46" x2="46" y2="46"/>
        <line x1="46" y1="-46" x2="-46" y2="46"/>
      </g>
      <circle cx="0" cy="0" r="35" fill="none" stroke="#e8d48b" stroke-width="1.5" opacity="0.5"/>
      <path d="M-8,-20 A22,22 0 1,1 -8,20 A16,16 0 1,0 -8,-20" fill="#c9a84c" opacity="0.3"/>
      <circle cx="0" cy="-35" r="3" fill="#c9a84c" opacity="0.5"/>
      <circle cx="0" cy="35" r="3" fill="#c9a84c" opacity="0.5"/>
      <circle cx="-35" cy="0" r="3" fill="#c9a84c" opacity="0.5"/>
      <circle cx="35" cy="0" r="3" fill="#c9a84c" opacity="0.5"/>
      <g fill="#e8d48b" opacity="0.45">
        <polygon points="0,-122 3,-115 0,-108 -3,-115"/>
        <polygon points="0,108 3,115 0,122 -3,115"/>
        <polygon points="-122,0 -115,3 -108,0 -115,-3"/>
        <polygon points="108,0 115,3 122,0 115,-3"/>
      </g>
      <line x1="-50" y1="-170" x2="-50" y2="-130" stroke="#c9a84c" stroke-width="0.8" opacity="0.25"/>
      <line x1="50" y1="-170" x2="50" y2="-130" stroke="#c9a84c" stroke-width="0.8" opacity="0.25"/>
      <line x1="-50" y1="130" x2="-50" y2="170" stroke="#c9a84c" stroke-width="0.8" opacity="0.25"/>
      <line x1="50" y1="130" x2="50" y2="170" stroke="#c9a84c" stroke-width="0.8" opacity="0.25"/>
      <path d="M-25,-155 A15,15 0 0,1 25,-155" fill="none" stroke="#c9a84c" stroke-width="0.8" opacity="0.3"/>
      <path d="M-25,155 A15,15 0 0,0 25,155" fill="none" stroke="#c9a84c" stroke-width="0.8" opacity="0.3"/>
      <text x="0" y="-185" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="6" fill="#c9a84c" opacity="0.45">LOVTARO</text>
      <text x="0" y="198" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="6" fill="#c9a84c" opacity="0.45">LOVTARO</text>
    </g>`
}

async function generateScene01() {
  const goldStars = generateStars(40, 30, 1050, 100, 1800, true)
  const dimStars = generateStars(40, 30, 1050, 100, 1800, false)

  // 3 cards side by side, scale=0.6 → card width ~198, height ~288
  const cardScale = 0.6
  const cardGap = 60
  const cardW = 330 * cardScale
  const totalWidth = cardW * 3 + cardGap * 2
  const startX = (W - totalWidth) / 2 + cardW / 2
  const cardY = 980

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%" fx="50%" fy="45%">
      <stop offset="0%" stop-color="#1a1040"/>
      <stop offset="40%" stop-color="#110d2e"/>
      <stop offset="100%" stop-color="#07060f"/>
    </radialGradient>
    <radialGradient id="cardGlowBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0.12"/>
      <stop offset="50%" stop-color="#8b6fb0" stop-opacity="0.05"/>
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
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGlow)"/>

  <ellipse cx="540" cy="850" rx="550" ry="500" fill="#2d1b69" opacity="0.15"/>
  <ellipse cx="300" cy="500" rx="350" ry="300" fill="#3d2080" opacity="0.08"/>
  <ellipse cx="780" cy="1100" rx="300" ry="280" fill="#2a1560" opacity="0.08"/>

  <ellipse cx="540" cy="${cardY}" rx="400" ry="350" fill="url(#cardGlowBg)" filter="url(#bigGlow)"/>

  ${goldStars}
  ${dimStars}

  <!-- Hook text -->
  <g filter="url(#textGlow)">
    <text x="540" y="340" text-anchor="middle" font-family="sans-serif" font-size="54" fill="#f0e6cc" letter-spacing="2" opacity="0.95" font-weight="500">그 사람이 보내는 신호,</text>
    <text x="540" y="420" text-anchor="middle" font-family="sans-serif" font-size="54" fill="#f0e6cc" letter-spacing="2" opacity="0.95" font-weight="500">어떤 의미일까?</text>
  </g>

  <!-- 3 card backs -->
  <g filter="url(#cardShadow)">
    ${cardBackSvg(startX, cardY, cardScale)}
    ${cardBackSvg(startX + cardW + cardGap, cardY, cardScale)}
    ${cardBackSvg(startX + (cardW + cardGap) * 2, cardY, cardScale)}
  </g>

  <!-- Number labels -->
  <g filter="url(#textGlow)">
    <text x="${startX}" y="${cardY + 288 * cardScale / 2 + 60}" text-anchor="middle" font-family="sans-serif" font-size="36" fill="#e8d48b" opacity="0.8" font-weight="600">1번</text>
    <text x="${startX + cardW + cardGap}" y="${cardY + 288 * cardScale / 2 + 60}" text-anchor="middle" font-family="sans-serif" font-size="36" fill="#e8d48b" opacity="0.8" font-weight="600">2번</text>
    <text x="${startX + (cardW + cardGap) * 2}" y="${cardY + 288 * cardScale / 2 + 60}" text-anchor="middle" font-family="sans-serif" font-size="36" fill="#e8d48b" opacity="0.8" font-weight="600">3번</text>
  </g>

  <!-- Bottom guide -->
  <text x="540" y="1580" text-anchor="middle" font-family="sans-serif" font-size="36" fill="rgba(240,230,204,0.6)" letter-spacing="3">직감으로 골라보세요</text>

  <text x="540" y="1780" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#c9a84c" opacity="0.35" letter-spacing="2">@lovtarot_</text>
</svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  mkdirSync(outputDir, { recursive: true })
  const outPath = resolve(outputDir, 'scene01.png')
  writeFileSync(outPath, buf)
  console.log(`✅ scene01.png 생성 완료: ${outPath} (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function generateScene02() {
  const goldStars = generateStars(30, 30, 1050, 100, 1800, true)
  const dimStars = generateStars(30, 30, 1050, 100, 1800, false)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bgGlow2" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#1a1040"/>
      <stop offset="40%" stop-color="#110d2e"/>
      <stop offset="100%" stop-color="#07060f"/>
    </radialGradient>
    <filter id="textGlow2" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGlow2)"/>

  <ellipse cx="540" cy="960" rx="500" ry="400" fill="#2d1b69" opacity="0.12"/>
  <ellipse cx="300" cy="600" rx="300" ry="250" fill="#3d2080" opacity="0.06"/>

  ${goldStars}
  ${dimStars}

  <!-- CTA text -->
  <g filter="url(#textGlow2)">
    <text x="540" y="860" text-anchor="middle" font-family="sans-serif" font-size="52" fill="#f0e6cc" letter-spacing="2" opacity="0.95" font-weight="500">댓글에 번호를 남겨주세요</text>
    <text x="540" y="980" text-anchor="middle" font-family="sans-serif" font-size="40" fill="rgba(232,212,139,0.7)" letter-spacing="3">해석을 답글로 알려드릴게요 ✨</text>
  </g>

  <!-- Decorative elements -->
  <line x1="280" y1="780" x2="800" y2="780" stroke="rgba(201,168,76,0.2)" stroke-width="1"/>
  <line x1="280" y1="1060" x2="800" y2="1060" stroke="rgba(201,168,76,0.2)" stroke-width="1"/>

  <text x="540" y="1780" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#c9a84c" opacity="0.35" letter-spacing="2">@lovtarot_</text>
</svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  mkdirSync(outputDir, { recursive: true })
  const outPath = resolve(outputDir, 'scene02.png')
  writeFileSync(outPath, buf)
  console.log(`✅ scene02.png 생성 완료: ${outPath} (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-04-16 참여형 shortform 이미지 생성 ===')
  await generateScene01()
  await generateScene02()
  console.log('완료!')
}

main().catch(err => { console.error('❌ 생성 실패:', err); process.exit(1) })
