/**
 * 2026-04-20 월요일 shortform 이미지 생성 (코스믹 성운 스타일)
 * - scene01: 코스믹 배경 + 달 + 훅 + 카드 뒷면(프레임)
 * - scene02: 코스믹 배경 + 달 + 큰 프레임 카드(Lovers) + 카드명 + 키워드
 * - scene03: 코스믹 배경 + 헤더 + 작은 프레임 카드 + 해석 + CTA
 *
 * 실행: node scripts/generate-shortform-2026-04-20_mon.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { siteCardBackSvg, siteCardBackDefs } from './lib/card-back-svg.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-04-20_mon/shortform')
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
    <mask id="moonMask">
      <rect x="0" y="0" width="${W}" height="${H}" fill="black"/>
      <circle cx="125" cy="225" r="52" fill="white"/>
      <circle cx="158" cy="215" r="52" fill="black"/>
    </mask>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `
}

function cosmicBody(withMoon = true, starSeed = 1) {
  const stars1 = genStars(320, starSeed, 0, W, 0, H, false)
  const stars2 = genStars(120, starSeed + 11, 0, W, 0, H, true)
  const stars3 = genStars(60, starSeed + 23, 0, W, 0, H, true)
  const moon = withMoon ? `
    <circle cx="140" cy="220" r="120" fill="url(#moonGlow)"/>
    <rect x="50" y="150" width="180" height="180" fill="rgba(248,230,185,0.95)" mask="url(#moonMask)"/>
  ` : ''
  return `
    <rect width="${W}" height="${H}" fill="url(#cosmicBg)"/>
    <ellipse cx="120" cy="720" rx="520" ry="420" fill="url(#neb1)"/>
    <ellipse cx="980" cy="1280" rx="520" ry="460" fill="url(#neb2)"/>
    <ellipse cx="540" cy="1750" rx="620" ry="320" fill="url(#neb3)"/>
    <ellipse cx="760" cy="400" rx="380" ry="300" fill="url(#neb3)"/>
    ${stars1}
    ${stars2}
    ${stars3}
    ${moon}
  `
}

function drawFrame(x, y, w, h, strong = 1) {
  const gap = 10
  const cornerSize = 32
  const c1 = `rgba(201,168,76,${0.75 * strong})`
  const c2 = `rgba(201,168,76,${0.38 * strong})`
  const c3 = `rgba(232,212,139,${0.7 * strong})`
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c1}" stroke-width="2.5"/>
    <rect x="${x + gap}" y="${y + gap}" width="${w - 2 * gap}" height="${h - 2 * gap}" fill="none" stroke="${c2}" stroke-width="1"/>
    <path d="M ${x + cornerSize} ${y + gap / 2} L ${x + gap / 2} ${y + gap / 2} L ${x + gap / 2} ${y + cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
    <path d="M ${x + w - cornerSize} ${y + gap / 2} L ${x + w - gap / 2} ${y + gap / 2} L ${x + w - gap / 2} ${y + cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
    <path d="M ${x + cornerSize} ${y + h - gap / 2} L ${x + gap / 2} ${y + h - gap / 2} L ${x + gap / 2} ${y + h - cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
    <path d="M ${x + w - cornerSize} ${y + h - gap / 2} L ${x + w - gap / 2} ${y + h - gap / 2} L ${x + w - gap / 2} ${y + h - cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
  `
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

async function scene01() {
  const cardScale = 2.55
  const cardW = Math.round(120 * cardScale)
  const cardH = Math.round(198 * cardScale)
  const cardCX = 540, cardCY = 1080
  const cardLeft = cardCX - cardW / 2, cardTop = cardCY - cardH / 2
  const framePad = 28
  const frameX = cardLeft - framePad, frameY = cardTop - framePad
  const frameW = cardW + 2 * framePad, frameH = cardH + 2 * framePad

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      ${siteCardBackDefs()}
    </defs>
    ${cosmicBody(true, 3)}

    <g filter="url(#softGlow)">
      <text x="540" y="400" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">이 사람과 나,</text>
      <text x="540" y="475" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">정말 운명일까?</text>
    </g>

    ${drawFrame(frameX, frameY, frameW, frameH)}
    ${siteCardBackSvg(cardCX, cardCY, cardScale)}

    <text x="540" y="1860" text-anchor="middle" font-family="sans-serif" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene01.png'), buf)
  console.log(`✅ scene01.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function scene02() {
  const cardW = 620, cardH = 930
  const framePad = 30
  const nameArea = 230
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad + nameArea
  const frameX = (W - frameW) / 2
  const frameY = 260
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const cardImg = await loadCard('lovers', cardW, cardH)
  const masked = await roundImg(cardImg, cardW, cardH, 8)

  const divideY = cardTop + cardH + 30
  const nameKrY = divideY + 70
  const nameEnY = nameKrY + 56

  const kwY = frameY + frameH + 80

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
    </defs>
    ${cosmicBody(true, 7)}

    ${drawFrame(frameX, frameY, frameW, frameH)}

    <line x1="${frameX + 60}" y1="${divideY}" x2="${frameX + frameW - 60}" y2="${divideY}" stroke="rgba(201,168,76,0.3)" stroke-width="1"/>

    <g filter="url(#softGlow)">
      <text x="540" y="${nameKrY}" text-anchor="middle" font-family="sans-serif" font-size="62" fill="#F4F8FF" font-weight="300" letter-spacing="8">연인</text>
      <text x="540" y="${nameEnY}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="32" fill="rgba(232,212,139,0.88)" letter-spacing="2">The Lovers</text>
    </g>

    <text x="540" y="${kwY}" text-anchor="middle" font-family="sans-serif" font-size="30" fill="rgba(232,212,139,0.72)" letter-spacing="8" font-weight="300">운명적 끌림 · 진심의 선택</text>

    <text x="540" y="1860" text-anchor="middle" font-family="sans-serif" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene02.png'), base)
  console.log(`✅ scene02.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function scene03() {
  const headerY = 200
  const cardW = 300, cardH = 450
  const framePad = 18
  const nameArea = 115
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad + nameArea
  const frameX = (W - frameW) / 2
  const frameY = 280
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const cardImg = await loadCard('lovers', cardW, cardH)
  const masked = await roundImg(cardImg, cardW, cardH, 5)

  const divideY = cardTop + cardH + 16
  const nameKrY = divideY + 42
  const nameEnY = nameKrY + 30

  const kwY = frameY + frameH + 60

  const interpY = kwY + 160
  const ctaY = interpY + 270

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
    </defs>
    ${cosmicBody(true, 13)}

    <g filter="url(#softGlow)">
      <text x="540" y="${headerY}" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#F4F8FF" font-weight="300" letter-spacing="6">운명의 끌림</text>
    </g>

    ${drawFrame(frameX, frameY, frameW, frameH, 0.95)}

    <line x1="${frameX + 30}" y1="${divideY}" x2="${frameX + frameW - 30}" y2="${divideY}" stroke="rgba(201,168,76,0.28)" stroke-width="1"/>

    <text x="540" y="${nameKrY}" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#F4F8FF" font-weight="300" letter-spacing="5">연인</text>
    <text x="540" y="${nameEnY}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="19" fill="rgba(232,212,139,0.78)">The Lovers</text>

    <text x="540" y="${kwY}" text-anchor="middle" font-family="sans-serif" font-size="22" fill="rgba(232,212,139,0.6)" letter-spacing="5" font-weight="300">운명적 끌림 · 진심의 선택</text>

    <g filter="url(#softGlow)">
      <text x="540" y="${interpY}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#F4F8FF" font-weight="300" letter-spacing="1">지금 느끼는 끌림은 진짜예요.</text>
      <text x="540" y="${interpY + 58}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#F4F8FF" font-weight="300" letter-spacing="1">당신의 선택이 이 관계를</text>
      <text x="540" y="${interpY + 116}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#F4F8FF" font-weight="300" letter-spacing="1">운명으로 완성할 거예요.</text>
    </g>

    <text x="540" y="${ctaY}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#F4F8FF" font-weight="300" letter-spacing="3">당신도 직접 뽑아보세요</text>
    <text x="540" y="${ctaY + 54}" text-anchor="middle" font-family="sans-serif" font-size="26" fill="rgba(232,212,139,0.78)" letter-spacing="2">무료 타로 리딩 lovtaro.kr</text>

    <text x="540" y="1870" text-anchor="middle" font-family="sans-serif" font-size="22" fill="rgba(232,212,139,0.4)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene03.png'), base)
  console.log(`✅ scene03.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-04-20 월요일 shortform 이미지 생성 (코스믹 스타일) ===')
  mkdirSync(outputDir, { recursive: true })
  await scene01()
  await scene02()
  await scene03()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
