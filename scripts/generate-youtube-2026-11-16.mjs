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
  wed: { arrange: 'vee', textY: 330, moon: 'right', guideY: 1720 },  // 2026-11-18~ 수요일 pick(3장), 역삼각형(일요일 삼각형의 반대)
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
    case 'vee':
      return { scale: 2.1, slots: [[320, 820, -8], [760, 820, 8], [540, 1265, 0]], drawOrder: [0, 1, 2] }
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
    "date": "2026-11-16_mon",
    "type": "pick",
    "seed": 1116,
    "hook": [
      "월요일부터 안부가 궁금한 그 사람",
      "지금 속마음, 하나만 골라보세요"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/chariot.png",
        "nameKo": "전차",
        "nameEn": "The Chariot",
        "keywords": "전진 · 의지 · 방향",
        "reveal": [
          "마음이 이미",
          "그 사람 쪽으로 달려가요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 이번 주 의욕이 넘쳐요.",
              "당신과의 대화를 기다리고 있어요.",
              "망설임보다 행동이 앞서는 때예요.",
              "먼저 연락하는 쪽이 될 수 있어요.",
              "방향이 정해지면 빠르게 움직여요.",
              "마음이 한쪽으로 분명해지고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "안부는 가볍게 먼저 건네보세요.",
              "짧은 한 줄이면 충분해요.",
              "답을 재촉하지는 마세요.",
              "이번 주는 움직이는 쪽이 유리해요.",
              "자신감 있는 말투가 매력이에요.",
              "그 한마디가 흐름을 바꿀 거예요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/pentacles/Three of Pentacles.png",
        "nameKo": "펜타클의 3",
        "nameEn": "Three of Pentacles",
        "keywords": "협력 · 신뢰 · 함께함",
        "reveal": [
          "같이 하는 일 속에",
          "마음이 자라요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 당신과 함께라 든든해요.",
              "같이 하는 시간이 편하다고 느껴요.",
              "당신의 성실함을 좋게 보고 있어요.",
              "믿음이 먼저 쌓이는 사이예요.",
              "티는 덜 내도 관심은 꾸준해요.",
              "천천히 가까워지는 걸 원해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "함께하는 자리를 소중히 여기세요.",
              "작은 부탁을 주고받아보세요.",
              "도움을 주고받으며 가까워져요.",
              "일 얘기 끝에 안부를 붙여보세요.",
              "신뢰는 이미 시작됐어요.",
              "다음 단계는 자연스럽게 와요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/cups/Knight of Cups.png",
        "nameKo": "컵의 나이트",
        "nameEn": "Knight of Cups",
        "keywords": "다정 · 설렘 · 다가옴",
        "reveal": [
          "다정한 소식이",
          "천천히 다가와요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 당신 안부가 궁금해요.",
              "다정한 말을 고르는 중이에요.",
              "마음을 담아 연락하고 싶어해요.",
              "분위기를 소중하게 여기는 사람이에요.",
              "당신에게 잘 보이고 싶어해요.",
              "설레는 마음을 조심스레 품고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "기다리는 마음도 괜찮아요.",
              "답장이 오면 따뜻하게 받아주세요.",
              "감정을 솔직하게 표현해도 좋아요.",
              "작은 칭찬 하나가 큰 힘이 돼요.",
              "서두르지 않는 설렘을 즐기세요.",
              "그 소식은 생각보다 가까워요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-17_tue",
    "type": "pick",
    "seed": 1117,
    "hook": [
      "이번 주, 그 사람 시선이",
      "나한테 오래 머물까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/sun.png",
        "nameKo": "태양",
        "nameEn": "The Sun",
        "keywords": "기쁨 · 솔직함 · 밝음",
        "reveal": [
          "숨김없는 시선이",
          "당신을 향해요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 눈길이 자꾸 당신에게 가요.",
              "마주쳐도 피하지 않아요.",
              "당신 앞에서 표정이 밝아져요.",
              "웃음이 많아지는 사람이에요.",
              "좋은 감정을 숨기지 못해요.",
              "이번 주 눈맞춤이 늘어날 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "시선이 마주치면 웃어주세요.",
              "밝은 자리에서 더 잘 통해요.",
              "여럿이 있는 자리도 기회예요.",
              "솔직한 반응이 마음을 열어요.",
              "망설이지 말고 인사부터 건네요.",
              "그 눈빛이 말로 이어질 거예요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/cups/Eight of Cups.png",
        "nameKo": "컵의 8",
        "nameEn": "Eight of Cups",
        "keywords": "전환 · 고민 · 떠남",
        "reveal": [
          "잠깐 머문 시선이",
          "다른 곳을 향해요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 요즘 생각이 많아요.",
              "자기 고민에 마음이 가 있어요.",
              "당신이 싫어서가 아니에요.",
              "잠시 여유가 없는 시기예요.",
              "혼자 정리할 시간이 필요해요.",
              "마음이 돌아올 틈은 남아 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "시선을 붙잡으려 애쓰지 마세요.",
              "내 자리에서 편안하게 있어주세요.",
              "재촉은 거리를 만들 수 있어요.",
              "나에게 집중하는 시간도 좋아요.",
              "여유 있는 모습이 눈에 들어와요.",
              "시선은 다시 돌아올 수 있어요."
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
        "keywords": "속도 · 직진 · 결단",
        "reveal": [
          "짧지만 분명하게",
          "당신을 확인해요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 시선은 빠르고 곧아요.",
              "관심이 생기면 바로 움직여요.",
              "생각보다 빨리 말을 걸 수 있어요.",
              "돌려 말하지 않는 성격이에요.",
              "당신을 분명히 의식하고 있어요.",
              "이번 주 갑작스러운 연락도 가능해요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "빠른 흐름에 당황하지 마세요.",
              "솔직하게 답하는 게 좋아요.",
              "애매한 반응은 오해를 불러요.",
              "내 속도도 분명히 말해주세요.",
              "대화는 짧고 명확하게 가요.",
              "그 속도가 기회가 될 거예요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-18_wed",
    "type": "pick",
    "seed": 1128,
    "hook": [
      "연락이 뜸해진 그 사람,",
      "바쁜 걸까 멀어지는 걸까"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/devil.png",
        "nameKo": "악마",
        "nameEn": "The Devil",
        "keywords": "끌림 · 집착 · 망설임",
        "reveal": [
          "멀어진 게 아니라",
          "묶여 있는 마음이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 끌리는 마음이 커요.",
              "그래서 오히려 조심하고 있어요.",
              "부담스러울까 봐 연락을 줄였어요.",
              "당신 생각을 자주 하고 있어요.",
              "마음을 들킬까 망설이는 중이에요.",
              "무관심과는 거리가 멀어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "뜸한 연락에 너무 흔들리지 마세요.",
              "나도 내 하루를 단단히 지켜요.",
              "가벼운 연락으로 숨을 틔워주세요.",
              "무거운 질문은 잠시 미뤄요.",
              "편안함이 그 사람을 풀어줘요.",
              "묶인 마음은 천천히 풀릴 거예요."
            ]
          ]
        ]
      },
      {
        "no": 2,
        "numGlyph": "②",
        "file": "mcards/wands/Eight of Wands.png",
        "nameKo": "완드의 8",
        "nameEn": "Eight of Wands",
        "keywords": "속도 · 소식 · 바쁨",
        "reveal": [
          "정말 바쁜 거예요",
          "소식은 곧 몰려와요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 지금 일이 몰려 있어요.",
              "답장이 밀리는 건 시간 때문이에요.",
              "마음은 그대로 남아 있어요.",
              "여유가 생기면 바로 연락해요.",
              "멈춰 있던 대화가 빨라질 수 있어요.",
              "한꺼번에 소식이 올 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "조급한 해석은 내려놓으세요.",
              "짧은 응원 한마디를 남겨보세요.",
              "답장 간격을 마음에 두지 마세요.",
              "바쁜 시기가 지나길 기다려요.",
              "소식이 오면 반갑게 받아주세요.",
              "흐름은 곧 다시 빨라질 거예요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/pentacles/Ace of Pentacles.png",
        "nameKo": "펜타클의 에이스",
        "nameEn": "Ace of Pentacles",
        "keywords": "기반 · 준비 · 진심",
        "reveal": [
          "관계를 단단히 할",
          "준비를 하고 있어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 생활을 정리하는 중이에요.",
              "바쁜 이유가 분명히 있어요.",
              "관계를 가볍게 보지 않아요.",
              "제대로 다가가고 싶어해요.",
              "한 번의 연락에 진심을 담아요.",
              "멀어지는 흐름이 아니에요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "연락 횟수로 마음을 재지 마세요.",
              "한 마디의 무게를 보세요.",
              "나도 내 기반을 다져두세요.",
              "안정감이 서로를 끌어당겨요.",
              "현실적인 약속을 기대해도 좋아요.",
              "준비가 끝나면 먼저 다가올 거예요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-19_thu",
    "type": "pick",
    "seed": 1119,
    "hook": [
      "처음 본 날이 선명한 그 사람",
      "지금 속마음, 하나만 골라보세요"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/death.png",
        "nameKo": "죽음",
        "nameEn": "Death",
        "keywords": "변화 · 전환 · 새 장",
        "reveal": [
          "그날 이후로",
          "무언가 바뀌었어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 그날을 기억해요.",
              "당신을 만난 뒤 달라진 게 있어요.",
              "예전 같지 않은 마음을 느껴요.",
              "새로운 관계를 시작할 준비 중이에요.",
              "지난 마음을 정리하고 있어요.",
              "당신이 새 장의 시작일 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "과거와 비교하지 마세요.",
              "지금의 나로 다가가세요.",
              "끝은 새로운 시작이 돼요.",
              "변화를 두려워하지 않아도 돼요.",
              "천천히 새 이야기를 써보세요.",
              "다음 장은 이미 열리고 있어요."
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
        "keywords": "기쁨 · 편안함 · 축하",
        "reveal": [
          "선명한 이유는",
          "그날이 반가웠기 때문이에요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 그날이 즐거웠어요.",
              "당신 곁이 편안하다고 느껴요.",
              "좋은 기억으로 간직하고 있어요.",
              "함께 웃던 순간을 떠올려요.",
              "다시 만나고 싶은 마음이 있어요.",
              "관계를 기쁘게 받아들이고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "좋은 기억을 함께 꺼내보세요.",
              "그날 이야기로 대화를 열어요.",
              "편안한 약속을 제안해보세요.",
              "즐거운 자리가 마음을 열어요.",
              "축하할 일을 함께 나눠보세요.",
              "웃는 날이 다시 찾아올 거예요."
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
        "keywords": "확신 · 직감 · 명료함",
        "reveal": [
          "처음부터 직감이",
          "먼저 알아봤어요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람도 첫인상을 또렷이 기억해요.",
              "당신이 특별하다고 느꼈어요.",
              "생각이 분명한 사람이에요.",
              "애매한 관계를 오래 두지 않아요.",
              "말로 정리할 때를 기다려요.",
              "확신이 점점 커지고 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "내 직감을 믿어보세요.",
              "마음을 한 문장으로 정리해요.",
              "돌려 말하지 않아도 괜찮아요.",
              "솔직함이 이 관계의 무기예요.",
              "타이밍은 생각보다 가까워요.",
              "그 한 문장이 답을 부를 거예요."
            ]
          ]
        ]
      }
    ]
  },
  {
    "date": "2026-11-22_sun",
    "type": "pick",
    "seed": 1122,
    "hook": [
      "다음 주, 그 사람의",
      "망설임이 끝날까요?"
    ],
    "cards": [
      {
        "no": 1,
        "numGlyph": "①",
        "file": "cards-png/star.png",
        "nameKo": "별",
        "nameEn": "The Star",
        "keywords": "희망 · 회복 · 기대",
        "reveal": [
          "머뭇거리던 마음에",
          "작은 기대가 생겨요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람 마음이 조금씩 밝아져요.",
              "당신에게 기대를 품기 시작해요.",
              "상처를 회복하는 중일 수 있어요.",
              "다시 믿어보고 싶어해요.",
              "주 초반 표정이 부드러워져요.",
              "희망이 망설임을 덮어가요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "답을 재촉하지 마세요.",
              "기다려주는 마음이 힘이 돼요.",
              "따뜻한 말 한마디를 건네요.",
              "작은 약속부터 지켜주세요.",
              "믿음은 천천히 자라요.",
              "그 기대가 말로 이어질 거예요."
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
        "keywords": "안정 · 책임 · 결심",
        "reveal": [
          "수~목 사이",
          "마음이 단단해져요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 신중하게 결정해요.",
              "한번 정하면 쉽게 흔들리지 않아요.",
              "말보다 행동으로 보여줘요.",
              "당신과의 미래를 현실적으로 봐요.",
              "책임질 수 있을 때 움직여요.",
              "주 중반 결심이 설 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "행동으로 오는 신호를 보세요.",
              "약속을 지키는 모습이 진심이에요.",
              "나도 안정감을 보여주세요.",
              "현실적인 대화가 도움이 돼요.",
              "조급함보다 믿음이 필요해요.",
              "그 결심이 모습을 드러낼 거예요."
            ]
          ]
        ]
      },
      {
        "no": 3,
        "numGlyph": "③",
        "file": "mcards/swords/Four of Swords.png",
        "nameKo": "소드의 4",
        "nameEn": "Four of Swords",
        "keywords": "휴식 · 정리 · 숨 고르기",
        "reveal": [
          "잠깐 멈추는 건",
          "다음 걸음의 준비예요"
        ],
        "pages": [
          [
            "그 사람의 속마음",
            [
              "그 사람은 지금 지쳐 있어요.",
              "생각을 정리할 시간이 필요해요.",
              "혼자 조용히 마음을 들여다봐요.",
              "멀어지려는 게 아니에요.",
              "쉬고 나면 더 분명해져요.",
              "주 후반 잠시 조용할 수 있어요."
            ]
          ],
          [
            "러브타로의 조언",
            [
              "조용한 시간을 존중해주세요.",
              "연락이 뜸해도 불안해 마세요.",
              "나도 함께 숨을 골라보세요.",
              "쉼 뒤의 대화는 더 깊어요.",
              "기다림도 관계의 일부예요.",
              "다음 걸음은 곧 시작될 거예요."
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
