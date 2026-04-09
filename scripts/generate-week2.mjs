/**
 * LOVTARO 인스타그램 2주차 콘텐츠 생성 (4/13~4/19)
 * 실행: node scripts/generate-week2.mjs
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
const WEEK2 = [
  {
    date: '4월 13일 (월)', folder: '4월_13일__월_',
    type: 'carousel',
    theme: '이번 주 연애운',
    cards: [
      { slug: 'fool', name: '바보', nameEn: 'The Fool', day: '월', line: '새로운 시작의 에너지. 용기 내서 먼저 다가가보세요' },
      { slug: 'empress', name: '여황제', nameEn: 'The Empress', day: '화', line: '따뜻한 감정이 흘러나오는 날. 다정함이 무기예요' },
      { slug: 'hierophant', name: '교황', nameEn: 'The Hierophant', day: '수', line: '진지한 대화가 관계를 깊게 만드는 날' },
      { slug: 'justice', name: '정의', nameEn: 'Justice', day: '목', line: '균형 잡힌 시선이 필요한 날. 감정과 이성 사이에서' },
      { slug: 'hanged-man', name: '매달린 사람', nameEn: 'The Hanged Man', day: '금', line: '기다림이 답인 날. 조급해하지 마세요' },
      { slug: 'temperance', name: '절제', nameEn: 'Temperance', day: '토', line: '천천히 꾸준히. 관계의 균형을 찾는 날' },
      { slug: 'star', name: '별', nameEn: 'The Star', day: '일', line: '희망이 보이는 날. 좋은 흐름이 오고 있어요' },
    ],
    storyCard: { slug: 'fool', name: '바보', nameEn: 'The Fool', keywords: ['새로운 시작', '가능성', '용기'] },
    storyHook: '새로운 한 주가 시작되는 오늘\n용기 내서 먼저 다가가보세요\n바보 카드가 응원하고 있어요',
  },
  {
    date: '4월 14일 (화)', folder: '4월_14일__화_',
    type: 'reel',
    reelCard: { slug: 'empress', name: '여황제', nameEn: 'The Empress', keywords: ['다정함', '풍요', '돌봄'] },
    reelScenes: {
      hook: '그 사람이 나한테\n편하게 대하는 게',
      hookSub: '좋아서일까\n관심 없어서일까',
      reveal: '상대방 속마음',
      interpret: '상대는 당신 앞에서\n방어를 내려놓고 있어요\n그건 무관심이 아니라 신뢰예요',
      cta: '비슷한 고민?\n댓글 남겨주세요',
    },
    storyCard: { slug: 'empress', name: '여황제', nameEn: 'The Empress', keywords: ['다정함', '풍요', '돌봄'] },
    storyHook: '오늘은 따뜻한 감정이\n자연스럽게 흘러나오는 날\n그 다정함이 무기예요',
  },
  {
    date: '4월 15일 (수)', folder: '4월_15일__수_',
    type: 'carousel-edu',
    theme: '바보 카드가 연애에서 나왔을 때 진짜 의미',
    eduCard: { slug: 'fool', name: '바보', nameEn: 'The Fool' },
    slides: [
      { title: '바보 카드 = 새로운 시작', body: '겁 없이 다가갈 수 있는 에너지\n타로에서 가장 순수한 카드\n키워드: 설렘 / 가능성 / 용기' },
      { title: '연애에서 나왔다면?', body: '짝사랑: 상대도 탐색 중이에요\n연락이 불규칙해도 거리두기가 아님\n\n커플: 새로운 바람이 필요한 시기\n처음처럼 가볍게 다가가보세요' },
      { title: '이것만 주의하세요', body: '기대를 너무 구체적으로 잡으면\n오히려 흐름이 막혀요\n열어두는 만큼 다음이 생깁니다' },
    ],
    storyCard: { slug: 'fool', name: '바보', nameEn: 'The Fool', keywords: ['새로운 시작', '가능성', '용기'] },
    storyHook: '바보 카드가 나왔다면?\n나쁜 게 아니에요\n새로운 시작의 신호입니다',
  },
  {
    date: '4월 16일 (목)', folder: '4월_16일__목_',
    type: 'reel',
    reelCard: { slug: 'justice', name: '정의', nameEn: 'Justice', keywords: ['균형', '공정', '진실'] },
    reelScenes: {
      hook: '연락 올 때만 반갑고\n안 오면 불안한 사람',
      hookSub: '근데 나도\n먼저 안 하잖아',
      reveal: '이 관계의 진실',
      interpret: '균형이 맞지 않은 관계는\n결국 한쪽이 지쳐요\n먼저 한 발짝 다가가보세요',
      cta: '공감되면 친구한테 공유\nlovtaro.kr',
    },
    storyCard: { slug: 'justice', name: '정의', nameEn: 'Justice', keywords: ['균형', '공정', '진실'] },
    storyHook: '감정과 이성 사이에서\n균형이 필요한 하루\n한쪽으로만 기울지 마세요',
  },
  {
    date: '4월 17일 (금)', folder: '4월_17일__금_',
    type: 'carousel-test',
    theme: '읽씹 유형별 타로 카드 매칭',
    testItems: [
      { type: 'A', label: '5분 안에 다시 보냄', slug: 'fool', cardName: '바보', desc: '용감한 당신\n거절이 두렵지 않은 타입' },
      { type: 'B', label: '하루 기다렸다 아무렇지 않은 척', slug: 'hanged-man', cardName: '매달린 사람', desc: '인내의 달인\n근데 속으로는 미치는 중' },
      { type: 'C', label: '삭제하고 없던 일로', slug: 'tower', cardName: '탑', desc: '깔끔한 정리파\n근데 새벽에 후회함' },
      { type: 'D', label: '다른 사람한테 연락해봄', slug: 'wheel-of-fortune', cardName: '운명의 수레바퀴', desc: '흐름을 바꾸는 타입\n의외로 이게 답일 수도' },
    ],
    storyCard: { slug: 'hanged-man', name: '매달린 사람', nameEn: 'The Hanged Man', keywords: ['인내', '관점 전환', '기다림'] },
    storyHook: '읽씹당하면 당신은?\n오늘 피드에서 유형 테스트\n확인해보세요',
  },
  {
    date: '4월 18일 (토)', folder: '4월_18일__토_',
    type: 'reel',
    reelCard: { slug: 'hanged-man', name: '매달린 사람', nameEn: 'The Hanged Man', keywords: ['인내', '관점 전환', '기다림'] },
    reelScenes: {
      hook: '이번 주 가장 많이 온 질문',
      hookSub: '기다리는 게 맞을까요?',
      reveal: '카드를 뽑아봤어요',
      interpret: '지금은 상대가\n감정을 정리하는 시간이에요\n먼저 다가가면\n오히려 부담이 될 수 있어요\n\n조급해하지 마세요\n기다림이 답인 시기가 있어요',
      cta: '비슷한 고민 있으면\n댓글 남겨주세요',
    },
    storyCard: { slug: 'temperance', name: '절제', nameEn: 'Temperance', keywords: ['균형', '조화', '인내'] },
    storyHook: '기다림이 답인 날도 있어요\n조급해하지 마세요\n좋은 흐름이 오고 있어요',
  },
  {
    date: '4월 19일 (일)', folder: '4월_19일__일_',
    type: 'single',
    feedCard: { slug: 'star', name: '별', nameEn: 'The Star', keywords: ['희망', '치유', '따뜻함'] },
    storyCard: { slug: 'star', name: '별', nameEn: 'The Star', keywords: ['희망', '치유', '따뜻함'] },
    storyHook: '다시 기대해도 괜찮아요\n오늘은 쉬어가는 날\n내일부터 새로운 한 주예요',
  },
]

// ══════════════════════════════════════
// 스토리 생성 (1080x1920) - 기존과 동일
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
// 캐러셀 슬라이드 생성 (1080x1080)
// ══════════════════════════════════════
function carouselBg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
  <defs>
    <linearGradient id="cbg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#03050A"/>
      <stop offset="50%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#03050A"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#cbg)"/>
  ${content}
</svg>`
}

// 표지 슬라이드 (카드 7장 팬 배치)
async function carouselCover(title, subtitle, cardSlugs) {
  const slugs = cardSlugs || []
  const cW = 160, cH = 240

  const cards = []
  for (const slug of slugs) {
    const img = await loadCard(slug, cW, cH)
    if (img) {
      const masked = await roundImg(img, cW, cH, 8)
      cards.push(masked)
    }
  }

  // 7장 팬: 중앙 기준, 부채꼴로 펼침
  const count = cards.length
  const positions = []
  for (let i = 0; i < count; i++) {
    const center = (count - 1) / 2
    const offset = i - center
    positions.push({
      left: 540 + offset * 90 - cW / 2,
      top: 470 + Math.abs(offset) * 25,
      rotate: offset * 6,
    })
  }

  const svg = carouselBg(`
  <text x="540" y="100" font-family="sans-serif" font-size="18" fill="rgba(77,163,255,0.5)" text-anchor="middle" letter-spacing="6">LOVTARO</text>
  <text x="540" y="220" font-family="sans-serif" font-size="56" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(title)}</text>
  <line x1="400" y1="260" x2="680" y2="260" stroke="rgba(77,163,255,0.15)" stroke-width="1"/>
  <text x="540" y="300" font-family="sans-serif" font-size="26" fill="rgba(167,183,214,0.5)" text-anchor="middle">${esc(subtitle)}</text>
  <text x="540" y="970" font-family="sans-serif" font-size="20" fill="rgba(143,211,255,0.4)" text-anchor="middle">스와이프해서 확인하세요 →</text>
  <text x="540" y="1030" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
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

// 카드 + 요일 슬라이드 (주간 운세용)
async function carouselDayCard(card) {
  const cW = 480, cH = 720
  const img = await loadCard(card.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 14) : null

  const lines = card.line.split('. ')
  const lineSvg = lines.map((l, i) =>
    `<text x="540" y="${880 + i * 36}" font-family="sans-serif" font-size="26" font-weight="300" fill="${i === 0 ? 'rgba(143,211,255,0.9)' : 'rgba(244,248,255,0.75)'}" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const svg = carouselBg(`
  <text x="540" y="70" font-family="sans-serif" font-size="22" fill="rgba(77,163,255,0.6)" text-anchor="middle" letter-spacing="4">${esc(card.day)}요일</text>
  <text x="540" y="810" font-family="sans-serif" font-size="40" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(card.name)}</text>
  <text x="540" y="845" font-family="Georgia, serif" font-size="16" font-style="italic" fill="rgba(126,138,168,0.4)" text-anchor="middle">${esc(card.nameEn)}</text>
  ${lineSvg}
  <text x="540" y="1020" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    return sharp(base).composite([{ input: masked, left: (1080 - cW) / 2, top: 95 }]).png().toBuffer()
  }
  return base
}

// CTA 슬라이드 (아이콘 + 배경 카드)
async function carouselCTA(mainText, subText, icon, bgCardSlug) {
  // icon: 'save' = 북마크, 'share' = 공유 화살표
  let iconSvg = ''
  if (icon === 'save') {
    iconSvg = `<g transform="translate(492, 260)">
      <path d="M14 0 L82 0 Q96 0 96 14 L96 110 L48 82 L0 110 L0 14 Q0 0 14 0 Z" fill="none" stroke="rgba(143,211,255,0.6)" stroke-width="3"/>
    </g>`
  } else if (icon === 'share') {
    iconSvg = `<g transform="translate(490, 260)">
      <path d="M65 0 L96 32 L65 64" fill="none" stroke="rgba(143,211,255,0.6)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M96 32 L15 32 L15 96" fill="none" stroke="rgba(143,211,255,0.6)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`
  }

  const svg = carouselBg(`
  ${iconSvg}
  <text x="540" y="420" font-family="sans-serif" font-size="40" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(mainText)}</text>
  <text x="540" y="470" font-family="sans-serif" font-size="24" fill="rgba(167,183,214,0.5)" text-anchor="middle">${esc(subText)}</text>
  <line x1="380" y1="530" x2="700" y2="530" stroke="rgba(77,163,255,0.12)" stroke-width="1"/>
  <text x="540" y="580" font-family="sans-serif" font-size="22" fill="rgba(143,211,255,0.5)" text-anchor="middle">무료로 직접 뽑아보기 · lovtaro.kr</text>
  <text x="540" y="1020" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  let base = await sharp(Buffer.from(svg)).png().toBuffer()

  // 배경 카드 반투명 합성
  if (bgCardSlug) {
    const bgW = 420, bgH = 630
    const bgImg = await loadCard(bgCardSlug, bgW, bgH)
    if (bgImg) {
      const bgMasked = await roundImg(bgImg, bgW, bgH, 14)
      const faded = await sharp(bgMasked)
        .ensureAlpha()
        .composite([{
          input: Buffer.from(`<svg width="${bgW}" height="${bgH}"><rect width="${bgW}" height="${bgH}" fill="white" opacity="0.25"/></svg>`),
          blend: 'dest-in'
        }])
        .png().toBuffer()
      base = await sharp(base)
        .composite([{ input: faded, left: (1080 - bgW) / 2, top: 220 }])
        .png().toBuffer()
    }
  }
  return base
}

// 교육형 슬라이드 (텍스트 중심, 수직 중앙)
async function carouselEduSlide(title, body, index) {
  const lines = body.split('\n')

  const titleSize = 42
  const bodySize = 26
  const lineGap = 42
  const blankGap = 24 // 빈 줄 추가 간격
  const titleBodyGap = 35

  // 실제 높이 계산 (빈 줄은 추가 간격만)
  let bodyTotalH = 0
  for (const l of lines) {
    bodyTotalH += l === '' ? blankGap : lineGap
  }
  const totalH = titleSize + titleBodyGap + bodyTotalH
  const startY = Math.round((1080 - totalH) / 2)

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
  <text x="540" y="1040" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  return sharp(Buffer.from(svg)).png().toBuffer()
}

// 교육형 표지 (카드 이미지 + 제목)
async function carouselEduCover(card, title, subtitle) {
  const cW = 460, cH = 690
  const img = await loadCard(card.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 14) : null

  const svg = carouselBg(`
  <text x="540" y="70" font-family="sans-serif" font-size="18" fill="rgba(77,163,255,0.5)" text-anchor="middle" letter-spacing="6">카드 해설</text>
  <text x="540" y="890" font-family="sans-serif" font-size="44" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(title)}</text>
  <text x="540" y="940" font-family="sans-serif" font-size="24" fill="rgba(167,183,214,0.5)" text-anchor="middle">${esc(subtitle)}</text>
  <text x="540" y="1020" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    return sharp(base).composite([{ input: masked, left: (1080 - cW) / 2, top: 100 }]).png().toBuffer()
  }
  return base
}

// 테스트형 슬라이드 (유형별)
async function carouselTestSlide(item) {
  const cW = 320, cH = 480
  const img = await loadCard(item.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 12) : null

  const lines = item.desc.split('\n')
  const descSvg = lines.map((l, i) =>
    `<text x="540" y="${780 + i * 36}" font-family="sans-serif" font-size="26" font-weight="300" fill="rgba(244,248,255,0.85)" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const svg = carouselBg(`
  <text x="540" y="80" font-family="sans-serif" font-size="48" font-weight="200" fill="rgba(77,163,255,0.7)" text-anchor="middle">${esc(item.type)}</text>
  <text x="540" y="135" font-family="sans-serif" font-size="26" fill="rgba(244,248,255,0.7)" text-anchor="middle">${esc(item.label)}</text>
  <text x="540" y="680" font-family="sans-serif" font-size="30" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(item.cardName)}</text>
  ${descSvg}
  <text x="540" y="1020" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    return sharp(base).composite([{ input: masked, left: (1080 - cW) / 2, top: 170 }]).png().toBuffer()
  }
  return base
}

// ══════════════════════════════════════
// 릴스 장면 생성 (1080x1920)
// ══════════════════════════════════════
function reelBg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
  <defs><linearGradient id="rbg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#03050A"/><stop offset="40%" stop-color="#0A1020"/>
    <stop offset="60%" stop-color="#0A1020"/><stop offset="100%" stop-color="#03050A"/>
  </linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#rbg)"/>
  ${content}
</svg>`
}

// 장면1: 훅 텍스트
async function reelScene1(hook, hookSub) {
  const hLines = hook.split('\n')
  const sLines = hookSub.split('\n')
  const hSvg = hLines.map((l, i) =>
    `<text x="540" y="${700 + i * 65}" font-family="sans-serif" font-size="52" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')
  const sSvg = sLines.map((l, i) =>
    `<text x="540" y="${700 + hLines.length * 65 + 40 + i * 55}" font-family="sans-serif" font-size="42" font-weight="300" fill="rgba(167,183,214,0.7)" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const svg = reelBg(`
  ${hSvg}
  ${sSvg}
  <text x="540" y="1800" font-family="sans-serif" font-size="18" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  return sharp(Buffer.from(svg)).png().toBuffer()
}

// 장면2: 카드 공개
async function reelScene2(card) {
  const cW = 640, cH = 960
  const img = await loadCard(card.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 18) : null

  const svg = reelBg(`
  <text x="540" y="120" font-family="sans-serif" font-size="22" fill="rgba(200,169,110,0.5)" text-anchor="middle" letter-spacing="6">상대방 속마음</text>
  <text x="540" y="1280" font-family="sans-serif" font-size="52" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(card.name)}</text>
  <text x="540" y="1325" font-family="Georgia, serif" font-size="20" font-style="italic" fill="rgba(200,169,110,0.4)" text-anchor="middle">${esc(card.nameEn)}</text>
  <text x="540" y="1380" font-family="sans-serif" font-size="18" fill="rgba(167,183,214,0.4)" text-anchor="middle">${card.keywords.map(k => esc(k)).join('  ·  ')}</text>
  <text x="540" y="1800" font-family="sans-serif" font-size="18" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    return sharp(base).composite([{ input: masked, left: (1080 - cW) / 2, top: 170 }]).png().toBuffer()
  }
  return base
}

// 장면3: 해석
async function reelScene3(card, interpret) {
  const lines = interpret.split('\n').filter(l => l.length > 0)
  const startY = 600
  const iSvg = lines.map((l, i) =>
    `<text x="540" y="${startY + i * 55}" font-family="sans-serif" font-size="40" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const svg = reelBg(`
  <text x="540" y="380" font-family="sans-serif" font-size="20" fill="rgba(77,163,255,0.45)" text-anchor="middle" letter-spacing="5">상대방 속마음</text>
  <text x="540" y="460" font-family="sans-serif" font-size="56" font-weight="200" fill="#F4F8FF" text-anchor="middle">${esc(card.name)}</text>
  <text x="540" y="505" font-family="Georgia, serif" font-size="20" font-style="italic" fill="rgba(126,138,168,0.4)" text-anchor="middle">${esc(card.nameEn)}</text>
  <line x1="400" y1="545" x2="680" y2="545" stroke="rgba(77,163,255,0.2)" stroke-width="1"/>
  ${iSvg}
  <text x="540" y="1800" font-family="sans-serif" font-size="18" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  return sharp(Buffer.from(svg)).png().toBuffer()
}

// 장면4: CTA
async function reelScene4(cta) {
  const lines = cta.split('\n')
  const ctaSvg = lines.map((l, i) =>
    `<text x="540" y="${750 + i * 55}" font-family="sans-serif" font-size="36" fill="rgba(143,211,255,0.6)" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const svg = reelBg(`
  <text x="540" y="620" font-family="sans-serif" font-size="28" fill="rgba(77,163,255,0.45)" text-anchor="middle">당신도 직접 뽑아보세요</text>
  <text x="540" y="670" font-family="sans-serif" font-size="22" fill="rgba(167,183,214,0.4)" text-anchor="middle">무료 타로 리딩 · lovtaro.kr</text>
  ${ctaSvg}
  <text x="540" y="1800" font-family="sans-serif" font-size="18" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
  `)
  return sharp(Buffer.from(svg)).png().toBuffer()
}

// ══════════════════════════════════════
// 단일 피드 이미지 (1080x1080) - 일요일용
// ══════════════════════════════════════
async function generateFeedSingle(card, quote) {
  const cW = 600, cH = 900
  const img = await loadCard(card.slug, cW, cH)
  const masked = img ? await roundImg(img, cW, cH, 16) : null

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
  <defs>
    <linearGradient id="fbg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#03050A"/><stop offset="50%" stop-color="#0A1020"/><stop offset="100%" stop-color="#03050A"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#fbg)"/>
  <text x="540" y="60" font-family="sans-serif" font-size="18" fill="rgba(77,163,255,0.5)" text-anchor="middle" letter-spacing="6">일요일 한줄 위로</text>
  <text x="540" y="990" font-family="sans-serif" font-size="30" font-weight="300" fill="rgba(244,248,255,0.7)" text-anchor="middle">${esc(quote)}</text>
  <text x="540" y="1040" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
</svg>`
  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  if (masked) {
    return sharp(base).composite([{ input: masked, left: (1080 - cW) / 2, top: 75 }]).png().toBuffer()
  }
  return base
}

// ══════════════════════════════════════
// 텍스트 파일 생성
// ══════════════════════════════════════
const CAPTIONS = {
  '4월_13일__월_': {
    carousel: `이번 주(4/13~4/19) 연애운을 카드로 뽑아봤어요

매일 아침 해당 요일 카드를 확인하고
하루를 시작해보세요

저장해두면 매일 꺼내볼 수 있어요
궁금한 친구 태그해주세요

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    story: `[스토리 업로드 가이드 - 4월 13일 월]
카드: The Fool - 바보

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 카운트다운 "이번 주 연애운 공개" (10:00 설정)
   - 위치 → 서울
   - @lovtarot_ 멘션 (하단 작게)
3) 텍스트 추가: "10시에 피드에서 확인하세요"
4) 공유`,
    poll: `[투표 스토리 - 4월 13일 월]
유형: 투표

텍스트: 이번 주 연애운 확인했어?
선택지: 했어! | 아직...
하단: 피드에서 확인하세요

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_14일__화_': {
    reel: `편하게 대해주는 게 좋으면서도
혹시 관심이 없어서 그런 건 아닌지
불안했던 적 있잖아요

여황제 카드가 말해줘요
상대는 당신 앞에서 방어를 내려놓고 있어요
그건 무관심이 아니라 신뢰예요

편하게 대하는 사람 있으면
댓글에 알려주세요
카드 한 장 뽑아서 답해드릴게요

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    capcut: `[CapCut 편집 가이드 - 4월 14일 화]
카드: 여황제 (The Empress)
총 길이: 12초

장면1 (0-3초): scene1.png
  - 줌인 효과 (100% → 110%)
  - 키프레임: 시작=원본, 끝=확대

장면2 (3-6초): scene2.png
  - 전환: 글리치 (0.5초)
  - 줌아웃 효과

장면3 (6-10초): scene3.png
  - 전환: 디졸브 (0.5초)
  - 살짝 줌인

장면4 (10-12초): scene4.png
  - 전환: 페이드 (0.5초)
  - 정지

음악: 인스타에서 추가 (mysterious/ambient 검색, 25-30%)
커버: scene2.png 선택
내보내기: 1080p / 30fps`,
    story: `[스토리 업로드 가이드 - 4월 14일 화]
카드: The Empress - 여황제

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 이모지 슬라이더 → "오늘 사랑받고 있다는 느낌은?" (하트 이모지)
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[질문박스 스토리 - 4월 14일 화]
유형: 질문 스티커

텍스트: 연애 고민 보내주세요
질문 스티커: "지금 가장 답답한 연애 상황은?"
하단: 카드 뽑아서 답해드릴게요

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_15일__수_': {
    carousel: `타로에서 "바보" 카드가 나오면
나쁜 건가? 걱정하는 분들 많은데

전혀 아니에요
바보 카드는 타로에서 가장 순수한 에너지
새로운 시작과 무한한 가능성을 의미해요

연애에서 이 카드가 나왔다면
자세한 해석은 캐러셀에서 확인하세요

이 카드 나온 적 있으면 댓글로!

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    story: `[스토리 업로드 가이드 - 4월 15일 수]
카드: The Fool - 바보

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 설문 스티커 → "바보 카드 = ?" → 새로운 시작 / 실패 / 혼란 / 용기
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[This or That 스토리 - 4월 15일 수]
유형: 투표 2개

투표1: 고백은? 직접 말한다 vs 분위기로 보여준다
투표2: 첫 데이트? 카페 vs 산책
하단: 프로필 링크에서 직접 뽑아보세요

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_16일__목_': {
    reel: `연락 안 오면 불안한데
나도 먼저 안 하는 거 맞죠?

솔직히 이런 적 있잖아요
카톡 와있나 확인하면서
정작 내가 보내는 건 아닌

정의 카드가 말해줘요
관계에도 균형이 필요해요
받기만 원하면 결국 한쪽이 지쳐요

이런 경험 있으면 솔직하게 댓글로
카드 한 장 뽑아서 답해드릴게요

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    capcut: `[CapCut 편집 가이드 - 4월 16일 목]
카드: 정의 (Justice)
총 길이: 12초

장면1 (0-2초): scene1.png
  - 빠른 줌인 (100% → 115%)

장면2 (2-4초): scene2.png (훅 서브)
  - 전환: 글리치 (0.3초)

장면3 (4-7초): scene3.png (카드 공개)
  - 전환: 글리치 (0.5초)
  - 줌아웃

장면4 (7-10초): scene4.png (해석)
  - 전환: 디졸브 (0.5초)

장면5 (10-12초): scene5.png (CTA)
  - 전환: 페이드 (0.5초)

음악: 인스타에서 추가 (25-30%)
커버: scene3.png`,
    story: `[스토리 업로드 가이드 - 4월 16일 목]
카드: Justice - 정의

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 투표 스티커 → "나는? 먼저 연락파 vs 기다리는파"
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[질문 답변 스토리 - 4월 16일 목]
유형: 14일 질문박스 답변

1) 14일 질문박스에서 온 고민 1-2개 선택
2) 해당 고민 텍스트 + 카드 이미지 + 한줄 해석
3) "더 궁금하면 프로필 링크에서 직접 뽑아보세요"

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_17일__금_': {
    carousel: `읽씹당했을 때 당신은 어떤 유형?

A) 5분 안에 다시 보냄
B) 하루 기다렸다 아무렇지 않은 척
C) 삭제하고 없던 일로
D) 다른 사람한테 연락

각 유형별 타로 카드 매칭해봤어요
스와이프해서 확인하고
댓글에 유형 남겨주세요

"이거 너잖아" 싶은 친구 태그도 환영

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    story: `[스토리 업로드 가이드 - 4월 17일 금]
카드: The Hanged Man - 매달린 사람

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 설문 스티커 → "읽씹당하면? A/B/C/D" (4지선다)
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[투표 스토리 - 4월 17일 금]
유형: 투표

텍스트: 읽씹 후 새벽에 후회해본 적 있어?
선택지: 매번... | 후회는 없다
하단: 프로필 링크에서 직접 뽑아보세요

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_18일__토_': {
    reel: `이번 주 가장 많이 온 질문이에요
"기다리면 연락이 올까요?"

정말 많은 분들이 같은 고민을 하고 있더라고요
그래서 카드를 뽑아봤어요

매달린 사람 카드가 나왔어요

이 카드는 그냥 기다리라는 뜻이 아니에요
지금은 상대가 감정을 정리하는 시간이에요
먼저 다가가면 오히려 부담이 될 수 있어요

조급하지 않게, 하지만 포기하지도 않게
그 균형이 지금 필요해요

비슷한 고민 있으면 댓글 남겨주세요
다음 주에 또 답해드릴게요

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    capcut: `[CapCut 편집 가이드 - 4월 18일 토]
카드: 매달린 사람 (The Hanged Man)
총 길이: 35초 (긴 버전)

장면1 (0-3초): scene1.png (훅)
  - 빠른 페이드인
  - 줌인

장면2 (3-8초): scene2.png (훅 서브 - 질문 소개)
  - 전환: 디졸브 (0.5초)
  - 텍스트 순차 등장 느낌

장면3 (8-14초): scene3.png (카드 공개)
  - 전환: 글리치 (0.5초)
  - 줌아웃

장면4 (14-28초): scene4.png (해석 - 메인)
  - 전환: 디졸브 (0.5초)
  - 줌인/줌아웃 번갈아
  - 이 장면이 가장 김 (14초)

장면5 (28-35초): scene5.png (CTA)
  - 전환: 페이드 (0.5초)
  - 정지 → 페이드아웃

음악: 잔잔한 ambient (인스타에서 추가, 25-30%)
커버: scene3.png`,
    story: `[스토리 업로드 가이드 - 4월 18일 토]
카드: Temperance - 절제

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 이모지 슬라이더 → "지금 기다리고 있는 사람 있어요?" (하트)
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[질문박스 스토리 - 4월 18일 토]
유형: 질문 스티커 (다음 주용)

텍스트: 다음 주 릴스에서 답해드릴게요
질문 스티커: "연애 고민 한 줄로 보내주세요"
하단: 익명이니까 편하게!

추가 스티커:
- 위치: 서울
- @lovtarot_ 멘션`,
  },

  '4월_19일__일_': {
    feed: `다시 기대해도 괜찮아요

이전에 상처가 있었다면
지금은 그 위로 새살이 돋는 시기예요

누군가에게 마음을 여는 게
다시 두렵지 않은 날이 올 거예요

오늘은 쉬어가세요
내일부터 또 새로운 한 주가 시작되니까

다음 주 연애운이 궁금하면
내일 아침 피드에서 확인하세요

직접 뽑아보기 - 프로필 링크

${HASHTAGS}`,
    story: `[스토리 업로드 가이드 - 4월 19일 일]
카드: The Star - 별

1) story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 링크 스티커 → lovtaro.kr
   - 투표 → "이번 주 연애운 도움됐어요?" → 도움됐어 / 더 보고 싶어
   - 위치 → 서울
   - @lovtarot_ 멘션
3) 공유`,
    poll: `[다음 주 예고 스토리 - 4월 19일 일]
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

  for (const day of WEEK2) {
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

    // ── 캐러셀 (월/수/금) ──
    if (day.type === 'carousel') {
      const cDir = resolve(dayDir, 'carousel')
      ensureDir(cDir)
      console.log(`  캐러셀: ${day.theme} (${day.cards.length + 3}장)`)

      // 표지
      const cover = await carouselCover('이번 주 연애운', '4/13 - 4/19', day.cards.map(c => c.slug))
      writeFileSync(resolve(cDir, 'slide01.png'), cover)

      // 요일별 카드
      for (let i = 0; i < day.cards.length; i++) {
        const slide = await carouselDayCard(day.cards[i])
        writeFileSync(resolve(cDir, `slide${String(i + 2).padStart(2, '0')}.png`), slide)
      }

      // 저장 CTA (별 카드 배경)
      const saveCta = await carouselCTA('저장해두고 매일 아침 확인하세요', '해당 요일에 직접 뽑아보면 더 정확해요', 'save', 'star')
      writeFileSync(resolve(cDir, `slide${String(day.cards.length + 2).padStart(2, '0')}.png`), saveCta)

      // 공유 CTA (여황제 카드 배경)
      const shareCta = await carouselCTA('친구에게 공유해주세요', '이번 주 연애운이 궁금한 사람에게', 'share', 'empress')
      writeFileSync(resolve(cDir, `slide${String(day.cards.length + 3).padStart(2, '0')}.png`), shareCta)

      writeFileSync(resolve(cDir, 'caption.txt'), cap.carousel)
    }

    // ── 교육형 캐러셀 (수) ──
    if (day.type === 'carousel-edu') {
      const cDir = resolve(dayDir, 'carousel')
      ensureDir(cDir)
      console.log(`  캐러셀(교육): ${day.theme} (${day.slides.length + 3}장)`)

      // 표지
      const cover = await carouselEduCover(day.eduCard, '바보 카드가 나왔다면?', '이 카드, 나쁜 게 아니에요')
      writeFileSync(resolve(cDir, 'slide01.png'), cover)

      // 해설 슬라이드
      for (let i = 0; i < day.slides.length; i++) {
        const slide = await carouselEduSlide(day.slides[i].title, day.slides[i].body, `${i + 1} / ${day.slides.length}`)
        writeFileSync(resolve(cDir, `slide${String(i + 2).padStart(2, '0')}.png`), slide)
      }

      // 저장 CTA
      const saveCta = await carouselCTA('나중에 이 카드 나오면 다시 보세요', '저장 필수!', 'save', 'fool')
      writeFileSync(resolve(cDir, `slide${String(day.slides.length + 2).padStart(2, '0')}.png`), saveCta)

      // 공유 CTA
      const shareCta = await carouselCTA('바보 카드 나온 친구에게 보내주세요', 'lovtaro.kr에서 직접 뽑아보기', 'share', 'fool')
      writeFileSync(resolve(cDir, `slide${String(day.slides.length + 3).padStart(2, '0')}.png`), shareCta)

      writeFileSync(resolve(cDir, 'caption.txt'), cap.carousel)
    }

    // ── 테스트형 캐러셀 (금) ──
    if (day.type === 'carousel-test') {
      const cDir = resolve(dayDir, 'carousel')
      ensureDir(cDir)
      console.log(`  캐러셀(테스트): ${day.theme} (${day.testItems.length + 4}장)`)

      // 표지
      const cover = await carouselCover('읽씹당하면 당신은?', '유형별 타로 카드 매칭', day.testItems.map(t => t.slug))
      writeFileSync(resolve(cDir, 'slide01.png'), cover)

      // 상황 설명
      const situation = await carouselEduSlide('상황', '그 사람한테 카톡을 보냈어요\n읽음 표시는 떴는데 답이 없어요\n당신의 다음 행동은?', '')
      writeFileSync(resolve(cDir, 'slide02.png'), situation)

      // 유형별 슬라이드
      for (let i = 0; i < day.testItems.length; i++) {
        const slide = await carouselTestSlide(day.testItems[i])
        writeFileSync(resolve(cDir, `slide${String(i + 3).padStart(2, '0')}.png`), slide)
      }

      // 댓글 CTA
      const commentCta = await carouselCTA('당신은 몇 유형?', '댓글에 A/B/C/D로 알려주세요', 'save', 'tower')
      writeFileSync(resolve(cDir, `slide${String(day.testItems.length + 3).padStart(2, '0')}.png`), commentCta)

      // 공유 CTA
      const shareCta = await carouselCTA('"이거 너잖아" 싶은 친구에게 공유', 'lovtaro.kr에서 직접 뽑아보기', 'share', 'wheel-of-fortune')
      writeFileSync(resolve(cDir, `slide${String(day.testItems.length + 4).padStart(2, '0')}.png`), shareCta)

      writeFileSync(resolve(cDir, 'caption.txt'), cap.carousel)
    }

    // ── 릴스 (화/목/토) ──
    if (day.type === 'reel') {
      const rDir = resolve(dayDir, 'reel')
      ensureDir(rDir)
      const s = day.reelScenes
      const c = day.reelCard
      console.log(`  릴스: ${c.name} (4장면)`)

      const s1 = await reelScene1(s.hook, s.hookSub)
      writeFileSync(resolve(rDir, 'scene1.png'), s1)

      const s2 = await reelScene2(c)
      writeFileSync(resolve(rDir, 'scene2.png'), s2)

      const s3 = await reelScene3(c, s.interpret)
      writeFileSync(resolve(rDir, 'scene3.png'), s3)

      const s4 = await reelScene4(s.cta)
      writeFileSync(resolve(rDir, 'scene4.png'), s4)

      writeFileSync(resolve(rDir, 'caption.txt'), cap.reel)
      writeFileSync(resolve(rDir, 'capcut-guide.txt'), cap.capcut)
    }

    // ── 단일 피드 (일) ──
    if (day.type === 'single') {
      const fDir = resolve(dayDir, 'feed')
      ensureDir(fDir)
      console.log(`  피드(단일): ${day.feedCard.name}`)
      const feedImg = await generateFeedSingle(day.feedCard, '다시 기대해도 괜찮아요')
      if (feedImg) writeFileSync(resolve(fDir, 'feed.png'), feedImg)
      writeFileSync(resolve(fDir, 'caption.txt'), cap.feed)
    }
  }

  console.log(`
══════════════════════════════════════
  2주차 콘텐츠 생성 완료!
══════════════════════════════════════

[폴더 구조]
4월_14일__월_/  캐러셀 10장 + 스토리 + 투표
4월_14일__화_/  릴스 4장면 + CapCut가이드 + 스토리 + 질문박스
4월_15일__수_/  캐러셀(교육) 8장 + 스토리 + This or That
4월_16일__목_/  릴스 4장면 + CapCut가이드 + 스토리 + 질문답변
4월_17일__금_/  캐러셀(테스트) 8장 + 스토리 + 투표
4월_18일__토_/  릴스 4장면 + CapCut가이드(긴버전) + 스토리 + 질문박스
4월_19일__일_/  단일피드 + 스토리 + 다음주예고

[매일 시간표]
09:30  스토리 올리기 (story/story.png + 스티커)
10:00  피드/캐러셀 올리기 (carousel/ 또는 feed/)
13:00  릴스 올리기 (reel/ + CapCut 편집)
21:00  저녁 스토리 (poll-story.txt 참고)
`)
}

main().catch(console.error)
