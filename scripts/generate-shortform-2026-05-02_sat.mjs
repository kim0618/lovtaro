/**
 * 2026-05-02 토요일 carousel용 릴스 (하이브리드 스타일)
 * - scene01: 코스믹 - 큰 프레임 카드 (Hanged Man, 720x1080) + 하단 훅
 * - scene02~04: editorial - carouselShortformSlide() 템플릿
 *   2: Six of Cups / 3: Knight of Pentacles / 4: Ten of Cups
 * - scene05: 코스믹 - CTA (Hanged Man, 360x540)
 *
 * 실행: node scripts/generate-shortform-2026-05-02_sat.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { carouselShortformSlide } from './lib/carousel-shortform-template.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-05-02_sat/shortform')

const W = 1080, H = 1920
const KO_STACK = `'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif`

function mulberry32(seed) {
  return function() {
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
    <mask id="moonMask">
      <rect x="0" y="0" width="${W}" height="${H}" fill="black"/>
      <circle cx="125" cy="225" r="52" fill="white"/>
      <circle cx="158" cy="215" r="52" fill="black"/>
    </mask>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `
}

function cosmicBody(withMoon = true, starSeed = 1) {
  const stars1 = genStars(320, starSeed, 0, W, 0, H, false)
  const stars2 = genStars(120, starSeed + 11, 0, W, 0, H, true)
  const stars3 = genStars(60, starSeed + 23, 0, W, 0, H, true)
  const moon = withMoon ? `
    <circle cx="140" cy="220" r="120" fill="url(#moonGlow)"/>
    <rect x="50" y="150" width="180" height="180" fill="rgba(248,230,185,0.95)" mask="url(#moonMask)"/>
  ` : ''
  return `
    <rect width="${W}" height="${H}" fill="url(#cosmicBg)"/>
    <ellipse cx="120" cy="720" rx="520" ry="420" fill="url(#neb1)"/>
    <ellipse cx="980" cy="1280" rx="520" ry="460" fill="url(#neb2)"/>
    <ellipse cx="540" cy="1750" rx="620" ry="320" fill="url(#neb3)"/>
    <ellipse cx="760" cy="400" rx="380" ry="300" fill="url(#neb3)"/>
    ${stars1}
    ${stars2}
    ${stars3}
    ${moon}
  `
}

function drawFrame(x, y, w, h, strong = 1) {
  const gap = 10
  const cornerSize = 32
  const c1 = `rgba(201,168,76,${0.75 * strong})`
  const c2 = `rgba(201,168,76,${0.38 * strong})`
  const c3 = `rgba(232,212,139,${0.7 * strong})`
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c1}" stroke-width="2.5"/>
    <rect x="${x + gap}" y="${y + gap}" width="${w - 2 * gap}" height="${h - 2 * gap}" fill="none" stroke="${c2}" stroke-width="1"/>
    <path d="M ${x + cornerSize} ${y + gap / 2} L ${x + gap / 2} ${y + gap / 2} L ${x + gap / 2} ${y + cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
    <path d="M ${x + w - cornerSize} ${y + gap / 2} L ${x + w - gap / 2} ${y + gap / 2} L ${x + w - gap / 2} ${y + cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
    <path d="M ${x + cornerSize} ${y + h - gap / 2} L ${x + gap / 2} ${y + h - gap / 2} L ${x + gap / 2} ${y + h - cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
    <path d="M ${x + w - cornerSize} ${y + h - gap / 2} L ${x + w - gap / 2} ${y + h - gap / 2} L ${x + w - gap / 2} ${y + h - cornerSize}" fill="none" stroke="${c3}" stroke-width="1.5"/>
  `
}

async function loadCard(slug, w, h) {
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) { console.error(`카드 없음: ${p}`); return null }
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

async function scene01() {
  const cardW = 720, cardH = 1080
  const framePad = 28
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad
  const frameX = (W - frameW) / 2
  const frameY = 120
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const img = await loadCard('hanged-man', cardW, cardH)
  const masked = img ? await roundImg(img, cardW, cardH, 8) : null

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
    </defs>
    ${cosmicBody(true, 419)}

    ${drawFrame(frameX, frameY, frameW, frameH)}

    <g filter="url(#softGlow)">
      <text x="540" y="1530" text-anchor="middle" font-family="${KO_STACK}" font-size="48" font-weight="300" fill="#F4F8FF" letter-spacing="3">이별 후 다시 사랑받는 사람은</text>
      <text x="540" y="1600" text-anchor="middle" font-family="${KO_STACK}" font-size="48" font-weight="300" fill="#F4F8FF" letter-spacing="3">절대 이것부터 하지 않아요</text>
    </g>
    <text x="540" y="1730" text-anchor="middle" font-family="${KO_STACK}" font-size="24" fill="rgba(180,170,220,0.55)" letter-spacing="3">스와이프해서 확인하세요 →</text>

    <text x="540" y="1870" text-anchor="middle" font-family="${KO_STACK}" font-size="22" fill="rgba(232,212,139,0.4)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  }
  writeFileSync(resolve(outputDir, 'scene01.png'), base)
  console.log(`✅ scene01.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function bodyScene(props, filename) {
  const svg = carouselShortformSlide(props)
  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, filename), buf)
  console.log(`✅ ${filename} (${(buf.length / 1024).toFixed(0)} KB) - ${props.nameEn}`)
}

async function scene05() {
  const cardW = 360, cardH = 540
  const framePad = 22
  const nameArea = 130
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad + nameArea
  const frameX = (W - frameW) / 2
  const frameY = 240
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const img = await loadCard('hanged-man', cardW, cardH)
  const masked = img ? await roundImg(img, cardW, cardH, 7) : null

  const divideY = cardTop + cardH + 18
  const nameKrY = divideY + 50
  const nameEnY = nameKrY + 36

  const saveIcon = `<g transform="translate(420, 1120)">
    <path d="M14 0 L72 0 Q86 0 86 14 L86 105 L43 78 L0 105 L0 14 Q0 0 14 0 Z" fill="none" stroke="rgba(232,212,139,0.7)" stroke-width="2.5"/>
  </g>`
  const shareIcon = `<g transform="translate(560, 1120)">
    <path d="M58 0 L86 30 L58 60" fill="none" stroke="rgba(232,212,139,0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M86 30 L14 30 L14 86" fill="none" stroke="rgba(232,212,139,0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      ${cosmicDefs()}
    </defs>
    ${cosmicBody(true, 421)}

    ${drawFrame(frameX, frameY, frameW, frameH, 0.9)}

    <line x1="${frameX + 30}" y1="${divideY}" x2="${frameX + frameW - 30}" y2="${divideY}" stroke="rgba(201,168,76,0.28)" stroke-width="1"/>

    <text x="540" y="${nameKrY}" text-anchor="middle" font-family="${KO_STACK}" font-size="38" fill="#F4F8FF" font-weight="300" letter-spacing="5">매달린 사람</text>
    <text x="540" y="${nameEnY}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="22" fill="rgba(232,212,139,0.78)">The Hanged Man</text>

    ${saveIcon}
    ${shareIcon}

    <g filter="url(#softGlow)">
      <text x="540" y="1380" text-anchor="middle" font-family="${KO_STACK}" font-size="38" font-weight="300" fill="#F4F8FF" letter-spacing="3">저장해두고</text>
      <text x="540" y="1435" text-anchor="middle" font-family="${KO_STACK}" font-size="26" fill="rgba(232,212,139,0.78)" letter-spacing="2">마음이 가라앉을 때 다시 꺼내보세요</text>
    </g>
    <line x1="380" y1="1485" x2="700" y2="1485" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>
    <text x="540" y="1535" text-anchor="middle" font-family="${KO_STACK}" font-size="24" fill="rgba(200,190,240,0.55)">이별 후 힘들어하는 친구가 있다면</text>
    <text x="540" y="1572" text-anchor="middle" font-family="${KO_STACK}" font-size="24" fill="rgba(200,190,240,0.55)">가볍게 공유해보세요</text>

    <text x="540" y="1870" text-anchor="middle" font-family="${KO_STACK}" font-size="22" fill="rgba(232,212,139,0.4)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  }
  writeFileSync(resolve(outputDir, 'scene05.png'), base)
  console.log(`✅ scene05.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-05-02 sat carousel용 릴스 (하이브리드) ===')
  mkdirSync(outputDir, { recursive: true })

  await scene01()

  await bodyScene({
    cardSlug: 'six-of-cups',
    imageSrc: 'public/images/mcards/cups/Six of Cups.png',
    nameEn: 'SIX OF CUPS',
    titleKo: ['추억에 휘둘리지', '않아요'],
    subtitleEn: 'a tender past, gently held',
    bodyLines: [
      '지난 감정을 무겁게 끌어안지 않고',
      '따뜻하게 정리해 둬요',
      '비워둔 마음 한 자리가',
      '다음 인연이 들어올 공간이 돼요',
    ],
    keywords: ['추억', '정리', '여백'],
    index: 2,
    total: 5,
  }, 'scene02.png')

  await bodyScene({
    cardSlug: 'knight-of-pentacles',
    imageSrc: 'public/images/mcards/pentacles/Knight of Pentacles.png',
    nameEn: 'KNIGHT OF PENTACLES',
    titleKo: ['자기 페이스를', '흔들지 않아요'],
    subtitleEn: 'steady hands, steady days',
    bodyLines: [
      '관계가 끝나도 일상이 무너지지 않아요',
      '매일의 작은 루틴을 단단히 지켜요',
      '그 꾸준함이 시간 안에 쌓이면',
      '주변 사람들이 다시 다가와요',
    ],
    keywords: ['꾸준함', '자기관리', '안정'],
    index: 3,
    total: 5,
  }, 'scene03.png')

  await bodyScene({
    cardSlug: 'ten-of-cups',
    imageSrc: 'public/images/mcards/cups/Ten of Cups.png',
    nameEn: 'TEN OF CUPS',
    titleKo: ['다음 인연을', '조급해하지 않아요'],
    subtitleEn: 'home is the heart, first',
    bodyLines: [
      '"빨리 누군가를 만나야지"보다',
      '안정된 마음으로 천천히 기다려요',
      '그 차분한 태도 안에서',
      '자연스럽게 좋은 인연이 들어와요',
    ],
    keywords: ['안정', '기다림', '따뜻함'],
    index: 4,
    total: 5,
  }, 'scene04.png')

  await scene05()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
