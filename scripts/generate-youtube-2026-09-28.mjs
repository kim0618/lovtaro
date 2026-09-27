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
    "date": "2026-09-28_mon",
    "type": "pick",
    "seed": 928,
    "hook": [
      "별일 없어도 생각나는 사람",
      "그 사람은 지금 어떤 마음일까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/world.png",
        "nameKo": "세계",
        "nameEn": "The World",
        "keywords": "완성 · 성취 · 순환",
        "reveal": [
          "한 챕터가 이미",
          "완성된 모양으로 남았어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 안에서 당신과의 시간은 이미 온전해요.",
              "흐지부지 끝난 게 아니라 하나의 장면으로 남았어요.",
              "그래서 특별한 일이 없어도 문득 떠오르는 거예요.",
              "미련이라기보다 완성된 기억에 가까워요.",
              "그 사람도 같은 장면을 가끔 꺼내 봐요.",
              "다만 다시 열 이유를 아직 못 찾았을 뿐이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "끝난 이야기라고 단정하지 않아도 괜찮아요.",
              "완성된 것은 다시 시작될 여지를 남겨둬요.",
              "억지로 이어 붙이려 하지는 마세요.",
              "자연스러운 계기가 생길 때 움직이면 돼요.",
              "그때까지는 당신의 하루를 채우는 게 먼저예요.",
              "순환은 늘 제자리로 돌아오는 성질이 있어요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/pentacles/Seven of Pentacles.png",
        "nameKo": "펜타클의 7",
        "nameEn": "Seven of Pentacles",
        "keywords": "인내 · 기다림 · 중간 점검",
        "reveal": [
          "아직 자라는 중이라",
          "기다림이 필요해요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 지금 확신을 모으는 단계예요.",
              "마음이 없는 게 아니라 아직 여물지 않았어요.",
              "혼자서 이 관계를 자주 점검하고 있어요.",
              "그래서 표현이 느리고 조심스러워요.",
              "당신 생각이 하루 한 번씩 스쳐 지나가요.",
              "다만 지금 꺼내면 이르다고 느끼고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "재촉하면 덜 자란 채로 뽑게 돼요.",
              "지금은 결과를 캐낼 때가 아니라 지켜볼 때예요.",
              "기다리는 동안 당신도 당신 밭을 돌보세요.",
              "조급함은 상대에게 그대로 전해져요.",
              "계절이 바뀌면 보이는 것이 달라져요.",
              "그때 다시 물어도 늦지 않아요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/cups/Ten of Cups.png",
        "nameKo": "컵의 10",
        "nameEn": "Ten of Cups",
        "keywords": "완전한 행복 · 관계의 완성 · 진정한 사랑",
        "reveal": [
          "떠올릴 때 불안보다",
          "따뜻함이 먼저 와요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람에게 당신은 편안한 자리예요.",
              "같이 있는 장면을 이미 자연스럽게 그려봐요.",
              "설렘보다 안정감으로 기울어 있는 마음이에요.",
              "그래서 요란한 표현이 잘 나오지 않아요.",
              "당신을 떠올릴 때 마음이 조용히 좋아져요.",
              "이런 마음은 혼자 만들어지지 않아요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "이미 편안하다면 증명을 요구하지 마세요.",
              "확인하려 들수록 그림이 흐려질 수 있어요.",
              "함께 보내는 평범한 시간을 늘려보세요.",
              "큰 이벤트보다 반복되는 일상이 힘이 돼요.",
              "당신이 먼저 편안해지면 상대도 따라와요.",
              "따뜻함은 서두르지 않아도 쌓여요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-29_tue",
    "type": "pick",
    "seed": 929,
    "hook": [
      "그 사람 프로필 사진이",
      "이번 주에 바뀔까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/hierophant.png",
        "nameKo": "교황",
        "nameEn": "The Hierophant",
        "keywords": "전통 · 배움 · 신념",
        "reveal": [
          "마음을 겉으로",
          "드러내는 타입이 아니에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 자기 방식과 원칙이 뚜렷해요.",
              "마음을 프로필 같은 것으로 표현하지 않아요.",
              "변화보다 유지하는 쪽을 편하게 느껴요.",
              "그래서 화면은 오래 그대로일 수 있어요.",
              "하지만 마음까지 멈춘 건 아니에요.",
              "정해진 자리에서 천천히 움직이는 사람이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "화면의 변화로 마음을 읽으려 하지 마세요.",
              "이 사람은 직접 마주할 때 신호가 나와요.",
              "형식이 갖춰진 자리에서 더 솔직해져요.",
              "가벼운 떠보기는 오히려 닫히게 만들어요.",
              "진지한 대화 한 번이 한 달치 추측보다 나아요.",
              "그 기회를 어떻게 만들지 생각해보세요."
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
        "keywords": "끝 · 바닥 · 새로운 시작",
        "reveal": [
          "무언가를 완전히",
          "끝내고 정리하는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 지금 한 시기를 닫는 중이에요.",
              "스스로 끝을 인정하고 받아들이고 있어요.",
              "이번 주 바뀐 게 있다면 그 마무리의 표시예요.",
              "힘든 구간을 이미 바닥까지 지나왔어요.",
              "그래서 표정도 연락도 조용해져 있어요.",
              "정리가 끝나면 시야가 다시 열려요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "끝나는 장면을 나쁘게만 보지 마세요.",
              "바닥을 친 자리에는 늘 빈 공간이 생겨요.",
              "지금 그 사람에게 필요한 건 재촉이 아니에요.",
              "조용히 자리를 지키는 사람이 오래 남아요.",
              "그 빈자리에 무엇이 들어올지 지켜보세요.",
              "새 시작은 생각보다 빨리 와요."
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
        "keywords": "상실 · 후회 · 남은 희망",
        "reveal": [
          "지난 일에 대한",
          "아쉬움이 남아 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 마음엔 아직 후회가 남아 있어요.",
              "쏟아진 쪽만 보느라 남은 것을 못 보고 있어요.",
              "그래서 지금은 표현이 무겁고 느려요.",
              "당신을 향한 마음이 없어서가 아니에요.",
              "감정을 정리하는 데 에너지를 쓰고 있어요.",
              "화면을 바꾼다면 털어내려는 몸짓일 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 사람의 과거를 캐묻지 마세요.",
              "돌아선 등 뒤에 남은 잔이 아직 두 개 있어요.",
              "그걸 대신 보여주려 애쓰지 않아도 돼요.",
              "당신이 편안한 사람으로 있으면 충분해요.",
              "시선이 앞으로 돌아오는 때가 와요.",
              "그때 어떤 말을 건넬지 준비해두세요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-09-30_wed",
    "type": "single",
    "seed": 930,
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
    "date": "2026-10-01_thu",
    "type": "pick",
    "seed": 1001,
    "hook": [
      "좋다 하기엔 이르고",
      "아니라기엔 늦은 사람"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/magician.png",
        "nameKo": "마법사",
        "nameEn": "The Magician",
        "keywords": "의지 · 창조 · 실현",
        "reveal": [
          "끝낼 재료가 이미",
          "당신 손에 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 이 애매함을 느끼고 있어요.",
              "먼저 이름을 붙이는 쪽을 기다리는 중이에요.",
              "싫어서가 아니라 확신이 필요해서예요.",
              "당신의 한마디에 반응할 준비는 돼 있어요.",
              "지금은 서로 눈치만 보는 구간이에요.",
              "누군가 한 명은 움직여야 풀리는 자리예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "기다려서 정해지는 관계가 아니에요.",
              "작은 제안 하나가 이름을 바꿔놓아요.",
              "거창한 고백일 필요는 없어요.",
              "다음에 만날 약속을 먼저 잡아보세요.",
              "재료는 이미 다 갖춰져 있어요.",
              "쓰는 사람이 되면 흐름이 따라와요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/cups/Ace of Cups.png",
        "nameKo": "컵의 에이스",
        "nameEn": "Ace of Cups",
        "keywords": "새로운 사랑 · 감정의 시작 · 풍요로운 마음",
        "reveal": [
          "감정이 이제 막",
          "차오르기 시작했어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 마음은 지금 막 열리는 중이에요.",
              "이르다고 느끼는 건 정말 시작이기 때문이에요.",
              "아직 이름 붙이기 전의 감정이에요.",
              "그래서 조심스럽고 자주 흔들려요.",
              "당신을 생각하면 기분이 좋아지는 단계예요.",
              "이걸 뭐라고 불러야 할지 모르는 상태예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "시작하는 감정을 서둘러 규정하지 마세요.",
              "잔이 차오를 시간을 주는 게 중요해요.",
              "지금 확인하려 들면 넘치기 전에 흔들려요.",
              "자주 보고 가볍게 이어가는 게 좋아요.",
              "이 시기의 서투름은 흠이 아니에요.",
              "차오르면 저절로 흘러넘쳐요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/wands/Eight of Wands.png",
        "nameKo": "완드의 8",
        "nameEn": "Eight of Wands",
        "keywords": "빠른 전개 · 메시지 · 신속한 움직임",
        "reveal": [
          "멈춰 있던 흐름이",
          "곧 빠르게 움직여요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 쪽에서 곧 움직임이 나와요.",
              "오래 고민하던 것을 한 번에 꺼내는 타입이에요.",
              "연락이나 제안이 갑자기 올 수 있어요.",
              "애매하던 자리가 한 번에 정리될 수 있어요.",
              "속도가 붙으면 망설일 틈이 짧아져요.",
              "이미 마음은 방향을 정해둔 상태예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "갑작스러운 연락에 당황하지 마세요.",
              "미리 내 마음의 답을 정해두는 게 좋아요.",
              "빠른 흐름에서는 머뭇거림이 크게 보여요.",
              "솔직하게 반응하는 쪽이 유리해요.",
              "타이밍을 놓치면 속도가 지나가버려요.",
              "지금 준비해두면 흐름을 탈 수 있어요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-02_fri",
    "type": "single",
    "seed": 1002,
    "hook": [
      "물어본 적도 없으면서",
      "최악으로 정해둔 결말"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/swords/Nine of Swords.png",
        "nameKo": "소드의 9",
        "nameEn": "Nine of Swords",
        "keywords": "불안 · 걱정 · 자책",
        "reveal": [
          "밤에 혼자 커지는",
          "걱정을 보여줘요"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "아직 아무 답도 듣지 못했어요.",
              "그런데 머릿속엔 최악의 장면이 다 그려져 있어요.",
              "물어보기도 전에 결말부터 정해뒀어요.",
              "나쁜 답을 먼저 준비해두면 덜 아플 것 같아서예요.",
              "그 예행연습이 하루를 다 써버려요.",
              "정작 확인은 계속 미루고 있어요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "이 카드는 침대에 앉아 얼굴을 감싼 그림이에요.",
              "머리 위 칼은 벽에 걸려 있을 뿐이에요.",
              "찌르고 있는 게 아니라 걸려 있는 거예요.",
              "걱정의 대부분은 아직 일어나지 않은 일이에요.",
              "밤이 길어질수록 생각은 실제보다 커져요.",
              "아침이 되면 크기가 달라져 있기도 해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "머릿속 결말을 사실처럼 취급하지 마세요.",
              "상상과 확인은 전혀 다른 정보예요.",
              "지금 떠오른 최악을 한 줄로 적어보세요.",
              "적어두면 나중에 비교할 수 있어요.",
              "진짜 답이 온 뒤에 다시 읽어보세요.",
              "얼마나 달랐는지가 다음 불안을 줄여줘요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-03_sat",
    "type": "pick",
    "seed": 1003,
    "hook": [
      "잠금화면 위로",
      "그 사람 알림이 올까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/moon.png",
        "nameKo": "달",
        "nameEn": "The Moon",
        "keywords": "불확실 · 감정 · 직관",
        "reveal": [
          "쓰다 지우기를",
          "반복하고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 보낼까 말까 망설이는 중이에요.",
              "썼다가 지운 메시지가 이미 여러 개예요.",
              "무슨 말로 시작해야 할지 정하지 못했어요.",
              "조용한 화면이 무관심이라는 뜻은 아니에요.",
              "오히려 신경이 쓰여서 더 어려워하는 거예요.",
              "마음속은 생각보다 시끄러워요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "침묵을 답으로 읽지 마세요.",
              "이 카드는 흐림이지 없음이 아니에요.",
              "먼저 가벼운 한 줄을 보내도 괜찮아요.",
              "부담 없는 시작이 망설임을 풀어줘요.",
              "완벽한 문장을 기다리지 마세요.",
              "흐림은 시간이 지나면 걷혀요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/swords/Queen of Swords.png",
        "nameKo": "소드의 여왕",
        "nameEn": "Queen of Swords",
        "keywords": "독립적 · 명석함 · 냉정한 판단",
        "reveal": [
          "할 말이 분명해질 때",
          "연락하는 사람이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 감정보다 상황을 먼저 정리해요.",
              "할 말이 또렷해지기 전엔 연락을 아껴요.",
              "감정만으로 움직이는 타입이 아니에요.",
              "그래서 연락 간격이 길어 보일 수 있어요.",
              "대신 한번 꺼내면 흐리지 않고 말해요.",
              "지금은 자기 생각을 정리하는 시간이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "연락 빈도로 마음을 재지 마세요.",
              "이 사람은 양보다 내용으로 표현해요.",
              "감정을 쏟아내는 대화는 부담이 될 수 있어요.",
              "명확하고 담백하게 말하는 쪽이 통해요.",
              "기다리는 동안 추측을 늘리지 마세요.",
              "오는 말은 또렷할 가능성이 높아요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/wands/Page of Wands.png",
        "nameKo": "완드의 페이지",
        "nameEn": "Page of Wands",
        "keywords": "열정 · 탐험 · 새로운 아이디어",
        "reveal": [
          "별 내용 없는 한 줄로",
          "시작될 수 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 충동적으로 연락하는 편이에요.",
              "오래 고민하기보다 생각난 김에 보내요.",
              "주말 사이 가벼운 한 줄이 올 수 있어요.",
              "내용은 별것 아닐 가능성이 높아요.",
              "하지만 그건 핑계에 가까운 연락이에요.",
              "반응이 좋으면 대화를 길게 끌고 가요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "내용이 가볍다고 실망하지 마세요.",
              "이 사람에겐 연락 자체가 신호예요.",
              "무겁게 답하면 흐름이 끊겨요.",
              "비슷한 온도로 가볍게 받아주세요.",
              "그 한 줄에 어떻게 답하느냐가 중요해요.",
              "다음 대화는 거기서 갈려요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-04_sun",
    "type": "pick",
    "seed": 1004,
    "hook": [
      "반반이던 마음이",
      "한쪽으로 기울까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/hermit.png",
        "nameKo": "은둔자",
        "nameEn": "The Hermit",
        "keywords": "내면 · 거리 · 성찰",
        "reveal": [
          "혼자 있는 시간이",
          "저울을 움직여요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "다음 주 초반은 혼자 정리하는 시간이에요.",
              "누구에게 물어도 답이 선명해지지 않아요.",
              "조용히 있을 때 마음이 방향을 잡아요.",
              "그 사람 쪽도 거리를 두고 생각 중이에요.",
              "연락이 줄어도 멀어지는 건 아니에요.",
              "각자 자기 답을 고르는 구간이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "급하게 결론을 내려 하지 마세요.",
              "혼자 있는 시간을 도망으로 보지 마세요.",
              "주변의 조언이 오히려 흐리게 만들 수 있어요.",
              "등불은 멀리가 아니라 한 걸음을 비춰요.",
              "다음 한 걸음만 정하면 충분해요.",
              "초반의 침묵이 후반의 선명함을 만들어요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/pentacles/Eight of Pentacles.png",
        "nameKo": "펜타클의 8",
        "nameEn": "Eight of Pentacles",
        "keywords": "노력 · 성실함 · 꾸준한 발전",
        "reveal": [
          "같은 자리를 한 번 더",
          "다듬게 돼요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "다음 주 중반은 반복처럼 느껴져요.",
              "결정이 안 나는 게 아니라 다듬는 중이에요.",
              "같은 고민을 여러 번 되짚게 돼요.",
              "그 과정이 지루하게 느껴질 수 있어요.",
              "하지만 매번 조금씩 정밀해지고 있어요.",
              "그 사람도 자기 자리에서 같은 작업 중이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "제자리라고 느껴도 멈추지 마세요.",
              "반복은 정체가 아니라 숙련의 과정이에요.",
              "큰 변화를 기대하면 지치기 쉬워요.",
              "하루치 진전만 확인하고 넘어가세요.",
              "쌓인 시간은 후반에 형태로 나타나요.",
              "지금의 성실함이 선택의 근거가 돼요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/cups/Seven of Cups.png",
        "nameKo": "컵의 7",
        "nameEn": "Seven of Cups",
        "keywords": "환상 · 선택 · 혼란",
        "reveal": [
          "여러 갈래가 한 번에",
          "눈앞에 놓여요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "다음 주 후반은 선택지가 많아 보여요.",
              "여러 가능성이 동시에 떠오르는 시기예요.",
              "전부 괜찮아 보여서 오히려 못 고르게 돼요.",
              "그중 일부는 상상에 가까운 것이에요.",
              "그 사람에 대한 기대도 섞여 있어요.",
              "진짜인 건 몇 개 안 될 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "전부 붙잡으려 하면 하나도 안 잡혀요.",
              "실제로 일어난 일만 따로 적어보세요.",
              "상상과 사실을 나누면 잔이 줄어들어요.",
              "남은 것 중에서 고르면 훨씬 쉬워요.",
              "많아 보이는 선택지는 대개 착시예요.",
              "하나를 놓아야 하나가 선명해져요."
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
