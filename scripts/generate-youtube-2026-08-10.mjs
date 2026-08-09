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
    date: '2026-08-10_mon', type: 'pick', seed: 810,
    hook: ['요즘 유난히 마음에 걸리는 사람이 있다면', '지금 하나만 골라보세요'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/wheel-of-fortune.png',
        nameKo: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', keywords: '전환 · 흐름 · 타이밍',
        reveal: ['멈춘 것 같아도', '안에서는 이미 돌고 있어요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람도 지금 상황이 애매하다고 느끼고 있어요.',
            '다만 먼저 방향을 정할 힘이 없는 상태예요.',
            '운명의 수레바퀴는 사람보다 상황이 먼저 움직이는 자리예요.',
            '누가 애써서가 아니라 계기가 판을 바꿔요.',
            '예상 못 한 자리에서 다시 마주칠 수 있어요.',
            '지금의 정지는 오래 가지 않아요.',
          ]],
          ['러브타로의 조언', [
            '억지로 흐름을 만들려고 하지 않아도 돼요.',
            '지금은 밀어붙이는 것보다 준비하는 시기예요.',
            '기회가 왔을 때 잡을 수 있게 마음만 열어두세요.',
            '이 카드는 두 번째 기회를 자주 말해요.',
            '끝났다고 정리했던 인연도 다시 돌아올 수 있어요.',
            '방향이 보일 때까지 조금만 기다려보세요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/swords/Ace of Swords.png',
        nameKo: '소드의 에이스', nameEn: 'Ace of Swords', keywords: '명확함 · 진실 · 결단',
        reveal: ['흐릿하던 마음에', '이름이 붙어요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람 마음은 생각보다 이미 정리돼 있어요.',
            '표현을 안 했을 뿐 결론은 서 있는 상태예요.',
            'Ace of Swords는 애매함이 걷히는 자리를 말해요.',
            '좋은 쪽이든 아닌 쪽이든 답이 분명해져요.',
            '한마디로 상황이 정리될 수 있어요.',
            '더 이상 눈치로 읽어야 할 구간은 아니에요.',
          ]],
          ['러브타로의 조언', [
            '추측을 늘리는 것보다 확인하는 게 빨라요.',
            '이 카드는 돌려 말하는 방식과 잘 맞지 않아요.',
            '두려운 건 답 자체가 아니라 모르는 상태예요.',
            '답을 들으면 오히려 마음이 가벼워질 수 있어요.',
            '진실이 관계를 끝내지는 않아요.',
            '어떤 답이든 받아들일 준비만 해두세요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Ten of Pentacles.png',
        nameKo: '펜타클의 10', nameEn: 'Ten of Pentacles', keywords: '안정 · 오래가는 사랑 · 기반',
        reveal: ['스치는 인연이 아니라', '오래 남는 자리예요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람은 당신을 가벼운 대상으로 보지 않아요.',
            '그래서 오히려 더 조심스럽게 움직이고 있어요.',
            'Ten of Pentacles는 길게 보는 마음을 말해요.',
            '설렘보다 안정감으로 확인되는 관계예요.',
            '지금 걸리는 이유도 쉽게 지워지지 않아서예요.',
            '이 사람 안에서 당신은 이미 자리가 있어요.',
          ]],
          ['러브타로의 조언', [
            '빠른 반응이 없다고 관심이 없는 건 아니에요.',
            '이 카드는 속도보다 지속을 보는 자리예요.',
            '조급하게 확인을 요구하면 오히려 뒤로 물러서요.',
            '천천히 쌓이는 신뢰를 지켜봐 주세요.',
            '오래 남을 관계일수록 시작이 느려요.',
            '지금 자리를 지키는 것만으로 충분해요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-11_tue', type: 'pick', seed: 811,
    hook: ['만날수록 좋아지는 그 사람과 나', '지금 어느 계절쯤 와 있을까요?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/death.png',
        nameKo: '죽음', nameEn: 'Death', keywords: '전환 · 정리 · 새 형태',
        reveal: ['겨울 끝자락이에요', '봄은 그다음이에요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람도 지금까지의 방식이 안 맞는다고 느껴요.',
            '관계가 싫어진 게 아니라 형태가 낡은 거예요.',
            '죽음은 끝이 아니라 모양이 바뀌는 자리예요.',
            '예전처럼 지내기는 어려워졌다고 생각하고 있어요.',
            '다만 어떻게 바꿔야 할지는 모르는 상태예요.',
            '지금은 지나가는 계절의 끝에 서 있어요.',
          ]],
          ['러브타로의 조언', [
            '예전 모습으로 되돌리려 애쓰지 않아도 돼요.',
            '지나간 방식은 이미 역할을 다했어요.',
            '무엇을 남기고 무엇을 놓을지 정해보세요.',
            '정리가 끝나야 다음 계절이 들어와요.',
            '이 카드는 상실보다 전환을 말해요.',
            '겨울을 지나야 봄이 오는 자리예요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/pentacles/Queen of Pentacles.png',
        nameKo: '펜타클의 여왕', nameEn: 'Queen of Pentacles', keywords: '돌봄 · 안정 · 실용적 사랑',
        reveal: ['지금 가장 따뜻한', '계절 한가운데예요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람은 말보다 챙김으로 마음을 보여줘요.',
            '표현이 화려하지 않아 지나치기 쉬워요.',
            'Queen of Pentacles는 생활 속에서 확인되는 사랑이에요.',
            '작은 것을 기억하고 챙기는 방식으로 나타나요.',
            '지금 두 사람 사이는 안정적으로 쌓이는 중이에요.',
            '설렘은 줄어도 온기는 오히려 늘고 있어요.',
          ]],
          ['러브타로의 조언', [
            '표현이 적다고 마음을 의심하지 않아도 돼요.',
            '이 사람의 언어는 행동 쪽에 가까워요.',
            '무엇을 챙겨주는지 한 번 세어보세요.',
            '이 카드는 오래 가는 관계를 말해요.',
            '뜨거움보다 꾸준함이 강점인 자리예요.',
            '지금 온도를 그대로 지켜도 좋아요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/wands/Three of Wands.png',
        nameKo: '완드의 3', nameEn: 'Three of Wands', keywords: '확장 · 기다림 · 전진',
        reveal: ['봄이 막 시작된', '자리예요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람은 이미 방향을 앞쪽으로 두고 있어요.',
            '표현이 아직 도착하지 않았을 뿐이에요.',
            'Three of Wands는 씨를 뿌리고 기다리는 자리예요.',
            '결과가 안 보인다고 아무 일도 없는 게 아니에요.',
            '두 사람 사이는 이제 막 시작 지점을 지났어요.',
            '지금은 자라는 중인 관계예요.',
          ]],
          ['러브타로의 조언', [
            '조급하게 결과를 확인하려 하지 않아도 돼요.',
            '이 시기의 관계는 눈에 잘 안 보여요.',
            '방향이 맞다면 시간은 당신 편이에요.',
            '멀리 보는 사람에게 유리한 카드예요.',
            '지금 흔들리는 건 자라는 과정일 수 있어요.',
            '곧 무엇이 도착할지 기다려보세요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-12_wed', type: 'single', seed: 812,
    hook: ['마음은 있어 보이는데,', '왜 자꾸 재는 느낌이 들까?'],
    cards: [
      {
        no: 1, numGlyph: '', file: 'mcards/swords/Seven of Swords.png',
        nameKo: '소드의 7', nameEn: 'Seven of Swords', keywords: '기만 · 회피 · 숨겨진 것',
        reveal: ['숨기는 게 아니라', '계산하고 있는 거예요'],
        pages: [
          ['지금 내 마음', [
            '분명 관심은 있는 것 같은데 확신이 안 서요.',
            '가까워지는 것 같다가 결정적일 때 물러서요.',
            '그래서 내가 오해한 건가 싶어질 때가 있어요.',
            '물어보자니 관계가 어색해질까 걱정되고요.',
            '가만히 있자니 계속 제자리를 맴돌아요.',
            '이 애매함이 제일 지치는 부분이에요.',
          ]],
          ['카드의 메시지', [
            'Seven of Swords는 마음이 없는 상태가 아니에요.',
            '먼저 다칠까 봐 계산하고 있는 자리예요.',
            '전부 걸었다가 혼자 남을까 두려운 거예요.',
            '그래서 감정을 조금씩 나눠서 꺼내요.',
            '확신을 요구할수록 더 뒤로 물러서요.',
            '재는 행동은 거절이 아니라 방어에 가까워요.',
          ]],
          ['러브타로의 조언', [
            '지금 필요한 건 확답이 아니라 안심이에요.',
            '먼저 안전한 자리를 만들어주면 달라져요.',
            '떠보거나 시험하는 방식은 역효과예요.',
            '내 마음을 담담하게 먼저 보여줘도 좋아요.',
            '상대가 재는 걸 멈추면 속도가 빨라져요.',
            '다만 기다리는 기한은 스스로 정해두세요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-13_thu', type: 'pick', seed: 813,
    hook: ['좁혀질까,', '벌어질까?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/judgement.png',
        nameKo: '심판', nameEn: 'Judgement', keywords: '부름 · 재시작 · 정리',
        reveal: ['멀어졌던 거리가', '다시 좁혀져요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람 안에서 관계는 아직 끝나지 않았어요.',
            '정리했다고 생각했는데 자꾸 되돌아봐요.',
            '심판은 끝난 자리에서 다시 부르는 카드예요.',
            '연락할 이유를 찾고 있을 수 있어요.',
            '먼저 움직이는 게 어색해서 미루는 중이에요.',
            '거리는 좁혀지는 쪽으로 기울고 있어요.',
          ]],
          ['러브타로의 조언', [
            '지난 일을 정리하지 않으면 다시 같은 자리예요.',
            '무엇이 어긋났는지 한 번은 짚어야 해요.',
            '그 과정을 건너뛰면 재회도 오래 못 가요.',
            '이 카드는 용서보다 이해를 말해요.',
            '다시 시작할지는 그다음에 정해도 돼요.',
            '연락이 온다면 놀라지 않아도 좋아요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/swords/Three of Swords.png',
        nameKo: '소드의 3', nameEn: 'Three of Swords', keywords: '이별 · 상처 · 진실',
        reveal: ['지금은 벌어지는', '쪽에 가까워요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람도 서운함을 안에 쌓아두고 있어요.',
            '말하지 않아서 없어진 게 아니에요.',
            'Three of Swords는 덮어둔 것이 드러나는 자리예요.',
            '한 번은 아프게 확인해야 하는 구간이에요.',
            '지금 거리는 잠시 더 벌어질 수 있어요.',
            '다만 그게 관계의 끝을 뜻하지는 않아요.',
          ]],
          ['러브타로의 조언', [
            '아픈 걸 피하려고 덮으면 더 곪아요.',
            '이 카드는 정직한 대화를 요구해요.',
            '상처를 확인하는 게 회복의 시작이에요.',
            '지금 벌어지는 건 진실이 나오는 과정이에요.',
            '무엇이 서운했는지 서로 말해봐도 좋아요.',
            '그 뒤에 남는 게 진짜 관계예요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/Two of Pentacles.png',
        nameKo: '펜타클의 2', nameEn: 'Two of Pentacles', keywords: '균형 · 조율 · 유연함',
        reveal: ['좁혀지지도 벌어지지도', '않고 흔들려요'],
        pages: [
          ['그 사람의 속마음', [
            '이 사람은 지금 마음이 한쪽으로 안 기울어요.',
            '좋기도 하고 부담스럽기도 한 상태예요.',
            'Two of Pentacles는 두 마음을 저울질하는 자리예요.',
            '관계 말고도 신경 쓸 일이 많을 수 있어요.',
            '그래서 반응이 일정하지 않게 나와요.',
            '아직 결정을 내리지 않은 구간이에요.',
          ]],
          ['러브타로의 조언', [
            '지금 답을 강요하면 흔들림만 커져요.',
            '이 카드는 시간이 필요한 자리를 말해요.',
            '내 쪽 리듬을 상대에게 맞추지 마세요.',
            '기다리는 동안 내 균형부터 잡아두세요.',
            '한쪽으로 기울 때까지 이 상태가 이어져요.',
            '언제까지 기다릴지는 스스로 정해도 좋아요.',
          ]],
        ],
      },
    ],
  },
  {
    date: '2026-08-16_sun', type: 'pick', seed: 816,
    hook: ['다음 주, 두 사람 사이', '공기가 달라질까요?'],
    cards: [
      {
        no: 1, numGlyph: '①', file: 'cards-png/hanged-man.png',
        nameKo: '매달린 사람', nameEn: 'The Hanged Man', keywords: '멈춤 · 전환 · 다른 시선',
        reveal: ['주 초반, 멈춘 자리에서', '보이는 게 달라져요'],
        pages: [
          ['그 사람의 속마음', [
            '다음 주 이 사람은 서두르지 않을 거예요.',
            '상황을 한 발 물러서서 보고 있어요.',
            '매달린 사람은 시점이 바뀌는 자리를 말해요.',
            '같은 일인데 주 중반쯤 다르게 읽히기 시작해요.',
            '멈춰 있는 것처럼 보여도 안에서는 정리 중이에요.',
            '결론은 주 후반에 가까워질수록 선명해져요.',
          ]],
          ['러브타로의 조언', [
            '다음 주는 밀어붙이는 쪽이 불리해요.',
            '반응이 느려도 재촉하지 않는 게 좋아요.',
            '내 쪽에서도 한 박자 쉬어가 보세요.',
            '멈춘 자리에서 놓쳤던 게 보일 수 있어요.',
            '이 카드는 기다림을 손해로 보지 않아요.',
            '시야가 바뀌면 답도 바뀌어요.',
          ]],
        ],
      },
      {
        no: 2, numGlyph: '②', file: 'mcards/cups/Seven of Cups.png',
        nameKo: '컵의 7', nameEn: 'Seven of Cups', keywords: '환상 · 선택 · 혼란',
        reveal: ['주 중반, 마음이', '여러 갈래로 흔들려요'],
        pages: [
          ['그 사람의 속마음', [
            '다음 주 이 사람은 선택지가 많아져요.',
            '무엇이 진짜인지 스스로도 헷갈리는 상태예요.',
            'Seven of Cups는 좋아 보이는 것이 섞이는 자리예요.',
            '마음이 없는 게 아니라 정리가 안 된 거예요.',
            '주 중반쯤 반응이 오락가락할 수 있어요.',
            '결정은 이번 주 안에 나지 않을 수 있어요.',
          ]],
          ['러브타로의 조언', [
            '상대의 흔들림을 내 탓으로 돌리지 마세요.',
            '이 카드는 선택 과잉을 말하는 자리예요.',
            '내 조건을 분명히 해두면 오히려 눈에 띄어요.',
            '여러 가능성을 다 붙잡으려 하지 마세요.',
            '하나씩 걷어내면 남는 게 보여요.',
            '끝까지 남는 쪽이 진짜예요.',
          ]],
        ],
      },
      {
        no: 3, numGlyph: '③', file: 'mcards/pentacles/King of Pentacles.png',
        nameKo: '펜타클의 킹', nameEn: 'King of Pentacles', keywords: '안정 · 신뢰 · 든든함',
        reveal: ['주 후반, 흔들리던 자리에', '단단함이 들어서요'],
        pages: [
          ['그 사람의 속마음', [
            '다음 주 후반 이 사람은 자리를 잡아요.',
            '막연하던 마음에 현실적인 기반이 생겨요.',
            'King of Pentacles는 행동으로 신뢰를 만드는 카드예요.',
            '말보다 실제로 챙기는 모습이 나올 수 있어요.',
            '약속이나 계획이 구체적으로 잡힐 수 있어요.',
            '주 후반은 이번 주에서 가장 안정적인 구간이에요.',
          ]],
          ['러브타로의 조언', [
            '화려한 표현을 기대하면 실망할 수 있어요.',
            '이 사람의 언어는 책임 쪽에 가까워요.',
            '무엇을 실제로 해주는지 봐주세요.',
            '이 카드는 오래 가는 관계를 말해요.',
            '지금의 안정을 지루함으로 읽지 마세요.',
            '단단해진 자리에서 다음이 시작돼요.',
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
