/**
 * Shortform (1080x1920) 세로형 본문 슬라이드 템플릿.
 * 카드 상단 hero + 하단 텍스트 스택 구조.
 *
 * 1080x1350 Layout B(asymmetric editorial)와 같은 톤·폰트·골드 프레임을
 * 공유하되, 세로형 피드/릴스에 맞춰 카드가 상단 포커스를 잡고
 * 텍스트는 중앙 정렬로 아래에 쌓이는 구조로 재구성.
 *
 * 디자인 기준: design-handoff/carousel-body-stress-test.html (Layout B)
 * 리사이즈가 아닌 세로형 전용 레이아웃.
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CARDS_DIR = resolve(__dirname, '../../public/images/cards-png')

const W = 1080
const H = 1920

// 상단 hero 영역 (0~850)
const CARD_W = 440
const CARD_H = 726
const CARD_X = (W - CARD_W) / 2 // 320
const CARD_Y = 112

// 두 영역 사이 구분선
const DIVIDER_Y = 900

// 하단 텍스트 스택 (950~1920), 중앙 정렬
const TEXT_CX = W / 2 // 540

const NAME_Y = 1020
const NAME_UNDERLINE_Y = 1046
const TITLE_Y = 1140
const TITLE_LEADING = 68
const WHISPER_GAP = 92 // title 마지막 줄에서 whisper까지 간격
const STAR_GAP = 70 // whisper에서 star까지
const STAR_TO_BODY = 60 // star에서 body 첫 줄까지

const KEYWORDS_Y = 1740
const FOOTER_HAIRLINE_Y = 1820
const FOOTER_Y = 1870

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
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${uid}-bg)"/>
    <ellipse cx="${W * 0.15}" cy="${H * 0.22}" rx="${W * 0.7}" ry="${H * 0.3}" fill="url(#${uid}-n1)"/>
    <ellipse cx="${W * 0.85}" cy="${H * 0.78}" rx="${W * 0.65}" ry="${H * 0.28}" fill="url(#${uid}-n2)"/>
    ${stars}
  `
}

// 우상단 초승달 장식 (mask로 카빙)
function crescentOrnament(seed, cx, cy, r) {
  const uid = `cr${seed}`
  const offsetX = r * 0.38
  return `
    <defs>
      <mask id="${uid}">
        <rect x="${cx - r - 2}" y="${cy - r - 2}" width="${r * 2 + 4}" height="${r * 2 + 4}" fill="black"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>
        <circle cx="${cx + offsetX}" cy="${cy - r * 0.08}" r="${r * 0.92}" fill="black"/>
      </mask>
    </defs>
    <rect x="${cx - r - 2}" y="${cy - r - 2}" width="${r * 2 + 4}" height="${r * 2 + 4}"
          fill="rgba(232,212,139,0.85)" mask="url(#${uid})"/>
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

export function carouselShortformSlide({
  cardSlug,
  nameEn,
  titleKo,
  subtitleEn,
  bodyLines,
  keywords,
  index,
  total,
}) {
  if (!Array.isArray(bodyLines)) {
    throw new Error('bodyLines must be an array')
  }
  if (bodyLines.length > 6) {
    console.warn(
      `[carouselShortformSlide] bodyLines 길이 ${bodyLines.length} - 6줄을 초과했습니다. 레이아웃이 깨질 수 있습니다. (cardSlug=${cardSlug})`
    )
  }

  const titleLines = Array.isArray(titleKo) ? titleKo : [titleKo]
  const n = bodyLines.length
  const bodyFontSize = n <= 3 ? 30 : n <= 5 ? 28 : 25
  const bodyLeading = n <= 3 ? 52 : n <= 5 ? 48 : 42

  const cardPath = resolve(CARDS_DIR, `${cardSlug}.png`)
  const cardBase64 = readFileSync(cardPath).toString('base64')
  const cardHref = `data:image/png;base64,${cardBase64}`

  const pageNum = String(index).padStart(2, '0')
  const totalStr = String(total).padStart(2, '0')
  const seed = Math.abs(
    cardSlug.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, index * 97 + 17)
  )

  // 수직 리듬 계산 (title 길이에 따라 whisper/star/body 위치 이동)
  const titleBottomY = TITLE_Y + (titleLines.length - 1) * TITLE_LEADING
  const whisperY = titleBottomY + WHISPER_GAP
  const starY = whisperY + STAR_GAP
  const bodyStartY = starY + STAR_TO_BODY

  const keywordsStr = Array.isArray(keywords) && keywords.length > 0
    ? keywords.map(k => esc(k)).join('  ·  ')
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    ${cosmicSky(seed)}
    <defs>
      <linearGradient id="hl-${seed}" x1="0" x2="1">
        <stop offset="0" stop-color="rgba(201,168,76,0)"/>
        <stop offset="0.5" stop-color="rgba(201,168,76,0.38)"/>
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

    <!-- 상단 strip: 초승달 + 얇은 hairline -->
    <line x1="95" x2="${W - 180}" y1="88" y2="88" stroke="url(#hl-${seed})" stroke-width="1"/>
    ${crescentOrnament(seed, W - 120, 82, 24)}

    <!-- 카드 hero (상단 중앙) -->
    ${cardFrameBack(CARD_X, CARD_Y, CARD_W, CARD_H)}
    <image href="${cardHref}" x="${CARD_X}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${seed})"/>
    ${cardFrameFront(CARD_X, CARD_Y, CARD_W, CARD_H)}

    <!-- 두 영역 사이 골드 구분선 -->
    <line x1="95" x2="${W - 95}" y1="${DIVIDER_Y}" y2="${DIVIDER_Y}" stroke="url(#hl-${seed})" stroke-width="1"/>

    <!-- 하단 텍스트 스택 (중앙 정렬) -->
    <!-- 영문 카드명 -->
    <text x="${TEXT_CX}" y="${NAME_Y}" text-anchor="middle" fill="rgba(200,180,140,0.65)" font-family="Georgia, serif" font-style="italic" font-size="34" letter-spacing="10">${esc(nameEn)}</text>
    <line x1="${TEXT_CX - 60}" x2="${TEXT_CX + 60}" y1="${NAME_UNDERLINE_Y}" y2="${NAME_UNDERLINE_Y}" stroke="rgba(201,168,76,0.5)" stroke-width="1"/>

    <!-- 한국어 제목 -->
    ${titleLines
      .map(
        (line, i) =>
          `<text x="${TEXT_CX}" y="${TITLE_Y + i * TITLE_LEADING}" text-anchor="middle" fill="#F4F8FF" font-family="'Noto Sans KR', 'Apple SD Gothic Neo', NanumSquare, sans-serif" font-weight="300" font-size="52" letter-spacing="6">${esc(line)}</text>`
      )
      .join('')}

    <!-- 영문 서브카피 -->
    ${
      subtitleEn
        ? `<text x="${TEXT_CX}" y="${whisperY}" text-anchor="middle" fill="rgba(232,212,139,0.70)" font-family="Georgia, serif" font-style="italic" font-size="26" letter-spacing="4">${esc(subtitleEn)}</text>`
        : ''
    }

    <!-- star ornament -->
    <text x="${TEXT_CX}" y="${starY}" text-anchor="middle" fill="rgba(232,212,139,0.75)" font-size="20">✦</text>

    <!-- 본문 -->
    <g fill="rgba(240,238,255,0.92)" font-family="'Noto Sans KR', 'Apple SD Gothic Neo', NanumSquare, sans-serif" font-weight="300" font-size="${bodyFontSize}" letter-spacing="2">
      ${bodyLines
        .map(
          (line, i) =>
            `<text x="${TEXT_CX}" y="${bodyStartY + i * bodyLeading}" text-anchor="middle">${esc(line)}</text>`
        )
        .join('')}
    </g>

    <!-- 키워드 -->
    ${
      keywordsStr
        ? `<text x="${TEXT_CX}" y="${KEYWORDS_Y}" text-anchor="middle" fill="#e8d48b" font-family="'Noto Sans KR', 'Apple SD Gothic Neo', NanumSquare, sans-serif" font-weight="400" font-size="20" letter-spacing="6">${keywordsStr}</text>`
        : ''
    }

    <!-- 하단 footer -->
    <line x1="95" x2="${W - 95}" y1="${FOOTER_HAIRLINE_Y}" y2="${FOOTER_HAIRLINE_Y}" stroke="url(#hl-${seed})" stroke-width="1"/>
    <text x="${W - 95}" y="${FOOTER_Y}" text-anchor="end" fill="url(#lm-${seed})" font-family="Georgia, serif" font-size="24" letter-spacing="8">LOVTARO</text>
  </svg>`
}
