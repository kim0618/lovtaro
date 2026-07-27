/**
 * 가이드·꿈해몽 ↔ 카드 본문 의미 중복 감지 스크립트
 *
 * 글의 본문/FAQ와 카드 cardDictionary.js / minorArcana.js 블록의 본문을
 * N-gram으로 비교해 연속 n자 이상 공유하는 문자열을 리포트한다.
 *
 * 카드 출처 결정 (2026-07-27 확장):
 *   - 카드 해석 가이드(category: card-interpretation): slug에서 카드 id를 뽑아 그 카드와 대조
 *   - 그 외 가이드(situation/method/faq) + 꿈해몽 전체: relatedCards 배열의 카드들과 대조
 *
 * 배경 (2026-07-27 회고): 이전 버전은 slug에서 카드 id를 못 뽑으면 SKIP했다.
 * 그 결과 ①상황·방법론 가이드 전부가 검사 밖이었고 ②꿈해몽 60편은 import조차 되지
 * 않아 단 한 번도 측정된 적이 없었다. 두 유형 모두 relatedCards를 갖고 있으므로
 * 이를 카드 출처로 삼아 사각지대를 없앤다. 실제로 이 확장으로 기존 발행분
 * reunion-tarot-cards에서 eight-of-cups와 22자 겹침이 뒤늦게 발견됐다.
 *
 * 사용:
 *   node scripts/verify/guide-card-overlap.mjs              # 가이드+꿈해몽 전수
 *   node scripts/verify/guide-card-overlap.mjs star         # 특정 슬러그 (부분 매치)
 *
 * 출력: 중복 의심 구간만. 문제 없으면 OK만 출력.
 */

import guides from '../../src/data/guides/index.js'
import dreams from '../../src/data/dreams/index.js'
import { CARD_DICTIONARY } from '../../src/data/cardDictionary.js'
import { MINOR_ARCANA } from '../../src/data/minorArcana.js'

const MIN_OVERLAP = 13 // 연속 n자 이상 공유 시 경고 (공백·구두점 제거 기준, 2026-07-20 재보정)
const ALL_CARDS = { ...CARD_DICTIONARY, ...MINOR_ARCANA }

/**
 * HTML 제거 + 정규화.
 * 공백뿐 아니라 구두점까지 제거한다 (2026-07-20 보강).
 * 배경: 공백만 정규화하면 원본 문장에 쉼표 하나만 끼워넣어도 N-gram 창이 끊겨
 * 재서술이 검출을 우회한다. page-of-pentacles 가이드 FAQ가
 * "상대가 나를 천천히, 진지하게 알아가는 중"으로 원본("천천히 진지하게")을
 * 17자 재서술했는데 쉼표 때문에 통과된 사례가 있었다.
 */
function stripHtml(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/[,.·:;!?"'()\[\]“”‘’]/g, '')
    .replace(/\s+/g, '')
    .trim()
}

function extractCardId(slug) {
  const suffixes = ['-love-meaning', '-love-interpretation']
  for (const s of suffixes) {
    if (slug.endsWith(s)) return slug.slice(0, -s.length)
  }
  return null
}

/**
 * a에서 시작해 b에도 포함되는 최대 substring을 i별로 찾는다.
 * 겹치는 결과는 병합해서 중복 없는 구간 리스트 반환.
 */
function findMaxSharedSubstrings(a, b, minLen = MIN_OVERLAP) {
  const hits = []
  for (let i = 0; i < a.length; i++) {
    let maxLen = 0
    for (let len = minLen; i + len <= a.length; len++) {
      if (b.includes(a.substring(i, i + len))) {
        maxLen = len
      } else {
        break
      }
    }
    if (maxLen > 0) {
      hits.push({ start: i, len: maxLen, text: a.substring(i, i + maxLen) })
    }
  }
  // 겹치는 결과 병합
  const merged = []
  for (const h of hits) {
    const last = merged[merged.length - 1]
    if (last && h.start <= last.start + last.len) {
      const newEnd = Math.max(last.start + last.len, h.start + h.len)
      last.len = newEnd - last.start
      last.text = a.substring(last.start, newEnd)
    } else {
      merged.push({ ...h })
    }
  }
  return merged
}

function loadCardText(card) {
  // 가이드 쪽(stripHtml)과 반드시 같은 정규화를 적용해야 한다.
  // 한쪽만 정규화하면 비대칭 비교가 되어 겹침이 통째로 검출되지 않는다.
  return stripHtml(
    [
      card.upright.core,
      card.upright.love,
      card.upright.advice,
      card.reversed.core,
      card.reversed.love,
      card.reversed.advice,
    ].join('\n')
  )
}

function loadGuideBlocks(guide) {
  const blocks = []
  // 꿈해몽의 summary는 AI 인용 자리라 중복이 특히 치명적 → 검사에 포함
  if (guide.summary) {
    blocks.push({ loc: 'summary', text: stripHtml(guide.summary) })
  }
  for (const section of guide.sections || []) {
    blocks.push({
      loc: `section: ${section.heading}`,
      text: stripHtml(section.content),
    })
  }
  for (const [i, faq] of (guide.faq || []).entries()) {
    blocks.push({
      loc: `FAQ${i + 1}: ${faq.question.substring(0, 40)}...`,
      text: stripHtml(faq.answer),
    })
  }
  return blocks
}

/**
 * 대조할 카드 목록을 결정한다.
 * 카드 해석 가이드는 slug의 주 카드 1장(깊은 대조),
 * 그 외 글은 relatedCards 전부(사각지대 방지).
 */
function resolveCards(item) {
  if (item.category === 'card-interpretation') {
    const cardId = extractCardId(item.slug)
    if (cardId && ALL_CARDS[cardId]) {
      return { mode: 'slug', cards: [{ id: cardId, card: ALL_CARDS[cardId] }] }
    }
  }
  const cards = (item.relatedCards || [])
    .filter(c => ALL_CARDS[c.id])
    .map(c => ({ id: c.id, card: ALL_CARDS[c.id] }))
  return { mode: 'relatedCards', cards }
}

function checkGuide(guide) {
  const { mode, cards } = resolveCards(guide)
  if (cards.length === 0) {
    return { skipped: true, reason: '대조할 카드 없음 (relatedCards 비어 있음)' }
  }

  const blocks = loadGuideBlocks(guide)
  const findings = []
  for (const { id, card } of cards) {
    const cardText = loadCardText(card)
    for (const b of blocks) {
      const overlaps = findMaxSharedSubstrings(b.text, cardText)
      if (overlaps.length > 0) {
        findings.push({ cardId: id, loc: b.loc, overlaps })
      }
    }
  }
  return { mode, cardIds: cards.map(c => c.id), findings }
}

const arg = process.argv[2]
const ALL_ITEMS = [
  ...guides.map(g => ({ kind: 'guide', item: g })),
  ...dreams.map(d => ({ kind: 'dream', item: d })),
]
const target = arg ? ALL_ITEMS.filter(x => x.item.slug.includes(arg)) : ALL_ITEMS

let totalIssues = 0
let totalChecked = 0
const skipped = []
const quiet = !arg // 전수 실행 시엔 OK 항목을 일일이 찍지 않는다 (148편이라 노이즈)

for (const { kind, item } of target) {
  const result = checkGuide(item)
  if (result.skipped) {
    skipped.push(`${kind}:${item.slug} (${result.reason})`)
    continue
  }
  totalChecked++
  if (result.findings.length === 0) {
    if (!quiet) console.log(`\n=== [${kind}] ${item.slug} (${result.cardIds.join(', ')}) ===\n  OK - 중복 없음`)
    continue
  }
  console.log(`\n=== [${kind}] ${item.slug} (${result.mode}) ===`)
  for (const f of result.findings) {
    totalIssues++
    console.log(`  [${f.cardId}] ${f.loc}`)
    for (const o of f.overlaps) {
      console.log(`    겹침 ${o.len}자: "${o.text}"`)
    }
  }
}

console.log(`\n--- 요약 ---`)
console.log(`검사 대상: ${totalChecked}편 (가이드 ${guides.length} + 꿈해몽 ${dreams.length} 중)`)
if (skipped.length) {
  console.log(`대조 카드 없어 건너뜀: ${skipped.length}편`)
  skipped.forEach(s => console.log(`  - ${s}`))
}
console.log(`중복 의심 문단: ${totalIssues}건`)
if (totalIssues > 0) {
  console.log(`\n→ 겹침이 감지된 문단을 심화·사례·다른 관점으로 재작성 권장`)
  console.log(`→ 임계치: 연속 ${MIN_OVERLAP}자 이상 공유. 짧은 정형 표현("~할 수 있어요" 등)은 무시해도 됨`)
}

process.exit(totalIssues > 0 ? 1 : 0)
