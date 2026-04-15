/**
 * 2026-04-18 토요일 기존형 shortform 이미지 생성
 * - scene01: "그 사람이 아직 나를 생각하고 있을까?" + 카드 뒷면
 * - scene02: Six of Cups 카드 공개
 * - scene03: 해석 + 감정 마무리
 *
 * 실행: node scripts/generate-shortform-2026-04-18_sat.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/2026-04-18_sat/shortform')
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

function cardBackSvg(cx, cy) {
  return `
    <g transform="translate(${cx}, ${cy})">
      <rect x="-165" y="-240" width="330" height="480" rx="16" ry="16" fill="url(#cardBg)" stroke="url(#cardBorder)" stroke-width="3"/>
      <rect x="-148" y="-223" width="296" height="446" rx="10" ry="10" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.4"/>
      <g stroke="url(#patternGold)" fill="none" stroke-width="1.2" opacity="0.5">
        <path d="M-130,-205 C-130,-185 -115,-185 -110,-205"/><path d="M-130,-205 C-110,-205 -110,-190 -130,-185"/>
        <path d="M130,-205 C130,-185 115,-185 110,-205"/><path d="M130,-205 C110,-205 110,-190 130,-185"/>
        <path d="M-130,205 C-130,185 -115,185 -110,205"/><path d="M-130,205 C-110,205 -110,190 -130,185"/>
        <path d="M130,205 C130,185 115,185 110,205"/><path d="M130,205 C110,205 110,190 130,185"/>
      </g>
      <circle cx="0" cy="0" r="120" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.3"/>
      <circle cx="0" cy="0" r="105" fill="none" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>
      <polygon points="0,-90 75,0 0,90 -75,0" fill="none" stroke="#c9a84c" stroke-width="1" opacity="0.35"/>
      <g stroke="#c9a84c" stroke-width="1" opacity="0.4">
        <line x1="0" y1="-65" x2="0" y2="65"/><line x1="-65" y1="0" x2="65" y2="0"/>
        <line x1="-46" y1="-46" x2="46" y2="46"/><line x1="46" y1="-46" x2="-46" y2="46"/>
      </g>
      <circle cx="0" cy="0" r="35" fill="none" stroke="#e8d48b" stroke-width="1.5" opacity="0.5"/>
      <path d="M-8,-20 A22,22 0 1,1 -8,20 A16,16 0 1,0 -8,-20" fill="#c9a84c" opacity="0.3"/>
      <circle cx="0" cy="-35" r="3" fill="#c9a84c" opacity="0.5"/><circle cx="0" cy="35" r="3" fill="#c9a84c" opacity="0.5"/>
      <circle cx="-35" cy="0" r="3" fill="#c9a84c" opacity="0.5"/><circle cx="35" cy="0" r="3" fill="#c9a84c" opacity="0.5"/>
      <g fill="#e8d48b" opacity="0.45">
        <polygon points="0,-122 3,-115 0,-108 -3,-115"/><polygon points="0,108 3,115 0,122 -3,115"/>
        <polygon points="-122,0 -115,3 -108,0 -115,-3"/><polygon points="108,0 115,3 122,0 115,-3"/>
      </g>
      <text x="0" y="-185" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="6" fill="#c9a84c" opacity="0.45">LOVTARO</text>
      <text x="0" y="198" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="6" fill="#c9a84c" opacity="0.45">LOVTARO</text>
    </g>`
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

async function generateScene01() {
  const goldStars = generateStars(40, 30, 1050, 100, 1800, true)
  const dimStars = generateStars(40, 30, 1050, 100, 1800, false)
  const cardCX = 540, cardCY = 1050

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#1a1040"/><stop offset="40%" stop-color="#110d2e"/><stop offset="100%" stop-color="#07060f"/></radialGradient>
    <radialGradient id="cardGlowBg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#c9a84c" stop-opacity="0.15"/><stop offset="50%" stop-color="#8b6fb0" stop-opacity="0.06"/><stop offset="100%" stop-color="#1a1040" stop-opacity="0"/></radialGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e1545"/><stop offset="50%" stop-color="#2a1f5e"/><stop offset="100%" stop-color="#1a1040"/></linearGradient>
    <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a84c"/><stop offset="50%" stop-color="#e8d48b"/><stop offset="100%" stop-color="#a08030"/></linearGradient>
    <linearGradient id="patternGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a84c" stop-opacity="0.6"/><stop offset="100%" stop-color="#e8d48b" stop-opacity="0.3"/></linearGradient>
    <filter id="bigGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="90"/></filter>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="#000000" flood-opacity="0.5"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgGlow)"/>
  <ellipse cx="540" cy="850" rx="550" ry="500" fill="#2d1b69" opacity="0.15"/>
  <ellipse cx="${cardCX}" cy="${cardCY}" rx="380" ry="450" fill="url(#cardGlowBg)" filter="url(#bigGlow)"/>
  ${goldStars}${dimStars}
  <g filter="url(#cardShadow)">${cardBackSvg(cardCX, cardCY)}</g>
  <g filter="url(#textGlow)">
    <text x="540" y="360" text-anchor="middle" font-family="sans-serif" font-size="54" fill="#f0e6cc" letter-spacing="2" opacity="0.95" font-weight="500">그 사람이 아직</text>
    <text x="540" y="440" text-anchor="middle" font-family="sans-serif" font-size="54" fill="#f0e6cc" letter-spacing="2" opacity="0.95" font-weight="500">나를 생각하고 있을까?</text>
  </g>
  <text x="540" y="1780" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#c9a84c" opacity="0.35" letter-spacing="2">@lovtarot_</text>
</svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene01.png'), buf)
  console.log(`✅ scene01.png (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function generateScene02() {
  const cardH = 864, cardW = 576
  const cardLeft = Math.round((W - cardW) / 2), cardTop = 380
  const cardImg = await loadCard('moon', cardW, cardH)
  if (!cardImg) { console.error('❌ moon.png 없음'); return }
  const masked = await roundImg(cardImg, cardW, cardH, 20)
  const stars = generateStars(25, 30, 1050, 50, 1870)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#1a1040"/><stop offset="40%" stop-color="#110d2e"/><stop offset="100%" stop-color="#07060f"/></radialGradient>
    <radialGradient id="revealGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#c9a84c" stop-opacity="0.18"/><stop offset="30%" stop-color="#8b6fb0" stop-opacity="0.1"/><stop offset="100%" stop-color="#1a1040" stop-opacity="0"/></radialGradient>
    <filter id="bigGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="80"/></filter>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="borderGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgGlow)"/>
  <ellipse cx="540" cy="750" rx="450" ry="500" fill="#2d1b69" opacity="0.12"/>
  <ellipse cx="540" cy="${cardTop + cardH / 2}" rx="380" ry="500" fill="url(#revealGlow)" filter="url(#bigGlow)"/>
  ${stars}
  <rect x="${cardLeft - 6}" y="${cardTop - 6}" width="${cardW + 12}" height="${cardH + 12}" rx="24" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#borderGlow)"/>
  <g filter="url(#textGlow)">
    <text x="540" y="280" text-anchor="middle" font-family="sans-serif" font-size="52" fill="#f0e6cc" letter-spacing="4" font-weight="500" opacity="0.95">달</text>
    <text x="540" y="330" text-anchor="middle" font-family="sans-serif" font-size="18" fill="rgba(200,190,240,0.45)" letter-spacing="6" font-weight="300">The Moon</text>
  </g>
  <g filter="url(#textGlow)">
    <text x="540" y="${cardTop + cardH + 80}" text-anchor="middle" font-family="sans-serif" font-size="30" fill="rgba(200,180,140,0.6)" letter-spacing="6">무의식 · 숨겨진 감정 · 그리움</text>
  </g>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  const result = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene02.png'), result)
  console.log(`✅ scene02.png (${(result.length / 1024).toFixed(0)} KB)`)
}

async function generateScene03() {
  const cardH = 480, cardW = 320
  const cardLeft = Math.round((W - cardW) / 2), cardTop = 120
  const cardImg = await loadCard('moon', cardW, cardH)
  if (!cardImg) { console.error('❌ moon.png 없음'); return }
  const masked = await roundImg(cardImg, cardW, cardH, 16)
  const stars = generateStars(15, 30, 1050, 50, 1870)
  const dividerY = cardTop + cardH + 50
  const textStartY = dividerY + 130

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.15" y2="1"><stop offset="0%" stop-color="#0c0a24"/><stop offset="40%" stop-color="#100e2a"/><stop offset="100%" stop-color="#07060f"/></linearGradient>
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/><stop offset="20%" stop-color="#c9a84c" stop-opacity="0.4"/><stop offset="80%" stop-color="#e8d48b" stop-opacity="0.4"/><stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/></linearGradient>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="cardShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="900" rx="400" ry="500" fill="#1a1040" opacity="0.15"/>
  ${stars}
  <line x1="80" y1="${dividerY}" x2="1000" y2="${dividerY}" stroke="url(#goldLine)" stroke-width="1.5"/>
  <g filter="url(#textGlow)">
    <text x="540" y="${textStartY}" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#f0e6cc" letter-spacing="1" font-weight="500" opacity="0.95">"표면 아래에 감정이 남아 있어.</text>
    <text x="540" y="${textStartY + 68}" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#f0e6cc" letter-spacing="1" font-weight="500" opacity="0.95">아직 완전히 놓지 못한 거야."</text>
  </g>
  <text x="540" y="${textStartY + 250}" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#c9a84c" opacity="0.5" letter-spacing="2">이 카드가 와닿는다면 프로필 링크에서 확인해보세요</text>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  const result = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png({ quality: 90 }).toBuffer()
  writeFileSync(resolve(outputDir, 'scene03.png'), result)
  console.log(`✅ scene03.png (${(result.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('=== 2026-04-18 기존형 shortform 이미지 생성 ===')
  mkdirSync(outputDir, { recursive: true })
  await generateScene01()
  await generateScene02()
  await generateScene03()
  console.log('완료!')
}
main().catch(err => { console.error('❌:', err); process.exit(1) })
