/**
 * 4월 15일 캐러셀 릴스 사이즈 (1080x1920)
 * - 기존 캐러셀(1080x1350)과 동일한 콘텐츠, 세로 확장
 *
 * 실행: node scripts/generate-carousel-reels-15.mjs
 */
import sharp from 'sharp'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/4월_15일__수_/carousel-reels')

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function ensureDir(d) { if (!existsSync(d)) mkdirSync(d, { recursive: true }) }

async function loadCard(slug, w, h) {
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) return null
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

const W = 1080, H = 1920

function generateStars(count, xMin, xMax, yMin, yMax) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51]
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = 1 + seed[(i + 3) % seed.length] * 2.5
    const opacity = 0.25 + seed[(i + 5) % seed.length] * 0.6
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="rgba(255,255,255,${opacity.toFixed(2)})"/>\n`
  }
  return stars
}

function bgSvg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
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
    <filter id="glowF" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="700" rx="550" ry="650" fill="url(#glow)"/>
  ${content}
  </svg>`
}

// ── 표지: 카드 크게 + 하단 페이드 텍스트 ──
async function coverSlide(cardSlug, title, subtitle) {
  const cW = 800, cH = 1100
  const cardTop = 160
  const cardLeft = (W - cW) / 2
  const img = await loadCard(cardSlug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 22) : null
  const stars = generateStars(12, 50, 1030, 40, 140)

  const svg = bgSvg(`${stars}
  <rect x="${cardLeft - 3}" y="${cardTop - 3}" width="${cW + 6}" height="${cH + 6}" rx="25" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#glowF)"/>`)

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png().toBuffer()
    const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(10,8,28,0)"/>
      <stop offset="50%" stop-color="rgba(10,8,28,0.7)"/>
      <stop offset="100%" stop-color="rgba(10,8,28,0.98)"/>
    </linearGradient></defs>
    <rect x="0" y="1100" width="${W}" height="820" fill="url(#bf)"/>
    <text x="540" y="1480" font-family="sans-serif" font-size="56" font-weight="600" fill="#FFFFFF" text-anchor="middle">${esc(title)}</text>
    <text x="540" y="1545" font-family="sans-serif" font-size="30" fill="rgba(210,200,250,0.7)" text-anchor="middle">${esc(subtitle)}</text>
    <text x="540" y="1820" font-family="sans-serif" font-size="24" fill="rgba(180,170,220,0.45)" text-anchor="middle">스와이프해서 확인하세요 →</text>
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png().toBuffer()
  }
  return base
}

// ── 본문: 카드 풀배경 반투명 + 텍스트 ──
async function textOnCardSlide(cardSlug, title, bodyText, index, total) {
  const bgImg = await loadCard(cardSlug, W, H)
  let bgCard = null
  if (bgImg) {
    const faded = await sharp(bgImg).ensureAlpha().modulate({ brightness: 0.8 }).png().toBuffer()
    const fadeMask = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="rgba(255,255,255,0.55)"/></svg>`
    bgCard = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()
  }

  const lines = bodyText.split('\n')
  const titleSize = 48
  const bodySize = 32
  const lineGap = 52
  const blankGap = 32

  let bodyTotalH = 0
  for (const l of lines) bodyTotalH += l === '' ? blankGap : lineGap
  const totalTextH = titleSize + 60 + bodyTotalH
  const startY = Math.round((H - totalTextH) / 2)
  const titleY = startY + titleSize

  let curY = titleY + 70
  const bodySvg = lines.map(l => {
    if (l === '') { curY += blankGap; return '' }
    const s = `<text x="540" y="${curY}" font-family="sans-serif" font-size="${bodySize}" font-weight="300" fill="rgba(240,238,255,0.95)" text-anchor="middle">${esc(l)}</text>`
    curY += lineGap
    return s
  }).filter(s => s).join('\n  ')

  let base = await sharp(Buffer.from(bgSvg(''))).png().toBuffer()
  if (bgCard) {
    base = await sharp(base).composite([{ input: bgCard, left: 0, top: 0 }]).png().toBuffer()
  }

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="rgba(8,6,26,0.45)"/>
  <text x="1030" y="60" font-family="sans-serif" font-size="20" fill="rgba(180,170,230,0.5)" text-anchor="end">${index}/${total}</text>
  <line x1="300" y1="${titleY - titleSize - 15}" x2="780" y2="${titleY - titleSize - 15}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  <text x="540" y="${titleY}" font-family="sans-serif" font-size="${titleSize}" font-weight="600" fill="#FFFFFF" text-anchor="middle">${esc(title)}</text>
  <line x1="300" y1="${titleY + 20}" x2="780" y2="${titleY + 20}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  ${bodySvg}
  </svg>`
  base = await sharp(base).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png().toBuffer()
  return base
}

// ── CTA 슬라이드 ──
async function ctaSlide(cardSlug, saveLines, shareLines) {
  const cW = 560, cH = 750
  const cardTop = 280
  const cardLeft = (W - cW) / 2
  const img = await loadCard(cardSlug, cW, cH)
  let masked = null
  if (img) {
    const m = await roundImg(img, cW, cH, 18)
    const faded = await sharp(m).ensureAlpha().modulate({ brightness: 0.85 }).png().toBuffer()
    const fadeMask = `<svg width="${cW}" height="${cH}"><rect width="${cW}" height="${cH}" rx="18" fill="rgba(255,255,255,0.5)"/></svg>`
    masked = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()
  }

  const iconY = 1200
  const saveIcon = `<g transform="translate(430, ${iconY})"><path d="M14 0 L72 0 Q86 0 86 14 L86 105 L43 78 L0 105 L0 14 Q0 0 14 0 Z" fill="none" stroke="rgba(200,190,255,0.55)" stroke-width="2.5"/></g>`
  const shareIcon = `<g transform="translate(570, ${iconY})"><path d="M58 0 L86 30 L58 60" fill="none" stroke="rgba(200,190,255,0.55)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M86 30 L14 30 L14 86" fill="none" stroke="rgba(200,190,255,0.55)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g>`

  const sLine1 = saveLines[0] || '저장해두고'
  const sLine2 = saveLines[1] || '나중에 꺼내보세요'
  const shLine1 = shareLines[0] || '친구에게 공유해보세요'
  const shLine2 = shareLines[1] || ''

  const textY1 = iconY + 160
  const textY2 = textY1 + 50
  const lineY = textY2 + 40
  const textY3 = lineY + 45
  const textY4 = textY3 + 38

  const svg = bgSvg(`
  <rect x="${cardLeft - 3}" y="${cardTop - 3}" width="${cW + 6}" height="${cH + 6}" rx="21" fill="none" stroke="rgba(160,140,240,0.12)" stroke-width="1.5" filter="url(#glowF)"/>
  ${saveIcon} ${shareIcon}
  <text x="540" y="${textY1}" font-family="sans-serif" font-size="38" font-weight="500" fill="#FFFFFF" text-anchor="middle">${esc(sLine1)}</text>
  <text x="540" y="${textY2}" font-family="sans-serif" font-size="26" fill="rgba(210,200,250,0.65)" text-anchor="middle">${esc(sLine2)}</text>
  <line x1="400" y1="${lineY}" x2="680" y2="${lineY}" stroke="rgba(180,170,230,0.12)" stroke-width="1"/>
  <text x="540" y="${textY3}" font-family="sans-serif" font-size="24" fill="rgba(200,190,240,0.5)" text-anchor="middle">${esc(shLine1)}</text>
  ${shLine2 ? `<text x="540" y="${textY4}" font-family="sans-serif" font-size="24" fill="rgba(200,190,240,0.5)" text-anchor="middle">${esc(shLine2)}</text>` : ''}
  `)

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png().toBuffer()
    const textOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${saveIcon} ${shareIcon}
    <text x="540" y="${textY1}" font-family="sans-serif" font-size="38" font-weight="500" fill="#FFFFFF" text-anchor="middle">${esc(sLine1)}</text>
    <text x="540" y="${textY2}" font-family="sans-serif" font-size="26" fill="rgba(210,200,250,0.65)" text-anchor="middle">${esc(sLine2)}</text>
    <line x1="400" y1="${lineY}" x2="680" y2="${lineY}" stroke="rgba(180,170,230,0.12)" stroke-width="1"/>
    <text x="540" y="${textY3}" font-family="sans-serif" font-size="24" fill="rgba(200,190,240,0.5)" text-anchor="middle">${esc(shLine1)}</text>
    ${shLine2 ? `<text x="540" y="${textY4}" font-family="sans-serif" font-size="24" fill="rgba(200,190,240,0.5)" text-anchor="middle">${esc(shLine2)}</text>` : ''}
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(textOverlay), left: 0, top: 0 }]).png().toBuffer()
  }
  return base
}

// ══════════════════════════════════════
// 4/15 edu 캐러셀 데이터
// ══════════════════════════════════════

const data = {
  mainCard: 'fool',
  cover: { title: '바보 카드가 나왔다면?', sub: '이 카드, 나쁜 게 아니에요' },
  slides: [
    { title: '바보 카드 = 새로운 시작', body: '겁 없이 다가갈 수 있는 에너지\n타로에서 가장 순수한 카드\n\n키워드: 설렘 / 가능성 / 용기' },
    { title: '연애에서 나왔다면?', body: '짝사랑:\n상대도 탐색 중이에요\n연락이 불규칙해도\n거리두기만은 아니에요\n\n커플:\n새로운 바람이 필요한 시기\n처음처럼 가볍게 다가가보세요' },
    { title: '이것만 주의하세요', body: '기대를 너무 구체적으로 잡으면\n오히려 흐름이 막혀요\n\n열어두는 만큼\n다음이 생깁니다' },
  ],
  cta: { save: ['저장해두고', '이 카드가 다시 나오면 꺼내보세요'], share: ['바보 카드가 나온 친구가 있다면', '가볍게 공유해보세요'] },
}

async function main() {
  ensureDir(outputDir)
  const total = 1 + data.slides.length + 1 // cover + slides + cta

  // 1. 표지
  const cover = await coverSlide(data.mainCard, data.cover.title, data.cover.sub)
  writeFileSync(resolve(outputDir, 'slide01.png'), cover)
  console.log('✅ slide01 (표지)')

  // 2~4. 본문 슬라이드
  for (let i = 0; i < data.slides.length; i++) {
    const s = data.slides[i]
    const slide = await textOnCardSlide(data.mainCard, s.title, s.body, i + 2, total)
    writeFileSync(resolve(outputDir, `slide0${i + 2}.png`), slide)
    console.log(`✅ slide0${i + 2} (${s.title})`)
  }

  // 5. CTA
  const cta = await ctaSlide(data.mainCard, data.cta.save, data.cta.share)
  writeFileSync(resolve(outputDir, `slide0${total}.png`), cta)
  console.log(`✅ slide0${total} (CTA)`)

  console.log(`\n완료! ${total}장 생성 → ${outputDir}`)
}

main().catch(console.error)
