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
    date: '2026-08-31_mon', type: 'pick', seed: 831,
    hook: ['그 사람에게 내 하루를', '말하고 싶어질 때'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/empress.png',
        nameKo: '여황제', nameEn: 'The Empress', keywords: '풍요 · 사랑 · 돌봄',
        reveal: ['크게 말하진 않아도', '늘 같은 자리에 있는 사람'],
        pages: [
          ['그 사람의 속마음', [
            '당신이 편했으면 하는 마음이 가장 커요.',
            '표현이 화려한 편은 아니에요.',
            '대신 챙기는 방식이 조용히 일정해요.',
            '특별한 날보다 아무 날에 더 잘 드러나요.',
            '그래서 눈에 잘 안 띄는 다정함이에요.',
            '지금도 그 온도는 그대로 유지되고 있어요.',
          ]],
          ['러브타로의 조언', [
            '무던한 사람은 무심한 사람과 달라요.',
            '반응이 크지 않다고 마음이 작진 않아요.',
            '오늘 있었던 일을 그냥 던져보세요.',
            '이 사람은 그런 이야기를 받아주는 쪽이에요.',
            '거창한 계기를 만들 필요는 없어요.',
            '평범한 이야기가 이 관계에선 제일 잘 통해요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/cups/Page of Cups.png',
        nameKo: '컵의 페이지', nameEn: 'Page of Cups', keywords: '새로운 감정 · 메시지 · 감수성',
        reveal: ['첫 감정을', '아직 정리하지 못했어요'],
        pages: [
          ['그 사람의 속마음', [
            '감정이 생긴 건 본인도 알고 있어요.',
            '다만 이걸 뭐라고 불러야 할지 모르겠어요.',
            '말로 옮기기 전에 혼자 여러 번 굴려봐요.',
            '그래서 반응이 늦거나 엉뚱하게 나와요.',
            '아무 말도 못 하는 날이 더 많아요.',
            '지금은 정리 중이지 멀어지는 중이 아니에요.',
          ]],
          ['러브타로의 조언', [
            '정리될 때까지 기다려주는 게 나아요.',
            '재촉하면 오히려 뒤로 물러설 수 있어요.',
            '대신 부담 없는 자리를 자주 만들어주세요.',
            '말이 안 나와도 같이 있는 시간이 쌓여요.',
            '어느 날 갑자기 서툰 문장이 도착할 거예요.',
            '그때 놀라지 말고 받아주기만 하면 돼요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Three of Pentacles.png',
        nameKo: '펜타클의 3', nameEn: 'Three of Pentacles', keywords: '협력 · 함께 만들어가는 것 · 성장',
        reveal: ['혼자 정하지 않고', '같이 만들려는 사람이에요'],
        pages: [
          ['그 사람의 속마음', [
            '이 관계를 같이 만드는 것으로 보고 있어요.',
            '혼자 결정해서 끌고 가는 걸 싫어해요.',
            '그래서 당신 반응을 먼저 확인하려고 해요.',
            '확인이 끝나야 다음 칸으로 넘어가요.',
            '느려 보이지만 방향은 흐트러지지 않았어요.',
            '되돌아가는 일은 잘 만들지 않는 사람이에요.',
          ]],
          ['러브타로의 조언', [
            '이 사람에겐 반응을 주는 게 신호예요.',
            '가만히 있으면 진도가 멈춰요.',
            '좋으면 좋다고 짧게라도 말해주세요.',
            '한쪽이 한 칸 놓으면 바로 다음 칸이 와요.',
            '누가 먼저 놓느냐는 순서일 뿐이에요.',
            '오늘 그 한 칸을 놓아봐도 괜찮아요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-09-01_tue', type: 'pick', seed: 901,
    hook: ['답장이 며칠째 그대로일 때', '그 사람 속마음은?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/high-priestess.png',
        nameKo: '여사제', nameEn: 'The High Priestess', keywords: '직관 · 비밀 · 내면의 지혜',
        reveal: ['말을 아끼는 게', '지금은 답이라고 믿고 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '지금 아무 말도 안 하는 쪽을 택했어요.',
            '마음이 없어서가 아니에요.',
            '아직 꺼낼 때가 아니라고 보고 있어요.',
            '섣부른 말이 관계를 망칠까 봐 조심해요.',
            '겉은 조용하지만 안에서는 정리 중이에요.',
            '이번 주 내내 침묵이 이어질 수 있어요.',
          ]],
          ['러브타로의 조언', [
            '침묵을 거절로 읽지 않아도 돼요.',
            '여러 번 물으면 더 닫힐 수 있어요.',
            '지금은 답을 요구하지 않는 게 나아요.',
            '가벼운 안부 정도만 남겨두세요.',
            '정리가 끝나면 먼저 문을 열 사람이에요.',
            '그 시점은 생각보다 갑자기 올 수 있어요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/swords/King of Swords.png',
        nameKo: '소드의 킹', nameEn: 'King of Swords', keywords: '이성 · 공정함 · 결단력',
        reveal: ['늦게 오지만', '애매하게 오지는 않아요'],
        pages: [
          ['그 사람의 속마음', [
            '감정보다 말의 순서를 먼저 정리해요.',
            '떠오르는 대로 보내는 사람이 아니에요.',
            '그래서 답장 간격이 길어질 때가 있어요.',
            '읽고도 바로 안 보내는 건 성격이에요.',
            '대신 보낼 땐 애매하게 보내지 않아요.',
            '이번 주 안에 정리된 문장이 올 수 있어요.',
          ]],
          ['러브타로의 조언', [
            '속도로 마음을 재지 않는 게 좋아요.',
            '이 사람에겐 늦음이 무관심이 아니에요.',
            '재촉보다 명확한 질문이 잘 통해요.',
            '돌려 말하면 오히려 답이 늦어져요.',
            '궁금한 걸 그대로 물어봐도 괜찮아요.',
            '그러면 그 답도 그대로 돌아올 거예요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/wands/Six of Wands.png',
        nameKo: '완드의 6', nameEn: 'Six of Wands', keywords: '승리 · 인정 · 자신감',
        reveal: ['좋은 소식이 생기면', '제일 먼저 떠오르는 사람'],
        pages: [
          ['그 사람의 속마음', [
            '요즘 그 사람 쪽 흐름이 나쁘지 않아요.',
            '잘 풀린 일이 하나 생기는 구간이에요.',
            '그럴 때 제일 먼저 알리고 싶은 얼굴이 있어요.',
            '지금 그 자리에 당신이 떠올라 있어요.',
            '그래서 대화가 뜬금없이 다시 열릴 수 있어요.',
            '용건은 소식이지만 이유는 당신이에요.',
          ]],
          ['러브타로의 조언', [
            '갑자기 온 연락을 가볍게 넘기지 마세요.',
            '자랑처럼 보여도 사실은 공유예요.',
            '축하한다는 말 한마디면 충분해요.',
            '그 반응이 다음 대화를 열어줘요.',
            '이 사람은 알아봐 주는 사람에게 약해요.',
            '이번 주 그 순간이 올지 지켜봐도 좋아요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-09-03_thu', type: 'pick', seed: 903,
    hook: ['잘 보이고 싶어지는 사람', '그 사람도 같은 마음일까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/devil.png',
        nameKo: '악마', nameEn: 'The Devil', keywords: '집착 · 유혹 · 속박',
        reveal: ['끌림은 있는데', '인정하고 싶지 않은 상태예요'],
        pages: [
          ['그 사람의 속마음', [
            '끌리는 마음은 분명히 있어요.',
            '다만 인정하면 복잡해질 걸 알고 있어요.',
            '그래서 스스로 눌러두는 중이에요.',
            '가까워졌다가 갑자기 거리를 만들어요.',
            '그 반복이 당신 눈에는 변덕처럼 보여요.',
            '실제로는 본인이 제일 혼란스러운 상태예요.',
          ]],
          ['러브타로의 조언', [
            '이 흐름은 밀어붙인다고 풀리지 않아요.',
            '오히려 더 도망갈 수 있어요.',
            '당신이 그 혼란까지 책임질 필요는 없어요.',
            '거리를 만들 땐 그냥 두는 게 나아요.',
            '돌아오는 쪽은 결국 그 사람이에요.',
            '그때 어떤 태도를 취할지는 골라도 돼요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/wands/King of Wands.png',
        nameKo: '완드의 킹', nameEn: 'King of Wands', keywords: '리더십 · 비전 · 추진력',
        reveal: ['확신이 서면', '속도가 갑자기 붙는 사람'],
        pages: [
          ['그 사람의 속마음', [
            '마음이 정해지면 먼저 움직이는 쪽이에요.',
            '지금 조용한 건 관심이 없어서가 아니에요.',
            '확신을 세우는 단계에 있어서예요.',
            '어중간한 상태로 다가가는 걸 싫어해요.',
            '그래서 준비가 끝날 때까지 티를 안 내요.',
            '확신이 서면 속도가 갑자기 빨라져요.',
          ]],
          ['러브타로의 조언', [
            '지금 조급해할 구간은 아니에요.',
            '먼저 재촉하면 판단만 늦어져요.',
            '대신 확신을 줄 신호는 보여줘도 좋아요.',
            '이 사람은 애매한 태도에 발을 안 떼요.',
            '한쪽이 분명하면 그다음은 빨라요.',
            '그 전환이 언제 올지 지켜봐도 좋아요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/cups/Seven of Cups.png',
        nameKo: '컵의 7', nameEn: 'Seven of Cups', keywords: '환상 · 선택 · 혼란',
        reveal: ['선택지가 여러 개라', '아직 하나로 좁혀지지 않았어요'],
        pages: [
          ['그 사람의 속마음', [
            '머릿속에 지금 선택지가 여러 개 떠 있어요.',
            '당신이 그중 하나인 건 맞아요.',
            '다만 아직 하나로 좁혀지지 않았어요.',
            '그래서 신호가 날마다 다르게 느껴져요.',
            '어제는 확실했는데 오늘은 흐릿해요.',
            '거짓말은 아니고 정리가 안 된 거예요.',
          ]],
          ['러브타로의 조언', [
            '흔들리는 신호를 해석하려 애쓰지 마세요.',
            '지금은 해석할 만큼 정리된 상태가 아니에요.',
            '기준은 그 사람이 아니라 내 쪽에 두세요.',
            '내가 어디까지 기다릴 수 있는지가 먼저예요.',
            '안개는 언젠가 걷히긴 해요.',
            '그때까지 나를 소모하지 않는 게 중요해요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-09-05_sat', type: 'pick', seed: 905,
    hook: ['이번 주말, 그 사람에게서', '연락이 올까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/temperance.png',
        nameKo: '절제', nameEn: 'Temperance', keywords: '조화 · 균형 · 인내',
        reveal: ['서두르기보다', '속도를 맞추는 주말이에요'],
        pages: [
          ['그 사람의 속마음', [
            '이번 주말은 크게 움직이는 흐름이 아니에요.',
            '급하게 잡는 약속은 잘 안 맞아요.',
            '대신 자연스럽게 이어진 연락이 잘 통해요.',
            '그 사람도 무리하고 싶어하지 않아요.',
            '천천히 가는 걸 나쁘게 보진 않아요.',
            '어긋나는 게 아니라 맞춰가는 중이에요.',
          ]],
          ['러브타로의 조언', [
            '이번 주말은 계획을 꽉 채우지 마세요.',
            '여백이 있어야 이 흐름이 살아나요.',
            '가벼운 연락 한 번이면 충분해요.',
            '답이 늦어도 조바심 낼 필요 없어요.',
            '속도가 안 맞는 게 아니라 조율 중이에요.',
            '어느 지점에서 맞춰질지 지켜봐도 좋아요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/wands/Ace of Wands.png',
        nameKo: '완드의 에이스', nameEn: 'Ace of Wands', keywords: '열정 · 영감 · 불꽃 같은 시작',
        reveal: ['계획에 없던 제안이', '주말을 바꿀 수 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '갑자기 생기는 제안 하나가 보여요.',
            '오래 고민하고 보내는 연락이 아니에요.',
            '그 순간 떠올라서 던지는 쪽에 가까워요.',
            '그래서 부담 없이 이어지기 쉬워요.',
            '그 사람 쪽에서 먼저 불씨를 던질 수 있어요.',
            '시간대는 정해져 있지 않아요.',
          ]],
          ['러브타로의 조언', [
            '갑작스러운 연락을 튕기지 마세요.',
            '준비 없이 온 만큼 진심에 가까워요.',
            '거절해도 다시 오는 종류는 아니에요.',
            '한 번 꺼진 불씨는 다시 붙기 어려워요.',
            '주말 일정을 조금 열어두면 좋아요.',
            '그게 몇 시쯤 올지는 기다려봐도 돼요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Nine of Pentacles.png',
        nameKo: '펜타클의 9', nameEn: 'Nine of Pentacles', keywords: '독립 · 풍요 · 자기 완성',
        reveal: ['혼자여도', '이상하게 괜찮은 주말이에요'],
        pages: [
          ['그 사람의 속마음', [
            '이번 주말은 혼자 있어도 괜찮은 흐름이에요.',
            '채워지지 않아서 비어 있는 게 아니에요.',
            '아직 아무도 안 부른 것뿐이에요.',
            '그 여유가 밖에서도 보이는 시기예요.',
            '오히려 그때 시선이 모이곤 해요.',
            '급하지 않은 사람이 더 궁금해 보여요.',
          ]],
          ['러브타로의 조언', [
            '주말을 억지로 채우지 않아도 돼요.',
            '혼자 잘 지내는 모습이 신호가 돼요.',
            '연락을 기다리며 대기하지는 마세요.',
            '내 시간을 쓰는 쪽이 훨씬 나아요.',
            '누가 먼저 그 시간을 두드릴지 몰라요.',
            '그때 열어줄지는 그날 정해도 늦지 않아요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-09-06_sun', type: 'pick', seed: 906,
    hook: ['다음 주 연애 흐름', '미리 확인해보세요'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/hermit.png',
        nameKo: '은둔자', nameEn: 'The Hermit', keywords: '내면 · 거리 · 성찰',
        reveal: ['주 초반은', '서로 조용해지는 구간이에요'],
        pages: [
          ['다음 주 흐름', [
            '주 초반은 말수가 줄어드는 구간이에요.',
            '연락 간격이 평소보다 벌어질 수 있어요.',
            '멀어지는 게 아니라 각자 정리하는 시간이에요.',
            '그 사람도 생각이 많아지는 시기예요.',
            '이때 억지로 채우면 어색해져요.',
            '조용함 자체는 나쁜 신호가 아니에요.',
          ]],
          ['러브타로의 조언', [
            '주 초반엔 먼저 다가가지 않아도 돼요.',
            '연락이 줄어도 의미를 붙이지 마세요.',
            '이 구간은 원래 그렇게 지나가요.',
            '대신 나도 내 정리를 해두면 좋아요.',
            '중반부터는 흐름이 달라져요.',
            '그 조용함이 무엇을 정리했는지 곧 보일 거예요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/wands/Knight of Wands.png',
        nameKo: '완드의 나이트', nameEn: 'Knight of Wands', keywords: '모험 · 자유 · 열정적 행동',
        reveal: ['주 중반에', '속도가 갑자기 붙어요'],
        pages: [
          ['다음 주 흐름', [
            '주 중반에 속도가 붙는 흐름이에요.',
            '미뤄지던 이야기가 한 번에 몰려와요.',
            '연락도 만남도 급하게 잡힐 수 있어요.',
            '계획적이라기보다 즉흥에 가까워요.',
            '그래서 방향은 그때 정해질 거예요.',
            '진도가 하루 만에 바뀔 수도 있어요.',
          ]],
          ['러브타로의 조언', [
            '빠른 흐름에 다 맞출 필요는 없어요.',
            '속도가 곧 진심은 아니에요.',
            '다만 이 시기를 놓치면 다시 조용해져요.',
            '한 번은 같이 움직여봐도 좋아요.',
            '어디까지 따라갈지는 그날 정해도 돼요.',
            '무리했다면 후반에 조절하면 돼요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Ace of Pentacles.png',
        nameKo: '펜타클의 에이스', nameEn: 'Ace of Pentacles', keywords: '새로운 시작 · 현실적 기반 · 기회',
        reveal: ['주 후반에', '작지만 확실한 시작이 놓여요'],
        pages: [
          ['다음 주 흐름', [
            '주 후반에 작은 시작 하나가 놓여요.',
            '말로만 오가던 게 형태를 갖춰요.',
            '약속이 잡히거나 일정이 정해질 수 있어요.',
            '화려하진 않지만 확실한 종류예요.',
            '한 번 놓이면 잘 무너지지 않아요.',
            '다음 주까지 이어질 흐름이에요.',
          ]],
          ['러브타로의 조언', [
            '작다고 흘려보내지 마세요.',
            '이 카드는 크기보다 지속을 말해요.',
            '확정된 것부터 챙겨두면 좋아요.',
            '기대를 부풀리지 않는 편이 나아요.',
            '천천히 쌓이는 쪽이 이 흐름에 맞아요.',
            '그 첫 한 칸이 어디로 이어질지 지켜보세요.',
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
