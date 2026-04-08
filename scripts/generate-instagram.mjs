/**
 * 인스타그램 스토리 + 릴스 콘텐츠 생성 (4/9~4/13 스케줄)
 * 실행: node scripts/generate-instagram.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output')

// ── 스케줄 데이터 ──
const SCHEDULE = [
  {
    date: '4월 8일 (목)',
    story: { id: 'lovers', slug: 'lovers', name: '연인', nameEn: 'The Lovers', keywords: ['선택', '사랑', '끌림'] },
    reel: { id: 'hermit', slug: 'hermit', name: '은둔자', nameEn: 'The Hermit', keywords: ['성찰', '내면', '거리두기'] },
  },
  {
    date: '4월 9일 (금)',
    story: { id: 'strength', slug: 'strength', name: '힘', nameEn: 'Strength', keywords: ['내면의 힘', '인내', '용기'] },
    reel: { id: 'emperor', slug: 'emperor', name: '황제', nameEn: 'The Emperor', keywords: ['안정', '책임', '구조'] },
  },
  {
    date: '4월 10일 (토)',
    story: { id: 'sun', slug: 'sun', name: '태양', nameEn: 'The Sun', keywords: ['기쁨', '활력', '성공'] },
    reel: { id: 'chariot', slug: 'chariot', name: '전차', nameEn: 'The Chariot', keywords: ['전진', '의지', '승리'] },
  },
  {
    date: '4월 11일 (일)',
    story: { id: 'wheel', slug: 'wheel-of-fortune', name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', keywords: ['변화', '운명', '전환점'] },
    reel: { id: 'death', slug: 'death', name: '죽음', nameEn: 'Death', keywords: ['변화', '끝과 시작', '해방'] },
  },
  {
    date: '4월 12일 (월)',
    story: { id: 'magician', slug: 'magician', name: '마법사', nameEn: 'The Magician', keywords: ['의지', '창조', '실현'] },
    reel: { id: 'devil', slug: 'devil', name: '악마', nameEn: 'The Devil', keywords: ['집착', '유혹', '속박'] },
  },
  {
    date: '4월 13일 (화)',
    story: { id: 'priestess', slug: 'high-priestess', name: '여사제', nameEn: 'The High Priestess', keywords: ['직관', '신비', '내면의 지혜'] },
    reel: { id: 'tower', slug: 'tower', name: '탑', nameEn: 'The Tower', keywords: ['붕괴', '충격', '해방'] },
  },
]

// ── 스토리 한줄 해석 ──
const STORY_HOOKS = {
  lovers: '두 사람 사이에서 고민 중인가요?\n지금 끌리는 쪽이\n당신의 답이에요',
  strength: '밀어붙인다고 되는 게 아니에요\n지금은 기다릴 줄 아는 힘이\n당신을 지켜줄 거예요',
  sun: '지금 느끼는 그 설렘,\n진짜입니다\n의심하지 마세요',
  wheel: '요즘 연락이 뜸한 그 사람이\n있다면\n흐름이 바뀌고 있어요',
  magician: '고백할까 말까 고민 중인가요?\n지금 당신에게는\n말의 힘이 있어요',
  priestess: '말하지 않아도\n느껴지는 감정이 있잖아요\n그게 맞아요, 그거예요',
}

// ── 릴스 속마음 해석 ──
const REEL_HOOKS = {
  hermit: '상대는 지금 혼자\n감정을 정리하고 있어요\n당신을 잊으려는 게 아니에요',
  emperor: '상대는 당신과의 관계를\n진지하게 생각하고 있어요\n가볍게 보지 않아요',
  chariot: '상대는 당신을 향해\n적극적으로 다가오고 싶어해요\n기다려보세요',
  death: '상대의 마음에서\n무언가가 끝나고 있어요\n그리고 새로운 감정이 시작되고 있어요',
  devil: '상대는 당신에게\n강하게 끌리고 있어요\n하지만 그 감정이 복잡해요',
  tower: '상대의 마음에\n큰 변화가 오고 있어요\n당신 때문일 수 있어요',
}

// ── 해시태그 ──
const HASHTAGS = `#타로 #타로점 #타로리딩 #타로해석 #오늘의운세
#연애상담 #연애고민 #연애운세 #사랑운
#솔로 #썸남 #썸녀 #짝사랑중 #재회타로
#무료운세 #일일타로 #카드리딩
#tarot #tarotcards #tarotreading #lovetarotreading`

// ── 유틸 ──
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

// ══════════════════════════════════════
// 스토리 (1080x1920)
// ══════════════════════════════════════
async function generateStory(card, hook) {
  const W = 1080, H = 1920
  const cW = 820, cH = 1230
  const img = await loadCard(card.slug, cW, cH)
  if (!img) return null
  const masked = await roundImg(img, cW, cH, 20)

  const lines = hook.split('\n')
  const hookY = 1420
  const hookSvg = lines.map((l, i) =>
    `<text x="540" y="${hookY + i * 50}" font-family="sans-serif" font-size="38" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#03050A"/>
      <stop offset="25%" stop-color="#0A1020"/>
      <stop offset="75%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#03050A"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <text x="540" y="105" font-family="sans-serif" font-size="20" fill="rgba(77,163,255,0.5)" text-anchor="middle" letter-spacing="6">오늘의 연애 카드</text>

  <text x="540" y="1365" font-family="sans-serif" font-size="48" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(card.name)}</text>
  <text x="540" y="1395" font-family="Georgia, serif" font-size="18" font-style="italic" fill="rgba(126,138,168,0.4)" text-anchor="middle">${esc(card.nameEn)}</text>

  ${hookSvg}

  <text x="540" y="${hookY + lines.length * 50 + 30}" font-family="sans-serif" font-size="18" fill="rgba(167,183,214,0.35)" text-anchor="middle">${card.keywords.map(k => esc(k)).join('  ·  ')}</text>

  <line x1="380" y1="1770" x2="700" y2="1770" stroke="rgba(77,163,255,0.1)" stroke-width="1"/>
  <text x="540" y="1810" font-family="sans-serif" font-size="20" fill="rgba(143,211,255,0.45)" text-anchor="middle">무료로 직접 뽑아보기 · lovtaro.kr</text>
  <text x="540" y="1845" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  return sharp(base)
    .composite([{ input: masked, left: (W - cW) / 2, top: 140 }])
    .png({ quality: 90 }).toBuffer()
}

// ══════════════════════════════════════
// 릴스용 3장 (1080x1920)
// 1: 질문 (카드 뒷면) → 2: 카드 공개 → 3: 해석+CTA
// ══════════════════════════════════════
async function generateReel(card, hook) {
  const W = 1080, H = 1920
  const slides = []

  const bg = (c) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#03050A"/><stop offset="40%" stop-color="#0A1020"/>
    <stop offset="60%" stop-color="#0A1020"/><stop offset="100%" stop-color="#03050A"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>${c}</svg>`

  // ── 1: 질문 + 사이트 카드 뒷면 SVG ──
  const S = 4.1667, CX = 290, CY = 500
  const sx = (x) => (CX + x * S).toFixed(1)
  const sy = (y) => (CY + y * S).toFixed(1)
  const sr = (r) => (r * S).toFixed(1)
  const sw = (w) => (w * S).toFixed(1)

  const s1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#03050A"/><stop offset="40%" stop-color="#0A1020"/>
      <stop offset="60%" stop-color="#0A1020"/><stop offset="100%" stop-color="#03050A"/>
    </linearGradient>
    <linearGradient id="cardBg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#101A31"/><stop offset="50%" stop-color="#0A1020"/><stop offset="100%" stop-color="#060A14"/>
    </linearGradient>
    <radialGradient id="subtleGlow" cx="50%" cy="48%" r="38%">
      <stop offset="0%" stop-color="rgba(120,80,200,0.12)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg1)"/>
  <ellipse cx="540" cy="912" rx="400" ry="500" fill="url(#subtleGlow)"/>
  <text x="540" y="320" font-family="sans-serif" font-size="44" font-weight="200" fill="#F4F8FF" text-anchor="middle">혹시 지금</text>
  <text x="540" y="380" font-family="sans-serif" font-size="44" font-weight="200" fill="#F4F8FF" text-anchor="middle">그 사람 마음이</text>
  <text x="540" y="440" font-family="sans-serif" font-size="44" font-weight="200" fill="#F4F8FF" text-anchor="middle">궁금하지 않나요?</text>
  <rect x="${CX}" y="${CY}" width="500" height="825" rx="16" ry="16" fill="url(#cardBg)"/>
  <rect x="${sx(4)}" y="${sy(4)}" width="${sw(112)}" height="${sw(190)}" rx="${sr(6)}" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="3" fill="none"/>
  <rect x="${sx(9)}" y="${sy(9)}" width="${sw(102)}" height="${sw(180)}" rx="${sr(4)}" stroke="#C8A96E" stroke-opacity="0.22" stroke-width="2" fill="none"/>
  <path d="M${sx(13)} ${sy(21)} Q${sx(13)} ${sy(13)} ${sx(21)} ${sy(13)}" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="3" fill="none"/>
  <path d="M${sx(13)} ${sy(27)} Q${sx(13)} ${sy(13)} ${sx(27)} ${sy(13)}" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="2" fill="none"/>
  <path d="M${sx(107)} ${sy(21)} Q${sx(107)} ${sy(13)} ${sx(99)} ${sy(13)}" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="3" fill="none"/>
  <path d="M${sx(107)} ${sy(27)} Q${sx(107)} ${sy(13)} ${sx(93)} ${sy(13)}" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="2" fill="none"/>
  <path d="M${sx(13)} ${sy(177)} Q${sx(13)} ${sy(185)} ${sx(21)} ${sy(185)}" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="3" fill="none"/>
  <path d="M${sx(13)} ${sy(171)} Q${sx(13)} ${sy(185)} ${sx(27)} ${sy(185)}" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="2" fill="none"/>
  <path d="M${sx(107)} ${sy(177)} Q${sx(107)} ${sy(185)} ${sx(99)} ${sy(185)}" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="3" fill="none"/>
  <path d="M${sx(107)} ${sy(171)} Q${sx(107)} ${sy(185)} ${sx(93)} ${sy(185)}" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="2" fill="none"/>
  <circle cx="${sx(40)}" cy="${sy(32)}" r="${sr(5)}" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="2.5" fill="none"/>
  <circle cx="${sx(42.5)}" cy="${sy(30.5)}" r="${sr(4)}" fill="#0A1020"/>
  <circle cx="${sx(60)}" cy="${sy(32)}" r="${sr(5)}" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="2.5" fill="#C8A96E" fill-opacity="0.15"/>
  <circle cx="${sx(80)}" cy="${sy(32)}" r="${sr(5)}" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="2.5" fill="none"/>
  <circle cx="${sx(77.5)}" cy="${sy(30.5)}" r="${sr(4)}" fill="#0A1020"/>
  <line x1="${sx(60)}" y1="${sy(40)}" x2="${sx(60)}" y2="${sy(68)}" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="2"/>
  <path d="M${sx(60)} ${sy(50)} L${sx(62)} ${sy(53)} L${sx(60)} ${sy(56)} L${sx(58)} ${sy(53)}Z" fill="#C8A96E" fill-opacity="0.35"/>
  <circle cx="${sx(60)}" cy="${sy(99)}" r="${sr(29)}" stroke="#C8A96E" stroke-opacity="0.25" stroke-width="2" fill="none"/>
  <path d="M${sx(60)} ${sy(73)} L${sx(86)} ${sy(99)} L${sx(60)} ${sy(125)} L${sx(34)} ${sy(99)}Z" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="2.5" fill="none"/>
  <circle cx="${sx(60)}" cy="${sy(99)}" r="${sr(18)}" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="2" fill="none"/>
  <circle cx="${sx(60)}" cy="${sy(70)}" r="${sr(1.5)}" fill="#C8A96E" fill-opacity="0.55"/>
  <circle cx="${sx(89)}" cy="${sy(99)}" r="${sr(1.5)}" fill="#C8A96E" fill-opacity="0.55"/>
  <circle cx="${sx(60)}" cy="${sy(128)}" r="${sr(1.5)}" fill="#C8A96E" fill-opacity="0.55"/>
  <circle cx="${sx(31)}" cy="${sy(99)}" r="${sr(1.5)}" fill="#C8A96E" fill-opacity="0.55"/>
  <path d="M${sx(40)} ${sy(99)} C${sx(48)} ${sy(85)} ${sx(54)} ${sy(81)} ${sx(60)} ${sy(81)} C${sx(66)} ${sy(81)} ${sx(72)} ${sy(85)} ${sx(80)} ${sy(99)} C${sx(72)} ${sy(113)} ${sx(66)} ${sy(117)} ${sx(60)} ${sy(117)} C${sx(54)} ${sy(117)} ${sx(48)} ${sy(113)} ${sx(40)} ${sy(99)}Z" stroke="#C8A96E" stroke-opacity="0.7" stroke-width="3" fill="none"/>
  <circle cx="${sx(60)}" cy="${sy(99)}" r="${sr(8)}" stroke="#C8A96E" stroke-opacity="0.6" stroke-width="2.5" fill="none"/>
  <circle cx="${sx(60)}" cy="${sy(99)}" r="${sr(3.5)}" fill="#C8A96E" fill-opacity="0.7"/>
  <line x1="${sx(60)}" y1="${sy(130)}" x2="${sx(60)}" y2="${sy(158)}" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="2"/>
  <path d="M${sx(60)} ${sy(144)} L${sx(62)} ${sy(147)} L${sx(60)} ${sy(150)} L${sx(58)} ${sy(147)}Z" fill="#C8A96E" fill-opacity="0.35"/>
  <circle cx="${sx(40)}" cy="${sy(166)}" r="${sr(5)}" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="2.5" fill="none"/>
  <circle cx="${sx(37.5)}" cy="${sy(167.5)}" r="${sr(4)}" fill="#0A1020"/>
  <circle cx="${sx(60)}" cy="${sy(166)}" r="${sr(5)}" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="2.5" fill="#C8A96E" fill-opacity="0.15"/>
  <circle cx="${sx(80)}" cy="${sy(166)}" r="${sr(5)}" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="2.5" fill="none"/>
  <circle cx="${sx(82.5)}" cy="${sy(167.5)}" r="${sr(4)}" fill="#0A1020"/>
  <circle cx="${sx(21)}" cy="${sy(58)}" r="${sr(1.2)}" fill="#C8A96E" fill-opacity="0.3"/>
  <circle cx="${sx(21)}" cy="${sy(99)}" r="${sr(1.2)}" fill="#C8A96E" fill-opacity="0.3"/>
  <circle cx="${sx(21)}" cy="${sy(140)}" r="${sr(1.2)}" fill="#C8A96E" fill-opacity="0.3"/>
  <circle cx="${sx(99)}" cy="${sy(58)}" r="${sr(1.2)}" fill="#C8A96E" fill-opacity="0.3"/>
  <circle cx="${sx(99)}" cy="${sy(99)}" r="${sr(1.2)}" fill="#C8A96E" fill-opacity="0.3"/>
  <circle cx="${sx(99)}" cy="${sy(140)}" r="${sr(1.2)}" fill="#C8A96E" fill-opacity="0.3"/>
  <rect x="${CX}" y="${CY}" width="500" height="825" rx="16" ry="16" fill="none" stroke="rgba(200,169,110,0.3)" stroke-width="2"/>
  <text x="540" y="1480" font-family="sans-serif" font-size="28" fill="rgba(200,169,110,0.5)" text-anchor="middle">넘겨서 확인해보세요</text>
  <text x="540" y="1750" font-family="sans-serif" font-size="18" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  </svg>`
  slides.push(await sharp(Buffer.from(s1)).png().toBuffer())

  // ── 2: 카드 공개 ──
  const cW2 = 740, cH2 = 1110
  const cardImg = await loadCard(card.slug, cW2, cH2)
  const masked = cardImg ? await roundImg(cardImg, cW2, cH2, 18) : null

  const s2 = bg(`
  <text x="540" y="100" font-family="sans-serif" font-size="20" fill="rgba(200,169,110,0.5)" text-anchor="middle" letter-spacing="6">상대방 속마음</text>

  <text x="540" y="1380" font-family="sans-serif" font-size="56" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(card.name)}</text>
  <text x="540" y="1425" font-family="Georgia, serif" font-size="20" font-style="italic" fill="rgba(200,169,110,0.4)" text-anchor="middle">${esc(card.nameEn)}</text>
  <text x="540" y="1480" font-family="sans-serif" font-size="18" fill="rgba(167,183,214,0.4)" text-anchor="middle">${card.keywords.map(k => esc(k)).join('  ·  ')}</text>

  <text x="540" y="1750" font-family="sans-serif" font-size="18" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  const s2base = await sharp(Buffer.from(s2)).png().toBuffer()
  if (masked) {
    slides.push(await sharp(s2base)
      .composite([{ input: masked, left: Math.round((W - cW2) / 2), top: 150 }])
      .png().toBuffer())
  } else {
    slides.push(s2base)
  }

  // ── 3: 해석 + CTA ──
  const lines = hook.split('\n')
  const hookSvg = lines.map((l, i) =>
    `<text x="540" y="${800 + i * 55}" font-family="sans-serif" font-size="40" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const hookStartY = 680
  const hookSvg3 = lines.map((l, i) =>
    `<text x="540" y="${hookStartY + i * 55}" font-family="sans-serif" font-size="40" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const s3 = bg(`
  <text x="540" y="420" font-family="sans-serif" font-size="20" fill="rgba(77,163,255,0.45)" text-anchor="middle" letter-spacing="5">상대방 속마음</text>
  <text x="540" y="510" font-family="sans-serif" font-size="64" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(card.name)}</text>
  <text x="540" y="555" font-family="Georgia, serif" font-size="20" font-style="italic" fill="rgba(126,138,168,0.4)" text-anchor="middle">${esc(card.nameEn)}</text>
  <line x1="400" y1="600" x2="680" y2="600" stroke="rgba(77,163,255,0.2)" stroke-width="1"/>

  ${hookSvg3}

  <text x="540" y="${hookStartY + lines.length * 55 + 35}" font-family="sans-serif" font-size="18" fill="rgba(167,183,214,0.35)" text-anchor="middle">${card.keywords.map(k => esc(k)).join('  ·  ')}</text>

  <line x1="350" y1="1150" x2="730" y2="1150" stroke="rgba(77,163,255,0.1)" stroke-width="1"/>
  <text x="540" y="1220" font-family="sans-serif" font-size="30" fill="rgba(143,211,255,0.6)" text-anchor="middle">당신도 직접 뽑아보세요</text>
  <text x="540" y="1265" font-family="sans-serif" font-size="22" fill="rgba(167,183,214,0.4)" text-anchor="middle">무료 타로 리딩 · lovtaro.kr</text>

  <text x="540" y="1380" font-family="sans-serif" font-size="24" fill="rgba(143,211,255,0.45)" text-anchor="middle">지금 연애 고민이 있다면</text>
  <text x="540" y="1420" font-family="sans-serif" font-size="24" fill="rgba(143,211,255,0.45)" text-anchor="middle">댓글 남겨주세요</text>
  <text x="540" y="1460" font-family="sans-serif" font-size="24" fill="rgba(143,211,255,0.45)" text-anchor="middle">카드 한 장 뽑아서 답해드릴게요</text>

  <text x="540" y="1750" font-family="sans-serif" font-size="18" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  slides.push(await sharp(Buffer.from(s3)).png().toBuffer())

  return slides
}

// ── 메인 ──
async function main() {
  ensureDir(outputDir)

  for (const day of SCHEDULE) {
    const dayDir = resolve(outputDir, day.date.replace(/[() ]/g, '_'))
    ensureDir(dayDir)

    // 스토리
    console.log(`${day.date}: 스토리 (${day.story.name})`)
    const storyDir = resolve(dayDir, 'story')
    ensureDir(storyDir)
    const storyImg = await generateStory(day.story, STORY_HOOKS[day.story.id])
    if (storyImg) writeFileSync(resolve(storyDir, 'story.png'), storyImg)

    // 스토리 캡션
    const storyCaptions = {
      lovers: `오늘의 연애 타로 The Lovers

두 사람 사이에서 고민 중인가요?
지금 끌리는 쪽이 당신의 답이에요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      strength: `오늘의 연애 타로 Strength

밀어붙인다고 되는 게 아니에요
지금은 기다릴 줄 아는 힘이 당신을 지켜줄 거예요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      sun: `오늘의 연애 타로 The Sun

지금 느끼는 그 설렘, 진짜입니다
의심하지 마세요 당신이 맞아요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      wheel: `오늘의 연애 타로 Wheel of Fortune

요즘 연락이 뜸한 그 사람
흐름이 바뀌고 있어요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      magician: `오늘의 연애 타로 The Magician

고백할까 말까 고민 중이라면
오늘은 말의 힘이 있는 날이에요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      priestess: `오늘의 연애 타로 The High Priestess

말하지 않아도 느껴지는 감정이 있잖아요
그거 맞아요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
    }
    writeFileSync(resolve(storyDir, 'caption.txt'), storyCaptions[day.story.id])

    // 릴스
    console.log(`${day.date}: 릴스 (${day.reel.name})`)
    const reelDir = resolve(dayDir, 'reel')
    ensureDir(reelDir)
    const reelSlides = await generateReel(day.reel, REEL_HOOKS[day.reel.id])
    reelSlides.forEach((s, i) => writeFileSync(resolve(reelDir, `reel${i + 1}.png`), s))

    // 릴스 캡션
    const reelCaptions = {
      hermit: `갑자기 연락이 뜸해진 그 사람

상대는 지금 혼자 감정을 정리하고 있어요
당신을 잊으려는 게 아니에요

지금 연애 고민이 있다면
댓글에 남겨주세요
카드 한 장 뽑아서 답해드릴게요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      emperor: `그 사람이 나를 어떻게 생각하는지
알고 싶었던 적 있나요

상대는 당신과의 관계를 진지하게 생각하고 있어요
가볍게 보지 않아요

지금 연애 고민이 있다면
댓글에 남겨주세요
카드 한 장 뽑아서 답해드릴게요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      chariot: `읽씹당하고 불안한 밤

상대는 당신을 향해 다가오고 싶어해요
아직 타이밍을 재고 있을 뿐이에요

지금 연애 고민이 있다면
댓글에 남겨주세요
카드 한 장 뽑아서 답해드릴게요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      death: `그 사람과 끝난 걸까
아직 가능성이 있는 걸까

상대의 마음에서 무언가가 끝나고 있어요
그리고 새로운 감정이 시작되고 있어요

지금 연애 고민이 있다면
댓글에 남겨주세요
카드 한 장 뽑아서 답해드릴게요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      devil: `자꾸 그 사람 생각이 나는데
이게 좋아하는 건지 집착인지 모르겠을 때

상대도 당신에게 강하게 끌리고 있어요
하지만 그 감정이 복잡해요

지금 연애 고민이 있다면
댓글에 남겨주세요
카드 한 장 뽑아서 답해드릴게요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
      tower: `갑자기 연락이 끊긴 그 사람

상대의 마음에 큰 변화가 오고 있어요
당신 때문일 수 있어요

지금 연애 고민이 있다면
댓글에 남겨주세요
카드 한 장 뽑아서 답해드릴게요

무료로 직접 뽑아보기
링크는 프로필에서 확인하세요

${HASHTAGS}`,
    }
    writeFileSync(resolve(reelDir, 'caption.txt'), reelCaptions[day.reel.id])
  }

  console.log(`
완료! ${outputDir} 확인하세요

[폴더 구조]
4월_9일_수_/
  story/ → story.png + caption.txt
  reel/  → reel1.png, reel2.png, reel3.png + caption.txt
...

[스토리 올리는 법]
1. story.png를 인스타 스토리에 업로드
2. 링크 스티커 추가 → lovtaro.kr
3. 피드 게시물 올라가는 시간(10:00am) 직전에 올리기

[릴스 만드는 법]
1. 인스타 앱 → 릴스 → 갤러리에서 이미지 선택
2. reel1.png (3초) → reel2.png (3초) → reel3.png (5초) 순서
3. 음악 추가 (신비로운 BGM 추천)
4. caption.txt 복붙
5. 피드 게시물 2-3시간 후에 올리기 (오후 1-2시)

[시간표]
오전 9:30  → 스토리 올리기
오전 10:00 → 피드 자동 게시 (예약)
오후 1-2시 → 릴스 올리기
저녁 8-9시 → 투표 스토리 직접 올리기 (인스타 앱)
`)
}

main().catch(console.error)
