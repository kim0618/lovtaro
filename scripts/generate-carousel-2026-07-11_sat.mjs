/**
 * carousel 2026-07-11_sat (The Devil 커버)
 * 훅: 놓아야 하는 걸 알면서도 / 관계를 더 힘들게 만드는 습관 3가지
 * 본문: Nine of Swords, Four of Pentacles, Seven of Swords
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-07-11_sat/carousel')

const W = 1080, H = 1350

const PORTRAIT_OVERRIDE = {
  'nine-of-swords': 'public/images/mcards/swords/Nine of Swords.png',
  'four-of-pentacles': 'public/images/mcards/pentacles/Four of Pentacles.png',
  'seven-of-swords': 'public/images/mcards/swords/Seven of Swords.png',
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
  const img = await loadCard('devil', cW, cH)
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
    <text x="540" y="1085" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="42" font-weight="300" fill="#F4F8FF" text-anchor="middle">놓아야 하는 걸 알면서도</text>
    <text x="540" y="1145" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="42" font-weight="300" fill="#F4F8FF" text-anchor="middle">관계를 더 힘들게 만드는</text>
    <text x="540" y="1205" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="42" font-weight="300" fill="#F4F8FF" text-anchor="middle">습관 3가지</text>
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
  const img = await loadCard('devil', cW, cH)
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
    <text x="540" y="1105" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="24" fill="rgba(210,200,250,0.65)" text-anchor="middle">마음이 조급해질 때 다시 꺼내보세요</text>
    <line x1="400" y1="1140" x2="680" y2="1140" stroke="rgba(180,170,230,0.12)" stroke-width="1"/>
    <text x="540" y="1180" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">요즘 관계가 힘든 친구에게도</text>
    <text x="540" y="1212" font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">가볍게 공유해보세요</text>
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(textOverlay), left: 0, top: 0 }]).png().toBuffer()
  }

  writeFileSync(resolve(outputDir, 'slide05.png'), base)
  console.log(`✅ slide05.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-07-11 carousel (The Devil 커버: 관계 힘들게 하는 습관) ===')
  mkdirSync(outputDir, { recursive: true })

  await slide01()

  await contentSlide('nine-of-swords',
    'Nine of Swords', '혼자 최악을 그려봐요',
    '연락이 늦어지는 이유를\n자꾸 나쁜 쪽으로 상상해요\n\n확인되지 않은 불안이\n마음을 먼저 지치게 만들어요\n\n키워드: 불안 · 상상 · 지침',
    1, 'slide02.png')

  await contentSlide('four-of-pentacles',
    'Four of Pentacles', '꽉 쥘수록 멀어져요',
    '떠날까 봐 더 세게 붙잡고\n작은 변화도 통제하려 해요\n\n움켜쥔 손은 그 마음을\n오히려 밖으로 밀어내요\n\n키워드: 집착 · 통제 · 불안',
    2, 'slide03.png')

  await contentSlide('seven-of-swords',
    'Seven of Swords', '솔직함을 자꾸 미뤄요',
    '진짜 마음은 숨긴 채\n괜찮은 척 떠보기만 해요\n\n감춘 말이 쌓일수록\n거리는 조용히 벌어져요\n\n키워드: 회피 · 숨김 · 떠봄',
    3, 'slide04.png')

  await slide05()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
