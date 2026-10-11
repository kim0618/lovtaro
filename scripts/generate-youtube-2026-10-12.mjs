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
    "date": "2026-10-12_mon",
    "type": "pick",
    "seed": 1012,
    "hook": [
      "말 한마디에 기분이 오르내린다면",
      "그 사람 속마음, 하나만 골라보세요"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "mcards/cups/Page of Cups.png",
        "nameKo": "컵의 페이지",
        "nameEn": "Page of Cups",
        "keywords": "설렘 · 서툰 표현 · 새 감정",
        "reveal": [
          "서툴러서 가볍게 보일 뿐",
          "마음은 진심이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 표현이 서툰 사람이에요.",
              "가볍게 던진 말에 진심을 숨겨둬요.",
              "농담처럼 말해야 덜 떨리거든요.",
              "당신 반응에 혼자 기분이 바뀌기도 해요.",
              "말투가 짧은 날은 대개 쑥스러운 날이에요.",
              "생각보다 당신 말을 오래 곱씹고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "말 한마디의 온도만 재지 마세요.",
              "그 말이 나온 타이밍을 같이 보세요.",
              "먼저 가볍게 웃어주면 상대도 풀려요.",
              "진지한 확인은 조금 뒤로 미뤄도 돼요.",
              "서툰 사람에겐 편한 분위기가 답이에요.",
              "그 분위기 안에서 진심이 먼저 나와요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "cards-png/strength.png",
        "nameKo": "힘",
        "nameEn": "Strength",
        "keywords": "용기 · 인내 · 다정한 힘",
        "reveal": [
          "흔들려도 괜찮아요",
          "중심은 당신에게 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신의 다정함을 알고 있어요.",
              "쉽게 흔들리는 사람으로 보지 않아요.",
              "오히려 함께 있으면 편하다고 느껴요.",
              "말을 고르는 건 상대도 마찬가지예요.",
              "당신 기분을 살피며 조심스럽게 다가와요.",
              "서두르지 않는 관계를 바라고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "기분이 오르내릴 땐 잠깐 멈춰보세요.",
              "바로 답하지 않아도 관계는 그대로예요.",
              "내 하루를 먼저 챙기는 게 힘이에요.",
              "부드럽게 버티는 사람이 결국 이겨요.",
              "다정함은 약함이 아니라 무기예요.",
              "그 여유가 상대를 더 가까이 불러와요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Three of Pentacles.png",
        "nameKo": "펜타클의 3",
        "nameEn": "Three of Pentacles",
        "keywords": "협력 · 맞춰감 · 쌓아가기",
        "reveal": [
          "아직 서로를",
          "맞춰가는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 관계를 천천히 쌓고 싶어해요.",
              "한마디로 판단받는 게 조금 부담스러워요.",
              "같이 보낸 시간이 더 중요하다고 믿어요.",
              "당신과 맞는 부분을 하나씩 찾는 중이에요.",
              "어긋난 말도 다음에 고치면 된다고 봐요.",
              "생각보다 진지하게 이 관계를 보고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "말 한마디에 결론을 내리지 마세요.",
              "작은 약속 하나를 같이 지켜보세요.",
              "함께 한 경험이 말보다 빨리 쌓여요.",
              "서운한 건 그때그때 가볍게 말해요.",
              "맞춰가는 과정 자체가 좋은 신호예요.",
              "그 조각들이 모이면 모양이 보여요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-13_tue",
    "type": "pick",
    "seed": 1013,
    "hook": [
      "이번 주, 내 스토리 본 목록에",
      "그 사람이 들어와 있을까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/emperor.png",
        "nameKo": "황제",
        "nameEn": "The Emperor",
        "keywords": "안정 · 신중함 · 지켜봄",
        "reveal": [
          "표현은 없지만",
          "늘 지켜보고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 쉽게 티를 내지 않아요.",
              "대신 당신 소식은 빠짐없이 챙겨봐요.",
              "스토리를 보고도 반응은 아껴두는 편이에요.",
              "확신이 생기기 전엔 움직이지 않아요.",
              "가벼운 관계로 만들고 싶지 않아서예요.",
              "조용한 확인이 이 사람의 관심 표현이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "반응이 없다고 관심이 없는 건 아니에요.",
              "이 사람에겐 꾸준함이 신뢰가 돼요.",
              "내 일상을 자연스럽게 보여주세요.",
              "억지로 끌어내려 하면 더 단단해져요.",
              "안정감을 느낄 때 먼저 손을 내밀어요.",
              "그때까지 내 리듬을 지키는 게 좋아요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/wands/Four of Wands.png",
        "nameKo": "완드의 4",
        "nameEn": "Four of Wands",
        "keywords": "반가움 · 축하 · 편안함",
        "reveal": [
          "반가운 이름이",
          "조용히 다가와요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신 일상이 반가운 사람이에요.",
              "스토리 속 당신 모습에 괜히 웃게 돼요.",
              "편하게 반응하고 싶은 마음이 있어요.",
              "부담 주지 않는 선에서 다가오려 해요.",
              "가볍게 말 걸 기회를 찾고 있어요.",
              "좋은 소식이 생기면 먼저 알리고 싶어해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "즐거운 순간을 숨기지 말고 나눠보세요.",
              "밝은 일상이 사람을 자연스럽게 불러요.",
              "반응이 오면 가볍게 받아주세요.",
              "처음부터 의미를 크게 두지 않아도 돼요.",
              "편한 분위기가 다음 대화를 열어줘요.",
              "그 작은 반가움이 시작일 수 있어요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/swords/Seven of Swords.png",
        "nameKo": "소드의 7",
        "nameEn": "Seven of Swords",
        "keywords": "몰래 · 조심 · 숨긴 관심",
        "reveal": [
          "무심한 척하지만",
          "몰래 보고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 관심을 들키고 싶지 않아요.",
              "그래서 아무렇지 않은 척 지나가요.",
              "그런데 스토리는 생각보다 자주 봐요.",
              "먼저 다가갔다가 상처받을까 조심해요.",
              "확인만 하고 조용히 빠져나오는 중이에요.",
              "관심을 놓지 못한 상태인 건 분명해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "몰래 보는 마음을 억지로 캐묻지 마세요.",
              "들켰다고 느끼면 더 숨어버려요.",
              "편하게 말 걸 틈을 하나 만들어주세요.",
              "질문형 스토리 하나도 좋은 문이 돼요.",
              "숨어 있던 사람은 안전할 때 나와요.",
              "그 문을 여는 건 생각보다 작은 계기예요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-14_wed",
    "type": "single",
    "seed": 1014,
    "hook": [
      "먼저 좋아하면 지는 거라고",
      "혼자 정한 규칙이 있나요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/wands/Seven of Wands.png",
        "nameKo": "완드의 7",
        "nameEn": "Seven of Wands",
        "keywords": "방어 · 인내 · 자기 입장 지키기",
        "reveal": [
          "지키느라 세운 벽이",
          "다가갈 길도 막고 있어요"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "먼저 연락하면 지는 것 같아요.",
              "좋아하는 티를 내면 끝일 것 같아요.",
              "그래서 늘 한 발 물러서 있어요.",
              "괜찮은 척하는 데 힘을 다 써요.",
              "그런데 마음은 계속 그쪽으로 가요.",
              "버티는 게 점점 지쳐가고 있어요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "이 카드는 높은 곳에서 혼자 버티는 사람이에요.",
              "아래서 올라오는 막대를 다 막고 있어요.",
              "지키려는 건 결국 다치지 않을 자리예요.",
              "그 규칙은 상처를 막아주긴 해요.",
              "그런데 다가올 사람까지 같이 막아요.",
              "지는 게 아니라 닫히는 게 문제예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "규칙을 한 번에 버릴 필요는 없어요.",
              "작은 것 하나만 먼저 내려놓아 보세요.",
              "짧은 안부 하나는 지는 게 아니에요.",
              "마음을 보여준다고 약해지지 않아요.",
              "오히려 버티던 힘이 덜 들어요.",
              "벽 대신 문을 하나 달아두세요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-15_thu",
    "type": "pick",
    "seed": 1015,
    "hook": [
      "요즘 노래마다 떠오르는 사람",
      "그 사람 마음, 하나만 골라보세요"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "mcards/pentacles/Nine of Pentacles.png",
        "nameKo": "펜타클의 9",
        "nameEn": "Nine of Pentacles",
        "keywords": "여유 · 자립 · 혼자만의 시간",
        "reveal": [
          "그 사람을 떠올리는 시간이",
          "작은 위로가 되고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신의 단단함을 좋아해요.",
              "혼자서도 잘 지내는 모습이 눈에 띄어요.",
              "그래서 쉽게 다가가기 조심스러워요.",
              "당신 일상에 방해가 될까 걱정해요.",
              "가끔 당신이 올린 노래를 따라 들어요.",
              "멀리서 조용히 마음을 키우는 중이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "지금처럼 내 시간을 잘 채워가세요.",
              "그 여유가 당신을 더 빛나게 해요.",
              "다가올 틈은 살짝 열어두는 게 좋아요.",
              "좋아하는 노래를 가볍게 공유해보세요.",
              "취향 하나가 대화의 문이 되기도 해요.",
              "서두르지 않아도 흐름은 이어져요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/cups/Knight of Cups.png",
        "nameKo": "컵의 나이트",
        "nameEn": "Knight of Cups",
        "keywords": "낭만 · 고백 · 다가옴",
        "reveal": [
          "감성이 맞닿는 사람이",
          "다가오고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 감성이 깊은 사람이에요.",
              "노래 한 곡에 당신을 떠올리기도 해요.",
              "마음을 전할 방법을 고르고 있어요.",
              "평범한 말보다 특별하게 말하고 싶어해요.",
              "그래서 타이밍을 조금 미루는 중이에요.",
              "준비가 되면 생각보다 다정하게 다가와요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 사람의 작은 표현을 놓치지 마세요.",
              "보내준 노래나 사진에 마음이 담겨 있어요.",
              "반응해줄 때 따뜻하게 받아주세요.",
              "너무 담담하면 상대가 멈칫할 수 있어요.",
              "낭만을 부끄러워하지 않아도 괜찮아요.",
              "그 고백 같은 순간이 가까이 있어요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "cards-png/chariot.png",
        "nameKo": "전차",
        "nameEn": "The Chariot",
        "keywords": "전진 · 의지 · 방향",
        "reveal": [
          "떠올리기만 하던 마음이",
          "움직일 때가 왔어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 이 관계에 방향을 원해요.",
              "애매하게 머무는 걸 오래 못 견뎌요.",
              "누가 먼저 움직일지 눈치를 보고 있어요.",
              "작은 신호만 있으면 바로 다가올 수 있어요.",
              "결심이 서면 속도가 빠른 사람이에요.",
              "지금은 그 계기를 기다리는 중이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "생각만 하던 걸 하나 실행해보세요.",
              "먼저 연락하는 쪽이 흐름을 가져가요.",
              "망설임이 길수록 타이밍이 흐려져요.",
              "거창할 필요 없이 가볍게 시작해요.",
              "방향을 정하면 마음도 따라 정리돼요.",
              "그 첫걸음이 관계를 앞으로 데려가요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-16_fri",
    "type": "single",
    "seed": 1016,
    "hook": [
      "남의 마음은 잘도 읽으면서",
      "내 마음은 왜 모른 척할까?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "",
        "file": "mcards/cups/Queen of Cups.png",
        "nameKo": "컵의 여왕",
        "nameEn": "Queen of Cups",
        "keywords": "공감 · 직관 · 깊은 감정",
        "reveal": [
          "남을 비추던 다정함을",
          "이제 나에게도 돌려요"
        ],
        "pages": [
          [
            "지금 내 마음",
            [
              "친구 표정만 봐도 무슨 일인지 알아요.",
              "상대 기분부터 살피는 게 익숙해요.",
              "그런데 내가 서운한 건 늦게 알아요.",
              "괜찮다고 넘긴 게 쌓여 있어요.",
              "내 마음을 물어본 게 언제인지 모르겠어요.",
              "가끔 이유 없이 지칠 때가 있어요."
            ]
          ],
          [
            "카드의 메시지",
            [
              "이 카드는 컵을 깊이 들여다보는 사람이에요.",
              "타고난 공감 능력을 가진 카드예요.",
              "그런데 그 시선이 늘 바깥만 향해 있어요.",
              "남의 감정은 담으면서 내 건 비워둬요.",
              "모른 척한 마음도 결국 어딘가 고여요.",
              "그 컵에 내 감정도 담을 자리가 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "오늘은 내 기분부터 물어봐 주세요.",
              "서운한 건 작게라도 말로 꺼내보세요.",
              "배려는 나를 지우는 게 아니에요.",
              "내 마음을 아는 사람이 더 깊이 사랑해요.",
              "상대도 진짜 당신을 알고 싶어해요.",
              "그 다정함을 나에게도 한 잔 따라주세요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-17_sat",
    "type": "pick",
    "seed": 1017,
    "hook": [
      "오늘 밤, 조용했던 대화창에",
      "'입력 중'이 보일까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "mcards/wands/Ace of Wands.png",
        "nameKo": "완드의 에이스",
        "nameEn": "Ace of Wands",
        "keywords": "시작 · 불씨 · 계기",
        "reveal": [
          "멈춰 있던 대화에",
          "새 불씨가 붙어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 다시 말 걸 계기를 찾고 있어요.",
              "무슨 말로 시작할지 몇 번이나 고민해요.",
              "어색하지 않은 첫 문장을 고르는 중이에요.",
              "타이밍만 맞으면 바로 보낼 준비가 돼 있어요.",
              "멈춘 대화가 아쉬운 건 상대도 같아요.",
              "작은 이유 하나면 충분히 움직여요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "대화를 다시 열 핑계를 하나 만들어보세요.",
              "사진 한 장이나 짧은 질문도 좋아요.",
              "무겁지 않게 시작하는 게 핵심이에요.",
              "답이 오면 반가움을 숨기지 마세요.",
              "불씨는 처음 몇 마디에서 살아나요.",
              "그 시작이 오늘 밤일 수도 있어요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "cards-png/devil.png",
        "nameKo": "악마",
        "nameEn": "The Devil",
        "keywords": "끌림 · 망설임 · 자존심",
        "reveal": [
          "썼다 지웠다를",
          "양쪽 다 반복하고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 당신에게 끌리고 있어요.",
              "그런데 먼저 보내는 게 자존심 상해요.",
              "메시지를 썼다가 지우기를 반복해요.",
              "당신이 먼저 오길 은근히 기다려요.",
              "신경은 쓰이는데 티 내긴 싫은 상태예요.",
              "끌림과 자존심 사이에서 줄다리기 중이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "누가 먼저인지에 너무 매이지 마세요.",
              "자존심 싸움은 둘 다 지치게 해요.",
              "가볍게 먼저 건네는 쪽이 여유 있어 보여요.",
              "다만 연달아 보내진 마세요.",
              "한 번이면 충분하고 나머진 기다려요.",
              "그 한 번이 서로의 손을 풀어줘요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Four of Pentacles.png",
        "nameKo": "펜타클의 4",
        "nameEn": "Four of Pentacles",
        "keywords": "지킴 · 신중함 · 꽉 쥔 마음",
        "reveal": [
          "할 말이 없는 게 아니라",
          "꺼내기 어려운 거예요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 마음을 꽉 쥐고 지키고 있어요.",
              "쉽게 내보였다가 잃을까 봐 두려워해요.",
              "대화창을 열어도 망설이다 닫아요.",
              "당신에게 관심이 없어서가 아니에요.",
              "확실해지기 전엔 표현을 아끼는 사람이에요.",
              "안정감이 느껴질 때 비로소 손을 풀어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "답을 재촉하면 더 꽉 움켜쥐어요.",
              "편하게 대해도 된다는 신호를 주세요.",
              "부담 없는 대화가 안정감을 만들어요.",
              "작은 약속을 지켜주면 마음이 열려요.",
              "기다림이 길어도 무관심은 아니에요.",
              "그 손이 풀리는 순간은 생각보다 가까워요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-18_sun",
    "type": "pick",
    "seed": 1018,
    "hook": [
      "다음 주, 말로만 하던 '조만간 보자'에",
      "날짜가 붙을까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/justice.png",
        "nameKo": "정의",
        "nameEn": "Justice",
        "keywords": "균형 · 진실 · 결과",
        "reveal": [
          "주 초반,",
          "흐지부지하던 말에 답이 생겨요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 그 약속을 기억하고 있어요.",
              "말만 하고 끝내는 걸 불편해하는 사람이에요.",
              "언제 지켜야 할지 계속 마음에 걸려 있어요.",
              "흐지부지 넘기면 미안할 것 같아해요.",
              "주 초반에 정리하려는 마음이 생겨요.",
              "분명한 답을 주고 싶어하는 상태예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "약속을 다시 꺼내는 건 재촉이 아니에요.",
              "가볍게 날짜를 물어보는 것도 괜찮아요.",
              "애매함이 길어지면 서로 지쳐요.",
              "솔직한 질문이 공정한 답을 불러와요.",
              "받는 만큼 주는 마음으로 대해보세요.",
              "그 균형이 다음 주를 움직여요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/wands/King of Wands.png",
        "nameKo": "완드의 킹",
        "nameEn": "King of Wands",
        "keywords": "리더십 · 비전 · 추진력",
        "reveal": [
          "주 중반,",
          "한쪽이 먼저 날을 잡아요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 계획을 실행으로 옮기는 사람이에요.",
              "말만 오가는 상태를 답답해해요.",
              "주 중반쯤 직접 날짜를 꺼낼 수 있어요.",
              "당신을 만나는 걸 진지하게 생각해요.",
              "주도권을 쥐면 생각보다 적극적이에요.",
              "그 추진력이 이번 주에 나올 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "상대가 먼저 움직이면 반갑게 받아주세요.",
              "일정을 너무 재면 기세가 꺾여요.",
              "당신이 먼저 제안해도 좋은 흐름이에요.",
              "장소 하나가 약속을 현실로 만들어요.",
              "망설임보다 설렘을 앞에 두세요.",
              "그 날짜가 생각보다 빨리 잡힐 수 있어요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/swords/Ace of Swords.png",
        "nameKo": "소드의 에이스",
        "nameEn": "Ace of Swords",
        "keywords": "명확함 · 진실 · 결단",
        "reveal": [
          "주 후반,",
          "애매하던 마음이 또렷해져요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 애매한 상태를 끝내고 싶어해요.",
              "돌려 말하던 걸 이제 솔직하게 하려 해요.",
              "주 후반쯤 마음을 분명히 표현할 수 있어요.",
              "한마디로 정리할 말을 고르고 있어요.",
              "진심을 숨기는 게 더 불편해졌어요.",
              "분명한 대답이 가까이 와 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "솔직한 말이 오가면 피하지 마세요.",
              "분명해지는 걸 두려워하지 않아도 돼요.",
              "내 마음도 짧고 명확하게 말해보세요.",
              "애매함이 걷히면 오히려 편해져요.",
              "진실은 관계를 단단하게 만들어요.",
              "그 한마디가 다음 주의 답이에요."
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
