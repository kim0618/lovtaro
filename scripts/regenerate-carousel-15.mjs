/**
 * 4월 15일 캐러셀 개선 v2
 * - slide01: 카드 풀사이즈 + 궁금증 유발 훅
 * - slide02~04: 카드 상단 + 하단 텍스트 (스토리 스타일)
 * - slide05: CTA 감성적으로
 *
 * 실행: node scripts/regenerate-carousel-15.mjs
 */
import sharp from 'sharp'
import { writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/4월_15일__수_/carousel')

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

async function loadCard(slug, w, h) {
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) return null
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

const W = 1080, H = 1350

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

// ── slide01: 표지 - 카드 거의 풀사이즈 + 강한 훅 ──
async function slide01() {
  const cW = 750, cH = 940
  const cardTop = 80
  const cardLeft = (W - cW) / 2
  const img = await loadCard('fool', cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 20) : null
  const stars = generateStars(10, 50, 1030, 30, 70)

  const svgContent = `
  ${stars}
  <!-- 카드 글로우 -->
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
    <!-- 하단 페이드 -->
    <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(8,6,26,0)"/>
      <stop offset="40%" stop-color="rgba(8,6,26,0.3)"/>
      <stop offset="100%" stop-color="rgba(8,6,26,0.95)"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="500" rx="500" ry="500" fill="url(#glow)"/>

  <rect x="${cardLeft - 3}" y="${cardTop - 3}" width="${cW + 6}" height="${cH + 6}" rx="23" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#glowF)"/>

  <!-- 카드 위에 하단 페이드 오버레이 -->
  <rect x="${cardLeft}" y="${cardTop + cH - 300}" width="${cW}" height="300" rx="0" fill="url(#bottomFade)"/>

  <!-- 하단 텍스트 -->
  <text x="540" y="1100" font-family="sans-serif" font-size="52" font-weight="600" fill="#FFFFFF" text-anchor="middle">바보 카드가 나왔다면?</text>
  <text x="540" y="1155" font-family="sans-serif" font-size="28" fill="rgba(210,200,250,0.7)" text-anchor="middle">이 카드, 나쁜 게 아니에요</text>

  <text x="540" y="1310" font-family="sans-serif" font-size="22" fill="rgba(180,170,220,0.45)" text-anchor="middle">스와이프해서 확인하세요 →</text>
  `

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svgContent}</svg>`
  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png().toBuffer()

    // 하단 페이드 + 텍스트 다시 올리기
    const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bottomFade2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(10,8,28,0)"/>
        <stop offset="50%" stop-color="rgba(10,8,28,0.7)"/>
        <stop offset="100%" stop-color="rgba(10,8,28,0.98)"/>
      </linearGradient>
    </defs>
    <rect x="0" y="850" width="${W}" height="500" fill="url(#bottomFade2)"/>
    <text x="540" y="1100" font-family="sans-serif" font-size="52" font-weight="600" fill="#FFFFFF" text-anchor="middle">바보 카드가 나왔다면?</text>
    <text x="540" y="1155" font-family="sans-serif" font-size="28" fill="rgba(210,200,250,0.7)" text-anchor="middle">이 카드, 나쁜 게 아니에요</text>
    <text x="540" y="1310" font-family="sans-serif" font-size="22" fill="rgba(180,170,220,0.45)" text-anchor="middle">스와이프해서 확인하세요 →</text>
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(overlaySvg), left: 0, top: 0 }]).png().toBuffer()
  }
  return base
}

// ── slide02~04: 카드 풀배경 반투명 + 텍스트 중앙 ──
async function contentSlide(title, bodyText, index, total) {
  // 카드를 풀사이즈로 배경에 깔기
  const bgCardW = W, bgCardH = H
  const bgImg = await loadCard('fool', bgCardW, bgCardH)
  let bgCard = null
  if (bgImg) {
    const faded = await sharp(bgImg).ensureAlpha().modulate({ brightness: 0.8 }).png().toBuffer()
    const fadeMask = `<svg width="${bgCardW}" height="${bgCardH}"><rect width="${bgCardW}" height="${bgCardH}" fill="rgba(255,255,255,0.55)"/></svg>`
    bgCard = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()
  }

  const lines = bodyText.split('\n')
  const titleSize = 44
  const bodySize = 28
  const lineGap = 44
  const blankGap = 26

  // 텍스트 높이 계산
  let bodyTotalH = 0
  for (const l of lines) {
    bodyTotalH += l === '' ? blankGap : lineGap
  }
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

  // 1) 배경 생성
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

  // 2) 카드 배경 합성
  if (bgCard) {
    base = await sharp(base).composite([{ input: bgCard, left: 0, top: 0 }]).png().toBuffer()
  }

  // 3) 어두운 오버레이 + 텍스트
  const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <!-- 전체 어두운 오버레이 -->
  <rect width="${W}" height="${H}" fill="rgba(8,6,26,0.45)"/>

  <!-- 인덱스 -->
  <text x="1030" y="50" font-family="sans-serif" font-size="18" fill="rgba(180,170,230,0.5)" text-anchor="end">${index}/${total}</text>

  <!-- 제목 위 장식선 -->
  <line x1="340" y1="${titleY - titleSize - 12}" x2="740" y2="${titleY - titleSize - 12}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>

  <!-- 제목 -->
  <text x="540" y="${titleY}" font-family="sans-serif" font-size="${titleSize}" font-weight="600" fill="#FFFFFF" text-anchor="middle">${esc(title)}</text>

  <!-- 제목 아래 장식선 -->
  <line x1="340" y1="${titleY + 16}" x2="740" y2="${titleY + 16}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>

  <!-- 본문 -->
  ${bodySvg}
  </svg>`

  base = await sharp(base).composite([{ input: Buffer.from(overlaySvg), left: 0, top: 0 }]).png().toBuffer()
  return base
}

// ── slide05: CTA - 카드 중앙 + 감성 문구 ──
async function ctaSlide() {
  const cW = 500, cH = 670
  const cardTop = 150
  const cardLeft = (W - cW) / 2
  const img = await loadCard('fool', cW, cH)
  let masked = null
  if (img) {
    const m = await roundImg(img, cW, cH, 18)
    // 살짝 투명하게
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

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
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
  <text x="540" y="1105" font-family="sans-serif" font-size="24" fill="rgba(210,200,250,0.65)" text-anchor="middle">이 카드가 다시 나오면 꺼내보세요</text>

  <line x1="400" y1="1140" x2="680" y2="1140" stroke="rgba(180,170,230,0.12)" stroke-width="1"/>

  <text x="540" y="1180" font-family="sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">바보 카드가 나온 친구가 있다면</text>
  <text x="540" y="1212" font-family="sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">가볍게 공유해보세요</text>
  </svg>`

  let base = await sharp(Buffer.from(bgSvg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png().toBuffer()

    // 텍스트+아이콘 다시 올리기
    const textOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${saveIcon}
    ${shareIcon}
    <text x="540" y="1060" font-family="sans-serif" font-size="36" font-weight="500" fill="#FFFFFF" text-anchor="middle">저장해두고</text>
    <text x="540" y="1105" font-family="sans-serif" font-size="24" fill="rgba(210,200,250,0.65)" text-anchor="middle">이 카드가 다시 나오면 꺼내보세요</text>
    <line x1="400" y1="1140" x2="680" y2="1140" stroke="rgba(180,170,230,0.12)" stroke-width="1"/>
    <text x="540" y="1180" font-family="sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">바보 카드가 나온 친구가 있다면</text>
    <text x="540" y="1212" font-family="sans-serif" font-size="22" fill="rgba(200,190,240,0.5)" text-anchor="middle">가볍게 공유해보세요</text>
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(textOverlay), left: 0, top: 0 }]).png().toBuffer()
  }
  return base
}

async function main() {
  const slides = [
    { name: 'slide01.png', fn: slide01 },
    { name: 'slide02.png', fn: () => contentSlide(
      '바보 카드 = 새로운 시작',
      '겁 없이 다가갈 수 있는 에너지\n타로에서 가장 순수한 카드\n\n키워드: 설렘 / 가능성 / 용기',
      1, 3
    )},
    { name: 'slide03.png', fn: () => contentSlide(
      '연애에서 나왔다면?',
      '짝사랑:\n상대도 탐색 중이에요\n연락이 불규칙해도\n거리두기만은 아니에요\n\n커플:\n새로운 바람이 필요한 시기\n처음처럼 가볍게 다가가보세요',
      2, 3
    )},
    { name: 'slide04.png', fn: () => contentSlide(
      '이것만 주의하세요',
      '기대를 너무 구체적으로 잡으면\n오히려 흐름이 막혀요\n\n열어두는 만큼\n다음이 생깁니다',
      3, 3
    )},
    { name: 'slide05.png', fn: ctaSlide },
  ]

  for (const s of slides) {
    const img = await s.fn()
    writeFileSync(resolve(outputDir, s.name), img)
    console.log(`✅ ${s.name}`)
  }
  console.log('\n완료!')
}

main().catch(console.error)
