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
    "date": "2026-09-14_mon",
    "type": "pick",
    "seed": 914,
    "hook": [
      "아침에 눈 뜨면 떠오르는 사람",
      "그 사람은 지금 어떤 마음일까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/judgement.png",
        "nameKo": "심판",
        "nameEn": "Judgement",
        "keywords": "각성 · 재평가 · 부름",
        "reveal": [
          "잊고 지내던 감정이",
          "다시 깨어나는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "요즘 지난 일을 자주 돌아보고 있어요.",
              "그 안에 당신과의 기억이 섞여 있어요.",
              "묻어둔 줄 알았던 감정이 다시 올라와요.",
              "본인도 그게 왜인지 정리 중이에요.",
              "생각보다 당신을 자주 떠올리고 있어요.",
              "아직 말로 옮기지 못했을 뿐이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "지금은 먼저 답을 요구할 때가 아니에요.",
              "깨어나는 감정은 스스로 방향을 찾아요.",
              "평소처럼 편하게 곁에 있어 주세요.",
              "부담을 주면 다시 덮어버릴 수 있어요.",
              "그 사람이 먼저 꺼내는 순간이 와요.",
              "그때 솔직하게 받아주면 충분해요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/swords/Four of Swords.png",
        "nameKo": "소드의 4",
        "nameEn": "Four of Swords",
        "keywords": "휴식 · 회복 · 내면의 고요",
        "reveal": [
          "마음이 식은 게 아니라",
          "잠시 쉬고 있는 거예요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "요즘 그 사람은 많이 지쳐 있어요.",
              "연락이 뜸한 건 여유가 없어서예요.",
              "당신이 싫어진 게 아니에요.",
              "누구와도 깊게 이야기할 힘이 없어요.",
              "혼자 조용히 회복할 시간이 필요해요.",
              "기운이 돌아오면 먼저 떠올릴 사람이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "침묵을 거절로 해석하지 마세요.",
              "지금 재촉하면 더 멀리 숨을 수 있어요.",
              "짧은 안부 정도면 충분해요.",
              "답이 늦어도 서운함을 쌓지 마세요.",
              "쉬고 난 사람은 곁에 있던 사람을 기억해요.",
              "그 시간 동안 내 하루도 챙겨두세요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Queen of Pentacles.png",
        "nameKo": "펜타클의 여왕",
        "nameEn": "Queen of Pentacles",
        "keywords": "실용적 사랑 · 풍요 · 안정적 돌봄",
        "reveal": [
          "말보다 챙김으로",
          "마음을 보여주는 사람"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "표현이 서툴러도 마음은 분명히 있어요.",
              "대신 행동으로 챙기는 쪽이에요.",
              "당신이 한 말을 꽤 오래 기억해요.",
              "필요한 걸 조용히 먼저 알아채요.",
              "그게 이 사람이 좋아하는 방식이에요.",
              "화려하진 않아도 오래가는 관심이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "달콤한 말만 기다리면 놓칠 수 있어요.",
              "작은 챙김을 신호로 읽어보세요.",
              "고맙다는 말을 아끼지 마세요.",
              "이 사람은 인정받을 때 더 다가와요.",
              "천천히 쌓이는 관계에 강한 카드예요.",
              "조급함만 내려놓으면 충분해요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-15_tue",
    "type": "pick",
    "seed": 915,
    "hook": [
      "스치기만 하던 그 눈빛",
      "이번 주, 나한테 멈출까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/lovers.png",
        "nameKo": "연인",
        "nameEn": "The Lovers",
        "keywords": "선택 · 관계 · 조화",
        "reveal": [
          "두 사람 시선이",
          "같은 곳에서 만나요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 이미 당신을 의식하고 있어요.",
              "먼저 눈을 피한 건 쑥스러워서예요.",
              "관심이 없으면 오히려 편하게 봐요.",
              "지금은 시선을 숨기기 어려운 단계예요.",
              "이번 주 눈빛이 조금 더 오래 머물러요.",
              "본인도 그걸 알아채고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "마주치는 순간을 피하지 마세요.",
              "짧게 웃어주는 것만으로 충분해요.",
              "이 카드는 서로 고르는 순간을 말해요.",
              "한쪽만 애쓰는 흐름이 아니에요.",
              "자연스러운 계기를 만들어도 좋아요.",
              "그 눈빛이 말로 바뀌는 날이 와요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/swords/Five of Swords.png",
        "nameKo": "소드의 5",
        "nameEn": "Five of Swords",
        "keywords": "갈등 · 충돌 · 상처를 남기는 승리",
        "reveal": [
          "먼저 보면 지는 것 같아서",
          "시선을 돌리는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "지금 자존심이 마음보다 앞서 있어요.",
              "먼저 쳐다보면 지는 기분이 들어요.",
              "그래서 일부러 무심한 척해요.",
              "관심이 없는 게 아니라 굳어 있는 거예요.",
              "지난 일에서 남은 서운함이 있을 수 있어요.",
              "그게 풀리기 전엔 시선도 머뭇거려요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "같이 자존심을 세우면 오래 걸려요.",
              "그렇다고 먼저 굽힐 필요도 없어요.",
              "가볍게 먼저 인사하는 정도가 좋아요.",
              "이긴 사람 없는 싸움은 끝내는 게 나아요.",
              "분위기가 풀리면 시선도 따라와요.",
              "누가 먼저인지는 크게 중요하지 않아요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/King of Pentacles.png",
        "nameKo": "펜타클의 킹",
        "nameEn": "King of Pentacles",
        "keywords": "안정적 성공 · 신뢰 · 든든한 보호",
        "reveal": [
          "눈빛보다 행동이",
          "먼저 오는 사람이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "티 나게 쳐다보는 성격이 아니에요.",
              "대신 곁에 있을 때 챙기는 게 달라요.",
              "당신을 믿을 만한 사람으로 보고 있어요.",
              "가볍게 다가가고 싶지 않은 쪽이에요.",
              "확신이 서야 움직이는 사람이에요.",
              "그 확신이 조금씩 쌓이는 중이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "눈빛만으로 마음을 재지 마세요.",
              "이 사람의 관심은 행동에서 보여요.",
              "도움이 필요할 때 기대봐도 좋아요.",
              "그때 먼저 나서는 모습이 신호예요.",
              "느리지만 흔들림이 없는 흐름이에요.",
              "든든한 쪽으로 천천히 기울어요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-16_wed",
    "type": "single",
    "seed": 916,
    "hook": [
      "누구에게나 다정한 사람",
      "왜 나한테만은 다르길 바랄까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/cups/Knight of Cups.png",
        "nameKo": "컵의 나이트",
        "nameEn": "Knight of Cups",
        "keywords": "로맨틱 · 감정적 행동 · 구애",
        "reveal": [
          "다정함이 모두의 것이어도",
          "내 설렘은 진짜예요"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "모두에게 웃어주는 사람인 걸 알아요.",
              "그걸 알면서도 자꾸 기대하게 돼요.",
              "나한테 건넨 말만은 달랐으면 해요.",
              "남에게 똑같이 하는 걸 보면 서운해요.",
              "서운해하는 내가 괜히 부끄러워져요.",
              "특별해지고 싶은 마음이 커진 거예요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "Knight of Cups는 마음을 먼저 건네는 카드예요.",
              "다정함이 몸에 밴 사람을 뜻해요.",
              "그 다정함이 가짜라는 뜻은 아니에요.",
              "다만 모두에게 같은 온도일 수 있어요.",
              "그래서 특별함은 행동에서 봐야 해요.",
              "모두에게 하는 것과 나에게만 하는 것."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "둘을 구분하는 기준을 세워보세요.",
              "약속을 먼저 잡는지, 기억해두는지.",
              "다정한 말보다 반복되는 선택을 보세요.",
              "그 선택이 나를 향한다면 신호예요.",
              "아니라면 내 설렘을 탓할 필요는 없어요.",
              "마음이 움직인 건 잘못이 아니니까요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-17_thu",
    "type": "pick",
    "seed": 917,
    "hook": [
      "이름만 들어도 설레는 사람",
      "그 사람 속마음은 어떨까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/star.png",
        "nameKo": "별",
        "nameEn": "The Star",
        "keywords": "희망 · 치유 · 믿음",
        "reveal": [
          "당신은 그 사람에게",
          "기분 좋은 이름이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "당신을 떠올리면 마음이 가벼워져요.",
              "부담보다 반가움이 먼저 오는 사람이에요.",
              "아직 크게 표현하진 않고 있어요.",
              "대신 조용히 기대를 키우는 중이에요.",
              "만날 날을 은근히 기다리고 있어요.",
              "그 기대가 생각보다 커요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "이 카드는 서두르지 않아도 되는 카드예요.",
              "좋은 흐름을 억지로 당기지 마세요.",
              "편안한 대화를 이어가는 게 좋아요.",
              "그 사람에게 당신은 쉼 같은 사람이에요.",
              "그 자리를 지키면 마음은 더 커져요.",
              "빛은 천천히 선명해져요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/cups/Queen of Cups.png",
        "nameKo": "컵의 여왕",
        "nameEn": "Queen of Cups",
        "keywords": "공감 · 직관 · 깊은 감정",
        "reveal": [
          "겉은 담담해도",
          "속은 먼저 반응하고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "감정을 깊게 느끼는 사람이에요.",
              "당신 이야기가 나오면 속으로 먼저 반응해요.",
              "다만 그걸 쉽게 꺼내진 않아요.",
              "상처받을까 봐 조심스러운 쪽이에요.",
              "그래서 겉으로는 담담해 보여요.",
              "마음은 이미 꽤 움직여 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "표현이 적다고 마음이 없는 건 아니에요.",
              "이 사람에겐 안전하다는 느낌이 먼저예요.",
              "진지한 이야기를 가볍게 넘기지 마세요.",
              "공감해주는 순간 마음이 열려요.",
              "그러면 먼저 감정을 보여줄 거예요.",
              "서두르지 않는 쪽이 이 카드에 맞아요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Five of Pentacles.png",
        "nameKo": "펜타클의 5",
        "nameEn": "Five of Pentacles",
        "keywords": "결핍 · 고난 · 외로움",
        "reveal": [
          "마음이 있어도",
          "다가갈 자신이 없는 상태예요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "요즘 스스로 부족하다고 느끼고 있어요.",
              "마음이 있어도 다가갈 자격을 의심해요.",
              "당신이 아까운 사람이라고 생각할 수 있어요.",
              "그래서 반응이 늦거나 거리를 둬요.",
              "밀어내는 게 아니라 움츠러든 거예요.",
              "따뜻한 신호를 받으면 달라질 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "거리감을 거절로 받아들이지 마세요.",
              "편하게 대해주는 게 가장 큰 도움이에요.",
              "부담 없는 자리부터 함께해 보세요.",
              "이 카드의 창문 너머엔 불빛이 있어요.",
              "들어올 용기가 생기면 달라져요.",
              "그 용기를 기다릴지는 내가 정해도 돼요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-18_fri",
    "type": "single",
    "seed": 918,
    "hook": [
      "만나기도 전에",
      "상상 속에서 벌써 백 번은 사귄 사람"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/cups/Nine of Cups.png",
        "nameKo": "컵의 9",
        "nameEn": "Nine of Cups",
        "keywords": "소원 성취 · 만족 · 행복",
        "reveal": [
          "상상이 커지는 건",
          "기대가 그만큼 크다는 뜻"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "아직 제대로 만난 적도 없어요.",
              "그런데 머릿속에선 벌써 여행을 다녀왔어요.",
              "첫 데이트 장소까지 정해뒀어요.",
              "연락 한 번에 하루 기분이 바뀌어요.",
              "이러다 실망할까 봐 조금 무섭기도 해요.",
              "그래도 상상을 멈추기가 어려워요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "Nine of Cups는 소원 카드예요.",
              "바라던 마음이 채워지는 흐름을 뜻해요.",
              "상상이 커지는 건 헛된 게 아니에요.",
              "그만큼 원하는 게 분명하다는 신호예요.",
              "다만 채워지는 건 실제 만남에서예요.",
              "머릿속 그림이 전부는 아니에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "상상 속 그 사람과 진짜를 구분해보세요.",
              "만나서 새로 알게 되는 모습도 있어요.",
              "기대와 다르면 실망이 아니라 발견이에요.",
              "설렘은 그대로 두고 속도만 맞춰요.",
              "작은 만남부터 하나씩 채워가 보세요.",
              "진짜 이야기는 그때부터 시작돼요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-19_sat",
    "type": "pick",
    "seed": 919,
    "hook": [
      "며칠째 그대로인 숫자 1",
      "이번 주말엔 답이 올까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/hanged-man.png",
        "nameKo": "매달린 사람",
        "nameEn": "The Hanged Man",
        "keywords": "기다림 · 정지 · 관점",
        "reveal": [
          "미루는 게 아니라",
          "멈춰 서 있는 상태예요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 메시지가 온 걸 알고 있어요.",
              "어떻게 답해야 할지 정리가 안 됐어요.",
              "가볍게 넘기기엔 마음이 쓰이는 사람이에요.",
              "그래서 오히려 창을 못 열고 있어요.",
              "생각이 많아 멈춰 선 쪽이에요.",
              "무관심과는 결이 달라요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "추가로 메시지를 보내지 마세요.",
              "재촉하면 더 오래 멈출 수 있어요.",
              "이 카드는 관점이 바뀌는 카드예요.",
              "기다리는 동안 내 하루를 채워두세요.",
              "멈춤은 영원하지 않아요.",
              "생각이 정리되면 답은 와요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/swords/Eight of Swords.png",
        "nameKo": "소드의 8",
        "nameEn": "Eight of Swords",
        "keywords": "속박 · 제한 · 스스로 만든 감옥",
        "reveal": [
          "마음이 없는 게 아니라",
          "여유가 막힌 거예요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "요즘 이런저런 사정에 묶여 있어요.",
              "해야 할 일이 머리를 꽉 채우고 있어요.",
              "답장 하나에도 에너지가 필요한 상태예요.",
              "당신이 싫어서 미룬 게 아니에요.",
              "스스로도 답답해하고 있어요.",
              "작은 계기 하나면 풀릴 매듭이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "숫자 1에 내 마음을 묶지 마세요.",
              "이 카드의 끈은 생각보다 느슨해요.",
              "가벼운 다른 화제로 여지를 줘도 좋아요.",
              "답을 요구하는 말은 피하는 게 나아요.",
              "여유가 생기면 먼저 연락할 사람이에요.",
              "그 타이밍이 주말일 수도 있어요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/wands/Queen of Wands.png",
        "nameKo": "완드의 여왕",
        "nameEn": "Queen of Wands",
        "keywords": "자신감 · 카리스마 · 따뜻한 열정",
        "reveal": [
          "이번 주말",
          "밝은 답이 올 수 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "미뤄둔 답이 마음에 걸려 있어요.",
              "대충 답하기 싫어서 늦어진 쪽이에요.",
              "제대로 이야기하고 싶은 사람이에요.",
              "주말에 여유가 생기면 먼저 움직여요.",
              "미안한 만큼 길게 답할 수 있어요.",
              "기다린 게 무색할 만큼 자연스러울 거예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "답이 오면 서운함부터 꺼내지 마세요.",
              "반갑게 받아주는 게 흐름을 살려요.",
              "이 카드는 따뜻한 에너지를 말해요.",
              "대화가 이어지면 약속까지 갈 수 있어요.",
              "밝게 반응하는 쪽이 유리해요.",
              "그 대화가 다음 장면을 열어줘요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-20_sun",
    "type": "pick",
    "seed": 920,
    "hook": [
      "다음 주, 두 사람 사이에",
      "둘만 아는 이야기가 생길까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/strength.png",
        "nameKo": "힘",
        "nameEn": "Strength",
        "keywords": "용기 · 인내 · 부드러운 힘",
        "reveal": [
          "주 초반에",
          "편안함이 쌓이기 시작해요"
        ],
        "pages": [
          [
            "다음 주 흐름",
            [
              "주 초반엔 큰 사건이 없어도 괜찮아요.",
              "대신 사소한 대화가 조금씩 쌓여요.",
              "억지로 가까워지려 하지 않을 때예요.",
              "그럴수록 거리가 자연스럽게 줄어요.",
              "둘만 쓰는 말투가 생길 수 있어요.",
              "그게 첫 번째 이야기의 시작이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "서두르면 이 흐름이 흐트러져요.",
              "부드럽게 기다리는 게 이 카드의 힘이에요.",
              "편한 사람이 되는 걸 먼저 생각하세요.",
              "긴장이 풀린 대화에서 진심이 나와요.",
              "작은 농담도 가볍게 넘기지 마세요.",
              "그게 둘만의 기억이 돼요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/cups/Three of Cups.png",
        "nameKo": "컵의 3",
        "nameEn": "Three of Cups",
        "keywords": "축하 · 기쁨 · 함께하는 행복",
        "reveal": [
          "주 중반에",
          "함께 웃는 자리가 생겨요"
        ],
        "pages": [
          [
            "다음 주 흐름",
            [
              "주 중반에 함께하는 자리가 생길 수 있어요.",
              "여럿이 있는 자리여도 괜찮아요.",
              "그 안에서 둘만 통하는 순간이 와요.",
              "같은 타이밍에 웃는 일이 생겨요.",
              "다른 사람은 모르는 신호가 오가요.",
              "그 순간이 두 사람만의 장면이 돼요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "모임이나 약속을 가볍게 넘기지 마세요.",
              "편안한 자리에서 가까워지는 흐름이에요.",
              "분위기를 즐기는 모습이 매력이 돼요.",
              "눈이 마주치면 피하지 말고 웃어주세요.",
              "그 웃음이 나중에 다시 꺼내질 거예요.",
              "기쁜 기억은 관계를 단단하게 해요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/cups/King of Cups.png",
        "nameKo": "컵의 킹",
        "nameEn": "King of Cups",
        "keywords": "감정적 성숙 · 안정 · 이해",
        "reveal": [
          "주 후반에",
          "속 깊은 이야기가 오가요"
        ],
        "pages": [
          [
            "다음 주 흐름",
            [
              "주 후반에는 대화가 깊어질 수 있어요.",
              "평소엔 안 하던 얘기가 나와요.",
              "그 사람이 먼저 속내를 꺼낼 수 있어요.",
              "가볍던 관계에 무게가 조금 실려요.",
              "서로를 보는 눈이 달라지는 시점이에요.",
              "둘만 아는 이야기가 여기서 생겨요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "진지한 이야기를 가볍게 받지 마세요.",
              "끝까지 들어주는 게 가장 큰 대답이에요.",
              "내 이야기도 조금 꺼내봐도 좋아요.",
              "이 카드는 성숙한 교감을 말해요.",
              "감정을 나누면 거리가 한 번에 줄어요.",
              "다음 주는 그 대화를 기억하는 주예요."
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
