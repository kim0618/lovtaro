/**
 * 2026-04-27(월) ~ 2026-05-03(일) 일주일 story 7장 일괄 생성
 *
 * 각 카드의 hook/keywords는 일별로 다르되, 시각 레이아웃은 story.mjs 템플릿 기준 통일.
 * 5/3(일)은 주간 리캡형 톤 ("이번 주, 마음을 비추던 카드들") - 광고 문구 금지.
 *
 * 실행: node scripts/generate-stories-2026-04-27_to_05-03.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const mcardsDir = resolve(rootDir, 'public/images/mcards')
const W = 1080, H = 1920
const KO_STACK = `'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif`

function generateStars(count, xMin, xMax, yMin, yMax, seedOffset = 0) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51,0.29,0.94,0.61,0.03,0.76,0.42,0.88,0.17,0.55,0.33,0.69]
  const colors = ['#e8d48b','#c9a84c','#d4b85c']
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[(i + seedOffset) % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7 + seedOffset) % seed.length] * (yMax - yMin)
    const size = 1 + seed[(i + 3 + seedOffset) % seed.length] * 2.5
    const opacity = 0.3 + seed[(i + 5 + seedOffset) % seed.length] * 0.6
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${colors[i % colors.length]}" opacity="${opacity.toFixed(2)}"/>\n`
  }
  return stars
}

async function loadCard(suit, name, w, h) {
  const p = resolve(mcardsDir, suit, `${name}.png`)
  if (!existsSync(p)) { console.error(`카드 없음: ${p}`); return null }
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

async function generateStory({ dateFolder, suit, cardName, nameEn, hookLines, keywords, header = '오늘의 소개 카드', seedOffset = 0 }) {
  const outputDir = resolve(rootDir, `content-output/${dateFolder}/story`)
  mkdirSync(outputDir, { recursive: true })

  const cW = 680, cH = 930
  const cardLeft = (W - cW) / 2
  const cardTop = 170

  const img = await loadCard(suit, cardName, cW, cH)
  if (!img) { console.error(`❌ ${suit}/${cardName}.png 없음`); return }
  const masked = await roundImg(img, cW, cH, 20)

  const stars = generateStars(30, 50, 1030, 50, 1850, seedOffset)
  const textAreaTop = cardTop + cH + 50
  const engNameY = textAreaTop + 40
  const hookStartY = engNameY + 80

  const hookSvg = hookLines.map((l, i) =>
    `<text x="540" y="${hookStartY + i * 55}" font-family="${KO_STACK}" font-size="38" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const kwY = hookStartY + hookLines.length * 64 + 35
  const kwText = keywords.map(k => esc(k)).join('  ·  ')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#08061A"/>
      <stop offset="30%" stop-color="#0E0F2E"/>
      <stop offset="70%" stop-color="#0D0E28"/>
      <stop offset="100%" stop-color="#06050F"/>
    </linearGradient>
    <radialGradient id="cardGlow" cx="50%" cy="40%" r="38%">
      <stop offset="0%" stop-color="rgba(140,120,220,0.15)"/>
      <stop offset="60%" stop-color="rgba(100,80,180,0.05)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="tg" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="${cardTop + cH / 2}" rx="500" ry="650" fill="url(#cardGlow)"/>
  ${stars}
  <text x="540" y="100" font-family="${KO_STACK}" font-size="26" fill="rgba(180,170,230,0.75)" text-anchor="middle" letter-spacing="10" font-weight="300">${esc(header)}</text>
  <line x1="380" y1="120" x2="700" y2="120" stroke="rgba(180,170,230,0.15)" stroke-width="1"/>
  <rect x="${cardLeft - 4}" y="${cardTop - 4}" width="${cW + 8}" height="${cH + 8}" rx="24" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#glow1)"/>
  <text x="540" y="${engNameY}" font-family="Georgia, serif" font-size="22" font-style="italic" fill="rgba(200,180,140,0.65)" text-anchor="middle">${esc(nameEn)}</text>
  <g filter="url(#tg)">
    ${hookSvg}
  </g>
  <text x="540" y="${kwY}" font-family="${KO_STACK}" font-size="20" fill="rgba(180,170,220,0.45)" text-anchor="middle" letter-spacing="2">${kwText}</text>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  const result = await sharp(base)
    .composite([{ input: masked, left: cardLeft, top: cardTop }])
    .png({ quality: 90 }).toBuffer()

  writeFileSync(resolve(outputDir, 'story01.png'), result)
  console.log(`✅ ${dateFolder}/story01.png (${(result.length / 1024).toFixed(0)} KB) - ${nameEn}`)
}

async function main() {
  console.log('=== 2026-04-27 ~ 2026-05-03 매일 story (7장) ===')

  await generateStory({
    dateFolder: '2026-04-27_mon',
    suit: 'pentacles', cardName: 'Two of Pentacles', nameEn: 'Two of Pentacles',
    hookLines: ['둘 사이 균형이 흔들릴 때', '지금은 하나씩 결을 맞추는 시기예요'],
    keywords: ['균형', '조율', '리듬'],
    seedOffset: 0,
  })

  await generateStory({
    dateFolder: '2026-04-28_tue',
    suit: 'cups', cardName: 'Three of Cups', nameEn: 'Three of Cups',
    hookLines: ['가까운 사람과 함께 풀어가는 마음', '혼자 안고 있던 결이 한결 가벼워져요'],
    keywords: ['친밀함', '나눔', '회복'],
    seedOffset: 5,
  })

  await generateStory({
    dateFolder: '2026-04-29_wed',
    suit: 'wands', cardName: 'Three of Wands', nameEn: 'Three of Wands',
    hookLines: ['결과를 기다리는 마음 위로', '한 박자 더 내다보는 시간이 와요'],
    keywords: ['기다림', '시야', '준비'],
    seedOffset: 10,
  })

  await generateStory({
    dateFolder: '2026-04-30_thu',
    suit: 'cups', cardName: 'Nine of Cups', nameEn: 'Nine of Cups',
    hookLines: ['마음의 만족이 잔잔히 차오르는 날', '내가 이미 가진 결을 한 번 봐주세요'],
    keywords: ['충만', '감사', '여유'],
    seedOffset: 15,
  })

  await generateStory({
    dateFolder: '2026-05-01_fri',
    suit: 'wands', cardName: 'Queen of Wands', nameEn: 'Queen of Wands',
    hookLines: ['자기 결대로 빛나는 사람의 하루', '오늘은 내 톤을 굳이 낮추지 마세요'],
    keywords: ['자신감', '결', '확신'],
    seedOffset: 20,
  })

  await generateStory({
    dateFolder: '2026-05-02_sat',
    suit: 'pentacles', cardName: 'Page of Pentacles', nameEn: 'Page of Pentacles',
    hookLines: ['작은 시작이 단단해지는 시기', '서두르지 않는 발걸음이 결을 만들어요'],
    keywords: ['시작', '꾸준함', '집중'],
    seedOffset: 25,
  })

  // 5/3(일) - 주간 리캡형 (광고 톤 금지)
  await generateStory({
    dateFolder: '2026-05-03_sun',
    suit: 'cups', cardName: 'Queen of Cups', nameEn: 'Queen of Cups',
    hookLines: ['이번 주, 마음을 비추던 카드들', '한 번 더 내 결을 들여다보는 일요일'],
    keywords: ['감정 회고', '내려놓음', '잔잔함'],
    header: '이번 주 마음의 결',
    seedOffset: 18,
  })

  console.log('완료!')
}

main().catch(err => { console.error('❌:', err); process.exit(1) })
