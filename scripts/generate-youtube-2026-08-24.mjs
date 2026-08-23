/**
 * 유튜브 쇼츠 프레임 생성 템플릿 (복사해서 DAYS 배열만 교체)
 * - 참여형(월화목토일): 훅 → 전환 → 카드3 × [리빌+2페이지] → 아웃트로 (~85초)
 * - 단일형(수금): 훅 → 리빌 → 3페이지 → 아웃트로 (~50초)
 * 출력: content-output/{date}/youtube/frames/*.png + scenes.txt
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { colorCardBackSvg, colorCardBackDefs, CARD_WIDTH, CARD_HEIGHT, getSchemeAccent, SCHEME_KEYS } from './lib/color-card-back-svg.mjs'

const W = 1080, H = 1920
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const IMAGES = resolve(rootDir, 'public/images')
const CONTENT = resolve(rootDir, 'content-output')
const KO = `'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif`

function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function genStars(count, seed, bright = false) {
  const rand = mulberry32(seed)
  const colors = bright
    ? ['#ffe9b3', '#f4d99f', '#e8d48b', '#ffffff', '#fff5d4']
    : ['#e8d48b', '#c9a84c', '#d4b85c', '#b89858', '#8f7a4a']
  let stars = ''
  for (let i = 0; i < count; i++) {
    const x = rand() * W, y = rand() * H
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
    <mask id="moonMaskSmall">
      <rect x="0" y="0" width="${W}" height="${H}" fill="black"/>
      <circle cx="115" cy="200" r="34" fill="white"/>
      <circle cx="138" cy="192" r="34" fill="black"/>
    </mask>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
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
    <radialGradient id="cardGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(232,212,139,0.32)"/>
      <stop offset="55%" stop-color="rgba(180,140,210,0.14)"/>
      <stop offset="100%" stop-color="rgba(20,10,40,0)"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
      <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
    </radialGradient>
    <radialGradient id="thumbGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(232,212,139,0.20)"/>
      <stop offset="60%" stop-color="rgba(180,140,210,0.08)"/>
      <stop offset="100%" stop-color="rgba(20,10,40,0)"/>
    </radialGradient>
    <linearGradient id="goldDivider" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/>
      <stop offset="30%" stop-color="#e8d48b" stop-opacity="0.95"/>
      <stop offset="70%" stop-color="#e8d48b" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/>
    </linearGradient>
  `
}

// moon: true|'left' 좌상단(기본) · 'right' 우상단 · false|'none' 없음
function body(starSeed = 711, moon = true) {
  const showMoon = moon && moon !== 'none'
  const mx = moon === 'right' ? 955 : 125
  return `
    <rect width="${W}" height="${H}" fill="url(#cosmicBg)"/>
    <ellipse cx="900" cy="1700" rx="500" ry="350" fill="url(#neb3)"/>
    <ellipse cx="180" cy="1550" rx="400" ry="300" fill="url(#neb2)"/>
    ${genStars(260, starSeed)}
    ${genStars(70, starSeed + 11, true)}
    ${showMoon ? `<circle cx="${mx}" cy="205" r="80" fill="url(#moonGlow)"/>
    <rect x="${mx - 55}" y="150" width="120" height="120" fill="rgba(248,230,185,0.9)" mask="url(#moonMaskSmall)"/>` : ''}
  `
}

function drawFrame(x, y, w, h, strong = 1) {
  const gap = 10
  const cornerSize = 32
  const c1 = `rgba(201,168,76,${0.80 * strong})`
  const c2 = `rgba(201,168,76,${0.40 * strong})`
  const c3 = `rgba(232,212,139,${0.75 * strong})`
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c1}" stroke-width="2.5"/>
    <rect x="${x + gap}" y="${y + gap}" width="${w - 2 * gap}" height="${h - 2 * gap}" fill="none" stroke="${c2}" stroke-width="1"/>
    <path d="M ${x + cornerSize} ${y + gap / 2} L ${x + gap / 2} ${y + gap / 2} L ${x + gap / 2} ${y + cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
    <path d="M ${x + w - cornerSize} ${y + gap / 2} L ${x + w - gap / 2} ${y + gap / 2} L ${x + w - gap / 2} ${y + cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
    <path d="M ${x + cornerSize} ${y + h - gap / 2} L ${x + gap / 2} ${y + h - gap / 2} L ${x + gap / 2} ${y + h - cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
    <path d="M ${x + w - cornerSize} ${y + h - gap / 2} L ${x + w - gap / 2} ${y + h - gap / 2} L ${x + w - gap / 2} ${y + h - cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
  `
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

// 카드 뒷면 색은 날짜 시드로 뽑는다. 고정 3색이던 시절엔 7일이 같아 보여서
// 인스타 scene01을 복사해 쓰는 우회책이 필요했다.
function pickSchemesSeeded(seed, count = 3) {
  const rnd = mulberry32(seed * 7919 + 13)
  const keys = [...SCHEME_KEYS]
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[keys[i], keys[j]] = [keys[j], keys[i]]
  }
  return keys.slice(0, count)
}

// ── 요일별 훅 배치
// 첫 3초의 실루엣(텍스트 위치·카드 배치·달 위치)을 요일마다 바꾼다.
// 매일 같은 실루엣이면 시청자에게도 알고리즘에게도 같은 영상으로 읽힌다.
const HOOK_LAYOUT = {
  mon: { arrange: 'row', textY: 378, moon: 'left', guideY: 1640 },
  tue: { arrange: 'fan', textY: 330, moon: 'none', guideY: 1660 },
  wed: { arrange: 'art', textY: 330, moon: 'left' },
  thu: { arrange: 'stair', textY: 330, moon: 'right', guideY: 1700 },
  fri: { arrange: 'art', textY: 1380, moon: 'none' },
  sat: { arrange: 'stack', textY: 378, moon: 'none', guideY: 1660 },
  sun: {
    arrange: 'triangle', textY: 300, moon: 'left', guideY: 1740,
    sub: ['Sunday Tarot Preview', '지금 고른 카드가 다음 주 흐름을 열어줘요'],
  },
}
const layoutOf = (day) => HOOK_LAYOUT[day.date.slice(-3)] ?? HOOK_LAYOUT.mon

// 배치별 카드 좌표 [cx, cy, 회전각]. drawOrder는 겹치는 배치에서 위로 올릴 순서
function pickSlots(arrange) {
  switch (arrange) {
    case 'fan':
      return { scale: 2.5, slots: [[215, 1050, -13], [540, 950, 0], [865, 1050, 13]], drawOrder: [0, 2, 1] }
    case 'stair':
      return { scale: 2.35, slots: [[215, 1150, -7], [540, 1000, 0], [865, 850, 7]], drawOrder: [0, 1, 2] }
    case 'stack':
      return { scale: 2.6, slots: [[330, 1010, -11], [540, 965, 0], [750, 1010, 11]], drawOrder: [0, 2, 1] }
    case 'triangle':
      return { scale: 2.15, slots: [[540, 800, 0], [330, 1265, -9], [750, 1265, 9]], drawOrder: [1, 2, 0] }
    default:
      return { scale: 2.5, slots: [[190, 980, 0], [540, 980, 0], [890, 980, 0]], drawOrder: [0, 1, 2] }
  }
}

// ── 훅 (참여형: 카드 3장)
async function sceneHook3(day) {
  const L = layoutOf(day)
  const { scale, slots, drawOrder } = pickSlots(L.arrange)
  const cw = CARD_WIDTH * scale, ch = CARD_HEIGHT * scale
  const schemes = pickSchemesSeeded(day.seed)
  const guideY = L.guideY ?? 1640
  const glowCY = Math.round(slots.reduce((s, [, cy]) => s + cy, 0) / slots.length)

  const glows = drawOrder.map((i) => {
    const [cx, cy] = slots[i]
    return `<ellipse cx="${cx}" cy="${cy}" rx="${cw * 0.8}" ry="${ch * 0.55}" fill="url(#colorCardGlow_${schemes[i]})" filter="url(#glowBlur)"/>`
  }).join('')

  const cards = drawOrder.map((i) => {
    const [cx, cy, rot] = slots[i]
    const card = colorCardBackSvg(cx, cy, scale, schemes[i])
    return rot ? `<g transform="rotate(${rot} ${cx} ${cy})">${card}</g>` : card
  }).join('')

  const numbers = slots.map(([cx, cy], i) =>
    `<text x="${cx}" y="${cy + ch / 2 + 55}" text-anchor="middle" font-family="${KO}" font-size="42" fill="${getSchemeAccent(schemes[i])}" font-weight="600">${i + 1}번</text>`).join('')

  const sub = L.sub ? `
      <text x="540" y="${L.textY + 175}" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="rgba(232,212,139,0.85)" letter-spacing="3" font-style="italic">${L.sub[0]}</text>
      <text x="540" y="${L.textY + 228}" text-anchor="middle" font-family="${KO}" font-size="26" fill="rgba(244,248,255,0.62)" letter-spacing="2" font-weight="300">${L.sub[1]}</text>` : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}${colorCardBackDefs()}</defs>
    ${body(day.seed, L.moon)}
    <ellipse cx="540" cy="${glowCY}" rx="500" ry="380" fill="url(#cardAreaGlow)" filter="url(#glowBlur)"/>
    <g filter="url(#softGlow)">
      <text x="540" y="${L.textY}" text-anchor="middle" font-family="${KO}" font-size="46" fill="#F4F8FF" letter-spacing="2" font-weight="300">${day.hook[0]}</text>
      <text x="540" y="${L.textY + 80}" text-anchor="middle" font-family="${KO}" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">${day.hook[1]}</text>${sub}
    </g>
    ${glows}
    <g filter="url(#cardShadow)">
      ${cards}
    </g>
    <g filter="url(#softGlow)">
      ${numbers}
    </g>
    <text x="540" y="${guideY}" text-anchor="middle" font-family="${KO}" font-size="30" fill="rgba(244,248,255,0.6)" letter-spacing="5" font-weight="300">직감으로 하나를 골라보세요</text>
    <text x="540" y="1860" text-anchor="middle" font-family="${KO}" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`
  return sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
}

// ── 훅 (단일형: 카드 1장)
// 소개형은 카드 앞면 풀블리드. 수요일은 텍스트 상단, 금요일은 하단으로 갈라
// 같은 소개형 두 편도 첫 화면이 겹치지 않게 한다.
async function sceneHook1(day) {
  const L = layoutOf(day)
  const card = day.cards[0]
  const bottom = L.textY > 900
  const art = await sharp(`${IMAGES}/${card.file}`)
    .resize(W, H, { fit: 'cover' })
    .modulate({ brightness: 0.8 })
    .toBuffer()

  const scrim = bottom
    ? `<linearGradient id="hookScrim" x1="0" y1="0.30" x2="0" y2="1">
         <stop offset="0%" stop-color="#08061a" stop-opacity="0"/>
         <stop offset="100%" stop-color="#08061a" stop-opacity="0.93"/>
       </linearGradient>`
    : `<linearGradient id="hookScrim" x1="0" y1="0" x2="0" y2="0.70">
         <stop offset="0%" stop-color="#08061a" stop-opacity="0.93"/>
         <stop offset="100%" stop-color="#08061a" stop-opacity="0"/>
       </linearGradient>`

  const showMoon = L.moon && L.moon !== 'none'
  const mx = L.moon === 'right' ? 955 : 125

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}${scrim}</defs>
    <rect width="${W}" height="${H}" fill="rgba(8,6,26,0.34)"/>
    <rect width="${W}" height="${H}" fill="url(#hookScrim)"/>
    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    ${showMoon ? `<circle cx="${mx}" cy="205" r="80" fill="url(#moonGlow)"/>
    <rect x="${mx - 55}" y="150" width="120" height="120" fill="rgba(248,230,185,0.9)" mask="url(#moonMaskSmall)"/>` : ''}
    <g filter="url(#softGlow)">
      <text x="540" y="${L.textY}" text-anchor="middle" font-family="${KO}" font-size="46" fill="#F4F8FF" letter-spacing="2" font-weight="300">${day.hook[0]}</text>
      <text x="540" y="${L.textY + 80}" text-anchor="middle" font-family="${KO}" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">${day.hook[1]}</text>
    </g>
    <text x="540" y="${bottom ? L.textY + 175 : 1700}" text-anchor="middle" font-family="${KO}" font-size="30" fill="rgba(244,248,255,0.6)" letter-spacing="5" font-weight="300">오늘의 카드를 만나보세요</text>
    <text x="540" y="1860" text-anchor="middle" font-family="${KO}" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`
  return sharp(art).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png({ quality: 90 }).toBuffer()
}

// ── 전환
async function sceneTransition(day) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}</defs>
    ${body(day.seed + 1)}
    <g filter="url(#softGlow)">
      <text x="540" y="900" text-anchor="middle" font-family="${KO}" font-size="60" fill="#F4F8FF" letter-spacing="4" font-weight="300">고르셨나요?</text>
      <text x="540" y="1020" text-anchor="middle" font-family="${KO}" font-size="34" fill="rgba(232,212,139,0.85)" letter-spacing="3" font-weight="300">이제 카드를 뒤집어볼게요</text>
    </g>
    <g opacity="0.85" filter="url(#softGlow)">
      <circle cx="480" cy="1160" r="5" fill="#e8d48b"/>
      <circle cx="540" cy="1160" r="5" fill="#e8d48b"/>
      <circle cx="600" cy="1160" r="5" fill="#e8d48b"/>
    </g>
    <text x="540" y="1860" text-anchor="middle" font-family="${KO}" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`
  return sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
}

// ── 리빌
async function sceneReveal(day, card) {
  const cardW = 780, cardH = 1170
  const framePad = 30
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad
  const frameX = (W - frameW) / 2
  const frameY = 265
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const cardRaw = await sharp(`${IMAGES}/${card.file}`)
    .resize(cardW, cardH, { fit: 'cover', kernel: 'lanczos3' })
    .toBuffer()
  const cardEnhanced = await sharp(cardRaw)
    .sharpen({ sigma: 0.7, m1: 0.5, m2: 2.2 })
    .modulate({ saturation: 1.12, brightness: 1.03 })
    .toBuffer()
  const masked = await roundImg(cardEnhanced, cardW, cardH, 8)

  const labelStartY = frameY + frameH + 70
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}</defs>
    ${body(day.seed + card.no * 3, false)}
    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    <ellipse cx="${W / 2}" cy="${frameY + frameH / 2}" rx="${frameW * 0.82}" ry="${frameH * 0.65}" fill="url(#cardGlow)"/>
    ${card.numGlyph ? `<g filter="url(#softGlow)">
      <text x="540" y="105" text-anchor="middle" font-family="Georgia, serif" font-size="60" fill="rgba(232,212,139,0.95)" font-weight="400" letter-spacing="2">${card.numGlyph}</text>
    </g>` : ''}
    <g filter="url(#softGlow)">
      <text x="540" y="175" text-anchor="middle" font-family="${KO}" font-size="42" fill="#F4F8FF" letter-spacing="2" font-weight="300">${card.reveal[0]}</text>
      <text x="540" y="225" text-anchor="middle" font-family="${KO}" font-size="42" fill="#F4F8FF" letter-spacing="2" font-weight="300">${card.reveal[1]}</text>
    </g>
    ${drawFrame(frameX, frameY, frameW, frameH, 1.3)}
    <g filter="url(#softGlow)">
      <text x="540" y="${labelStartY}" text-anchor="middle" font-family="${KO}" font-size="54" fill="#F4F8FF" font-weight="300" letter-spacing="3">${card.nameKo}</text>
    </g>
    <text x="540" y="${labelStartY + 55}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="32" fill="rgba(232,212,139,0.92)" letter-spacing="2">${card.nameEn}</text>
    <text x="540" y="${labelStartY + 115}" text-anchor="middle" font-family="${KO}" font-size="28" fill="rgba(232,212,139,0.78)" letter-spacing="4" font-weight="300">${card.keywords}</text>
    <text x="540" y="1860" text-anchor="middle" font-family="${KO}" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  return sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
}

// ── 텍스트 페이지 (카드 아트 페이드 배경 + 6줄)
async function sceneTextPage(day, card, pageIdx, pageCount, label, lines) {
  const bgCardRaw = await sharp(`${IMAGES}/${card.file}`)
    .resize(W, H, { fit: 'cover' })
    .modulate({ brightness: 0.75 })
    .ensureAlpha()
    .toBuffer()
  const fadeMask = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="rgba(255,255,255,0.30)"/></svg>`
  const bgCard = await sharp(bgCardRaw).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}</defs>
    ${body(day.seed + card.no * 10 + pageIdx, false)}
  </svg>`
  let base = await sharp(Buffer.from(bgSvg)).png().toBuffer()
  base = await sharp(base).composite([{ input: bgCard, left: 0, top: 0 }]).png().toBuffer()

  const textStart = 740
  const lineGap = 104
  const dotsTotalW = (pageCount - 1) * 48
  const dots = Array.from({ length: pageCount }, (_, i) =>
    `<circle cx="${540 - dotsTotalW / 2 + i * 48}" cy="1620" r="7" fill="${i === pageIdx ? '#e8d48b' : 'rgba(232,212,139,0.25)'}"/>`).join('')

  const header = card.numGlyph
    ? `<text x="540" y="170" text-anchor="middle" font-family="Georgia, serif" font-size="44" fill="rgba(232,212,139,0.95)" letter-spacing="2">${card.numGlyph}</text>
       <text x="540" y="240" text-anchor="middle" font-family="${KO}" font-size="32" fill="rgba(244,248,255,0.85)" letter-spacing="3" font-weight="300">${card.nameKo} · ${card.nameEn}</text>`
    : `<text x="540" y="200" text-anchor="middle" font-family="${KO}" font-size="34" fill="rgba(244,248,255,0.88)" letter-spacing="3" font-weight="300">${card.nameKo} · ${card.nameEn}</text>`

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}</defs>
    <rect width="${W}" height="${H}" fill="rgba(8,6,26,0.52)"/>
    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    <g filter="url(#softGlow)">${header}</g>
    <line x1="300" y1="420" x2="780" y2="420" stroke="url(#goldDivider)" stroke-width="2"/>
    <text x="540" y="530" text-anchor="middle" font-family="${KO}" font-size="46" fill="rgba(232,212,139,0.95)" letter-spacing="4" font-weight="500" filter="url(#softGlow)">${label}</text>
    <line x1="300" y1="600" x2="780" y2="600" stroke="url(#goldDivider)" stroke-width="2"/>
    ${lines.map((line, i) => `<text x="540" y="${textStart + i * lineGap}" text-anchor="middle" font-family="${KO}" font-size="36" fill="#F4F8FF" letter-spacing="0.5" font-weight="300" filter="url(#softGlow)">${line}</text>`).join('')}
    ${dots}
    <text x="540" y="1860" text-anchor="middle" font-family="${KO}" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`
  return sharp(base).composite([{ input: Buffer.from(overlay), left: 0, top: 0 }]).png({ quality: 90 }).toBuffer()
}

// ── 아웃트로 (참여형: 3장 썸네일 + 댓글 유도)
async function sceneOutro3(day) {
  const thumbW = 300, thumbH = 450
  const thumbGap = 40
  const totalW = thumbW * 3 + thumbGap * 2
  const startX = (W - totalW) / 2
  const thumbY = 560

  const thumbs = []
  for (let i = 0; i < day.cards.length; i++) {
    const raw = await sharp(`${IMAGES}/${day.cards[i].file}`)
      .resize(thumbW, thumbH, { fit: 'cover', kernel: 'lanczos3' })
      .toBuffer()
    const enhanced = await sharp(raw)
      .sharpen({ sigma: 0.6, m1: 0.5, m2: 2.0 })
      .modulate({ saturation: 1.1, brightness: 1.02 })
      .toBuffer()
    thumbs.push({ input: await roundImg(enhanced, thumbW, thumbH, 8), left: Math.round(startX + i * (thumbW + thumbGap)), top: thumbY })
  }

  const framePad = 14
  const frameOverlays = day.cards.map((_, i) => {
    const fx = Math.round(startX + i * (thumbW + thumbGap)) - framePad
    return drawFrame(fx, thumbY - framePad, thumbW + framePad * 2, thumbH + framePad * 2, 1.1)
  }).join('\n')

  const numberLabelY = thumbY + thumbH + 55
  const numCxs = day.cards.map((_, i) => Math.round(startX + i * (thumbW + thumbGap) + thumbW / 2))

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}</defs>
    ${body(day.seed + 90, false)}
    <ellipse cx="540" cy="${thumbY + thumbH / 2}" rx="560" ry="${thumbH * 0.7}" fill="url(#thumbGlow)" filter="url(#glowBlur)"/>
    <g filter="url(#softGlow)">
      <text x="540" y="290" text-anchor="middle" font-family="${KO}" font-size="58" fill="#F4F8FF" letter-spacing="2" font-weight="300">어떤 카드가 나왔나요?</text>
      <text x="540" y="380" text-anchor="middle" font-family="${KO}" font-size="42" fill="rgba(232,212,139,0.9)" letter-spacing="2" font-weight="300">고른 번호를 댓글로 남겨주세요</text>
    </g>
    <g opacity="0.75">
      <circle cx="408" cy="450" r="3" fill="#e8d48b"/>
      <line x1="424" y1="450" x2="656" y2="450" stroke="rgba(232,212,139,0.45)" stroke-width="1"/>
      <circle cx="672" cy="450" r="3" fill="#e8d48b"/>
    </g>
    ${frameOverlays}
    <g filter="url(#softGlow)">
      ${numCxs.map((cx, i) => `<text x="${cx}" y="${numberLabelY}" text-anchor="middle" font-family="${KO}" font-size="36" fill="rgba(232,212,139,0.9)" font-weight="500">${i + 1}번</text>`).join('')}
    </g>
    <line x1="340" y1="1220" x2="740" y2="1220" stroke="url(#goldDivider)" stroke-width="1.5"/>
    <g filter="url(#softGlow)">
      <text x="540" y="1340" text-anchor="middle" font-family="${KO}" font-size="40" fill="#F4F8FF" letter-spacing="2" font-weight="300">구독하면 매일 새 리딩이 찾아와요</text>
      <text x="540" y="1440" text-anchor="middle" font-family="${KO}" font-size="30" fill="rgba(232,212,139,0.85)" letter-spacing="2" font-weight="300">더 깊은 이야기는 lovtaro.kr에서</text>
    </g>
    <text x="540" y="1860" text-anchor="middle" font-family="${KO}" font-size="24" fill="rgba(232,212,139,0.5)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let out = await sharp(Buffer.from(svg)).png().toBuffer()
  return sharp(out).composite(thumbs).png({ quality: 90 }).toBuffer()
}

// ── 아웃트로 (단일형: 카드 1장 + 공감 댓글 유도)
async function sceneOutro1(day) {
  const thumbW = 340, thumbH = 510
  const thumbX = (W - thumbW) / 2, thumbY = 540
  const card = day.cards[0]

  const raw = await sharp(`${IMAGES}/${card.file}`)
    .resize(thumbW, thumbH, { fit: 'cover', kernel: 'lanczos3' })
    .toBuffer()
  const enhanced = await sharp(raw)
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 2.0 })
    .modulate({ saturation: 1.1, brightness: 1.02 })
    .toBuffer()
  const masked = await roundImg(enhanced, thumbW, thumbH, 8)

  const framePad = 14
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}</defs>
    ${body(day.seed + 90, false)}
    <ellipse cx="540" cy="${thumbY + thumbH / 2}" rx="420" ry="${thumbH * 0.72}" fill="url(#thumbGlow)" filter="url(#glowBlur)"/>
    <g filter="url(#softGlow)">
      <text x="540" y="290" text-anchor="middle" font-family="${KO}" font-size="54" fill="#F4F8FF" letter-spacing="2" font-weight="300">오늘 마음에 남은 문장을</text>
      <text x="540" y="380" text-anchor="middle" font-family="${KO}" font-size="42" fill="rgba(232,212,139,0.9)" letter-spacing="2" font-weight="300">댓글로 남겨보세요</text>
    </g>
    <g opacity="0.75">
      <circle cx="408" cy="450" r="3" fill="#e8d48b"/>
      <line x1="424" y1="450" x2="656" y2="450" stroke="rgba(232,212,139,0.45)" stroke-width="1"/>
      <circle cx="672" cy="450" r="3" fill="#e8d48b"/>
    </g>
    ${drawFrame(thumbX - framePad, thumbY - framePad, thumbW + framePad * 2, thumbH + framePad * 2, 1.1)}
    <g filter="url(#softGlow)">
      <text x="540" y="${thumbY + thumbH + 60}" text-anchor="middle" font-family="${KO}" font-size="34" fill="rgba(232,212,139,0.9)" font-weight="400">${card.nameKo} · ${card.nameEn}</text>
    </g>
    <line x1="340" y1="1250" x2="740" y2="1250" stroke="url(#goldDivider)" stroke-width="1.5"/>
    <g filter="url(#softGlow)">
      <text x="540" y="1370" text-anchor="middle" font-family="${KO}" font-size="40" fill="#F4F8FF" letter-spacing="2" font-weight="300">구독하면 매일 새 리딩이 찾아와요</text>
      <text x="540" y="1470" text-anchor="middle" font-family="${KO}" font-size="30" fill="rgba(232,212,139,0.85)" letter-spacing="2" font-weight="300">더 깊은 이야기는 lovtaro.kr에서</text>
    </g>
    <text x="540" y="1860" text-anchor="middle" font-family="${KO}" font-size="24" fill="rgba(232,212,139,0.5)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let out = await sharp(Buffer.from(svg)).png().toBuffer()
  return sharp(out).composite([{ input: masked, left: thumbX, top: thumbY }]).png({ quality: 90 }).toBuffer()
}

// ═══════════════════ 콘텐츠 정의 (여기만 교체) ═══════════════════
// type: 'pick'(참여형 3장, 월화목토일) | 'single'(소개형 1장, 수금)
// pick  = 훅4s + 전환2s + 카드3×(리빌3s + 페이지6s×2) + 아웃트로4s = 55초
// single= 훅4s + 리빌4s + 페이지6s×3 + 아웃트로4s = 30초
// 8/17주에 85/45초→55/30초로 줄인 뒤 Shorts 피드 배포가 회복됐다(3~18회 → 256~478회).
// 규격 고정. 본문 줄 수는 그대로 두고 체류만 줄인 것이므로 카피를 깎지 말 것.
// 본문은 insta/reply_templates.txt(참여형)·copy.txt(소개형)의 해석을 유튜브용으로 6줄씩 풀어쓴 것

const WEEK = [
  {
    date: '2026-08-24_mon', type: 'pick', seed: 824,
    hook: ['잠들기 전, 마지막으로', '생각나는 사람이 있다면'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/magician.png',
        nameKo: '마법사', nameEn: 'The Magician', keywords: '시작 · 능력 · 실행력',
        reveal: ['마음이 없는 게 아니라', '첫 문장을 못 고른 거예요'],
        pages: [
          ['그 사람의 속마음', [
            '연락할 재료는 이미 다 갖고 있어요.',
            '무슨 말을 할지도 대충 정해뒀어요.',
            '문제는 첫 문장을 어떻게 여느냐예요.',
            '너무 가벼우면 진심이 안 보일까 걱정돼요.',
            '너무 무거우면 부담될까 봐 또 지워요.',
            '그래서 조용한 것처럼 보이는 거예요.',
          ]],
          ['러브타로의 조언', [
            '작은 계기 하나면 그 손이 움직여요.',
            '거창한 사건이 필요한 게 아니에요.',
            '가벼운 안부 한 줄이면 충분해요.',
            '먼저 열어주면 준비된 말이 따라 나와요.',
            '기다림이 길어지면 마음이 식는 게 아니라 굳어요.',
            '먼저 갈지 기다릴지, 그건 골라도 돼요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/wands/Page of Wands.png',
        nameKo: '완드의 페이지', nameEn: 'Page of Wands', keywords: '열정 · 탐험 · 새로운 아이디어',
        reveal: ['아직 당신은', '새로운 사람으로 남아 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '당신 이야기가 나오면 아직 눈이 커져요.',
            '궁금한 게 남아 있다는 뜻이에요.',
            '호기심이 살아 있으면 마음도 안 식어요.',
            '다만 표현이 서툴러서 장난처럼 나와요.',
            '진지해지는 순간이 어색해서 피하는 거예요.',
            '가벼워 보이는 말 안에 진심이 섞여 있어요.',
          ]],
          ['러브타로의 조언', [
            '농담을 농담으로만 받지 말아주세요.',
            '한 번쯤 진지하게 되물어봐도 좋아요.',
            '그 순간 표정이 답을 대신할 거예요.',
            '서툰 신호를 알아봐 주는 게 시작이에요.',
            '완성된 고백만 고백은 아니에요.',
            '어설픈 쪽이 더 진짜일 때가 있어요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Four of Pentacles.png',
        nameKo: '펜타클의 4', nameEn: 'Four of Pentacles', keywords: '안전 · 집착 · 통제',
        reveal: ['놓기 싫어서', '더 조용해지는 사람이에요'],
        pages: [
          ['그 사람의 속마음', [
            '지금 마음을 꽉 쥐고 놓지 않으려 해요.',
            '잃고 싶지 않은 게 먼저인 사람이에요.',
            '그래서 티를 내면 잃을까 봐 숨겨요.',
            '무관심처럼 보여도 온도는 달라요.',
            '표현이 없는 것과 마음이 없는 건 달라요.',
            '지키는 방식이 서툰 것뿐이에요.',
          ]],
          ['러브타로의 조언', [
            '재촉하면 손을 더 꽉 쥐게 돼요.',
            '안심시켜 주는 쪽이 훨씬 빨라요.',
            '떠나지 않는다는 신호가 필요한 사람이에요.',
            '그게 확인되면 스스로 손을 펴요.',
            '기다림이 방치가 되지 않게만 하면 돼요.',
            '언제 펴질지는 조금 더 지켜봐도 좋아요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-25_tue', type: 'pick', seed: 825,
    hook: ['이번 주, 비워둔 옆자리에', '그 사람이 앉을까요?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'mcards/cups/Two of Cups.png',
        nameKo: '컵의 2', nameEn: 'Two of Cups', keywords: '상호 감정 · 연결 · 조화로운 만남',
        reveal: ['비어 있는 게 아니라', '서로 눈치를 보는 중이에요'],
        pages: [
          ['그 사람의 속마음', [
            '두 사람 마음이 같은 곳을 보고 있어요.',
            '그래서 오히려 먼저 못 움직여요.',
            '내가 착각한 거면 어쩌나 싶은 거예요.',
            '확인하고 싶은데 물어볼 용기가 없어요.',
            '자리를 비워둔 건 양쪽 다 마찬가지예요.',
            '거리는 마음이 아니라 타이밍 문제예요.',
          ]],
          ['러브타로의 조언', [
            '한 번만 먼저 움직이면 확 줄어요.',
            '대단한 고백이 필요한 게 아니에요.',
            '옆에 앉아도 되냐고 묻는 정도면 돼요.',
            '거절당할 확률보다 놓칠 확률이 커요.',
            '서로 기다리다 끝나는 관계가 제일 아까워요.',
            '누가 먼저 낼지, 이번 주가 알려줄 거예요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'cards-png/emperor.png',
        nameKo: '황제', nameEn: 'The Emperor', keywords: '안정 · 책임 · 기반',
        reveal: ['확실해진 다음에', '움직이는 사람이에요'],
        pages: [
          ['그 사람의 속마음', [
            '준비가 안 된 채로 다가가지 않아요.',
            '지금은 자기 자리부터 만드는 시간이에요.',
            '일이든 상황이든 정리가 먼저인 사람이에요.',
            '마음이 없어서 미루는 게 아니에요.',
            '어설프게 시작해서 실망시키기 싫은 거예요.',
            '그래서 속도가 느리고 말도 적어요.',
          ]],
          ['러브타로의 조언', [
            '느린 게 미지근한 것과는 달라요.',
            '이런 사람은 방향이 잘 안 흔들려요.',
            '조급함이 오히려 뒤로 물러나게 만들어요.',
            '기다리되 관심은 계속 보여주세요.',
            '준비가 끝나면 확실하게 움직여요.',
            '그 신호가 이번 주 안에 보일 수도 있어요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/cups/Ace of Cups.png',
        nameKo: '컵의 에이스', nameEn: 'Ace of Cups', keywords: '새로운 사랑 · 감정의 시작 · 풍요로운 마음',
        reveal: ['기다리던 사람이 아닐 수도', '있는 자리예요'],
        pages: [
          ['그 사람의 속마음', [
            '새로운 감정이 막 시작되는 흐름이에요.',
            '지금 마음이 열려 있는 상태예요.',
            '다만 그 방향이 예상과 다를 수 있어요.',
            '비워둔 자리에 다른 사람이 앉을 수도 있어요.',
            '기다리던 쪽은 아직 움직이지 않고 있어요.',
            '대신 가까이 있던 사람이 다가와요.',
          ]],
          ['러브타로의 조언', [
            '한 사람만 보고 있으면 신호를 놓쳐요.',
            '주변을 조금 넓게 봐도 괜찮아요.',
            '새 감정은 예고 없이 시작돼요.',
            '기다림을 멈추라는 뜻은 아니에요.',
            '다른 문도 열려 있다는 뜻이에요.',
            '어떤 얼굴이 먼저 나타날지 지켜봐도 좋아요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-26_wed', type: 'single', seed: 826,
    hook: ['남들 눈엔 좋아 보이는데', '왜 나만 확인받고 싶을까?'],
    cards: [
      {
        no: 1, numGlyph: '', file: 'mcards/cups/Ten of Cups.png',
        nameKo: '컵의 10', nameEn: 'Ten of Cups', keywords: '완전한 행복 · 관계의 완성 · 진정한 사랑',
        reveal: ['부족해서가 아니라', '완성될수록 커지는 마음이에요'],
        pages: [
          ['지금 내 마음', [
            '싸운 적도 없고 서운한 일도 없어요.',
            '남들이 보기엔 부러워할 만한 사이예요.',
            '그런데 자꾸 한 번 더 묻고 싶어져요.',
            '나 좋아하는 거 맞냐고 확인하고 싶어요.',
            '말하면 이상한 사람이 될까 봐 삼켜요.',
            '이 불안이 어디서 오는지 나도 모르겠어요.',
          ]],
          ['카드의 메시지', [
            'Ten of Cups는 이미 완성된 그림이에요.',
            '무지개도 집도 다 갖춰진 자리예요.',
            '그런데 완성될수록 잃을 게 많아져요.',
            '불안은 부족해서가 아니라 소중해서 생겨요.',
            '내 자리가 확실한지 자꾸 확인하고 싶어져요.',
            '그건 사랑이 부족하다는 증거가 아니에요.',
          ]],
          ['러브타로의 조언', [
            '확인받고 싶은 마음을 부끄러워하지 마세요.',
            '잃고 싶지 않아서 생기는 감정이에요.',
            '다만 상대를 시험하는 방식은 피해주세요.',
            '떠보는 대신 그냥 물어봐도 괜찮아요.',
            '불안하다고 말하는 것도 친밀함이에요.',
            '그 말을 꺼낸 뒤가 오히려 편해질 수 있어요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-27_thu', type: 'pick', seed: 827,
    hook: ['계속될까,', '여기까지일까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/chariot.png',
        nameKo: '전차', nameEn: 'The Chariot', keywords: '의지 · 추진력 · 전진',
        reveal: ['갈 힘은 있는데', '한 사람만 쓰고 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '이 관계를 이어갈 힘은 아직 남아 있어요.',
            '방향도 크게 어긋나지 않았어요.',
            '문제는 그 힘을 한 쪽만 쓰고 있다는 거예요.',
            '끌고 가는 사람은 점점 지쳐가요.',
            '따라오는 사람은 문제를 잘 못 느껴요.',
            '그 차이가 쌓이면 거리로 바뀌어요.',
          ]],
          ['러브타로의 조언', [
            '더 세게 끌기보다 속도를 나눠보세요.',
            '고삐를 같이 잡자고 말해도 돼요.',
            '혼자 애쓰는 걸 알아달라 하는 게 아니에요.',
            '어느 쪽으로 갈지 같이 정하자는 뜻이에요.',
            '그 대화가 관계를 끝내지 않아요.',
            '언제 꺼낼지는 조금 더 골라도 늦지 않아요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/swords/Nine of Swords.png',
        nameKo: '소드의 9', nameEn: 'Nine of Swords', keywords: '불안 · 걱정 · 과도한 생각',
        reveal: ['무너지는 건 관계가 아니라', '생각이에요'],
        pages: [
          ['지금 내 마음', [
            '실제로 벌어진 일은 크지 않아요.',
            '그런데 밤이 되면 장면이 커져요.',
            '아직 안 일어난 이별까지 미리 겪어요.',
            '답장이 늦으면 최악부터 떠올라요.',
            '아침엔 괜찮다가 새벽에 다시 무너져요.',
            '지친 건 관계가 아니라 나 자신이에요.',
          ]],
          ['러브타로의 조언', [
            '확인하지 않은 걱정은 결론이 못 돼요.',
            '사실과 상상을 종이에 나눠 적어보세요.',
            '생각보다 사실 칸이 짧을 거예요.',
            '남은 건 물어보면 끝나는 것들이에요.',
            '혼자 결론 내리는 게 제일 아파요.',
            '무엇이 진짜인지부터 확인해도 좋아요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/wands/Four of Wands.png',
        nameKo: '완드의 4', nameEn: 'Four of Wands', keywords: '축하 · 기쁨 · 안정된 행복',
        reveal: ['끝나는 게 아니라', '자리를 잡는 흐름이에요'],
        pages: [
          ['그 사람의 속마음', [
            '여기서 끝나는 흐름이 아니에요.',
            '불안했던 구간을 지나가는 중이에요.',
            '형태가 생기면서 조용해진 거예요.',
            '설렘이 줄어든 걸 식었다고 오해하기 쉬워요.',
            '안정은 변화처럼 느껴지지 않아요.',
            '그래서 아무 일 없는 것처럼 보여요.',
          ]],
          ['러브타로의 조언', [
            '조용해진 게 나빠진 건 아니에요.',
            '편안함도 관계가 자란 결과예요.',
            '다만 방치와 안정은 다르니 구분해주세요.',
            '기념할 일을 하나 만들어봐도 좋아요.',
            '자리 잡은 관계에도 표시가 필요해요.',
            '어떤 모양이 될지 조금 더 지켜봐도 좋아요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-28_fri', type: 'single', seed: 828,
    hook: ['만난 지 얼마 안 됐는데', '벌써 그 확신이 부담스러울 때'],
    cards: [
      {
        no: 1, numGlyph: '', file: 'mcards/swords/Knight of Swords.png',
        nameKo: '소드의 나이트', nameEn: 'Knight of Swords', keywords: '돌진 · 급진적 행동 · 갈등',
        reveal: ['빠른 확신이', '곧 깊이는 아니에요'],
        pages: [
          ['지금 내 마음', [
            '좋다고 말해주는데 마음이 편치 않아요.',
            '싫은 것도 아닌데 자꾸 뒤로 물러서게 돼요.',
            '아직 서로 잘 모르는 사이인데 확신이 빨라요.',
            '그 확신이 나를 보고 하는 말인지 모르겠어요.',
            '맞춰주지 못하는 게 미안해지기까지 해요.',
            '이 불편함을 뭐라고 불러야 할지 몰라요.',
          ]],
          ['카드의 메시지', [
            'Knight of Swords는 방향을 정하면 달려요.',
            '뒤도 안 보고 앞으로만 가는 카드예요.',
            '그 속도에는 진심도 분명히 있어요.',
            '다만 속도와 깊이는 같은 말이 아니에요.',
            '빨리 뜨거워진 건 빨리 식기도 해요.',
            '카드는 나쁜 사람이라고 말하지 않아요.',
          ]],
          ['러브타로의 조언', [
            '못 맞춰주는 게 미안한 일이 아니에요.',
            '속도는 두 사람이 같이 정하는 거예요.',
            '천천히 가고 싶다고 말해도 괜찮아요.',
            '그 말에 물러서는 사람이라면 답이 나와요.',
            '기다려주는 사람이라면 진짜일 가능성이 커요.',
            '어느 쪽인지는 말해봐야 알 수 있어요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-29_sat', type: 'pick', seed: 829,
    hook: ['이번 주말, 얼굴 한번', '보고 싶은 사람이 있다면'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'mcards/cups/Six of Cups.png',
        nameKo: '컵의 6', nameEn: 'Six of Cups', keywords: '추억 · 재회 · 순수한 마음',
        reveal: ['그 사람도 지난 장면을', '자주 꺼내보고 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '같이 웃었던 자리가 아직 남아 있어요.',
            '문득 그때 사진을 다시 보기도 해요.',
            '지금보다 그때가 편했다고 느껴요.',
            '연락하고 싶은 순간이 자주 찾아와요.',
            '다만 지금 와서 뭐라고 할지 몰라요.',
            '그래서 계속 미루고만 있어요.',
          ]],
          ['러브타로의 조언', [
            '추억으로 시작하는 대화는 부담이 적어요.',
            '거창한 이유 없이 안부만 물어도 돼요.',
            '만나자는 말도 자연스럽게 이어질 수 있어요.',
            '다만 그때로 돌아가려는 건 아니어야 해요.',
            '지금의 두 사람으로 만나는 게 중요해요.',
            '누가 먼저 꺼낼지는 이번 주말이 알려줄지도 몰라요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'cards-png/world.png',
        nameKo: '세계', nameEn: 'The World', keywords: '완성 · 성취 · 새로운 장',
        reveal: ['한 장이 닫히고', '다음 장이 열리는 자리예요'],
        pages: [
          ['그 사람의 속마음', [
            '한 흐름이 마무리된 상태예요.',
            '예전의 감정은 정리가 끝나가요.',
            '미워하지도 그리워하지도 않는 자리예요.',
            '지금 만나면 담담하게 대할 거예요.',
            '그게 무관심은 아니에요.',
            '다음 장을 열 준비가 된 것에 가까워요.',
          ]],
          ['러브타로의 조언', [
            '덤덤한 반응에 실망하지 마세요.',
            '정리된 마음이 오히려 시작에 유리해요.',
            '옛날 감정으로 다시 만나긴 어려워요.',
            '지금의 서로를 새로 보는 자리가 될 거예요.',
            '끝인지 시작인지는 만나봐야 알아요.',
            '그 자리에서 결정해도 늦지 않아요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/wands/Five of Wands.png',
        nameKo: '완드의 5', nameEn: 'Five of Wands', keywords: '경쟁 · 갈등 · 혼란',
        reveal: ['마음은 있는데', '타이밍이 자꾸 어긋나요'],
        pages: [
          ['그 사람의 속마음', [
            '보고 싶은 마음 자체는 있어요.',
            '그런데 상황이 계속 안 맞아떨어져요.',
            '한 쪽이 되면 다른 쪽이 안 돼요.',
            '거절처럼 느껴지지만 거절이 아니에요.',
            '요즘 자기 일로도 정신이 없어요.',
            '여유가 없어서 표현이 퉁명스러워져요.',
          ]],
          ['러브타로의 조언', [
            '억지로 맞추면 만나서도 신경전이 돼요.',
            '지금은 한 발 물러서는 게 나아요.',
            '조급함이 오해를 더 키우는 시기예요.',
            '시간이 지나면 상황이 풀려요.',
            '그때 다시 물어보면 답이 달라질 수 있어요.',
            '이번에 안 된 게 끝은 아니에요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-30_sun', type: 'pick', seed: 830,
    hook: ['다음 주, 못 꺼내던 그 말이', '그 사람 입에서 나올까요?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/tower.png',
        nameKo: '탑', nameEn: 'The Tower', keywords: '급변 · 균열 · 진실의 드러남',
        reveal: ['주 초반, 미뤄둔 이야기가', '먼저 터져나올 수 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '오래 눌러둔 말이 한계에 와 있어요.',
            '계획해서 꺼내는 게 아니라 터져나와요.',
            '그래서 형태가 거칠 수 있어요.',
            '준비된 문장이 아니라 날것에 가까워요.',
            '듣는 쪽은 놀랄 수 있는 방식이에요.',
            '하지만 내용은 오래된 진심이에요.',
          ]],
          ['러브타로의 조언', [
            '말투에 먼저 반응하지 말아주세요.',
            '거칠게 나온 말일수록 오래 참은 거예요.',
            '그 자리에서 결론 내지 않아도 돼요.',
            '한 박자 두고 다시 이야기하면 달라져요.',
            '무너진 게 관계가 아니라 벽일 수 있어요.',
            '무엇이 남을지는 지나봐야 알 것 같아요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/wands/Eight of Wands.png',
        nameKo: '완드의 8', nameEn: 'Eight of Wands', keywords: '빠른 전개 · 메시지 · 신속한 움직임',
        reveal: ['주 중반, 연락이 한꺼번에', '몰려올 수 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '조용하던 흐름에 갑자기 속도가 붙어요.',
            '미뤄뒀던 말을 한 번에 쏟아낼 수 있어요.',
            '연락이 몰려서 정신없게 느껴질 거예요.',
            '망설이던 시간이 끝났다는 신호예요.',
            '한 번 열리면 빠르게 진행돼요.',
            '주 중반이 그 분기점이 될 수 있어요.',
          ]],
          ['러브타로의 조언', [
            '빠르게 오는 말에 똑같이 빨리 답하지 않아도 돼요.',
            '한 박자 늦게 답하는 게 오히려 좋아요.',
            '속도에 휩쓸리면 내 마음을 못 봐요.',
            '내용을 한 번 정리하고 답해주세요.',
            '급한 건 상대 사정이지 내 사정이 아니에요.',
            '어떤 소식이 먼저 올지 기대해봐도 좋아요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Eight of Pentacles.png',
        nameKo: '펜타클의 8', nameEn: 'Eight of Pentacles', keywords: '노력 · 성실함 · 꾸준한 발전',
        reveal: ['주 후반, 쌓아둔 마음이', '조용히 전해질 수 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '말보다 행동이 먼저 나오는 사람이에요.',
            '큰 고백 대신 계속 챙기는 방식을 골라요.',
            '작은 걸 기억하고 조용히 해줘요.',
            '표현이 아니라 반복으로 보여줘요.',
            '그래서 알아채기 어려울 수 있어요.',
            '주 후반에 그 방식이 더 뚜렷해져요.',
          ]],
          ['러브타로의 조언', [
            '말이 없다고 마음이 없는 건 아니에요.',
            '반복되는 행동을 한번 세어보세요.',
            '거기에 답이 이미 나와 있을 거예요.',
            '알아봐 주면 그다음엔 말도 나와요.',
            '성실한 마음은 늦게 도착할 뿐이에요.',
            '언제 말이 될지는 조금 더 지켜봐도 좋아요.',
          ]],
        ],
      },
    ],
  },
]

// ═══════════════════ 생성 실행 ═══════════════════

for (const day of WEEK) {
  const outDir = `${CONTENT}/${day.date}/youtube/frames`
  mkdirSync(outDir, { recursive: true })
  const scenes = []  // [filename, duration]
  let seq = 0
  const save = async (buf, name, dur) => {
    const fn = `s${String(++seq).padStart(2, '0')}-${name}.png`
    writeFileSync(`${outDir}/${fn}`, buf)
    scenes.push(`${fn}:${dur}`)
  }

  if (day.type === 'pick') {
    await save(await sceneHook3(day), 'hook', 4)
    await save(await sceneTransition(day), 'transition', 2)
    for (const card of day.cards) {
      await save(await sceneReveal(day, card), `c${card.no}-reveal`, 3)
      for (let p = 0; p < card.pages.length; p++) {
        await save(await sceneTextPage(day, card, p, card.pages.length, card.pages[p][0], card.pages[p][1]), `c${card.no}-p${p + 1}`, 6)
      }
    }
    await save(await sceneOutro3(day), 'outro', 4)
  } else {
    await save(await sceneHook1(day), 'hook', 4)
    const card = day.cards[0]
    await save(await sceneReveal(day, card), 'reveal', 4)
    for (let p = 0; p < card.pages.length; p++) {
      await save(await sceneTextPage(day, card, p, card.pages.length, card.pages[p][0], card.pages[p][1]), `p${p + 1}`, 6)
    }
    await save(await sceneOutro1(day), 'outro', 4)
  }

  writeFileSync(`${CONTENT}/${day.date}/youtube/scenes.txt`, scenes.join('\n') + '\n')
  const total = scenes.reduce((s, l) => s + Number(l.split(':')[1]), 0)
  console.log(`✅ ${day.date}: 장면 ${scenes.length}개, 총 ${total}초`)
}
console.log('완료!')
