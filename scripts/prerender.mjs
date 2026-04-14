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
    title: '타로 카드 의미 사전 - 메이저·마이너 아르카나 78장 정방향 역방향 해석 | Lovtaro',
    description: '타로 카드 의미 총정리. 메이저 아르카나 22장과 마이너 아르카나 56장(컵, 펜타클, 소드, 완드) 정방향·역방향 뜻과 연애 해석. 78장 타로 카드 의미 사전.',
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

// Minor Arcana card data (mirrors src/data/minorArcana.js)
const MINOR_CARDS = [
  // Cups
  { id: 'ace-of-cups',      name: '컵 에이스',     nameEn: 'Ace of Cups',      keywords: ['새로운 사랑', '감정의 시작', '풍요로운 마음'] },
  { id: 'two-of-cups',      name: '컵 2',           nameEn: 'Two of Cups',      keywords: ['상호 감정', '연결', '조화로운 만남'] },
  { id: 'three-of-cups',    name: '컵 3',           nameEn: 'Three of Cups',    keywords: ['축하', '기쁨', '함께하는 행복'] },
  { id: 'four-of-cups',     name: '컵 4',           nameEn: 'Four of Cups',     keywords: ['권태', '성찰', '새로운 관점'] },
  { id: 'five-of-cups',     name: '컵 5',           nameEn: 'Five of Cups',     keywords: ['상실', '후회', '슬픔'] },
  { id: 'six-of-cups',      name: '컵 6',           nameEn: 'Six of Cups',      keywords: ['추억', '재회', '순수한 마음'] },
  { id: 'seven-of-cups',    name: '컵 7',           nameEn: 'Seven of Cups',    keywords: ['환상', '선택', '혼란'] },
  { id: 'eight-of-cups',    name: '컵 8',           nameEn: 'Eight of Cups',    keywords: ['떠남', '포기', '더 깊은 것을 향해'] },
  { id: 'nine-of-cups',     name: '컵 9',           nameEn: 'Nine of Cups',     keywords: ['소원 성취', '만족', '행복'] },
  { id: 'ten-of-cups',      name: '컵 10',          nameEn: 'Ten of Cups',      keywords: ['완전한 행복', '관계의 완성', '진정한 사랑'] },
  { id: 'page-of-cups',     name: '컵 페이지',      nameEn: 'Page of Cups',     keywords: ['새로운 감정', '메시지', '감수성'] },
  { id: 'knight-of-cups',   name: '컵 나이트',      nameEn: 'Knight of Cups',   keywords: ['로맨틱', '감정적 행동', '구애'] },
  { id: 'queen-of-cups',    name: '컵 여왕',        nameEn: 'Queen of Cups',    keywords: ['공감', '직관', '깊은 감정'] },
  { id: 'king-of-cups',     name: '컵 킹',          nameEn: 'King of Cups',     keywords: ['감정적 성숙', '안정', '이해'] },
  // Pentacles
  { id: 'ace-of-pentacles',    name: '펜타클 에이스', nameEn: 'Ace of Pentacles',    keywords: ['새로운 시작', '현실적 기반', '기회'] },
  { id: 'two-of-pentacles',    name: '펜타클 2',      nameEn: 'Two of Pentacles',    keywords: ['균형', '조율', '유연함'] },
  { id: 'three-of-pentacles',  name: '펜타클 3',      nameEn: 'Three of Pentacles',  keywords: ['협력', '함께 만들어가는 것', '성장'] },
  { id: 'four-of-pentacles',   name: '펜타클 4',      nameEn: 'Four of Pentacles',   keywords: ['안전', '집착', '통제'] },
  { id: 'five-of-pentacles',   name: '펜타클 5',      nameEn: 'Five of Pentacles',   keywords: ['결핍', '고난', '외로움'] },
  { id: 'six-of-pentacles',    name: '펜타클 6',      nameEn: 'Six of Pentacles',    keywords: ['나눔', '균형 잡힌 관계', '베풂'] },
  { id: 'seven-of-pentacles',  name: '펜타클 7',      nameEn: 'Seven of Pentacles',  keywords: ['인내', '기다림', '중간 점검'] },
  { id: 'eight-of-pentacles',  name: '펜타클 8',      nameEn: 'Eight of Pentacles',  keywords: ['노력', '성실함', '꾸준한 발전'] },
  { id: 'nine-of-pentacles',   name: '펜타클 9',      nameEn: 'Nine of Pentacles',   keywords: ['독립', '풍요', '자기 완성'] },
  { id: 'ten-of-pentacles',    name: '펜타클 10',     nameEn: 'Ten of Pentacles',    keywords: ['안정', '함께 쌓은 것', '오래가는 사랑'] },
  { id: 'page-of-pentacles',   name: '펜타클 페이지', nameEn: 'Page of Pentacles',   keywords: ['탐구', '배움', '새로운 기회'] },
  { id: 'knight-of-pentacles', name: '펜타클 나이트', nameEn: 'Knight of Pentacles', keywords: ['성실함', '신뢰', '꾸준함'] },
  { id: 'queen-of-pentacles',  name: '펜타클 여왕',   nameEn: 'Queen of Pentacles',  keywords: ['실용적 사랑', '풍요', '안정적 돌봄'] },
  { id: 'king-of-pentacles',   name: '펜타클 킹',     nameEn: 'King of Pentacles',   keywords: ['안정적 성공', '신뢰', '든든한 보호'] },
  // Swords
  { id: 'ace-of-swords',    name: '소드 에이스', nameEn: 'Ace of Swords',    keywords: ['명확함', '진실', '결단'] },
  { id: 'two-of-swords',    name: '소드 2',      nameEn: 'Two of Swords',    keywords: ['결정 회피', '균형', '긴장'] },
  { id: 'three-of-swords',  name: '소드 3',      nameEn: 'Three of Swords',  keywords: ['이별', '상처', '슬픔'] },
  { id: 'four-of-swords',   name: '소드 4',      nameEn: 'Four of Swords',   keywords: ['휴식', '회복', '내면의 고요'] },
  { id: 'five-of-swords',   name: '소드 5',      nameEn: 'Five of Swords',   keywords: ['갈등', '충돌', '상처를 남기는 승리'] },
  { id: 'six-of-swords',    name: '소드 6',      nameEn: 'Six of Swords',    keywords: ['전환', '이동', '나아감'] },
  { id: 'seven-of-swords',  name: '소드 7',      nameEn: 'Seven of Swords',  keywords: ['기만', '회피', '숨겨진 것'] },
  { id: 'eight-of-swords',  name: '소드 8',      nameEn: 'Eight of Swords',  keywords: ['속박', '제한', '스스로 만든 감옥'] },
  { id: 'nine-of-swords',   name: '소드 9',      nameEn: 'Nine of Swords',   keywords: ['불안', '걱정', '과도한 생각'] },
  { id: 'ten-of-swords',    name: '소드 10',     nameEn: 'Ten of Swords',    keywords: ['끝', '배신', '완전한 마무리'] },
  { id: 'page-of-swords',   name: '소드 페이지', nameEn: 'Page of Swords',   keywords: ['호기심', '경계심', '새로운 소식'] },
  { id: 'knight-of-swords', name: '소드 나이트', nameEn: 'Knight of Swords', keywords: ['돌진', '급진적 행동', '갈등'] },
  { id: 'queen-of-swords',  name: '소드 여왕',   nameEn: 'Queen of Swords',  keywords: ['독립적', '명석함', '냉정한 판단'] },
  { id: 'king-of-swords',   name: '소드 킹',     nameEn: 'King of Swords',   keywords: ['이성', '공정함', '결단력'] },
  // Wands
  { id: 'ace-of-wands',    name: '완드 에이스', nameEn: 'Ace of Wands',    keywords: ['열정', '영감', '불꽃 같은 시작'] },
  { id: 'two-of-wands',    name: '완드 2',      nameEn: 'Two of Wands',    keywords: ['계획', '가능성', '더 넓은 세계'] },
  { id: 'three-of-wands',  name: '완드 3',      nameEn: 'Three of Wands',  keywords: ['확장', '기다림', '전진'] },
  { id: 'four-of-wands',   name: '완드 4',      nameEn: 'Four of Wands',   keywords: ['축하', '기쁨', '안정된 행복'] },
  { id: 'five-of-wands',   name: '완드 5',      nameEn: 'Five of Wands',   keywords: ['경쟁', '갈등', '혼란'] },
  { id: 'six-of-wands',    name: '완드 6',      nameEn: 'Six of Wands',    keywords: ['승리', '인정', '자신감'] },
  { id: 'seven-of-wands',  name: '완드 7',      nameEn: 'Seven of Wands',  keywords: ['방어', '인내', '자기 입장 지키기'] },
  { id: 'eight-of-wands',  name: '완드 8',      nameEn: 'Eight of Wands',  keywords: ['빠른 전개', '메시지', '신속한 움직임'] },
  { id: 'nine-of-wands',   name: '완드 9',      nameEn: 'Nine of Wands',   keywords: ['회복력', '경계', '마지막 힘'] },
  { id: 'ten-of-wands',    name: '완드 10',     nameEn: 'Ten of Wands',    keywords: ['과부하', '책임', '무거운 짐'] },
  { id: 'page-of-wands',   name: '완드 페이지', nameEn: 'Page of Wands',   keywords: ['열정', '탐험', '새로운 아이디어'] },
  { id: 'knight-of-wands', name: '완드 나이트', nameEn: 'Knight of Wands', keywords: ['모험', '자유', '열정적 행동'] },
  { id: 'queen-of-wands',  name: '완드 여왕',   nameEn: 'Queen of Wands',  keywords: ['자신감', '카리스마', '따뜻한 열정'] },
  { id: 'king-of-wands',   name: '완드 킹',     nameEn: 'King of Wands',   keywords: ['리더십', '비전', '추진력'] },
]

// Major Arcana slug mapping for OG images (matches cardImages.js)
const OG_SLUG_MAP = {
  priestess: 'high-priestess',
  wheel: 'wheel-of-fortune',
  hanged: 'hanged-man',
}

// Generate card detail routes from card data
for (const card of [...CARDS, ...MINOR_CARDS]) {
  const ogSlug = OG_SLUG_MAP[card.id] || card.id
  ROUTES.push({
    path: `/cards/${card.id}`,
    title: `${card.name}(${card.nameEn}) 타로 카드 의미 - 정방향 역방향 연애 해석 | Lovtaro`,
    description: `${card.name}(${card.nameEn}) 타로 카드 정방향·역방향 의미와 연애 해석. 키워드: ${card.keywords.join(', ')}. 무료 타로 카드 의미 사전.`,
    ogImage: `${SITE_URL}/images/cards-png/${ogSlug}.png`,
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
