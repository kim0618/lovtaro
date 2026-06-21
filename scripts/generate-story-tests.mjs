/**
 * 심리테스트 홍보 스토리 (1080×1920) - 평일 5일(월~금) 1개씩
 * 5개 심리테스트를 요일에 랜덤 배치. 카드 앞면 2장(겹침+기울임) + 앰비언트 빛.
 *
 * 사용:
 *   node scripts/generate-story-tests.mjs week <월요일날짜>     예) week 2026-06-22
 *       → 해당 주 월~금 폴더(content-output/YYYY-MM-DD_{day})에 story01.png + story.txt 생성
 *   node scripts/generate-story-tests.mjs <slug> <outDir> [date]  → 1개만(특정 폴더)
 *
 * 규칙:
 *   - 질문 중복 방지: story_questions.md 미사용([ ])만 뽑고 [x](날짜) 처리, 사이클 끝나면 자동 리셋.
 *   - 카드 78장 no-dup 순환: story_cards.json. 78장 다 쓰면 리셋 후 다시 랜덤 2장.
 *   - 테스트→요일: 5개를 매주 랜덤 셔플해 월~금 배치 (한 주에 테스트 1개씩).
 *   - minor는 mcards 세로 원본, major는 cards-png. 링크는 story.txt 기록(IG 스티커 연결).
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const cardsDir = resolve(rootDir, 'public/images/cards-png')
const mcardsDir = resolve(rootDir, 'public/images/mcards')
const QFILE = resolve(rootDir, '.claude/insta-data/story_questions.md')
const CFILE = resolve(rootDir, '.claude/insta-data/story_cards.json')
const W = 1080, H = 1920
const KO_STACK = `'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif`
const EYEBROW = '연애 심리테스트'

const ORDER = ['ideal-type', 'past-life', 'mbti-love', 'crush', 'love-style']
const TESTS = {
  'crush': { label: '짝사랑', midline: '짝사랑 유형 테스트', url: 'https://lovtaro.kr/test/crush' },
  'ideal-type': { label: '운명의 상대', midline: '운명의 상대 테스트', url: 'https://lovtaro.kr/test/ideal-type' },
  'past-life': { label: '전생', midline: '전생 연애 테스트', url: 'https://lovtaro.kr/test/past-life' },
  'mbti-love': { label: 'MBTI 연애', midline: 'MBTI 연애 테스트', url: 'https://lovtaro.kr/test/mbti-love' },
  'love-style': { label: '연애 스타일', midline: '연애 스타일 테스트', url: 'https://lovtaro.kr/test/love-style' },
}
const MAJORS = new Set(['fool', 'magician', 'high-priestess', 'empress', 'emperor', 'hierophant', 'lovers', 'chariot', 'strength', 'hermit', 'wheel-of-fortune', 'justice', 'hanged-man', 'death', 'temperance', 'devil', 'tower', 'star', 'moon', 'sun', 'judgement', 'world'])
const ALL_CARDS = readdirSync(cardsDir).filter(f => f.endsWith('.png')).map(f => f.replace('.png', ''))

const pick = (a) => a[Math.floor(Math.random() * a.length)]
function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[r[i], r[j]] = [r[j], r[i]] } return r }
const cap = s => s.charAt(0).toUpperCase() + s.slice(1)
function cardPath(slug) {
  if (MAJORS.has(slug)) return resolve(cardsDir, `${slug}.png`)
  const [rank, suit] = slug.split('-of-')
  return resolve(mcardsDir, suit, `${cap(rank)} of ${cap(suit)}.png`)
}

// ── 질문 관리 (story_questions.md) ──────────────────────────
const LINE_RE = /^- \[([ x])\] (\S+)(?: \((\d{4}-\d{2}-\d{2})\))? :: (.+)$/
function readQuestions() {
  const lines = readFileSync(QFILE, 'utf8').split('\n')
  const items = []
  lines.forEach((ln, idx) => { const m = ln.match(LINE_RE); if (m) items.push({ idx, used: m[1] === 'x', slug: m[2], date: m[3] || null, text: m[4].trim() }) })
  return { lines, items }
}
const fmtLine = it => it.used ? `- [x] ${it.slug} (${it.date}) :: ${it.text}` : `- [ ] ${it.slug} :: ${it.text}`
function takeQuestion(slug, items, lines, date) {
  const own = items.filter(it => it.slug === slug)
  let unused = own.filter(it => !it.used)
  if (unused.length === 0) { own.forEach(it => { it.used = false; it.date = null; lines[it.idx] = fmtLine(it) }); unused = own }
  const chosen = pick(unused)
  chosen.used = true; chosen.date = date; lines[chosen.idx] = fmtLine(chosen)
  return chosen.text
}

// ── 카드 78장 no-dup 순환 (story_cards.json) ────────────────
function readCards() { try { return JSON.parse(readFileSync(CFILE, 'utf8')) } catch { return { used: [] } } }
// 그룹: minor는 슈트(같은 슈트끼리 그림 비슷해 회피), major는 각자 고유(서로 충돌 안 함)
const cardGroup = (slug) => MAJORS.has(slug) ? slug : slug.split('-of-')[1]
function take2Cards(state) {
  const picked = []
  for (let k = 0; k < 2; k++) {
    let avail = ALL_CARDS.filter(s => !state.used.includes(s) && !picked.includes(s))
    if (avail.length === 0) { state.used = picked.slice(); avail = ALL_CARDS.filter(s => !picked.includes(s)) } // 한바퀴 끝 → 리셋
    if (k === 1) { const diff = avail.filter(s => cardGroup(s) !== cardGroup(picked[0])); if (diff.length) avail = diff } // 같은 슈트 회피
    const c = pick(avail); picked.push(c); state.used.push(c)
  }
  return picked
}

// ── 이미지 ───────────────────────────────────────────────────
function genStars(count, seed, bright = false) {
  let s = seed >>> 0
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
  const colors = bright ? ['#ffe9b3', '#f4d99f', '#e8d48b', '#ffffff', '#fff5d4'] : ['#e8d48b', '#c9a84c', '#d4b85c', '#b89858', '#8f7a4a']
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = rand() * W, y = rand() * H
    const sz = bright ? (1 + rand() * 2.5) : (0.5 + rand() * 1.8)
    const op = bright ? (0.5 + rand() * 0.5) : (0.25 + rand() * 0.55)
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sz.toFixed(2)}" fill="${colors[Math.floor(rand() * colors.length)]}" opacity="${op.toFixed(2)}"/>`
  }
  return out
}
async function roundImg(buf, w, h, r) {
  // 마스크 가장자리를 블러해서 카드 엣지를 페더 → 배경에 자연스럽게 녹아듦
  const m = `<svg width="${w}" height="${h}"><rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="${r}" ry="${r}" fill="white"/></svg>`
  const mask = await sharp(Buffer.from(m)).blur(7).png().toBuffer()
  return sharp(buf).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
}
async function loadCard(slug, w, h, angle) {
  const p = cardPath(slug)
  if (!existsSync(p)) { console.error(`카드 없음: ${p}`); return null }
  const T = { background: { r: 0, g: 0, b: 0, alpha: 0 } }
  const raw = await sharp(p).resize(w, h, { fit: 'cover', kernel: 'lanczos3' }).modulate({ saturation: 1.08, brightness: 1.02 }).toBuffer()
  const card = await sharp(await roundImg(raw, w, h, 28)).rotate(angle, T).png().toBuffer()
  const cm = await sharp(card).metadata()
  const shadowSvg = `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="28" fill="rgba(0,0,0,0.32)"/></svg>`
  const shadow = await sharp(await sharp(Buffer.from(shadowSvg)).blur(34).png().toBuffer()).rotate(angle, T).png().toBuffer()
  const sm = await sharp(shadow).metadata()
  return { buf: card, w: cm.width, h: cm.height, shadow, sw: sm.width, sh: sm.height }
}
async function renderStory(slug, qtext, frontSlug, backSlug, outDir) {
  const t = TESTS[slug]
  const hook = qtext.split(' / ')
  const seed = (Math.floor(Math.random() * 1e6)) >>> 0
  const backCard = await loadCard(backSlug, 348, 522, -7)
  const frontCard = await loadCard(frontSlug, 384, 576, 5)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="80%"><stop offset="0%" stop-color="#1b1040"/><stop offset="40%" stop-color="#150c30"/><stop offset="78%" stop-color="#0c0820"/><stop offset="100%" stop-color="#06040f"/></radialGradient>
    <radialGradient id="neb" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(150,90,180,0.18)"/><stop offset="100%" stop-color="rgba(150,90,180,0)"/></radialGradient>
    <radialGradient id="warmBloom" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(235,205,135,0.20)"/><stop offset="55%" stop-color="rgba(190,140,205,0.07)"/><stop offset="100%" stop-color="rgba(20,10,40,0)"/></radialGradient>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="goldDiv" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#c9a84c" stop-opacity="0"/><stop offset="50%" stop-color="#e8d48b" stop-opacity="0.95"/><stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/></linearGradient>
    <linearGradient id="ctaFill" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(238,210,140,0.96)"/><stop offset="100%" stop-color="rgba(206,172,84,0.96)"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="540" cy="960" rx="620" ry="520" fill="url(#neb)"/>
  ${genStars(280, seed, false)}
  ${genStars(80, seed + 12345, true)}
  <ellipse cx="540" cy="950" rx="450" ry="380" fill="url(#warmBloom)"/>
  <text x="540" y="225" text-anchor="middle" font-family="${KO_STACK}" font-size="30" fill="rgba(232,212,139,0.9)" letter-spacing="12" font-weight="300">${EYEBROW}</text>
  <rect x="400" y="250" width="280" height="2" fill="url(#goldDiv)"/>
  <g filter="url(#softGlow)">
    <text x="540" y="400" text-anchor="middle" font-family="${KO_STACK}" font-size="60" fill="#F4F8FF" font-weight="300" letter-spacing="1">${hook[0]}</text>
    <text x="540" y="485" text-anchor="middle" font-family="${KO_STACK}" font-size="60" fill="#F4F8FF" font-weight="300" letter-spacing="1">${hook[1] || ''}</text>
  </g>
  <rect x="345" y="1306" width="390" height="2" fill="url(#goldDiv)"/>
  <text x="540" y="1353" text-anchor="middle" font-family="${KO_STACK}" font-size="30" fill="rgba(232,212,139,0.95)" font-weight="300" letter-spacing="3">${t.midline}</text>
  <rect x="345" y="1380" width="390" height="2" fill="url(#goldDiv)"/>
  <text x="540" y="1850" text-anchor="middle" font-family="${KO_STACK}" font-size="24" fill="rgba(232,212,139,0.5)" letter-spacing="4">@lovtarot_</text>
</svg>`
  let base = await sharp(Buffer.from(svg)).png().toBuffer()
  const comps = []
  const place = (c, cx, cy) => { if (!c) return; comps.push({ input: c.shadow, left: Math.round(cx - c.sw / 2), top: Math.round(cy - c.sh / 2 + 8) }); comps.push({ input: c.buf, left: Math.round(cx - c.w / 2), top: Math.round(cy - c.h / 2) }) }
  place(backCard, 428, 945)
  place(frontCard, 668, 965)
  base = await sharp(base).composite(comps).png({ quality: 92 }).toBuffer()
  mkdirSync(resolve(rootDir, outDir), { recursive: true })
  writeFileSync(resolve(rootDir, outDir, 'story01.png'), base)
}

function writeStoryTxt(outDir, slug, qtext, front, back, date, dayLabel) {
  const t = TESTS[slug]
  const link = `${t.url}?utm_source=instagram&utm_medium=story`
  let txt = `LOVTARO 심리테스트 스토리 - ${date}${dayLabel ? ` (${dayLabel})` : ''}\n`
  txt += `IG 링크 스티커를 아래 링크로 연결하세요.\n\n`
  txt += `파일: story01.png\n`
  txt += `테스트: ${t.label} (${slug})\n`
  txt += `질문: ${qtext.replace(' / ', ' ')}\n`
  txt += `링크: ${link}\n`
  txt += `카드: 앞=${front} / 뒤=${back}\n`
  writeFileSync(resolve(rootDir, outDir, 'story.txt'), txt)
}

async function main() {
  const mode = process.argv[2] || 'week'
  const { lines, items } = readQuestions()
  const cardState = readCards()

  if (mode === 'week') {
    const monday = process.argv[3]
    if (!/^\d{4}-\d{2}-\d{2}$/.test(monday || '')) { console.error('사용: node scripts/generate-story-tests.mjs week <월요일 YYYY-MM-DD>'); process.exit(1) }
    const [y, m, d] = monday.split('-').map(Number)
    const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri']
    const dayKr = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금' }
    const assigned = shuffle(ORDER) // 테스트 5개 → 월~금 랜덤 배치
    console.log(`=== 스토리 5개 생성 (주: ${monday} 월~금) ===`)
    for (let i = 0; i < 5; i++) {
      const dateStr = new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10)
      const day = dayNames[i]
      const outDir = `content-output/${dateStr}_${day}`
      const slug = assigned[i]
      const qtext = takeQuestion(slug, items, lines, dateStr)
      const [front, back] = take2Cards(cardState)
      await renderStory(slug, qtext, front, back, outDir)
      writeStoryTxt(outDir, slug, qtext, front, back, dateStr, dayKr[day])
      console.log(`✅ ${dateStr}_${day}: ${TESTS[slug].label} | ${qtext.replace(' / ', ' ')} | 앞=${front}/뒤=${back}`)
    }
  } else {
    const slug = mode, outDir = process.argv[3], date = process.argv[4] || new Date().toISOString().slice(0, 10)
    if (!TESTS[slug] || !outDir) { console.error('사용: node scripts/generate-story-tests.mjs <slug> <outDir> [date]'); process.exit(1) }
    const qtext = takeQuestion(slug, items, lines, date)
    const [front, back] = take2Cards(cardState)
    await renderStory(slug, qtext, front, back, outDir)
    writeStoryTxt(outDir, slug, qtext, front, back, date, '')
    console.log(`✅ ${outDir}: ${TESTS[slug].label} | ${qtext.replace(' / ', ' ')} | 앞=${front}/뒤=${back}`)
  }

  writeFileSync(QFILE, lines.join('\n'))
  writeFileSync(CFILE, JSON.stringify({ used: cardState.used }, null, 0) + '\n')
  console.log(`📄 story_questions.md(질문) + story_cards.json(카드 ${cardState.used.length}/78) 갱신 완료`)
}
main().catch(err => { console.error('❌:', err); process.exit(1) })
