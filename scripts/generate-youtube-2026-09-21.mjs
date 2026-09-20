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
    "date": "2026-09-21_mon",
    "type": "pick",
    "seed": 921,
    "hook": [
      "자꾸 마음이 가는 사람",
      "그 사람은 지금 어떤 마음일까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/sun.png",
        "nameKo": "태양",
        "nameEn": "The Sun",
        "keywords": "기쁨 · 성공 · 활력",
        "reveal": [
          "당신 앞에서는",
          "표정이 먼저 밝아져요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "당신 앞에서는 표정이 먼저 밝아지는 편이에요.",
              "숨기려 해도 말투와 웃음에 새어 나와요.",
              "당신은 그 사람에게 편하고 따뜻한 자리예요.",
              "같이 있으면 힘이 나는 사람으로 기억해요.",
              "그걸 본인도 어렴풋이 느끼고 있어요.",
              "아직 말로 정리하지 않았을 뿐이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 밝음을 굳이 확인하려 들지 마세요.",
              "자연스럽게 같이 웃는 시간을 늘려보세요.",
              "가벼운 대화가 이 관계의 연료예요.",
              "무겁게 다가가면 빛이 흐려질 수 있어요.",
              "편안함이 쌓이면 말은 저절로 따라와요.",
              "지금은 그 온도를 즐겨도 괜찮아요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/wands/Three of Wands.png",
        "nameKo": "완드의 3",
        "nameEn": "Three of Wands",
        "keywords": "확장 · 기다림 · 전진",
        "reveal": [
          "한 발 떨어져서",
          "지켜보는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "지금은 한 발 떨어져서 지켜보는 중이에요.",
              "관심은 있는데 다음 단계를 재고 있어요.",
              "먼 곳을 보듯 관계의 방향을 가늠해요.",
              "서두르다 놓칠까 봐 조심하는 거예요.",
              "당신 쪽 움직임을 은근히 살피고 있어요.",
              "작은 신호 하나를 기다리는 상태예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "먼저 큰 고백을 던질 필요는 없어요.",
              "대신 작은 신호를 하나 보내보세요.",
              "안부 한 줄, 사진 한 장이면 충분해요.",
              "그 사람은 그 신호를 놓치지 않을 거예요.",
              "기다리는 쪽에서 움직이는 쪽으로 바뀌어요.",
              "그때 흐름이 당신 쪽으로 기울어요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Six of Pentacles.png",
        "nameKo": "펜타클의 6",
        "nameEn": "Six of Pentacles",
        "keywords": "나눔 · 균형 잡힌 관계 · 베풂",
        "reveal": [
          "주고받는 균형을",
          "은근히 신경 써요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "주고받는 균형을 은근히 신경 쓰는 사람이에요.",
              "당신이 건넨 마음을 다 기억하고 있어요.",
              "받은 만큼 돌려주려는 마음도 있어요.",
              "다만 한쪽만 주는 구도는 부담스러워해요.",
              "기울어지면 스스로 물러서는 편이에요.",
              "지금은 그 저울을 맞추는 중이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "주는 만큼 받으려 애쓰지 않아도 돼요.",
              "대신 받는 것도 편하게 받아보세요.",
              "그 사람이 내미는 걸 사양하지 마세요.",
              "받아주는 게 이 사람에겐 신호예요.",
              "균형은 계산이 아니라 편안함에서 와요.",
              "그 편안함이 다음 문을 열어요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-22_tue",
    "type": "pick",
    "seed": 922,
    "hook": [
      "이번 주, 그 사람 프로필 사진이",
      "어느새 바뀌어 있을까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/hierophant.png",
        "nameKo": "교황",
        "nameEn": "The Hierophant",
        "keywords": "전통 · 신뢰 · 가르침",
        "reveal": [
          "프로필로 마음을",
          "드러내는 타입이 아니에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "마음을 프로필 같은 걸로 드러내는 타입이 아니에요.",
              "정해진 방식과 원칙 안에서 움직이는 사람이에요.",
              "사진이 그대로여도 마음이 멈춘 건 아니에요.",
              "겉으로 보이는 변화를 오히려 경계해요.",
              "진짜 마음은 직접 만났을 때 나와요.",
              "그 자리에서 나오는 말이 진짜예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "프로필 사진으로 마음을 읽으려 하지 마세요.",
              "이 사람에게 그건 아무 신호도 아니에요.",
              "대신 직접 볼 기회를 하나 만들어보세요.",
              "짧은 만남이라도 얼굴을 마주해야 해요.",
              "그때 나오는 말투와 눈빛을 보세요.",
              "화면 밖에서만 보이는 사람이에요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/swords/Ten of Swords.png",
        "nameKo": "소드의 10",
        "nameEn": "Ten of Swords",
        "keywords": "끝 · 배신 · 완전한 마무리",
        "reveal": [
          "무언가를 완전히",
          "끝내는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "지금 무언가를 완전히 끝내고 정리하는 중이에요.",
              "이번 주 바뀐 게 있다면 그 마무리의 표시예요.",
              "오래 붙들고 있던 걸 놓는 시기예요.",
              "끝을 인정하는 데 시간이 걸렸어요.",
              "그 자리에 새로운 빈자리가 생기고 있어요.",
              "아직 누가 들어올지는 정해지지 않았어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 정리에 끼어들지 않는 게 좋아요.",
              "끝내는 과정은 혼자 마쳐야 하는 일이에요.",
              "대신 끝난 뒤의 자리를 준비해두세요.",
              "가볍게 곁에 있는 것만으로 충분해요.",
              "빈자리는 급하게 채우면 무너져요.",
              "천천히 스며드는 쪽이 오래가요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/cups/Five of Cups.png",
        "nameKo": "컵의 5",
        "nameEn": "Five of Cups",
        "keywords": "상실 · 후회 · 슬픔",
        "reveal": [
          "지난 일에 대한",
          "아쉬움이 남아 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "지난 일에 대한 아쉬움이 아직 남아 있어요.",
              "엎질러진 것만 보느라 남은 걸 못 보고 있어요.",
              "사진을 바꾼다면 그 감정을 털어내려는 몸짓이에요.",
              "겉으론 담담해 보여도 속은 아직이에요.",
              "남은 두 잔은 아직 돌아보지 못했어요.",
              "그 두 잔 중 하나에 당신이 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "지금은 위로하려 들지 않아도 돼요.",
              "아쉬움은 스스로 지나가야 하는 감정이에요.",
              "대신 남아 있는 쪽에 조용히 서 있어 주세요.",
              "돌아봤을 때 보이는 사람이 되면 돼요.",
              "그 시선이 당신에게 닿는 순간이 와요.",
              "서두르지 않는 게 가장 빠른 길이에요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-23_wed",
    "type": "single",
    "seed": 923,
    "hook": [
      "늘 내가 먼저였다는 걸",
      "왜 이제야 알아챘을까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/pentacles/Four of Pentacles.png",
        "nameKo": "펜타클의 4",
        "nameEn": "Four of Pentacles",
        "keywords": "안전 · 집착 · 통제",
        "reveal": [
          "꽉 쥔 손을",
          "잠깐 내려도 괜찮아요"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "먼저 연락하고 먼저 챙기고 먼저 사과했어요.",
              "그게 너무 익숙해서 이상한 줄도 몰랐어요.",
              "어느 날 문득 순서를 세어보게 됐어요.",
              "전부 내가 먼저였다는 걸 알아챘어요.",
              "놓칠까 봐 손을 못 놓고 있었던 거예요.",
              "알아챈 순간부터 손이 저리기 시작했어요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "Four of Pentacles는 꽉 쥔 손을 보여주는 카드예요.",
              "놓치기 싫어서 붙드는 마음을 뜻해요.",
              "쥐고 있는 게 관계인지 불안인지 물어요.",
              "먼저 하는 건 사랑이 많아서만은 아니에요.",
              "놓으면 사라질까 봐 그런 때도 있어요.",
              "이 카드는 그 손을 잠깐 펴보라고 해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "이번 한 번만 먼저 하지 말고 기다려보세요.",
              "연락이 오는지 안 오는지를 확인해보세요.",
              "그 결과가 어느 쪽이든 답이 돼요.",
              "오면 그 사람도 쥐고 있었던 거예요.",
              "안 오면 그동안 혼자 쥐고 있었던 거고요.",
              "어느 쪽이든 손은 덜 저릴 거예요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-24_thu",
    "type": "pick",
    "seed": 924,
    "hook": [
      "나도 모르게 취향까지 닮아버린 사람",
      "그 사람은 이걸 알고 있을까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/fool.png",
        "nameKo": "바보",
        "nameEn": "The Fool",
        "keywords": "새로운 시작 · 가능성 · 순수함",
        "reveal": [
          "당신과 있으면",
          "새로 시작하는 기분이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "당신과 있으면 뭔가 새로 시작하는 기분이 들어요.",
              "계산 없이 편하게 굴게 되는 상대가 당신이에요.",
              "닮아가는 걸 눈치채고 재밌어하고 있어요.",
              "그게 좋아서 일부러 더 알려주기도 해요.",
              "서로 마음이 열려 있다는 신호예요.",
              "다음 발걸음을 어디로 뗄지 생각 중이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "닮아가는 걸 부끄러워하지 마세요.",
              "오히려 티 나게 즐겨도 괜찮아요.",
              "이 사람은 그걸 귀엽게 받아들여요.",
              "같이 해보자는 제안을 먼저 해보세요.",
              "새로 시작하는 걸 좋아하는 사람이에요.",
              "가벼운 첫걸음이 가장 잘 통해요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/wands/Seven of Wands.png",
        "nameKo": "완드의 7",
        "nameEn": "Seven of Wands",
        "keywords": "방어 · 인내 · 자기 입장 지키기",
        "reveal": [
          "자기 세계를",
          "단단히 지키는 사람이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "자기 취향과 세계를 꽤 단단히 지키는 편이에요.",
              "아무나 그 안에 들이지 않는 사람이에요.",
              "그런데 당신이 들어온 걸 이미 알고 있어요.",
              "한번 들인 사람은 쉽게 내보내지 않아요.",
              "닮아가는 당신을 보며 조금 놀라고 있어요.",
              "그 자리가 어디까지 넓어질지 재는 중이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 사람 취향을 전부 따라갈 필요는 없어요.",
              "내 취향 하나를 당당하게 보여주세요.",
              "자기 세계가 있는 사람을 존중하는 사람이에요.",
              "맞춰주기만 하면 오히려 흥미가 줄어요.",
              "서로 다른 지점에서 대화가 깊어져요.",
              "그 대화가 이 관계의 다음 문이에요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/swords/Two of Swords.png",
        "nameKo": "소드의 2",
        "nameEn": "Two of Swords",
        "keywords": "결정 회피 · 균형 · 긴장",
        "reveal": [
          "아직 마음의 방향을",
          "정하지 못했어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "아직 마음의 방향을 정하지 못한 채 멈춰 있어요.",
              "당신이 닮아가는 걸 느끼면서도 눈을 가리고 있어요.",
              "싫어서가 아니라 확신이 서기 전이라 그래요.",
              "움직였다가 틀릴까 봐 가만히 있는 거예요.",
              "양쪽을 다 저울에 올려둔 상태예요.",
              "그 저울이 기울 계기를 기다리고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "지금 답을 재촉하면 더 굳어버려요.",
              "대신 편안한 상태를 유지해주세요.",
              "선택하지 않아도 되는 시간을 주는 거예요.",
              "그 안에서 스스로 눈가리개를 풀어요.",
              "닮아가는 건 계속해도 괜찮아요.",
              "그게 결국 저울을 기울이는 무게가 돼요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-25_fri",
    "type": "single",
    "seed": 925,
    "hook": [
      "물어본 적도 없으면서",
      "이미 최악으로 정해둔 결말"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/swords/Nine of Swords.png",
        "nameKo": "소드의 9",
        "nameEn": "Nine of Swords",
        "keywords": "불안 · 걱정 · 과도한 생각",
        "reveal": [
          "그 걱정 대부분은",
          "아직 안 일어난 일이에요"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "아직 아무 답도 듣지 못했어요.",
              "그런데 머릿속엔 벌써 결말이 다 그려져 있어요.",
              "그것도 제일 나쁜 쪽으로만요.",
              "밤이 되면 그 장면이 더 또렷해져요.",
              "물어보면 될 걸 못 묻고 있어요.",
              "진짜 답을 듣는 게 더 무서워서요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "Nine of Swords는 밤에 커지는 걱정을 보여줘요.",
              "그 걱정 대부분은 아직 일어나지 않은 일이에요.",
              "최악을 먼저 정해두는 건 덜 아프고 싶어서예요.",
              "미리 아파두면 나중에 덜 아플 것 같으니까요.",
              "하지만 그건 두 번 아픈 방법이에요.",
              "이 카드는 아침이 오면 벽의 칼이 사라진다고 말해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "정해둔 결말을 일단 종이에 적어보세요.",
              "적어놓고 보면 생각보다 근거가 약해요.",
              "그다음 딱 한 가지만 직접 물어보세요.",
              "큰 질문 말고 작은 확인 하나면 돼요.",
              "답이 오면 결말은 다시 쓰여요.",
              "대부분은 상상보다 훨씬 평범한 답이에요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-26_sat",
    "type": "pick",
    "seed": 926,
    "hook": [
      "이번 주말, 그 사람 이름이",
      "통화기록에 찍힐까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/tower.png",
        "nameKo": "탑",
        "nameEn": "The Tower",
        "keywords": "변동 · 붕괴 · 전환점",
        "reveal": [
          "예고 없이",
          "갑자기 오는 흐름이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "연락이 온다면 예고 없이 갑작스럽게 와요.",
              "그 사람 쪽 상황에 변화가 생긴 거예요.",
              "준비된 대화가 아니라 마음이 먼저 움직인 전화예요.",
              "급하게 찾는 모양일 수 있어요.",
              "평소와 다른 목소리일 수 있어요.",
              "그 한 통이 관계를 흔드는 계기가 돼요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "갑작스러운 전화에 놀라지 않을 준비를 해두세요.",
              "무너지는 건 낡은 틀이지 관계가 아니에요.",
              "오히려 솔직한 대화가 시작될 수 있어요.",
              "받게 되면 판단보다 먼저 들어주세요.",
              "그 순간 당신의 태도가 다음을 정해요.",
              "흔들린 뒤에 새로 서는 자리가 있어요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/pentacles/Page of Pentacles.png",
        "nameKo": "펜타클의 페이지",
        "nameEn": "Page of Pentacles",
        "keywords": "탐구 · 배움 · 새로운 기회",
        "reveal": [
          "첫걸음을",
          "조심스럽게 재고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "첫걸음을 조심스럽게 재고 있는 중이에요.",
              "전화보다 먼저 짧은 메시지로 분위기를 볼 거예요.",
              "서두르지 않는 대신 한번 시작하면 진지해요.",
              "실수하고 싶지 않아서 천천히 가는 거예요.",
              "당신 반응을 하나하나 살피고 있어요.",
              "이번 주말은 그 첫 시도가 나올 수 있는 때예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "짧은 메시지가 오면 가볍게 받아주세요.",
              "작은 시도를 크게 반겨주는 게 중요해요.",
              "그래야 다음 걸음이 전화로 이어져요.",
              "너무 큰 반응은 오히려 부담이 돼요.",
              "편하고 따뜻한 한 줄이면 충분해요.",
              "천천히 가는 사람은 오래 가요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/wands/Nine of Wands.png",
        "nameKo": "완드의 9",
        "nameEn": "Nine of Wands",
        "keywords": "회복력 · 경계 · 마지막 힘",
        "reveal": [
          "연락하고 싶은 마음과",
          "자존심 사이에 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "지금 한 번 더 버티는 중이에요.",
              "연락하고 싶은 마음과 자존심 사이에 있어요.",
              "마지막 남은 힘을 어디에 쓸지 재고 있어요.",
              "먼저 하면 지는 것 같아서 못 하고 있어요.",
              "그런데 버티는 게 점점 힘들어지고 있어요.",
              "이번 주말이 그 경계가 될 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "이 사람에겐 먼저 다가가는 게 답일 수 있어요.",
              "가벼운 안부 하나가 벽을 내리게 해요.",
              "자존심을 지켜주는 방식으로 다가가세요.",
              "이유 있는 연락이 받기 편해요.",
              "버티던 사람이 마음을 놓는 순간이 와요.",
              "그때 통화기록에 이름이 남아요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-27_sun",
    "type": "pick",
    "seed": 927,
    "hook": [
      "다음 주, 두 사람 사이",
      "침묵이 깨질까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/high-priestess.png",
        "nameKo": "여사제",
        "nameEn": "The High Priestess",
        "keywords": "직관 · 신비 · 내면의 지혜",
        "reveal": [
          "주 초반에",
          "말보다 눈치가 먼저 오가요"
        ],
        "pages": [
          [
            "다음 주 흐름",
            [
              "주 초반, 말보다 눈치가 먼저 오가는 흐름이에요.",
              "서로 속을 다 보이지 않은 채 상대를 읽고 있어요.",
              "조용하지만 아무것도 없는 게 아니에요.",
              "그 침묵 속에서 이미 많은 게 오가고 있어요.",
              "둘 다 먼저 말하기를 재고 있는 상태예요.",
              "이 시기는 감정이 안으로 쌓이는 때예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "이 시기엔 말을 억지로 꺼내지 마세요.",
              "대신 상대의 작은 표정을 잘 봐두세요.",
              "눈치로 오가는 것도 대화예요.",
              "조급하면 읽던 걸 놓치게 돼요.",
              "안에 쌓인 게 있어야 나중에 말이 돼요.",
              "지금은 듣는 쪽으로 서 있어도 괜찮아요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/wands/Five of Wands.png",
        "nameKo": "완드의 5",
        "nameEn": "Five of Wands",
        "keywords": "경쟁 · 갈등 · 혼란",
        "reveal": [
          "주 중반에",
          "작은 부딪힘이 말문을 열어요"
        ],
        "pages": [
          [
            "다음 주 흐름",
            [
              "주 중반, 작은 부딪힘이 말문을 열 수 있어요.",
              "사소한 의견 차이나 장난 같은 다툼이 계기가 돼요.",
              "부딪힌다는 건 아직 할 말이 남았다는 뜻이에요.",
              "침묵보다 이 소란이 훨씬 나은 신호예요.",
              "서로 감정이 살아 있다는 증거예요.",
              "그 뒤에 진짜 대화가 이어질 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "작은 다툼을 피하려고만 하지 마세요.",
              "부딪힘 뒤에 오는 말이 진짜 말이에요.",
              "다만 이기려고 하면 다시 닫혀요.",
              "내 입장을 말하되 상대 말도 끝까지 들으세요.",
              "부딪힌 뒤 먼저 웃는 쪽이 이 관계를 열어요.",
              "그 웃음이 침묵을 깨는 열쇠예요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/cups/Six of Cups.png",
        "nameKo": "컵의 6",
        "nameEn": "Six of Cups",
        "keywords": "추억 · 재회 · 순수한 마음",
        "reveal": [
          "주 후반에",
          "예전 이야기가 다시 꺼내져요"
        ],
        "pages": [
          [
            "다음 주 흐름",
            [
              "주 후반, 예전 이야기가 다시 꺼내질 수 있어요.",
              "같이 웃었던 기억 하나가 침묵에 다리를 놓아요.",
              "그때로 돌아가는 게 아니라 온도를 빌려오는 거예요.",
              "오래된 농담 하나가 분위기를 바꿔요.",
              "두 사람만 아는 이야기가 힘을 발휘해요.",
              "이 시기는 관계가 다시 부드러워지는 때예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "좋았던 기억 하나를 먼저 꺼내보세요.",
              "무겁지 않은 추억이 제일 잘 통해요.",
              "그때 사진이나 장소가 좋은 핑계가 돼요.",
              "과거를 다시 사는 게 아니라 온도를 쓰는 거예요.",
              "그 온도가 지금 대화의 문을 열어요.",
              "열린 뒤에 새 이야기를 시작하면 돼요."
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
