/**
 * 인스타 고정 게시물용 전자책 안내 캐러셀 (6장, 1080×1350)
 *
 * generate-carousel-premium.mjs(1:1 리딩용 7장)의 자매편이다. 프로필 고정 3칸 중
 * 1번 칸에 걸 물건이라 같은 판형·같은 액자·같은 타입 위계를 쓴다. 두 캐러셀이
 * 나란히 걸리는데 골격이 다르면 같은 브랜드로 안 읽힌다.
 * 수치·색·폰트는 전부 그쪽과 동일하게 맞췄다. 바꾸려면 양쪽을 같이 바꿀 것.
 *
 * 리딩 캐러셀과 다른 점은 소재뿐이다.
 *  - 리딩은 "받는 편지"가 실물이라 premium/page/sample 지면을 썼다
 *  - 전자책은 "책"이 실물이라 premium/kmong/thumbnails/preview 의 지면 렌더를 쓴다
 *    (PDF 원본에서 뽑은 6쪽. 표지·목차·읽는 법·메이저·마이너·마치며)
 *
 * 슬라이드 순서의 의도: 훅 → 실물 → 구조(주장) → 지면(증명) → 사양·가격 → CTA.
 * 3번에서 "카드 한 장이 네 갈래로 갈린다"고 말하고 4번이 그 페이지를 그대로 보여준다.
 * 주장과 증명을 한 장에 합치면 글자가 작아져 둘 다 죽는다. 그래서 나눴다.
 *
 * 3번 슬라이드의 4개 발췌는 src/data/relationshipModifiers.js 의 `fool` 항목
 * 원문 첫 구절이다. 4번이 보여주는 지면(preview-04-메이저-바보)과 같은 카드라
 * 둘을 나란히 넘겨도 말이 어긋나지 않는다. 문구를 새로 쓰지 말 것 - 지어내면
 * 책에 없는 문장을 광고한 게 된다.
 *
 * 아트 선택 근거:
 *  - slide01 여사제 = 두루마리(글)를 펼쳐 든 구도. 해석서·사전과 의미가 맞고
 *    얼굴이 상단 1/3에 있어 하단 스크림에 안 가린다. focus 0.35 는 두루마리를
 *    스크림 위로 끌어올리려고 잡은 값이다(0.5 면 스크림에 묻힌다)
 *  - slide05 밴드 = 펜타클 에이스. 손이 무언가를 내미는 그림이라 가격·수령 슬라이드와
 *    맞고, 마이너라 1200×630 가로여서 620 밴드에 크롭 손실이 거의 없다
 *  - slide06 별 = 상단에 큰 별, 하단이 물결이라 CTA 텍스트 자리가 비어 있다.
 *    리딩 캐러셀 뒷표지(컵의 8)와 겹치지 않게 골랐다
 *
 * 가격·사양 출처: src/data/kmong.js 의 KMONG_EBOOK(15,000원 / 86p / 312건),
 * kmong.com/gig/805211 등록가(2026-08-21 승인). 바꾸려면 BOOK 만 고치고 재실행.
 *
 * 폰트는 리딩 캐러셀과 동일하게 ~/.local/share/fonts/lovtaro 설치본이 필요하다.
 * 없으면 Georgia 로 조용히 폴백하므로 assertFonts 로 먼저 막는다.
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const pagesDir = resolve(rootDir, 'premium/kmong/thumbnails/preview')
const outputDir = resolve(rootDir, 'content-output/ebook-carousel')

const W = 1080, H = 1350
const M = 56
const PAD = 54
const X = M + PAD        // 110
const XR = W - M - PAD   // 970

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

/** kmong.js KMONG_EBOOK 과 같은 값. 저쪽이 단일 소스이므로 바뀌면 여기도 고친다 */
const BOOK = {
  price: '15,000원',
  pages: '86페이지',
  entries: '312가지 해석',
}

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

/** generate-carousel-premium.mjs 의 artBand 와 동일 로직 */
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

// ── 01 표지: 훅 ───────────────────────────────────────────────
async function slide01() {
  const body = `
  ${wordmark(134)}
  <text x="${W / 2}" y="994" font-family="${LABEL}" font-size="34" font-style="italic" letter-spacing="1" fill="${GOLD}" text-anchor="middle">Card Dictionary</text>
  <text x="${W / 2}" y="1076" font-family="${SERIF_KR}" font-size="47" fill="${TEXT}" text-anchor="middle">카드는 뽑았는데</text>
  <text x="${W / 2}" y="1140" font-family="${SERIF_KR}" font-size="47" fill="${TEXT}" text-anchor="middle">무슨 뜻인지 모를 때</text>
  <line x1="470" y1="1186" x2="610" y2="1186" stroke="${RULE}" stroke-width="1"/>
  <text x="${W / 2}" y="1224" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${SUB}" text-anchor="middle">78장을 지금 내 관계 상태로 찾아 읽어요</text>
  <text x="${W / 2}" y="1270" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}" text-anchor="middle">스와이프해서 확인하세요 →</text>`
  // focus 0.62 는 렌더 비교로 정한 값이다(0.35 / 0.62 / 0.85 3안 대조).
  // 0.35 는 여사제가 편 두루마리가 하단 스크림에 묻혀서 "글을 읽는 사람" 이라는
  // 의미가 사라지고 그냥 인물 사진이 된다. 0.85 는 두루마리가 가장 밝지만
  // 워드마크가 초승달 왕관 뿔 사이에 겹친다. 0.62 가 둘 다 피한다.
  await coverSlide({ slug: 'high-priestess', filename: 'slide01.png', brightness: 0.94, scrimFrom: 520, focus: 0.62, body })
}

// ── 02 실물: 지면 3장을 부채꼴로 ──────────────────────────────
/** 지면 1장을 목표 높이로 리사이즈 → 얇은 골드 테두리 → 회전(투명 배경) */
async function bookPage(file, h, angle) {
  const src = resolve(pagesDir, file)
  const meta = await sharp(src).metadata()
  const w = Math.round((h * meta.width) / meta.height)
  // 지면이 배경과 같은 딥네이비라 그냥 얹으면 배경에 묻는다.
  // 살짝 밝히고 테두리를 진하게 줘서 종이로 떠 보이게 한다(리딩 캐러셀과 동일 처리)
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
  const halo = `<defs><radialGradient id="ph" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="rgba(150,132,224,0.17)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </radialGradient></defs>
  <ellipse cx="540" cy="790" rx="480" ry="350" fill="url(#ph)"/>`
  const base = await panelBase(stars(12, 110, 970, 170, 300) + halo)

  const H_PAGE = 490
  const pages = [
    { file: 'preview-02-표지.png', angle: -8, cx: 276, cy: 742 },
    { file: 'preview-04-메이저-바보.png', angle: -1, cx: 552, cy: 780 },
    { file: 'preview-05-마이너-컵에이스.png', angle: 7, cx: 810, cy: 818 },
  ]
  const layers = []
  for (const p of pages) {
    const img = await bookPage(p.file, H_PAGE, p.angle)
    layers.push({ input: img.buf, left: Math.round(p.cx - img.w / 2), top: Math.round(p.cy - img.h / 2) })
  }
  const withPages = await sharp(base).composite(layers).png().toBuffer()

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${wordmark(136)}
  <text x="${X}" y="290" font-family="${LABEL}" font-size="32" font-style="italic" letter-spacing="3" fill="${GOLD}">What's inside</text>
  <text x="${X}" y="360" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">${esc(BOOK.pages)}짜리 책이에요</text>
  <line x1="${X}" y1="406" x2="${XR}" y2="406" stroke="${RULE}" stroke-width="1"/>
  <line x1="${X}" y1="1112" x2="${XR}" y2="1112" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X}" y="1162" font-family="${SANS_KR}" font-size="24" font-weight="300" fill="${SUB}">읽는 법 · 메이저 22장 · 마이너 56장 · 맺음말</text>
  <text x="${X}" y="1206" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}">PDF 파일 · 목차와 책갈피로 카드를 바로 찾아갑니다</text>
  ${frame()}
  </svg>`

  await write('slide02.png', await compose(withPages, overlay))
}

// ── 03 구조: 카드 한 장이 네 갈래 ─────────────────────────────
/**
 * 발췌는 relationshipModifiers.js `lovers` 원문 첫 구절이다.
 *
 * ⚠️ 처음엔 `fool` 을 썼는데 04 가 보여주는 지면과 같은 카드여서, 넘기면 솔로·썸
 * 문장이 글자 그대로 두 번 나왔다. 증명이 아니라 반복으로 읽혀서 카드를 갈랐다.
 * 03(연인)과 04(바보)가 다른 카드여야 "78장이 전부 이렇게 되어 있다" 가 전달된다.
 * 04 의 지면을 바꿀 일이 생기면 여기도 같이 확인할 것 - 두 장이 같은 카드가 되면
 * 같은 문제가 되살아난다.
 */
const CARD_KO = '연인'
const STATES = [
  { ko: '솔로', line1: '누군가와 깊이 연결되고 싶다는', line2: '바람이 선명해지고 있어요' },
  { ko: '썸', line1: '서로 끌린다는 건 알지만', line2: '꺼내 놓기를 망설이는 상태예요' },
  { ko: '연애 중', line1: '애정은 깊어지는데 표현 방식이', line2: '달라 온도 차가 생길 시점이에요' },
  { ko: '이별 후', line1: '헤어졌지만 마음이', line2: '완전히 떠나지 못한 상태예요' },
]

async function slide03() {
  const base = await panelBase(stars(14, 110, 970, 150, 340))

  // 2×2 그리드. 액자 안쪽 폭 860 을 2칸으로 쪼개고 사이 간격 28
  const GAP = 28
  const BW = Math.round((XR - X - GAP) / 2)   // 416
  const BH = 232
  const gy = 560
  const boxes = STATES.map((s, i) => {
    const bx = X + (i % 2) * (BW + GAP)
    const by = gy + Math.floor(i / 2) * (BH + GAP)
    return `
  <rect x="${bx}" y="${by}" width="${BW}" height="${BH}" rx="10" fill="rgba(255,255,255,0.028)" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${bx + 30}" y="${by + 62}" font-family="${SERIF_KR}" font-size="32" fill="${GOLD}">${esc(s.ko)}</text>
  <line x1="${bx + 30}" y1="${by + 88}" x2="${bx + BW - 30}" y2="${by + 88}" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${bx + 30}" y="${by + 136}" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${SUB}">${esc(s.line1)}</text>
  <text x="${bx + 30}" y="${by + 172}" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${SUB}">${esc(s.line2)}</text>`
  }).join('\n  ')

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${wordmark(136)}
  <text x="${X}" y="398" font-family="${LABEL}" font-size="32" font-style="italic" letter-spacing="3" fill="${GOLD}">How it's built</text>
  <text x="${X}" y="468" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">카드 한 장이 네 갈래로 갈려요</text>
  <line x1="${X}" y1="512" x2="${XR}" y2="512" stroke="${RULE}" stroke-width="1"/>
  <text x="${XR}" y="500" font-family="${SANS_KR}" font-size="22" font-weight="300" letter-spacing="1" fill="${MUTED}" text-anchor="end">${esc(CARD_KO)} 카드 예시</text>
  ${boxes}
  <line x1="${X}" y1="1134" x2="${XR}" y2="1134" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X}" y="1186" font-family="${SERIF_KR}" font-size="30" fill="${GOLD}">78장 × 4가지 상태 = ${esc(BOOK.entries)}</text>
  <text x="${X}" y="1230" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}">같은 카드도 지금 내 상황에 따라 다르게 읽혀요</text>
  ${frame()}
  </svg>`

  await write('slide03.png', await compose(base, overlay))
}

// ── 04 증명: 실제 지면 확대 ───────────────────────────────────
/**
 * A4 한 쪽을 1080 폭에 통째로 넣으면 폭이 490 밖에 안 나와 본문이 안 읽힌다.
 * "실제 지면이에요" 라고 써놓고 글자를 못 읽으면 증명이 안 되므로 잘라서 키운다.
 *
 * 크롭 좌표는 preview-04-메이저-바보.png(1000×1415)를 열 밝기 프로파일로 실측한 값이다.
 *   본문 좌우 경계 x=95 / x=906   (좌우 여백을 17px 씩 더 줘서 78~923)
 *   카드 헤더 시작 y≈130, 위 2칸(솔로·썸) 끝 y=861 (아래 2칸은 890~1283)
 * 헤더 + 위 2칸까지만 담아 "어느 카드인지" 와 "상태별로 갈린다" 를 동시에 보이게 했다.
 * 4칸을 다 넣으면 다시 축소돼 읽기 어려워진다. 잘린 지면이라는 건 캡션에 밝힌다.
 */
const PAGE_CROP = { left: 78, top: 118, width: 845, height: 762 }

async function cropPage(file, crop, targetW) {
  const src = resolve(pagesDir, file)
  const targetH = Math.round((crop.height * targetW) / crop.width)
  const resized = await sharp(src)
    .extract(crop)
    .resize(targetW, targetH)
    .modulate({ brightness: 1.16 })
    .toBuffer()
  const bordered = await sharp(resized)
    .extend({ top: 2, bottom: 2, left: 2, right: 2, background: { r: 205, g: 176, b: 122, alpha: 0.72 } })
    .png().toBuffer()
  const m = await sharp(bordered).metadata()
  return { buf: bordered, w: m.width, h: m.height }
}

async function slide04() {
  const halo = `<defs><radialGradient id="ph2" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="rgba(150,132,224,0.15)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </radialGradient></defs>
  <ellipse cx="540" cy="800" rx="440" ry="370" fill="url(#ph2)"/>`
  const base = await panelBase(stars(10, 110, 970, 160, 300) + halo)

  // 03 에서 말한 네 갈래가 실제 지면에 있다는 걸 보여주는 자리라 회전 없이 정면으로 둔다
  const img = await cropPage('preview-04-메이저-바보.png', PAGE_CROP, 800)
  const withPage = await sharp(base).composite([
    { input: img.buf, left: Math.round(W / 2 - img.w / 2), top: 448 },
  ]).png().toBuffer()

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${wordmark(136)}
  <text x="${X}" y="290" font-family="${LABEL}" font-size="32" font-style="italic" letter-spacing="3" fill="${GOLD}">Actual page</text>
  <text x="${X}" y="360" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">실제 지면이에요</text>
  <line x1="${X}" y1="406" x2="${XR}" y2="406" stroke="${RULE}" stroke-width="1"/>
  <line x1="${X}" y1="1204" x2="${XR}" y2="1204" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X}" y="1252" font-family="${SANS_KR}" font-size="23" font-weight="300" fill="${SUB}">바보 카드의 지면 일부 · 아래로 연애 중과 이별 후가 이어져요</text>
  ${frame()}
  </svg>`

  await write('slide04.png', await compose(withPage, overlay))
}

// ── 05 사양·가격: 상단 아트 밴드 + 스펙 그리드 ────────────────
const BAND = 620

async function slide05() {
  const base = await panelBase()

  const art = await artBand('ace-of-pentacles', BAND, 0.5, 0.96)
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
    ['분량', `${BOOK.pages} · ${BOOK.entries}`],
    ['형식', 'PDF 파일 · 결제하면 바로 받아요'],
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
  const pick = '카드는 뽑는데 해석에서 늘 막힐 때\n곁에 두고 그때그때 찾아보고 싶을 때'
  const pickSvg = pick.split('\n').map((l, i) =>
    `<text x="${X}" y="${priceY + 118 + i * 42}" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${SUB}">${esc(l)}</text>`
  ).join('\n  ')

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text x="${X}" y="722" font-family="${LABEL}" font-size="30" font-style="italic" letter-spacing="4" fill="${GOLD}">EBOOK</text>
  <text x="${X}" y="792" font-family="${SERIF_KR}" font-size="46" fill="${TEXT}">그 사람 마음 사전</text>
  <line x1="${X}" y1="838" x2="${XR}" y2="838" stroke="${RULE}" stroke-width="1"/>
  ${rowSvg}
  <text x="${X}" y="${priceY}" font-family="${SANS_KR}" font-size="22" font-weight="300" letter-spacing="1" fill="${MUTED}">가격</text>
  <text x="${X + 130}" y="${priceY + 8}" font-family="${SERIF_KR}" font-size="46" fill="${GOLD}">${esc(BOOK.price)}</text>
  <line x1="${X}" y1="${priceY + 62}" x2="${XR}" y2="${priceY + 62}" stroke="${RULE_FAINT}" stroke-width="1"/>
  ${pickSvg}
  ${frame()}
  </svg>`

  await write('slide05.png', await compose(withArt, overlay))
}

// ── 06 뒷표지: CTA ───────────────────────────────────────────
async function slide06() {
  const body = `
  <text x="${W / 2}" y="946" font-family="${DISPLAY}" font-size="42" letter-spacing="16" fill="${GOLD}" text-anchor="middle">LOVTARO</text>
  <text x="${W / 2}" y="1002" font-family="${SERIF_KR}" font-size="25" fill="${SUB}" text-anchor="middle">감정의 흐름을 읽는 타로</text>
  <line x1="440" y1="1046" x2="640" y2="1046" stroke="${RULE}" stroke-width="1"/>
  <text x="${W / 2}" y="1110" font-family="${SERIF_KR}" font-size="42" fill="${TEXT}" text-anchor="middle">프로필 링크에서 받아요</text>
  <text x="${W / 2}" y="1158" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${SUB}" text-anchor="middle">프로필 → 그 사람 마음 사전</text>
  <text x="${W / 2}" y="1212" font-family="${SERIF_KR}" font-size="25" fill="${GOLD}" text-anchor="middle">${esc(BOOK.price)} · 결제 후 바로 발송</text>
  <text x="${W / 2}" y="1258" font-family="${SANS_KR}" font-size="21" font-weight="300" fill="${MUTED}" text-anchor="middle">결제와 전달은 크몽에서 진행돼요</text>`
  await coverSlide({ slug: 'star', filename: 'slide06.png', brightness: 0.92, scrimFrom: 480, body })
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
    console.error('   premium/template/fonts 의 woff2 를 ttf 로 변환해')
    console.error('   ~/.local/share/fonts/lovtaro 에 넣고 fc-cache -f 하세요.')
    process.exit(1)
  }
}

async function main() {
  console.log('=== 인스타 고정 게시물용 전자책 캐러셀 6장 ===')
  assertFonts()
  mkdirSync(outputDir, { recursive: true })
  await slide01()   // 표지 - 훅
  await slide02()   // 실물 - 지면 3장
  await slide03()   // 구조 - 네 갈래
  await slide04()   // 증명 - 실제 지면
  await slide05()   // 사양 · 가격
  await slide06()   // 뒷표지 - CTA
  console.log(`완료 → ${outputDir}`)
}

main().catch((err) => { console.error('❌:', err); process.exit(1) })
