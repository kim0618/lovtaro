/**
 * 2026-04-18 토요일 scene01/02/03_new.png 생성
 * scene01: 1.png(배경+카드 뒷면) + 질문 훅
 * scene02: 2.png(악마 카드가 이미 렌더됨) + 워터마크만
 * scene03: 3.png(클린 배경) + 작은 Devil 카드 + 해석 + CTA
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

  writeFileSync(resolve(outputDir, 'scene01_new.png'), buf)
  console.log(`✅ scene01_new.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function scene02() {
  // GPT가 만든 완성본 2장gpt.png(1024x1536, aspect 0.667)를 1080x1920(aspect 0.5625)에 맞춤.
  // fit:cover로 꽉 채워 상하 경계선 제거 - scale 1.25x, 좌우 100px씩 크롭.
  // 2장gpt.png 자체에 crescent moon 포함, 별도 배경 불필요.

  const cardSrc = resolve(rootDir, 'content-output/2026-04-18_sat/shortform/2장gpt.png')

  const baseImg = await sharp(cardSrc)
    .resize(W, H, { fit: 'cover', position: 'center', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6, m1: 0.4, m2: 2.0 })
    .toBuffer()

  const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <style>${commonStyle}</style>
    </defs>
    <text x="540" y="1860" text-anchor="middle" class="mark" fill="rgba(255,230,180,0.55)">@lovtarot_</text>
  </svg>`

  const out = await sharp(baseImg)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png({ quality: 92 })
    .toBuffer()

  writeFileSync(resolve(outputDir, 'scene02_new.png'), out)
  console.log(`✅ scene02_new.png (${(out.length / 1024).toFixed(0)} KB)`)
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

    <g filter="url(#textShadow)">
      <text x="540" y="220" text-anchor="middle" class="header" fill="#FFFFFF">놓지 <tspan class="hook-accent">못한</tspan> 감정</text>
    </g>

    ${drawFrame(frameX, frameY, frameW, frameH, 0.95)}

    <line x1="${frameX + 30}" y1="${divideY}" x2="${frameX + frameW - 30}" y2="${divideY}" stroke="rgba(232,212,139,0.45)" stroke-width="1"/>

    <g filter="url(#textShadow)">
      <text x="540" y="${nameKrY}" text-anchor="middle" class="card-name-kr-sm" fill="#FFFFFF">달</text>
      <text x="540" y="${nameEnY}" text-anchor="middle" class="card-name-en-sm" fill="#E8C877">The Moon</text>
    </g>

    <g filter="url(#textShadow)">
      <text x="540" y="${kwY}" text-anchor="middle" class="keywords-sm" fill="#E8C877">무의식 · 숨겨진 감정 · 그리움</text>
    </g>

    <g filter="url(#textShadow)">
      <text x="540" y="${interpY}"        text-anchor="middle" class="interp" fill="#FFFFFF">표면 아래에 감정이 남아 있어요.</text>
      <text x="540" y="${interpY + 70}"  text-anchor="middle" class="interp" fill="#FFFFFF">아직 완전히 <tspan class="hook-accent">놓지 못한</tspan>,</text>
      <text x="540" y="${interpY + 140}" text-anchor="middle" class="interp" fill="#FFFFFF">그런 마음이 맞아요.</text>
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
  console.log('=== 2026-04-18 scene01/02/03_new.png ===')
  mkdirSync(outputDir, { recursive: true })
  await scene01()
  await scene02()
  await scene03()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
