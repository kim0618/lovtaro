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
    "date": "2026-10-19_mon",
    "type": "pick",
    "seed": 1019,
    "hook": [
      "찬 바람 불면 더 보고 싶은 사람",
      "그 사람 속마음, 하나만 골라보세요"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "mcards/pentacles/Queen of Pentacles.png",
        "nameKo": "펜타클의 여왕",
        "nameEn": "Queen of Pentacles",
        "keywords": "돌봄 · 안정 · 따뜻함",
        "reveal": [
          "보고 싶은 마음이",
          "챙겨주고 싶은 마음이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 당신을 편한 사람으로 느껴요.",
              "함께 있으면 마음이 놓인다고 생각해요.",
              "추워지면 당신 안부가 먼저 떠올라요.",
              "표현은 적어도 신경은 쓰고 있어요.",
              "당신이 잘 지내는지 은근히 살펴요.",
              "오래 곁에 두고 싶은 사람이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "보고 싶다면 따뜻한 안부부터 건네세요.",
              "거창한 말보다 작은 챙김이 닿아요.",
              "\"따뜻하게 입고 다녀\" 한마디면 충분해요.",
              "당신의 다정함은 이미 전해지고 있어요.",
              "조급해하지 않아도 관계는 자라요.",
              "그 온기가 둘 사이를 데워줄 거예요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "cards-png/hanged-man.png",
        "nameKo": "매달린 사람",
        "nameEn": "The Hanged Man",
        "keywords": "기다림 · 멈춤 · 관점",
        "reveal": [
          "멈춰 있는 지금도",
          "의미 있는 시간이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 쉽게 움직이지 못하고 있어요.",
              "다가가면 지금이 깨질까 망설여요.",
              "마음이 없는 게 아니라 조심스러운 거예요.",
              "생각보다 이 관계를 오래 고민해요.",
              "당신의 반응을 조용히 지켜보고 있어요.",
              "결정을 미루는 것도 그 사람의 진심이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "지금은 한 발 떨어져 보는 때예요.",
              "연락을 재촉하지 않아도 괜찮아요.",
              "보고 싶은 마음을 일기처럼 적어보세요.",
              "멀리서 보면 관계가 다르게 보여요.",
              "기다림이 지칠 땐 내 하루를 채우세요.",
              "멈춤 끝에 더 선명한 답이 와요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/swords/Knight of Swords.png",
        "nameKo": "소드의 나이트",
        "nameEn": "Knight of Swords",
        "keywords": "속도 · 직진 · 솔직함",
        "reveal": [
          "참아온 말이",
          "빠르게 달려올 수 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 마음도 생각보다 빨라요.",
              "한 번 정하면 곧장 움직이는 사람이에요.",
              "보고 싶다는 말을 참고 있을 수 있어요.",
              "타이밍만 오면 먼저 연락할 수 있어요.",
              "솔직한 대화를 원하고 있어요.",
              "돌려 말하는 것보다 직진을 좋아해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "보고 싶다면 짧고 솔직하게 말하세요.",
              "길게 설명할수록 마음이 흐려져요.",
              "다만 말의 온도는 한 번 살펴보세요.",
              "급한 말은 오해를 남기기 쉬워요.",
              "부드러운 직진이 가장 잘 닿아요.",
              "그 한마디가 흐름을 바꿀 수 있어요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-20_tue",
    "type": "pick",
    "seed": 1020,
    "hook": [
      "금요일까지, 내 게시물에",
      "그 사람 좋아요가 눌릴까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "mcards/cups/Three of Cups.png",
        "nameKo": "컵의 3",
        "nameEn": "Three of Cups",
        "keywords": "즐거움 · 우정 · 축하",
        "reveal": [
          "가벼운 반응이",
          "대화의 시작이 돼요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신 일상을 즐겁게 봐요.",
              "올라오는 게시물을 챙겨 보고 있어요.",
              "부담 없는 사이로 지내고 싶어 해요.",
              "같이 웃을 일을 기다리고 있어요.",
              "좋아요는 가벼워도 관심은 진짜예요.",
              "편한 분위기에서 마음이 열려요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "게시물은 평소처럼 즐겁게 올리세요.",
              "잘 보이려 애쓰지 않아도 돼요.",
              "반응이 오면 가볍게 답해보세요.",
              "웃음이 오가면 대화가 길어져요.",
              "무거운 확인은 잠시 미뤄두세요.",
              "즐거운 흐름이 둘을 가깝게 해요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "cards-png/judgement.png",
        "nameKo": "심판",
        "nameEn": "Judgement",
        "keywords": "각성 · 재평가 · 부름",
        "reveal": [
          "조용하던 반응이",
          "다시 깨어날 수 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람이 다시 당신을 돌아보고 있어요.",
              "한동안 놓쳤던 마음을 떠올려요.",
              "당신 소식에 생각이 많아지는 시기예요.",
              "예전과 다른 눈으로 보고 있어요.",
              "작은 반응에도 의미를 담을 수 있어요.",
              "다시 연결될 계기를 찾고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "작은 알림 하나를 신호로 받아들여도 돼요.",
              "그렇다고 너무 크게 해석하진 마세요.",
              "지금의 나를 보여주는 게 중요해요.",
              "예전보다 단단해진 모습이 닿아요.",
              "부름이 오면 반갑게 응답하세요.",
              "새로운 시작은 거기서 열려요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Two of Pentacles.png",
        "nameKo": "펜타클의 2",
        "nameEn": "Two of Pentacles",
        "keywords": "균형 · 분주함 · 저울질",
        "reveal": [
          "반응이 늦어도",
          "마음이 없는 건 아니에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 요즘 정신없이 바빠요.",
              "이것저것 챙기느라 여유가 없어요.",
              "당신 게시물을 놓친 게 아닐 수 있어요.",
              "한숨 돌릴 때 몰아서 볼 수도 있어요.",
              "마음과 생활 사이에서 균형을 잡는 중이에요.",
              "바쁜 와중에도 당신을 떠올려요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "반응 속도로 마음을 재지 마세요.",
              "바쁜 사람에겐 기다림이 배려예요.",
              "가볍게 볼 수 있는 게시물이 좋아요.",
              "부담을 주는 메시지는 피하세요.",
              "여유가 생기면 반응도 돌아와요.",
              "그 타이밍을 편하게 기다려보세요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-22_thu",
    "type": "pick",
    "seed": 1022,
    "hook": [
      "웃는 얼굴 한 번에",
      "서운함이 녹는 사람이 있다면"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "mcards/pentacles/Ace of Pentacles.png",
        "nameKo": "펜타클의 에이스",
        "nameEn": "Ace of Pentacles",
        "keywords": "시작 · 안정 · 기회",
        "reveal": [
          "쉽게 풀리는 서운함은",
          "단단한 신뢰의 증거예요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 이 관계를 소중히 여겨요.",
              "오래 갈 사이라고 느끼고 있어요.",
              "당신이 서운해하면 마음이 쓰여요.",
              "말보다 행동으로 풀고 싶어 해요.",
              "작은 약속을 지키려고 애써요.",
              "천천히 쌓아가는 관계를 원해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "서운함이 녹았다면 그걸로 충분해요.",
              "풀린 마음을 다시 꺼내지 않아도 돼요.",
              "작은 다정함을 자주 나눠보세요.",
              "관계는 매일의 습관으로 자라요.",
              "확실한 것부터 하나씩 쌓아가세요.",
              "그 씨앗이 큰 안정이 될 거예요."
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
        "keywords": "휴식 · 회복 · 숨 고르기",
        "reveal": [
          "녹은 것처럼 보여도",
          "마음은 쉬고 싶어 해요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 다툼이 싫은 사람이에요.",
              "웃음으로 분위기를 넘기려 해요.",
              "속으로는 지쳐 있을 수 있어요.",
              "혼자 정리할 시간이 필요해요.",
              "당신을 피하는 게 아니에요.",
              "쉬고 나면 더 편하게 다가와요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "웃음으로 덮은 감정을 살펴보세요.",
              "쌓인 서운함은 조용히 남아요.",
              "잠깐 거리를 두는 것도 괜찮아요.",
              "쉬는 시간이 관계를 지켜줘요.",
              "편할 때 짧게 마음을 말해보세요.",
              "숨 고른 뒤의 대화가 더 깊어요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "cards-png/high-priestess.png",
        "nameKo": "여사제",
        "nameEn": "The High Priestess",
        "keywords": "직관 · 침묵 · 내면",
        "reveal": [
          "말보다 표정으로",
          "마음을 전하는 사람이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 마음을 쉽게 말하지 않아요.",
              "대신 표정과 눈빛에 다 담겨 있어요.",
              "당신이 알아채주길 바라고 있어요.",
              "조용하지만 깊게 생각하는 사람이에요.",
              "웃음 뒤에 진심이 숨어 있어요.",
              "믿을 수 있는 사람에게만 열려요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "당신의 직감을 믿어도 돼요.",
              "이미 그 사람 마음을 느끼고 있어요.",
              "말로 다 확인하려 하지 마세요.",
              "조용한 시간을 함께 즐겨보세요.",
              "편안함이 마음을 열게 해요.",
              "그 진심은 천천히 말이 될 거예요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-24_sat",
    "type": "pick",
    "seed": 1024,
    "hook": [
      "불 끄기 전에, 그 사람한테서",
      "'뭐 해?'가 올까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "mcards/wands/Ten of Wands.png",
        "nameKo": "완드의 10",
        "nameEn": "Ten of Wands",
        "keywords": "부담 · 책임 · 지침",
        "reveal": [
          "연락이 없는 건",
          "여유가 없어서일 수 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 하루를 버티느라 지쳐 있어요.",
              "해야 할 일이 어깨에 가득해요.",
              "연락할 마음은 있는데 힘이 없어요.",
              "당신에게 지친 모습을 보이기 싫어해요.",
              "짐을 내려놓으면 당신이 떠올라요.",
              "쉬고 싶은 곳이 당신일 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "먼저 가볍게 하루를 물어봐도 좋아요.",
              "답을 재촉하는 말은 피하세요.",
              "\"오늘도 수고했어\"가 큰 힘이 돼요.",
              "답이 늦어도 서운해하지 마세요.",
              "편하게 기대도 된다는 신호를 주세요.",
              "그 편안함이 연락을 불러와요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/pentacles/King of Pentacles.png",
        "nameKo": "펜타클의 킹",
        "nameEn": "King of Pentacles",
        "keywords": "책임감 · 안정 · 실속",
        "reveal": [
          "가벼운 말보다",
          "확실한 행동을 고르는 사람"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 말보다 행동이 먼저예요.",
              "의미 없는 연락은 잘 안 해요.",
              "대신 만남이나 약속으로 마음을 보여요.",
              "당신을 진지하게 생각하고 있어요.",
              "믿음직한 사람이 되고 싶어 해요.",
              "표현은 적어도 책임감은 커요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "연락 횟수로 마음을 재지 마세요.",
              "그 사람이 지킨 약속을 떠올려보세요.",
              "행동에 담긴 마음이 진짜예요.",
              "구체적인 약속을 제안해봐도 좋아요.",
              "당신도 꾸준함으로 답해주세요.",
              "그게 이 관계를 단단하게 해요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "cards-png/death.png",
        "nameKo": "죽음",
        "nameEn": "Death",
        "keywords": "끝 · 변환 · 새 시작",
        "reveal": [
          "끝처럼 보이는 것이",
          "새로운 시작일 수 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 관계의 변화를 느껴요.",
              "예전 방식으로는 안 된다고 생각해요.",
              "조용했던 시간을 정리하고 있어요.",
              "새로운 리듬을 찾고 있어요.",
              "당신과 다르게 다가가고 싶어 해요.",
              "변화가 두렵지만 원하고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "예전 연락 패턴에 매달리지 마세요.",
              "달라진 흐름을 자연스럽게 받아들이세요.",
              "끝난 것은 놓아줘야 새것이 와요.",
              "새로운 대화 방식을 시도해보세요.",
              "변화는 관계가 자라는 신호예요.",
              "그 다음 장이 곧 열릴 거예요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-10-25_sun",
    "type": "pick",
    "seed": 1025,
    "hook": [
      "다음 주, 지키던 존댓말이",
      "반말로 풀릴까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/empress.png",
        "nameKo": "여황제",
        "nameEn": "The Empress",
        "keywords": "풍요 · 사랑 · 돌봄",
        "reveal": [
          "주 초반,",
          "다정한 말투가 먼저 와요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 더 편해지고 싶어 해요.",
              "당신을 챙기고 싶은 마음이 커요.",
              "말끝에서 다정함이 묻어나기 시작해요.",
              "거리를 좁힐 계기를 찾고 있어요.",
              "당신과 있으면 마음이 놓여요.",
              "따뜻한 관계를 꿈꾸고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "다정함에는 다정함으로 답하세요.",
              "편해지는 속도를 억지로 당기지 마세요.",
              "자연스럽게 가까워지는 게 좋아요.",
              "작은 칭찬과 챙김을 나눠보세요.",
              "말투가 풀리면 마음도 풀려요.",
              "그 첫 반말은 곧 찾아올 거예요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/cups/Nine of Cups.png",
        "nameKo": "컵의 9",
        "nameEn": "Nine of Cups",
        "keywords": "만족 · 소원 · 기쁨",
        "reveal": [
          "주 중반,",
          "대화에 웃음이 늘어나요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신과의 대화가 즐거워요.",
              "바라던 분위기가 오고 있다고 느껴요.",
              "당신 앞에서 더 자주 웃어요.",
              "편해진 지금이 좋다고 생각해요.",
              "조금 더 가까워지길 바라고 있어요.",
              "작은 소원이 이뤄지는 기분이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "즐거운 대화를 마음껏 누리세요.",
              "웃음이 많아질수록 거리가 좁혀져요.",
              "바라던 걸 조금씩 말해봐도 좋아요.",
              "지금 흐름은 당신 편이에요.",
              "좋은 순간을 함께 기억해두세요.",
              "그 웃음이 다음 단계를 열어요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Knight of Pentacles.png",
        "nameKo": "펜타클의 나이트",
        "nameEn": "Knight of Pentacles",
        "keywords": "꾸준함 · 성실 · 신뢰",
        "reveal": [
          "주 후반,",
          "거리가 한 칸 좁혀져요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 천천히 다가오는 사람이에요.",
              "급하게 말을 놓지 않아요.",
              "대신 꾸준히 연락하고 있어요.",
              "믿음이 쌓여야 마음을 열어요.",
              "당신을 가볍게 생각하지 않아요.",
              "느려도 확실하게 가고 싶어 해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "속도가 느려도 불안해하지 마세요.",
              "꾸준함이 가장 큰 신호예요.",
              "당신도 한결같이 답해주세요.",
              "천천히 쌓인 관계는 쉽게 안 무너져요.",
              "작은 변화를 알아봐주세요.",
              "그 한 칸이 큰 걸음이 될 거예요."
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
