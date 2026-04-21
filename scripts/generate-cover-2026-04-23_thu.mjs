/**
 * 2026-04-23 목요일 shortform 커버 이미지
 * - scene01 베이스 유지
 * - 상단 문구를 카드 가운데(중앙)로 이동 - 카드 위에 오버레이
 * - 번호/하단 텍스트 제거 (커버 전용 간결 구성)
 *
 * 실행: node scripts/generate-cover-2026-04-23_thu.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { colorCardBackSvg, colorCardBackDefs, CARD_WIDTH, CARD_HEIGHT } from './lib/color-card-back-svg.mjs'
import { SCHEMES_2026_04_23 } from './lib/schemes-2026-04-23.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const outputDir = resolve(rootDir, 'content-output/2026-04-23_thu/shortform')
const W = 1080, H = 1920

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function genStars(count, seed, xMin, xMax, yMin, yMax, bright = false) {
  const rand = mulberry32(seed)
  const colors = bright
    ? ['#ffe9b3', '#f4d99f', '#e8d48b', '#ffffff', '#fff5d4']
    : ['#e8d48b', '#c9a84c', '#d4b85c', '#b89858', '#8f7a4a']
  let stars = ''
  for (let i = 0; i < count; i++) {
    const x = xMin + rand() * (xMax - xMin)
    const y = yMin + rand() * (yMax - yMin)
    const s = bright ? (1 + rand() * 2.5) : (0.5 + rand() * 1.8)
    const op = bright ? (0.5 + rand() * 0.5) : (0.25 + rand() * 0.55)
    const color = colors[Math.floor(rand() * colors.length)]
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}" fill="${color}" opacity="${op.toFixed(2)}"/>`
  }
  return stars
}

function cosmicDefs() {
  return `
    <radialGradient id="cosmicBg" cx="50%" cy="45%" r="85%">
      <stop offset="0%" stop-color="#1a0f38"/>
      <stop offset="35%" stop-color="#140b2c"/>
      <stop offset="75%" stop-color="#0c0820"/>
      <stop offset="100%" stop-color="#06040f"/>
    </radialGradient>
    <radialGradient id="neb2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(140,70,130,0.18)"/>
      <stop offset="100%" stop-color="rgba(130,60,120,0)"/>
    </radialGradient>
    <radialGradient id="neb3" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(210,150,90,0.14)"/>
      <stop offset="100%" stop-color="rgba(200,140,80,0)"/>
    </radialGradient>
    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,235,180,0.18)"/>
      <stop offset="100%" stop-color="rgba(255,235,180,0)"/>
    </radialGradient>
    <mask id="moonMaskSmall">
      <rect x="0" y="0" width="${W}" height="${H}" fill="black"/>
      <circle cx="115" cy="200" r="34" fill="white"/>
      <circle cx="138" cy="192" r="34" fill="black"/>
    </mask>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="15" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
    <radialGradient id="cardAreaGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0.12"/>
      <stop offset="50%" stop-color="#8b6fb0" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="titleBgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06040f" stop-opacity="0.75"/>
      <stop offset="60%" stop-color="#06040f" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#06040f" stop-opacity="0"/>
    </radialGradient>
    <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
  `
}

function coverBody(starSeed = 1) {
  const stars1 = genStars(260, starSeed, 0, W, 0, H, false)
  const stars2 = genStars(70, starSeed + 11, 0, W, 0, H, true)
  return `
    <rect width="${W}" height="${H}" fill="url(#cosmicBg)"/>
    <ellipse cx="900" cy="1700" rx="500" ry="350" fill="url(#neb3)"/>
    <ellipse cx="180" cy="1550" rx="400" ry="300" fill="url(#neb2)"/>
    ${stars1}
    ${stars2}
    <circle cx="125" cy="205" r="80" fill="url(#moonGlow)"/>
    <rect x="70" y="150" width="120" height="120" fill="rgba(248,230,185,0.9)" mask="url(#moonMaskSmall)"/>
  `
}

async function generateCover() {
  const cardScale = 2.5
  const cardPixelW = CARD_WIDTH * cardScale
  const cardPixelH = CARD_HEIGHT * cardScale
  const cardGap = 50
  const totalWidth = cardPixelW * 3 + cardGap * 2
  const startCX = (W - totalWidth) / 2 + cardPixelW / 2
  const cardY = 980

  const cx1 = startCX
  const cx2 = startCX + cardPixelW + cardGap
  const cx3 = startCX + (cardPixelW + cardGap) * 2

  const [s1, s2, s3] = SCHEMES_2026_04_23
  console.log(`🎴 schemes: ${s1} / ${s2} / ${s3}`)

  const titleY1 = cardY - 30
  const titleY2 = cardY + 55

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      ${colorCardBackDefs()}
    </defs>
    ${coverBody(17)}

    <ellipse cx="540" cy="${cardY}" rx="500" ry="380" fill="url(#cardAreaGlow)" filter="url(#glowBlur)"/>

    <ellipse cx="${cx1}" cy="${cardY}" rx="${cardPixelW * 0.8}" ry="${cardPixelH * 0.55}" fill="url(#colorCardGlow_${s1})" filter="url(#glowBlur)"/>
    <ellipse cx="${cx2}" cy="${cardY}" rx="${cardPixelW * 0.8}" ry="${cardPixelH * 0.55}" fill="url(#colorCardGlow_${s2})" filter="url(#glowBlur)"/>
    <ellipse cx="${cx3}" cy="${cardY}" rx="${cardPixelW * 0.8}" ry="${cardPixelH * 0.55}" fill="url(#colorCardGlow_${s3})" filter="url(#glowBlur)"/>

    <g filter="url(#cardShadow)">
      ${colorCardBackSvg(cx1, cardY, cardScale, s1)}
      ${colorCardBackSvg(cx2, cardY, cardScale, s2)}
      ${colorCardBackSvg(cx3, cardY, cardScale, s3)}
    </g>

    <ellipse cx="540" cy="${cardY + 12}" rx="540" ry="130" fill="url(#titleBgGlow)"/>

    <g filter="url(#softGlow)">
      <text x="540" y="${titleY1}" text-anchor="middle" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="58" fill="#F4F8FF" letter-spacing="3" font-weight="400">이 관계,</text>
      <text x="540" y="${titleY2}" text-anchor="middle" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="58" fill="#F4F8FF" letter-spacing="3" font-weight="400">지금 어디쯤 와 있을까?</text>
    </g>

    <text x="540" y="1860" text-anchor="middle" font-family="sans-serif" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(resolve(outputDir, 'cover.png'), buf)
  console.log(`✅ cover.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-04-23 shortform 커버 이미지 생성 ===')
  await generateCover()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
