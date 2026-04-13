/**
 * LOVTARO 인스타그램 3주차 콘텐츠 생성 (4/20~4/26)
 * 실행: node scripts/generate-week3.mjs
 *
 * 생성물: 캐러셀(월/수/금) + 릴스(화/목/토) + 스토리(매일) + 텍스트 전부
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output')

// ── 유틸 ──
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function ensureDir(d) { if (!existsSync(d)) mkdirSync(d, { recursive: true }) }

async function loadCard(slug, w, h) {
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) return null
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

// ── 해시태그 ──
const HASHTAGS = `#연애타로리딩 #오늘의타로카드 #썸타로 #무료타로점 #일일연애운세
#타로운세 #연애고민상담 #오늘의운세
#타로 #연애`

// ══════════════════════════════════════
// 데이터
// ══════════════════════════════════════
const WEEK3 = [
  {
    date: '4월 20일 (월)', folder: '4월_20일__월_',
    type: 'carousel',
    theme: '이번 주 연애운',
    cards: [
      { slug: 'high-priestess', name: '여사제', nameEn: 'The High Priestess', day: '월', line: '직관을 믿는 날\n느낌이 오면 그걸 따라가세요' },
      { slug: 'lovers', name: '연인', nameEn: 'The Lovers', day: '화', line: '선택의 순간이 오는 날\n마음이 이끄는 쪽으로 가세요' },
      { slug: 'hermit', name: '은둔자', nameEn: 'The Hermit', day: '수', line: '내 감정을 들여다보는 날\n혼자만의 시간이 답이 돼요' },
      { slug: 'hierophant', name: '교황', nameEn: 'The Hierophant', day: '목', line: '진솔한 대화가 열리는 날\n솔직함이 관계를 깊게 해요' },
      { slug: 'tower', name: '탑', nameEn: 'The Tower', day: '금', line: '변화의 흐름이 오는 날\n흔들려도 괜찮아요, 정리되는 중이에요' },
      { slug: 'moon', name: '달', nameEn: 'The Moon', day: '토', line: '감정이 깊어지는 날\n불안해도 그 감정이 진짜예요' },
      { slug: 'world', name: '세계', nameEn: 'The World', day: '일', line: '한 주를 마무리하는 날\n이번 주 잘 버텼어요' },
    ],
    storyCard: { slug: 'high-priestess', name: '여사제', nameEn: 'The High Priestess', keywords: ['직관', '지혜', '내면'] },
    storyHook: '이번 주 연애운\n요일별로 뽑아봤어요\n오늘 피드에서 확인하세요',
  },
  {
    date: '4월 21일 (화)', folder: '4월_21일__화_',
    type: 'reel',
    reelCard: { slug: 'lovers', name: '연인', nameEn: 'The Lovers', keywords: ['사랑', '선택', '조화'] },
    reelScenes: {
      hook: '그 사람과 나,\n이게 맞는 걸까요',
      hookSub: '아니면 그냥\n익숙해진 걸까요',
      reveal: '상대방 속마음',
      interpret: '연인 카드가 나왔어요\n상대는 당신에게\n진지한 감정을 느끼고 있어요\n선택의 기로에 서 있는 것뿐이에요',
      cta: '비슷한 고민?\n댓글 남겨주세요',
    },
    storyCard: { slug: 'lovers', name: '연인', nameEn: 'The Lovers', keywords: ['사랑', '선택', '조화'] },
    storyHook: '오늘은 마음의 소리에\n귀를 기울여보세요\n진짜 감정이 보일 거예요',
  },
  {
    date: '4월 22일 (수)', folder: '4월_22일__수_',
    type: 'carousel-edu',
    theme: '연인 카드가 연애에서 나왔을 때 진짜 의미',
    eduCard: { slug: 'lovers', name: '연인', nameEn: 'The Lovers' },
    slides: [
      { title: '연인 카드 = 선택의 순간', body: '사랑에 빠졌다는 게 아니에요\n선택의 기로에 서 있다는 신호예요\n키워드: 선택 / 연결 / 조화' },
      { title: '짝사랑일 때 연인 카드', body: '상대도 당신에게 감정이 있어요\n하지만 지금은 확신을 못 하는 중\n\n선택을 강요하지 않는 게 현명해요\n자연스럽게 연결되는 걸 기다려요' },
      { title: '커플일 때 연인 카드', body: '관계가 새로운 단계로 갈 수 있어요\n솔직한 대화가 필요한 시기예요\n\n표현이 관계를 더 깊게 만들어줘요\n오늘 한 번 솔직해져보세요' },
      { title: '주의할 점', body: '선택을 두려워하면\n오히려 관계가 멈춰요\n\n연인 카드가 나왔다면\n지금이 용기 낼 타이밍이에요' },
    ],
    storyCard: { slug: 'hermit', name: '은둔자', nameEn: 'The Hermit', keywords: ['성찰', '내면', '기다림'] },
    storyHook: '연인 카드, 나쁜 게 아니에요\n오늘 피드에서\n진짜 의미 확인해보세요',
  },
  {
    date: '4월 23일 (목)', folder: '4월_23일__목_',
    type: 'reel',
    reelCard: { slug: 'hermit', name: '은둔자', nameEn: 'The Hermit', keywords: ['성찰', '내면', '기다림'] },
    reelScenes: {
      hook: '연락도 없고\n만남도 없는 요즘',
      hookSub: '멀어지는 건지\n정리되는 건지',
      reveal: '상대방 속마음',
      interpret: '은둔자 카드가 말해줘요\n상대는 지금 자기 자신을\n정리하는 중이에요\n당신을 멀리하는 게 아니에요',
      cta: '비슷한 상황이라면\n댓글로 얘기해요',
    },
    storyCard: { slug: 'hermit', name: '은둔자', nameEn: 'The Hermit', keywords: ['성찰', '내면', '기다림'] },
    storyHook: '연락이 뜸해진 게\n멀어지는 게 아닐 수 있어요\n상대의 시간을 믿어보세요',
  },
  {
    date: '4월 24일 (금)', folder: '4월_24일__금_',
    type: 'carousel-test',
    theme: '연락 스타일로 알아보는 나의 타로 유형',
    testItems: [
      { type: 'A', label: '이유 없이 바로 연락', slug: 'fool', cardName: '바보', desc: '용감한 당신\n거절이 두렵지 않은 순수파' },
      { type: 'B', label: '핑계 만들어서 연락', slug: 'magician', cardName: '마법사', desc: '전략적인 당신\n준비된 만큼 확률도 높아져요' },
      { type: 'C', label: '상대가 먼저 하길 기다림', slug: 'hermit', cardName: '은둔자', desc: '기다리는 당신\n근데... 언제까지 기다릴 거예요?' },
      { type: 'D', label: '공통 화제 찾아서 연락', slug: 'empress', cardName: '여황제', desc: '공감하는 당신\n상대가 편안함을 느끼는 타입' },
    ],
    storyCard: { slug: 'moon', name: '달', nameEn: 'The Moon', keywords: ['감정', '직관', '내면'] },
    storyHook: '나는 어떤 연락 스타일?\n오늘 피드에서 타로 유형\n테스트해보세요',
  },
  {
    date: '4월 25일 (토)', folder: '4월_25일__토_',
    type: 'reel',
    reelCard: { slug: 'tower', name: '탑', nameEn: 'The Tower', keywords: ['변화', '충격', '해방'] },
    reelScenes: {
      hook: '이번 주 가장 많이 온 질문',
      hookSub: '갑자기 태도가 바뀌었어요\n무슨 일인 걸까요?',
      reveal: '상대방 속마음',
      interpret: '탑 카드가 나왔어요\n상대 내면에서\n무언가 무너지고 있어요\n나쁜 게 아니에요, 정리되는 중이에요\n\n변화가 두려워도\n새로운 흐름이 오고 있어요',
      cta: '비슷한 고민 있으면\n댓글 남겨주세요',
    },
    storyCard: { slug: 'tower', name: '탑', nameEn: 'The Tower', keywords: ['변화', '충격', '해방'] },
    storyHook: '갑자기 달라진 그 사람\n탑 카드가 말해줘요\n변화가 오고 있는 거예요',
  },
  {
    date: '4월 26일 (일)', folder: '4월_26일__일_',
    type: 'single',
    feedCard: { slug: 'moon', name: '달', nameEn: 'The Moon', keywords: ['감정', '직관', '내면'] },
    storyCard: { slug: 'moon', name: '달', nameEn: 'The Moon', keywords: ['감정', '직관', '내면'] },
    storyHook: '지금 느끼는 감정이\n헷갈려도 괜찮아요\n달 카드가 말해줘요, 그게 진짜예요',
  },
]

// ══════════════════════════════════════
// 스토리 생성 (1080x1920)
// ══════════════════════════════════════
async function generateStory(card, hook) {
  const W = 1080, H = 1920
  const cW = 820, cH = 1060
  const img = await loadCard(card.slug, cW, cH)
  if (!img) return null
  const masked = await roundImg(img, cW, cH, 20)

  const cardBottom = 140 + cH // 1200
  const nameEnY = cardBottom + 60  // 1260
  const lines = hook.split('\n')
  const hookY = nameEnY + 55 // 1315
  const hookSvg = lines.map((l, i) =>
    `<text x="540" y="${hookY + i * 55}" font-family="sans-serif" font-size="38" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')
  const kwY = hookY + lines.length * 55 + 30

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
  <text x="540" y="${nameEnY}" font-family="Georgia, serif" font-size="22" font-style="italic" fill="rgba(200,180,140,0.65)" text-anchor="middle">${esc(card.nameEn)}</text>
  ${hookSvg}
  <text x="540" y="${kwY}" font-family="sans-serif" font-size="18" fill="rgba(167,183,214,0.35)" text-anchor="middle">${card.keywords.map(k => esc(k)).join('  ·  ')}</text>
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
// 캐러셀 슬라이드 생성 (1080x1350, 4:5)
// ══════════════════════════════════════
const C_H = 1350
function carouselBg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${C_H}">
  <defs>
    <linearGradient id="cbg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#03050A"/>
      <stop offset="50%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#03050A"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="${C_H}" fill="url(#cbg)"/>
  ${content}
</svg>`
}

async function carouselCover(title, subtitle, tagline, cardSlugs) {
  const slugs = cardSlugs || []
  const count = slugs.length
  const cW = count <= 4 ? 200 : 160
  const cH = count <= 4 ? 300 : 240
  const spacing = count <= 4 ? 120 : 90

  const cards = []
  for (const slug of slugs) {
    const img = await loadCard(slug, cW, cH)
    if (img) {
      const masked = await roundImg(img, cW, cH, 8)
      cards.push(masked)
    }
  }

  const positions = []
  for (let i = 0; i < cards.length; i++) {
    const center = (cards.length - 1) / 2
    const offset = i - center
    positions.push({
      left: 540 + offset * spacing - cW / 2,
      top: 530 + Math.abs(offset) * 25,
      rotate: offset * 7,
    })
  }

  const svg = carouselBg(`
  <text x="540" y="100" font-family="sans-serif" font-size="18" fill="rgba(77,163,255,0.5)" text-anchor="middle" letter-spacing="6">LOVTARO</text>
  <text x="540" y="205" font-family="sans-serif" font-size="44" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(title)}</text>
  <line x1="380" y1="238" x2="700" y2="238" stroke="rgba(77,163,255,0.15)" stroke-width="1"/>
  <text x="540" y="274" font-family="sans-serif" font-size="24" fill="rgba(167,183,214,0.55)" text-anchor="middle">${esc(subtitle)}</text>
  <text x="540" y="310" font-family="sans-serif" font-size="20" fill="rgba(143,211,255,0.35)" text-anchor="middle">${esc(tagline)}</text>
  <text x="540" y="1230" font-family="sans-serif" font-size="20" fill="rgba(143,211,255,0.4)" text-anchor="middle">스와이프해서 확인하세요 →</text>
  <text x="540" y="1300" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  let base = await sharp(Buffer.from(svg)).png().toBuffer()

  const composites = []
  for (let i = 0; i < cards.length; i++) {
    const pos = positions[i]
    const rotated = await sharp(cards[i])
      .rotate(pos.rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer()
    const meta = await sharp(rotated).metadata()
    const adjLeft = Math.round(pos.left - (meta.width - cW) / 2)
    const adjTop = Math.round(pos.top - (meta.height - cH) / 2)
    composites.push({ input: rotated, left: adjLeft, top: adjTop })
  }

  if (composites.length > 0) {
    base = await sharp(base).composite(composites).png().toBuffer()
  }
  return base
}

async function carouselDayCard(card) {
  const cW = 520, cH = 780
  const cardTop = 100
  const img = await loadCard(card.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 14) : null

  const cardBottom = cardTop + cH
  const nameY = cardBottom + 50
  const nameEnY = nameY + 32
  const divY = nameEnY + 20
  const line1Y = divY + 40
  const line2Y = line1Y + 36

  const lines = card.line.split('\n')
  const lineSvg = lines.map((l, i) => {
    const y = i === 0 ? line1Y : line2Y
    return `<text x="540" y="${y}" font-family="sans-serif" font-size="26" font-weight="300" fill="${i === 0 ? 'rgba(143,211,255,0.9)' : 'rgba(244,248,255,0.72)'}" text-anchor="middle">${esc(l)}</text>`
  }).join('\n  ')

  const svg = carouselBg(`
  <text x="540" y="60" font-family="sans-serif" font-size="22" fill="rgba(77,163,255,0.6)" text-anchor="middle" letter-spacing="4">${esc(card.day)}요일</text>
  <text x="540" y="${nameY}" font-family="sans-serif" font-size="38" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(card.name)}</text>
  <text x="540" y="${nameEnY}" font-family="Georgia, serif" font-size="15" font-style="italic" fill="rgba(126,138,168,0.38)" text-anchor="middle">${esc(card.nameEn)}</text>
  <line x1="420" y1="${divY}" x2="660" y2="${divY}" stroke="rgba(77,163,255,0.12)" stroke-width="1"/>
  ${lineSvg}
  <text x="540" y="1310" font-family="sans-serif" font-size="15" fill="rgba(143,211,255,0.22)" text-anchor="middle">@lovtarot_</text>
  `)
  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    return sharp(base).composite([{ input: masked, left: (1080 - cW) / 2, top: cardTop }]).png().toBuffer()
  }
  return base
}

async function carouselCTACombined(bgCardSlug, saveLines, shareLines) {
  const sLines = saveLines || ['저장해두고 매일 아침 확인하세요']
  const shLines = shareLines || ['이번 주 연애운이 궁금한 친구에게 공유해도 좋아요']

  const saveIcon = `<g transform="translate(396, 320)">
    <path d="M14 0 L82 0 Q96 0 96 14 L96 110 L48 82 L0 110 L0 14 Q0 0 14 0 Z" fill="none" stroke="rgba(143,211,255,0.55)" stroke-width="2.5"/>
  </g>`
  const shareIcon = `<g transform="translate(588, 320)">
    <path d="M65 0 L96 32 L65 64" fill="none" stroke="rgba(143,211,255,0.55)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M96 32 L15 32 L15 96" fill="none" stroke="rgba(143,211,255,0.55)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`

  let curY = 520
  const saveSvg = sLines.map((l, i) => {
    const s = `<text x="540" y="${curY}" font-family="sans-serif" font-size="${i === 0 ? 32 : 24}" font-weight="300" fill="${i === 0 ? '#F4F8FF' : 'rgba(244,248,255,0.65)'}" text-anchor="middle">${esc(l)}</text>`
    curY += 40
    return s
  }).join('\n  ')

  curY += 20
  const shareSvg = shLines.map((l, i) => {
    const s = `<text x="540" y="${curY}" font-family="sans-serif" font-size="${i === 0 ? 26 : 22}" font-weight="300" fill="${i === 0 ? 'rgba(167,183,214,0.82)' : 'rgba(167,183,214,0.55)'}" text-anchor="middle">${esc(l)}</text>`
    curY += 36
    return s
  }).join('\n  ')

  const divY = curY + 22
  const urlY = divY + 46

  const svg = carouselBg(`
  ${saveIcon}
  ${shareIcon}
  ${saveSvg}
  ${shareSvg}
  <line x1="380" y1="${divY}" x2="700" y2="${divY}" stroke="rgba(77,163,255,0.12)" stroke-width="1"/>
  <text x="540" y="${urlY}" font-family="sans-serif" font-size="22" fill="rgba(143,211,255,0.5)" text-anchor="middle">무료로 직접 뽑아보기 · lovtaro.kr</text>
  <text x="540" y="1310" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  let base = await sharp(Buffer.from(svg)).png().toBuffer()

  if (bgCardSlug) {
    const bgW = 420, bgH = 630
    const bgImg = await loadCard(bgCardSlug, bgW, bgH)
    if (bgImg) {
      const bgMasked = await roundImg(bgImg, bgW, bgH, 14)
      const faded = await sharp(bgMasked)
        .ensureAlpha()
        .composite([{
          input: Buffer.from(`<svg width="${bgW}" height="${bgH}"><rect width="${bgW}" height="${bgH}" fill="white" opacity="0.2"/></svg>`),
          blend: 'dest-in'
        }])
        .png().toBuffer()
      base = await sharp(base)
        .composite([{ input: faded, left: (1080 - bgW) / 2, top: 550 }])
        .png().toBuffer()
    }
  }
  return base
}

async function carouselEduSlide(title, body, index) {
  const lines = body.split('\n')
  const titleSize = 42
  const bodySize = 26
  const lineGap = 42
  const blankGap = 24
  const titleBodyGap = 35

  let bodyTotalH = 0
  for (const l of lines) {
    bodyTotalH += l === '' ? blankGap : lineGap
  }
  const totalH = titleSize + titleBodyGap + bodyTotalH
  const startY = Math.round((C_H - totalH) / 2)

  const titleY = startY + titleSize
  let curY = titleY + titleBodyGap + bodySize
  const bodySvg = lines.map(l => {
    if (l === '') { curY += blankGap; return '' }
    const s = `<text x="540" y="${curY}" font-family="sans-serif" font-size="${bodySize}" font-weight="300" fill="rgba(244,248,255,0.75)" text-anchor="middle">${esc(l)}</text>`
    curY += lineGap
    return s
  }).filter(s => s).join('\n  ')

  const svg = carouselBg(`
  <text x="540" y="60" font-family="sans-serif" font-size="16" fill="rgba(77,163,255,0.4)" text-anchor="middle" letter-spacing="3">${index}</text>
  <line x1="390" y1="${titleY - titleSize - 15}" x2="690" y2="${titleY - titleSize - 15}" stroke="rgba(77,163,255,0.15)" stroke-width="1"/>
  <text x="540" y="${titleY}" font-family="sans-serif" font-size="${titleSize}" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(title)}</text>
  <line x1="390" y1="${titleY + 15}" x2="690" y2="${titleY + 15}" stroke="rgba(77,163,255,0.15)" stroke-width="1"/>
  ${bodySvg}
  <text x="540" y="1310" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function carouselEduCover(card, title, subtitle) {
  const cW = 460, cH = 690
  const img = await loadCard(card.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 14) : null

  const svg = carouselBg(`
  <text x="540" y="80" font-family="sans-serif" font-size="18" fill="rgba(77,163,255,0.5)" text-anchor="middle" letter-spacing="6">카드 해설</text>
  <text x="540" y="1050" font-family="sans-serif" font-size="44" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(title)}</text>
  <text x="540" y="1100" font-family="sans-serif" font-size="24" fill="rgba(167,183,214,0.5)" text-anchor="middle">${esc(subtitle)}</text>
  <text x="540" y="1310" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    return sharp(base).composite([{ input: masked, left: (1080 - cW) / 2, top: 130 }]).png().toBuffer()
  }
  return base
}

async function carouselTestSlide(item) {
  const cW = 380, cH = 570
  const img = await loadCard(item.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 12) : null

  const lines = item.desc.split('\n')
  const descSvg = lines.map((l, i) =>
    `<text x="540" y="${920 + i * 36}" font-family="sans-serif" font-size="26" font-weight="300" fill="rgba(244,248,255,0.85)" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const svg = carouselBg(`
  <text x="540" y="100" font-family="sans-serif" font-size="48" font-weight="200" fill="rgba(77,163,255,0.7)" text-anchor="middle">${esc(item.type)}</text>
  <text x="540" y="155" font-family="sans-serif" font-size="26" fill="rgba(244,248,255,0.7)" text-anchor="middle">${esc(item.label)}</text>
  <text x="540" y="830" font-family="sans-serif" font-size="30" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(item.cardName)}</text>
  ${descSvg}
  <text x="540" y="1310" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    return sharp(base).composite([{ input: masked, left: (1080 - cW) / 2, top: 200 }]).png().toBuffer()
  }
  return base
}

// ══════════════════════════════════════
// 릴스 장면 생성 (1080x1920) - 코스믹 스타일
// ══════════════════════════════════════
function cosmicStarsSvg() {
  const stars = [
    [45,80,1,0.6],[120,45,0.8,0.4],[210,130,1.2,0.7],[320,60,0.6,0.3],[450,95,1,0.5],
    [570,30,0.8,0.6],[680,110,1.4,0.8],[780,55,0.6,0.4],[890,85,1,0.5],[990,140,0.8,0.3],
    [60,185,1.2,0.5],[170,200,0.6,0.3],[280,170,1,0.7],[400,220,0.8,0.4],[520,155,1.2,0.6],
    [640,195,0.6,0.3],[760,165,1,0.5],[860,210,0.8,0.6],[960,180,1.4,0.7],[30,280,0.8,0.4],
    [100,420,1,0.5],[230,380,0.6,0.3],[350,440,1.2,0.6],[480,395,0.8,0.4],[610,455,1,0.5],
    [730,410,0.6,0.3],[850,470,1.4,0.7],[970,430,0.8,0.4],[155,520,1,0.6],[295,555,0.6,0.3],
    [420,490,1.2,0.5],[545,540,0.8,0.4],[665,505,1,0.6],[800,560,0.6,0.3],[920,520,1,0.5],
    [70,820,1.2,0.6],[200,860,0.6,0.3],[330,800,1,0.5],[460,845,0.8,0.4],[590,810,1.4,0.7],
    [720,870,0.6,0.3],[840,825,1,0.5],[955,865,0.8,0.6],[130,950,1,0.4],[265,920,0.6,0.3],
    [395,975,1.2,0.5],[530,935,0.8,0.4],[660,960,1,0.6],[790,940,0.6,0.3],[910,985,1.2,0.5],
    [55,1250,1,0.5],[185,1280,0.8,0.4],[310,1220,1.2,0.6],[445,1265,0.6,0.3],[575,1230,1,0.5],
    [700,1270,0.8,0.4],[825,1245,1.4,0.7],[950,1285,0.6,0.3],[115,1400,1,0.5],[250,1430,0.8,0.4],
    [380,1390,1.2,0.6],[510,1420,0.6,0.3],[640,1405,1,0.5],[770,1435,0.8,0.6],[900,1400,1,0.4],
    [40,1600,0.8,0.4],[170,1570,1.2,0.6],[300,1610,0.6,0.3],[430,1580,1,0.5],[560,1620,0.8,0.4],
    [690,1590,1.4,0.7],[820,1615,0.6,0.3],[940,1580,1,0.5],[90,1760,1,0.4],[220,1790,0.8,0.4],
    [355,1745,1.2,0.5],[490,1780,0.6,0.3],[625,1760,1,0.6],[755,1795,0.8,0.4],[885,1765,1.4,0.7],
    [1020,1790,0.6,0.3],
    [180,350,2.2,0.9],[860,280,1.8,0.85],[540,650,2.4,0.9],[120,1100,2,0.8],
    [940,1050,1.8,0.85],[380,1500,2,0.9],[720,1700,1.8,0.8],[65,560,2,0.85],
    [1005,740,2.2,0.8],[320,1250,1.8,0.9],
  ]
  return stars.map(([x,y,r,o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${o}"/>`).join('\n  ')
}

function reelCosmicBg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
  <defs>
    <linearGradient id="rcBase" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050309"/>
      <stop offset="35%" stop-color="#09071a"/>
      <stop offset="65%" stop-color="#070515"/>
      <stop offset="100%" stop-color="#040208"/>
    </linearGradient>
    <radialGradient id="rcNeb1" gradientUnits="userSpaceOnUse" cx="280" cy="380" r="460">
      <stop offset="0%" stop-color="#1e0a3e" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#050309" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rcNeb2" gradientUnits="userSpaceOnUse" cx="820" cy="900" r="400">
      <stop offset="0%" stop-color="#0d0a28" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#050309" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rcNeb3" gradientUnits="userSpaceOnUse" cx="540" cy="1600" r="380">
      <stop offset="0%" stop-color="#0a0f2a" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#050309" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#rcBase)"/>
  <rect width="1080" height="1920" fill="url(#rcNeb1)"/>
  <rect width="1080" height="1920" fill="url(#rcNeb2)"/>
  <rect width="1080" height="1920" fill="url(#rcNeb3)"/>
  ${cosmicStarsSvg()}
  ${content}
</svg>`
}

function reelGoldFrameSvg(w, h) {
  const ins = 10, r = 16, cl = 50
  const x1 = ins, y1 = ins, x2 = w - ins, y2 = h - ins
  const mx = Math.round(w / 2)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect x="${x1}" y="${y1}" width="${x2-x1}" height="${y2-y1}" rx="${r}" ry="${r}"
    fill="none" stroke="rgba(210,165,60,0.72)" stroke-width="2.5"/>
  <rect x="${x1+9}" y="${y1+9}" width="${x2-x1-18}" height="${y2-y1-18}" rx="${r-3}" ry="${r-3}"
    fill="none" stroke="rgba(210,165,60,0.22)" stroke-width="1"/>
  <path d="M ${x1} ${y1+cl} L ${x1} ${y1} L ${x1+cl} ${y1}"
    fill="none" stroke="rgba(230,185,70,0.92)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M ${x2-cl} ${y1} L ${x2} ${y1} L ${x2} ${y1+cl}"
    fill="none" stroke="rgba(230,185,70,0.92)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M ${x1} ${y2-cl} L ${x1} ${y2} L ${x1+cl} ${y2}"
    fill="none" stroke="rgba(230,185,70,0.92)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M ${x2-cl} ${y2} L ${x2} ${y2} L ${x2} ${y2-cl}"
    fill="none" stroke="rgba(230,185,70,0.92)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M ${mx} ${y1-4} L ${mx+6} ${y1+3} L ${mx} ${y1+10} L ${mx-6} ${y1+3} Z"
    fill="rgba(230,185,70,0.72)"/>
  <path d="M ${mx} ${y2-10} L ${mx+6} ${y2-3} L ${mx} ${y2+4} L ${mx-6} ${y2-3} Z"
    fill="rgba(230,185,70,0.72)"/>
</svg>`
}

async function reelScene1(hook, hookSub) {
  const hLines = hook.split('\n')
  const sLines = hookSub.split('\n')
  const hSvg = hLines.map((l, i) =>
    `<text x="540" y="${820 + i * 75}" font-family="sans-serif" font-size="58" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')
  const sSvg = sLines.map((l, i) =>
    `<text x="540" y="${820 + hLines.length * 75 + 65 + i * 60}" font-family="sans-serif" font-size="44" font-weight="300" fill="rgba(167,183,214,0.65)" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')
  const svg = reelCosmicBg(`
  <line x1="440" y1="195" x2="640" y2="195" stroke="rgba(200,155,60,0.3)" stroke-width="1"/>
  <circle cx="540" cy="195" r="3" fill="rgba(200,155,60,0.5)"/>
  <text x="540" y="172" font-family="sans-serif" font-size="15" fill="rgba(200,155,60,0.35)" text-anchor="middle" letter-spacing="5">LOVTARO</text>
  ${hSvg}
  ${sSvg}
  <text x="540" y="1800" font-family="sans-serif" font-size="17" fill="rgba(143,211,255,0.2)" text-anchor="middle">@lovtarot_</text>
  `)
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function reelScene2(card) {
  const cW = 580, cH = 870
  const img = await loadCard(card.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 18) : null
  const svg = reelCosmicBg(`
  <text x="540" y="108" font-family="sans-serif" font-size="17" fill="rgba(210,165,60,0.55)" text-anchor="middle" letter-spacing="7">상대방 속마음</text>
  <line x1="430" y1="122" x2="650" y2="122" stroke="rgba(210,165,60,0.25)" stroke-width="1"/>
  <text x="540" y="1240" font-family="sans-serif" font-size="52" font-weight="200" fill="rgba(240,210,140,0.95)" text-anchor="middle">${esc(card.name)}</text>
  <text x="540" y="1288" font-family="Georgia, serif" font-size="19" font-style="italic" fill="rgba(210,165,60,0.5)" text-anchor="middle">${esc(card.nameEn)}</text>
  <line x1="420" y1="1312" x2="660" y2="1312" stroke="rgba(210,165,60,0.2)" stroke-width="1"/>
  <text x="540" y="1345" font-family="sans-serif" font-size="18" fill="rgba(200,165,100,0.4)" text-anchor="middle">${card.keywords.map(k => esc(k)).join('  ·  ')}</text>
  <text x="540" y="1800" font-family="sans-serif" font-size="16" fill="rgba(210,165,60,0.2)" text-anchor="middle">@lovtarot_</text>
  `)
  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    const cardLeft = Math.round((1080 - cW) / 2)
    const cardTop = 172
    base = await sharp(base).composite([{ input: masked, left: cardLeft, top: cardTop }]).png().toBuffer()
    const frameBuf = Buffer.from(reelGoldFrameSvg(cW, cH))
    base = await sharp(base).composite([{ input: frameBuf, left: cardLeft, top: cardTop }]).png().toBuffer()
  }
  return base
}

async function reelScene3(card, interpret, cta) {
  const iLines = interpret.split('\n').filter(l => l.length > 0)
  const ctaLines = cta ? cta.split('\n').filter(l => l.length > 0) : []
  const iStartY = 380, iGap = 52
  const iSvg = iLines.map((l, i) =>
    `<text x="540" y="${iStartY + i * iGap}" font-family="sans-serif" font-size="36" font-weight="300" fill="rgba(244,248,255,0.82)" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')
  const divY = iStartY + iLines.length * iGap + 40
  const ctaStartY = divY + 55
  const ctaSvg = ctaLines.map((l, i) =>
    `<text x="540" y="${ctaStartY + i * 44}" font-family="sans-serif" font-size="30" fill="rgba(200,155,60,0.65)" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')
  const footerY = ctaStartY + Math.max(1, ctaLines.length) * 44 + 45
  const svg = reelCosmicBg(`
  <text x="540" y="240" font-family="sans-serif" font-size="46" font-weight="200" fill="rgba(230,195,100,0.9)" text-anchor="middle">${esc(card.name)}</text>
  <line x1="410" y1="265" x2="670" y2="265" stroke="rgba(210,165,60,0.3)" stroke-width="1"/>
  ${iSvg}
  <line x1="380" y1="${divY}" x2="700" y2="${divY}" stroke="rgba(77,163,255,0.12)" stroke-width="1"/>
  ${ctaSvg}
  <text x="540" y="${footerY}" font-family="sans-serif" font-size="22" fill="rgba(143,211,255,0.45)" text-anchor="middle">당신도 직접 뽑아보세요</text>
  <text x="540" y="${footerY + 35}" font-family="sans-serif" font-size="17" fill="rgba(143,211,255,0.3)" text-anchor="middle">무료 타로 리딩 · lovtaro.kr</text>
  <text x="540" y="1800" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.2)" text-anchor="middle">@lovtarot_</text>
  `)
  return sharp(Buffer.from(svg)).png().toBuffer()
}

// ══════════════════════════════════════
// 단일 피드 이미지 (1080x1350, 4:5) - 일요일용
// ══════════════════════════════════════
async function generateFeedSingle(card, quote) {
  const cW = 600, cH = 900
  const img = await loadCard(card.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 16) : null

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
  <defs>
    <linearGradient id="fbg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#03050A"/><stop offset="50%" stop-color="#0A1020"/><stop offset="100%" stop-color="#03050A"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#fbg)"/>
  <text x="540" y="70" font-family="sans-serif" font-size="18" fill="rgba(77,163,255,0.5)" text-anchor="middle" letter-spacing="6">일요일 한줄 위로</text>
  <text x="540" y="1220" font-family="sans-serif" font-size="30" font-weight="300" fill="rgba(244,248,255,0.7)" text-anchor="middle">${esc(quote)}</text>
  <text x="540" y="1310" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
</svg>`
  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    return sharp(base).composite([{ input: masked, left: (1080 - cW) / 2, top: 120 }]).png().toBuffer()
  }
  return base
}

// ══════════════════════════════════════
// 텍스트 파일 생성
// ══════════════════════════════════════
const CAPTIONS = {
  '4월_20일__월_': {
    carousel: `이번 주(4/20~4/26) 연애운을 카드로 뽑아봤어요

매일 아침 해당 요일 카드를 확인하고
하루를 시작해보세요

저장해두면 매일 꺼내볼 수 있어요
궁금한 친구 태그해주세요

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    story: `[스토리 업로드 가이드 - 4월 20일 월]
카드: The High Priestess - 여사제

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 카운트다운 "이번 주 연애운 공개" (10:00 설정)
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 텍스트 추가: "10시에 피드에서 확인하세요"
4) 공유`,
    poll: `[투표 스토리 - 4월 20일 월]
유형: 투표

텍스트: 이번 주 연애운 확인했어?
선택지: 했어! | 아직...
하단: 피드에서 확인하세요

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_21일__화_': {
    reel: `그 사람이 나를 좋아하는 건지
그냥 편해서 대하는 건지
헷갈렸던 적 있잖아요

연인 카드가 말해줘요
상대는 지금 선택의 기로에 서 있어요
무관심이 아니라 확신을 쌓는 중이에요

비슷한 고민 있으면
댓글에 알려주세요
카드 한 장 뽑아서 답해드릴게요

직접 뽑아보기 - 프로필 링크

#연애타로리딩 #썸타로 #오늘의타로카드 #타로운세 #무료타로점`,
    capcut: `[CapCut 편집 가이드 - 4월 21일 화]
카드: 연인 (The Lovers)
총 길이: 12초

장면1 (0-3초): scene1.png
  - 줌인 효과 (100% → 110%)

장면2 (3-7초): scene2.png
  - 전환: 글리치 (0.5초)
  - 줌아웃

장면3 (7-12초): scene3.png
  - 전환: 디졸브 (0.5초)
  - 살짝 줌인

음악: 인스타에서 추가 (mysterious/ambient 검색, 25-30%)
커버: scene2.png 선택
내보내기: 1080p / 30fps`,
    story: `[스토리 업로드 가이드 - 4월 21일 화]
카드: The Lovers - 연인

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 이모지 슬라이더 → "지금 마음을 열고 싶은 사람이 있어요?" (하트)
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[질문박스 스토리 - 4월 21일 화]
유형: 질문 스티커

텍스트: 연애 고민 보내주세요
질문 스티커: "지금 가장 답답한 연애 상황은?"
하단: 카드 뽑아서 답해드릴게요

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_22일__수_': {
    carousel: `타로에서 "연인" 카드가 나오면
연애가 성공한다는 뜻인지 묻는 분들 많은데

그게 아니에요
연인 카드는 선택의 순간을 의미해요

연애에서 이 카드가 나왔다면
자세한 해석은 캐러셀에서 확인하세요

이 카드 나온 적 있으면 댓글로!

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    story: `[스토리 업로드 가이드 - 4월 22일 수]
카드: The Hermit - 은둔자

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 설문 스티커 → "연인 카드 = ?" → 사랑 성공 / 선택의 기로 / 관계 발전 / 잘 모르겠어
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[This or That 스토리 - 4월 22일 수]
유형: 투표 2개

투표1: 고백 타이밍? 분위기 무르익을 때 vs 좋으면 바로
투표2: 연애할 때 나는? 먼저 맞춰주는 편 vs 맞춰주길 기다리는 편
하단: 프로필 링크에서 직접 뽑아보세요

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_23일__목_': {
    reel: `연락이 뜸해지고
만남도 줄었어요

멀어지는 건지
정리하는 건지 모르겠어요

은둔자 카드가 말해줘요
상대는 지금 자기 자신을 들여다보는 중이에요
당신을 멀리하는 게 아니에요

비슷한 상황이라면
댓글로 얘기해요
카드 한 장 뽑아서 답해드릴게요

직접 뽑아보기 - 프로필 링크

#연애타로리딩 #연애고민상담 #오늘의타로카드 #타로운세 #썸타로`,
    capcut: `[CapCut 편집 가이드 - 4월 23일 목]
카드: 은둔자 (The Hermit)
총 길이: 12초

장면1 (0-3초): scene1.png
  - 빠른 줌인 (100% → 115%)

장면2 (3-7초): scene2.png
  - 전환: 글리치 (0.5초)
  - 줌아웃

장면3 (7-12초): scene3.png
  - 전환: 디졸브 (0.5초)
  - 살짝 줌인

음악: 인스타에서 추가 (25-30%)
커버: scene2.png`,
    story: `[스토리 업로드 가이드 - 4월 23일 목]
카드: The Hermit - 은둔자

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 투표 스티커 → "연락 뜸해지면? 내가 먼저 연락 vs 기다린다"
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[질문 답변 스토리 - 4월 23일 목]
유형: 21일 질문박스 답변

1) 21일 질문박스에서 온 고민 1-2개 선택
2) 해당 고민 텍스트 + 카드 이미지 + 한줄 해석
3) "더 궁금하면 프로필 링크에서 직접 뽑아보세요"

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_24일__금_': {
    carousel: `좋아하는 사람한테 연락하고 싶을 때
당신은 어떻게 하나요?

A) 이유 없이 바로 연락
B) 핑계 만들어서 연락
C) 상대가 먼저 하길 기다림
D) 공통 화제 찾아서 연락

각 유형별 타로 카드 매칭해봤어요
스와이프해서 확인하고
댓글에 유형 남겨주세요

"이거 너잖아" 싶은 친구 태그도 환영

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    story: `[스토리 업로드 가이드 - 4월 24일 금]
카드: The Moon - 달

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 설문 스티커 → "나의 연락 스타일은? A/B/C/D"
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[투표 스토리 - 4월 24일 금]
유형: 투표

텍스트: 연락이 먼저 오길 기다려본 적 있어?
선택지: 자주... | 내가 먼저 한다
하단: 프로필 링크에서 직접 뽑아보세요

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_25일__토_': {
    reel: `이번 주 가장 많이 온 질문이에요
"갑자기 태도가 바뀌었어요"

정말 많은 분들이 같은 상황을 겪고 있더라고요
그래서 카드를 뽑아봤어요

탑 카드가 나왔어요

이 카드는 무너진다는 뜻이 아니에요
상대 내면에서 무언가 정리되고 있는 거예요
변화가 두려워도 새로운 흐름이 오고 있어요

비슷한 고민 있으면 댓글 남겨주세요
다음 주에 또 답해드릴게요

직접 뽑아보기 - 프로필 링크

#연애타로리딩 #오늘의타로카드 #연애고민상담 #무료타로점 #썸타로`,
    capcut: `[CapCut 편집 가이드 - 4월 25일 토]
카드: 탑 (The Tower)
총 길이: 25초 (긴 버전)

장면1 (0-4초): scene1.png
  - 페이드인
  - 줌인

장면2 (4-10초): scene2.png
  - 전환: 글리치 (0.5초)
  - 줌아웃

장면3 (10-25초): scene3.png
  - 전환: 디졸브 (0.5초)
  - 줌인/줌아웃 번갈아

커버: scene2.png
음악: 잔잔한 ambient (인스타에서 추가, 25-30%)
내보내기: 1080p / 30fps`,
    story: `[스토리 업로드 가이드 - 4월 25일 토]
카드: The Tower - 탑

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 이모지 슬라이더 → "갑자기 달라진 그 사람, 불안한가요?" (하트)
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[질문박스 스토리 - 4월 25일 토]
유형: 질문 스티커 (다음 주용)

텍스트: 다음 주 릴스에서 답해드릴게요
질문 스티커: "연애 고민 한 줄로 보내주세요"
하단: 익명이니까 편하게!

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_26일__일_': {
    feed: `이번 주도 수고했어요

감정이 헷갈려도 괜찮아요
지금 느끼는 그 흔들림이
실은 가장 솔직한 감정일 수 있어요

달 카드가 말해줘요
불분명한 것들이 서서히 선명해지고 있어요

오늘은 쉬어가세요
내일부터 새로운 한 주가 시작되니까

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    story: `[스토리 업로드 가이드 - 4월 26일 일]
카드: The Moon - 달

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 투표 → "이번 주 연애운 도움됐어요?" → 도움됐어 / 더 보고 싶어
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[다음 주 예고 스토리 - 4월 26일 일]
유형: 카운트다운 + 예고

텍스트: 다음 주 연애운 미리보기
서브: 어떤 카드가 나올까요?
카운트다운 스티커: "다음 주 연애운 공개" (내일 10:00)
하단: 프로필 링크에서 직접 뽑아보세요

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

}

// ══════════════════════════════════════
// 메인
// ══════════════════════════════════════
async function main() {
  ensureDir(outputDir)

  for (const day of WEEK3) {
    const dayDir = resolve(outputDir, day.folder)
    ensureDir(dayDir)
    const cap = CAPTIONS[day.folder]

    console.log(`\n── ${day.date} (${day.type}) ──`)

    // ── 스토리 (모든 날) ──
    const storyDir = resolve(dayDir, 'story')
    ensureDir(storyDir)
    console.log(`  스토리: ${day.storyCard.name}`)
    const storyImg = await generateStory(day.storyCard, day.storyHook)
    if (storyImg) writeFileSync(resolve(storyDir, 'story.png'), storyImg)
    writeFileSync(resolve(storyDir, 'caption.txt'), cap.story)

    // ── 투표/저녁 스토리 ──
    writeFileSync(resolve(dayDir, 'poll-story.txt'), cap.poll)

    // ── 주간운세 캐러셀 (월) ──
    if (day.type === 'carousel') {
      const cDir = resolve(dayDir, 'carousel')
      ensureDir(cDir)
      console.log(`  캐러셀: ${day.theme} (${day.cards.length + 2}장)`)

      const cover = await carouselCover('이번 주 연애운, 요일별로 확인하세요', '4/21 - 4/27 이번 주 연애 흐름', '저장해두고 매일 확인하는 이번 주 연애운', day.cards.map(c => c.slug))
      writeFileSync(resolve(cDir, 'slide01.png'), cover)

      for (let i = 0; i < day.cards.length; i++) {
        const slide = await carouselDayCard(day.cards[i])
        writeFileSync(resolve(cDir, `slide${String(i + 2).padStart(2, '0')}.png`), slide)
      }

      const combinedCta = await carouselCTACombined('world')
      writeFileSync(resolve(cDir, `slide${String(day.cards.length + 2).padStart(2, '0')}.png`), combinedCta)

      writeFileSync(resolve(cDir, 'caption.txt'), cap.carousel)
    }

    // ── 교육형 캐러셀 (수) ──
    if (day.type === 'carousel-edu') {
      const cDir = resolve(dayDir, 'carousel')
      ensureDir(cDir)
      console.log(`  캐러셀(교육): ${day.theme} (${day.slides.length + 2}장)`)

      const cover = await carouselEduCover(day.eduCard, '연인 카드가 나왔다면?', '사랑 확정이 아니에요')
      writeFileSync(resolve(cDir, 'slide01.png'), cover)

      for (let i = 0; i < day.slides.length; i++) {
        const slide = await carouselEduSlide(day.slides[i].title, day.slides[i].body, `${i + 1} / ${day.slides.length}`)
        writeFileSync(resolve(cDir, `slide${String(i + 2).padStart(2, '0')}.png`), slide)
      }

      const combinedCta = await carouselCTACombined('lovers',
        ['저장해두고', '이 카드가 다시 나오면 꺼내보세요'],
        ['연인 카드가 나온 친구가 있다면', '가볍게 공유해보세요']
      )
      writeFileSync(resolve(cDir, `slide${String(day.slides.length + 2).padStart(2, '0')}.png`), combinedCta)

      writeFileSync(resolve(cDir, 'caption.txt'), cap.carousel)
    }

    // ── 테스트형 캐러셀 (금) ──
    if (day.type === 'carousel-test') {
      const cDir = resolve(dayDir, 'carousel')
      ensureDir(cDir)
      console.log(`  캐러셀(테스트): ${day.theme} (${day.testItems.length + 3}장)`)

      const cover = await carouselCover('당신의 연락 스타일은?', '연락 유형별 타로 카드 매칭', '댓글에 A/B/C/D로 알려주세요', day.testItems.map(t => t.slug))
      writeFileSync(resolve(cDir, 'slide01.png'), cover)

      const situation = await carouselEduSlide('상황', '좋아하는 사람한테\n연락하고 싶을 때\n당신의 다음 행동은?', '')
      writeFileSync(resolve(cDir, 'slide02.png'), situation)

      for (let i = 0; i < day.testItems.length; i++) {
        const slide = await carouselTestSlide(day.testItems[i])
        writeFileSync(resolve(cDir, `slide${String(i + 3).padStart(2, '0')}.png`), slide)
      }

      const combinedCta = await carouselCTACombined('hermit',
        ['당신은 몇 유형인지', '댓글에 A/B/C/D로 알려주세요'],
        ['"이거 너잖아" 싶은 친구가 있다면', '가볍게 공유해보세요']
      )
      writeFileSync(resolve(cDir, `slide${String(day.testItems.length + 3).padStart(2, '0')}.png`), combinedCta)

      writeFileSync(resolve(cDir, 'caption.txt'), cap.carousel)
    }

    // ── 릴스 (화/목/토) ──
    if (day.type === 'reel') {
      const rDir = resolve(dayDir, 'reel')
      ensureDir(rDir)
      const s = day.reelScenes
      const c = day.reelCard
      console.log(`  릴스: ${c.name} (3장면)`)

      const s1 = await reelScene1(s.hook, s.hookSub)
      writeFileSync(resolve(rDir, 'scene1.png'), s1)

      const s2 = await reelScene2(c)
      writeFileSync(resolve(rDir, 'scene2.png'), s2)

      const s3 = await reelScene3(c, s.interpret, s.cta)
      writeFileSync(resolve(rDir, 'scene3.png'), s3)

      writeFileSync(resolve(rDir, 'caption.txt'), cap.reel)
      writeFileSync(resolve(rDir, 'capcut-guide.txt'), cap.capcut)
    }

    // ── 단일 피드 (일) ──
    if (day.type === 'single') {
      const fDir = resolve(dayDir, 'feed')
      ensureDir(fDir)
      console.log(`  피드(단일): ${day.feedCard.name}`)
      const feedImg = await generateFeedSingle(day.feedCard, '감정이 헷갈려도 괜찮아요')
      if (feedImg) writeFileSync(resolve(fDir, 'feed.png'), feedImg)
      writeFileSync(resolve(fDir, 'caption.txt'), cap.feed)
    }
  }

  console.log(`
══════════════════════════════════════
  3주차 콘텐츠 생성 완료!
══════════════════════════════════════

[폴더 구조]
4월_20일__월_/  캐러셀(주간운세) 9장 + 스토리 + 투표
4월_21일__화_/  릴스(연인) 3장면 + CapCut가이드 + 스토리 + 질문박스
4월_22일__수_/  캐러셀(연인 카드 해설) 6장 + 스토리 + This or That
4월_23일__목_/  릴스(은둔자) 3장면 + CapCut가이드 + 스토리 + 질문답변
4월_24일__금_/  캐러셀(연락 스타일 테스트) 7장 + 스토리 + 투표
4월_25일__토_/  릴스(탑) 3장면(긴버전) + CapCut가이드 + 스토리 + 질문박스
4월_26일__일_/  단일피드(달) + 스토리 + 다음주예고

[매일 시간표]
09:30  스토리 올리기 (story/story.png + 스티커)
10:00  피드/캐러셀 올리기 (carousel/ 또는 feed/)
13:00  릴스 올리기 (reel/ + CapCut 편집)
21:00  저녁 스토리 (poll-story.txt 참고)

[3주차 사용 카드]
릴스: 연인, 은둔자, 탑
스토리: 달, 여사제, 연인, 은둔자, 달, 탑
캐러셀: 여사제, 연인, 은둔자, 교황, 탑, 달, 세계
  `)
}

main().catch(console.error)
