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
    date: '2026-08-03_mon', type: 'pick', seed: 83,
    hook: ['요즘 스토리만 자꾸 확인하게 되는 사람,', '지금 그 사람 기준으로 골라보세요'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/high-priestess.png',
        nameKo: '여사제', nameEn: 'The High Priestess', keywords: '직관 · 침묵 · 내면',
        reveal: ['그 사람도 보고 있어요', '티를 내지 않을 뿐이에요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람도 당신 소식을 조용히 따라가고 있어요.',
            '다만 흔적을 남기지 않으려고 애쓰는 중이에요.',
            '먼저 반응하면 마음이 들킬 것 같아서예요.',
            '여사제는 안쪽에 감정을 두는 자리를 말해요.',
            '무관심이 아니라 조심스러움에 가까워요.',
            '지금은 서로 눈치만 보는 구간이에요.',
          ]],
          ['러브타로의 조언', [
            '상대의 침묵을 거절로 읽지 않아도 돼요.',
            '표시가 없다고 관심이 없는 건 아니에요.',
            '증거를 찾으려 계속 확인하면 지치기만 해요.',
            '차라리 가벼운 반응 하나를 남겨보세요.',
            '작은 흔적이 서로의 눈치를 풀어줘요.',
            '먼저 문을 여는 쪽이 흐름을 가져가요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'cards-png/tower.png',
        nameKo: '탑', nameEn: 'The Tower', keywords: '변동 · 전환점 · 계기',
        reveal: ['어정쩡한 거리가', '한 번에 정리될 수 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람 안에도 눌러둔 감정이 쌓여 있어요.',
            '조심하느라 오래 참아온 상태예요.',
            '탑은 참아온 것이 한 번에 터지는 시기를 말해요.',
            '작은 계기가 상황을 통째로 바꿀 수 있어요.',
            '우연한 마주침이나 한마디로 시작될 수 있어요.',
            '지금의 어정쩡한 거리는 오래 못 갈 거예요.',
          ]],
          ['러브타로의 조언', [
            '변화를 나쁜 신호로만 볼 필요는 없어요.',
            '무너지는 건 관계가 아니라 애매함이에요.',
            '갑작스러운 연락에 당황하지 않도록 준비해두세요.',
            '어떻게 답할지 미리 정해두면 흔들리지 않아요.',
            '탑은 정리 뒤에 새 자리가 생긴다고 말해요.',
            '그 순간을 피하지 말고 마주해보세요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/swords/Knight of Swords.png',
        nameKo: '소드의 나이트', nameEn: 'Knight of Swords', keywords: '직진 · 속도 · 결단',
        reveal: ['재는 시간보다', '먼저 움직이는 쪽이 이겨요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람은 빙 돌려 말하는 걸 답답해해요.',
            '신호를 주고받기보다 직접 듣고 싶어 해요.',
            'Knight of Swords는 속도로 승부하는 자리예요.',
            '망설이는 사이 관심이 식을 수도 있어요.',
            '반대로 한 번 열리면 전개가 아주 빨라져요.',
            '지금은 타이밍이 마음보다 중요한 구간이에요.',
          ]],
          ['러브타로의 조언', [
            '완벽한 문장을 고르느라 시간을 쓰지 마세요.',
            '가벼운 반응 하나가 대화를 열어줘요.',
            '거절당할 걱정보다 흐지부지될 위험이 더 커요.',
            '이 카드는 재는 사람 편이 아니에요.',
            '속도를 낼지 말지는 스스로 정하면 돼요.',
            '다만 결정을 오래 미루지는 마세요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-04_tue', type: 'pick', seed: 84,
    hook: ['이번 주, 미뤄지기만 하던 그 약속이', '드디어 잡힐까요?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/hermit.png',
        nameKo: '은둔자', nameEn: 'The Hermit', keywords: '내면 · 거리 · 성찰',
        reveal: ['마음이 식은 게 아니라', '혼자 있을 시간이 필요해요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람은 지금 사람을 만날 여력이 없어요.',
            '당신이 싫어져서가 아니라 안으로 물러난 거예요.',
            '은둔자는 스스로를 정리하는 시기를 말해요.',
            '약속이 밀리는 이유가 당신 때문이 아니에요.',
            '지금 재촉하면 더 멀리 물러날 수 있어요.',
            '이 구간은 생각보다 길지 않게 끝나요.',
          ]],
          ['러브타로의 조언', [
            '연락 빈도를 억지로 늘리지 않아도 돼요.',
            '기다린다는 걸 한 번만 알려주면 충분해요.',
            '그 사이 내 시간을 채워두는 게 더 도움이 돼요.',
            '은둔자는 혼자 있는 시간이 답을 준다고 말해요.',
            '돌아왔을 때 대화가 더 깊어질 수 있어요.',
            '조급함만 잠시 내려놓아 보세요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/cups/Four of Cups.png',
        nameKo: '컵의 4', nameEn: 'Four of Cups', keywords: '권태 · 무기력 · 무관심',
        reveal: ['제안이 시들한 게 아니라', '마음이 가라앉아 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람은 지금 무엇에도 흥이 나지 않는 상태예요.',
            '당신 제안만 시큰둥한 게 아니라 전부 그래요.',
            'Four of Cups는 눈앞의 것을 흘려보내는 자리예요.',
            '좋은 기회가 와도 잘 알아보지 못해요.',
            '그래서 약속이 자꾸 흐지부지되는 거예요.',
            '거절이라기보다 무기력에 가까워요.',
          ]],
          ['러브타로의 조언', [
            '늘 하던 방식으로 물으면 같은 답이 돌아와요.',
            '장소나 시간대를 바꿔서 제안해보세요.',
            '부담 없는 짧은 만남부터가 좋아요.',
            'Four of Cups는 새로운 자극에 반응하는 카드예요.',
            '한 번 흐름이 깨지면 태도가 달라질 수 있어요.',
            '어떤 제안이 통할지 떠올려보세요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Knight of Pentacles.png',
        nameKo: '펜타클의 나이트', nameEn: 'Knight of Pentacles', keywords: '성실 · 신뢰 · 느린 속도',
        reveal: ['빠르지는 않아도', '말한 건 지키는 사람이에요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람은 즉흥적으로 움직이지 않아요.',
            '대신 한 번 정한 것은 끝까지 지켜요.',
            'Knight of Pentacles는 느리지만 확실한 자리예요.',
            '약속이 미뤄진 건 마음이 없어서가 아니에요.',
            '현실 조건이 정리되기를 기다리는 중이에요.',
            '이번 주 안에 구체적인 날짜가 나올 수 있어요.',
          ]],
          ['러브타로의 조언', [
            '속도가 느리다고 진심이 얕은 건 아니에요.',
            '재촉보다 기다려주는 태도가 더 잘 통해요.',
            '먼저 날짜를 제안하면 오히려 편해할 수 있어요.',
            '이 사람은 계획이 잡히면 안심하는 유형이에요.',
            '작은 약속이 지켜지는지부터 보면 돼요.',
            '그 신뢰가 관계의 속도를 정해줘요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-06_thu', type: 'pick', seed: 86,
    hook: ['이어질까,', '끊길까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/devil.png',
        nameKo: '악마', nameEn: 'The Devil', keywords: '집착 · 익숙함 · 속박',
        reveal: ['좋아서가 아니라', '익숙해서 이어지는 중이에요'],
        pages: [
          ['그 사람의 속마음', [
            '이 관계는 지금 감정보다 습관으로 이어지고 있어요.',
            '연락이 오면 반가운 게 아니라 안심이 돼요.',
            '악마는 끊지 못하는 고리를 보여주는 카드예요.',
            '상대도 비슷한 이유로 놓지 못하고 있어요.',
            '서로 좋아서라기보다 빈자리가 두려운 거예요.',
            '그래서 같은 자리를 계속 맴돌아요.',
          ]],
          ['러브타로의 조언', [
            '이 관계에서 무엇을 얻고 있는지 적어보세요.',
            '외로움과 애정은 생각보다 헷갈리기 쉬워요.',
            '악마는 상대가 아니라 내 마음을 보라고 말해요.',
            '고리를 만든 이유를 알면 힘이 빠져요.',
            '억지로 끊지 않아도 흐름은 달라질 수 있어요.',
            '먼저 내 자리를 만들어보세요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/swords/Queen of Swords.png',
        nameKo: '소드의 여왕', nameEn: 'Queen of Swords', keywords: '판단 · 냉정 · 경계',
        reveal: ['아플 걸 알면서도', '정확하게 정리하는 시기예요'],
        pages: [
          ['그 사람의 속마음', [
            '이 흐름에서는 감정보다 판단이 먼저 서요.',
            '상대도 이미 상황을 냉정하게 보고 있어요.',
            'Queen of Swords는 선을 긋는 자리예요.',
            '미련이 없어서가 아니라 반복이 지쳐서예요.',
            '한 번 정리되면 되돌리기 어려운 카드예요.',
            '대신 애매함으로 힘든 시간은 끝나요.',
          ]],
          ['러브타로의 조언', [
            '기분이 아니라 사실만 적어보세요.',
            '어떤 점이 반복됐는지 보면 답이 나와요.',
            'Queen of Swords는 흐린 말을 싫어해요.',
            '정리한다면 분명하게 말하는 게 서로에게 나아요.',
            '차갑게 보여도 결국 나를 지키는 선택이에요.',
            '그 선을 어디에 그을지 정해보세요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/wands/Ten of Wands.png',
        nameKo: '완드의 10', nameEn: 'Ten of Wands', keywords: '부담 · 책임 · 소진',
        reveal: ['끊기지는 않지만', '혼자 짊어지고 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '이 관계는 당장 끝나지는 않을 흐름이에요.',
            '다만 유지하는 무게가 한쪽에 쏠려 있어요.',
            'Ten of Wands는 혼자 다 짊어진 자리예요.',
            '이어가려는 노력이 의무처럼 변해가요.',
            '상대는 그 무게를 잘 모르고 있을 수 있어요.',
            '지치는 쪽이 먼저 손을 놓게 되는 구조예요.',
          ]],
          ['러브타로의 조언', [
            '이어가는 것 자체가 목표가 되면 위험해요.',
            '내가 지금 무엇을 들고 있는지 세어보세요.',
            '내려놓아도 되는 게 생각보다 많아요.',
            'Ten of Wands는 나눠 들라고 말하는 카드예요.',
            '말하지 않으면 상대는 계속 모를 거예요.',
            '어디까지 짊어질지 스스로 정해보세요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-09_sun', type: 'pick', seed: 89,
    hook: ['다음 주, 어긋나기만 하던 타이밍이', '맞아떨어질까요?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/temperance.png',
        nameKo: '절제', nameEn: 'Temperance', keywords: '조화 · 균형 · 인내',
        reveal: ['주 초반, 어긋나던 속도가', '조금씩 맞춰져요'],
        pages: [
          ['그 사람의 속마음', [
            '다음 주 초반에는 서로의 속도가 가까워져요.',
            '한쪽이 서두르고 한쪽이 물러나던 흐름이 줄어요.',
            '절제는 중간 지점을 찾는 카드예요.',
            '연락 간격이나 대화 온도가 비슷해질 수 있어요.',
            '큰 사건보다 편안함이 먼저 찾아와요.',
            '어긋남의 원인이 마음이 아니었다는 게 드러나요.',
          ]],
          ['러브타로의 조언', [
            '흐름이 좋아졌다고 급하게 밀어붙이지 마세요.',
            '이 카드는 속도를 지키는 사람 편이에요.',
            '상대 리듬에 맞추면 자연스럽게 가까워져요.',
            '무리한 약속보다 짧고 잦은 연락이 좋아요.',
            '절제는 시간이 관계를 완성한다고 말해요.',
            '지금의 균형을 그대로 지켜보세요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/wands/Knight of Wands.png',
        nameKo: '완드의 나이트', nameEn: 'Knight of Wands', keywords: '추진 · 행동 · 속도',
        reveal: ['주 중반, 한쪽이 먼저', '움직이기 시작해요'],
        pages: [
          ['그 사람의 속마음', [
            '주 중반에는 기다리던 흐름이 깨져요.',
            '누군가 먼저 움직이면서 속도가 붙어요.',
            'Knight of Wands는 계획보다 행동이 앞서는 자리예요.',
            '갑작스러운 제안이나 만남이 생길 수 있어요.',
            '망설임이 사라지면서 상황이 빠르게 바뀌어요.',
            '그 변화가 관계 전체의 방향을 정할 수 있어요.',
          ]],
          ['러브타로의 조언', [
            '갑자기 오는 제안에 당황하지 않도록 해두세요.',
            '거절도 수락도 미리 생각해두면 편해요.',
            '이 카드는 속도를 즐기는 사람에게 유리해요.',
            '다만 불붙듯 시작하면 식는 것도 빨라요.',
            '흐름을 타되 중심은 지켜두세요.',
            '어디까지 함께 갈지 정해두면 좋아요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/swords/King of Swords.png',
        nameKo: '소드의 킹', nameEn: 'King of Swords', keywords: '판단 · 결론 · 명확함',
        reveal: ['주 후반, 미뤄두던 것에', '분명한 답이 나와요'],
        pages: [
          ['그 사람의 속마음', [
            '주 후반에는 애매하게 남겨둔 것이 정리돼요.',
            'King of Swords는 결론을 내리는 자리예요.',
            '감정보다 사실을 기준으로 이야기하게 돼요.',
            '오래 미뤄둔 질문이 대화 한 번으로 풀릴 수 있어요.',
            '듣기 좋은 말보다 정확한 말이 오가요.',
            '분명해진다는 것만으로 마음이 가벼워져요.',
          ]],
          ['러브타로의 조언', [
            '묻고 싶은 것을 한 문장으로 정리해두세요.',
            '길게 돌려 말하면 이 흐름과 어긋나요.',
            '답이 원하는 방향이 아닐 수도 있어요.',
            '그래도 모르는 채로 있는 것보다 나아요.',
            'King of Swords는 명확함이 자유라고 말해요.',
            '그 답을 들을 준비만 해두면 돼요.',
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
