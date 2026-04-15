/**
 * 2026-04-17 금요일 carousel 이미지 생성 (5장) — v3
 * 4/15 캐러셀 스타일 기반 리디자인
 * - slide01: 커버 — Judgement(심판) 풀사이즈 + 하단 페이드 + 훅
 * - slide02: Knight of Cups 풀배경 + 해석 텍스트
 * - slide03: Ace of Wands 풀배경 + 해석 텍스트
 * - slide04: The Star 풀배경 + 해석 텍스트
 * - slide05: CTA — Star 카드 작게 + 저장/공유
 *
 * 실행: node scripts/generate-carousel-2026-04-17_fri.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-04-17_fri/carousel')

const W = 1080, H = 1350

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
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) { console.error(`카드 없음: ${p}`); return null }
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

// ── slide01: 표지 — Judgement(심판) 풀사이즈 + 하단 페이드 + 훅 ──
async function slide01() {
  const cW = 750, cH = 940
  const cardTop = 80
  const cardLeft = (W - cW) / 2
  const img = await loadCard('judgement', cW, cH)
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

    // 하단 페이드 + 텍스트 오버레이
    const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(10,8,28,0)"/>
        <stop offset="50%" stop-color="rgba(10,8,28,0.7)"/>
        <stop offset="100%" stop-color="rgba(10,8,28,0.98)"/>
      </linearGradient>
    </defs>
    <rect x="0" y="850" width="${W}" height="500" fill="url(#bf)"/>
    <text x="540" y="1100" font-family="sans-serif" font-size="52" font-weight="600" fill="#FFFFFF" text-anchor="middle">읽씹했던 그 사람,</text>
    <text x="540" y="1165" font-family="sans-serif" font-size="52" font-weight="600" fill="#FFFFFF" text-anchor="middle">다시 연락이 올까?</text>
    <text x="540" y="1310" font-family="sans-serif" font-size="22" fill="rgba(180,170,220,0.45)" text-anchor="middle">스와이프해서 확인하세요 →</text>
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png().toBuffer()
  }

  writeFileSync(resolve(outputDir, 'slide01.png'), base)
  console.log(`✅ slide01.png (${(base.length / 1024).toFixed(0)} KB)`)
}

// ── slide02~04: 카드 풀배경 + 텍스트 오버레이 ──
async function contentSlide(cardSlug, title, bodyText, index, filename) {
  const bgImg = await loadCard(cardSlug, W, H)
  let bgCard = null
  if (bgImg) {
    const faded = await sharp(bgImg).ensureAlpha().modulate({ brightness: 0.8 }).png().toBuffer()
    const fadeMask = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="rgba(255,255,255,0.55)"/></svg>`
    bgCard = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()
  }

  const lines = bodyText.split('\n')
  const titleSize = 44
  const bodySize = 28
  const lineGap = 44
  const blankGap = 26

  let bodyTotalH = 0
  for (const l of lines) bodyTotalH += l === '' ? blankGap : lineGap
  const totalTextH = titleSize + 50 + bodyTotalH
  const startY = Math.round((H - totalTextH) / 2)
  const titleY = startY + titleSize

  let curY = titleY + 60
  const bodySvg = lines.map(l => {
    if (l === '') { curY += blankGap; return '' }
    const s = `<text x="540" y="${curY}" font-family="sans-serif" font-size="${bodySize}" font-weight="300" fill="rgba(240,238,255,0.95)" text-anchor="middle">${esc(l)}</text>`
    curY += lineGap
    return s
  }).filter(s => s).join('\n  ')

  // 배경
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

  // 어두운 오버레이 + 텍스트
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="rgba(8,6,26,0.45)"/>
  <text x="1030" y="50" font-family="sans-serif" font-size="18" fill="rgba(180,170,230,0.5)" text-anchor="end">${index}/3</text>
  <line x1="340" y1="${titleY - titleSize - 12}" x2="740" y2="${titleY - titleSize - 12}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  <text x="540" y="${titleY}" font-family="sans-serif" font-size="${titleSize}" font-weight="600" fill="#FFFFFF" text-anchor="middle">${esc(title)}</text>
  <line x1="340" y1="${titleY + 16}" x2="740" y2="${titleY + 16}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  ${bodySvg}
  </svg>`

  base = await sharp(base).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png().toBuffer()

  writeFileSync(resolve(outputDir, filename), base)
  console.log(`✅ ${filename} (${(base.length / 1024).toFixed(0)} KB)`)
}

// ── slide05: CTA — Star 카드 작게 + 저장/공유 ──
async function slide05() {
  const cW = 500, cH = 670
  const cardTop = 150
  const cardLeft = (W - cW) / 2
  const img = await loadCard('star', cW, cH)
  let masked = null
  if (img) {
    const m = await roundImg(img, cW, cH, 18)
    const faded = await sharp(m).ensureAlpha().modulate({ brightness: 0.85 }).png().toBuffer()
    const fadeMask = `<svg width="${cW}" height="${cH}"><rect width="${cW}" height="${cH}" rx="18" fill="rgba(255,255,255,0.5)"/></svg>`
    masked = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()
  }

  // 저장 아이콘
  const saveIcon = `<g transform="translate(430, 900)">
    <path d="M14 0 L72 0 Q86 0 86 14 L86 105 L43 78 L0 105 L0 14 Q0 0 14 0 Z" fill="none" stroke="rgba(200,190,255,0.55)" stroke-width="2.5"/>
  </g>`
  // 공유 아이콘
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
  ${saveIcon}
  ${shareIcon}
  <text x="540" y="1060" font-family="sans-serif" font-size="36" font-weight="500" fill="#FFFFFF" text-anchor="middle">저장해두고</text>
  <text x="540" y="1105" font-family="sans-serif" font-size="24" fill="rgba(210,200,250,0.65)" text-anchor="middle">연락운이 궁금할 때 다시 꺼내보세요</text>
  <line x1="400" y1="1140" x2="680" y2="1140" stroke="rgba(180,170,230,0.12)" stroke-width="1"/>
  <text x="540" y="1180" font-family="sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">읽씹 고민하는 친구가 있다면</text>
  <text x="540" y="1212" font-family="sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">가볍게 공유해보세요</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png().toBuffer()

    // 텍스트+아이콘 다시 올리기
    const textOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${saveIcon}
    ${shareIcon}
    <text x="540" y="1060" font-family="sans-serif" font-size="36" font-weight="500" fill="#FFFFFF" text-anchor="middle">저장해두고</text>
    <text x="540" y="1105" font-family="sans-serif" font-size="24" fill="rgba(210,200,250,0.65)" text-anchor="middle">연락운이 궁금할 때 다시 꺼내보세요</text>
    <line x1="400" y1="1140" x2="680" y2="1140" stroke="rgba(180,170,230,0.12)" stroke-width="1"/>
    <text x="540" y="1180" font-family="sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">읽씹 고민하는 친구가 있다면</text>
    <text x="540" y="1212" font-family="sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">가볍게 공유해보세요</text>
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(textOverlay), left: 0, top: 0 }]).png().toBuffer()
  }

  writeFileSync(resolve(outputDir, 'slide05.png'), base)
  console.log(`✅ slide05.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-04-17 carousel v3 이미지 생성 ===')
  mkdirSync(outputDir, { recursive: true })

  await slide01()

  await contentSlide('knight-of-cups',
    '컵의 기사, 감정 정리 중',
    '이 카드는 감정을 정리하고\n다가오고 있다는 신호예요\n\n읽씹이 무관심이 아니라\n아직 마음을 정리하는 중일 수 있어요\n\n키워드: 감정 정리 · 다가옴 · 진심',
    1, 'slide02.png')

  await contentSlide('ace-of-wands',
    '완드 에이스, 불꽃 같은 연락',
    '갑자기 불꽃처럼\n연락이 올 수 있는 카드예요\n\n예상치 못한 타이밍에\n새로운 시작의 에너지가 열려요\n\n키워드: 새로운 시작 · 열정 · 불꽃',
    2, 'slide03.png')

  await contentSlide('star',
    '별, 끊어지지 않은 연결',
    '시간이 걸리더라도\n연결은 끊어지지 않았어요\n\n이 카드는 희망과 치유의 카드\n기다림이 헛되지 않다는 의미예요\n\n키워드: 희망 · 치유 · 연결',
    3, 'slide04.png')

  await slide05()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
