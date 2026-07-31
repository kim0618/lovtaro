/**
 * 카카오 오픈프로필 포스트 3장 (1080×1080)
 *
 * 인스타 캐러셀과 목적이 다르다. 오픈채팅은 결제 창구가 아니라 문의 창구고
 * (주문은 크몽), 이 포스트는 링크를 눌러 "들어갈까 말까" 판단하는 지점에 붙는다.
 * 그래서 파는 말보다 ① 여기가 뭐 하는 방인지 ② 공짜로 뭘 할 수 있는지
 * ③ 유료는 어디서 사는지 순서로 짰다.
 *
 * post1 이 가장 중요하다. 기대치를 안 잡으면 "카드 한 장만 봐주세요" 가 몰려서
 * 1인 운영이 마비되고 유료 전환도 갉아먹는다.
 *
 * ⚠️ 크몽 규정: 크몽 → 오픈채팅 유도는 외부거래 유도로 제재 대상이다.
 *    반대 방향(오픈채팅 → 크몽)만 넣는다. 크몽 서비스 페이지·전달물에 이 이미지를
 *    쓰지 말 것.
 *
 * 정사각 1080 인 이유: 카카오 포스트 카드 표시 비율을 확신할 수 없어서 어디서 잘려도
 * 안전한 정사각으로 간다. 캐러셀(4:5)을 그대로 쓰면 "스와이프해서 확인하세요" 같은
 * 문구가 단독 노출에서 말이 안 된다.
 *
 * 포스트 개수 3개는 정리 블로그 기준이라 앱에서 실제 슬롯 수를 확인할 것.
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const sampleDir = resolve(rootDir, 'premium/page/sample')
const outputDir = resolve(rootDir, 'content-output/kakao-posts')

const S = 1080
const M = 48                 // 액자 여백
const X = M + 48             // 좌측 정렬 기준선 = 96
const XR = S - M - 48        // 우측 기준선 = 984

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

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function frame() {
  const x2 = S - M, t = 22
  return `
  <rect x="${M}" y="${M}" width="${S - M * 2}" height="${S - M * 2}" fill="none" stroke="${RULE}" stroke-width="1"/>
  <path d="M${M} ${M + t} L${M} ${M} L${M + t} ${M}" fill="none" stroke="${GOLD_DIM}" stroke-width="2"/>
  <path d="M${x2 - t} ${M} L${x2} ${M} L${x2} ${M + t}" fill="none" stroke="${GOLD_DIM}" stroke-width="2"/>
  <path d="M${M} ${x2 - t} L${M} ${x2} L${M + t} ${x2}" fill="none" stroke="${GOLD_DIM}" stroke-width="2"/>
  <path d="M${x2 - t} ${x2} L${x2} ${x2} L${x2} ${x2 - t}" fill="none" stroke="${GOLD_DIM}" stroke-width="2"/>`
}

function wordmark(y, size = 20, ls = 10) {
  return `<text x="${S / 2}" y="${y}" font-family="${DISPLAY}" font-size="${size}" letter-spacing="${ls}" fill="${GOLD_DIM}" text-anchor="middle">LOVTARO</text>`
}

function stars(count, xMin, xMax, yMin, yMax) {
  const seed = [0.12, 0.87, 0.34, 0.56, 0.78, 0.23, 0.91, 0.45, 0.67, 0.09, 0.38, 0.72, 0.15, 0.83, 0.51]
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = xMin + seed[i % seed.length] * (xMax - xMin)
    const y = yMin + seed[(i + 7) % seed.length] * (yMax - yMin)
    const r = 0.8 + seed[(i + 3) % seed.length] * 1.5
    const o = 0.16 + seed[(i + 5) % seed.length] * 0.38
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="rgba(255,255,255,${o.toFixed(2)})"/>`
  }
  return out
}

const BG_DEFS = `
    <linearGradient id="bg" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0%" stop-color="#0B0A20"/>
      <stop offset="45%" stop-color="#0D0C24"/>
      <stop offset="100%" stop-color="#06050E"/>
    </linearGradient>
    <radialGradient id="gl" cx="50%" cy="34%" r="52%">
      <stop offset="0%" stop-color="rgba(148,126,222,0.11)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>`

async function panelBase(extra = '') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  <defs>${BG_DEFS}</defs>
  <rect width="${S}" height="${S}" fill="url(#bg)"/>
  <ellipse cx="540" cy="400" rx="520" ry="520" fill="url(#gl)"/>
  ${extra}
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

/** 가로/세로 원본 모두 대응하는 cover 크롭 + 크롭 위치 지정 */
async function artBand(slug, h, focus = 0.5, brightness = 1, focusX = 0.5) {
  const src = resolve(cardsDir, `${slug}.png`)
  const meta = await sharp(src).metadata()
  const scale = Math.max(S / meta.width, h / meta.height)
  const rw = Math.round(meta.width * scale)
  const rh = Math.round(meta.height * scale)
  const resized = await sharp(src).resize(rw, rh).toBuffer()
  const top = Math.max(0, Math.min(rh - h, Math.round((rh - h) * focus)))
  const left = Math.max(0, Math.min(rw - S, Math.round((rw - S) * focusX)))
  const cropped = await sharp(resized).extract({ left, top, width: S, height: h }).toBuffer()
  return brightness === 1 ? cropped : sharp(cropped).modulate({ brightness }).png().toBuffer()
}

async function write(name, buf) {
  writeFileSync(resolve(outputDir, name), buf)
  console.log(`✅ ${name} (${(buf.length / 1024).toFixed(0)} KB)`)
}

const compose = (base, svg) =>
  sharp(base).composite([{ input: Buffer.from(svg), left: 0, top: 0 }]).png().toBuffer()

// ── post1: 이 방이 뭐 하는 곳인지 + 기대치 ────────────────────
async function post1() {
  const base = await panelBase(stars(14, 100, 980, 120, 260) + stars(8, 100, 980, 900, 1000))

  const items = ['서비스 이용 문의', '개선 의견', '광고 · 협업 문의']
  let iy = 552
  const itemSvg = items.map((t) => {
    const s = `<circle cx="${X + 5}" cy="${iy - 9}" r="3" fill="${GOLD_DIM}"/>
  <text x="${X + 30}" y="${iy}" font-family="${SANS_KR}" font-size="27" font-weight="300" fill="${TEXT}">${esc(t)}</text>`
    iy += 52
    return s
  }).join('\n  ')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  ${wordmark(118)}
  <text x="${X}" y="286" font-family="${LABEL}" font-size="30" font-style="italic" letter-spacing="3" fill="${GOLD}">Open Chat</text>
  <text x="${X}" y="352" font-family="${SERIF_KR}" font-size="44" fill="${TEXT}">문의 · 의견 창구입니다</text>
  <line x1="${X}" y1="396" x2="${XR}" y2="396" stroke="${RULE}" stroke-width="1"/>
  <text x="${X}" y="462" font-family="${SANS_KR}" font-size="26" font-weight="300" fill="${SUB}">닉네임만으로 익명 입장할 수 있어요</text>
  ${itemSvg}
  <line x1="${X}" y1="742" x2="${XR}" y2="742" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X}" y="798" font-family="${SANS_KR}" font-size="24" font-weight="300" fill="${MUTED}">실시간 상담 창구는 아니라서</text>
  <text x="${X}" y="838" font-family="${SANS_KR}" font-size="24" font-weight="300" fill="${MUTED}">확인하는 대로 순차적으로 답변드려요</text>
  <text x="${X}" y="906" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${GOLD_DIM}">타로 해석 요청은 이 방에서 받지 않아요</text>
  ${frame()}
  </svg>`

  await write('post1-intro.png', await compose(base, svg))
}

// ── post2: 무료 리딩 9종 → 사이트 ────────────────────────────
async function post2() {
  const BAND = 420
  const base = await panelBase()
  const art = await artBand('six-of-cups', BAND, 0.5, 0.95)
  const fade = `<svg width="${S}" height="${BAND}"><defs>
    <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,1)"/>
      <stop offset="58%" stop-color="rgba(255,255,255,1)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient></defs><rect width="${S}" height="${BAND}" fill="url(#f)"/></svg>`
  const banded = await sharp(art).ensureAlpha()
    .composite([{ input: Buffer.from(fade), blend: 'dest-in' }]).png().toBuffer()
  const withArt = await sharp(base).composite([{ input: banded, left: 0, top: 0 }]).png().toBuffer()

  const rows = [
    '상대방 속마음 · 연락 올까 · 재회 가능성',
    '러브타로 스프레드 · Yes/No · 궁합',
    '3카드 · 오늘의 연애 카드 · 연애 심리테스트',
  ]
  let ry = 636
  const rowSvg = rows.map((t) => {
    const s = `<text x="${X}" y="${ry}" font-family="${SANS_KR}" font-size="26" font-weight="300" fill="${TEXT}">${esc(t)}</text>`
    ry += 52
    return s
  }).join('\n  ')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  <text x="${X}" y="486" font-family="${LABEL}" font-size="30" font-style="italic" letter-spacing="3" fill="${GOLD}">Free Reading</text>
  <text x="${X}" y="552" font-family="${SERIF_KR}" font-size="44" fill="${TEXT}">무료 연애 타로 9종</text>
  <line x1="${X}" y1="592" x2="${XR}" y2="592" stroke="${RULE}" stroke-width="1"/>
  ${rowSvg}
  <line x1="${X}" y1="838" x2="${XR}" y2="838" stroke="${RULE_FAINT}" stroke-width="1"/>
  <text x="${X}" y="892" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${SUB}">회원가입 없이 바로 뽑아볼 수 있어요</text>
  <text x="${X}" y="948" font-family="${DISPLAY}" font-size="24" letter-spacing="5" fill="${GOLD}">LOVTARO.KR</text>
  ${frame()}
  </svg>`

  await write('post2-free.png', await compose(withArt, svg))
}

// ── post3: 유료 편지 리딩 → 크몽 ─────────────────────────────
async function post3() {
  const halo = `<defs><radialGradient id="ph" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="rgba(150,132,224,0.17)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </radialGradient></defs>
  <ellipse cx="540" cy="400" rx="430" ry="290" fill="url(#ph)"/>`
  const base = await panelBase(stars(10, 100, 980, 110, 200) + halo)

  // 지면 2장. 정사각이라 3장은 답답해서 표지 + 내지 한 장만
  const H_PAGE = 400
  const layout = [
    { file: 'neutral-p1.jpg', angle: -7, cx: 404, cy: 396 },
    { file: 'neutral-p3.jpg', angle: 6, cx: 660, cy: 424 },
  ]
  const layers = []
  for (const p of layout) {
    const src = resolve(sampleDir, p.file)
    const meta = await sharp(src).metadata()
    const w = Math.round((H_PAGE * meta.width) / meta.height)
    const resized = await sharp(src).resize(w, H_PAGE).modulate({ brightness: 1.16 }).toBuffer()
    const bordered = await sharp(resized)
      .extend({ top: 2, bottom: 2, left: 2, right: 2, background: { r: 205, g: 176, b: 122, alpha: 0.72 } })
      .png().toBuffer()
    const rot = await sharp(bordered).rotate(p.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
    const rm = await sharp(rot).metadata()
    layers.push({ input: rot, left: Math.round(p.cx - rm.width / 2), top: Math.round(p.cy - rm.height / 2) })
  }
  const withPages = await sharp(base).composite(layers).png().toBuffer()

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  <text x="${X}" y="700" font-family="${LABEL}" font-size="30" font-style="italic" letter-spacing="3" fill="${GOLD}">1:1 Letter Reading</text>
  <text x="${X}" y="766" font-family="${SERIF_KR}" font-size="44" fill="${TEXT}">사연을 편지로 받아보기</text>
  <line x1="${X}" y1="806" x2="${XR}" y2="806" stroke="${RULE}" stroke-width="1"/>
  <text x="${X}" y="862" font-family="${SANS_KR}" font-size="25" font-weight="300" fill="${SUB}">카드 3장 해석을 편지로 정리해 보내드려요</text>
  <text x="${X}" y="916" font-family="${SERIF_KR}" font-size="27" fill="${GOLD}">9,000원부터 · 작업일 2일</text>
  <text x="${X}" y="962" font-family="${SANS_KR}" font-size="23" font-weight="300" fill="${MUTED}">신청은 크몽에서 (프로필 링크 → 1:1 편지 리딩)</text>
  ${frame()}
  </svg>`

  await write('post3-letter.png', await compose(withPages, svg))
}

function assertFonts() {
  let installed = ''
  try {
    installed = execSync('fc-list', { encoding: 'utf8' })
  } catch {
    console.warn('⚠️ fc-list 실행 불가, 폰트 확인을 건너뜁니다')
    return
  }
  const missing = ['Cinzel', 'Cormorant Garamond', 'Noto Serif KR', 'Noto Sans KR']
    .filter((f) => !installed.includes(f))
  if (missing.length) {
    console.error(`❌ 폰트 미설치: ${missing.join(', ')}`)
    console.error('   ~/.local/share/fonts/lovtaro 에 설치 후 fc-cache -f. 안 하면 Georgia 로 폴백됩니다.')
    process.exit(1)
  }
}

async function main() {
  console.log('=== 카카오 오픈프로필 포스트 3장 ===')
  assertFonts()
  mkdirSync(outputDir, { recursive: true })
  await post1()
  await post2()
  await post3()
  console.log(`완료 → ${outputDir}`)
}

main().catch((err) => { console.error('❌:', err); process.exit(1) })
