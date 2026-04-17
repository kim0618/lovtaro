/**
 * 2026-04-25 토요일 shortform (캐러셀용 릴스) 이미지 생성 (코스믹 스타일)
 * - scene01: 커버 - The Sun 프레임 + 하단 훅
 * - scene02-04: 작은 프레임 카드 + 카드명 + 해석
 * - scene05: CTA - The Sun + 저장/공유
 *
 * 실행: node scripts/generate-shortform-2026-04-25_sat.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-04-25_sat/shortform')

const W = 1080, H = 1920

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

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
    <filter id="softGlow" x="-30%" y="-30%" width="140%" height="140%">
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
  if (!existsSync(p)) { console.error(`카드 없음: ${p}`); return null }
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

async function scene01() {
  const cardW = 720, cardH = 1080
  const framePad = 28
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad
  const frameX = (W - frameW) / 2
  const frameY = 120
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const img = await loadCard('sun', cardW, cardH)
  const masked = img ? await roundImg(img, cardW, cardH, 8) : null

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
    </defs>
    ${cosmicBody(true, 311)}

    ${drawFrame(frameX, frameY, frameW, frameH)}

    <g filter="url(#softGlow)">
      <text x="540" y="1510" text-anchor="middle" font-family="sans-serif" font-size="46" font-weight="300" fill="#F4F8FF" letter-spacing="3">이별 후에도</text>
      <text x="540" y="1572" text-anchor="middle" font-family="sans-serif" font-size="46" font-weight="300" fill="#F4F8FF" letter-spacing="3">다시 사랑받는 사람의</text>
      <text x="540" y="1634" text-anchor="middle" font-family="sans-serif" font-size="46" font-weight="300" fill="#F4F8FF" letter-spacing="3">3가지 특징</text>
    </g>
    <text x="540" y="1740" text-anchor="middle" font-family="sans-serif" font-size="24" fill="rgba(180,170,220,0.55)" letter-spacing="3">스와이프해서 확인하세요 →</text>

    <text x="540" y="1870" text-anchor="middle" font-family="sans-serif" font-size="22" fill="rgba(232,212,139,0.4)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  }
  writeFileSync(resolve(outputDir, 'scene01.png'), base)
  console.log(`✅ scene01.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function contentScene(cardSlug, nameKr, nameEn, subtitle, bodyText, index, filename) {
  const cardW = 340, cardH = 510
  const framePad = 20
  const nameArea = 125
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad + nameArea
  const frameX = (W - frameW) / 2
  const frameY = 300
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const img = await loadCard(cardSlug, cardW, cardH)
  const masked = img ? await roundImg(img, cardW, cardH, 6) : null

  const subtitleY = 190
  const divideY = cardTop + cardH + 18
  const nameKrY = divideY + 48
  const nameEnY = nameKrY + 34
  const kwY = frameY + frameH + 70
  const interpY = kwY + 100

  const lines = bodyText.split('\n')
  let curY = interpY
  const lineGap = 52
  const blankGap = 32
  const interpSvg = lines.map(l => {
    if (l === '') { curY += blankGap; return '' }
    const s = `<text x="540" y="${curY}" text-anchor="middle" font-family="sans-serif" font-size="32" fill="rgba(240,238,255,0.95)" font-weight="300">${esc(l)}</text>`
    curY += lineGap
    return s
  }).filter(Boolean).join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
    </defs>
    ${cosmicBody(true, 331 + index * 13)}

    <g filter="url(#softGlow)">
      <text x="540" y="${subtitleY}" text-anchor="middle" font-family="sans-serif" font-size="44" fill="#F4F8FF" font-weight="300" letter-spacing="6">${esc(subtitle)}</text>
    </g>

    <text x="1020" y="80" text-anchor="end" font-family="sans-serif" font-size="20" fill="rgba(180,170,230,0.55)">${index}/3</text>

    ${drawFrame(frameX, frameY, frameW, frameH, 0.95)}

    <line x1="${frameX + 30}" y1="${divideY}" x2="${frameX + frameW - 30}" y2="${divideY}" stroke="rgba(201,168,76,0.28)" stroke-width="1"/>

    <text x="540" y="${nameKrY}" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#F4F8FF" font-weight="300" letter-spacing="5">${esc(nameKr)}</text>
    <text x="540" y="${nameEnY}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="22" fill="rgba(232,212,139,0.78)">${esc(nameEn)}</text>

    ${interpSvg}

    <text x="540" y="1870" text-anchor="middle" font-family="sans-serif" font-size="22" fill="rgba(232,212,139,0.4)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  }
  writeFileSync(resolve(outputDir, filename), base)
  console.log(`✅ ${filename} (${(base.length / 1024).toFixed(0)} KB)`)
}

async function scene05() {
  const cardW = 360, cardH = 540
  const framePad = 22
  const nameArea = 130
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad + nameArea
  const frameX = (W - frameW) / 2
  const frameY = 240
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const img = await loadCard('sun', cardW, cardH)
  const masked = img ? await roundImg(img, cardW, cardH, 7) : null

  const divideY = cardTop + cardH + 18
  const nameKrY = divideY + 50
  const nameEnY = nameKrY + 36

  const saveIcon = `<g transform="translate(420, 1120)">
    <path d="M14 0 L72 0 Q86 0 86 14 L86 105 L43 78 L0 105 L0 14 Q0 0 14 0 Z" fill="none" stroke="rgba(232,212,139,0.7)" stroke-width="2.5"/>
  </g>`
  const shareIcon = `<g transform="translate(560, 1120)">
    <path d="M58 0 L86 30 L58 60" fill="none" stroke="rgba(232,212,139,0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M86 30 L14 30 L14 86" fill="none" stroke="rgba(232,212,139,0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
    </defs>
    ${cosmicBody(true, 371)}

    ${drawFrame(frameX, frameY, frameW, frameH, 0.9)}

    <line x1="${frameX + 30}" y1="${divideY}" x2="${frameX + frameW - 30}" y2="${divideY}" stroke="rgba(201,168,76,0.28)" stroke-width="1"/>

    <text x="540" y="${nameKrY}" text-anchor="middle" font-family="sans-serif" font-size="38" fill="#F4F8FF" font-weight="300" letter-spacing="5">태양</text>
    <text x="540" y="${nameEnY}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="22" fill="rgba(232,212,139,0.78)">The Sun</text>

    ${saveIcon}
    ${shareIcon}

    <g filter="url(#softGlow)">
      <text x="540" y="1380" text-anchor="middle" font-family="sans-serif" font-size="38" font-weight="300" fill="#F4F8FF" letter-spacing="3">저장해두고</text>
      <text x="540" y="1435" text-anchor="middle" font-family="sans-serif" font-size="26" fill="rgba(232,212,139,0.78)" letter-spacing="2">마음이 약해질 때 다시 꺼내보세요</text>
    </g>
    <line x1="380" y1="1485" x2="700" y2="1485" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>
    <text x="540" y="1535" text-anchor="middle" font-family="sans-serif" font-size="24" fill="rgba(200,190,240,0.55)">힘들어하는 친구가 있다면</text>
    <text x="540" y="1572" text-anchor="middle" font-family="sans-serif" font-size="24" fill="rgba(200,190,240,0.55)">가볍게 공유해보세요</text>

    <text x="540" y="1870" text-anchor="middle" font-family="sans-serif" font-size="22" fill="rgba(232,212,139,0.4)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  }
  writeFileSync(resolve(outputDir, 'scene05.png'), base)
  console.log(`✅ scene05.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-04-25 shortform 릴스 (코스믹 스타일) ===')
  mkdirSync(outputDir, { recursive: true })

  await scene01()

  await contentScene('queen-of-cups',
    '컵의 여왕', 'Queen of Cups',
    '감정이 따뜻한 사람',
    '감정을 누르지 않고\n따뜻하게 받아주는 사람이에요\n\n자기 마음도 상대 마음도\n다정하게 안아줄 줄 알아요\n\n키워드: 공감 · 다정함 · 감정의 깊이',
    1, 'scene02.png')

  await contentScene('ace-of-pentacles',
    '펜타클 에이스', 'Ace of Pentacles',
    '안정감을 주는 사람',
    '곁에 있으면 마음이 단단해지는 사람\n감정이 튀지 않고 꾸준해요\n\n자극보다 신뢰를 쌓는 관계를\n만들 줄 아는 사람이에요\n\n키워드: 안정 · 신뢰 · 꾸준함',
    2, 'scene03.png')

  await contentScene('star',
    '별', 'The Star',
    '희망을 잃지 않는 사람',
    '상처 속에서도\n자신을 믿는 빛을 잃지 않아요\n\n이 빛은 타인에게도 전해지고\n자연스럽게 사랑을 끌어와요\n\n키워드: 희망 · 자기 믿음 · 회복력',
    3, 'scene04.png')

  await scene05()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
