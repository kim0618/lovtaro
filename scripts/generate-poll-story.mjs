/**
 * 저녁 퀴즈/설문 스토리 배경 이미지 생성
 * 실행: node scripts/generate-poll-story.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/4월_10일1')

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
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

async function generatePollStory() {
  const W = 1080, H = 1920

  // 태양 카드를 중앙에 크게
  const cardW = 700, cardH = 1050
  const cardImg = await loadCard('sun', cardW, cardH)
  const maskedCard = cardImg ? await roundImg(cardImg, cardW, cardH, 20) : null

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#03050A"/>
      <stop offset="15%" stop-color="#0A1020"/>
      <stop offset="85%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#03050A"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="38%">
      <stop offset="0%" stop-color="rgba(200,169,110,0.1)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="800" rx="500" ry="600" fill="url(#glow)"/>

  <!-- 상단 라벨 -->
  <text x="540" y="120" font-family="sans-serif" font-size="20" fill="rgba(77,163,255,0.5)" text-anchor="middle" letter-spacing="6">오늘의 연애 질문</text>

  <!-- 질문 -->
  <text x="540" y="240" font-family="sans-serif" font-size="44" font-weight="300" fill="#F4F8FF" text-anchor="middle">연애에서 당신은?</text>

  <!-- 투표 스티커 올릴 빈 공간 (300~500 영역) -->

  <!-- 하단 CTA -->
  <line x1="380" y1="1770" x2="700" y2="1770" stroke="rgba(77,163,255,0.1)" stroke-width="1"/>
  <text x="540" y="1810" font-family="sans-serif" font-size="20" fill="rgba(143,211,255,0.45)" text-anchor="middle">무료로 직접 뽑아보기 · lovtaro.kr</text>
  <text x="540" y="1845" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
</svg>`

  let result = await sharp(Buffer.from(bgSvg)).png().toBuffer()

  // 카드를 중앙에 크게 배치 (반투명)
  if (maskedCard) {
    const fadedCard = await sharp(maskedCard)
      .ensureAlpha()
      .modulate({ brightness: 0.7 })
      .png()
      .toBuffer()

    const opacity = 0.35
    const overlayMask = `<svg width="${cardW}" height="${cardH}"><rect width="${cardW}" height="${cardH}" rx="20" fill="rgba(255,255,255,${opacity})"/></svg>`
    const fadedFinal = await sharp(fadedCard)
      .composite([{ input: Buffer.from(overlayMask), blend: 'dest-in' }])
      .png()
      .toBuffer()

    result = await sharp(result)
      .composite([{
        input: fadedFinal,
        left: Math.round((W - cardW) / 2),
        top: 520
      }])
      .png({ quality: 90 })
      .toBuffer()
  }

  ensureDir(outputDir)
  const outPath = resolve(outputDir, 'poll-story.png')
  writeFileSync(outPath, result)
  console.log(`✅ 저녁 퀴즈 스토리 생성 완료: ${outPath}`)
}

generatePollStory().catch(console.error)
