/**
 * 2026-04-21 화요일 참여형 shortform 이미지 생성 (코스믹 감성 보강)
 * - scene01: 어두운 밤하늘 + 작은 달 + 별 밀도 ↑ + 카드 뒷면 3장 + 번호 (가독성 유지)
 * - scene02: 풀 코스믹 (성운 + 달 + 많은 별) + CTA 고정 템플릿
 *
 * 실행: node scripts/generate-shortform-2026-04-21_tue.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { siteCardBackSvg, siteCardBackDefs, CARD_WIDTH, CARD_HEIGHT } from './lib/card-back-svg.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const outputDir = resolve(rootDir, 'content-output/2026-04-21_tue/shortform')
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
    <radialGradient id="neb1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(190,110,60,0.22)"/>
      <stop offset="60%" stop-color="rgba(160,80,50,0.08)"/>
      <stop offset="100%" stop-color="rgba(180,100,60,0)"/>
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
    <mask id="moonMaskBig">
      <rect x="0" y="0" width="${W}" height="${H}" fill="black"/>
      <circle cx="125" cy="225" r="52" fill="white"/>
      <circle cx="158" cy="215" r="52" fill="black"/>
    </mask>
    <mask id="moonMaskSmall">
      <rect x="0" y="0" width="${W}" height="${H}" fill="black"/>
      <circle cx="115" cy="200" r="34" fill="white"/>
      <circle cx="138" cy="192" r="34" fill="black"/>
    </mask>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="numGlow" x="-30%" y="-30%" width="160%" height="160%">
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
    <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
  `
}

function fullCosmicBody(starSeed = 1) {
  const stars1 = genStars(320, starSeed, 0, W, 0, H, false)
  const stars2 = genStars(120, starSeed + 11, 0, W, 0, H, true)
  const stars3 = genStars(60, starSeed + 23, 0, W, 0, H, true)
  return `
    <rect width="${W}" height="${H}" fill="url(#cosmicBg)"/>
    <ellipse cx="120" cy="720" rx="520" ry="420" fill="url(#neb1)"/>
    <ellipse cx="980" cy="1280" rx="520" ry="460" fill="url(#neb2)"/>
    <ellipse cx="540" cy="1750" rx="620" ry="320" fill="url(#neb3)"/>
    <ellipse cx="760" cy="400" rx="380" ry="300" fill="url(#neb3)"/>
    ${stars1}
    ${stars2}
    ${stars3}
    <circle cx="140" cy="220" r="120" fill="url(#moonGlow)"/>
    <rect x="50" y="150" width="180" height="180" fill="rgba(248,230,185,0.95)" mask="url(#moonMaskBig)"/>
  `
}

// 참여형 scene01 전용: 어두운 밤하늘 (카드 가독성 위해 성운 최소화)
function participationBody(starSeed = 1) {
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

async function generateScene01() {
  const cardScale = 2.5
  const cardPixelW = CARD_WIDTH * cardScale
  const cardPixelH = CARD_HEIGHT * cardScale
  const cardGap = 50
  const totalWidth = cardPixelW * 3 + cardGap * 2
  const startCX = (W - totalWidth) / 2 + cardPixelW / 2
  const cardY = 980
  const numberY = cardY + cardPixelH / 2 + 55

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      ${siteCardBackDefs()}
    </defs>
    ${participationBody(3)}

    <!-- Card area subtle glow for depth -->
    <ellipse cx="540" cy="${cardY}" rx="500" ry="380" fill="url(#cardAreaGlow)" filter="url(#glowBlur)"/>

    <g filter="url(#softGlow)">
      <text x="540" y="380" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">그 사람 마음 속에서</text>
      <text x="540" y="455" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">나는 어떤 존재일까?</text>
    </g>

    <g filter="url(#cardShadow)">
      ${siteCardBackSvg(startCX, cardY, cardScale)}
      ${siteCardBackSvg(startCX + cardPixelW + cardGap, cardY, cardScale)}
      ${siteCardBackSvg(startCX + (cardPixelW + cardGap) * 2, cardY, cardScale)}
    </g>

    <g filter="url(#numGlow)">
      <text x="${startCX}" y="${numberY}" text-anchor="middle" font-family="sans-serif" font-size="42" fill="#e8d48b" font-weight="600">1번</text>
      <text x="${startCX + cardPixelW + cardGap}" y="${numberY}" text-anchor="middle" font-family="sans-serif" font-size="42" fill="#e8d48b" font-weight="600">2번</text>
      <text x="${startCX + (cardPixelW + cardGap) * 2}" y="${numberY}" text-anchor="middle" font-family="sans-serif" font-size="42" fill="#e8d48b" font-weight="600">3번</text>
    </g>

    <text x="540" y="1640" text-anchor="middle" font-family="sans-serif" font-size="30" fill="rgba(244,248,255,0.6)" letter-spacing="5" font-weight="300">직감으로 골라보세요</text>

    <text x="540" y="1860" text-anchor="middle" font-family="sans-serif" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(resolve(outputDir, 'scene01.png'), buf)
  console.log(`✅ scene01.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function generateScene02() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      <linearGradient id="goldDivider" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/>
        <stop offset="30%" stop-color="#e8d48b" stop-opacity="0.5"/>
        <stop offset="70%" stop-color="#e8d48b" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${fullCosmicBody(7)}

    <!-- Decorative divider lines -->
    <line x1="280" y1="820" x2="800" y2="820" stroke="url(#goldDivider)" stroke-width="1.5"/>
    <line x1="280" y1="1150" x2="800" y2="1150" stroke="url(#goldDivider)" stroke-width="1.5"/>

    <g filter="url(#softGlow)">
      <text x="540" y="910" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">직감으로 고른 번호를</text>
      <text x="540" y="985" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">댓글에 적어주세요</text>
      <text x="540" y="1100" text-anchor="middle" font-family="sans-serif" font-size="34" fill="rgba(232,212,139,0.85)" letter-spacing="4" font-weight="300">해석을 댓글로 달아드릴게요</text>
    </g>

    <!-- Small card hint decoration -->
    <g opacity="0.35">
      <circle cx="420" cy="1300" r="3" fill="#e8d48b"/>
      <circle cx="540" cy="1300" r="3" fill="#e8d48b"/>
      <circle cx="660" cy="1300" r="3" fill="#e8d48b"/>
    </g>

    <text x="540" y="1860" text-anchor="middle" font-family="sans-serif" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(resolve(outputDir, 'scene02.png'), buf)
  console.log(`✅ scene02.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-04-21 참여형 shortform 이미지 생성 (코스믹 감성) ===')
  await generateScene01()
  await generateScene02()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
