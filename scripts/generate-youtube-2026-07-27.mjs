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
const KO = `'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif`

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

function body(starSeed = 711, moon = true) {
  return `
    <rect width="${W}" height="${H}" fill="url(#cosmicBg)"/>
    <ellipse cx="900" cy="1700" rx="500" ry="350" fill="url(#neb3)"/>
    <ellipse cx="180" cy="1550" rx="400" ry="300" fill="url(#neb2)"/>
    ${genStars(260, starSeed)}
    ${genStars(70, starSeed + 11, true)}
    ${moon ? `<circle cx="125" cy="205" r="80" fill="url(#moonGlow)"/>
    <rect x="70" y="150" width="120" height="120" fill="rgba(248,230,185,0.9)" mask="url(#moonMaskSmall)"/>` : ''}
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

const schemes = [SCHEME_KEYS[0], SCHEME_KEYS[1], SCHEME_KEYS[2]]

// ── 훅 (참여형: 카드 3장)
async function sceneHook3(day) {
  const cardScale = 2.5
  const cw = CARD_WIDTH * cardScale, ch = CARD_HEIGHT * cardScale
  const gap = 50
  const startCX = (W - (cw * 3 + gap * 2)) / 2 + cw / 2
  const cardY = 980
  const numberY = cardY + ch / 2 + 55
  const cxs = [startCX, startCX + cw + gap, startCX + (cw + gap) * 2]

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}${colorCardBackDefs()}</defs>
    ${body(day.seed)}
    <ellipse cx="540" cy="${cardY}" rx="500" ry="380" fill="url(#cardAreaGlow)" filter="url(#glowBlur)"/>
    <g filter="url(#softGlow)">
      <text x="540" y="378" text-anchor="middle" font-family="${KO}" font-size="46" fill="#F4F8FF" letter-spacing="2" font-weight="300">${day.hook[0]}</text>
      <text x="540" y="458" text-anchor="middle" font-family="${KO}" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">${day.hook[1]}</text>
    </g>
    ${cxs.map((cx, i) => `<ellipse cx="${cx}" cy="${cardY}" rx="${cw * 0.8}" ry="${ch * 0.55}" fill="url(#colorCardGlow_${schemes[i]})" filter="url(#glowBlur)"/>`).join('')}
    <g filter="url(#cardShadow)">
      ${cxs.map((cx, i) => colorCardBackSvg(cx, cardY, cardScale, schemes[i])).join('')}
    </g>
    <g filter="url(#softGlow)">
      ${cxs.map((cx, i) => `<text x="${cx}" y="${numberY}" text-anchor="middle" font-family="${KO}" font-size="42" fill="${getSchemeAccent(schemes[i])}" font-weight="600">${i + 1}번</text>`).join('')}
    </g>
    <text x="540" y="1640" text-anchor="middle" font-family="${KO}" font-size="30" fill="rgba(244,248,255,0.6)" letter-spacing="5" font-weight="300">직감으로 하나를 골라보세요</text>
    <text x="540" y="1860" text-anchor="middle" font-family="${KO}" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`
  return sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
}

// ── 훅 (단일형: 카드 1장)
async function sceneHook1(day) {
  const cardScale = 3.4
  const cw = CARD_WIDTH * cardScale, ch = CARD_HEIGHT * cardScale
  const cardY = 1020

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${cosmicDefs()}${colorCardBackDefs()}</defs>
    ${body(day.seed)}
    <ellipse cx="540" cy="${cardY}" rx="440" ry="420" fill="url(#cardAreaGlow)" filter="url(#glowBlur)"/>
    <g filter="url(#softGlow)">
      <text x="540" y="378" text-anchor="middle" font-family="${KO}" font-size="46" fill="#F4F8FF" letter-spacing="2" font-weight="300">${day.hook[0]}</text>
      <text x="540" y="458" text-anchor="middle" font-family="${KO}" font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">${day.hook[1]}</text>
    </g>
    <ellipse cx="540" cy="${cardY}" rx="${cw * 0.85}" ry="${ch * 0.58}" fill="url(#colorCardGlow_${schemes[1]})" filter="url(#glowBlur)"/>
    <g filter="url(#cardShadow)">
      ${colorCardBackSvg(540, cardY, cardScale, schemes[1])}
    </g>
    <text x="540" y="1700" text-anchor="middle" font-family="${KO}" font-size="30" fill="rgba(244,248,255,0.6)" letter-spacing="5" font-weight="300">오늘의 카드를 만나보세요</text>
    <text x="540" y="1860" text-anchor="middle" font-family="${KO}" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`
  return sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
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
// pick  = 훅5s + 전환2s + 카드3×(리빌4s + 페이지10s×2) + 아웃트로6s = 85초
// single= 훅4s + 리빌5s + 페이지10s×3 + 아웃트로6s = 45초
// 본문은 insta/reply_templates.txt(참여형)·copy.txt(소개형)의 해석을 유튜브용으로 6줄씩 풀어쓴 것

const WEEK = [
  {
    date: '2026-07-27_mon', type: 'pick', seed: 27,
    hook: ['지금 딱 한 사람 떠올랐다면', '그 사람 기준으로 하나만 골라보세요'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/magician.png',
        nameKo: '마법사', nameEn: 'The Magician', keywords: '주도 · 시작 · 실행력',
        reveal: ['먼저 움직이는 쪽으로', '흐름이 기울고 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '지금 이 관계는 기다리는 자리가 아니에요.',
            '먼저 손을 뻗는 쪽으로 흐름이 기울어 있어요.',
            '상대도 계기가 없어서 멈춰 있을 뿐이에요.',
            '마음이 없는 게 아니라 시작할 이유가 없는 거예요.',
            '누가 먼저냐가 이번 흐름을 가르게 돼요.',
            '그 자리에 당신이 설 수 있는 시기예요.',
          ]],
          ['러브타로의 조언', [
            '길게 다듬은 메시지는 오히려 부담이 돼요.',
            '짧은 안부 한 줄이면 충분한 시기예요.',
            '답이 늦어도 실패로 읽지 마세요.',
            '마법사는 재료가 이미 손안에 있다고 말해요.',
            '결과보다 시도 자체가 흐름을 바꿔요.',
            '오늘 떠오른 그 한 줄을 보내보세요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'cards-png/emperor.png',
        nameKo: '황제', nameEn: 'The Emperor', keywords: '안정 · 기준 · 신중함',
        reveal: ['마음이 없는 게 아니라', '확신이 필요한 사람이에요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람은 감정보다 순서를 먼저 세워요.',
            '확신이 서기 전에는 말을 아끼는 편이에요.',
            '차가워 보이는 태도가 사실은 신중함이에요.',
            '관계를 가볍게 시작하지 않으려는 마음이에요.',
            '지금은 재는 게 아니라 다지는 중이에요.',
            '그래서 속도가 느리게 느껴지는 거예요.',
          ]],
          ['러브타로의 조언', [
            '재촉하면 오히려 뒤로 물러나는 사람이에요.',
            '일정한 거리와 태도를 지켜주세요.',
            '약속을 지키는 모습이 가장 큰 신호가 돼요.',
            '감정을 쏟기보다 신뢰를 쌓는 시기예요.',
            '황제는 시간이 내 편이라고 말해요.',
            '급한 마음만 한 발 뒤로 물려두세요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Eight of Pentacles.png',
        nameKo: '펜타클의 8', nameEn: 'Eight of Pentacles', keywords: '축적 · 성실 · 반복',
        reveal: ['조용해 보여도 마음은', '계속 쌓이는 중이에요'],
        pages: [
          ['그 사람의 속마음', [
            '겉으로는 변화가 없어 보일 수 있어요.',
            '하지만 이 사람 안에서는 계속 쌓이고 있어요.',
            '표현이 서툴러 티가 안 날 뿐이에요.',
            '큰 이벤트보다 작은 반복이 이 사람의 언어예요.',
            '매번 챙기는 사소한 것들이 그 증거예요.',
            '그 축적이 어느 순간 형태로 드러나요.',
          ]],
          ['러브타로의 조언', [
            '화려한 신호를 기다리지 마세요.',
            '반복되는 행동을 세어보는 게 더 정확해요.',
            '이 사람은 말보다 태도로 답하는 쪽이에요.',
            'Eight of Pentacles는 서두르면 어긋난다고 말해요.',
            '지금은 확인보다 지켜보는 시기예요.',
            '쌓인 것이 드러날 때까지 여유를 두세요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-07-28_tue', type: 'pick', seed: 28,
    hook: ['연락은 계속되는데 진도는 없는 사이', '지금 어디까지 와 있을까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/sun.png',
        nameKo: '태양', nameEn: 'The Sun', keywords: '확신 · 드러남 · 밝음',
        reveal: ['생각보다 이미', '가까운 지점까지 왔어요'],
        pages: [
          ['그 사람의 속마음', [
            '두 사람은 이미 꽤 가까운 자리에 있어요.',
            '감정을 숨길 이유가 사라지는 흐름이에요.',
            '진도가 없어 보인 건 확인을 안 했을 뿐이에요.',
            '상대도 이 관계를 편하게 여기고 있어요.',
            '다만 이름 붙이는 일에만 서로 조심스러워요.',
            '실제 거리는 생각보다 가까워요.',
          ]],
          ['러브타로의 조언', [
            '불안해서 시험하듯 떠보지 마세요.',
            '지금의 편안함을 그대로 즐겨도 괜찮아요.',
            '태양은 숨기지 않을 때 가장 잘 통한다고 말해요.',
            '솔직한 표현이 관계를 앞으로 밀어줘요.',
            '확인은 자연스러운 순간에 오게 돼요.',
            '조급함만 내려놓으면 흐름이 열려요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/wands/Eight of Wands.png',
        nameKo: '완드의 8', nameEn: 'Eight of Wands', keywords: '속도 · 소식 · 전개',
        reveal: ['멈춰 있던 흐름에', '곧 속도가 붙어요'],
        pages: [
          ['그 사람의 속마음', [
            '지금은 정체된 것처럼 보이는 구간이에요.',
            '그런데 곧 속도가 붙는 지점 바로 앞이에요.',
            '미뤄졌던 소식이 한꺼번에 몰려올 수 있어요.',
            '갑작스러운 연락이나 만남 제안이 올 수 있어요.',
            '상대 쪽 사정이 정리되는 중이었어요.',
            '진도가 없던 건 타이밍 문제였어요.',
          ]],
          ['러브타로의 조언', [
            '지금 미리 지쳐버리지 마세요.',
            '속도가 붙으면 흐름을 따라가면 돼요.',
            'Eight of Wands는 흐름을 막지 말라고 말해요.',
            '연락이 몰릴 때 밀어내지 않는 게 중요해요.',
            '마음의 준비만 해두면 충분해요.',
            '다음 며칠을 가볍게 열어두세요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/cups/Page of Cups.png',
        nameKo: '컵의 페이지', nameEn: 'Page of Cups', keywords: '설렘 · 시작 · 서툰 진심',
        reveal: ['이 사람의 감정은', '이제 막 시작이에요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람 감정은 아직 초입에 있어요.',
            '좋아하는 마음은 있지만 서툰 단계예요.',
            '그래서 표현이 조금씩 어긋나 보여요.',
            '진도가 없는 게 아니라 방법을 모르는 거예요.',
            '마음은 분명 이쪽을 향하고 있어요.',
            '다만 속도가 느릴 뿐이에요.',
          ]],
          ['러브타로의 조언', [
            '지금 재촉하면 뒤로 물러날 수 있어요.',
            '가벼운 대화로 편안함을 먼저 쌓아주세요.',
            'Page of Cups는 서툰 진심도 진심이라고 말해요.',
            '작은 표현을 놓치지 말고 받아주세요.',
            '이 관계는 천천히 자라는 쪽이에요.',
            '기다림이 아깝지 않은 시기예요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-07-29_wed', type: 'single', seed: 29,
    hook: ['뭐든 먼저 나서주는 사람인데', '왜 마음만은 안 보여줄까?'],
    cards: [
      {
        no: 1, numGlyph: '', file: 'mcards/wands/King of Wands.png',
        nameKo: '완드의 킹', nameEn: 'King of Wands', keywords: '주도 · 열정 · 책임',
        reveal: ['앞장서는 힘은 강한데', '속을 여는 건 서툰 사람'],
        pages: [
          ['지금 내 마음', [
            '약속도 계획도 늘 이 사람이 먼저 잡아요.',
            '그래서 처음엔 적극적이라고 느꼈어요.',
            '그런데 마음 이야기만 나오면 화제가 바뀌어요.',
            '챙겨주는 건 분명한데 속을 모르겠어요.',
            '좋아하는 건지 그냥 성격인지 헷갈려요.',
            '이 온도 차가 자꾸 마음에 걸려요.',
          ]],
          ['카드의 메시지', [
            'King of Wands는 앞에 나서는 사람의 자리예요.',
            '결정하고 이끄는 데는 망설임이 없어요.',
            '대신 감정을 말로 옮기는 건 서툰 편이에요.',
            '이 사람에게는 행동이 곧 표현이에요.',
            '먼저 나서는 것 자체가 마음의 증거예요.',
            '말이 없다고 마음까지 없는 건 아니에요.',
          ]],
          ['러브타로의 조언', [
            '왜 표현을 안 하냐고 몰아붙이지 마세요.',
            '대신 행동을 알아봐 주는 말을 건네보세요.',
            '인정받는다고 느낄 때 이 사람은 열려요.',
            '감정을 묻기보다 상황을 물어보세요.',
            '대화가 편해지면 속마음도 따라 나와요.',
            '시간을 조금 더 줘도 괜찮은 사람이에요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-07-30_thu', type: 'pick', seed: 30,
    hook: ['말할까,', '삼킬까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/empress.png',
        nameKo: '여황제', nameEn: 'The Empress', keywords: '다정함 · 수용 · 풍요',
        reveal: ['말해도 되는 때예요', '단 부드럽게 건네세요'],
        pages: [
          ['그 사람의 속마음', [
            '상대는 당신 말을 들을 준비가 되어 있어요.',
            '다만 따지는 말투에는 닫히는 사람이에요.',
            '감정 자체를 부담스러워하지는 않아요.',
            '오히려 솔직한 표현을 반가워할 수 있어요.',
            '지금 관계의 온도는 나쁘지 않아요.',
            '말을 삼킬수록 오해만 길어져요.',
          ]],
          ['러브타로의 조언', [
            '내용보다 온도를 먼저 낮춰주세요.',
            '탓하는 문장을 바라는 문장으로 바꿔보세요.',
            '여황제는 다그치지 않는 말이 닿는다고 말해요.',
            '상대를 몰아세우지 않는 게 핵심이에요.',
            '전하고 나면 마음이 훨씬 가벼워져요.',
            '오늘 안에 꺼내도 괜찮은 시기예요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/swords/Two of Swords.png',
        nameKo: '소드의 2', nameEn: 'Two of Swords', keywords: '유보 · 균형 · 판단 보류',
        reveal: ['지금은 삼키는 쪽이', '손해가 아니에요'],
        pages: [
          ['그 사람의 속마음', [
            '아직 판단할 재료가 부족한 상태예요.',
            '확신 없이 말하면 후회가 남을 수 있어요.',
            '지금 느끼는 조급함은 불안에서 왔어요.',
            '상황이 급한 게 아니라 마음이 급한 거예요.',
            '며칠만 지나도 보이는 게 달라져요.',
            '삼키는 건 회피가 아니라 대기예요.',
          ]],
          ['러브타로의 조언', [
            'Two of Swords는 눈을 가린 채 고르지 말라고 말해요.',
            '결정을 미루되 관찰은 계속하세요.',
            '상대의 말이 아니라 반복되는 행동을 보세요.',
            '기한을 정해두면 미루기로 흐르지 않아요.',
            '일주일만 지켜보고 다시 판단해보세요.',
            '그때는 답이 훨씬 선명해질 거예요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/wands/Ace of Wands.png',
        nameKo: '완드의 에이스', nameEn: 'Ace of Wands', keywords: '충동 · 시작 · 용기',
        reveal: ['지금 올라온 그 충동이', '가장 정확한 신호예요'],
        pages: [
          ['그 사람의 속마음', [
            '지금 마음속에서 올라온 그 말이 답이에요.',
            '머리로 다듬을수록 진심은 옅어져요.',
            '망설이는 사이 불씨가 식어버릴 수 있어요.',
            '상대도 무언가를 기다리는 상태예요.',
            '먼저 꺼내는 쪽이 흐름을 잡아요.',
            '타이밍이 열려 있는 시기예요.',
          ]],
          ['러브타로의 조언', [
            '완벽한 문장을 준비하지 마세요.',
            '지금 떠오른 한 줄이 가장 잘 전해져요.',
            'Ace of Wands는 시작 자체가 답이라고 말해요.',
            '거절이 두려워 미루면 아쉬움만 남아요.',
            '결과보다 말을 꺼낸 나 자신이 남아요.',
            '오늘 그 한마디를 꺼내보세요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-07-31_fri', type: 'single', seed: 31,
    hook: ['이만큼 기다렸는데', '왜 아직 아무것도 안 자랐을까?'],
    cards: [
      {
        no: 1, numGlyph: '', file: 'mcards/pentacles/Seven of Pentacles.png',
        nameKo: '펜타클의 7', nameEn: 'Seven of Pentacles', keywords: '기다림 · 점검 · 인내',
        reveal: ['거두는 때가 아니라', '살피는 때예요'],
        pages: [
          ['지금 내 마음', [
            '시간도 마음도 충분히 들였다고 느껴요.',
            '그런데 관계는 눈에 띄게 달라진 게 없어요.',
            '이만큼 했으면 답이 올 때도 됐다 싶어요.',
            '기다린 시간이 아까워 그만두지도 못해요.',
            '계속 마음을 줘야 할지 확신이 안 서요.',
            '그 애매함이 제일 지치게 만들어요.',
          ]],
          ['카드의 메시지', [
            'Seven of Pentacles는 열매를 세는 자리가 아니에요.',
            '아직 자라는 중인 것을 살피는 자리예요.',
            '보이지 않는다고 자라지 않은 건 아니에요.',
            '다만 모든 나무가 열매를 맺지는 않아요.',
            '그래서 지금은 점검이 필요한 시기예요.',
            '거두는 때와 다시 심는 때를 가르는 지점이에요.',
          ]],
          ['러브타로의 조언', [
            '얼마나 기다렸는지는 기준이 되지 않아요.',
            '그동안 무엇이 달라졌는지를 세어보세요.',
            '변화가 있었다면 조금 더 두어도 괜찮아요.',
            '같은 자리만 반복됐다면 방향을 바꿔도 돼요.',
            '기다림을 끝내는 것도 하나의 선택이에요.',
            '어느 쪽이든 스스로 정할 수 있는 시기예요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-01_sat', type: 'pick', seed: 41,
    hook: ['8월 첫 주말, 조심스럽던 그 사람이', '먼저 손 내밀까요?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/moon.png',
        nameKo: '달', nameEn: 'The Moon', keywords: '불확실 · 망설임 · 무의식',
        reveal: ['상대도 아직', '마음을 정하지 못했어요'],
        pages: [
          ['그 사람의 속마음', [
            '이번 주말은 서로 눈치만 보는 흐름이에요.',
            '상대도 먼저 움직일지 망설이고 있어요.',
            '마음이 없어서가 아니라 확신이 없어서예요.',
            '애매한 신호가 오갈 수 있는 시기예요.',
            '그 신호를 확대해석하면 더 지쳐요.',
            '안개가 걷히려면 조금 더 시간이 필요해요.',
          ]],
          ['러브타로의 조언', [
            '오지 않는 연락을 계속 확인하지 마세요.',
            '주말 일정을 나를 위해 먼저 채워두세요.',
            '달은 보이지 않을 땐 기다리라고 말해요.',
            '불안할수록 해석을 줄이는 게 도움이 돼요.',
            '다음 주에 흐름이 달라질 여지가 있어요.',
            '지금은 판단을 미뤄도 괜찮아요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/cups/Knight of Cups.png',
        nameKo: '컵의 나이트', nameEn: 'Knight of Cups', keywords: '제안 · 낭만 · 다가옴',
        reveal: ['먼저 다가오는 쪽은', '그 사람일 수 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '이번 주말 먼저 손 내미는 쪽은 상대예요.',
            '가벼운 안부나 만남 제안이 올 수 있어요.',
            '이 사람은 마음을 담아 표현하는 편이에요.',
            '조심스러웠던 건 거절이 두려워서였어요.',
            '용기를 낼 계기만 필요했던 거예요.',
            '그 계기가 이번 주말에 생겨요.',
          ]],
          ['러브타로의 조언', [
            '연락이 오면 튕기지 말고 받아주세요.',
            '기다린 티를 내도 괜찮은 시기예요.',
            'Knight of Cups는 진심에 진심으로 답하라고 말해요.',
            '반응이 미지근하면 다시 물러날 수 있어요.',
            '가볍게 응하는 게 관계를 이어줘요.',
            '그다음은 자연스럽게 흘러가요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Ace of Pentacles.png',
        nameKo: '펜타클의 에이스', nameEn: 'Ace of Pentacles', keywords: '현실적 시작 · 제안 · 기회',
        reveal: ['말이 아니라 행동으로', '먼저 다가와요'],
        pages: [
          ['그 사람의 속마음', [
            '손 내미는 방식이 말이 아닐 수 있어요.',
            '약속을 잡거나 뭔가를 챙겨주는 형태로 와요.',
            '이 사람에게는 행동이 곧 고백이에요.',
            '현실적인 제안일수록 진심에 가까워요.',
            '가볍게 던지는 말이 아니라는 뜻이에요.',
            '준비해온 마음이 드러나는 시기예요.',
          ]],
          ['러브타로의 조언', [
            '로맨틱한 말만 기다리지 마세요.',
            '건네오는 제안 자체를 신호로 읽으세요.',
            'Ace of Pentacles는 시작이 눈에 보인다고 말해요.',
            '작은 제안이라도 응하면 흐름이 열려요.',
            '거절하면 다음 시도가 늦어질 수 있어요.',
            '이번 주말이 그 시작점이에요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-02_sun', type: 'pick', seed: 42,
    hook: ['다음 주, 이름 없던 두 사람 사이에', '답이 생길까요?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/justice.png',
        nameKo: '정의', nameEn: 'Justice', keywords: '균형 · 명확함 · 결론',
        reveal: ['주 초반, 흐릿하던 기준이', '또렷하게 정리돼요'],
        pages: [
          ['그 사람의 속마음', [
            '다음 주 초반 관계의 위치가 분명해져요.',
            '애매하게 미뤄둔 것에 결론이 나는 흐름이에요.',
            '서로 원하는 게 무엇인지 확인하게 돼요.',
            '듣기 좋은 말보다 정확한 말이 오가요.',
            '그 과정이 조금 서늘하게 느껴질 수 있어요.',
            '대신 헷갈릴 일은 줄어들어요.',
          ]],
          ['러브타로의 조언', [
            '대화가 오면 피하지 말고 마주하세요.',
            '내가 원하는 것도 함께 말해주세요.',
            '정의는 한쪽만 참는 관계는 오래 못 간다고 말해요.',
            '기준을 세우는 게 관계를 깨는 건 아니에요.',
            '분명해질수록 마음이 편해져요.',
            '다음 주 초반을 잘 활용해보세요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/wands/Four of Wands.png',
        nameKo: '완드의 4', nameEn: 'Four of Wands', keywords: '안정 · 자리잡음 · 편안함',
        reveal: ['주 중반, 어색하던 사이에', '편한 자리가 생겨요'],
        pages: [
          ['그 사람의 속마음', [
            '다음 주 중반 분위기가 한결 부드러워져요.',
            '같이 있는 시간이 자연스러워지는 흐름이에요.',
            '이름을 붙이지 않아도 편안해지는 구간이에요.',
            '긴장이 풀리면서 대화가 늘어나요.',
            '주변에 함께 있는 모습이 보일 수도 있어요.',
            '관계가 형태를 갖추기 시작해요.',
          ]],
          ['러브타로의 조언', [
            '이 편안함을 당연하게 넘기지 마세요.',
            '좋았던 순간을 말로 표현해주세요.',
            'Four of Wands는 함께한 시간이 기반이라고 말해요.',
            '안정될수록 관계에 이름이 붙기 쉬워져요.',
            '급하게 확인하지 않아도 괜찮아요.',
            '중반의 흐름을 그대로 타보세요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/cups/Ace of Cups.png',
        nameKo: '컵의 에이스', nameEn: 'Ace of Cups', keywords: '새 감정 · 시작 · 열림',
        reveal: ['주 후반, 이름 없던 감정에', '첫 자리가 만들어져요'],
        pages: [
          ['그 사람의 속마음', [
            '다음 주 후반 감정이 새로 열려요.',
            '미뤄둔 마음을 상대가 먼저 꺼낼 수 있어요.',
            '이름 없던 관계에 처음 자리가 생겨요.',
            '갑작스럽게 느껴질 만큼 빠른 전개일 수 있어요.',
            '오래 참아온 마음이 흘러넘치는 시기예요.',
            '새로운 인연이 들어올 여지도 있어요.',
          ]],
          ['러브타로의 조언', [
            '마음이 열릴 때 계산하지 마세요.',
            '받은 만큼 돌려주려 애쓰지 않아도 돼요.',
            'Ace of Cups는 먼저 채워야 나눌 수 있다고 말해요.',
            '내 감정을 솔직하게 인정해보세요.',
            '후반의 흐름을 놓치지 마세요.',
            '이번 주가 시작점이 될 수 있어요.',
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
    await save(await sceneHook3(day), 'hook', 5)
    await save(await sceneTransition(day), 'transition', 2)
    for (const card of day.cards) {
      await save(await sceneReveal(day, card), `c${card.no}-reveal`, 4)
      for (let p = 0; p < card.pages.length; p++) {
        await save(await sceneTextPage(day, card, p, card.pages.length, card.pages[p][0], card.pages[p][1]), `c${card.no}-p${p + 1}`, 10)
      }
    }
    await save(await sceneOutro3(day), 'outro', 6)
  } else {
    await save(await sceneHook1(day), 'hook', 4)
    const card = day.cards[0]
    await save(await sceneReveal(day, card), 'reveal', 5)
    for (let p = 0; p < card.pages.length; p++) {
      await save(await sceneTextPage(day, card, p, card.pages.length, card.pages[p][0], card.pages[p][1]), `p${p + 1}`, 10)
    }
    await save(await sceneOutro1(day), 'outro', 6)
  }

  writeFileSync(`${CONTENT}/${day.date}/youtube/scenes.txt`, scenes.join('\n') + '\n')
  const total = scenes.reduce((s, l) => s + Number(l.split(':')[1]), 0)
  console.log(`✅ ${day.date}: 장면 ${scenes.length}개, 총 ${total}초`)
}
console.log('완료!')
