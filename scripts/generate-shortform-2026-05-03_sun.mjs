/**
 * Sunday Tarot Preview - 다음 주 연애 흐름 PICK (7컷)
 * 일요일 전용 예고형 릴스 (주간 시리즈 고정 포맷)
 *
 * scene01: 훅 - "다음 주 연애 흐름, 월요일 전에 미리 확인하세요" + 흐릿한 뒷면 3장
 * scene02: 선택 유도 - 컬러 variant 뒷면 3장 + 번호
 * scene03: 정지 유도 - "선택했나요?" + 카드 확대 글로우
 * scene04: 1번 공개 (The Star) - 프레임 카드 + 키워드 + 한줄 훅
 * scene05: 2번 공개 (Knight of Cups) - 동일 구조
 * scene06: 3번 공개 (Ace of Wands) - 동일 구조
 * scene07: 저장 CTA - 3장 썸네일 + 저장 유도 + 댓글 답글 유도
 *
 * CapCut에서 각 씬에 전환/줌/타이밍 편집 예정 (sharp는 정적 PNG만 생성).
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { colorCardBackSvg, colorCardBackDefs, CARD_WIDTH, CARD_HEIGHT, pickRandomSchemes, getSchemeAccent } from './lib/color-card-back-svg.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-05-03_sun/shortform')
const W = 1080, H = 1920

const KO_STACK = `'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif`

// 공개 카드 3장 - 희망/접근/급변 3축. hook은 string(1줄) 또는 [상단, 하단] 2줄 배열.
// imageSrc: cards-png/*.png 일부(knight-of-cups, ace-of-wands 등)는 1200x630 OG 이미지라 세로 크롭 시 손실 큼.
//   → portrait 원본(cards/*.webp 600x900 또는 mcards/{suit}/{Name}.png 1024x1536) 명시
// 매듭/움직임/결단 3축 - World(완성) / Knight of Wands(점화) / Judgement(깨달음)
const CARDS = [
  { num: '①', slug: 'world',           imageSrc: 'public/images/cards-png/world.png',
    nameKr: '세계',         nameEn: 'The World',        keywords: '완성 · 매듭 · 정리',
    hook: ['주 초반, 끌고 왔던 매듭이', '자연스럽게 풀릴 수 있어요'] },
  { num: '②', slug: 'knight-of-wands', imageSrc: 'public/images/mcards/wands/Knight of Wands.png',
    nameKr: '완드의 나이트',    nameEn: 'Knight of Wands',  keywords: '점화 · 움직임 · 속도',
    hook: ['주 중반,', '멈춰 있던 흐름에 불씨가 붙을 수 있어요'] },
  { num: '③', slug: 'judgement',       imageSrc: 'public/images/cards-png/judgement.png',
    nameKr: '심판',         nameEn: 'Judgement',        keywords: '깨달음 · 결단 · 정리',
    hook: ['주 후반, 흐릿했던 감정이', '또렷한 답으로 다가올 수 있어요'] },
]

// scene01/02/03 공통 카드 뒷면 스킴 - 한 번 픽해서 세 씬 모두 동일 색상 유지
const [SCHEME_1, SCHEME_2, SCHEME_3] = pickRandomSchemes(3)
console.log(`🎴 schemes (shared across scene01/02/03): ${SCHEME_1} / ${SCHEME_2} / ${SCHEME_3}`)

function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function genStars(count, seed, xMin, xMax, yMin, yMax, bright = false) {
  const rand = mulberry32(seed)
  const colors = bright
    ? ['#ffe9b3', '#f4d99f', '#e8d48b', '#ffffff', '#fff5d4']
    : ['#e8d48b', '#c9a84c', '#d4b85c', '#b89858', '#8f7a4a']
  let stars = ''
  for (let i = 0; i < count; i++) {
    const x = xMin + rand() * (xMax - xMin)
    const y = yMin + rand() * (yMax - yMin)
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
    <radialGradient id="neb1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(190,110,60,0.22)"/>
      <stop offset="60%" stop-color="rgba(160,80,50,0.08)"/>
      <stop offset="100%" stop-color="rgba(180,100,60,0)"/>
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
  `
}

function participationBody(starSeed = 1) {
  const stars1 = genStars(260, starSeed, 0, W, 0, H, false)
  const stars2 = genStars(70, starSeed + 11, 0, W, 0, H, true)
  return `
    <rect width="${W}" height="${H}" fill="url(#cosmicBg)"/>
    <ellipse cx="900" cy="1700" rx="500" ry="350" fill="url(#neb3)"/>
    <ellipse cx="180" cy="1550" rx="400" ry="300" fill="url(#neb2)"/>
    ${stars1}
    ${stars2}
    <circle cx="125" cy="205" r="80" fill="url(#moonGlow)"/>
    <rect x="70" y="150" width="120" height="120" fill="rgba(248,230,185,0.9)" mask="url(#moonMaskSmall)"/>
  `
}

function cosmicBodyNoMoon(starSeed = 1) {
  const stars1 = genStars(320, starSeed, 0, W, 0, H, false)
  const stars2 = genStars(120, starSeed + 11, 0, W, 0, H, true)
  const stars3 = genStars(60, starSeed + 23, 0, W, 0, H, true)
  return `
    <rect width="${W}" height="${H}" fill="url(#cosmicBg)"/>
    <ellipse cx="120" cy="720" rx="520" ry="420" fill="url(#neb1)"/>
    <ellipse cx="980" cy="1280" rx="520" ry="460" fill="url(#neb2)"/>
    <ellipse cx="540" cy="1750" rx="620" ry="320" fill="url(#neb3)"/>
    <ellipse cx="760" cy="400" rx="380" ry="300" fill="url(#neb3)"/>
    ${stars1}
    ${stars2}
    ${stars3}
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

// --- scene01: 훅 + 카드 뒷면 3장 (중간 블러 + 강한 아우라) ---
async function scene01() {
  const cardScale = 2.4
  const cardPixelW = CARD_WIDTH * cardScale
  const cardPixelH = CARD_HEIGHT * cardScale
  const cardGap = 44
  const totalWidth = cardPixelW * 3 + cardGap * 2
  const startCX = (W - totalWidth) / 2 + cardPixelW / 2
  const cardY = 1180

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      ${colorCardBackDefs()}
      <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="7"/>
      </filter>
      <radialGradient id="cardAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(232,212,139,0.22)"/>
        <stop offset="60%" stop-color="rgba(180,140,210,0.08)"/>
        <stop offset="100%" stop-color="rgba(20,10,40,0)"/>
      </radialGradient>
    </defs>
    ${cosmicBodyNoMoon(17)}

    <ellipse cx="540" cy="${cardY}" rx="640" ry="420" fill="url(#cardAura)" filter="url(#glowBlur)"/>

    <g opacity="0.55" filter="url(#softBlur)">
      ${colorCardBackSvg(startCX, cardY, cardScale, SCHEME_1)}
      ${colorCardBackSvg(startCX + cardPixelW + cardGap, cardY, cardScale, SCHEME_2)}
      ${colorCardBackSvg(startCX + (cardPixelW + cardGap) * 2, cardY, cardScale, SCHEME_3)}
    </g>

    <g filter="url(#softGlow)">
      <text x="540" y="420" text-anchor="middle" font-family="${KO_STACK}" font-size="58" fill="#F4F8FF" letter-spacing="2" font-weight="300">다음 주 연애 흐름,</text>
      <text x="540" y="505" text-anchor="middle" font-family="${KO_STACK}" font-size="58" fill="#F4F8FF" letter-spacing="2" font-weight="300">지금 하나만 골라보세요</text>
    </g>

    <g opacity="0.85">
      <circle cx="398" cy="610" r="3" fill="#e8d48b"/>
      <line x1="414" y1="610" x2="666" y2="610" stroke="rgba(232,212,139,0.55)" stroke-width="1"/>
      <circle cx="682" cy="610" r="3" fill="#e8d48b"/>
    </g>

    <text x="540" y="680" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="32" fill="rgba(232,212,139,0.82)" letter-spacing="3">Sunday Tarot Preview</text>

    <g filter="url(#softGlow)">
      <text x="540" y="725" text-anchor="middle" font-family="${KO_STACK}" font-size="28" fill="rgba(244,248,255,0.75)" letter-spacing="3" font-weight="300">지금 고른 카드가 다음 주 흐름을 열어줘요</text>
    </g>

    <text x="540" y="1860" text-anchor="middle" font-family="${KO_STACK}" font-size="24" fill="rgba(232,212,139,0.55)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene01.png'), buf)
  console.log(`✅ scene01.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

// --- scene02: 선택 유도 - 카드 뒷면 3장 + 번호 ---
async function scene02() {
  const cardScale = 2.5
  const cardPixelW = CARD_WIDTH * cardScale
  const cardPixelH = CARD_HEIGHT * cardScale
  const cardGap = 50
  const totalWidth = cardPixelW * 3 + cardGap * 2
  const startCX = (W - totalWidth) / 2 + cardPixelW / 2
  const cardY = 980
  const numberY = cardY + cardPixelH / 2 + 55

  const cx1 = startCX
  const cx2 = startCX + cardPixelW + cardGap
  const cx3 = startCX + (cardPixelW + cardGap) * 2

  const s1 = SCHEME_1, s2 = SCHEME_2, s3 = SCHEME_3

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      ${colorCardBackDefs()}
      <filter id="midNumGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    ${participationBody(3)}

    <ellipse cx="540" cy="${cardY}" rx="500" ry="380" fill="url(#cardAreaGlow)" filter="url(#glowBlur)"/>

    <g filter="url(#softGlow)">
      <text x="540" y="430" text-anchor="middle" font-family="${KO_STACK}" font-size="52" fill="#F4F8FF" letter-spacing="3" font-weight="300">직감으로 하나 골라보세요</text>
    </g>

    <ellipse cx="${cx1}" cy="${cardY}" rx="${cardPixelW * 0.8}" ry="${cardPixelH * 0.55}" fill="url(#colorCardGlow_${s1})" filter="url(#glowBlur)"/>
    <ellipse cx="${cx2}" cy="${cardY}" rx="${cardPixelW * 0.85}" ry="${cardPixelH * 0.6}" fill="url(#colorCardGlow_${s2})" filter="url(#glowBlur)"/>
    <ellipse cx="${cx3}" cy="${cardY}" rx="${cardPixelW * 0.8}" ry="${cardPixelH * 0.55}" fill="url(#colorCardGlow_${s3})" filter="url(#glowBlur)"/>

    <g filter="url(#cardShadow)">
      ${colorCardBackSvg(cx1, cardY, cardScale, s1)}
      ${colorCardBackSvg(cx2, cardY, cardScale, s2)}
      ${colorCardBackSvg(cx3, cardY, cardScale, s3)}
    </g>

    <text x="${cx1}" y="${numberY}" text-anchor="middle" font-family="${KO_STACK}" font-size="46" fill="${getSchemeAccent(s1)}" font-weight="600" filter="url(#softGlow)">1번</text>
    <text x="${cx2}" y="${numberY}" text-anchor="middle" font-family="${KO_STACK}" font-size="48" fill="${getSchemeAccent(s2)}" font-weight="700" filter="url(#midNumGlow)">2번</text>
    <text x="${cx3}" y="${numberY}" text-anchor="middle" font-family="${KO_STACK}" font-size="46" fill="${getSchemeAccent(s3)}" font-weight="600" filter="url(#softGlow)">3번</text>

    <g filter="url(#midNumGlow)">
      <text x="540" y="${numberY + 110}" text-anchor="middle" font-family="${KO_STACK}" font-size="32" fill="rgba(244,248,255,0.95)" letter-spacing="4" font-weight="400">끌리는 카드 하나만 골라보세요</text>
    </g>

    <text x="540" y="1860" text-anchor="middle" font-family="${KO_STACK}" font-size="24" fill="rgba(232,212,139,0.5)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene02.png'), buf)
  console.log(`✅ scene02.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

// --- scene03: 정지 유도 - 카드 확대(2.65x) + 중앙 팬 아웃 구도 ---
async function scene03() {
  const cardScale = 2.65
  const cardPixelW = CARD_WIDTH * cardScale
  const cardPixelH = CARD_HEIGHT * cardScale
  const cardGap = 20
  const totalWidth = cardPixelW * 3 + cardGap * 2
  const startCX = (W - totalWidth) / 2 + cardPixelW / 2
  const cardY = 1160

  const cx1 = startCX
  const cx2 = startCX + cardPixelW + cardGap
  const cx3 = startCX + (cardPixelW + cardGap) * 2

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      ${colorCardBackDefs()}
      <radialGradient id="stopGlowStrong" cx="50%" cy="50%" r="65%">
        <stop offset="0%" stop-color="rgba(232,212,139,0.48)"/>
        <stop offset="50%" stop-color="rgba(180,140,210,0.18)"/>
        <stop offset="100%" stop-color="rgba(20,10,40,0)"/>
      </radialGradient>
      <radialGradient id="centerPulse" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(232,212,139,0.28)"/>
        <stop offset="100%" stop-color="rgba(232,212,139,0)"/>
      </radialGradient>
    </defs>
    ${participationBody(51)}

    <ellipse cx="540" cy="${cardY}" rx="900" ry="520" fill="url(#stopGlowStrong)" filter="url(#glowBlur)"/>
    <ellipse cx="${cx2}" cy="${cardY}" rx="${cardPixelW * 0.95}" ry="${cardPixelH * 0.62}" fill="url(#centerPulse)" filter="url(#glowBlur)"/>

    <g filter="url(#softGlow)">
      <text x="540" y="330" text-anchor="middle" font-family="${KO_STACK}" font-size="68" fill="#F4F8FF" letter-spacing="4" font-weight="300">선택했나요?</text>
    </g>

    <g filter="url(#softGlow)">
      <text x="540" y="420" text-anchor="middle" font-family="${KO_STACK}" font-size="30" fill="rgba(232,212,139,0.78)" letter-spacing="6" font-weight="300">고른 번호를 기억하세요</text>
    </g>

    <g filter="url(#cardShadow)">
      ${colorCardBackSvg(cx1, cardY, cardScale, SCHEME_1)}
      ${colorCardBackSvg(cx2, cardY, cardScale, SCHEME_2)}
      ${colorCardBackSvg(cx3, cardY, cardScale, SCHEME_3)}
    </g>

    <g opacity="0.85">
      <circle cx="510" cy="1620" r="4" fill="#e8d48b"/>
      <circle cx="540" cy="1620" r="4" fill="#e8d48b"/>
      <circle cx="570" cy="1620" r="4" fill="#e8d48b"/>
    </g>

    <g filter="url(#softGlow)">
      <text x="540" y="1695" text-anchor="middle" font-family="${KO_STACK}" font-size="32" fill="rgba(232,212,139,0.9)" letter-spacing="4" font-weight="300">결과는 다음 장에서 열려요</text>
    </g>

    <text x="540" y="1860" text-anchor="middle" font-family="${KO_STACK}" font-size="22" fill="rgba(232,212,139,0.5)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene03.png'), buf)
  console.log(`✅ scene03.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

// --- scene04~06: 번호별 카드 공개 (프레임 카드 + 키워드 + 훅) ---
async function revealScene(card, starSeed, filename) {
  const cardW = 780, cardH = 1170
  const framePad = 30
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad
  const frameX = (W - frameW) / 2
  const frameY = 265
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const imgPath = card.imageSrc ? resolve(rootDir, card.imageSrc) : resolve(cardsDir, `${card.slug}.png`)
  const cardRaw = await sharp(imgPath)
    .resize(cardW, cardH, { fit: 'cover', kernel: 'lanczos3' })
    .toBuffer()
  const cardEnhanced = await sharp(cardRaw)
    .sharpen({ sigma: 0.7, m1: 0.5, m2: 2.2 })
    .modulate({ saturation: 1.12, brightness: 1.03 })
    .toBuffer()
  const masked = await roundImg(cardEnhanced, cardW, cardH, 8)

  const isHookArray = Array.isArray(card.hook)
  const numberY = isHookArray ? 105 : 125
  const hookLine1Y = isHookArray ? 175 : 210
  const hookLine2Y = 225

  const labelStartY = frameY + frameH + 70
  const nameKrY = labelStartY
  const nameEnY = nameKrY + 55
  const kwY = nameEnY + 60

  const glowCX = W / 2
  const glowCY = frameY + frameH / 2

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      <radialGradient id="cardGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(232,212,139,0.32)"/>
        <stop offset="55%" stop-color="rgba(180,140,210,0.14)"/>
        <stop offset="100%" stop-color="rgba(20,10,40,0)"/>
      </radialGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
        <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
      </radialGradient>
    </defs>
    ${cosmicBodyNoMoon(starSeed)}

    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    <ellipse cx="${glowCX}" cy="${glowCY}" rx="${frameW * 0.82}" ry="${frameH * 0.65}" fill="url(#cardGlow)"/>

    <g filter="url(#softGlow)">
      <text x="540" y="${numberY}" text-anchor="middle" font-family="Georgia, serif" font-size="60" fill="rgba(232,212,139,0.95)" font-weight="400" letter-spacing="2">${card.num}</text>
    </g>

    <g filter="url(#softGlow)">
      ${isHookArray
        ? `<text x="540" y="${hookLine1Y}" text-anchor="middle" font-family="${KO_STACK}" font-size="42" fill="#F4F8FF" letter-spacing="2" font-weight="300">${card.hook[0]}</text>
           <text x="540" y="${hookLine2Y}" text-anchor="middle" font-family="${KO_STACK}" font-size="42" fill="#F4F8FF" letter-spacing="2" font-weight="300">${card.hook[1]}</text>`
        : `<text x="540" y="${hookLine1Y}" text-anchor="middle" font-family="${KO_STACK}" font-size="42" fill="#F4F8FF" letter-spacing="2" font-weight="300">${card.hook}</text>`
      }
    </g>

    ${drawFrame(frameX, frameY, frameW, frameH, 1.3)}

    <g filter="url(#softGlow)">
      <text x="540" y="${nameKrY}" text-anchor="middle" font-family="${KO_STACK}" font-size="54" fill="#F4F8FF" font-weight="300" letter-spacing="3">${card.nameKr}</text>
    </g>
    <text x="540" y="${nameEnY}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="32" fill="rgba(232,212,139,0.92)" letter-spacing="2">${card.nameEn}</text>

    <text x="540" y="${kwY}" text-anchor="middle" font-family="${KO_STACK}" font-size="28" fill="rgba(232,212,139,0.78)" letter-spacing="4" font-weight="300">${card.keywords}</text>

    <text x="540" y="1860" text-anchor="middle" font-family="${KO_STACK}" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, filename), base)
  console.log(`✅ ${filename} (${(base.length / 1024).toFixed(0)} KB) - ${card.nameEn}`)
}

// --- scene07: 저장 CTA - 3장 썸네일 + 저장 유도 ---
async function scene07() {
  const thumbW = 300, thumbH = 450
  const thumbGap = 40
  const totalW = thumbW * 3 + thumbGap * 2
  const startX = (W - totalW) / 2
  const thumbY = 490

  const thumbs = []
  for (let i = 0; i < CARDS.length; i++) {
    const card = CARDS[i]
    const imgPath = card.imageSrc ? resolve(rootDir, card.imageSrc) : resolve(cardsDir, `${card.slug}.png`)
    const raw = await sharp(imgPath)
      .resize(thumbW, thumbH, { fit: 'cover', kernel: 'lanczos3' })
      .toBuffer()
    const enhanced = await sharp(raw)
      .sharpen({ sigma: 0.6, m1: 0.5, m2: 2.0 })
      .modulate({ saturation: 1.1, brightness: 1.02 })
      .toBuffer()
    const masked = await roundImg(enhanced, thumbW, thumbH, 8)
    thumbs.push({ buf: masked, left: Math.round(startX + i * (thumbW + thumbGap)), top: thumbY })
  }

  const framePad = 14
  const frameOverlays = CARDS.map((_, i) => {
    const fx = Math.round(startX + i * (thumbW + thumbGap)) - framePad
    const fy = thumbY - framePad
    const fw = thumbW + framePad * 2
    const fh = thumbH + framePad * 2
    return drawFrame(fx, fy, fw, fh, 1.1)
  }).join('\n')

  const numberLabelY = thumbY + thumbH + 55
  const numCxs = CARDS.map((_, i) => Math.round(startX + i * (thumbW + thumbGap) + thumbW / 2))

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
      <radialGradient id="thumbGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(232,212,139,0.20)"/>
        <stop offset="60%" stop-color="rgba(180,140,210,0.08)"/>
        <stop offset="100%" stop-color="rgba(20,10,40,0)"/>
      </radialGradient>
    </defs>
    ${cosmicBodyNoMoon(77)}

    <ellipse cx="540" cy="${thumbY + thumbH / 2}" rx="560" ry="${thumbH * 0.7}" fill="url(#thumbGlow)" filter="url(#glowBlur)"/>

    <!-- 메인 CTA: 댓글 유도 (가장 큰 텍스트, 상단) -->
    <g filter="url(#softGlow)">
      <text x="540" y="260" text-anchor="middle" font-family="${KO_STACK}" font-size="56" fill="#F4F8FF" letter-spacing="2" font-weight="300">고른 번호를 댓글에 남겨주세요</text>
      <text x="540" y="340" text-anchor="middle" font-family="${KO_STACK}" font-size="56" fill="#F4F8FF" letter-spacing="2" font-weight="300">답글로 더 깊은 해석을 드릴게요</text>
    </g>

    <g opacity="0.75">
      <circle cx="408" cy="410" r="3" fill="#e8d48b"/>
      <line x1="424" y1="410" x2="656" y2="410" stroke="rgba(232,212,139,0.45)" stroke-width="1"/>
      <circle cx="672" cy="410" r="3" fill="#e8d48b"/>
    </g>

    ${frameOverlays}

    <g filter="url(#softGlow)">
      <text x="${numCxs[0]}" y="${numberLabelY}" text-anchor="middle" font-family="${KO_STACK}" font-size="36" fill="rgba(232,212,139,0.9)" font-weight="500">1번</text>
      <text x="${numCxs[1]}" y="${numberLabelY}" text-anchor="middle" font-family="${KO_STACK}" font-size="36" fill="rgba(232,212,139,0.9)" font-weight="500">2번</text>
      <text x="${numCxs[2]}" y="${numberLabelY}" text-anchor="middle" font-family="${KO_STACK}" font-size="36" fill="rgba(232,212,139,0.9)" font-weight="500">3번</text>
    </g>

    <line x1="340" y1="1160" x2="740" y2="1160" stroke="rgba(232,212,139,0.4)" stroke-width="1"/>

    <!-- 보조 CTA: 저장 유도 (작은 텍스트, 하단) -->
    <g filter="url(#softGlow)">
      <text x="540" y="1290" text-anchor="middle" font-family="${KO_STACK}" font-size="28" fill="rgba(232,212,139,0.85)" letter-spacing="3" font-weight="300">저장해두고 다음 주에 다시 확인해보세요</text>
    </g>

    <g opacity="0.7" filter="url(#softGlow)">
      <circle cx="490" cy="1430" r="5" fill="#e8d48b"/>
      <circle cx="540" cy="1430" r="5" fill="#e8d48b"/>
      <circle cx="590" cy="1430" r="5" fill="#e8d48b"/>
    </g>

    <text x="540" y="1600" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="28" fill="rgba(232,212,139,0.80)" letter-spacing="3">Sunday Tarot Preview</text>
    <text x="540" y="1640" text-anchor="middle" font-family="${KO_STACK}" font-size="22" fill="rgba(244,248,255,0.82)" letter-spacing="2" font-weight="400">매주 일요일, 다음 주 연애 흐름</text>

    <text x="540" y="1860" text-anchor="middle" font-family="${KO_STACK}" font-size="24" fill="rgba(232,212,139,0.5)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let out = await sharp(Buffer.from(svg)).png().toBuffer()
  out = await sharp(out).composite(thumbs.map(t => ({ input: t.buf, left: t.left, top: t.top }))).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene07.png'), out)
  console.log(`✅ scene07.png (${(out.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-05-03 Sunday Tarot Preview - 6컷 압축 (scene03 정지 유도 제거) ===')
  mkdirSync(outputDir, { recursive: true })
  await scene01()                                  // 훅 도입
  await scene02()                                  // 선택 유도
  await revealScene(CARDS[0], 101, 'scene03.png')  // 1번 공개 (The World)
  await revealScene(CARDS[1], 202, 'scene04.png')  // 2번 공개 (Knight of Wands)
  await revealScene(CARDS[2], 303, 'scene05.png')  // 3번 공개 (Judgement)
  // scene07() 함수 → scene06.png로 출력 변경. 함수 내부의 writeFileSync 경로를 직접 호출하지 않고 renameSync로 처리.
  await scene07()
  // scene07.png를 scene06.png로 변경
  const { renameSync, existsSync: ex } = await import('fs')
  const scene7Path = resolve(outputDir, 'scene07.png')
  const scene6Path = resolve(outputDir, 'scene06.png')
  if (ex(scene7Path)) renameSync(scene7Path, scene6Path)
  console.log('완료! (총 6컷: scene01~scene06)')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
