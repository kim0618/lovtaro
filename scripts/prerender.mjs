/**
 * Static prerender - meta-tag injection approach.
 *
 * For each route, reads dist/index.html, injects the correct
 * title / description / og tags, and writes to dist/[path]/index.html.
 *
 * No browser required. Covers the main SEO benefit: crawlers and social
 * media scrapers receive per-page head content instead of the generic
 * fallback from index.html.
 *
 * Run after `vite build` via the postbuild npm hook.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '../dist')
const SITE_URL = 'https://lovtaro.kr'

// ── Card data (mirrors src/data/tarotCards.js) ────────────────────────────
const CARDS = [
  { id: 'fool',       name: '바보',             nameEn: 'The Fool',           keywords: ['새로운 시작', '가능성', '순수함'] },
  { id: 'magician',   name: '마법사',           nameEn: 'The Magician',       keywords: ['의지', '창조', '실현'] },
  { id: 'priestess',  name: '여사제',           nameEn: 'The High Priestess', keywords: ['직관', '신비', '내면의 지혜'] },
  { id: 'empress',    name: '여황제',           nameEn: 'The Empress',        keywords: ['풍요', '사랑', '돌봄'] },
  { id: 'emperor',    name: '황제',             nameEn: 'The Emperor',        keywords: ['안정', '책임', '구조'] },
  { id: 'hierophant', name: '교황',             nameEn: 'The Hierophant',     keywords: ['전통', '신뢰', '가르침'] },
  { id: 'lovers',     name: '연인',             nameEn: 'The Lovers',         keywords: ['선택', '관계', '조화'] },
  { id: 'chariot',    name: '전차',             nameEn: 'The Chariot',        keywords: ['전진', '의지', '승리'] },
  { id: 'strength',   name: '힘',               nameEn: 'Strength',           keywords: ['용기', '인내', '내면의 힘'] },
  { id: 'hermit',     name: '은둔자',           nameEn: 'The Hermit',         keywords: ['내면', '거리', '성찰'] },
  { id: 'wheel',      name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune',   keywords: ['변화', '흐름', '전환'] },
  { id: 'justice',    name: '정의',             nameEn: 'Justice',            keywords: ['균형', '진실', '결과'] },
  { id: 'hanged',     name: '매달린 사람',     nameEn: 'The Hanged Man',     keywords: ['기다림', '정지', '관점'] },
  { id: 'death',      name: '죽음',             nameEn: 'Death',              keywords: ['끝', '변환', '재탄생'] },
  { id: 'temperance', name: '절제',             nameEn: 'Temperance',         keywords: ['조화', '균형', '인내'] },
  { id: 'devil',      name: '악마',             nameEn: 'The Devil',          keywords: ['집착', '유혹', '속박'] },
  { id: 'tower',      name: '탑',               nameEn: 'The Tower',          keywords: ['변동', '붕괴', '전환점'] },
  { id: 'star',       name: '별',               nameEn: 'The Star',           keywords: ['희망', '치유', '믿음'] },
  { id: 'moon',       name: '달',               nameEn: 'The Moon',           keywords: ['불확실', '감정', '직관'] },
  { id: 'sun',        name: '태양',             nameEn: 'The Sun',            keywords: ['기쁨', '성공', '활력'] },
  { id: 'judgement',  name: '심판',             nameEn: 'Judgement',          keywords: ['각성', '재평가', '부름'] },
  { id: 'world',      name: '세계',             nameEn: 'The World',          keywords: ['완성', '성취', '순환'] },
]

// ── Per-route meta ─────────────────────────────────────────────────────────
const ROUTES = [
  {
    path: '/',
    title: 'Lovtaro | 무료 연애 타로 - 감정의 흐름을 읽는 타로',
    description: '무료 연애 타로 리딩. 상대방 속마음, 재회 가능성, 연락 올까 타로, 러브타로 스프레드까지. 관계의 결을 깊고 조용하게 해석하는 무료 연애 타로, Lovtaro.',
  },
  {
    path: '/today',
    title: '오늘의 연애 타로 - 하루의 감정 기류 | Lovtaro',
    description: '오늘 하루 어떤 연애 에너지가 흐르고 있는지 타로 카드 한 장으로 읽어봅니다. 매일 새로운 카드, 매일 새로운 메시지.',
  },
  {
    path: '/reading/love',
    title: '러브타로 - 두 사람의 마음과 관계의 방향 | Lovtaro',
    description: '나의 마음, 상대의 에너지, 관계의 방향. 세 장의 카드로 사랑의 흐름을 깊이 읽어봅니다. 무료 러브타로 스프레드 리딩.',
  },
  {
    path: '/reading/mind',
    title: '상대방 속마음 타로 - 그 사람의 마음 읽기 | Lovtaro',
    description: '그 사람이 지금 나를 어떻게 생각하는지, 상대의 속마음을 타로 카드로 읽어봅니다. 무료 상대방 마음 타로 리딩.',
  },
  {
    path: '/reading/reunion',
    title: '재회 가능성 타로 - 다시 만날 수 있을까 | Lovtaro',
    description: '다시 만날 수 있는 흐름인지, 재회의 가능성을 타로 카드로 조용히 살펴봅니다. 무료 재회 타로 리딩.',
  },
  {
    path: '/reading/contact',
    title: '연락 올까 타로 - 그 사람에게서 연락이 올까 | Lovtaro',
    description: '그 사람에게서 연락이 올지, 연락의 기류가 흐르고 있는지 타로 카드로 읽어봅니다. 무료 연락 타로 리딩.',
  },
  {
    path: '/reading/yesno',
    title: 'Yes/No 타로 - 예스노 타로로 답을 확인하세요 | Lovtaro',
    description: '지금 궁금한 것에 대해 타로 카드가 Yes, No, Maybe로 답해드립니다. 무료 예스노 타로 리딩.',
  },
  {
    path: '/reading/compatibility',
    title: '궁합 타로 - 두 사람의 케미를 카드로 확인하세요 | Lovtaro',
    description: '나와 상대의 카드를 한 장씩 뽑아 궁합을 확인합니다. 두 사람의 에너지, 케미, 궁합 점수를 무료로 리딩합니다.',
  },
  {
    path: '/reading/3cards',
    title: '3장 리딩 - 과거, 현재, 미래 흐름 읽기 | Lovtaro',
    description: '과거, 현재, 미래 세 장의 카드로 관계의 흐름을 깊이 살펴봅니다. 무료 타로 3장 스프레드 리딩.',
  },
  {
    path: '/history',
    title: '리딩 기록 | Lovtaro',
    description: '나의 타로 리딩 기록을 확인합니다.',
  },
  {
    path: '/cards',
    title: '타로 카드 의미 사전 - 메이저 아르카나 22장 정방향 역방향 해석 | Lovtaro',
    description: '타로 카드 의미 총정리. 메이저 아르카나 22장의 정방향·역방향 뜻과 연애 해석. 바보, 마법사, 여사제, 여황제, 황제, 교황, 연인, 전차, 힘, 은둔자, 운명의 수레바퀴, 정의, 매달린 사람, 죽음, 절제, 악마, 탑, 별, 달, 태양, 심판, 세계 카드 해설.',
  },
  {
    path: '/link',
    title: 'Lovtaro | 무료 연애 타로 리딩',
    description: '상대방 속마음, 재회 가능성, 연락 올까 타로, 러브타로 스프레드까지. 무료 연애 타로 리딩, Lovtaro.',
  },
  {
    path: '/privacy',
    title: '개인정보처리방침 | Lovtaro',
    description: 'Lovtaro 개인정보처리방침 안내.',
  },
]

// Generate card detail routes from card data
for (const card of CARDS) {
  ROUTES.push({
    path: `/cards/${card.id}`,
    title: `${card.name}(${card.nameEn}) 타로 카드 의미 - 정방향 역방향 연애 해석 | Lovtaro`,
    description: `${card.name}(${card.nameEn}) 타로 카드 정방향·역방향 의미와 연애 해석. 키워드: ${card.keywords.join(', ')}. 무료 타로 카드 의미 사전.`,
    ogImage: `${SITE_URL}/cards-png/${card.id}.png`,
  })
}

// ── Meta injection ─────────────────────────────────────────────────────────
function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function injectMeta(html, { path: urlPath, title, description, ogImage }) {
  const url = `${SITE_URL}${urlPath}`
  const safeTitle = escapeAttr(title)
  const safeDesc = escapeAttr(description)
  const safeUrl = escapeAttr(url)
  const safeImg = escapeAttr(ogImage || `${SITE_URL}/og-image.png`)

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)

  // twitter:title / twitter:description use name= attribute
  html = html.replace(
    /(<meta name="description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`,
  )
  html = html.replace(
    /(<meta name="twitter:title"\s+content=")[^"]*(")/,
    `$1${safeTitle}$2`,
  )
  html = html.replace(
    /(<meta name="twitter:description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`,
  )
  html = html.replace(
    /(<meta name="twitter:image"\s+content=")[^"]*(")/,
    `$1${safeImg}$2`,
  )

  // og: tags use property= attribute
  html = html.replace(
    /(<meta property="og:title"\s+content=")[^"]*(")/,
    `$1${safeTitle}$2`,
  )
  html = html.replace(
    /(<meta property="og:description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`,
  )
  html = html.replace(
    /(<meta property="og:url"\s+content=")[^"]*(")/,
    `$1${safeUrl}$2`,
  )
  html = html.replace(
    /(<meta property="og:image"\s+content=")[^"]*(")/,
    `$1${safeImg}$2`,
  )

  // canonical + alternate hreflang
  html = html.replace(
    /(<link rel="canonical"\s+href=")[^"]*(")/,
    `$1${safeUrl}$2`,
  )
  html = html.replace(
    /(<link rel="alternate"\s+hreflang="ko"\s+href=")[^"]*(")/,
    `$1${safeUrl}$2`,
  )

  return html
}

// ── Main ──────────────────────────────────────────────────────────────────
function run() {
  const indexPath = path.join(DIST, 'index.html')
  if (!fs.existsSync(indexPath)) {
    console.error('[prerender] dist/index.html not found - run vite build first')
    process.exit(1)
  }

  const baseHtml = fs.readFileSync(indexPath, 'utf8')
  let success = 0

  for (const route of ROUTES) {
    const html = injectMeta(baseHtml, route)

    if (route.path === '/') {
      fs.writeFileSync(indexPath, html, 'utf8')
    } else {
      const dir = path.join(DIST, route.path)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8')
    }

    console.log(`  ✓ ${route.path}`)
    success++
  }

  console.log(`\n[prerender] ${success} pages written`)
}

run()
