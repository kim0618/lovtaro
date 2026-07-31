/**
 * 인스타 고정 게시물용 상품 안내 캐러셀 (7장, 1080×1350)
 *
 * ⚠️ 주간 콘텐츠 캐러셀(generate-carousel-{date}.mjs)과 의도적으로 다른 포맷이다.
 * 주간물은 "풀배경 + 중앙정렬"이 확정안이지만, 이건 프로필에 상시 걸리는 상품
 * 안내라서 주간물과 같은 골격을 쓰면 그냥 지난 게시물처럼 읽힌다. 주간 템플릿은
 * 건드리지 않았다.
 *
 * 2번째 장에 편지 실물을 넣는다. 문서형 상품인데 문서를 안 보여주면 "5페이지 편지"는
 * 그냥 주장으로 남는다. 가격 슬라이드보다 앞에 둬서 "이런 걸 받는다"가 먼저 오게 했다.
 *
 * 지면 소재 = premium/page/sample/neutral-p*.jpg.
 * 수신자명을 전부 "○○ 님"으로 바꾼 sample-neutral.html 을 렌더한 것이다. 이름이 읽히면
 * 보는 사람에게는 남의 편지로 읽혀서, 사연을 맡기기 전에 오히려 망설이게 만든다.
 * ○○ 로 두면 "이름은 가립니다" 라는 신호가 되어 반대로 작동한다.
 * premium/output 의 실제 고객 편지는 PII 라 절대 쓰지 않는다.
 *
 * 지면 다시 뽑는 법 (premium/ 에서):
 *   Chrome 으로 template/sample-neutral.html → PDF → PyMuPDF 로 페이지 래스터
 *   (scripts/generate-pdf.sh 와 같은 Windows Chrome 경로를 쓴다)
 *
 * 고급감을 만드는 장치 4개:
 *  1) 금박 헤어라인 액자 + 코너 틱 - 떠 있는 라운드 카드 대신 판형을 만든다
 *  2) 브랜드 디스플레이 폰트 실사용 - Cinzel(수치·워드마크), Cormorant(영문 라벨),
 *     Noto Serif KR(국문 제목). 전부 sans 3단이던 위계를 쪼갰다
 *  3) 아트를 배경지로 깔지 않고 상단 밴드로 자른다 - 아트는 선명하게, 텍스트는
 *     단색 패널 위에. 흐린 배경 위 흰 글씨 조합을 버렸다
 *  4) 좌측 정렬 스펙 그리드 - 중앙정렬 캡션이 아니라 상품 카드로 읽히게
 *
 * 폰트는 premium/template/fonts 의 woff2 를 ttf 로 변환해 ~/.local/share/fonts/lovtaro
 * 에 설치해야 렌더된다(없으면 Georgia 로 조용히 폴백한다).
 *
 * 가격 출처: kmong.com/gig/796050 실제 등록가 확인(2026-07-30).
 * 재회 서비스는 심사 중(active:false)이라 제외. 가격 바뀌면 PACKAGES 만 고치고 재실행.
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const outputDir = resolve(rootDir, 'content-output/premium-carousel')

const W = 1080, H = 1350
const M = 56                 // 액자 여백
const PAD = 54               // 액자 안쪽 텍스트 여백
const X = M + PAD            // 좌측 정렬 기준선 = 110
const XR = W - M - PAD       // 우측 정렬 기준선 = 970

const DISPLAY = 'Cinzel'
const LABEL = 'Cormorant Garamond Light'
const SERIF_KR = 'Noto Serif KR'
const SANS_KR = 'Noto Sans KR'

const GOLD = '#D9BE83'
const GOLD_DIM = 'rgba(212,184,122,0.58)'
const RULE = 'rgba(212,184,122,0.24)'
const RULE_FAINT = 'rgba(212,184,122,0.13)'
const TEXT = '#F2F5FF'
const SUB = 'rgba(214,206,246,0.7)'
const MUTED = 'rgba(196,188,232,0.44)'
const PANEL = '#090817'

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** 금박 헤어라인 액자 + 코너 틱. 모든 슬라이드 맨 위에 올린다 */
function frame() {
  const x2 = W - M, y2 = H - M
  const t = 26 // 코너 틱 길이
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

async function card(slug, w, h, brightness = 1) {
  const buf = await sharp(resolve(cardsDir, `${slug}.png`)).resize(w, h, { fit: 'cover' }).toBuffer()
  return brightness === 1 ? buf : sharp(buf).modulate({ brightness }).png().toBuffer()
}

/**
 * 세로 크롭 위치를 지정할 수 있는 cover 크롭.
 *
 * sharp 의 fit:'cover' 는 항상 가운데를 잡는다. 그런데 카드 원본이 두 비율로 섞여 있다.
 *   메이저 22장 = 1024×1536 (세로)  /  마이너 56장 = 1200×630 (가로)
 * 세로 카드를 1080×620 밴드에 cover 로 넣으면 위아래 500px 씩 날아가서
 * 수레바퀴·달처럼 상단에 있는 focal 이 잘린다(가로 카드는 밴드에 거의 딱 맞아 무해).
 * 그래서 잘라낼 세로 위치를 카드별로 지정한다. 가로는 항상 중앙.
 *
 * focus  0 = 최상단, 0.5 = 가운데(기존 cover 와 동일), 1 = 최하단.
 * focusX 0 = 최좌단, 0.5 = 가운데, 1 = 최우단. 가로 카드를 세로 풀블리드에 넣을 때
 *        좌우 58% 가 날아가므로, 초승달처럼 한쪽에 치우친 요소는 이걸로 끌어와야 한다.
 */
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
      <stop offset="0%" stop-color="rgba(148,126,222,0.11)"/>
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

// ── 표지 / 뒷표지: 아트 풀블리드 + 하단 스크림 ─────────────────
async function coverSlide({ slug, filename, brightness, scrimFrom, body, focus = 0.5, focusX = 0.5 }) {
  const art = await artBand(slug, H, focus, brightness, focusX)
  const base = await sharp(art).png().toBuffer()
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
  await write(filename, await compose(base, overlay))
}

async function slide01() {
  const body = `
  ${wordmark(134)}
  <text x="${W / 2}" y="1000" font-family="${LABEL}" font-size="34" font-style="italic" letter-spacing="1" fill="${GOLD}" text-anchor="middle">1:1 Letter Reading</text>
  <text x="${W / 2}" y="1082" font-family="${SERIF_KR}" font-size="47" fill="${TEXT}" text-anchor="middle">상담은 끝나면 사라지지만</text>
  <text x="${W / 2}" y="1146" font-family="${SERIF_KR}" font-size="47" fill="${TEXT}" text-anchor="middle">편지는 남아 있어요</text>
  <line x1="470" y1="1192" x2="610" y2="1192" stroke="${RULE}" stroke-width="1"/>
  <text x="${W / 2}" y="1230" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${SUB}" text-anchor="middle">사연을 카드 3장으로 풀어 편지로 보내드려요</text>
  <text x="${W / 2}" y="1276" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}" text-anchor="middle">스와이프해서 확인하세요 →</text>`
  await coverSlide({ slug: 'ace-of-cups', filename: 'slide01.png', brightness: 0.94, scrimFrom: 520, body })
}

async function slide07() {
  const body = `
  <text x="${W / 2}" y="946" font-family="${DISPLAY}" font-size="42" letter-spacing="16" fill="${GOLD}" text-anchor="middle">LOVTARO</text>
  <text x="${W / 2}" y="1002" font-family="${SERIF_KR}" font-size="25" fill="${SUB}" text-anchor="middle">감정의 흐름을 읽는 타로</text>
  <line x1="440" y1="1046" x2="640" y2="1046" stroke="${RULE}" stroke-width="1"/>
  <text x="${W / 2}" y="1110" font-family="${SERIF_KR}" font-size="42" fill="${TEXT}" text-anchor="middle">신청은 프로필 링크에서</text>
  <text x="${W / 2}" y="1158" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${SUB}" text-anchor="middle">프로필 → 1:1 편지 리딩</text>
  <text x="${W / 2}" y="1212" font-family="${SERIF_KR}" font-size="25" fill="${GOLD}" text-anchor="middle">9,000원부터 · 작업일 2일</text>
  <text x="${W / 2}" y="1258" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}" text-anchor="middle">결제와 전달은 크몽에서 진행돼요</text>`
  // 컵의 8 = 별 깔린 보라 하늘 + 초승달 + 산맥. 인물도 얼굴도 없고 하단이 비어 있어
  // CTA 텍스트가 앉을 자리가 나온다. 의미도 "지금 자리에서 한 걸음 옮긴다" 라 CTA 와 맞다.
  // The Moon 은 달에 사람 얼굴이 크게 들어가고 늑대 머리가 워드마크 자리와 겹쳐서 뺐다.
  // focusX 0.62 = 오른쪽으로 치우친 초승달을 프레임 안으로 끌어온다(가운데면 가장자리에서 잘림)
  await coverSlide({ slug: 'eight-of-cups', filename: 'slide07.png', brightness: 0.92, scrimFrom: 480, focusX: 0.62, body })
}

// ── 편지 실물: 데모 지면 2장을 제품 사진처럼 겹쳐 배치 ──────────
/** 지면 1장을 목표 높이로 리사이즈 → 얇은 골드 테두리 → 회전(투명 배경) */
async function letterPage(file, h, angle) {
  const src = resolve(rootDir, 'premium/page/sample', file)
  const meta = await sharp(src).metadata()
  const w = Math.round((h * meta.width) / meta.height)
  // 지면이 배경과 같은 딥네이비라 그냥 얹으면 배경에 묻는다.
  // 살짝 밝히고 테두리를 진하게 줘서 종이로 떠 보이게 한다
  const resized = await sharp(src).resize(w, h).modulate({ brightness: 1.16 }).toBuffer()
  const bordered = await sharp(resized)
    .extend({ top: 2, bottom: 2, left: 2, right: 2, background: { r: 205, g: 176, b: 122, alpha: 0.72 } })
    .png().toBuffer()
  const rotated = await sharp(bordered)
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer()
  const rm = await sharp(rotated).metadata()
  return { buf: rotated, w: rm.width, h: rm.height }
}

async function slide02() {
  // 지면 뒤에 옅은 후광을 둬서 종이가 바닥에 놓인 것처럼 보이게 한다
  const halo = `<defs><radialGradient id="ph" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="rgba(150,132,224,0.17)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </radialGradient></defs>
  <ellipse cx="540" cy="790" rx="480" ry="350" fill="url(#ph)"/>`
  const base = await panelBase(stars(12, 110, 970, 170, 300) + halo)

  // 3장을 부채꼴로. "5페이지"라고 써놓고 2장만 보이면 말과 그림이 어긋난다.
  // 세로로도 조금씩 내려 겹쳐서 뒤 지면의 상단이 살아 있게 한다
  // 가운데 지면의 좌단이 표지 헤드라인 오른쪽 끝을 덮으면 "말하게 하세요" 가
  // 글자 중간에서 잘려 실수처럼 보인다. 표지에서 헤드라인은 폭의 75.8% 에서 끝나므로
  // (실측) 그 지점 + 여유를 넘겨 겹치도록 x 를 잡았다. 오른쪽 지면은 액자 안에 들어와야 한다.
  const H_PAGE = 490
  const pages = [
    { file: 'neutral-p1.jpg', angle: -8, cx: 276, cy: 742 },  // 표지
    { file: 'neutral-p3.jpg', angle: -1, cx: 552, cy: 780 },  // 카드 해석
    { file: 'neutral-p2.jpg', angle: 7, cx: 810, cy: 818 },   // 사연 + 첫 카드
  ]
  const layers = []
  for (const p of pages) {
    const img = await letterPage(p.file, H_PAGE, p.angle)
    layers.push({ input: img.buf, left: Math.round(p.cx - img.w / 2), top: Math.round(p.cy - img.h / 2) })
  }
  const withPages = await sharp(base).composite(layers).png().toBuffer()

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${wordmark(136)}
  <text x="${X}" y="290" font-family="${LABEL}" font-size="32" font-style="italic" letter-spacing="3" fill="${GOLD}">What you receive</text>
  <text x="${X}" y="360" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">이런 편지를 받습니다</text>
  <line x1="${X}" y1="406" x2="${XR}" y2="406" stroke="${RULE}" stroke-width="1"/>
  <line x1="${X}" y1="1112" x2="${XR}" y2="1112" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X}" y="1162" font-family="${SANS_KR}" font-size="24" font-weight="300" fill="${SUB}">표지 · 카드 3장 해석 · 관계의 흐름 · 조언 · 맺음말</text>
  <text x="${X}" y="1206" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}">정밀 편지 리딩 기준 5페이지 · 이름은 실제 발송본에만 들어갑니다</text>
  ${frame()}
  </svg>`

  await write('slide02.png', await compose(withPages, overlay))
}

// ── 패키지: 상단 아트 밴드 + 하단 스펙 그리드 ──────────────────
const BAND = 620

async function packageSlide({ slug, focus, tierEn, nameKo, spec, days, price, pick, featured, index, filename }) {
  const base = await panelBase()

  // 아트는 선명하게 두고 밴드 하단만 패널로 녹인다
  const art = await artBand(slug, BAND, focus, 0.96)
  const fade = `<svg width="${W}" height="${BAND}"><defs>
    <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,1)"/>
      <stop offset="62%" stop-color="rgba(255,255,255,1)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient></defs>
    <rect width="${W}" height="${BAND}" fill="url(#f)"/></svg>`
  const banded = await sharp(art).ensureAlpha()
    .composite([{ input: Buffer.from(fade), blend: 'dest-in' }]).png().toBuffer()
  const withArt = await sharp(base).composite([{ input: banded, left: 0, top: 0 }]).png().toBuffer()

  const rows = [
    ['분량', spec],
    ['작업일', days],
  ]
  let ry = 888
  const rowSvg = rows.map(([k, v]) => {
    const s = `<text x="${X}" y="${ry}" font-family="${SANS_KR}" font-size="22" font-weight="300" letter-spacing="1" fill="${MUTED}">${esc(k)}</text>
  <text x="${X + 130}" y="${ry}" font-family="${SANS_KR}" font-size="26" font-weight="300" fill="${TEXT}">${esc(v)}</text>
  <line x1="${X}" y1="${ry + 26}" x2="${XR}" y2="${ry + 26}" stroke="${RULE_FAINT}" stroke-width="1"/>`
    ry += 66
    return s
  }).join('\n  ')

  const priceY = ry + 34
  const badge = featured
    ? `<rect x="${XR - 176}" y="694" width="176" height="42" rx="21" fill="none" stroke="${GOLD_DIM}" stroke-width="1"/>
       <text x="${XR - 88}" y="722" font-family="${SANS_KR}" font-size="21" font-weight="300" letter-spacing="3" fill="${GOLD}" text-anchor="middle">대표 패키지</text>`
    : ''

  const pickSvg = pick.split('\n').map((l, i) =>
    `<text x="${X}" y="${priceY + 118 + i * 42}" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${SUB}">${esc(l)}</text>`
  ).join('\n  ')

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text x="${XR}" y="1264" font-family="${DISPLAY}" font-size="21" letter-spacing="3" fill="${GOLD_DIM}" text-anchor="end">0${index} / 03</text>
  <text x="${X}" y="722" font-family="${LABEL}" font-size="30" font-style="italic" letter-spacing="4" fill="${GOLD}">${esc(tierEn)}</text>
  ${badge}
  <text x="${X}" y="792" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">${esc(nameKo)}</text>
  <line x1="${X}" y1="${838}" x2="${XR}" y2="${838}" stroke="${RULE}" stroke-width="1"/>
  ${rowSvg}
  <text x="${X}" y="${priceY}" font-family="${SANS_KR}" font-size="22" font-weight="300" letter-spacing="1" fill="${MUTED}">가격</text>
  <text x="${X + 130}" y="${priceY + 8}" font-family="${SERIF_KR}" font-size="46" fill="${GOLD}">${esc(price)}</text>
  <line x1="${X}" y1="${priceY + 62}" x2="${XR}" y2="${priceY + 62}" stroke="${RULE_FAINT}" stroke-width="1"/>
  ${pickSvg}
  ${frame()}
  </svg>`

  await write(filename, await compose(withArt, overlay))
}

// ── 받는 과정 ────────────────────────────────────────────────
// 아트를 깔지 않는다. 정보 위주 슬라이드라 카드 문양이 텍스트와 싸우고,
// 표지(풀블리드) → 실물 → 패키지(아트 밴드) → 과정(무지) → 뒷표지 리듬도 생긴다.
async function slide06() {
  const base = await panelBase(stars(16, 110, 970, 150, 380) + stars(10, 110, 970, 1120, 1270))

  const steps = [
    ['01', '사연을 남겨요', '지금 상황과 궁금한 질문을 적어주세요'],
    ['02', '카드를 뽑아요', '78장 풀 덱, 정방향과 역방향 그대로'],
    ['03', '편지로 정리해요', '해석을 문장으로 풀어 씁니다'],
    ['04', '2일 안에 받아요', '편지 파일로 보내드려요'],
  ]

  let y = 566
  const stepSvg = steps.map(([n, title, desc]) => {
    const s = `<text x="${X}" y="${y}" font-family="${DISPLAY}" font-size="32" fill="${GOLD_DIM}">${n}</text>
  <text x="${X + 92}" y="${y}" font-family="${SERIF_KR}" font-size="34" fill="${TEXT}">${esc(title)}</text>
  <text x="${X + 92}" y="${y + 44}" font-family="${SANS_KR}" font-size="23" font-weight="300" fill="${SUB}">${esc(desc)}</text>`
    y += 148
    return s
  }).join('\n  ')

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${wordmark(136)}
  <text x="${X}" y="404" font-family="${LABEL}" font-size="32" font-style="italic" letter-spacing="3" fill="${GOLD}">How it works</text>
  <text x="${X}" y="474" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">받는 과정</text>
  <line x1="${X}" y1="${518}" x2="${XR}" y2="${518}" stroke="${RULE}" stroke-width="1"/>
  ${stepSvg}
  <line x1="${X}" y1="1128" x2="${XR}" y2="1128" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X}" y="1180" font-family="${SANS_KR}" font-size="23" font-weight="300" fill="${MUTED}">마음에 걸리는 부분이 있으면 다시 봐드려요</text>
  ${frame()}
  </svg>`

  await write('slide06.png', await compose(base, overlay))
}

const PACKAGES = [
  {
    // 수레바퀴 = 흐름·전환. "방향만 가볍게" 와 맞고 금색이 많아 미니 슬라이드가 안 심심하다
    // 지평선을 내다보는 구도 = "방향만 가볍게". 가로 카드(1200×630)라 밴드에 거의 딱 맞아
    // 크롭 손실이 없다. 수레바퀴(세로)는 원형 바퀴와 중심 하트를 620 밴드에 동시에
    // 담을 수 없어 포기했다. 티어가 깊어질수록 아트도 밝음→깊음으로 가는 순서가 된다
    slug: 'three-of-wands', focus: 0.5, tierEn: 'MINI', nameKo: '미니 3장 리딩',
    spec: '카드 3장 · 핵심 요약 3페이지', days: '2일', price: '9,000원',
    pick: '길게 읽을 여유가 없거나\n방향만 가볍게 보고 싶을 때',
    index: 1, filename: 'slide03.png',
  },
  {
    // 컵의 2 = 두 사람의 결합. "두 사람 사이의 기류" 와 바로 맞는다.
    // 인물이 없고(날개 사자 + 카두케우스) 좌우 대칭이라 대표 패키지 자리에 문장처럼 놓인다.
    // 가로 카드(1200×630)라 밴드 크롭 손실이 없다
    slug: 'two-of-cups', focus: 0.5, tierEn: 'SIGNATURE', nameKo: '정밀 편지 리딩',
    spec: '카드 3장 · 편지 5페이지', days: '2일', price: '29,000원', featured: true,
    pick: '기류와 상대의 마음, 앞으로의 방향까지\n흐름을 제대로 정리하고 싶을 때',
    index: 2, filename: 'slide04.png',
  },
  {
    // 달 = 감춰진 마음·무의식. 은자(노인)는 20~30대 여성 연애 톤에서 가장 벗어나 교체했다
    // 컵의 7 = 여러 개의 잔. "묻고 싶은 게 여러 개 겹쳐 있을 때" 와 문자 그대로 맞고,
    // 추가 질문 3개라는 스펙과도 이어진다. 가로 카드라 크롭 손실 없음
    slug: 'seven-of-cups', focus: 0.5, tierEn: 'DEEP', nameKo: '정밀 편지 + 심층',
    spec: '편지 6페이지 · 추가 질문 3개', days: '2일', price: '39,000원',
    pick: '따로 묻고 싶은 게 여러 개 겹쳐 있어서\n하나씩 짚어보고 싶을 때',
    index: 3, filename: 'slide05.png',
  },
]

/**
 * 폰트가 없으면 librsvg 가 조용히 Georgia 로 떨어져서 품질이 눈에 안 띄게 나빠진다.
 * 그래서 렌더 전에 막는다. 설치 방법은 파일 상단 주석 참고.
 */
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
    console.error('   premium/template/fonts 의 woff2 를 ttf 로 변환해')
    console.error('   ~/.local/share/fonts/lovtaro 에 넣고 fc-cache -f 하세요.')
    console.error('   이대로 렌더하면 Georgia 로 폴백돼 디스플레이 타입이 죽습니다.')
    process.exit(1)
  }
}

async function main() {
  console.log('=== 인스타 고정 게시물용 캐러셀 7장 ===')
  assertFonts()
  mkdirSync(outputDir, { recursive: true })
  await slide01()          // 표지 - 훅
  await slide02()          // 편지 실물
  for (const p of PACKAGES) await packageSlide(p)  // 03~05 패키지
  await slide06()          // 받는 과정
  await slide07()          // 뒷표지 - CTA
  console.log(`완료 → ${outputDir}`)
}

main().catch((err) => { console.error('❌:', err); process.exit(1) })
