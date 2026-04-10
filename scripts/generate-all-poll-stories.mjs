/**
 * 전체 날짜 저녁 스토리 이미지 + 캡션 일괄 생성
 * 유형: 투표, 퀴즈, 질문박스, 질문답변, This or That, 예고
 * 실행: node scripts/generate-all-poll-stories.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output')

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function ensureDir(d) { if (!existsSync(d)) mkdirSync(d, { recursive: true }) }

async function loadCard(slug, w, h) {
  const p = resolve(cardsDir, `${slug}.png`)
  if (!existsSync(p)) { console.log(`⚠️ 카드 없음: ${slug}`); return null }
  return sharp(p).resize(w, h, { fit: 'cover' }).toBuffer()
}

async function roundImg(buf, w, h, r) {
  const m = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  return sharp(buf).composite([{ input: Buffer.from(m), blend: 'dest-in' }]).png().toBuffer()
}

async function makeCardOverlay(slug, W, H, cardW, cardH, topY, opacity) {
  const cardImg = await loadCard(slug, cardW, cardH)
  if (!cardImg) return null
  const masked = await roundImg(cardImg, cardW, cardH, 20)
  const faded = await sharp(masked).ensureAlpha().modulate({ brightness: 0.7 }).png().toBuffer()
  const mask = `<svg width="${cardW}" height="${cardH}"><rect width="${cardW}" height="${cardH}" rx="20" fill="rgba(255,255,255,${opacity})"/></svg>`
  const final = await sharp(faded).composite([{ input: Buffer.from(mask), blend: 'dest-in' }]).png().toBuffer()
  return { input: final, left: Math.round((W - cardW) / 2), top: topY }
}

async function generateImage(type, question, cardSlug) {
  const W = 1080, H = 1920

  // 유형별 상단 라벨
  const labels = {
    poll: '오늘의 연애 질문',
    quiz: '타로 퀴즈',
    qbox: '연애 고민 상담소',
    answer: '고민 답변 타임',
    thisorthat: '이것 vs 저것',
    preview: '다음 주 미리보기',
  }

  const label = labels[type] || '오늘의 연애 질문'

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

  <text x="540" y="120" font-family="sans-serif" font-size="20" fill="rgba(77,163,255,0.5)" text-anchor="middle" letter-spacing="6">${esc(label)}</text>

  <text x="540" y="240" font-family="sans-serif" font-size="44" font-weight="300" fill="#F4F8FF" text-anchor="middle">${esc(question)}</text>

  <line x1="380" y1="1770" x2="700" y2="1770" stroke="rgba(77,163,255,0.1)" stroke-width="1"/>
  <text x="540" y="1810" font-family="sans-serif" font-size="20" fill="rgba(143,211,255,0.45)" text-anchor="middle">무료로 직접 뽑아보기 · lovtaro.kr</text>
  <text x="540" y="1845" font-family="sans-serif" font-size="16" fill="rgba(143,211,255,0.25)" text-anchor="middle">@lovtarot_</text>
</svg>`

  let result = await sharp(Buffer.from(bgSvg)).png().toBuffer()

  const overlay = await makeCardOverlay(cardSlug, W, H, 700, 1050, 520, 0.35)
  if (overlay) {
    result = await sharp(result).composite([overlay]).png({ quality: 90 }).toBuffer()
  }

  return result
}

// ── 스케줄 데이터 ──
const DAYS = [
  {
    dir: '4월_11일1', date: '4월 11일 일', type: 'quiz', card: 'wheel-of-fortune',
    question: '이 카드의 이름은?',
    caption: `[저녁 퀴즈 스토리 - 4월 11일 일]
카드: Wheel of Fortune - 운명의 수레바퀴

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 퀴즈 스티커 → "이 타로 카드의 이름은?" 정답: 운명의 수레바퀴
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 퀴즈 정답 맞히면 DM 자동 전송됨. 정답률 보고 다음 퀴즈 난이도 조절`
  },
  {
    dir: '4월_12일1', date: '4월 12일 월', type: 'qbox', card: 'magician',
    question: '연애 고민 보내주세요',
    caption: `[저녁 질문박스 스토리 - 4월 12일 월]
카드: The Magician - 마법사

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 질문 스티커 → "지금 가장 궁금한 연애 고민은?" (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 질문 오면 16일 답변 스토리에서 카드 뽑아서 답하기. 익명이라 참여율 높음`
  },
  {
    dir: '4월_13일__월_', date: '4월 13일 월', type: 'poll', card: 'fool',
    question: '이번 주 연애운 확인했어?',
    caption: `[저녁 투표 스토리 - 4월 13일 월]
카드: The Fool - 바보

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 투표 스티커 → "했어!" vs "아직..." (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: "아직" 선택한 사람이 사이트 유입 타겟. 결과 나오면 다음날 공유`
  },
  {
    dir: '4월_14일__화_', date: '4월 14일 화', type: 'qbox', card: 'empress',
    question: '지금 가장 답답한 연애 상황은?',
    caption: `[저녁 질문박스 스토리 - 4월 14일 화]
카드: The Empress - 여황제

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 질문 스티커 → "지금 가장 답답한 연애 상황은?" (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 답변은 16일 스토리에서. 고민 많이 오면 릴스 콘텐츠로도 활용`
  },
  {
    dir: '4월_15일__수_', date: '4월 15일 수', type: 'thisorthat', card: 'fool',
    question: '고백은 직접? 분위기로?',
    caption: `[저녁 This or That 스토리 - 4월 15일 수]
카드: The Fool - 바보

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 투표 스티커 → "직접 말한다" vs "분위기로 보여준다" (카드 아래 공간에 배치)
   - 이모지 슬라이더 → "고백 성공 자신감은?" (하트 이모지, 투표 아래)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 투표 + 슬라이더 조합이 인터랙션 최고. 스티커 2개까지만`
  },
  {
    dir: '4월_16일__목_', date: '4월 16일 목', type: 'answer', card: 'justice',
    question: '고민 답변 도착',
    caption: `[저녁 답변 스토리 - 4월 16일 목]
카드: Justice - 정의

1) poll-story.png를 인스타 스토리에 업로드
2) 14일 질문박스에서 온 고민 1-2개 선택
3) 스티커 추가:
   - 고민 텍스트를 텍스트 스티커로 추가
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
4) 공유

팁: 답변 스토리는 질문자가 다시 보러 옴. 리텐션 효과`
  },
  {
    dir: '4월_17일__금_', date: '4월 17일 금', type: 'poll', card: 'hanged-man',
    question: '읽씹 후 새벽에 후회한 적?',
    caption: `[저녁 투표 스토리 - 4월 17일 금]
카드: The Hanged Man - 매달린 사람

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 투표 스티커 → "매번..." vs "후회는 없다" (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 금요일 저녁은 감성 터지는 시간. 공감형 질문이 효과적`
  },
  {
    dir: '4월_18일__토_', date: '4월 18일 토', type: 'qbox', card: 'temperance',
    question: '연애 고민 한 줄로 보내주세요',
    caption: `[저녁 질문박스 스토리 - 4월 18일 토]
카드: Temperance - 절제

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 질문 스티커 → "연애 고민 한 줄로 보내주세요" (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 주말이라 참여율 높음. 다음 주 릴스 콘텐츠로 활용`
  },
  {
    dir: '4월_19일__일_', date: '4월 19일 일', type: 'preview', card: 'star',
    question: '다음 주 어떤 카드가 나올까?',
    caption: `[저녁 예고 스토리 - 4월 19일 일]
카드: The Star - 별

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 카운트다운 스티커 → "다음 주 연애운 공개" (내일 10:00)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 카운트다운 스티커 누르면 알림 설정됨. 내일 유입으로 연결`
  },
  {
    dir: '4월_20일__월_', date: '4월 20일 월', type: 'poll', card: 'high-priestess',
    question: '썸 탈 때 직감 믿는 편?',
    caption: `[저녁 투표 스토리 - 4월 20일 월]
카드: The High Priestess - 여사제

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 투표 스티커 → "직감 100%" vs "증거가 필요해" (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 여사제 카드와 직감 질문이 잘 맞음. 카드 분위기 활용`
  },
  {
    dir: '4월_21일__화_', date: '4월 21일 화', type: 'qbox', card: 'lovers',
    question: '둘 사이에서 고민 중인가요?',
    caption: `[저녁 질문박스 스토리 - 4월 21일 화]
카드: The Lovers - 연인

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 질문 스티커 → "지금 가장 답답한 연애 상황은?" (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 연인 카드 배경이라 선택/고민 질문과 시너지`
  },
  {
    dir: '4월_22일__수_', date: '4월 22일 수', type: 'thisorthat', card: 'hermit',
    question: '연애할 때 나는?',
    caption: `[저녁 This or That 스토리 - 4월 22일 수]
카드: The Hermit - 은둔자

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 투표 스티커 → "먼저 맞춰주는 편" vs "맞춰주길 기다리는 편" (카드 아래 공간에 배치)
   - 이모지 슬라이더 → "혼자만의 시간 필요한 정도?" (달 이모지)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 은둔자 카드 = 혼자만의 시간. 질문과 카드 무드 매칭`
  },
  {
    dir: '4월_23일__목_', date: '4월 23일 목', type: 'answer', card: 'hermit',
    question: '고민 답변 도착',
    caption: `[저녁 답변 스토리 - 4월 23일 목]
카드: The Hermit - 은둔자

1) poll-story.png를 인스타 스토리에 업로드
2) 21일 질문박스에서 온 고민 1-2개 선택
3) 스티커 추가:
   - 고민 텍스트를 텍스트 스티커로 추가
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
4) 공유

팁: 답변할 때 카드 한 장 뽑아서 같이 보여주면 콘텐츠 퀄리티 UP`
  },
  {
    dir: '4월_24일__금_', date: '4월 24일 금', type: 'poll', card: 'moon',
    question: '연락 먼저 오길 기다려본 적?',
    caption: `[저녁 투표 스토리 - 4월 24일 금]
카드: The Moon - 달

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 투표 스티커 → "자주..." vs "내가 먼저 한다" (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 달 카드 = 불안/기다림. 금요일 밤 감성과 찰떡`
  },
  {
    dir: '4월_25일__토_', date: '4월 25일 토', type: 'qbox', card: 'tower',
    question: '연애 고민 한 줄로 보내주세요',
    caption: `[저녁 질문박스 스토리 - 4월 25일 토]
카드: The Tower - 탑

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 질문 스티커 → "연애 고민 한 줄로 보내주세요" (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 주말 질문 수집 → 다음 주 답변/릴스 콘텐츠로 재활용`
  },
  {
    dir: '4월_26일__일_', date: '4월 26일 일', type: 'preview', card: 'moon',
    question: '다음 주 연애운은?',
    caption: `[저녁 예고 스토리 - 4월 26일 일]
카드: The Moon - 달

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 카운트다운 스티커 → "다음 주 연애운 공개" (내일 10:00)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 카운트다운 알림 → 월요일 아침 스토리 유입으로 연결`
  },
  {
    dir: '4월_27일__월_', date: '4월 27일 월', type: 'poll', card: 'high-priestess',
    question: '이번 주 연애운 확인했어?',
    caption: `[저녁 투표 스토리 - 4월 27일 월]
카드: The High Priestess - 여사제

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 투표 스티커 → "했어!" vs "아직..." (카드 아래 공간에 배치)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 매주 월요일 반복 패턴. 팔로워가 습관적으로 참여하게 됨`
  },
  {
    dir: '4월_28일__화_', date: '4월 28일 화', type: 'quiz', card: 'high-priestess',
    question: '이 카드의 의미는?',
    caption: `[저녁 퀴즈 스토리 - 4월 28일 화]
카드: The High Priestess - 여사제

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 퀴즈 스티커 → "이 카드의 의미는?" 정답: 직관과 내면의 지혜
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 카드 이름이 아닌 '의미' 퀴즈로 변주. 타로 지식 전달 효과`
  },
  {
    dir: '4월_29일__수_', date: '4월 29일 수', type: 'thisorthat', card: 'judgement',
    question: '상대 속마음 알고 싶어?',
    caption: `[저녁 This or That 스토리 - 4월 29일 수]
카드: Judgement - 심판

1) poll-story.png를 인스타 스토리에 업로드
2) 스티커 추가:
   - 투표 스티커 → "알고 싶어" vs "모르는 게 나아" (카드 아래 공간에 배치)
   - 이모지 슬라이더 → "직감 vs 논리, 나는?" (크리스탈볼 이모지)
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
3) 공유

팁: 심판 카드 = 결단. 선택형 질문과 잘 맞음`
  },
  {
    dir: '4월_30일__목_', date: '4월 30일 목', type: 'answer', card: 'judgement',
    question: '고민 답변 도착',
    caption: `[저녁 답변 스토리 - 4월 30일 목]
카드: Judgement - 심판

1) poll-story.png를 인스타 스토리에 업로드
2) 28일 질문박스에서 온 고민 1-2개 선택
3) 스티커 추가:
   - 고민 텍스트를 텍스트 스티커로 추가
   - 링크 스티커 → lovtaro.kr
   - @lovtarot_ 멘션
4) 공유

팁: 4월 마지막 답변. "5월 연애운도 곧 공개" 예고 텍스트 추가하면 좋음`
  },
]

async function main() {
  console.log(`🎴 총 ${DAYS.length}일 저녁 스토리 생성 시작\n`)

  for (const day of DAYS) {
    const dayDir = resolve(outputDir, day.dir)
    ensureDir(dayDir)

    try {
      const img = await generateImage(day.type, day.question, day.card)
      writeFileSync(resolve(dayDir, 'poll-story.png'), img)
      writeFileSync(resolve(dayDir, 'poll-story.txt'), day.caption)
      console.log(`✅ ${day.date} (${day.type}) 완료`)
    } catch (e) {
      console.log(`❌ ${day.date} 실패: ${e.message}`)
    }
  }

  console.log('\n🎉 전체 완료!')
}

main().catch(console.error)
