/**
 * 전체 스토리 이미지 일괄 재생성 (v4 스타일)
 * - 아침 story.png: 카드 크게 + 하단 텍스트 + CTA 없음
 * - 저녁 poll-story.png: 카드 크게 + 선택지/질문 + CTA 없음
 * - 기존 story.png, poll-story.png 덮어쓰기
 *
 * 실행: node scripts/regenerate-all-stories.mjs
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

function generateStars(count, xMin, xMax, yMin, yMax) {
  let stars = ''
  const seed = [0.12,0.87,0.34,0.56,0.78,0.23,0.91,0.45,0.67,0.09,0.38,0.72,0.15,0.83,0.51,0.29,0.94,0.61,0.03,0.76,0.42,0.88,0.17,0.55,0.33,0.69]
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const size = 1 + seed[(i + 3) % seed.length] * 2.5
    const opacity = 0.3 + seed[(i + 5) % seed.length] * 0.7
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="rgba(255,255,255,${opacity.toFixed(2)})"/>\n`
  }
  return stars
}

// ══════════════════════════════════════
// 아침 스토리 생성
// ══════════════════════════════════════
async function generateMorningStory(slug, name, hookText, keywords) {
  const W = 1080, H = 1920
  const cardW = 760, cardH = 1040
  const cardLeft = (W - cardW) / 2
  const cardTop = 180

  const img = await loadCard(slug, cardW, cardH)
  if (!img) return null
  const masked = await roundImg(img, cardW, cardH, 20)

  const stars = generateStars(15, 50, 1030, 30, 160)
  const hookLines = hookText.split('\n')

  const textAreaTop = cardTop + cardH + 40
  const nameY = textAreaTop + 45
  const hookStartY = nameY + 65

  const hookSvg = hookLines.map((l, i) =>
    `<text x="540" y="${hookStartY + i * 60}" font-family="sans-serif" font-size="40" font-weight="500" fill="#FFFFFF" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ')

  const kwY = hookStartY + hookLines.length * 60 + 30
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
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="${cardTop + cardH / 2}" rx="500" ry="650" fill="url(#cardGlow)"/>
  ${stars}
  <text x="540" y="100" font-family="sans-serif" font-size="26" fill="rgba(180,170,230,0.75)" text-anchor="middle" letter-spacing="10" font-weight="300">오늘의 연애 카드</text>
  <line x1="380" y1="120" x2="700" y2="120" stroke="rgba(180,170,230,0.15)" stroke-width="1"/>
  <rect x="${cardLeft - 4}" y="${cardTop - 4}" width="${cardW + 8}" height="${cardH + 8}" rx="24" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#glow1)"/>
  <text x="540" y="${nameY}" font-family="sans-serif" font-size="36" font-weight="300" fill="rgba(210,200,250,0.85)" text-anchor="middle" letter-spacing="8">${esc(name)}</text>
  ${hookSvg}
  <text x="540" y="${kwY}" font-family="sans-serif" font-size="20" fill="rgba(180,170,220,0.45)" text-anchor="middle" letter-spacing="2">${kwText}</text>
</svg>`

  const base = await sharp(Buffer.from(svg)).png().toBuffer()
  return sharp(base)
    .composite([{ input: masked, left: cardLeft, top: cardTop }])
    .png({ quality: 90 }).toBuffer()
}

// ══════════════════════════════════════
// 저녁 poll-story 생성 (유형별)
// ══════════════════════════════════════
async function generatePollStory(type, question, slug, extraData) {
  const W = 1080, H = 1920

  // 카드 크기 줄여서 하단 공간 확보
  const cardW = 720, cardH = 960
  const cardLeft = (W - cardW) / 2
  const cardTop = 280

  const cardImg = await loadCard(slug, cardW, cardH)
  if (!cardImg) return null
  const masked = await roundImg(cardImg, cardW, cardH, 20)

  // 카드 더 선명하게
  const faded = await sharp(masked).ensureAlpha().modulate({ brightness: 0.95 }).png().toBuffer()
  const fadeMask = `<svg width="${cardW}" height="${cardH}"><rect width="${cardW}" height="${cardH}" rx="20" fill="rgba(255,255,255,0.8)"/></svg>`
  const cardFinal = await sharp(faded).composite([{ input: Buffer.from(fadeMask), blend: 'dest-in' }]).png().toBuffer()

  const stars = generateStars(12, 50, 1030, 30, 130)

  const labels = {
    poll: '오늘의 연애 질문',
    quiz: '타로 퀴즈',
    qbox: '연애 고민 상담소',
    answer: '고민 답변 타임',
    thisorthat: '이것 vs 저것',
    preview: '다음 주 미리보기',
  }
  const label = labels[type] || '오늘의 연애 질문'

  // 유형별 하단 콘텐츠
  let bottomContent = ''
  const choiceY = cardTop + cardH + 45

  if (type === 'thisorthat') {
    const optA = extraData?.optionA || '선택 A'
    const optB = extraData?.optionB || '선택 B'
    bottomContent = `
    <!-- 글래스 패널 -->
    <rect x="50" y="${choiceY - 10}" width="${W - 100}" height="180" rx="24" fill="rgba(140,130,200,0.08)" stroke="rgba(160,150,220,0.12)" stroke-width="1"/>

    <!-- 선택지 A -->
    <rect x="80" y="${choiceY + 10}" width="420" height="90" rx="18" fill="rgba(120,100,220,0.18)" stroke="rgba(140,120,240,0.45)" stroke-width="1.5"/>
    <rect x="105" y="${choiceY + 33}" width="40" height="40" rx="20" fill="rgba(140,120,240,0.35)"/>
    <text x="125" y="${choiceY + 60}" font-family="sans-serif" font-size="20" fill="rgba(210,200,255,0.95)" text-anchor="middle" font-weight="700">A</text>
    <text x="320" y="${choiceY + 63}" font-family="sans-serif" font-size="30" fill="#F0F0FF" text-anchor="middle" font-weight="400">${esc(optA)}</text>

    <!-- VS -->
    <circle cx="540" cy="${choiceY + 55}" r="24" fill="rgba(200,180,140,0.15)" stroke="rgba(200,180,140,0.3)" stroke-width="1.5"/>
    <text x="540" y="${choiceY + 63}" font-family="sans-serif" font-size="17" fill="rgba(230,210,170,0.9)" text-anchor="middle" font-weight="700">VS</text>

    <!-- 선택지 B -->
    <rect x="580" y="${choiceY + 10}" width="420" height="90" rx="18" fill="rgba(200,160,100,0.12)" stroke="rgba(220,180,120,0.4)" stroke-width="1.5"/>
    <rect x="605" y="${choiceY + 33}" width="40" height="40" rx="20" fill="rgba(220,180,120,0.3)"/>
    <text x="625" y="${choiceY + 60}" font-family="sans-serif" font-size="20" fill="rgba(250,220,170,0.95)" text-anchor="middle" font-weight="700">B</text>
    <text x="810" y="${choiceY + 63}" font-family="sans-serif" font-size="30" fill="#F0F0FF" text-anchor="middle" font-weight="400">${esc(optB)}</text>

    <!-- 안내 -->
    <text x="540" y="${choiceY + 155}" font-family="sans-serif" font-size="22" fill="rgba(180,170,220,0.55)" text-anchor="middle">↑ 투표 스티커로 골라보세요</text>`
  } else if (type === 'poll') {
    const optA = extraData?.optionA || '응'
    const optB = extraData?.optionB || '아니'
    bottomContent = `
    <rect x="50" y="${choiceY - 10}" width="${W - 100}" height="180" rx="24" fill="rgba(140,130,200,0.08)" stroke="rgba(160,150,220,0.12)" stroke-width="1"/>

    <rect x="80" y="${choiceY + 10}" width="430" height="90" rx="18" fill="rgba(120,100,220,0.18)" stroke="rgba(140,120,240,0.4)" stroke-width="1.5"/>
    <text x="295" y="${choiceY + 63}" font-family="sans-serif" font-size="30" fill="#F0F0FF" text-anchor="middle" font-weight="400">${esc(optA)}</text>

    <rect x="570" y="${choiceY + 10}" width="430" height="90" rx="18" fill="rgba(200,160,100,0.12)" stroke="rgba(220,180,120,0.35)" stroke-width="1.5"/>
    <text x="785" y="${choiceY + 63}" font-family="sans-serif" font-size="30" fill="#F0F0FF" text-anchor="middle" font-weight="400">${esc(optB)}</text>

    <text x="540" y="${choiceY + 155}" font-family="sans-serif" font-size="22" fill="rgba(180,170,220,0.55)" text-anchor="middle">↑ 투표 스티커로 참여하세요</text>`
  } else if (type === 'qbox') {
    bottomContent = `
    <rect x="100" y="${choiceY}" width="880" height="110" rx="20" fill="rgba(120,100,220,0.08)" stroke="rgba(140,120,240,0.35)" stroke-width="1.5" stroke-dasharray="10,5"/>
    <text x="540" y="${choiceY + 48}" font-family="sans-serif" font-size="28" fill="rgba(210,200,250,0.75)" text-anchor="middle" font-weight="400">고민을 보내주세요</text>
    <text x="540" y="${choiceY + 82}" font-family="sans-serif" font-size="20" fill="rgba(180,170,220,0.45)" text-anchor="middle">↑ 질문 스티커로 참여</text>`
  } else if (type === 'answer') {
    bottomContent = `
    <rect x="100" y="${choiceY}" width="880" height="110" rx="20" fill="rgba(200,170,100,0.08)" stroke="rgba(220,190,120,0.35)" stroke-width="1.5"/>
    <text x="540" y="${choiceY + 48}" font-family="sans-serif" font-size="28" fill="rgba(230,210,170,0.8)" text-anchor="middle" font-weight="400">카드를 뽑아 답변해드릴게요</text>
    <text x="540" y="${choiceY + 82}" font-family="sans-serif" font-size="20" fill="rgba(200,180,140,0.45)" text-anchor="middle">답변은 스토리에서 확인하세요</text>`
  } else if (type === 'quiz') {
    bottomContent = `
    <rect x="100" y="${choiceY}" width="880" height="110" rx="20" fill="rgba(100,160,220,0.08)" stroke="rgba(120,180,240,0.35)" stroke-width="1.5"/>
    <text x="540" y="${choiceY + 48}" font-family="sans-serif" font-size="28" fill="rgba(170,220,250,0.8)" text-anchor="middle" font-weight="400">정답을 맞혀보세요!</text>
    <text x="540" y="${choiceY + 82}" font-family="sans-serif" font-size="20" fill="rgba(140,190,220,0.45)" text-anchor="middle">↑ 퀴즈 스티커로 참여</text>`
  } else if (type === 'preview') {
    bottomContent = `
    <rect x="100" y="${choiceY}" width="880" height="110" rx="20" fill="rgba(160,140,220,0.08)" stroke="rgba(180,160,240,0.35)" stroke-width="1.5"/>
    <text x="540" y="${choiceY + 48}" font-family="sans-serif" font-size="28" fill="rgba(210,200,250,0.75)" text-anchor="middle" font-weight="400">내일 공개됩니다</text>
    <text x="540" y="${choiceY + 82}" font-family="sans-serif" font-size="20" fill="rgba(180,170,220,0.45)" text-anchor="middle">카운트다운 스티커로 알림 받기</text>`
  }

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
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="800" rx="500" ry="600" fill="url(#glow)"/>
  ${stars}
  <text x="540" y="95" font-family="sans-serif" font-size="26" fill="rgba(180,170,230,0.75)" text-anchor="middle" letter-spacing="10" font-weight="300">${esc(label)}</text>
  <line x1="380" y1="115" x2="700" y2="115" stroke="rgba(180,170,230,0.15)" stroke-width="1"/>
  <text x="540" y="210" font-family="sans-serif" font-size="50" font-weight="600" fill="#FFFFFF" text-anchor="middle">${esc(question)}</text>
  <line x1="430" y1="240" x2="650" y2="240" stroke="rgba(180,170,230,0.2)" stroke-width="1"/>
  <circle cx="540" cy="240" r="3" fill="rgba(200,180,255,0.35)"/>
  <rect x="${cardLeft - 4}" y="${cardTop - 4}" width="${cardW + 8}" height="${cardH + 8}" rx="24" fill="none" stroke="rgba(160,140,240,0.2)" stroke-width="2" filter="url(#glow1)"/>
  ${bottomContent}
</svg>`

  let result = await sharp(Buffer.from(bgSvg)).png().toBuffer()
  result = await sharp(result)
    .composite([{ input: cardFinal, left: cardLeft, top: cardTop }])
    .png({ quality: 90 }).toBuffer()

  return result
}

// ══════════════════════════════════════
// 전체 데이터
// ══════════════════════════════════════

const ALL_DAYS = [
  // Week 2: 4/14 ~ 4/19 (4/13은 content-output 폴더 없을 수 있음)
  {
    folder: '4월_14일__화_',
    story: { slug: 'empress', name: '여황제', hook: '오늘은 따뜻한 감정이\n자연스럽게 흘러나오는 날\n그 다정함이 무기예요', keywords: ['다정함', '풍요', '돌봄'] },
    poll: { type: 'qbox', question: '지금 가장 답답한 연애 상황은?', card: 'empress' },
  },
  {
    folder: '4월_15일__수_',
    story: { slug: 'fool', name: '바보', hook: '바보 카드가 나왔다면?\n나쁜 게 아니에요\n새로운 시작의 신호입니다', keywords: ['새로운 시작', '가능성', '용기'] },
    poll: { type: 'thisorthat', question: '고백은 직접? 분위기로?', card: 'fool', optionA: '직접 말한다', optionB: '분위기로 보여준다' },
  },
  {
    folder: '4월_16일__목_',
    story: { slug: 'justice', name: '정의', hook: '감정과 이성 사이에서\n균형이 필요한 하루\n한쪽으로만 기울지 마세요', keywords: ['균형', '공정', '진실'] },
    poll: { type: 'answer', question: '고민 답변 도착', card: 'justice' },
  },
  {
    folder: '4월_17일__금_',
    story: { slug: 'hanged-man', name: '매달린 사람', hook: '읽씹당하면 당신은?\n오늘 피드에서 유형 테스트\n확인해보세요', keywords: ['인내', '관점 전환', '기다림'] },
    poll: { type: 'poll', question: '읽씹 후 새벽에 후회한 적?', card: 'hanged-man', optionA: '매번...', optionB: '후회는 없다' },
  },
  {
    folder: '4월_18일__토_',
    story: { slug: 'temperance', name: '절제', hook: '기다림이 답인 날도 있어요\n조급해하지 마세요\n좋은 흐름이 오고 있어요', keywords: ['균형', '조화', '인내'] },
    poll: { type: 'qbox', question: '연애 고민 한 줄로 보내주세요', card: 'temperance' },
  },
  {
    folder: '4월_19일__일_',
    story: { slug: 'star', name: '별', hook: '다시 기대해도 괜찮아요\n오늘은 쉬어가는 날\n내일부터 새로운 한 주예요', keywords: ['희망', '치유', '따뜻함'] },
    poll: { type: 'preview', question: '다음 주 어떤 카드가 나올까?', card: 'star' },
  },
  // Week 3: 4/20 ~ 4/26
  {
    folder: '4월_20일__월_',
    story: { slug: 'high-priestess', name: '여사제', hook: '이번 주 연애운\n요일별로 뽑아봤어요\n오늘 피드에서 확인하세요', keywords: ['직관', '지혜', '내면'] },
    poll: { type: 'poll', question: '썸 탈 때 직감 믿는 편?', card: 'high-priestess', optionA: '직감 100%', optionB: '증거가 필요해' },
  },
  {
    folder: '4월_21일__화_',
    story: { slug: 'lovers', name: '연인', hook: '오늘은 마음의 소리에\n귀를 기울여보세요\n진짜 감정이 보일 거예요', keywords: ['사랑', '선택', '조화'] },
    poll: { type: 'qbox', question: '둘 사이에서 고민 중인가요?', card: 'lovers' },
  },
  {
    folder: '4월_22일__수_',
    story: { slug: 'hermit', name: '은둔자', hook: '연인 카드, 나쁜 게 아니에요\n오늘 피드에서\n진짜 의미 확인해보세요', keywords: ['성찰', '내면', '기다림'] },
    poll: { type: 'thisorthat', question: '연애할 때 나는?', card: 'hermit', optionA: '먼저 맞춰주는 편', optionB: '기다리는 편' },
  },
  {
    folder: '4월_23일__목_',
    story: { slug: 'hermit', name: '은둔자', hook: '연락이 뜸해진 게\n멀어지는 게 아닐 수 있어요\n상대의 시간을 믿어보세요', keywords: ['성찰', '내면', '기다림'] },
    poll: { type: 'answer', question: '고민 답변 도착', card: 'hermit' },
  },
  {
    folder: '4월_24일__금_',
    story: { slug: 'moon', name: '달', hook: '나는 어떤 연락 스타일?\n오늘 피드에서 타로 유형\n테스트해보세요', keywords: ['감정', '직관', '내면'] },
    poll: { type: 'poll', question: '연락 먼저 오길 기다려본 적?', card: 'moon', optionA: '자주...', optionB: '내가 먼저 한다' },
  },
  {
    folder: '4월_25일__토_',
    story: { slug: 'tower', name: '탑', hook: '갑자기 달라진 그 사람\n탑 카드가 말해줘요\n변화가 오고 있는 거예요', keywords: ['변화', '충격', '해방'] },
    poll: { type: 'qbox', question: '연애 고민 한 줄로 보내주세요', card: 'tower' },
  },
  {
    folder: '4월_26일__일_',
    story: { slug: 'moon', name: '달', hook: '지금 느끼는 감정이\n헷갈려도 괜찮아요\n달 카드가 말해줘요, 그게 진짜예요', keywords: ['감정', '직관', '내면'] },
    poll: { type: 'preview', question: '다음 주 연애운은?', card: 'moon' },
  },
  // Week 5: 4/27 ~ 5/3
  {
    folder: '4월_27일__월_',
    story: { slug: 'high-priestess', name: '여사제', hook: '이번 주 연애운\n요일별로 뽑아봤어요\n오늘 피드에서 확인하세요', keywords: ['직관', '지혜', '내면'] },
    poll: { type: 'poll', question: '이번 주 연애운 확인했어?', card: 'high-priestess', optionA: '했어!', optionB: '아직...' },
  },
  {
    folder: '4월_28일__화_',
    story: { slug: 'high-priestess', name: '여사제', hook: '불안한 직감이 들었다면\n그건 기분 탓이 아닐 수 있어요\n여사제 카드가 말해줘요', keywords: ['직관', '지혜', '내면'] },
    poll: { type: 'quiz', question: '이 카드의 의미는?', card: 'high-priestess' },
  },
  {
    folder: '4월_29일__수_',
    story: { slug: 'judgement', name: '심판', hook: '여사제 카드의 진짜 의미\n오늘 피드에서\n자세히 알려드릴게요', keywords: ['부활', '각성', '재회'] },
    poll: { type: 'thisorthat', question: '상대 속마음 알고 싶어?', card: 'judgement', optionA: '알고 싶어', optionB: '모르는 게 나아' },
  },
  {
    folder: '4월_30일__목_',
    story: { slug: 'judgement', name: '심판', hook: '끝났다고 생각한 인연이\n다시 찾아올 수도 있어요\n심판 카드가 말해줘요', keywords: ['부활', '각성', '재회'] },
    poll: { type: 'answer', question: '고민 답변 도착', card: 'judgement' },
  },
  {
    folder: '5월_1일__금_',
    story: { slug: 'star', name: '별', hook: '이별 후 나의 행동 유형은?\n오늘 피드에서 타로 유형\n테스트해보세요', keywords: ['희망', '치유', '영감'] },
    poll: { type: 'poll', question: '이별 후 연락한 적 있어?', card: 'star', optionA: '있어...', optionB: '절대 안 해' },
  },
  {
    folder: '5월_2일__토_',
    story: { slug: 'world', name: '세계', hook: '끝인 줄 알았는데\n새로운 시작일 수 있어요\n세계 카드가 말해줘요', keywords: ['완성', '성취', '여행'] },
    poll: { type: 'qbox', question: '연애 고민 보내주세요', card: 'world' },
  },
  {
    folder: '5월_3일__일_',
    story: { slug: 'star', name: '별', hook: '힘든 시간이 지나고 있어요\n별 카드가 말해줘요\n희망은 이미 오고 있어요', keywords: ['희망', '치유', '영감'] },
    poll: { type: 'preview', question: '다음 주 연애운은?', card: 'star' },
  },
]

async function main() {
  console.log(`전체 ${ALL_DAYS.length}일 스토리 재생성 시작\n`)

  let storyCount = 0, pollCount = 0

  for (const day of ALL_DAYS) {
    const storyDir = resolve(outputDir, day.folder, 'story')
    const dayDir = resolve(outputDir, day.folder)

    if (!existsSync(dayDir)) {
      console.log(`⚠️ ${day.folder} 폴더 없음, 건너뜀`)
      continue
    }

    // 아침 스토리
    if (existsSync(storyDir)) {
      const s = day.story
      const img = await generateMorningStory(s.slug, s.name, s.hook, s.keywords)
      if (img) {
        writeFileSync(resolve(storyDir, 'story.png'), img)
        storyCount++
        console.log(`✅ ${day.folder} story.png`)
      }
    }

    // 저녁 poll-story
    const p = day.poll
    const extra = { optionA: p.optionA, optionB: p.optionB }
    const pollImg = await generatePollStory(p.type, p.question, p.card, extra)
    if (pollImg) {
      writeFileSync(resolve(dayDir, 'poll-story.png'), pollImg)
      pollCount++
      console.log(`✅ ${day.folder} poll-story.png (${p.type})`)
    }
  }

  console.log(`\n완료! story: ${storyCount}개, poll-story: ${pollCount}개`)
}

main().catch(console.error)
