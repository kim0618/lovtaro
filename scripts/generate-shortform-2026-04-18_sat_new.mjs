/**
 * 2026-04-18 토요일 scene01/02_NEW.png 생성
 * scene01: 1.png(배경+카드 뒷면) + 텍스트
 * scene02: 3.png(클린 배경) + Moon 카드 + 프레임 + 카드명/키워드
 *
 * 실행: cd /home/tjd618/lovtaro && node scripts/generate-shortform-2026-04-18_sat_new.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-04-18_sat/shortform')
const bg1Path = resolve(rootDir, 'public/images/1.png')
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
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

const commonStyle = `
  .hook { font-family: "Noto Serif KR", serif; font-size: 62px; font-weight: 400; letter-spacing: 2px; paint-order: stroke fill; stroke: rgba(0,0,0,0.55); stroke-width: 3px; stroke-linejoin: round; }
  .hook-accent { fill: #E8C877; font-weight: 500; }
  .cta  { font-family: "Noto Sans KR", sans-serif; font-size: 28px; font-weight: 300; letter-spacing: 6px; paint-order: stroke fill; stroke: rgba(0,0,0,0.7); stroke-width: 3px; stroke-linejoin: round; }
  .mark { font-family: "Noto Sans KR", sans-serif; font-size: 22px; font-weight: 300; letter-spacing: 6px; }
  .card-name-kr { font-family: "Noto Serif KR", serif; font-size: 58px; font-weight: 500; letter-spacing: 8px; paint-order: stroke fill; stroke: rgba(0,0,0,0.6); stroke-width: 3px; stroke-linejoin: round; }
  .card-name-kr-sm { font-family: "Noto Serif KR", serif; font-size: 34px; font-weight: 500; letter-spacing: 6px; paint-order: stroke fill; stroke: rgba(0,0,0,0.6); stroke-width: 2px; stroke-linejoin: round; }
  .card-name-en { font-family: "Noto Serif KR", serif; font-size: 32px; font-weight: 400; font-style: italic; letter-spacing: 3px; paint-order: stroke fill; stroke: rgba(0,0,0,0.55); stroke-width: 2px; stroke-linejoin: round; }
  .card-name-en-sm { font-family: "Noto Serif KR", serif; font-size: 20px; font-weight: 400; font-style: italic; letter-spacing: 2px; paint-order: stroke fill; stroke: rgba(0,0,0,0.55); stroke-width: 2px; stroke-linejoin: round; }
  .keywords { font-family: "Noto Sans KR", sans-serif; font-size: 30px; font-weight: 300; letter-spacing: 7px; paint-order: stroke fill; stroke: rgba(0,0,0,0.65); stroke-width: 3px; stroke-linejoin: round; }
  .keywords-sm { font-family: "Noto Sans KR", sans-serif; font-size: 24px; font-weight: 300; letter-spacing: 5px; paint-order: stroke fill; stroke: rgba(0,0,0,0.65); stroke-width: 3px; stroke-linejoin: round; }
  .header { font-family: "Noto Serif KR", serif; font-size: 52px; font-weight: 400; letter-spacing: 6px; paint-order: stroke fill; stroke: rgba(0,0,0,0.6); stroke-width: 3px; stroke-linejoin: round; }
  .interp { font-family: "Noto Serif KR", serif; font-size: 40px; font-weight: 400; letter-spacing: 1px; paint-order: stroke fill; stroke: rgba(0,0,0,0.65); stroke-width: 3px; stroke-linejoin: round; }
  .cta-main { font-family: "Noto Serif KR", serif; font-size: 36px; font-weight: 400; letter-spacing: 3px; paint-order: stroke fill; stroke: rgba(0,0,0,0.7); stroke-width: 3px; stroke-linejoin: round; }
  .cta-url { font-family: "Noto Sans KR", sans-serif; font-size: 28px; font-weight: 300; letter-spacing: 3px; paint-order: stroke fill; stroke: rgba(0,0,0,0.7); stroke-width: 3px; stroke-linejoin: round; }
`

async function scene01() {
  // 1.png 리사이즈 + 텍스트 오버레이
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
      <text x="540" y="360" text-anchor="middle" class="hook" fill="#FFFFFF">그 사람이 <tspan class="hook-accent">아직</tspan></text>
      <text x="540" y="442" text-anchor="middle" class="hook" fill="#FFFFFF">나를 생각하고 있을까?</text>
    </g>

    <g filter="url(#textShadow)">
      <text x="540" y="1640" text-anchor="middle" class="cta" fill="#D4AE68">카드가 답해줄 거예요</text>
    </g>

    <text x="540" y="1860" text-anchor="middle" class="mark" fill="rgba(255,230,180,0.55)">@lovtarot_</text>
  </svg>`

  const buf = await sharp(bgBuf)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 92 })
    .toBuffer()

  writeFileSync(resolve(outputDir, 'scene01_NEW.png'), buf)
  console.log(`✅ scene01_NEW.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function scene02() {
  // 배경: 3.png
  const bgBuf = await sharp(bg3Path)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .toBuffer()

  // 카드/프레임 치수
  const cardW = 620, cardH = 930
  const framePad = 30
  const nameArea = 230
  const frameW = cardW + 2 * framePad
  const frameH = cardH + 2 * framePad + nameArea
  const frameX = Math.round((W - frameW) / 2)
  const frameY = 260
  const cardLeft = frameX + framePad
  const cardTop = frameY + framePad

  const divideY = cardTop + cardH + 30
  const nameKrY = divideY + 80
  const nameEnY = nameKrY + 52
  const kwY = frameY + frameH + 90

  // Moon 카드 로드
  const cardImg = await loadCard('moon', cardW, cardH)
  const masked = await roundImg(cardImg, cardW, cardH, 8)

  // 오버레이 SVG
  const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <style>${commonStyle}</style>
    </defs>

    <!-- 카드 프레임 (카드 위에 올라가는 스트로크) -->
    ${drawFrame(frameX, frameY, frameW, frameH)}

    <!-- 카드명/이미지 구분선 -->
    <line x1="${frameX + 60}" y1="${divideY}" x2="${frameX + frameW - 60}" y2="${divideY}" stroke="rgba(232,212,139,0.5)" stroke-width="1"/>

    <!-- 카드명 -->
    <g filter="url(#textShadow)">
      <text x="540" y="${nameKrY}" text-anchor="middle" class="card-name-kr" fill="#FFFFFF">달</text>
      <text x="540" y="${nameEnY}" text-anchor="middle" class="card-name-en" fill="#E8C877">The Moon</text>
    </g>

    <!-- 키워드 (프레임 하단 외부) -->
    <g filter="url(#textShadow)">
      <text x="540" y="${kwY}" text-anchor="middle" class="keywords" fill="#E8C877">무의식 · 숨겨진 감정 · 그리움</text>
    </g>

    <!-- 워터마크 -->
    <text x="540" y="1860" text-anchor="middle" class="mark" fill="rgba(255,230,180,0.55)">@lovtarot_</text>
  </svg>`

  // 합성 순서: 배경 -> 카드 아트 -> 프레임+텍스트
  let out = await sharp(bgBuf)
    .composite([{ input: masked, left: cardLeft, top: cardTop }])
    .png()
    .toBuffer()
  out = await sharp(out)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 92 })
    .toBuffer()

  writeFileSync(resolve(outputDir, 'scene02_NEW.png'), out)
  console.log(`✅ scene02_NEW.png (${(out.length / 1024).toFixed(0)} KB)`)
}

async function scene03() {
  // 배경: 3.png
  const bgBuf = await sharp(bg3Path)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .toBuffer()

  // 작은 카드 치수
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

  const cardImg = await loadCard('moon', cardW, cardH)
  const masked = await roundImg(cardImg, cardW, cardH, 5)

  const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <style>${commonStyle}</style>
    </defs>

    <!-- 상단 헤더 -->
    <g filter="url(#textShadow)">
      <text x="540" y="220" text-anchor="middle" class="header" fill="#FFFFFF">놓지 <tspan class="hook-accent">못한</tspan> 감정</text>
    </g>

    <!-- 카드 프레임 -->
    ${drawFrame(frameX, frameY, frameW, frameH, 0.95)}

    <!-- 카드명 구분선 -->
    <line x1="${frameX + 30}" y1="${divideY}" x2="${frameX + frameW - 30}" y2="${divideY}" stroke="rgba(232,212,139,0.45)" stroke-width="1"/>

    <!-- 카드명 (프레임 내부) -->
    <g filter="url(#textShadow)">
      <text x="540" y="${nameKrY}" text-anchor="middle" class="card-name-kr-sm" fill="#FFFFFF">달</text>
      <text x="540" y="${nameEnY}" text-anchor="middle" class="card-name-en-sm" fill="#E8C877">The Moon</text>
    </g>

    <!-- 키워드 -->
    <g filter="url(#textShadow)">
      <text x="540" y="${kwY}" text-anchor="middle" class="keywords-sm" fill="#E8C877">무의식 · 숨겨진 감정 · 그리움</text>
    </g>

    <!-- 해석 (3줄) -->
    <g filter="url(#textShadow)">
      <text x="540" y="${interpY}"        text-anchor="middle" class="interp" fill="#FFFFFF">표면 아래에 감정이 남아 있어요.</text>
      <text x="540" y="${interpY + 70}"  text-anchor="middle" class="interp" fill="#FFFFFF">아직 완전히 <tspan class="hook-accent">놓지 못한</tspan>,</text>
      <text x="540" y="${interpY + 140}" text-anchor="middle" class="interp" fill="#FFFFFF">그런 마음이 맞아요.</text>
    </g>

    <!-- CTA -->
    <g filter="url(#textShadow)">
      <text x="540" y="${ctaY}"       text-anchor="middle" class="cta-main" fill="#FFFFFF">당신도 직접 뽑아보세요</text>
      <text x="540" y="${ctaY + 70}" text-anchor="middle" class="cta-url"  fill="#E8C877">무료 타로 리딩 · lovtaro.kr</text>
    </g>

    <!-- 워터마크 -->
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

  writeFileSync(resolve(outputDir, 'scene03_NEW.png'), out)
  console.log(`✅ scene03_NEW.png (${(out.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-04-18 scene01/02/03_NEW.png ===')
  mkdirSync(outputDir, { recursive: true })
  await scene01()
  await scene02()
  await scene03()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
