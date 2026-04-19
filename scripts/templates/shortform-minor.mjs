/**
 * TEMPLATE: 소개형 마이너 shortform (3컷, 기존 디자인 확정안)
 * - scene01: 코스믹 배경 + 달 + 훅 + 프레임 카드 뒷면 (cardScale 3.2)
 * - scene02: 큰 프레임 카드(780×1170) + vignette + cardGlow + 프레임 외부 카드명/키워드
 * - scene03: 헤더 + 중간 프레임 카드(440×660) + 해석 3줄 + "무료 타로 리딩 lovtaro.kr" CTA
 *
 * 사용: scripts/templates/shortform-minor.mjs 를 scripts/generate-shortform-{YYYY-MM-DD_day}.mjs 로 복사 후 카드/카피만 교체.
 * 픽셀 수치·레이아웃은 확정안이므로 수정 금지. 수치 변경이 필요하면 이 템플릿 자체를 업데이트.
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { siteCardBackSvg, siteCardBackDefs } from './lib/card-back-svg.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-04-18_sat/shortform')
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
  const cardScale = 3.2
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
    ${cosmicBody(true, 41)}

    <g filter="url(#softGlow)">
      <text x="540" y="400" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">그 사람이 아직</text>
      <text x="540" y="475" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">나를 생각하고 있을까?</text>
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
  // 프레임은 카드만 감싸고, 한/영 카드명 + 키워드 모두 프레임 바깥 아래로 통일.
  const cardW = 780, cardH = 1170
  const framePad = 30
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad
  const frameX = (W - frameW) / 2
  const frameY = 210
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const cardRaw = await loadCard('moon', cardW, cardH)
  const cardEnhanced = await sharp(cardRaw)
    .sharpen({ sigma: 0.7, m1: 0.5, m2: 2.2 })
    .modulate({ saturation: 1.12, brightness: 1.03 })
    .toBuffer()
  const masked = await roundImg(cardEnhanced, cardW, cardH, 8)

  const labelStartY = frameY + frameH + 90
  const nameKrY = labelStartY
  const nameEnY = nameKrY + 60
  const kwY = nameEnY + 70

  const glowCX = W / 2
  const glowCY = frameY + frameH / 2

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      <radialGradient id="cardGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(232,212,139,0.32)"/>
        <stop offset="55%" stop-color="rgba(180,140,210,0.14)"/>
        <stop offset="100%" stop-color="rgba(20,10,40,0)"/>
      </radialGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
        <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
      </radialGradient>
    </defs>
    ${cosmicBody(false, 47)}

    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    <ellipse cx="${glowCX}" cy="${glowCY}" rx="${frameW * 0.82}" ry="${frameH * 0.65}" fill="url(#cardGlow)"/>

    ${drawFrame(frameX, frameY, frameW, frameH, 1.3)}

    <g filter="url(#softGlow)">
      <text x="540" y="${nameKrY}" text-anchor="middle" font-family="sans-serif" font-size="58" fill="#F4F8FF" font-weight="300" letter-spacing="4">달</text>
      <text x="540" y="${nameEnY}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="rgba(232,212,139,0.88)" letter-spacing="1">The Moon</text>
    </g>

    <text x="540" y="${kwY}" text-anchor="middle" font-family="sans-serif" font-size="26" fill="rgba(232,212,139,0.72)" letter-spacing="4" font-weight="300">무의식 · 숨겨진 감정 · 그리움</text>

    <text x="540" y="1860" text-anchor="middle" font-family="sans-serif" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene02.png'), base)
  console.log(`✅ scene02.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function scene03() {
  const headerY = 200
  const cardW = 440, cardH = 660
  const framePad = 22
  const nameArea = 130
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad + nameArea
  const frameX = (W - frameW) / 2
  const frameY = 235
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const cardImg = await loadCard('moon', cardW, cardH)
  const masked = await roundImg(cardImg, cardW, cardH, 6)

  const divideY = cardTop + cardH + 20
  const nameKrY = divideY + 50
  const nameEnY = nameKrY + 36
  const kwY = frameY + frameH + 70
  const interpY = kwY + 180
  const ctaY = interpY + 290

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
    </defs>
    ${cosmicBody(true, 53)}

    <g filter="url(#softGlow)">
      <text x="540" y="${headerY}" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#F4F8FF" font-weight="300" letter-spacing="6">놓지 못한 감정</text>
    </g>

    ${drawFrame(frameX, frameY, frameW, frameH, 0.95)}

    <line x1="${frameX + 34}" y1="${divideY}" x2="${frameX + frameW - 34}" y2="${divideY}" stroke="rgba(201,168,76,0.28)" stroke-width="1"/>

    <text x="540" y="${nameKrY}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#F4F8FF" font-weight="300" letter-spacing="4">달</text>
    <text x="540" y="${nameEnY}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="20" fill="rgba(232,212,139,0.8)" letter-spacing="1">The Moon</text>

    <text x="540" y="${kwY}" text-anchor="middle" font-family="sans-serif" font-size="22" fill="rgba(232,212,139,0.6)" letter-spacing="4" font-weight="300">무의식 · 숨겨진 감정 · 그리움</text>

    <g filter="url(#softGlow)">
      <text x="540" y="${interpY}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#F4F8FF" font-weight="300" letter-spacing="1">표면 아래에 감정이 남아 있어요.</text>
      <text x="540" y="${interpY + 58}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#F4F8FF" font-weight="300" letter-spacing="1">아직 완전히 놓지 못한,</text>
      <text x="540" y="${interpY + 116}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#F4F8FF" font-weight="300" letter-spacing="1">그런 마음이 맞아요.</text>
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
  console.log('=== 2026-04-18 토요일 기존형 shortform (코스믹 스타일) ===')
  mkdirSync(outputDir, { recursive: true })
  await scene01()
  await scene02()
  await scene03()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
