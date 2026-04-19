/**
 * Layout B (Asymmetric editorial) - carousel body slide.
 * 좌측 카드 이미지 + 우측 텍스트 (eyebrow / kr title / en whisper / body).
 * 디자인 기준: design-handoff/carousel-body-stress-test.html
 *
 * Returns a self-contained SVG string (PNG card embedded as base64 data URI)
 * that sharp can render directly: `sharp(Buffer.from(svgString)).png()`.
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CARDS_DIR = resolve(__dirname, '../../public/images/cards-png')

const W = 1080
const H = 1350
const CARD_W = 400
const CARD_H = 660
const CARD_X = 95
const CARD_Y = 345
const TEXT_X = CARD_X + CARD_W + 90

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function cosmicSky(seed) {
  const rand = mulberry32(seed)
  const starCount = Math.floor((W * H) / 8000)
  const colors = ['#e8d48b', '#c9a84c', '#d4b85c', '#ffffff', '#fff5d4']
  let stars = ''
  for (let i = 0; i < starCount; i++) {
    const cx = (rand() * W).toFixed(1)
    const cy = (rand() * H).toFixed(1)
    const r = (0.3 + rand() * 2.0).toFixed(2)
    const op = (0.2 + rand() * 0.65).toFixed(2)
    const fill = colors[Math.floor(rand() * colors.length)]
    stars += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}"/>`
  }
  const uid = `s${seed}`
  const minDim = Math.min(W, H)
  const moonR = minDim * 0.055
  const moonCx = W * 0.18
  const moonCy = H * 0.08
  const moonOffsetX = W * 0.025
  const moonOffsetY = H * 0.008
  return `
    <defs>
      <radialGradient id="${uid}-bg" cx="50%" cy="45%" r="85%">
        <stop offset="0%" stop-color="#1a0f38"/>
        <stop offset="35%" stop-color="#140b2c"/>
        <stop offset="75%" stop-color="#0c0820"/>
        <stop offset="100%" stop-color="#06040f"/>
      </radialGradient>
      <radialGradient id="${uid}-n1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(190,110,60,0.22)"/>
        <stop offset="100%" stop-color="rgba(180,100,60,0)"/>
      </radialGradient>
      <radialGradient id="${uid}-n2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(140,70,130,0.18)"/>
        <stop offset="100%" stop-color="rgba(130,60,120,0)"/>
      </radialGradient>
      <radialGradient id="${uid}-mg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(255,235,185,0.25)"/>
        <stop offset="100%" stop-color="rgba(255,235,185,0)"/>
      </radialGradient>
      <mask id="${uid}-mm">
        <rect width="${W}" height="${H}" fill="black"/>
        <circle cx="${moonCx}" cy="${moonCy}" r="${moonR}" fill="white"/>
        <circle cx="${moonCx + moonOffsetX}" cy="${moonCy - moonOffsetY}" r="${moonR}" fill="black"/>
      </mask>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${uid}-bg)"/>
    <ellipse cx="${W * 0.15}" cy="${H * 0.25}" rx="${W * 0.7}" ry="${H * 0.35}" fill="url(#${uid}-n1)"/>
    <ellipse cx="${W * 0.85}" cy="${H * 0.75}" rx="${W * 0.65}" ry="${H * 0.3}" fill="url(#${uid}-n2)"/>
    <circle cx="${moonCx}" cy="${moonCy}" r="${minDim * 0.12}" fill="url(#${uid}-mg)"/>
    <rect x="${W * 0.08}" y="${H * 0.04}" width="${W * 0.2}" height="${W * 0.2}"
          fill="rgba(248,230,185,0.95)" mask="url(#${uid}-mm)"/>
    ${stars}
  `
}

function cardFrameBack(x, y, w, h) {
  return `
    <rect x="${x - 22}" y="${y - 22}" width="${w + 44}" height="${h + 44}" fill="none" stroke="rgba(201,168,76,0.65)" stroke-width="2"/>
    <rect x="${x - 14}" y="${y - 14}" width="${w + 28}" height="${h + 28}" fill="none" stroke="rgba(201,168,76,0.32)" stroke-width="1"/>
  `
}

function cardFrameFront(x, y, w, h) {
  const cornerLen = Math.min(w, h) * 0.12
  const gold = 'rgba(232,212,139,0.75)'
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="rgba(232,212,139,0.85)" stroke-width="1.5"/>
    <path d="M ${x - 28 + cornerLen} ${y - 28} L ${x - 28} ${y - 28} L ${x - 28} ${y - 28 + cornerLen}" fill="none" stroke="${gold}" stroke-width="2"/>
    <path d="M ${x + w + 28 - cornerLen} ${y - 28} L ${x + w + 28} ${y - 28} L ${x + w + 28} ${y - 28 + cornerLen}" fill="none" stroke="${gold}" stroke-width="2"/>
    <path d="M ${x - 28 + cornerLen} ${y + h + 28} L ${x - 28} ${y + h + 28} L ${x - 28} ${y + h + 28 - cornerLen}" fill="none" stroke="${gold}" stroke-width="2"/>
    <path d="M ${x + w + 28 - cornerLen} ${y + h + 28} L ${x + w + 28} ${y + h + 28} L ${x + w + 28} ${y + h + 28 - cornerLen}" fill="none" stroke="${gold}" stroke-width="2"/>
  `
}

export function carouselBodySlide({
  cardSlug,
  nameEn,
  titleKo,
  subtitleEn,
  bodyLines,
  index,
  total,
}) {
  if (!Array.isArray(bodyLines)) {
    throw new Error('bodyLines must be an array')
  }
  if (bodyLines.length > 6) {
    console.warn(
      `[carouselBodySlide] bodyLines 길이 ${bodyLines.length} - 6줄을 초과했습니다. 레이아웃이 깨질 수 있습니다. (cardSlug=${cardSlug})`
    )
  }

  const titleLines = Array.isArray(titleKo) ? titleKo : [titleKo]
  const n = bodyLines.length
  const bodyFontSize = n <= 3 ? 27 : n <= 5 ? 25 : 23
  const bodyLeading = n <= 3 ? 46 : n <= 5 ? 42 : 38
  const bodyStartY = CARD_Y + (n <= 3 ? 430 : n <= 5 ? 400 : 360)

  const cardPath = resolve(CARDS_DIR, `${cardSlug}.png`)
  const cardBase64 = readFileSync(cardPath).toString('base64')
  const cardHref = `data:image/png;base64,${cardBase64}`

  const pageNum = String(index).padStart(2, '0')
  const totalStr = String(total).padStart(2, '0')
  const seed = Math.abs(
    cardSlug.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, index * 97 + 13)
  )

  const titleBaselineY = CARD_Y + 150
  const whisperY = titleBaselineY + titleLines.length * 60 + 20

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    ${cosmicSky(seed)}
    <defs>
      <linearGradient id="hl-${seed}" x1="0" x2="1">
        <stop offset="0" stop-color="rgba(201,168,76,0)"/>
        <stop offset="0.5" stop-color="rgba(201,168,76,0.32)"/>
        <stop offset="1" stop-color="rgba(201,168,76,0)"/>
      </linearGradient>
      <linearGradient id="lm-${seed}" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#D4B87A"/>
        <stop offset="45%" stop-color="#E8D09A"/>
        <stop offset="100%" stop-color="#C8A96E"/>
      </linearGradient>
      <clipPath id="clip-${seed}">
        <rect x="${CARD_X}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" rx="6"/>
      </clipPath>
    </defs>

    <text x="95" y="148" fill="rgba(232,212,139,0.75)" font-family="Georgia, serif" font-style="italic" font-size="26" letter-spacing="6">${esc(pageNum)}</text>
    <line x1="145" x2="${W - 95}" y1="142" y2="142" stroke="url(#hl-${seed})" stroke-width="1"/>

    ${cardFrameBack(CARD_X, CARD_Y, CARD_W, CARD_H)}
    <image href="${cardHref}" x="${CARD_X}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${seed})"/>
    ${cardFrameFront(CARD_X, CARD_Y, CARD_W, CARD_H)}

    <text x="${TEXT_X}" y="${CARD_Y + 40}" fill="rgba(200,180,140,0.65)" font-family="Georgia, serif" font-style="italic" font-size="26" letter-spacing="8">${esc(nameEn)}</text>
    <line x1="${TEXT_X}" x2="${TEXT_X + 70}" y1="${CARD_Y + 66}" y2="${CARD_Y + 66}" stroke="rgba(201,168,76,0.45)" stroke-width="1"/>

    ${titleLines
      .map(
        (line, i) =>
          `<text x="${TEXT_X}" y="${titleBaselineY + i * 60}" fill="#F4F8FF" font-family="'Noto Sans KR', 'Apple SD Gothic Neo', NanumSquare, sans-serif" font-weight="300" font-size="44" letter-spacing="6">${esc(line)}</text>`
      )
      .join('')}

    ${
      subtitleEn
        ? `<text x="${TEXT_X}" y="${whisperY + 40}" fill="rgba(232,212,139,0.70)" font-family="Georgia, serif" font-style="italic" font-size="22" letter-spacing="3">${esc(subtitleEn)}</text>`
        : ''
    }

    <text x="${TEXT_X}" y="${bodyStartY - 60}" fill="rgba(232,212,139,0.7)" font-size="16">✦</text>

    <g fill="rgba(240,238,255,0.92)" font-family="'Noto Sans KR', 'Apple SD Gothic Neo', NanumSquare, sans-serif" font-weight="300" font-size="${bodyFontSize}" letter-spacing="2">
      ${bodyLines
        .map(
          (line, i) =>
            `<text x="${TEXT_X}" y="${bodyStartY + i * bodyLeading}">${esc(line)}</text>`
        )
        .join('')}
    </g>

    <line x1="95" x2="${W - 95}" y1="${H - 95}" y2="${H - 95}" stroke="url(#hl-${seed})" stroke-width="1"/>
    <text x="95" y="${H - 55}" fill="rgba(200,180,140,0.55)" font-family="Georgia, serif" font-style="italic" font-size="20" letter-spacing="4">${esc(pageNum)} / ${esc(totalStr)}</text>
    <text x="${W - 95}" y="${H - 55}" text-anchor="end" fill="url(#lm-${seed})" font-family="Georgia, serif" font-size="22" letter-spacing="8">LOVTARO</text>
  </svg>`
}
