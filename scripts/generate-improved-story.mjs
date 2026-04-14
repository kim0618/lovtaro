/**
 * 4월 15일 개선된 스토리 v2
 * - 카드 주변 글로우 효과
 * - 텍스트 영역 글래스모피즘 패널
 * - 별/반짝이 장식
 * - 카드 색상 톤에 맞는 배경
 *
 * 실행: node scripts/generate-improved-story.mjs
 */
import sharp from 'sharp'
import { writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output')

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

async function loadCard(slug, w, h) {
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) return null
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

// 별/반짝이 생성
function generateStars(count, xMin, xMax, yMin, yMax) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51,0.29,0.94,0.61,0.03,0.76,0.42,0.88,0.17,0.55,0.33,0.69,0.21,0.96,0.48,0.74]
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = 1 + seed[(i + 3) % seed.length] * 2.5
    const opacity = 0.3 + seed[(i + 5) % seed.length] * 0.7
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="rgba(255,255,255,${opacity.toFixed(2)})"/>\n`
  }
  return stars
}

// 작은 하트 장식
function generateHearts(count, xMin, xMax, yMin, yMax) {
  let hearts = ''
  const seed = [0.65,0.18,0.82,0.41,0.93,0.27,0.59,0.74]
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 3) % seed.length] * (yMax - yMin)
    const size = 6 + seed[(i + 1) % seed.length] * 8
    const opacity = 0.15 + seed[(i + 2) % seed.length] * 0.25
    hearts += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="${size.toFixed(0)}" fill="rgba(200,170,255,${opacity.toFixed(2)})" text-anchor="middle">♥</text>\n`
  }
  return hearts
}

// ── 개선된 아침 스토리 v2 ──
async function generateImprovedStory() {
  const W = 1080, H = 1920
  const cW = 720, cH = 1080
  const slug = 'fool'
  const name = '바보'
  const hookLines = ['바보 카드가 나왔다면?', '나쁜 게 아니에요', '새로운 시작의 신호입니다']
  const keywords = ['새로운 시작', '가능성', '용기']

  const img = await loadCard(slug, cW, cH)
  if (!img) { console.log('카드 없음'); return }
  const masked = await roundImg(img, cW, cH, 20)

  const cardLeft = (W - cW) / 2
  const cardTop = 200

  // 텍스트 영역 위치
  const panelTop = cardTop + cH + 20
  const panelH = H - panelTop - 30
  const nameY = panelTop + 60
  const hookStartY = nameY + 60

  const hookSvg = hookLines.map((l, i) =>
    `<text x="540" y="${hookStartY + i * 56}" font-family="sans-serif" font-size="40" font-weight="500" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">${esc(l)}</text>`
  ).join('\n  ')

  const kwY = hookStartY + hookLines.length * 56 + 20
  const kwText = keywords.map(k => esc(k)).join('  ·  ')

  const stars = generateStars(20, 50, 1030, 30, 190)
  const hearts = generateHearts(5, 100, 980, 50, 180)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <!-- 배경: 카드의 보라/남색 톤 -->
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#08061A"/>
      <stop offset="30%" stop-color="#0E0F2E"/>
      <stop offset="70%" stop-color="#0D0E28"/>
      <stop offset="100%" stop-color="#06050F"/>
    </linearGradient>

    <!-- 카드 뒤 글로우 -->
    <radialGradient id="cardGlow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="rgba(140,120,220,0.2)"/>
      <stop offset="50%" stop-color="rgba(100,80,180,0.08)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>

    <!-- 카드 테두리 글로우 -->
    <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- 글래스 패널 -->
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(140,130,200,0.12)"/>
      <stop offset="100%" stop-color="rgba(80,70,140,0.06)"/>
    </linearGradient>
  </defs>

  <!-- 배경 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- 카드 뒤 글로우 -->
  <ellipse cx="540" cy="${cardTop + cH / 2}" rx="500" ry="650" fill="url(#cardGlow)"/>

  <!-- 상단 별/하트 장식 -->
  ${stars}
  ${hearts}

  <!-- 상단 라벨 -->
  <text x="540" y="100" font-family="sans-serif" font-size="26" fill="rgba(180,170,230,0.75)" text-anchor="middle" letter-spacing="10" font-weight="300">오늘의 연애 카드</text>
  <line x1="380" y1="120" x2="700" y2="120" stroke="rgba(180,170,230,0.15)" stroke-width="1"/>

  <!-- 카드 테두리 글로우 효과 -->
  <rect x="${cardLeft - 4}" y="${cardTop - 4}" width="${cW + 8}" height="${cH + 8}" rx="24" fill="none" stroke="rgba(160,140,240,0.25)" stroke-width="2" filter="url(#glow1)"/>

  <!-- 하단 글래스 패널 -->
  <rect x="40" y="${panelTop}" width="${W - 80}" height="${panelH}" rx="20" fill="url(#glass)" stroke="rgba(160,150,220,0.1)" stroke-width="1"/>

  <!-- 카드명 -->
  <text x="540" y="${nameY}" font-family="sans-serif" font-size="30" font-weight="300" fill="rgba(200,190,240,0.8)" text-anchor="middle" letter-spacing="6">${esc(name)}</text>

  <!-- 메시지 -->
  ${hookSvg}

  <!-- 키워드 -->
  <text x="540" y="${kwY}" font-family="sans-serif" font-size="20" fill="rgba(180,170,220,0.5)" text-anchor="middle" letter-spacing="2">${kwText}</text>

  <!-- CTA 버튼 -->
  <rect x="290" y="${kwY + 30}" width="500" height="54" rx="27" fill="rgba(140,120,220,0.15)" stroke="rgba(160,140,240,0.35)" stroke-width="1"/>
  <text x="540" y="${kwY + 64}" font-family="sans-serif" font-size="21" fill="rgba(200,190,255,0.85)" text-anchor="middle" font-weight="400">무료로 직접 뽑아보기 → lovtaro.kr</text>

  <!-- 하단 -->
  <text x="540" y="${kwY + 110}" font-family="sans-serif" font-size="16" fill="rgba(160,150,220,0.3)" text-anchor="middle">@lovtarot_</text>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  const result = await sharp(base)
    .composite([{ input: masked, left: cardLeft, top: cardTop }])
    .png({ quality: 90 }).toBuffer()

  const outPath = resolve(outputDir, '4월_15일__수_/story/story_improved.png')
  writeFileSync(outPath, result)
  console.log('✅ 아침 스토리 v2 생성:', outPath)
}

// ── 개선된 저녁 poll-story v2 ──
async function generateImprovedPollStory() {
  const W = 1080, H = 1920
  const slug = 'fool'
  const question = '고백은 직접? 분위기로?'
  const label = '이것 vs 저것'
  const optionA = '직접 말한다'
  const optionB = '분위기로 보여준다'

  const cardW = 640, cardH = 960
  const cardTop = 380
  const cardLeft = (W - cardW) / 2

  const cardImg = await loadCard(slug, cardW, cardH)
  if (!cardImg) { console.log('카드 없음'); return }
  const masked = await roundImg(cardImg, cardW, cardH, 20)

  // 카드를 더 선명하게 (밝기 UP, 투명도 UP)
  const faded = await sharp(masked).ensureAlpha().modulate({ brightness: 0.9 }).png().toBuffer()
  const fadeMask = `<svg width="${cardW}" height="${cardH}"><rect width="${cardW}" height="${cardH}" rx="20" fill="rgba(255,255,255,0.65)"/></svg>`
  const cardFinal = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()

  const stars = generateStars(15, 50, 1030, 30, 280)

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#08061A"/>
      <stop offset="30%" stop-color="#0E0F2E"/>
      <stop offset="70%" stop-color="#0D0E28"/>
      <stop offset="100%" stop-color="#06050F"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="38%">
      <stop offset="0%" stop-color="rgba(140,120,220,0.15)"/>
      <stop offset="60%" stop-color="rgba(100,80,180,0.05)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(140,130,200,0.1)"/>
      <stop offset="100%" stop-color="rgba(80,70,140,0.05)"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="800" rx="500" ry="600" fill="url(#glow)"/>

  <!-- 별 장식 -->
  ${stars}

  <!-- 상단 라벨 -->
  <text x="540" y="95" font-family="sans-serif" font-size="26" fill="rgba(180,170,230,0.75)" text-anchor="middle" letter-spacing="10" font-weight="300">${esc(label)}</text>
  <line x1="380" y1="115" x2="700" y2="115" stroke="rgba(180,170,230,0.15)" stroke-width="1"/>

  <!-- 질문 -->
  <text x="540" y="200" font-family="sans-serif" font-size="50" font-weight="600" fill="#FFFFFF" text-anchor="middle">${esc(question)}</text>

  <!-- 질문 아래 장식선 -->
  <line x1="430" y1="230" x2="650" y2="230" stroke="rgba(180,170,230,0.25)" stroke-width="1"/>
  <circle cx="540" cy="230" r="3" fill="rgba(200,180,255,0.4)"/>

  <!-- 카드 테두리 글로우 -->
  <rect x="${cardLeft - 4}" y="${cardTop - 4}" width="${cardW + 8}" height="${cardH + 8}" rx="24" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#glow1)"/>

  <!-- 하단 선택지 글래스 패널 -->
  <rect x="60" y="1400" width="${W - 120}" height="260" rx="20" fill="url(#glass)" stroke="rgba(160,150,220,0.1)" stroke-width="1"/>

  <!-- 선택지 A -->
  <rect x="100" y="1420" width="420" height="90" rx="16" fill="rgba(120,100,220,0.15)" stroke="rgba(140,120,240,0.4)" stroke-width="1.5"/>
  <rect x="120" y="1440" width="36" height="36" rx="18" fill="rgba(140,120,240,0.3)"/>
  <text x="138" y="1465" font-family="sans-serif" font-size="18" fill="rgba(200,190,255,0.9)" text-anchor="middle" font-weight="600">A</text>
  <text x="330" y="1473" font-family="sans-serif" font-size="28" fill="#E8EEFF" text-anchor="middle" font-weight="400">${esc(optionA)}</text>

  <!-- VS 구분 -->
  <circle cx="540" cy="1465" r="22" fill="rgba(200,180,140,0.12)" stroke="rgba(200,180,140,0.25)" stroke-width="1"/>
  <text x="540" y="1473" font-family="sans-serif" font-size="16" fill="rgba(220,200,160,0.8)" text-anchor="middle" font-weight="700">VS</text>

  <!-- 선택지 B -->
  <rect x="560" y="1420" width="420" height="90" rx="16" fill="rgba(200,160,100,0.1)" stroke="rgba(220,180,120,0.35)" stroke-width="1.5"/>
  <rect x="580" y="1440" width="36" height="36" rx="18" fill="rgba(220,180,120,0.25)"/>
  <text x="598" y="1465" font-family="sans-serif" font-size="18" fill="rgba(240,210,160,0.9)" text-anchor="middle" font-weight="600">B</text>
  <text x="790" y="1473" font-family="sans-serif" font-size="28" fill="#E8EEFF" text-anchor="middle" font-weight="400">${esc(optionB)}</text>

  <!-- 참여 안내 -->
  <text x="540" y="1570" font-family="sans-serif" font-size="20" fill="rgba(180,170,220,0.5)" text-anchor="middle">↑ 투표 스티커로 골라보세요</text>

  <!-- 하단 CTA -->
  <rect x="290" y="1700" width="500" height="54" rx="27" fill="rgba(140,120,220,0.15)" stroke="rgba(160,140,240,0.35)" stroke-width="1"/>
  <text x="540" y="1734" font-family="sans-serif" font-size="21" fill="rgba(200,190,255,0.85)" text-anchor="middle" font-weight="400">무료로 직접 뽑아보기 → lovtaro.kr</text>

  <text x="540" y="1800" font-family="sans-serif" font-size="16" fill="rgba(160,150,220,0.3)" text-anchor="middle">@lovtarot_</text>
</svg>`

  let result = await sharp(Buffer.from(bgSvg)).png().toBuffer()
  result = await sharp(result)
    .composite([{ input: cardFinal, left: cardLeft, top: cardTop }])
    .png({ quality: 90 }).toBuffer()

  const outPath = resolve(outputDir, '4월_15일__수_/poll-story_improved.png')
  writeFileSync(outPath, result)
  console.log('✅ 저녁 poll-story v2 생성:', outPath)
}

async function main() {
  await generateImprovedStory()
  await generateImprovedPollStory()
  console.log('\n완료!')
}

main().catch(console.error)
