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
    "date": "2026-11-02_mon",
    "type": "pick",
    "seed": 1102,
    "hook": [
      "검색창 맨 위의 그 사람",
      "지금 속마음, 하나만 골라보세요"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/fool.png",
        "nameKo": "바보",
        "nameEn": "The Fool",
        "keywords": "시작 · 자유 · 설렘",
        "reveal": [
          "이유를 따지기 전에",
          "마음이 먼저 가요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 당신이 자꾸 궁금해요.",
              "왜 그런지 설명은 잘 못 해요.",
              "생각보다 가볍게 다가오고 싶어해요.",
              "계산 없이 웃게 되는 사이예요.",
              "새로운 시작을 상상해본 적 있어요.",
              "마음이 먼저 한 걸음 나와 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "너무 무겁게 생각하지 않아도 돼요.",
              "가벼운 말 한마디로 시작해보세요.",
              "설렘은 숨길수록 커지기만 해요.",
              "완벽한 타이밍을 기다리지 마세요.",
              "실수해도 괜찮은 흐름이에요.",
              "첫걸음이 생각보다 큰 문이 돼요."
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
        "keywords": "안정 · 유대 · 지속",
        "reveal": [
          "오래 곁에 두고 싶은",
          "사람이 됐어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신을 진지하게 봐요.",
              "잠깐의 호기심이 아니에요.",
              "당신의 일상이 궁금해지고 있어요.",
              "주변 사람들 얘기도 듣고 싶어해요.",
              "오래 가는 관계를 그려보고 있어요.",
              "서두르지 않을 뿐 마음은 깊어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "천천히 쌓아가는 게 잘 맞아요.",
              "작은 약속을 꾸준히 지켜보세요.",
              "일상을 조금씩 나눠보세요.",
              "신뢰가 이 관계의 힘이에요.",
              "조급해하지 않아도 괜찮아요.",
              "단단한 마음은 쉽게 흔들리지 않아요."
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
        "keywords": "망설임 · 균형 · 보류",
        "reveal": [
          "다가갈지 말지",
          "아직 정하지 못했어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 마음이 반반이에요.",
              "다가가고 싶다가도 멈칫해요.",
              "상처받을까 조심하고 있어요.",
              "눈을 감고 저울질하는 중이에요.",
              "결정을 조금 미뤄두고 있어요.",
              "그래도 마음은 한쪽으로 기울어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "재촉하면 더 닫힐 수 있어요.",
              "편하게 말할 틈을 만들어주세요.",
              "내 마음도 정리해두면 좋아요.",
              "결정은 생각보다 빨리 와요.",
              "작은 신호를 놓치지 마세요.",
              "균형이 깨지는 순간을 기다려요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-03_tue",
    "type": "pick",
    "seed": 1103,
    "hook": [
      "저녁 일곱 시쯤,",
      "그 사람 카톡이 먼저 울릴까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/magician.png",
        "nameKo": "마법사",
        "nameEn": "The Magician",
        "keywords": "의지 · 실행 · 기회",
        "reveal": [
          "말을 걸 계기를",
          "스스로 만들어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 연락할 핑계를 찾았어요.",
              "첫마디도 이미 생각해뒀어요.",
              "생각만 하던 걸 옮기려는 중이에요.",
              "타이밍을 직접 만들고 싶어해요.",
              "당신 반응을 기대하고 있어요.",
              "곧 손이 먼저 움직일 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "답장할 여유를 남겨두세요.",
              "반가운 마음은 솔직하게 보여주세요.",
              "대화를 이어갈 질문 하나면 충분해요.",
              "내가 먼저 열어도 괜찮은 흐름이에요.",
              "지금은 행동이 답이 되는 때예요.",
              "가볍게 받아도 마음은 전해져요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/cups/Five of Cups.png",
        "nameKo": "컵의 5",
        "nameEn": "Five of Cups",
        "keywords": "아쉬움 · 미련 · 회복",
        "reveal": [
          "아직 지난 마음을",
          "돌아보는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 아쉬운 일을 곱씹어요.",
              "연락이 늦은 건 마음 정리 때문이에요.",
              "마음이 없어서가 아니에요.",
              "남아 있는 마음도 분명히 있어요.",
              "조금만 돌아보면 보일 거예요.",
              "정리가 끝나면 다시 다가와요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "재촉보다 기다림이 나은 때예요.",
              "내 하루를 먼저 챙겨주세요.",
              "가벼운 안부 정도는 괜찮아요.",
              "지난 일은 길게 꺼내지 마세요.",
              "남은 잔에 마음을 둬보세요.",
              "돌아보는 시간은 생각보다 짧아요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Eight of Pentacles.png",
        "nameKo": "펜타클의 8",
        "nameEn": "Eight of Pentacles",
        "keywords": "몰입 · 성실 · 꾸준함",
        "reveal": [
          "바쁜 하루가 끝나야",
          "연락이 와요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 지금 일에 몰두해 있어요.",
              "연락이 늦어도 잊은 건 아니에요.",
              "하루를 마치고 당신을 떠올려요.",
              "짧아도 진심을 담고 싶어해요.",
              "꾸준한 연락이 그 사람 방식이에요.",
              "저녁 무렵 마음이 여유로워져요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "바쁜 시기를 이해해주세요.",
              "짧은 답에도 의미를 찾아보세요.",
              "내 일상도 충실하게 보내요.",
              "꾸준함이 깊은 신뢰를 만들어요.",
              "급하게 결론 내리지 마세요.",
              "천천히 자라는 마음도 소중해요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-05_thu",
    "type": "pick",
    "seed": 1105,
    "hook": [
      "심장이 먼저",
      "알아보는 그 사람"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/hierophant.png",
        "nameKo": "교황",
        "nameEn": "The Hierophant",
        "keywords": "신뢰 · 약속 · 안정",
        "reveal": [
          "설렘이 믿음으로",
          "자리 잡고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신을 믿고 있어요.",
              "가볍게 지나갈 마음이 아니에요.",
              "함께 있으면 편안하다고 느껴요.",
              "진지한 관계를 생각하고 있어요.",
              "천천히 다가가려고 조심해요.",
              "약속을 지키는 사람이 되고 싶어해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "차근차근 쌓아가는 게 좋아요.",
              "작은 약속부터 함께 만들어보세요.",
              "서로의 기준을 이야기해보세요.",
              "믿음은 시간이 키워줘요.",
              "급하게 확인하지 않아도 돼요.",
              "안정감이 이 관계의 힘이에요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/cups/Ten of Cups.png",
        "nameKo": "컵의 10",
        "nameEn": "Ten of Cups",
        "keywords": "행복 · 화합 · 따뜻함",
        "reveal": [
          "함께 있는 장면이",
          "따뜻하게 그려져요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 당신과 있으면 편해요.",
              "같이 있는 미래를 그려봤어요.",
              "설렘 너머 안정감을 느껴요.",
              "당신 웃음을 오래 보고 싶어해요.",
              "마음이 진심이라 더 조심스러워요.",
              "따뜻한 쪽으로 마음이 흘러가요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 마음을 의심하지 않아도 돼요.",
              "편안함을 자주 표현해보세요.",
              "함께하는 시간을 늘려보세요.",
              "작은 행복을 같이 나눠보세요.",
              "지금 감정은 믿어도 좋아요.",
              "따뜻한 그림은 현실이 될 수 있어요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/swords/Queen of Swords.png",
        "nameKo": "소드의 여왕",
        "nameEn": "Queen of Swords",
        "keywords": "명확함 · 판단 · 신중",
        "reveal": [
          "마음은 움직였지만",
          "한 번 더 확인해요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 마음은 이미 반응했어요.",
              "그래도 머리로 확인하고 싶어해요.",
              "당신 말과 행동을 살피는 중이에요.",
              "쉽게 흔들리고 싶지 않아해요.",
              "확신이 서면 솔직하게 말해요.",
              "신중한 만큼 진지한 마음이에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "말과 행동을 일관되게 보여주세요.",
              "솔직함이 가장 큰 신뢰가 돼요.",
              "애매한 표현은 줄여보세요.",
              "확인할 시간을 존중해주세요.",
              "내 마음도 분명히 해두면 좋아요.",
              "명확한 대화가 길을 열어줘요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-07_sat",
    "type": "pick",
    "seed": 1107,
    "hook": [
      "토요일 오후, 그 사람에게",
      "이모티콘이 날아올까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/hermit.png",
        "nameKo": "은둔자",
        "nameEn": "The Hermit",
        "keywords": "성찰 · 고요 · 내면",
        "reveal": [
          "혼자 있는 시간에",
          "당신을 떠올려요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 혼자 생각을 정리해요.",
              "연락이 뜸해도 마음은 있어요.",
              "조용한 시간에 당신이 떠올라요.",
              "말을 고르고 또 고르는 중이에요.",
              "가볍게 보내기가 조심스러워요.",
              "생각 끝에 솔직한 말이 나와요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "조용한 시간을 존중해주세요.",
              "재촉하면 더 멀어질 수 있어요.",
              "나도 내 시간을 즐겨보세요.",
              "짧은 연락에도 마음이 담겨요.",
              "고요한 뒤에 대화가 깊어져요.",
              "천천히 오는 답을 기다려봐요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "cards-png/justice.png",
        "nameKo": "정의",
        "nameEn": "Justice",
        "keywords": "균형 · 공정 · 결정",
        "reveal": [
          "이번엔 자기 차례라고",
          "느끼고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 균형을 맞추고 싶어요.",
              "받은 만큼 돌려주고 싶어해요.",
              "당신이 먼저 건넨 걸 기억해요.",
              "이번엔 자기 차례라고 생각해요.",
              "마음의 무게가 비슷해지고 있어요.",
              "공평한 관계를 원하고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "주고받는 흐름을 믿어보세요.",
              "혼자 너무 애쓰지 않아도 돼요.",
              "받는 연습도 해보세요.",
              "솔직한 대화가 균형을 잡아줘요.",
              "무리한 기대는 내려놓아요.",
              "공정한 마음이 오래 가요."
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
        "keywords": "나눔 · 관심 · 배려",
        "reveal": [
          "작은 관심을",
          "먼저 건네고 싶어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신을 챙기고 싶어해요.",
              "용건 없이도 안부가 궁금해요.",
              "작은 것이라도 나누고 싶어해요.",
              "당신 반응이 기분 좋아요.",
              "이유 없는 연락이 마음의 표현이에요.",
              "가까워지고 싶은 신호예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "작은 관심에 반갑게 답해주세요.",
              "고맙다는 말을 아끼지 마세요.",
              "나도 가볍게 챙겨보세요.",
              "주고받는 기쁨을 즐겨보세요.",
              "사소한 연락도 소중히 여겨요.",
              "작은 선물이 큰 대화로 번져요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-08_sun",
    "type": "pick",
    "seed": 1108,
    "hook": [
      "다음 주, 미뤄둔 그 말",
      "누가 먼저 꺼낼까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/world.png",
        "nameKo": "세계",
        "nameEn": "The World",
        "keywords": "완성 · 결실 · 하나됨",
        "reveal": [
          "오래 맴돌던 이야기가",
          "매듭지어져요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 이야기를 정리하고 싶어요.",
              "미뤄둔 말이 자꾸 떠올라요.",
              "자연스러운 순간을 기다려왔어요.",
              "한 단계 나아가고 싶어해요.",
              "당신과의 흐름을 소중히 여겨요.",
              "다음 주 초반 말이 나올 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "대화의 자리를 편하게 만들어주세요.",
              "결론을 서두르지 않아도 돼요.",
              "지금까지의 시간을 믿어보세요.",
              "정리는 새로운 시작이기도 해요.",
              "솔직한 말에 솔직하게 답해요.",
              "한 장이 끝나면 다음 장이 열려요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/wands/Queen of Wands.png",
        "nameKo": "완드의 여왕",
        "nameEn": "Queen of Wands",
        "keywords": "자신감 · 매력 · 따뜻함",
        "reveal": [
          "웃으며 건넨 한마디가",
          "분위기를 바꿔요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신의 밝음에 끌려요.",
              "당신이 먼저 말해주길 바라요.",
              "웃는 모습에 마음이 풀려요.",
              "따뜻한 말투를 오래 기억해요.",
              "용기 있는 모습이 매력적이에요.",
              "다음 주 중반 분위기가 바뀌어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "먼저 꺼내는 쪽이 나여도 괜찮아요.",
              "자신감 있게 웃어보세요.",
              "가볍고 따뜻하게 말해보세요.",
              "당신의 에너지가 길을 열어요.",
              "망설임보다 용기가 어울려요.",
              "한마디가 생각보다 큰 힘이 돼요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Page of Pentacles.png",
        "nameKo": "펜타클의 페이지",
        "nameEn": "Page of Pentacles",
        "keywords": "시작 · 성실 · 진지한 관심",
        "reveal": [
          "작지만 진지한 제안이",
          "조용히 도착해요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 천천히 말을 준비했어요.",
              "가볍게 던질 말이 아니라서요.",
              "당신에게 진지한 관심이 있어요.",
              "작은 제안부터 꺼내보려 해요.",
              "화려하진 않아도 진심이에요.",
              "다음 주 후반 신호가 올 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "작은 제안도 반갑게 받아주세요.",
              "진심은 크기보다 꾸준함이에요.",
              "천천히 자라는 마음을 믿어요.",
              "구체적인 약속으로 이어가보세요.",
              "서두르지 않아도 괜찮아요.",
              "작은 시작이 단단한 관계가 돼요."
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
