/**
 * 인스타 고정 게시물용 무료 콘텐츠 안내 캐러셀 (6장, 1080×1350)
 *
 * 프로필 고정 3칸 중 3번 칸. 1번은 전자책(generate-carousel-ebook.mjs),
 * 2번은 1:1 리딩(generate-carousel-premium.mjs)이고 액자·판형·타입 위계를 공유한다.
 *
 * ⚠️ 색 규칙이 앞의 둘과 다르다. lovtaro 는 **골드를 프리미엄 전용**으로 쓰기로 정해져
 * 있다(일반 카드·CTA·뱃지는 블루 계열 #4DA3FF / #8FD3FF). 이 캐러셀은 무료 콘텐츠라
 * 항목명·강조를 전부 블루로 간다. 골드는 액자·워드마크·영문 라벨에만 남겼는데,
 * 그건 UI 요소가 아니라 브랜드 장식이라 예외로 승인된 범위다.
 * 결과적으로 고정 3칸이 나란히 걸리면 **골드=유료 / 블루=무료** 가 색만으로 읽힌다.
 * 여기에 골드 뱃지를 추가하지 말 것 - 프리미엄 시그널이 희석된다.
 *
 * 모든 개수는 코드에서 직접 센 값이다(2026-08-31 기준).
 *   리딩 8종  = router 의 /reading/* 7개 + /today
 *   테스트 5종 = src/data/tests/index.js 의 TESTS 배열
 *   카드 78장 = tarotCards.js 22 + minorArcana.js 56
 *   꿈해몽 82편 / 가이드 96편 = 각 index.js 의 import 수
 * 콘텐츠가 늘면 COUNTS 만 고치는 게 아니라 위 파일들을 다시 세어야 한다.
 * 특히 꿈해몽은 매일 1편씩 늘어나므로 게시 직전에 다시 셀 것.
 *
 * 리딩·테스트 이름은 LinkPage.vue 의 label 을 그대로 쓴다. 프로필 링크를 눌렀을 때
 * 보이는 이름과 캐러셀의 이름이 다르면 "그 타로 어디 있지" 가 된다.
 *
 * 아트 선택 근거:
 *  - slide01 바보 = 봇짐을 메고 첫걸음을 떼는 청년 여행자. "처음 와보는 사람" 이라는
 *    이 칸의 타깃과 의미가 맞는다. 처음엔 태양을 썼는데 주인공이 아이인 데다
 *    화면이 온통 주황이라, 20~30대 여성 연애 계정 톤과 딥네이비 브랜드 색에서
 *    둘 다 벗어나 교체했다(렌더 대조 후 판단). 바보는 딥퍼플·별하늘이라 맞는다
 *  - slide06 세계 = 화환 안에서 춤추는 인물 + 네 모서리 생물. "전부 여기 있어요" 라는
 *    마지막 장의 뜻과 맞는다. 하단이 길·물이라 CTA 텍스트 자리가 빈다
 *  - 유료 캐러셀이 쓴 카드(컵 에이스·컵2·컵6·컵8·여사제·펜타클 에이스·별)는 전부 피했다
 *
 * 폰트는 앞의 둘과 동일하게 ~/.local/share/fonts/lovtaro 설치본이 필요하다.
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/free-carousel')

const W = 1080, H = 1350
const M = 56
const PAD = 54
const X = M + PAD        // 110
const XR = W - M - PAD   // 970

const DISPLAY = 'Cinzel'
const LABEL = 'Cormorant Garamond Light'
const SERIF_KR = 'Noto Serif KR'
const SANS_KR = 'Noto Sans KR'

// 브랜드 장식(액자·워드마크·영문 라벨) 전용
const GOLD = '#D9BE83'
const GOLD_DIM = 'rgba(212,184,122,0.58)'
const RULE = 'rgba(212,184,122,0.24)'
const RULE_FAINT = 'rgba(212,184,122,0.13)'
// 무료 항목 강조용 (variables.css 의 --lt-accent-2 / --lt-accent-3)
const BLUE = '#8FD3FF'
const BLUE_DIM = 'rgba(77,163,255,0.62)'
const TEXT = '#F2F5FF'
const SUB = 'rgba(214,206,246,0.7)'
const MUTED = 'rgba(196,188,232,0.44)'

/** 코드에서 센 값. 게시 직전 재확인 대상 */
const COUNTS = { readings: 8, tests: 5, cards: 78, dreams: 82, guides: 96 }

/** LinkPage.vue 의 label 과 동일하게 유지할 것 */
const READINGS = [
  '상대방 속마음 타로', '연락 올까 타로',
  '재회 가능성 타로', '러브타로 스프레드',
  'Yes/No 타로', '궁합 타로',
  '3카드 리딩', '오늘의 연애 카드',
]

/** src/data/tests/*.js 의 title 원문 */
const TESTS = [
  ['내 운명의 상대는?', '이상형 타로'],
  ['내 연애 스타일은?', '연애 스타일'],
  ['짝사랑할 때 나는?', '짝사랑'],
  ['MBTI 연애 테스트', 'MBTI 연애'],
  ['전생에 나는?', '전생 연애'],
]

/** 02 그리드용. 유료 캐러셀이 쓴 카드와 겹치지 않는 메이저 8장(전부 1024×1536 = 2:3) */
const GRID_CARDS = [
  'lovers', 'moon', 'empress', 'magician',
  'temperance', 'strength', 'wheel-of-fortune', 'judgement',
]

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function frame() {
  const x2 = W - M, y2 = H - M
  const t = 26
  return `
  <rect x="${M}" y="${M}" width="${W - M * 2}" height="${H - M * 2}" fill="none" stroke="${RULE}" stroke-width="1"/>
  <path d="M${M} ${M + t} L${M} ${M} L${M + t} ${M}" fill="none" stroke="${GOLD_DIM}" stroke-width="2"/>
  <path d="M${x2 - t} ${M} L${x2} ${M} L${x2} ${M + t}" fill="none" stroke="${GOLD_DIM}" stroke-width="2"/>
  <path d="M${M} ${y2 - t} L${M} ${y2} L${M + t} ${y2}" fill="none" stroke="${GOLD_DIM}" stroke-width="2"/>
  <path d="M${x2 - t} ${y2} L${x2} ${y2} L${x2} ${y2 - t}" fill="none" stroke="${GOLD_DIM}" stroke-width="2"/>`
}

function wordmark(y, size = 22, ls = 11, fill = GOLD_DIM) {
  return `<text x="${W / 2}" y="${y}" font-family="${DISPLAY}" font-size="${size}" letter-spacing="${ls}" fill="${fill}" text-anchor="middle">LOVTARO</text>`
}

function stars(count, xMin, xMax, yMin, yMax) {
  const seed = [0.12, 0.87, 0.34, 0.56, 0.78, 0.23, 0.91, 0.45, 0.67, 0.09, 0.38, 0.72, 0.15, 0.83, 0.51]
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const r = 0.8 + seed[(i + 3) % seed.length] * 1.6
    const o = 0.16 + seed[(i + 5) % seed.length] * 0.4
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="rgba(255,255,255,${o.toFixed(2)})"/>`
  }
  return out
}

async function artBand(slug, h, focus = 0.5, brightness = 1, focusX = 0.5) {
  const src = resolve(cardsDir, `${slug}.png`)
  const meta = await sharp(src).metadata()
  const scale = Math.max(W / meta.width, h / meta.height)
  const rw = Math.round(meta.width * scale)
  const rh = Math.round(meta.height * scale)
  const resized = await sharp(src).resize(rw, rh).toBuffer()
  const top = Math.max(0, Math.min(rh - h, Math.round((rh - h) * focus)))
  const left = Math.max(0, Math.min(rw - W, Math.round((rw - W) * focusX)))
  const cropped = await sharp(resized).extract({ left, top, width: W, height: h }).toBuffer()
  return brightness === 1 ? cropped : sharp(cropped).modulate({ brightness }).png().toBuffer()
}

async function panelBase(extra = '') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0%" stop-color="#0B0A20"/>
      <stop offset="45%" stop-color="#0D0C24"/>
      <stop offset="100%" stop-color="#06050E"/>
    </linearGradient>
    <radialGradient id="gl" cx="50%" cy="34%" r="52%">
      <stop offset="0%" stop-color="rgba(126,168,222,0.11)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="470" rx="540" ry="540" fill="url(#gl)"/>
  ${extra}
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function write(name, buf) {
  writeFileSync(resolve(outputDir, name), buf)
  console.log(`✅ ${name} (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function compose(base, overlaySvg) {
  return sharp(base).composite([{ input: Buffer.from(overlaySvg), left: 0, top: 0 }]).png().toBuffer()
}

async function coverSlide({ slug, filename, brightness, scrimFrom, body, focus = 0.5, focusX = 0.5 }) {
  const art = await artBand(slug, H, focus, brightness, focusX)
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sc" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(6,5,16,0)"/>
      <stop offset="34%" stop-color="rgba(7,6,20,0.72)"/>
      <stop offset="58%" stop-color="rgba(6,5,17,0.93)"/>
      <stop offset="100%" stop-color="rgba(5,4,13,0.985)"/>
    </linearGradient>
    <linearGradient id="tp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(6,5,16,0.72)"/>
      <stop offset="100%" stop-color="rgba(6,5,16,0)"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${W}" height="300" fill="url(#tp)"/>
  <rect x="0" y="${scrimFrom}" width="${W}" height="${H - scrimFrom}" fill="url(#sc)"/>
  ${body}
  ${frame()}
  </svg>`
  await write(filename, await compose(await sharp(art).png().toBuffer(), overlay))
}

// ── 01 표지: 훅 ───────────────────────────────────────────────
async function slide01() {
  const body = `
  ${wordmark(134)}
  <text x="${W / 2}" y="994" font-family="${LABEL}" font-size="34" font-style="italic" letter-spacing="1" fill="${GOLD}" text-anchor="middle">Free to try</text>
  <text x="${W / 2}" y="1076" font-family="${SERIF_KR}" font-size="47" fill="${TEXT}" text-anchor="middle">여기까지는</text>
  <text x="${W / 2}" y="1140" font-family="${SERIF_KR}" font-size="47" fill="${TEXT}" text-anchor="middle">전부 무료예요</text>
  <line x1="470" y1="1186" x2="610" y2="1186" stroke="${RULE}" stroke-width="1"/>
  <text x="${W / 2}" y="1224" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${SUB}" text-anchor="middle">가입도 결제도 없이 바로 볼 수 있어요</text>
  <text x="${W / 2}" y="1270" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}" text-anchor="middle">스와이프해서 확인하세요 →</text>`
  await coverSlide({ slug: 'fool', filename: 'slide01.png', brightness: 0.94, scrimFrom: 520, focus: 0.45, body })
}

// ── 02 카드 사전: 실제 카드 8장 그리드 ────────────────────────
// 리스트가 세 장 연달아 나오면 넘길 이유가 없어져서, 가장 큰 무료 자산인 카드 사전을
// 두 번째에 두고 그림으로 보여준다. 메이저 8장은 전부 1024×1536(2:3)이라
// 200×300 으로 잘라도 비율 왜곡이 없다. 마이너(1200×630)를 섞으면 격자가 깨진다.
async function slide02() {
  const base = await panelBase(stars(12, 110, 970, 150, 300))

  const CW = 200, CH = 300, GAP = 20
  const gx = X, gy = 470
  const layers = []
  for (let i = 0; i < GRID_CARDS.length; i++) {
    const buf = await sharp(resolve(cardsDir, `${GRID_CARDS[i]}.png`))
      .resize(CW, CH, { fit: 'cover' }).modulate({ brightness: 1.02 }).png().toBuffer()
    const bordered = await sharp(buf)
      .extend({ top: 1, bottom: 1, left: 1, right: 1, background: { r: 143, g: 211, b: 255, alpha: 0.34 } })
      .png().toBuffer()
    layers.push({
      input: bordered,
      left: gx + (i % 4) * (CW + GAP),
      top: gy + Math.floor(i / 4) * (CH + GAP),
    })
  }
  const withGrid = await sharp(base).composite(layers).png().toBuffer()

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${wordmark(136)}
  <text x="${X}" y="290" font-family="${LABEL}" font-size="32" font-style="italic" letter-spacing="3" fill="${GOLD}">Card dictionary</text>
  <text x="${X}" y="360" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">카드 <tspan fill="${BLUE}">${COUNTS.cards}장</tspan> 사전</text>
  <text x="${X}" y="410" font-family="${SANS_KR}" font-size="23" font-weight="300" fill="${SUB}">메이저 22장 · 마이너 56장 전부 있어요</text>
  <line x1="${X}" y1="440" x2="${XR}" y2="440" stroke="${RULE_FAINT}" stroke-width="1"/>
  <line x1="${X}" y1="1150" x2="${XR}" y2="1150" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X}" y="1200" font-family="${SANS_KR}" font-size="24" font-weight="300" fill="${SUB}">정방향과 역방향, 연애 해석과 조언까지</text>
  <text x="${X}" y="1244" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}">카드 이름으로 검색해서 바로 찾아볼 수 있어요</text>
  ${frame()}
  </svg>`

  await write('slide02.png', await compose(withGrid, overlay))
}

// ── 03 무료 리딩 8종: 2열 조밀 리스트 ─────────────────────────
async function slide03() {
  const base = await panelBase(stars(14, 110, 970, 150, 340))

  const COL = 430
  const rows = READINGS.map((name, i) => {
    const cx = X + (i % 2) * COL
    const cy = 560 + Math.floor(i / 2) * 132
    return `
  <circle cx="${cx + 7}" cy="${cy - 9}" r="4" fill="${BLUE_DIM}"/>
  <text x="${cx + 30}" y="${cy}" font-family="${SANS_KR}" font-size="28" font-weight="300" fill="${BLUE}">${esc(name)}</text>
  <line x1="${cx}" y1="${cy + 40}" x2="${cx + COL - 60}" y2="${cy + 40}" stroke="${RULE_FAINT}" stroke-width="1"/>`
  }).join('\n  ')

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${wordmark(136)}
  <text x="${X}" y="398" font-family="${LABEL}" font-size="32" font-style="italic" letter-spacing="3" fill="${GOLD}">Free readings</text>
  <text x="${X}" y="468" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">무료 리딩 <tspan fill="${BLUE}">${COUNTS.readings}종</tspan></text>
  <line x1="${X}" y1="512" x2="${XR}" y2="512" stroke="${RULE}" stroke-width="1"/>
  ${rows}
  <line x1="${X}" y1="1146" x2="${XR}" y2="1146" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X}" y="1196" font-family="${SANS_KR}" font-size="24" font-weight="300" fill="${SUB}">고민 종류를 고르면 카드를 뽑고 바로 읽어줘요</text>
  <text x="${X}" y="1240" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}">결과는 이미지로 저장하거나 링크로 공유할 수 있어요</text>
  ${frame()}
  </svg>`

  await write('slide03.png', await compose(base, overlay))
}

// ── 04 심리테스트 5종: 1열 여유 리스트 ────────────────────────
// 03 과 같은 리스트지만 열 수와 밀도를 바꿔 넘길 때 다른 화면으로 읽히게 한다
async function slide04() {
  const base = await panelBase(stars(12, 110, 970, 150, 340))

  const rows = TESTS.map(([title, tag], i) => {
    const y = 588 + i * 118
    return `
  <text x="${X}" y="${y}" font-family="${DISPLAY}" font-size="28" fill="${BLUE_DIM}">0${i + 1}</text>
  <text x="${X + 76}" y="${y}" font-family="${SANS_KR}" font-size="30" font-weight="300" fill="${BLUE}">${esc(title)}</text>
  <text x="${X + 76}" y="${y + 40}" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}">${esc(tag)}</text>
  <line x1="${X}" y1="${y + 66}" x2="${XR}" y2="${y + 66}" stroke="${RULE_FAINT}" stroke-width="1"/>`
  }).join('\n  ')

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${wordmark(136)}
  <text x="${X}" y="420" font-family="${LABEL}" font-size="32" font-style="italic" letter-spacing="3" fill="${GOLD}">Love quiz</text>
  <text x="${X}" y="490" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">연애 심리테스트 <tspan fill="${BLUE}">${COUNTS.tests}종</tspan></text>
  <line x1="${X}" y1="534" x2="${XR}" y2="534" stroke="${RULE}" stroke-width="1"/>
  ${rows}
  <text x="${X}" y="1240" font-family="${SANS_KR}" font-size="23" font-weight="300" fill="${SUB}">질문 몇 개에 답하면 결과 카드가 나와요</text>
  ${frame()}
  </svg>`

  await write('slide04.png', await compose(base, overlay))
}

// ── 05 읽을거리: 꿈해몽 · 가이드 2블록 ────────────────────────
async function slide05() {
  const base = await panelBase(stars(12, 110, 970, 150, 320))

  const BH = 250
  const blocks = [
    { n: COUNTS.dreams, unit: '편', ko: '꿈해몽 사전', d1: '전 애인 꿈, 좋아하는 사람 꿈처럼', d2: '연애와 얽힌 꿈을 찾아 읽어요' },
    { n: COUNTS.guides, unit: '편', ko: '연애 타로 가이드', d1: '카드 읽는 법부터 상황별 해석까지', d2: '타로가 처음이어도 따라올 수 있어요' },
  ].map((b, i) => {
    const by = 520 + i * (BH + 34)
    return `
  <rect x="${X}" y="${by}" width="${XR - X}" height="${BH}" rx="10" fill="rgba(255,255,255,0.028)" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X + 34}" y="${by + 74}" font-family="${SERIF_KR}" font-size="42" fill="${BLUE}">${b.n}<tspan font-size="26">${b.unit}</tspan></text>
  <text x="${X + 34}" y="${by + 128}" font-family="${SERIF_KR}" font-size="32" fill="${TEXT}">${esc(b.ko)}</text>
  <text x="${X + 34}" y="${by + 178}" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${SUB}">${esc(b.d1)}</text>
  <text x="${X + 34}" y="${by + 212}" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${SUB}">${esc(b.d2)}</text>`
  }).join('\n  ')

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${wordmark(136)}
  <text x="${X}" y="390" font-family="${LABEL}" font-size="32" font-style="italic" letter-spacing="3" fill="${GOLD}">Reading room</text>
  <text x="${X}" y="460" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">읽을거리도 있어요</text>
  <line x1="${X}" y1="504" x2="${XR}" y2="504" stroke="${RULE}" stroke-width="1"/>
  ${blocks}
  <text x="${X}" y="1248" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}">꿈해몽은 매일 한 편씩 늘어나요</text>
  ${frame()}
  </svg>`

  await write('slide05.png', await compose(base, overlay))
}

// ── 06 뒷표지: CTA ───────────────────────────────────────────
async function slide06() {
  const body = `
  <text x="${W / 2}" y="946" font-family="${DISPLAY}" font-size="42" letter-spacing="16" fill="${GOLD}" text-anchor="middle">LOVTARO</text>
  <text x="${W / 2}" y="1002" font-family="${SERIF_KR}" font-size="25" fill="${SUB}" text-anchor="middle">감정의 흐름을 읽는 타로</text>
  <line x1="440" y1="1046" x2="640" y2="1046" stroke="${RULE}" stroke-width="1"/>
  <text x="${W / 2}" y="1110" font-family="${SERIF_KR}" font-size="42" fill="${TEXT}" text-anchor="middle">프로필 링크에 다 있어요</text>
  <text x="${W / 2}" y="1158" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${BLUE}" text-anchor="middle">가입 없이 바로 볼 수 있어요</text>
  <text x="${W / 2}" y="1212" font-family="${SANS_KR}" font-size="23" font-weight="300" fill="${SUB}" text-anchor="middle">리딩 ${COUNTS.readings}종 · 카드 ${COUNTS.cards}장 · 심리테스트 ${COUNTS.tests}종</text>
  <text x="${W / 2}" y="1258" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}" text-anchor="middle">더 깊게 보고 싶으면 고정 게시물 두 개를 참고하세요</text>`
  await coverSlide({ slug: 'world', filename: 'slide06.png', brightness: 0.92, scrimFrom: 500, focus: 0.4, body })
}

function assertFonts() {
  let installed = ''
  try {
    installed = execSync('fc-list', { encoding: 'utf8' })
  } catch {
    console.warn('⚠️ fc-list 를 실행할 수 없어 폰트 확인을 건너뜁니다')
    return
  }
  const missing = ['Cinzel', 'Cormorant Garamond', 'Noto Serif KR', 'Noto Sans KR']
    .filter((f) => !installed.includes(f))
  if (missing.length) {
    console.error(`❌ 폰트 미설치: ${missing.join(', ')}`)
    process.exit(1)
  }
}

async function main() {
  console.log('=== 인스타 고정 게시물용 무료 콘텐츠 캐러셀 6장 ===')
  assertFonts()
  mkdirSync(outputDir, { recursive: true })
  await slide01()   // 표지 - 훅
  await slide02()   // 카드 78장 사전 (그리드)
  await slide03()   // 무료 리딩 8종
  await slide04()   // 심리테스트 5종
  await slide05()   // 꿈해몽 · 가이드
  await slide06()   // 뒷표지 - CTA
  console.log(`완료 → ${outputDir}`)
}

main().catch((err) => { console.error('❌:', err); process.exit(1) })
