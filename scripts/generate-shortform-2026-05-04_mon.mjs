/**
 * TEMPLATE: 소개형 메이저 shortform (3컷, NEW 디자인 - scene*_new.png)
 * scene01: 풀사이즈 배경+카드 뒷면(1.png) + 질문 훅
 * scene02: 780×1170 프레임 카드(cards-png/{slug}.png) + cosmic bg + vignette + cardGlow + 프레임 외부 카드명/키워드 (마이너 scene02와 시각 통일). GPT 교체는 별도 채팅에서 수동.
 * scene03: 클린 배경(3.png) + 작은 카드 + 해석 3줄 + CTA
 *
 * 사용: scripts/templates/shortform-major.mjs 를 scripts/generate-shortform-{YYYY-MM-DD_day}.mjs 로 복사.
 * 메이저 아르카나 NEW 디자인은 이 템플릿만 사용. 텍스트는 non-italic, letter-spacing 0~1.
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-05-04_mon/shortform')
const bg1Path = resolve(rootDir, 'public/images/1.png')
const bg2Path = resolve(rootDir, 'public/images/2-2.png')
const bg3Path = resolve(rootDir, 'public/images/3.png')
const W = 1080, H = 1920

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

async function loadCard(slug, w, h) {
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) return null
  return sharp(p)
    .resize(w, h, { fit: 'cover', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 2.5 })
    .modulate({ saturation: 1.1 })
    .toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

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
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `
}

function cosmicBody(starSeed = 1) {
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

// 2-2.png 스타일 참고: 한글 글자간격 좁게(0-1px), 영문 italic 제거, 키워드 얇은 sans
const commonStyle = `
  .hook { font-family: "Noto Serif KR", serif; font-size: 62px; font-weight: 500; letter-spacing: 0px; paint-order: stroke fill; stroke: rgba(0,0,0,0.55); stroke-width: 3px; stroke-linejoin: round; }
  .hook-accent { fill: #E8C877; font-weight: 600; }
  .cta  { font-family: "Noto Sans KR", sans-serif; font-size: 28px; font-weight: 300; letter-spacing: 2px; paint-order: stroke fill; stroke: rgba(0,0,0,0.7); stroke-width: 3px; stroke-linejoin: round; }
  .mark { font-family: "Noto Sans KR", sans-serif; font-size: 22px; font-weight: 300; letter-spacing: 6px; }
  .card-name-kr-sm { font-family: "Noto Serif KR", serif; font-size: 38px; font-weight: 600; letter-spacing: 1px; paint-order: stroke fill; stroke: rgba(0,0,0,0.6); stroke-width: 2px; stroke-linejoin: round; }
  .card-name-en-sm { font-family: "Noto Serif KR", serif; font-size: 22px; font-weight: 400; letter-spacing: 1px; paint-order: stroke fill; stroke: rgba(0,0,0,0.55); stroke-width: 2px; stroke-linejoin: round; }
  .keywords-sm { font-family: "Noto Sans KR", sans-serif; font-size: 22px; font-weight: 300; letter-spacing: 2px; paint-order: stroke fill; stroke: rgba(0,0,0,0.65); stroke-width: 2px; stroke-linejoin: round; }
  .header { font-family: "Noto Serif KR", serif; font-size: 54px; font-weight: 500; letter-spacing: 1px; paint-order: stroke fill; stroke: rgba(0,0,0,0.6); stroke-width: 3px; stroke-linejoin: round; }
  .interp { font-family: "Noto Serif KR", serif; font-size: 40px; font-weight: 400; letter-spacing: 0px; paint-order: stroke fill; stroke: rgba(0,0,0,0.65); stroke-width: 3px; stroke-linejoin: round; }
  .cta-main { font-family: "Noto Serif KR", serif; font-size: 36px; font-weight: 500; letter-spacing: 1px; paint-order: stroke fill; stroke: rgba(0,0,0,0.7); stroke-width: 3px; stroke-linejoin: round; }
  .cta-url { font-family: "Noto Sans KR", sans-serif; font-size: 26px; font-weight: 300; letter-spacing: 1px; paint-order: stroke fill; stroke: rgba(0,0,0,0.7); stroke-width: 3px; stroke-linejoin: round; }
`

async function scene01() {
  const bgBuf = await sharp(bg1Path)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .toBuffer()

  const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <style>${commonStyle}</style>
    </defs>

    <g filter="url(#textShadow)">
      <text x="540" y="360" text-anchor="middle" class="hook" fill="#FFFFFF">다정한데 거리감 있을 때,</text>
      <text x="540" y="442" text-anchor="middle" class="hook" fill="#FFFFFF">이 관계 진짜 <tspan class="hook-accent">균형</tspan>일까?</text>
    </g>

    <g filter="url(#textShadow)">
      <text x="540" y="1640" text-anchor="middle" class="cta" fill="#D4AE68">카드가 양 끝의 무게를 비춰줄 거예요</text>
    </g>

    <text x="540" y="1860" text-anchor="middle" class="mark" fill="rgba(255,230,180,0.55)">@lovtarot_</text>
  </svg>`

  const buf = await sharp(bgBuf)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 92 })
    .toBuffer()

  writeFileSync(resolve(outputDir, 'scene01_new.png'), buf)
  console.log(`✅ scene01_new.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function scene02() {
  // 마이너 scene02와 동일 레이아웃: 780×1170 프레임 카드 + cosmic bg + vignette + cardGlow.
  // GPT 풀사이즈 일러스트 교체가 필요하면 별도 채팅에서 scene02_new.png 수동 덮어쓰기.
  const cardSlug = 'justice'
  const cardNameKr = '정의'
  const cardNameEn = 'Justice'
  const keywords = '균형 · 진실 · 결과'

  const cardW = 780, cardH = 1170
  const framePad = 30
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad
  const frameX = (W - frameW) / 2
  const frameY = 210
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const cardRaw = await sharp(resolve(cardsDir, `${cardSlug}.png`))
    .resize(cardW, cardH, { fit: 'cover', kernel: 'lanczos3' })
    .toBuffer()
  const cardEnhanced = await sharp(cardRaw)
    .sharpen({ sigma: 0.7, m1: 0.5, m2: 2.2 })
    .modulate({ saturation: 1.12, brightness: 1.03 })
    .toBuffer()
  const masked = await roundImg(cardEnhanced, cardW, cardH, 8)

  const labelStartY = frameY + frameH + 90
  const nameKrY = labelStartY
  const nameEnY = nameKrY + 60
  const kwY = nameEnY + 70

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
    ${cosmicBody(41)}

    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    <ellipse cx="${glowCX}" cy="${glowCY}" rx="${frameW * 0.82}" ry="${frameH * 0.65}" fill="url(#cardGlow)"/>

    ${drawFrame(frameX, frameY, frameW, frameH, 1.3)}

    <g filter="url(#softGlow)">
      <text x="540" y="${nameKrY}" text-anchor="middle" font-family="'Noto Sans KR', sans-serif" font-size="52" fill="#F4F8FF" font-weight="300" letter-spacing="3">${cardNameKr}</text>
      <text x="540" y="${nameEnY}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="rgba(232,212,139,0.88)" letter-spacing="1">${cardNameEn}</text>
    </g>

    <text x="540" y="${kwY}" text-anchor="middle" font-family="'Noto Sans KR', sans-serif" font-size="26" fill="rgba(232,212,139,0.72)" letter-spacing="4" font-weight="300">${keywords}</text>

    <text x="540" y="1860" text-anchor="middle" font-family="'Noto Sans KR', sans-serif" font-size="24" fill="rgba(232,212,139,0.45)" letter-spacing="4">@lovtarot_</text>
  </svg>`

  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene02_new.png'), base)
  console.log(`✅ scene02_new.png (${(base.length / 1024).toFixed(0)} KB)`)
}

async function scene03() {
  const bgBuf = await sharp(bg3Path)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .toBuffer()

  const cardW = 300, cardH = 450
  const framePad = 18
  const nameArea = 115
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad + nameArea
  const frameX = Math.round((W - frameW) / 2)
  const frameY = 320
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const divideY = cardTop + cardH + 16
  const nameKrY = divideY + 48
  const nameEnY = nameKrY + 32
  const kwY = frameY + frameH + 65

  const interpY = 1160
  const ctaY = 1550

  const cardImg = await loadCard('justice', cardW, cardH)
  const masked = await roundImg(cardImg, cardW, cardH, 5)

  const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <style>${commonStyle}</style>
    </defs>

    <g filter="url(#textShadow)">
      <text x="540" y="220" text-anchor="middle" class="header" fill="#FFFFFF">균형의 <tspan class="hook-accent">진실</tspan></text>
    </g>

    ${drawFrame(frameX, frameY, frameW, frameH, 0.95)}

    <line x1="${frameX + 30}" y1="${divideY}" x2="${frameX + frameW - 30}" y2="${divideY}" stroke="rgba(232,212,139,0.45)" stroke-width="1"/>

    <g filter="url(#textShadow)">
      <text x="540" y="${nameKrY}" text-anchor="middle" class="card-name-kr-sm" fill="#FFFFFF">정의</text>
      <text x="540" y="${nameEnY}" text-anchor="middle" class="card-name-en-sm" fill="#E8C877">Justice</text>
    </g>

    <g filter="url(#textShadow)">
      <text x="540" y="${kwY}" text-anchor="middle" class="keywords-sm" fill="#E8C877">균형 · 진실 · 결과</text>
    </g>

    <g filter="url(#textShadow)">
      <text x="540" y="${interpY}"        text-anchor="middle" class="interp" fill="#FFFFFF">카드는 양 끝의 무게를 보고 있어요.</text>
      <text x="540" y="${interpY + 70}"  text-anchor="middle" class="interp" fill="#FFFFFF">한 쪽만 다정함이 <tspan class="hook-accent">흐를</tspan> 때,</text>
      <text x="540" y="${interpY + 140}" text-anchor="middle" class="interp" fill="#FFFFFF">진짜 균형이 어디 있는지 봐주세요.</text>
    </g>

    <g filter="url(#textShadow)">
      <text x="540" y="${ctaY}"       text-anchor="middle" class="cta-main" fill="#FFFFFF">당신도 직접 뽑아보세요</text>
      <text x="540" y="${ctaY + 70}" text-anchor="middle" class="cta-url"  fill="#E8C877">무료 타로 리딩 · lovtaro.kr</text>
    </g>

    <text x="540" y="1860" text-anchor="middle" class="mark" fill="rgba(255,230,180,0.55)">@lovtarot_</text>
  </svg>`

  let out = await sharp(bgBuf)
    .composite([{ input: masked, left: cardLeft, top: cardTop }])
    .png()
    .toBuffer()
  out = await sharp(out)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 92 })
    .toBuffer()

  writeFileSync(resolve(outputDir, 'scene03_new.png'), out)
  console.log(`✅ scene03_new.png (${(out.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-05-04 mon - 소개형 메이저 NEW (Justice) ===')
  mkdirSync(outputDir, { recursive: true })
  await scene01()
  await scene02()
  await scene03()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
