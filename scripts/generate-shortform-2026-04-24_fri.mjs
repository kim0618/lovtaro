/**
 * 2026-04-24 금요일 참여형 shortform 이미지 생성
 * - scene01: 질문 훅 + 카드 뒷면 3장 + 번호 표시
 * - scene02: 댓글 CTA 고정 템플릿
 *
 * 실행: node scripts/generate-shortform-2026-04-24_fri.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { siteCardBackSvg, siteCardBackDefs, CARD_WIDTH, CARD_HEIGHT } from './lib/card-back-svg.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const outputDir = resolve(rootDir, 'content-output/2026-04-24_fri/shortform')

const W = 1080, H = 1920

function generateStars(count, xMin, xMax, yMin, yMax, goldMode = false) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51,0.29,0.94,0.61,0.03,0.76,0.42,0.88,0.17,0.55,0.33,0.69]
  const goldColors = ['#e8d48b','#c9a84c','#d4b85c']
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = goldMode ? (1 + seed[(i + 3) % seed.length] * 2) : (0.8 + seed[(i + 3) % seed.length] * 1.5)
    const opacity = goldMode ? (0.4 + seed[(i + 5) % seed.length] * 0.5) : (0.2 + seed[(i + 5) % seed.length] * 0.3)
    const fill = goldMode ? goldColors[i % goldColors.length] : `rgba(139,127,176,${opacity.toFixed(2)})`
    const finalOpacity = goldMode ? opacity.toFixed(2) : '1'
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${fill}" opacity="${finalOpacity}"/>\n`
  }
  return stars
}

async function generateScene01() {
  const cardScale = 2.5
  const cardPixelW = CARD_WIDTH * cardScale
  const cardPixelH = CARD_HEIGHT * cardScale
  const cardGap = 50
  const totalWidth = cardPixelW * 3 + cardGap * 2
  const startCX = (W - totalWidth) / 2 + cardPixelW / 2
  const cardY = 920
  const numberY = cardY + cardPixelH / 2 + 50

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0%" stop-color="#100e2a"/>
      <stop offset="50%" stop-color="#121030"/>
      <stop offset="100%" stop-color="#0a0918"/>
    </linearGradient>
    ${siteCardBackDefs()}
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="15" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
    <radialGradient id="cardGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0.15"/>
      <stop offset="40%" stop-color="#8b6fb0" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
    <filter id="numGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="${cardY}" rx="500" ry="380" fill="url(#cardGlow)" filter="url(#glowBlur)"/>

  <text x="540" y="280" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="2" font-weight="300">이번 주말,</text>
  <text x="540" y="350" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#F4F8FF" letter-spacing="2" font-weight="300">그 사람에게 흐르는 마음은?</text>

  <g filter="url(#cardShadow)">
    ${siteCardBackSvg(startCX, cardY, cardScale)}
    ${siteCardBackSvg(startCX + cardPixelW + cardGap, cardY, cardScale)}
    ${siteCardBackSvg(startCX + (cardPixelW + cardGap) * 2, cardY, cardScale)}
  </g>

  <g filter="url(#numGlow)">
    <text x="${startCX}" y="${numberY}" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#e8d48b" font-weight="600">1번</text>
    <text x="${startCX + cardPixelW + cardGap}" y="${numberY}" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#e8d48b" font-weight="600">2번</text>
    <text x="${startCX + (cardPixelW + cardGap) * 2}" y="${numberY}" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#e8d48b" font-weight="600">3번</text>
  </g>

  <text x="540" y="1600" text-anchor="middle" font-family="sans-serif" font-size="30" fill="rgba(244,248,255,0.5)" letter-spacing="3" font-weight="300">직감으로 골라보세요</text>
  <text x="540" y="1820" text-anchor="middle" font-family="sans-serif" font-size="22" fill="rgba(200,180,140,0.3)" letter-spacing="2">@lovtarot_</text>
</svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(resolve(outputDir, 'scene01.png'), buf)
  console.log(`✅ scene01.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function generateScene02() {
  const goldStars = generateStars(30, 30, 1050, 100, 1800, true)
  const dimStars = generateStars(30, 30, 1050, 100, 1800, false)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bgGlow2" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#1a1040"/>
      <stop offset="40%" stop-color="#110d2e"/>
      <stop offset="100%" stop-color="#07060f"/>
    </radialGradient>
    <filter id="textGlow2" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGlow2)"/>

  <ellipse cx="540" cy="960" rx="500" ry="400" fill="#2d1b69" opacity="0.12"/>
  <ellipse cx="300" cy="600" rx="300" ry="250" fill="#3d2080" opacity="0.06"/>

  ${goldStars}
  ${dimStars}

  <g filter="url(#textGlow2)">
    <text x="540" y="840" text-anchor="middle" font-family="sans-serif" font-size="46" fill="#F4F8FF" letter-spacing="2" opacity="0.95" font-weight="300">직감으로 고른 번호를</text>
    <text x="540" y="910" text-anchor="middle" font-family="sans-serif" font-size="46" fill="#F4F8FF" letter-spacing="2" opacity="0.95" font-weight="300">댓글에 적어주세요</text>
    <text x="540" y="1020" text-anchor="middle" font-family="sans-serif" font-size="36" fill="rgba(232,212,139,0.7)" letter-spacing="3">해석을 댓글로 달아드릴게요</text>
  </g>

  <line x1="280" y1="780" x2="800" y2="780" stroke="rgba(201,168,76,0.2)" stroke-width="1"/>
  <line x1="280" y1="1060" x2="800" y2="1060" stroke="rgba(201,168,76,0.2)" stroke-width="1"/>

  <text x="540" y="1780" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#c9a84c" opacity="0.35" letter-spacing="2">@lovtarot_</text>
</svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(resolve(outputDir, 'scene02.png'), buf)
  console.log(`✅ scene02.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-04-24 참여형 shortform 이미지 생성 ===')
  await generateScene01()
  await generateScene02()
  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
