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
const KO = `'Noto Sans KR','Apple SD Gothic Neo',sans-serif`

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
  mon: { arrange: 'row', textY: 420, moon: 'right', guideY: 1640 },
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
// 85초에서 줄인 것. 60초를 넘기면 쇼츠 피드에서 불리하고, 정지 화면이 60초씩
// 이어지면 끝까지 보는 비율이 떨어진다. 본문 줄 수는 그대로 두고 체류만 줄였다.
// 본문은 insta/reply_templates.txt(참여형)·copy.txt(소개형)의 해석을 유튜브용으로 6줄씩 풀어쓴 것

const WEEK = [
  {
    "date": "2026-10-05_mon",
    "type": "single",
    "seed": 1005,
    "hook": [
      "밖에선 아쉬울 게 없는데",
      "왜 이 사람 앞에서만 작아질까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/wands/Six of Wands.png",
        "nameKo": "완드의 6",
        "nameEn": "Six of Wands",
        "keywords": "인정 · 자신감 · 환호",
        "reveal": [
          "밖에서 받은 환호가",
          "안에서는 잘 안 들려요"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "어디서든 제 몫을 하는 사람이에요.",
              "일도 관계도 크게 아쉬운 게 없어요.",
              "그런데 이 사람 앞에서만 자꾸 작아져요.",
              "괜히 말 한마디를 몇 번씩 고치게 돼요.",
              "내가 이렇게까지 흔들릴 일인가 싶어요.",
              "그 간격이 스스로도 이해가 안 돼요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "이 카드는 환호 속으로 들어오는 사람이에요.",
              "밖에서 받는 인정은 이미 충분하다는 뜻이에요.",
              "그런데 환호는 멀리서 들리는 소리예요.",
              "정작 듣고 싶은 한 사람 목소리는 빠져 있어요.",
              "작아진 게 아니라 더 바라는 거예요.",
              "크기가 아니라 방향의 문제예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "흔들리는 걸 결함으로 보지 마세요.",
              "그만큼 중요하다는 신호에 가까워요.",
              "다만 인정을 받아내려 애쓰진 마세요.",
              "밖에서 하던 그대로를 보여주면 돼요.",
              "덜어내지 않은 모습이 결국 더 멀리 가요.",
              "그 사람이 보는 건 성과가 아니라 결이에요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-07_wed",
    "type": "single",
    "seed": 1007,
    "hook": [
      "정리는 끝났는데",
      "왜 한 발도 못 옮길까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/swords/Six of Swords.png",
        "nameKo": "소드의 6",
        "nameEn": "Six of Swords",
        "keywords": "전환 · 이동 · 나아감",
        "reveal": [
          "짐을 실은 채로",
          "물을 건너는 중이에요"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "마음은 다 접었다고 스스로 말했어요.",
              "그런데 막상 발이 잘 떨어지지 않아요.",
              "아직 못 잊은 건가 싶어 자신을 탓하게 돼요.",
              "정리가 덜 된 것 같아 조급해지기도 해요.",
              "떠나야 한다는 건 이미 알고 있어요.",
              "다만 몸이 마음을 못 따라가는 중이에요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "이 카드의 배에는 칼이 그대로 꽂혀 있어요.",
              "상처를 다 내려놓고 떠나는 그림이 아니에요.",
              "아프면서도 앞을 보고 있는 장면이에요.",
              "뒤쪽 물은 거칠고 앞쪽 물은 잔잔해요.",
              "최악의 구간은 이미 지나왔다는 뜻이에요.",
              "완전한 회복이 아니라 방향이 생긴 상태예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "다 정리된 뒤에 떠나려 하지 마세요.",
              "짐을 안고 건너도 건너는 건 건너는 거예요.",
              "속도가 느린 걸 실패로 읽지 마세요.",
              "뒤를 자주 돌아보지 않는 것만으로 충분해요.",
              "몇 주 뒤에 지금 자리를 다시 보세요.",
              "생각보다 멀리 와 있을 거예요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-09_fri",
    "type": "single",
    "seed": 1009,
    "hook": [
      "좋아서 시작했는데",
      "언제부터 익숙함이 됐을까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/cups/Four of Cups.png",
        "nameKo": "컵의 4",
        "nameEn": "Four of Cups",
        "keywords": "권태 · 무심 · 놓친 기회",
        "reveal": [
          "앞의 세 컵보다",
          "옆의 한 컵이 먼저예요"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "싸운 것도 멀어진 것도 아니에요.",
              "그냥 어느 날부터 아무 느낌이 없어요.",
              "연락도 하고 만나기도 하는데 밍밍해요.",
              "이게 식은 건지 안정된 건지 모르겠어요.",
              "설렘이 없다는 게 죄책감처럼 남아요.",
              "그래서 더 말을 못 꺼내게 돼요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "이 카드에는 컵 세 개가 앞에 놓여 있어요.",
              "가진 게 없어서 지루한 게 아니에요.",
              "익숙해져서 안 보이게 된 거예요.",
              "그 사이 옆에서 네 번째 컵이 건네지고 있어요.",
              "새 사람이 아니라 새 각도일 수도 있어요.",
              "고개만 돌리면 보이는 자리예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "권태를 끝의 신호로 읽지 마세요.",
              "익숙함은 무너진 게 아니라 가려진 거예요.",
              "크게 바꾸려 하지 않아도 괜찮아요.",
              "평소와 다른 질문 하나면 충분해요.",
              "상대가 아니라 보는 각도를 바꿔보세요.",
              "그 자리에 뭐가 있었는지 다시 보일 거예요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-10_sat",
    "type": "pick",
    "seed": 1010,
    "hook": [
      "일요일 밤이 오기 전에",
      "읽음 표시 아래 답이 달릴까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/temperance.png",
        "nameKo": "절제",
        "nameEn": "Temperance",
        "keywords": "조율 · 균형 · 속도",
        "reveal": [
          "서두르지 않고",
          "속도를 맞추는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "답이 없는 게 식어서가 아니에요.",
              "지금 상대는 속도를 재고 있어요.",
              "너무 빨리 답하면 가벼워 보일까 걱정해요.",
              "한 번에 길게 쓰려다 계속 미루게 돼요.",
              "마음이 줄어든 게 아니라 조심스러운 거예요.",
              "결국은 짧게라도 먼저 올 가능성이 커요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "재촉하지 않는 쪽이 이번엔 더 빨라요.",
              "연달아 보내면 상대가 더 굳어요.",
              "하루 정도는 그냥 두어도 괜찮아요.",
              "답이 오면 길이보다 온도를 보세요.",
              "짧아도 결이 다르면 그게 신호예요.",
              "그 결이 이번 주말의 답이에요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/swords/King of Swords.png",
        "nameKo": "소드의 킹",
        "nameEn": "King of Swords",
        "keywords": "이성 · 판단 · 분명함",
        "reveal": [
          "할 말이 없는 게 아니라",
          "고르고 있는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "읽고 바로 닫은 건 무시가 아니에요.",
              "가볍게 넘기기 싫어서 멈춘 거예요.",
              "아무 말이나 하기엔 상황이 애매해요.",
              "정확한 문장을 찾느라 시간이 걸려요.",
              "머릿속에서 몇 번이나 고쳐 쓰고 있어요.",
              "오면 짧아도 분명한 말로 올 거예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "답을 재촉하는 질문은 피하세요.",
              "대신 답하기 쉬운 걸 하나만 던져보세요.",
              "예 아니오로 끝나는 말은 대화를 닫아요.",
              "이 사람에겐 명확한 쪽이 편해요.",
              "돌려 말하지 않는 게 오히려 통해요.",
              "그 한 줄이 생각보다 멀리 갈 거예요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/cups/Two of Cups.png",
        "nameKo": "컵의 2",
        "nameEn": "Two of Cups",
        "keywords": "상호성 · 교감 · 약속",
        "reveal": [
          "이미 같은 쪽을",
          "보고 있는 상태예요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "답이 늦는 건 거리 때문이 아니에요.",
              "이미 서로 비슷한 자리에 와 있어요.",
              "상대도 이 대화를 기다리고 있어요.",
              "먼저 말하면 티가 날까 봐 재는 중이에요.",
              "싫어서 미루는 게 아니라 아껴두는 거예요.",
              "한쪽이 열면 바로 이어질 사이예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "먼저 보내도 어색해지지 않아요.",
              "가벼운 한 줄이면 충분해요.",
              "확인하려는 말보다 나누는 말이 좋아요.",
              "오늘 있었던 일 하나면 돼요.",
              "누가 먼저인지는 중요하지 않아요.",
              "이번 주말이 그 시작일 수 있어요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-11_sun",
    "type": "pick",
    "seed": 1011,
    "hook": [
      "다음 주, 각자의 하루가",
      "한 번쯤 겹쳐질까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/wheel-of-fortune.png",
        "nameKo": "운명의 수레바퀴",
        "nameEn": "Wheel of Fortune",
        "keywords": "변화 · 흐름 · 전환",
        "reveal": [
          "예상 못 한 쪽에서",
          "분위기가 돌 수 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "계획해서 다가오는 흐름이 아니에요.",
              "우연한 자리에서 마음이 움직여요.",
              "준비한 말보다 상황이 먼저 와요.",
              "그래서 본인도 조금 당황할 수 있어요.",
              "미뤄두던 연락이 갑자기 나올 수 있어요.",
              "타이밍이 사람보다 빨리 움직이는 주예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "다음 주는 일정을 꽉 채우지 마세요.",
              "비워둔 자리에 흐름이 들어와요.",
              "연락이 오면 재지 말고 받으세요.",
              "우연처럼 보여도 처음은 아닐 거예요.",
              "먼저 설계하려 들면 오히려 어긋나요.",
              "흐르는 쪽에 한 번 맡겨보세요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/pentacles/Ten of Pentacles.png",
        "nameKo": "펜타클의 10",
        "nameEn": "Ten of Pentacles",
        "keywords": "안정 · 지속 · 결실",
        "reveal": [
          "오래 갈 쪽으로",
          "무게가 실려요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "반짝이는 쪽에는 관심이 줄었어요.",
              "오래 갈 수 있는지를 먼저 봐요.",
              "말보다 쌓인 시간을 믿는 사람이에요.",
              "지금은 조용해도 자리를 잡는 중이에요.",
              "표현이 적은 게 식은 건 아니에요.",
              "다음 주엔 더 분명한 쪽으로 기울어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "빠른 확인을 요구하지 마세요.",
              "이 흐름은 쌓이는 방식으로 와요.",
              "당장 티가 안 나도 멈춘 건 아니에요.",
              "작은 약속을 지키는 게 제일 크게 남아요.",
              "다음 주엔 자리가 한 칸 단단해져요.",
              "그 변화는 나중에 더 잘 보여요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/cups/Eight of Cups.png",
        "nameKo": "컵의 8",
        "nameEn": "Eight of Cups",
        "keywords": "떠남 · 정리 · 새 길",
        "reveal": [
          "붙잡던 쪽에서",
          "발을 떼게 돼요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "쥐고 있던 걸 내려놓을 준비를 해요.",
              "미워서가 아니라 지쳐서예요.",
              "충분히 해봤다는 감각이 들었어요.",
              "남은 마음까지 없어진 건 아니에요.",
              "다만 같은 자리에 더는 못 있겠다 싶어요.",
              "다음 주에 그 결정이 움직임으로 나와요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "떠나는 걸 실패로 읽지 마세요.",
              "두고 가는 것과 버리는 건 달라요.",
              "붙잡는 말보다 정리하는 말이 나아요.",
              "허전함은 방향이 맞다는 신호이기도 해요.",
              "다음 주엔 뒤보다 앞을 보세요.",
              "그다음에 뭐가 오는지는 그때 물어도 돼요."
            ]
          ]
        ]
      }
    ]
  }
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
