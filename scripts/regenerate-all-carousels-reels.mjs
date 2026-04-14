/**
 * 전체 캐러셀 릴스 사이즈 (1080x1920) 일괄 생성
 * - 기존 캐러셀(1080x1350)과 동일 콘텐츠, 9:16 비율
 * - 유튜브 Shorts / 릴스 용도
 *
 * 실행: node scripts/regenerate-all-carousels-reels.mjs
 */
import sharp from 'sharp'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output')

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

// ══════════════════════════════════════
// 슬라이드 함수 (1080x1920)
// ══════════════════════════════════════

// 표지: 카드 크게 + 하단 페이드
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

// 본문: 카드 풀배경 반투명 + 텍스트
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

  const indexLabel = (index !== '' && total !== '') ? `${index}/${total}` : ''
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="rgba(8,6,26,0.45)"/>
  ${indexLabel ? `<text x="1030" y="60" font-family="sans-serif" font-size="20" fill="rgba(180,170,230,0.5)" text-anchor="end">${indexLabel}</text>` : ''}
  <line x1="300" y1="${titleY - titleSize - 15}" x2="780" y2="${titleY - titleSize - 15}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  <text x="540" y="${titleY}" font-family="sans-serif" font-size="${titleSize}" font-weight="600" fill="#FFFFFF" text-anchor="middle">${esc(title)}</text>
  <line x1="300" y1="${titleY + 20}" x2="780" y2="${titleY + 20}" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  ${bodySvg}
  </svg>`
  base = await sharp(base).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png().toBuffer()
  return base
}

// 요일 카드 슬라이드 (주간 운세용)
async function dayCardSlide(card) {
  const cW = 660, cH = 880
  const cardTop = 160
  const cardLeft = (W - cW) / 2
  const img = await loadCard(card.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 18) : null

  const lines = card.line.split('\n')
  const nameY = cardTop + cH + 65
  const lineStartY = nameY + 60

  const lineSvg = lines.map((l, i) =>
    `<text x="540" y="${lineStartY + i * 50}" font-family="sans-serif" font-size="32" font-weight="300" fill="rgba(230,225,250,0.85)" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const svg = bgSvg(`
  <text x="540" y="90" font-family="sans-serif" font-size="28" fill="rgba(180,170,230,0.7)" text-anchor="middle" letter-spacing="6">${esc(card.day)}요일</text>
  <rect x="${cardLeft - 3}" y="${cardTop - 3}" width="${cW + 6}" height="${cH + 6}" rx="21" fill="none" stroke="rgba(160,140,240,0.15)" stroke-width="1.5" filter="url(#glowF)"/>
  <text x="540" y="${nameY}" font-family="sans-serif" font-size="42" font-weight="400" fill="#FFFFFF" text-anchor="middle">${esc(card.name)}</text>
  ${lineSvg}
  `)

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png().toBuffer()
    const textOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <text x="540" y="90" font-family="sans-serif" font-size="28" fill="rgba(180,170,230,0.7)" text-anchor="middle" letter-spacing="6">${esc(card.day)}요일</text>
    <text x="540" y="${nameY}" font-family="sans-serif" font-size="42" font-weight="400" fill="#FFFFFF" text-anchor="middle">${esc(card.name)}</text>
    ${lineSvg}
    </svg>`
    base = await sharp(base).composite([{ input: Buffer.from(textOverlay), left: 0, top: 0 }]).png().toBuffer()
  }
  return base
}

// 테스트 유형 슬라이드
async function testTypeSlide(item) {
  const bgImg = await loadCard(item.slug, W, H)
  let bgCard = null
  if (bgImg) {
    const faded = await sharp(bgImg).ensureAlpha().modulate({ brightness: 0.8 }).png().toBuffer()
    const fadeMask = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="rgba(255,255,255,0.55)"/></svg>`
    bgCard = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()
  }

  const lines = item.desc.split('\n')
  const descSvg = lines.map((l, i) =>
    `<text x="540" y="${1020 + i * 52}" font-family="sans-serif" font-size="32" font-weight="300" fill="rgba(240,238,255,0.95)" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  let base = await sharp(Buffer.from(bgSvg(''))).png().toBuffer()
  if (bgCard) base = await sharp(base).composite([{ input: bgCard, left: 0, top: 0 }]).png().toBuffer()

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="rgba(8,6,26,0.45)"/>
  <text x="540" y="680" font-family="sans-serif" font-size="72" font-weight="600" fill="rgba(180,170,230,0.7)" text-anchor="middle">${esc(item.type)}</text>
  <text x="540" y="750" font-family="sans-serif" font-size="34" fill="rgba(240,238,255,0.85)" text-anchor="middle">${esc(item.label)}</text>
  <line x1="320" y1="795" x2="760" y2="795" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  <text x="540" y="930" font-family="sans-serif" font-size="40" font-weight="500" fill="#FFFFFF" text-anchor="middle">${esc(item.cardName)}</text>
  ${descSvg}
  </svg>`
  base = await sharp(base).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png().toBuffer()
  return base
}

// 테스트 상황 슬라이드
async function testSituationSlide(cardSlug, title, body) {
  return textOnCardSlide(cardSlug, title, body, '', '')
}

// CTA 슬라이드
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
// 전체 캐러셀 데이터
// ══════════════════════════════════════

const ALL_CAROUSELS = [
  // 4/15 - edu (바보)
  {
    folder: '4월_15일__수_', type: 'edu', mainCard: 'fool',
    cover: { title: '바보 카드가 나왔다면?', sub: '이 카드, 나쁜 게 아니에요' },
    slides: [
      { title: '바보 카드 = 새로운 시작', body: '겁 없이 다가갈 수 있는 에너지\n타로에서 가장 순수한 카드\n\n키워드: 설렘 / 가능성 / 용기' },
      { title: '연애에서 나왔다면?', body: '짝사랑:\n상대도 탐색 중이에요\n연락이 불규칙해도\n거리두기만은 아니에요\n\n커플:\n새로운 바람이 필요한 시기\n처음처럼 가볍게 다가가보세요' },
      { title: '이것만 주의하세요', body: '기대를 너무 구체적으로 잡으면\n오히려 흐름이 막혀요\n\n열어두는 만큼\n다음이 생깁니다' },
    ],
    cta: { save: ['저장해두고', '이 카드가 다시 나오면 꺼내보세요'], share: ['바보 카드가 나온 친구가 있다면', '가볍게 공유해보세요'] },
  },
  // 4/17 - test (읽씹)
  {
    folder: '4월_17일__금_', type: 'test', mainCard: 'hanged-man',
    cover: { title: '읽씹당하면 당신은?', sub: '유형별 타로 카드 매칭' },
    situation: { card: 'hanged-man', title: '상황', body: '그 사람한테 카톡을 보냈어요\n읽음 표시는 떴는데 답이 없어요\n\n당신의 다음 행동은?' },
    testItems: [
      { type: 'A', label: '5분 안에 다시 보냄', slug: 'fool', cardName: '바보', desc: '용감한 당신\n거절이 두렵지 않은 타입' },
      { type: 'B', label: '하루 기다렸다 아무렇지 않은 척', slug: 'hanged-man', cardName: '매달린 사람', desc: '인내의 달인\n근데 속으로는 미치는 중' },
      { type: 'C', label: '삭제하고 없던 일로', slug: 'tower', cardName: '탑', desc: '깔끔한 정리파\n근데 새벽에 후회함' },
      { type: 'D', label: '다른 사람한테 연락해봄', slug: 'wheel-of-fortune', cardName: '운명의 수레바퀴', desc: '흐름을 바꾸는 타입\n의외로 이게 답일 수도' },
    ],
    cta: { save: ['저장해두고', '나중에 친구한테 보여주세요'], share: ['읽씹 고민 있는 친구에게', '공유해보세요'] },
  },
  // 4/20 - weekly
  {
    folder: '4월_20일__월_', type: 'weekly', mainCard: 'high-priestess',
    cover: { title: '이번 주 연애운', sub: '4월 20일 ~ 26일' },
    cards: [
      { slug: 'high-priestess', name: '여사제', day: '월', line: '직관을 믿는 날\n느낌이 오면 그걸 따라가세요' },
      { slug: 'lovers', name: '연인', day: '화', line: '선택의 순간이 오는 날\n마음이 이끄는 쪽으로 가세요' },
      { slug: 'hermit', name: '은둔자', day: '수', line: '내 감정을 들여다보는 날\n혼자만의 시간이 답이 돼요' },
      { slug: 'hierophant', name: '교황', day: '목', line: '진솔한 대화가 열리는 날\n솔직함이 관계를 깊게 해요' },
      { slug: 'tower', name: '탑', day: '금', line: '변화의 흐름이 오는 날\n흔들려도 괜찮아요' },
      { slug: 'moon', name: '달', day: '토', line: '감정이 깊어지는 날\n불안해도 그 감정이 진짜예요' },
      { slug: 'world', name: '세계', day: '일', line: '한 주를 마무리하는 날\n이번 주 잘 버텼어요' },
    ],
    cta: { save: ['저장해두고', '매일 아침 확인하세요'], share: ['이번 주 연애운이 궁금한 친구에게', '공유해도 좋아요'] },
  },
  // 4/22 - edu (연인)
  {
    folder: '4월_22일__수_', type: 'edu', mainCard: 'lovers',
    cover: { title: '연인 카드가 나왔다면?', sub: '선택의 순간이 왔다는 뜻이에요' },
    slides: [
      { title: '연인 카드 = 선택의 순간', body: '사랑에 빠졌다는 게 아니에요\n선택의 기로에 서 있다는 신호예요\n\n키워드: 선택 / 연결 / 조화' },
      { title: '짝사랑일 때 연인 카드', body: '상대도 당신에게 감정이 있어요\n하지만 확신을 못 하는 중\n\n선택을 강요하지 않는 게 현명해요\n자연스럽게 연결되는 걸 기다려요' },
      { title: '커플일 때 연인 카드', body: '관계가 새로운 단계로 갈 수 있어요\n솔직한 대화가 필요한 시기예요\n\n표현이 관계를 더 깊게 만들어줘요\n오늘 한 번 솔직해져보세요' },
      { title: '주의할 점', body: '선택을 두려워하면\n오히려 관계가 멈춰요\n\n연인 카드가 나왔다면\n지금이 용기 낼 타이밍이에요' },
    ],
    cta: { save: ['저장해두고', '연인 카드가 다시 나오면 꺼내보세요'], share: ['연인 카드가 나온 친구에게', '공유해보세요'] },
  },
  // 4/24 - test (연락 스타일)
  {
    folder: '4월_24일__금_', type: 'test', mainCard: 'moon',
    cover: { title: '나는 어떤 연락 스타일?', sub: '타로 유형 테스트' },
    situation: { card: 'moon', title: '상황', body: '마음에 드는 사람이 생겼어요\n번호는 알고 있는데\n아직 연락을 못 했어요\n\n당신의 첫 연락 방법은?' },
    testItems: [
      { type: 'A', label: '이유 없이 바로 연락', slug: 'fool', cardName: '바보', desc: '용감한 당신\n거절이 두렵지 않은 순수파' },
      { type: 'B', label: '핑계 만들어서 연락', slug: 'magician', cardName: '마법사', desc: '전략적인 당신\n준비된 만큼 확률도 높아져요' },
      { type: 'C', label: '상대가 먼저 하길 기다림', slug: 'hermit', cardName: '은둔자', desc: '기다리는 당신\n근데... 언제까지 기다릴 거예요?' },
      { type: 'D', label: '공통 화제 찾아서 연락', slug: 'empress', cardName: '여황제', desc: '공감하는 당신\n상대가 편안함을 느끼는 타입' },
    ],
    cta: { save: ['저장해두고', '친구한테 테스트 시켜보세요'], share: ['연락 고민 있는 친구에게', '공유해보세요'] },
  },
  // 4/27 - weekly
  {
    folder: '4월_27일__월_', type: 'weekly', mainCard: 'high-priestess',
    cover: { title: '이번 주 연애운', sub: '4월 27일 ~ 5월 3일' },
    cards: [
      { slug: 'high-priestess', name: '여사제', day: '월', line: '직감이 강해지는 날\n느낌대로 행동해보세요' },
      { slug: 'judgement', name: '심판', day: '화', line: '다시 한번 기회가 오는 날\n과거의 인연이 돌아올 수 있어요' },
      { slug: 'temperance', name: '절제', day: '수', line: '균형을 찾는 날\n서두르지 않는 게 답이에요' },
      { slug: 'world', name: '세계', day: '목', line: '완성의 에너지가 오는 날\n하나의 단계가 마무리돼요' },
      { slug: 'star', name: '별', day: '금', line: '희망이 보이는 날\n마음이 편안해지는 시간이에요' },
      { slug: 'strength', name: '힘', day: '토', line: '내면의 힘이 커지는 날\n감정을 다스릴 수 있는 날이에요' },
      { slug: 'sun', name: '태양', day: '일', line: '밝은 에너지가 가득한 날\n좋은 소식이 올 수 있어요' },
    ],
    cta: { save: ['저장해두고', '매일 아침 확인하세요'], share: ['이번 주 연애운이 궁금한 친구에게', '공유해도 좋아요'] },
  },
  // 4/29 - edu (여사제)
  {
    folder: '4월_29일__수_', type: 'edu', mainCard: 'high-priestess',
    cover: { title: '여사제 카드가 나왔다면?', sub: '직관의 신호가 왔다는 뜻이에요' },
    slides: [
      { title: '여사제 카드 = 직관의 신호', body: '뭔가 알고 있다는 뜻이에요\n논리가 아닌 느낌으로\n상대의 진심을 감지하고 있어요\n\n키워드: 직관 / 비밀 / 내면의 지혜' },
      { title: '짝사랑일 때 여사제 카드', body: '상대가 마음을 숨기고 있어요\n관심이 없는 게 아니라\n표현을 못 하고 있는 거예요\n\n당신이 먼저 다가가면\n벽이 무너질 수 있어요' },
      { title: '커플일 때 여사제 카드', body: '상대에게 말 못 한 이야기가 있어요\n나쁜 비밀이 아니에요\n\n감정을 정리하는 중일 뿐이에요\n조용히 기다려주면 말해줄 거예요' },
      { title: '주의할 점', body: '의심보다 신뢰가 필요한 시기예요\n캐묻기보다 기다려주세요\n\n여사제가 나왔다면\n직감을 믿되 서두르지 마세요' },
    ],
    cta: { save: ['저장해두고', '여사제 카드가 다시 나오면 꺼내보세요'], share: ['여사제 카드가 나온 친구에게', '공유해보세요'] },
  },
  // 5/1 - test (이별 후)
  {
    folder: '5월_1일__금_', type: 'test', mainCard: 'star',
    cover: { title: '이별 후 나는 어떤 타입?', sub: '타로 유형 테스트' },
    situation: { card: 'star', title: '상황', body: '오래 만난 사람과 헤어졌어요\n마음 한쪽이 텅 빈 느낌이에요\n\n당신의 다음 행동은?' },
    testItems: [
      { type: 'A', label: '바로 연락 차단하고 정리', slug: 'tower', cardName: '탑', desc: '깔끔한 당신\n미련 없이 끊어내는 타입이에요' },
      { type: 'B', label: 'SNS 스토리로 감정 표현', slug: 'moon', cardName: '달', desc: '감성적인 당신\n표현하지 않으면 터질 것 같은 타입' },
      { type: 'C', label: '혼자 삭이면서 시간에 맡김', slug: 'hermit', cardName: '은둔자', desc: '묵묵한 당신\n아프지만 혼자 견디는 타입이에요' },
      { type: 'D', label: '친구한테 하소연하면서 극복', slug: 'sun', cardName: '태양', desc: '회복력 좋은 당신\n아파도 빠르게 일어서는 타입' },
    ],
    cta: { save: ['저장해두고', '나중에 친구한테 시켜보세요'], share: ['이별 고민 있는 친구에게', '공유해보세요'] },
  },
]

async function main() {
  console.log(`전체 ${ALL_CAROUSELS.length}개 캐러셀 릴스 버전 생성 시작\n`)

  for (const c of ALL_CAROUSELS) {
    const dir = resolve(outputDir, c.folder, 'carousel-reels')
    ensureDir(dir)
    let slideNum = 1

    // 표지
    const cover = await coverSlide(c.mainCard, c.cover.title, c.cover.sub)
    writeFileSync(resolve(dir, `slide${String(slideNum++).padStart(2, '0')}.png`), cover)

    if (c.type === 'edu') {
      for (let i = 0; i < c.slides.length; i++) {
        const s = c.slides[i]
        const img = await textOnCardSlide(c.mainCard, s.title, s.body, i + 1, c.slides.length)
        writeFileSync(resolve(dir, `slide${String(slideNum++).padStart(2, '0')}.png`), img)
      }
    } else if (c.type === 'weekly') {
      for (const card of c.cards) {
        const img = await dayCardSlide(card)
        writeFileSync(resolve(dir, `slide${String(slideNum++).padStart(2, '0')}.png`), img)
      }
    } else if (c.type === 'test') {
      const sit = await testSituationSlide(c.situation.card, c.situation.title, c.situation.body)
      writeFileSync(resolve(dir, `slide${String(slideNum++).padStart(2, '0')}.png`), sit)
      for (const item of c.testItems) {
        const img = await testTypeSlide(item)
        writeFileSync(resolve(dir, `slide${String(slideNum++).padStart(2, '0')}.png`), img)
      }
    }

    // CTA
    const cta = await ctaSlide(c.mainCard, c.cta.save, c.cta.share)
    writeFileSync(resolve(dir, `slide${String(slideNum++).padStart(2, '0')}.png`), cta)

    console.log(`✅ ${c.folder} (${c.type}) - ${slideNum - 1}장`)
  }

  console.log('\n전체 완료!')
}

main().catch(console.error)
