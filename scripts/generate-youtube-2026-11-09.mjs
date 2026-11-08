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
    "date": "2026-11-09_mon",
    "type": "pick",
    "seed": 1109,
    "hook": [
      "친구들이 먼저 눈치챈 그 사람",
      "지금 속마음, 하나만 골라보세요"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/empress.png",
        "nameKo": "여황제",
        "nameEn": "The Empress",
        "keywords": "풍요 · 다정함 · 성장",
        "reveal": [
          "숨겨도 다정함이",
          "먼저 묻어나요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 당신 앞에선 편해져요.",
              "말투가 저절로 부드러워져요.",
              "당신을 챙기고 싶은 마음이 있어요.",
              "주변에서도 그 분위기를 느껴요.",
              "마음이 이미 충분히 자라 있어요.",
              "따뜻함을 숨기기 어려운 사이예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "마음을 다 숨기려 애쓰지 마세요.",
              "다정함은 꺼낼수록 빛나요.",
              "작은 배려 하나면 충분해요.",
              "좋아하는 티는 흠이 아니에요.",
              "편안한 대화부터 늘려보세요.",
              "그 온기가 그 사람에게 닿을 거예요."
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
        "keywords": "인내 · 점검 · 기다림",
        "reveal": [
          "혼자 오래 키워온",
          "마음이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 천천히 지켜보는 중이에요.",
              "서두르지 않는 성격일 수 있어요.",
              "당신을 알아가는 시간이 즐거워요.",
              "확신이 생기면 움직이는 타입이에요.",
              "관심은 꾸준히 쌓이고 있어요.",
              "겉보다 속이 훨씬 진지해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "지금까지 쌓은 마음을 돌아보세요.",
              "조급함은 내려놓아도 괜찮아요.",
              "기다린 만큼 마음은 단단해요.",
              "작은 신호를 놓치지 마세요.",
              "한 번쯤 먼저 안부를 건네보세요.",
              "수확의 때는 생각보다 가까워요."
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
        "keywords": "교감 · 연결 · 호감",
        "reveal": [
          "두 사람 사이 기류가",
          "먼저 보였어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 당신을 의식하고 있어요.",
              "눈이 마주치면 반가워해요.",
              "대화가 잘 통한다고 느껴요.",
              "주변이 먼저 알아챈 데는 이유가 있어요.",
              "마음이 한쪽에만 있지 않아요.",
              "서로를 향한 분위기가 흘러요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "둘만의 대화를 조금 늘려보세요.",
              "눈치 보며 거리를 두지 마세요.",
              "공통 관심사가 좋은 다리가 돼요.",
              "솔직한 한마디가 기류를 바꿔요.",
              "작은 약속부터 만들어보세요.",
              "그 기류가 관계로 이어질 수 있어요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-10_tue",
    "type": "pick",
    "seed": 1110,
    "hook": [
      "단톡방 말고 개인톡,",
      "그 사람이 먼저 보낼까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/temperance.png",
        "nameKo": "절제",
        "nameEn": "Temperance",
        "keywords": "균형 · 조화 · 속도",
        "reveal": [
          "천천히 둘만의 대화로",
          "옮겨오는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 속도를 맞추고 있어요.",
              "급하게 다가가는 걸 조심해요.",
              "여럿일 때의 편안함이 좋았어요.",
              "그 편안함을 둘로 옮기고 싶어요.",
              "자연스러운 계기를 찾는 중이에요.",
              "대화가 이어질 준비가 돼 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "단톡방 대화를 소중히 이어가세요.",
              "작은 반응이 다리가 돼요.",
              "재촉하지 않는 게 이 카드의 힘이에요.",
              "먼저 짧게 건네봐도 괜찮아요.",
              "대화의 온도를 천천히 올려보세요.",
              "자연스러운 이어짐이 오래 가요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/cups/Seven of Cups.png",
        "nameKo": "컵의 7",
        "nameEn": "Seven of Cups",
        "keywords": "상상 · 선택 · 망설임",
        "reveal": [
          "보낼 말을 여러 번",
          "고르는 중이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 머릿속엔 선택지가 많아요.",
              "무슨 말로 시작할지 고민해요.",
              "상상 속에선 이미 말을 걸었어요.",
              "마음이 없어서 늦는 게 아니에요.",
              "어색해질까 봐 망설이고 있어요.",
              "당신의 반응이 궁금한 상태예요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 사람이 고르기 쉽게 해주세요.",
              "편하게 말 걸 틈을 열어두세요.",
              "질문 하나가 좋은 시작이 돼요.",
              "너무 많은 걸 상상하진 마세요.",
              "현실의 대화가 더 선명해요.",
              "작은 계기가 선택을 도와줘요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/swords/Nine of Swords.png",
        "nameKo": "소드의 9",
        "nameEn": "Nine of Swords",
        "keywords": "걱정 · 불안 · 밤의 고민",
        "reveal": [
          "보냈다 어색해질까",
          "걱정하는 마음이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 밤에 생각이 많아요.",
              "거절당할까 봐 조심스러워요.",
              "관계가 깨질까 봐 걱정해요.",
              "그만큼 이 사이를 아끼고 있어요.",
              "혼자 시나리오를 그려보고 있어요.",
              "용기를 낼 신호를 기다려요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 걱정을 덜어줄 수 있어요.",
              "가벼운 한마디가 큰 힘이 돼요.",
              "답장을 편하게 받아주세요.",
              "부담 없는 주제부터 꺼내보세요.",
              "불안은 대화로 풀려요.",
              "먼저 건넨 인사가 문을 열어요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-12_thu",
    "type": "pick",
    "seed": 1112,
    "hook": [
      "내년 이맘때도 옆에 있었으면,",
      "그 사람 속마음 골라보세요"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/emperor.png",
        "nameKo": "황제",
        "nameEn": "The Emperor",
        "keywords": "안정 · 책임 · 결심",
        "reveal": [
          "오래 지키고 싶은",
          "결심이 섰어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 이 관계를 진지하게 봐요.",
              "가볍게 만나는 사이가 아니에요.",
              "지켜주고 싶은 책임감이 있어요.",
              "말보다 행동으로 보여주는 편이에요.",
              "미래를 계획에 넣고 있어요.",
              "흔들리지 않는 마음이 생겼어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "약속을 지키는 모습을 보여주세요.",
              "신뢰는 작은 행동에서 쌓여요.",
              "서로의 기준을 이야기해보세요.",
              "단단한 기반이 오래 가게 해요.",
              "표현이 서툴러도 기다려주세요.",
              "함께 그리는 내년이 현실이 돼요."
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
        "keywords": "판단 · 명료 · 솔직함",
        "reveal": [
          "마음은 깊지만",
          "차분히 따져봐요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 감정보다 판단이 앞서요.",
              "오래 갈 수 있을지 생각해요.",
              "냉정해 보여도 진지한 거예요.",
              "애매한 걸 싫어하는 편이에요.",
              "솔직한 대화를 원하고 있어요.",
              "확신이 서면 흔들리지 않아요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "돌려 말하기보다 솔직하게 말해요.",
              "대화 한 번이 걱정을 정리해줘요.",
              "감정을 차분히 설명해보세요.",
              "서로의 생각을 확인하는 시간이에요.",
              "신중함은 진심의 다른 얼굴이에요.",
              "명확한 말이 관계를 단단하게 해요."
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
        "keywords": "소유 · 지킴 · 안정 욕구",
        "reveal": [
          "놓치고 싶지 않아",
          "꼭 쥐고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 이 관계를 아껴요.",
              "잃을까 봐 조심스러워져요.",
              "변화보다 지금이 좋다고 느껴요.",
              "마음을 쉽게 드러내지 않아요.",
              "지키려는 마음이 커진 상태예요.",
              "당신을 소중한 사람으로 여겨요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "너무 꽉 쥐지 않아도 괜찮아요.",
              "손에 힘을 조금 풀어보세요.",
              "편안함이 오래 머물게 해요.",
              "서로의 여유를 존중해주세요.",
              "불안보다 믿음을 키워보세요.",
              "느슨한 손이 더 오래 잡아요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-14_sat",
    "type": "pick",
    "seed": 1114,
    "hook": [
      "주말에 도착한 기프티콘,",
      "그 사람 마음은 어디쯤일까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/moon.png",
        "nameKo": "달",
        "nameEn": "The Moon",
        "keywords": "불확실 · 직감 · 망설임",
        "reveal": [
          "보낼까 말까",
          "마음이 흔들려요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 마음은 아직 흐릿해요.",
              "생각이 이리저리 흔들리고 있어요.",
              "겉으론 조용해도 당신을 떠올려요.",
              "확신이 없어 망설이는 중이에요.",
              "표현이 서툰 시기일 수 있어요.",
              "속마음은 겉보다 깊어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "신호를 서둘러 해석하지 마세요.",
              "흐름을 차분히 지켜보세요.",
              "불안한 상상은 잠시 내려놓아요.",
              "직감이 말하는 걸 믿어보세요.",
              "시간이 안개를 걷어줄 거예요.",
              "선명해지는 순간이 와요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/wands/Ace of Wands.png",
        "nameKo": "완드의 에이스",
        "nameEn": "Ace of Wands",
        "keywords": "시작 · 열정 · 충동",
        "reveal": [
          "마음이 먼저",
          "손이 움직여요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람에게 불씨가 생겼어요.",
              "갑자기 당신이 떠오르는 순간이 있어요.",
              "뭔가 해주고 싶은 마음이 들어요.",
              "이유보다 마음이 먼저 움직여요.",
              "작은 선물로 표현하고 싶어해요.",
              "새로운 시작을 느끼고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 마음에 반갑게 반응해주세요.",
              "고맙다는 말에 온기를 담아요.",
              "작은 불씨도 반응을 먹고 자라요.",
              "답례로 가볍게 이어가 보세요.",
              "타이밍을 놓치지 마세요.",
              "시작은 늘 이렇게 작아요."
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
        "keywords": "조심 · 우회 · 탐색",
        "reveal": [
          "슬쩍 건네며",
          "반응을 살펴요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 조심스럽게 다가와요.",
              "마음을 다 드러내긴 이르다고 봐요.",
              "티 안 나는 신호를 보내요.",
              "당신의 반응을 살피는 중이에요.",
              "직접 말하긴 아직 부끄러워요.",
              "작은 행동에 마음을 담았어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "그 신호를 알아봐주세요.",
              "알아챈 티를 살짝 내보세요.",
              "부담 주지 않는 반응이 좋아요.",
              "돌려 말한 마음을 존중해주세요.",
              "천천히 거리를 좁혀가요.",
              "숨긴 마음도 결국 드러나요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-15_sun",
    "type": "pick",
    "seed": 1115,
    "hook": [
      "다음 주, 그 사람 달력에",
      "내 이름이 적힐까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/strength.png",
        "nameKo": "힘",
        "nameEn": "Strength",
        "keywords": "용기 · 인내 · 내면의 힘",
        "reveal": [
          "서두르지 않는 마음이",
          "약속을 불러와요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신 곁이 편안해요.",
              "재촉하지 않는 태도가 고마워요.",
              "함께할 시간을 만들고 싶어해요.",
              "부드러운 인내가 마음을 열었어요.",
              "주 초반에 연락이 올 수 있어요.",
              "편안함이 약속으로 이어져요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "지금처럼 여유를 지켜주세요.",
              "재촉보다 기다림이 힘이 돼요.",
              "약속이 오면 반갑게 받아주세요.",
              "부드러운 말투가 관계를 키워요.",
              "당신의 침착함이 매력이에요.",
              "그 약속이 좋은 하루가 될 거예요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "cards-png/wheel-of-fortune.png",
        "nameKo": "운명의 수레바퀴",
        "nameEn": "Wheel of Fortune",
        "keywords": "변화 · 흐름 · 전환",
        "reveal": [
          "미뤄지던 날짜가",
          "갑자기 정해져요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 일정에 변화가 생겨요.",
              "미뤄둔 만남을 다시 떠올려요.",
              "흐름이 바뀌는 시기예요.",
              "생각보다 빠르게 연락할 수 있어요.",
              "기회를 놓치고 싶지 않아해요.",
              "주 중반이 전환점이 될 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "기회가 오면 망설이지 마세요.",
              "일정에 조금 여유를 두세요.",
              "변화를 반갑게 맞아보세요.",
              "흐름에 몸을 맡겨도 괜찮아요.",
              "작은 우연을 놓치지 마세요.",
              "바퀴는 좋은 쪽으로 돌고 있어요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "cards-png/hanged-man.png",
        "nameKo": "매달린 사람",
        "nameEn": "The Hanged Man",
        "keywords": "기다림 · 정지 · 관점",
        "reveal": [
          "멈춘 계획이",
          "다른 날로 잡혀요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 잠시 멈춰 생각 중이에요.",
              "마음이 식은 게 아니에요.",
              "다른 각도로 관계를 보고 있어요.",
              "타이밍을 다시 고르는 중이에요.",
              "주 후반에 새 날짜를 말할 수 있어요.",
              "기다림 끝에 더 진지해져요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "미뤄진다고 끝이 아니에요.",
              "기다리는 동안 마음을 정리해요.",
              "조급함을 잠시 내려놓으세요.",
              "다른 관점에서 관계를 봐요.",
              "여유가 더 좋은 날을 불러와요.",
              "새로 잡힌 날이 더 의미 있어요."
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
