/**
 * carousel 2026-07-04_sat (The Fool 커버)
 * 훅: 헤어진 사람과 / 다시 이어지는 사람들의 공통점 3가지
 * 본문: Six of Cups, Ace of Wands, Ten of Pentacles
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-07-04_sat/carousel')

const W = 1080, H = 1350

const PORTRAIT_OVERRIDE = {
  'six-of-cups': 'public/images/mcards/cups/Six of Cups.png',
  'ace-of-wands': 'public/images/mcards/wands/Ace of Wands.png',
  'ten-of-pentacles': 'public/images/mcards/pentacles/Ten of Pentacles.png',
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

function generateStars(count, xMin, xMax, yMin, yMax) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51]
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = 1 + seed[(i + 3) % seed.length] * 2
    const opacity = 0.2 + seed[(i + 5) % seed.length] * 0.5
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="rgba(255,255,255,${opacity.toFixed(2)})"/>\n`
  }
  return stars
}

async function loadCard(slug, w, h) {
  const overrideRel = PORTRAIT_OVERRIDE[slug]
  const p = overrideRel ? resolve(rootDir, overrideRel) : resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) { console.error(`카드 없음: ${p}`); return null }
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

async function slide01() {
  const cW = 750, cH = 940
  const cardTop = 80
  const cardLeft = (W - cW) / 2
  const img = await loadCard('fool', cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 20) : null
  const stars = generateStars(10, 50, 1030, 30, 70)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <filter id="glowF" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#08061A"/>
      <stop offset="30%" stop-color="#0E0F2E"/>
      <stop offset="70%" stop-color="#0D0E28"/>
      <stop offset="100%" stop-color="#06050F"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="rgba(140,120,220,0.12)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="500" rx="500" ry="500" fill="url(#glow)"/>
  ${stars}
  <rect x="${cardLeft - 3}" y="${cardTop - 3}" width="${cW + 6}" height="${cH + 6}" rx="23" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#glowF)"/>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png().toBuffer()

    const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(10,8,28,0)"/>
        <stop offset="50%" stop-color="rgba(10,8,28,0.7)"/>
        <stop offset="100%" stop-color="rgba(10,8,28,0.98)"/>
      </linearGradient>
    </defs>
    <rect x="0" y="850" width="${W}" height="500" fill="url(#bf)"/>
    <text x="540" y="1085" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="44" font-weight="300" fill="#F4F8FF" text-anchor="middle">헤어진 사람과</text>
    <text x="540" y="1145" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="44" font-weight="300" fill="#F4F8FF" text-anchor="middle">다시 이어지는 사람들의</text>
    <text x="540" y="1205" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="44" font-weight="300" fill="#F4F8FF" text-anchor="middle">공통점 3가지</text>
    <text x="540" y="1310" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="22" fill="rgba(180,170,220,0.45)" text-anchor="middle">스와이프해서 확인하세요 →</text>
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png().toBuffer()
  }

  writeFileSync(resolve(outputDir, 'slide01.png'), base)
  console.log(`✅ slide01.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function contentSlide(cardSlug, nameEn, subtitle, bodyText, index, filename) {
  const bgImg = await loadCard(cardSlug, W, H)
  let bgCard = null
  if (bgImg) {
    const faded = await sharp(bgImg).ensureAlpha().modulate({ brightness: 0.8 }).png().toBuffer()
    const fadeMask = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="rgba(255,255,255,0.55)"/></svg>`
    bgCard = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()
  }

  const lines = bodyText.split('\n')
  const engNameSize = 22
  const subtitleSize = 38
  const bodySize = 32
  const lineGap = 50
  const blankGap = 30

  let bodyTotalH = 0
  for (const l of lines) bodyTotalH += l === '' ? blankGap : lineGap
  const totalTextH = engNameSize + 20 + subtitleSize + 50 + bodyTotalH
  const startY = Math.round((H - totalTextH) / 2)
  const engNameY = startY + engNameSize
  const subtitleY = engNameY + 50
  const lineY1 = engNameY - engNameSize - 12
  const lineY2 = subtitleY + 16

  let curY = subtitleY + 60
  const bodySvg = lines.map(l => {
    if (l === '') { curY += blankGap; return '' }
    const s = `<text x="540" y="${curY}" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="${bodySize}" font-weight="300" fill="rgba(240,238,255,0.95)" text-anchor="middle">${esc(l)}</text>`
    curY += lineGap
    return s
  }).filter(s => s).join('\n  ')

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#08061A"/>
      <stop offset="30%" stop-color="#0E0F2E"/>
      <stop offset="70%" stop-color="#0D0E28"/>
      <stop offset="100%" stop-color="#06050F"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  </svg>`

  let base = await sharp(Buffer.from(bgSvg)).png().toBuffer()
  if (bgCard) {
    base = await sharp(base).composite([{ input: bgCard, left: 0, top: 0 }]).png().toBuffer()
  }

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="rgba(8,6,26,0.45)"/>
  <text x="1030" y="50" font-family="sans-serif" font-size="18" fill="rgba(180,170,230,0.5)" text-anchor="end">${index}/3</text>
  <line x1="340" y1="${lineY1}" x2="740" y2="${lineY1}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  <text x="540" y="${engNameY}" font-family="Georgia, serif" font-size="${engNameSize}" font-style="italic" fill="rgba(200,180,140,0.65)" text-anchor="middle">${esc(nameEn)}</text>
  <text x="540" y="${subtitleY}" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="${subtitleSize}" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(subtitle)}</text>
  <line x1="340" y1="${lineY2}" x2="740" y2="${lineY2}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  ${bodySvg}
  </svg>`

  base = await sharp(base).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png().toBuffer()

  writeFileSync(resolve(outputDir, filename), base)
  console.log(`✅ ${filename} (${(base.length / 1024).toFixed(0)} KB)`)
}

async function slide05() {
  const cW = 500, cH = 670
  const cardTop = 150
  const cardLeft = (W - cW) / 2
  const img = await loadCard('fool', cW, cH)
  let masked = null
  if (img) {
    const m = await roundImg(img, cW, cH, 18)
    const faded = await sharp(m).ensureAlpha().modulate({ brightness: 0.85 }).png().toBuffer()
    const fadeMask = `<svg width="${cW}" height="${cH}"><rect width="${cW}" height="${cH}" rx="18" fill="rgba(255,255,255,0.5)"/></svg>`
    masked = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()
  }

  const saveIcon = `<g transform="translate(430, 900)">
    <path d="M14 0 L72 0 Q86 0 86 14 L86 105 L43 78 L0 105 L0 14 Q0 0 14 0 Z" fill="none" stroke="rgba(200,190,255,0.55)" stroke-width="2.5"/>
  </g>`
  const shareIcon = `<g transform="translate(570, 900)">
    <path d="M58 0 L86 30 L58 60" fill="none" stroke="rgba(200,190,255,0.55)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M86 30 L14 30 L14 86" fill="none" stroke="rgba(200,190,255,0.55)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#08061A"/>
      <stop offset="30%" stop-color="#0E0F2E"/>
      <stop offset="70%" stop-color="#0D0E28"/>
      <stop offset="100%" stop-color="#06050F"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" stop-color="rgba(140,120,220,0.1)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <filter id="glowF" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="500" rx="400" ry="400" fill="url(#glow)"/>
  <rect x="${cardLeft - 3}" y="${cardTop - 3}" width="${cW + 6}" height="${cH + 6}" rx="21" fill="none" stroke="rgba(160,140,240,0.12)" stroke-width="1.5" filter="url(#glowF)"/>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png().toBuffer()

    const textOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${saveIcon}
    ${shareIcon}
    <text x="540" y="1060" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="36" font-weight="300" fill="#F4F8FF" text-anchor="middle">저장해두고</text>
    <text x="540" y="1105" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="24" fill="rgba(210,200,250,0.65)" text-anchor="middle">관계의 흐름이 바뀔 때 다시 꺼내보세요</text>
    <line x1="400" y1="1140" x2="680" y2="1140" stroke="rgba(180,170,230,0.12)" stroke-width="1"/>
    <text x="540" y="1180" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">요즘 마음이 흔들리는 친구에게도</text>
    <text x="540" y="1212" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">가볍게 공유해보세요</text>
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(textOverlay), left: 0, top: 0 }]).png().toBuffer()
  }

  writeFileSync(resolve(outputDir, 'slide05.png'), base)
  console.log(`✅ slide05.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-07-04 carousel (The Fool 커버: 재회 공통점) ===')
  mkdirSync(outputDir, { recursive: true })

  await slide01()

  await contentSlide('six-of-cups',
    'Six of Cups', '지난 시간을 탓하지 않아요',
    '그땐 그럴 수밖에 없었다고\n서로의 입장을 먼저 헤아려요\n\n원망 대신 좋았던 기억을 떠올려요\n그 온기가 다시 문을 열어요\n\n키워드: 추억 · 이해 · 재회',
    1, 'slide02.png')

  await contentSlide('ace-of-wands',
    'Ace of Wands', '머물지 않고 먼저 움직여요',
    '끝난 일을 붙잡는 대신\n새로 시작할 용기를 내요\n\n먼저 연락하는 걸 두려워 안 해요\n그 한 걸음이 불씨를 살려요\n\n키워드: 용기 · 새 시작 · 불씨',
    2, 'slide03.png')

  await contentSlide('ten-of-pentacles',
    'Ten of Pentacles', '관계를 길게 바라봐요',
    '순간의 서운함보다\n함께 쌓아온 시간을 봐요\n\n오래 갈 사이를 그리며 움직여요\n그 단단함이 다시 곁을 만들어요\n\n키워드: 안정 · 긴 안목 · 신뢰',
    3, 'slide04.png')

  await slide05()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
