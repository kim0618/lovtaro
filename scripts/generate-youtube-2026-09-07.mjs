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
// 85초에서 줄인 것. 60초를 넘기면 쇼츠 피드에서 불리하고, 정지 화면이 60초씩
// 이어지면 끝까지 보는 비율이 떨어진다. 본문 줄 수는 그대로 두고 체류만 줄였다.
// 본문은 insta/reply_templates.txt(참여형)·copy.txt(소개형)의 해석을 유튜브용으로 6줄씩 풀어쓴 것

const WEEK = [
  {
    date: '2026-09-07_mon', type: 'pick', seed: 907,
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
    date: '2026-09-08_tue', type: 'pick', seed: 908,
    hook: ['부르는 목소리가 달라질 때', '관계도 같이 움직여요'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/wheel-of-fortune.png',
        nameKo: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', keywords: '전환 · 순환 · 흐름의 변화',
        reveal: ['이번 주 안에', '흐름이 한 번 뒤집혀요'],
        pages: [
          ['그 사람의 속마음', [
            '지금 태도는 본인이 정한 게 아니에요.',
            '상황에 밀려 그렇게 굳어진 쪽이에요.',
            '그래서 계기가 생기면 금방 달라져요.',
            '이번 주 안에 그 계기가 놓일 수 있어요.',
            '갑자기 말투가 부드러워지는 날이 와요.',
            '본인도 왜 그런지 설명하지 못할 거예요.',
          ]],
          ['러브타로의 조언', [
            '지금 상태로 결론을 내리지 마세요.',
            '이 카드는 고정된 걸 싫어해요.',
            '내가 먼저 크게 움직일 필요는 없어요.',
            '흐름이 도는 쪽에 서 있기만 하면 돼요.',
            '변화가 오면 그때 판단해도 늦지 않아요.',
            '그 타이밍은 생각보다 가까이 있어요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/cups/Four of Cups.png',
        nameKo: '컵의 4', nameEn: 'Four of Cups', keywords: '권태 · 무관심 · 놓치는 기회',
        reveal: ['눈앞에 있는 걸', '지금은 잘 못 보고 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '지금 마음이 다른 데 가 있어요.',
            '당신이 싫어진 건 아니에요.',
            '눈앞의 것을 볼 여유가 없는 상태예요.',
            '그래서 반응이 무덤덤하게 나와요.',
            '목소리에도 그 상태가 그대로 묻어나요.',
            '본인은 무례하다고 생각하지 못하고 있어요.',
          ]],
          ['러브타로의 조언', [
            '이 시기에 답을 재촉하지 마세요.',
            '지금 물으면 대충 대답이 돌아와요.',
            '거리를 조금 두는 게 오히려 나아요.',
            '없어졌을 때 비로소 보이는 카드예요.',
            '내 시간을 내 쪽으로 돌려두세요.',
            '시선이 돌아오는 시점은 그다음이에요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/swords/Ace of Swords.png',
        nameKo: '소드의 에이스', nameEn: 'Ace of Swords', keywords: '명료함 · 진실 · 결단',
        reveal: ['흐릿하던 게', '한 번에 정리돼요'],
        pages: [
          ['그 사람의 속마음', [
            '하려던 말이 이미 정리돼 있어요.',
            '꺼낼 타이밍만 재고 있는 중이에요.',
            '어중간하게 흘리는 걸 싫어하는 쪽이에요.',
            '그래서 그전까지는 말수가 적어요.',
            '막상 꺼내면 아주 분명하게 말할 거예요.',
            '그 목소리는 지금과 확실히 달라요.',
          ]],
          ['러브타로의 조언', [
            '분명한 말이 늘 다정한 건 아니에요.',
            '어떤 답이든 받을 준비를 해두세요.',
            '대신 흐린 상태로 끌려다니지 않아도 돼요.',
            '이 카드는 안개를 끝내주는 쪽이에요.',
            '알고 나면 다음 선택이 쉬워져요.',
            '그 선택은 온전히 내 몫이에요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-09-09_wed', type: 'single', seed: 909,
    hook: ['메시지는 다 써놓고', '왜 매번 지우고 마는 걸까?'],
    cards: [
      {
        no: 1, numGlyph: '', file: 'mcards/pentacles/Knight of Pentacles.png',
        nameKo: '펜타클의 나이트', nameEn: 'Knight of Pentacles', keywords: '신중 · 성실 · 더딘 진전',
        reveal: ['느린 한 걸음이지만', '되돌리지 않는 걸음이에요'],
        pages: [
          ['지금 내 마음', [
            '보낼 말은 이미 다 정리돼 있어요.',
            '쓰는 데 십 분, 지우는 데 일 초예요.',
            '괜히 부담될까 봐 손이 멈춰요.',
            '읽고 나서 어떤 표정일지 먼저 상상해요.',
            '그러다 결국 창을 닫아버려요.',
            '용기가 없는 건지 아닌지 나도 모르겠어요.',
          ]],
          ['카드의 메시지', [
            'Knight of Pentacles는 말을 아끼는 카드예요.',
            '다른 나이트들처럼 달리지 않아요.',
            '한 걸음이 느린 대신 되돌리지 않아요.',
            '망설임은 마음이 얕아서 생기지 않아요.',
            '중요할수록 더 오래 재게 되는 거예요.',
            '이 신중함은 결점이 아니라 성향이에요.',
          ]],
          ['러브타로의 조언', [
            '완벽한 문장을 기다리지 않아도 돼요.',
            '길게 쓴 말보다 짧은 안부가 잘 닿아요.',
            '지운 메시지가 쌓였다면 신호예요.',
            '그만큼 이 사람을 아끼고 있다는 뜻이에요.',
            '오늘은 한 줄만 남겨도 괜찮아요.',
            '그 한 줄이 다음 대화를 열어줄 수 있어요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-09-10_thu', type: 'pick', seed: 910,
    hook: ['사진첩을 다시 열어보는 날', '그 사람은 어떤 상태일까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/death.png',
        nameKo: '죽음', nameEn: 'Death', keywords: '끝 · 변형 · 새로운 국면',
        reveal: ['한 시기가 닫혔지만', '관계 자체가 끝난 건 아니에요'],
        pages: [
          ['그 사람의 속마음', [
            '예전의 방식으로는 돌아갈 생각이 없어요.',
            '그 시기가 본인 안에서 이미 닫혔어요.',
            '다만 당신을 지운 것과는 달라요.',
            '기억은 그대로 두고 형태만 접어둔 거예요.',
            '그래서 연락도 애매하게 멈춰 있어요.',
            '다시 시작한다면 완전히 다른 결일 거예요.',
          ]],
          ['러브타로의 조언', [
            '옛날 모습을 기준으로 삼지 마세요.',
            '그 버전은 두 사람 모두에게 끝났어요.',
            '이 카드는 소멸이 아니라 탈피예요.',
            '지금 붙잡을 건 지난 장면이 아니에요.',
            '새로 만들 수 있는 관계인지가 기준이에요.',
            '그 답은 지금 사진첩에는 없어요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/swords/Seven of Swords.png',
        nameKo: '소드의 7', nameEn: 'Seven of Swords', keywords: '은닉 · 전략 · 드러내지 않음',
        reveal: ['숨기려는 게 아니라', '들키기 싫은 쪽이에요'],
        pages: [
          ['그 사람의 속마음', [
            '마음을 전부 보여주지 않고 있어요.',
            '속이려는 것과는 결이 달라요.',
            '들켰을 때가 더 두려운 상태예요.',
            '그래서 연락도 한 발 뒤에서 와요.',
            '먼저 묻지도 먼저 끊지도 않아요.',
            '그 거리가 본인에겐 안전한 자리예요.',
          ]],
          ['러브타로의 조언', [
            '떠보는 방식으로는 안 열려요.',
            '이 카드는 압박에 더 숨는 쪽이에요.',
            '추궁 대신 편한 자리를 만들어주세요.',
            '안전하다고 느끼면 조금씩 나와요.',
            '다만 기다리는 시간에 기한은 두세요.',
            '내 쪽이 소모되지 않는 선이 중요해요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Ten of Pentacles.png',
        nameKo: '펜타클의 10', nameEn: 'Ten of Pentacles', keywords: '안정 · 오래가는 관계 · 기반',
        reveal: ['스쳐 간 사람이 아니라', '오래 남는 자리에 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '당신을 가볍게 지나간 사람으로 두지 않아요.',
            '오래 남는 자리에 이미 놓아뒀어요.',
            '지금 조용한 건 확신이 없어서가 아니에요.',
            '이 사람은 원래 서두르지 않아요.',
            '관계를 길게 보는 쪽이라 속도가 느려요.',
            '그래서 표현도 한참 뒤에 나와요.',
          ]],
          ['러브타로의 조언', [
            '반응 속도로 마음을 재지 마세요.',
            '이 카드는 시간을 들여 쌓는 쪽이에요.',
            '조급하게 확인하면 오히려 어색해져요.',
            '자연스러운 접점을 만들어두면 충분해요.',
            '이 사람은 사라지는 유형이 아니에요.',
            '그 마음이 나올 때는 꽤 분명할 거예요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-09-11_fri', type: 'single', seed: 911,
    hook: ['괜찮다고 해놓고', '혼자 서운해지는 밤'],
    cards: [
      {
        no: 1, numGlyph: '', file: 'mcards/wands/Ten of Wands.png',
        nameKo: '완드의 10', nameEn: 'Ten of Wands', keywords: '과중한 짐 · 혼자 감당 · 소진',
        reveal: ['내려놓아도', '관계는 무너지지 않아요'],
        pages: [
          ['지금 내 마음', [
            '서운한 게 있어도 일단 이해한다고 말해요.',
            '분위기를 깨는 사람이 되기 싫어서예요.',
            '그 순간엔 정말 괜찮은 것 같기도 해요.',
            '그런데 혼자 있는 밤이면 다시 올라와요.',
            '이제 와 말하기엔 늦은 것 같아요.',
            '그래서 그냥 또 안고 잠들어요.',
          ]],
          ['카드의 메시지', [
            'Ten of Wands는 혼자 다 짊어진 카드예요.',
            '짐이 많아 앞이 잘 보이지 않아요.',
            '누가 시킨 게 아니라 스스로 든 짐이에요.',
            '이해심이 많은 사람일수록 이렇게 쌓여요.',
            '참는 게 배려로 시작해 소진으로 끝나요.',
            '이 카드는 내려놓아도 된다고 말해요.',
          ]],
          ['러브타로의 조언', [
            '말하지 않으면 상대는 끝까지 몰라요.',
            '서운함은 참는다고 사라지지 않아요.',
            '다 이해하는 사람이 되지 않아도 괜찮아요.',
            '한 가지만 골라서 가볍게 꺼내보세요.',
            '불평이 아니라 정보로 전하면 돼요.',
            '그 말이 오히려 거리를 좁힐 수 있어요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-09-12_sat', type: 'pick', seed: 912,
    hook: ['주말 저녁 떠오르는 사람', '그 사람 마음은 어디쯤일까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/justice.png',
        nameKo: '정의', nameEn: 'Justice', keywords: '균형 · 판단 · 공정',
        reveal: ['마음을 저울에', '올려두고 재는 중이에요'],
        pages: [
          ['그 사람의 속마음', [
            '감정보다 상황을 먼저 따지는 쪽이에요.',
            '지금 마음을 저울에 올려두고 있어요.',
            '좋고 싫음은 이미 정해져 있어요.',
            '다만 그걸 실행해도 되는지를 재고 있어요.',
            '그래서 태도가 차갑게 느껴질 수 있어요.',
            '계산이 끝나면 아주 분명해질 거예요.',
          ]],
          ['러브타로의 조언', [
            '감정에 호소하는 방식은 잘 안 통해요.',
            '이 카드는 앞뒤가 맞는 걸 중요하게 봐요.',
            '내 태도부터 일관되게 유지해주세요.',
            '오락가락하면 저울이 계속 흔들려요.',
            '기다리는 동안 내 기준도 세워두세요.',
            '결론이 나오면 답이 빠르게 옵니다.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/pentacles/Two of Pentacles.png',
        nameKo: '펜타클의 2', nameEn: 'Two of Pentacles', keywords: '균형 잡기 · 저글링 · 우선순위',
        reveal: ['미룬 게 아니라', '손이 모자란 상태예요'],
        pages: [
          ['그 사람의 속마음', [
            '지금 여러 개를 동시에 들고 있어요.',
            '당신을 뒤로 미룬 건 아니에요.',
            '단지 손이 하나 더 없는 상태예요.',
            '그래서 연락이 왔다가 뚝 끊겨요.',
            '주말이면 조금 여유가 생기기도 해요.',
            '본인도 이 리듬이 불편하다고 느껴요.',
          ]],
          ['러브타로의 조언', [
            '연락 간격으로 마음을 계산하지 마세요.',
            '이 카드는 애정보다 용량 문제예요.',
            '짧고 가벼운 접점이 오히려 잘 맞아요.',
            '긴 대화를 요구하면 부담이 돼요.',
            '균형이 잡히는 시기는 곧 와요.',
            '그때 리듬이 어떻게 바뀌는지 보면 돼요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/swords/Three of Swords.png',
        nameKo: '소드의 3', nameEn: 'Three of Swords', keywords: '상처 · 아픔 · 진실의 직면',
        reveal: ['지나간 자리에', '아직 정리 못 한 게 남아 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '지난 일을 잊은 게 아니에요.',
            '그때 받은 게 아직 남아 있어요.',
            '당신 탓이 아닐 수도 있어요.',
            '다시 다가서기 전에 정리하고 싶어 해요.',
            '그래서 마음이 있어도 멈춰 서 있어요.',
            '조용한 건 무관심이 아니라 회복 중이에요.',
          ]],
          ['러브타로의 조언', [
            '아픈 자리를 서둘러 덮지 마세요.',
            '이 카드는 통과해야 지나가는 쪽이에요.',
            '재촉하면 상처가 다시 열려요.',
            '기다린다면 그 이유를 나도 알아야 해요.',
            '내 마음도 같이 챙겨두세요.',
            '회복이 끝난 뒤가 진짜 시작일 수 있어요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-09-13_sun', type: 'pick', seed: 913,
    hook: ['다음 주, 따로 가던 두 사람', '나란히 걷게 될까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/moon.png',
        nameKo: '달', nameEn: 'The Moon', keywords: '무의식 · 숨겨진 감정 · 흐림',
        reveal: ['주 초반에는', '서로의 속도가 잘 안 보여요'],
        pages: [
          ['그 사람의 속마음', [
            '주 초반은 신호가 일정하지 않아요.',
            '어제와 오늘의 온도가 달라요.',
            '거짓말은 아니고 본인도 흐린 상태예요.',
            '말보다 분위기로 전해지는 게 많아요.',
            '그래서 해석이 자꾸 어긋나요.',
            '이 구간은 판단을 미뤄두는 게 나아요.',
          ]],
          ['러브타로의 조언', [
            '흐릿할 때 결론을 내리지 마세요.',
            '이 카드는 밤에 보는 풍경이에요.',
            '보이는 게 전부가 아닐 수 있어요.',
            '불안이 커지면 상상이 앞서요.',
            '사실만 남기고 나머지는 두세요.',
            '주 중반이 되면 윤곽이 잡혀요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/cups/Two of Cups.png',
        nameKo: '컵의 2', nameEn: 'Two of Cups', keywords: '교감 · 서로를 향함 · 연결',
        reveal: ['주 중반에', '눈높이가 맞는 순간이 와요'],
        pages: [
          ['그 사람의 속마음', [
            '주 중반에 대화의 결이 맞아떨어져요.',
            '길게 설명하지 않아도 통하는 순간이에요.',
            '그날은 먼저 연락이 올 수도 있어요.',
            '서로 같은 걸 보고 있다는 느낌이 들어요.',
            '이 카드는 한쪽만의 감정이 아니에요.',
            '그 온도가 다음 흐름을 정하게 돼요.',
          ]],
          ['러브타로의 조언', [
            '통하는 순간이 오면 미루지 마세요.',
            '이 카드는 타이밍을 중요하게 봐요.',
            '거창한 고백을 하라는 뜻은 아니에요.',
            '반응을 조금 더 솔직하게 보여주면 돼요.',
            '한 발만 나가도 흐름이 이어져요.',
            '그 자리가 주 후반을 만들어요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/wands/Four of Wands.png',
        nameKo: '완드의 4', nameEn: 'Four of Wands', keywords: '안정 · 함께하는 자리 · 안착',
        reveal: ['주 후반에', '같은 자리에 서게 돼요'],
        pages: [
          ['그 사람의 속마음', [
            '주 후반에 함께하는 시간이 생겨요.',
            '약속일 수도 우연일 수도 있어요.',
            '그 자리에서 마음이 한결 편해져요.',
            '따로 가던 방향이 한쪽으로 모여요.',
            '이 카드는 관계가 자리를 잡는 그림이에요.',
            '무리해서 만든 자리는 아닐 거예요.',
          ]],
          ['러브타로의 조언', [
            '이 흐름은 억지로 만들지 않아도 돼요.',
            '자연스럽게 겹치는 자리를 열어두세요.',
            '완벽한 계획보다 편한 분위기가 중요해요.',
            '이 카드는 격식보다 온도를 봐요.',
            '한 주의 결론은 후반에 놓여 있어요.',
            '그때 두 사람 거리를 다시 확인해보세요.',
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
