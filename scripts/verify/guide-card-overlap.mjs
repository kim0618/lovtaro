/**
 * 가이드-카드 본문 의미 중복 감지 스크립트
 *
 * 카드 해석 가이드(category: card-interpretation)의 본문/FAQ와
 * 해당 카드 cardDictionary.js / minorArcana.js 블록의 본문을 N-gram으로 비교해
 * 연속 15자 이상 공유하는 문자열을 리포트한다.
 *
 * 사용:
 *   node scripts/verify/guide-card-overlap.mjs              # 전체 가이드 전수
 *   node scripts/verify/guide-card-overlap.mjs star         # 특정 슬러그 (부분 매치)
 *
 * 출력: 중복 의심 구간만. 문제 없으면 OK만 출력.
 */

import guides from '../../src/data/guides/index.js'
import { CARD_DICTIONARY } from '../../src/data/cardDictionary.js'
import { MINOR_ARCANA } from '../../src/data/minorArcana.js'

const MIN_OVERLAP = 15 // 연속 n자 이상 공유 시 경고
const ALL_CARDS = { ...CARD_DICTIONARY, ...MINOR_ARCANA }

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
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
  return [
    card.upright.core,
    card.upright.love,
    card.upright.advice,
    card.reversed.core,
    card.reversed.love,
    card.reversed.advice,
  ].join('\n')
}

function loadGuideBlocks(guide) {
  const blocks = []
  for (const section of guide.sections || []) {
    blocks.push({
      loc: `section: ${section.heading}`,
      text: stripHtml(section.content),
    })
  }
  for (const [i, faq] of (guide.faq || []).entries()) {
    blocks.push({
      loc: `FAQ${i + 1}: ${faq.question.substring(0, 40)}...`,
      text: faq.answer,
    })
  }
  return blocks
}

function checkGuide(guide) {
  if (guide.category !== 'card-interpretation') return { skipped: true, reason: 'not card-interpretation' }
  const cardId = extractCardId(guide.slug)
  if (!cardId) return { skipped: true, reason: 'no card id from slug' }
  const card = ALL_CARDS[cardId]
  if (!card) return { skipped: true, reason: `card '${cardId}' not found` }

  const cardText = loadCardText(card)
  const blocks = loadGuideBlocks(guide)

  const findings = []
  for (const b of blocks) {
    const overlaps = findMaxSharedSubstrings(b.text, cardText)
    if (overlaps.length > 0) {
      findings.push({ loc: b.loc, overlaps })
    }
  }
  return { cardId, findings }
}

const arg = process.argv[2]
const target = arg ? guides.filter(g => g.slug.includes(arg)) : guides

let totalIssues = 0
let totalGuides = 0

for (const guide of target) {
  const result = checkGuide(guide)
  if (result.skipped) {
    console.log(`[SKIP] ${guide.slug}: ${result.reason}`)
    continue
  }
  totalGuides++
  console.log(`\n=== ${guide.slug} (card: ${result.cardId}) ===`)
  if (result.findings.length === 0) {
    console.log(`  OK - 중복 없음`)
    continue
  }
  for (const f of result.findings) {
    totalIssues++
    console.log(`  [${f.loc}]`)
    for (const o of f.overlaps) {
      console.log(`    겹침 ${o.len}자: "${o.text}"`)
    }
  }
}

console.log(`\n--- 요약 ---`)
console.log(`검사 대상: ${totalGuides}개 가이드`)
console.log(`중복 의심 문단: ${totalIssues}건`)
if (totalIssues > 0) {
  console.log(`\n→ 겹침이 감지된 문단을 심화·사례·다른 관점으로 재작성 권장`)
  console.log(`→ 임계치: 연속 ${MIN_OVERLAP}자 이상 공유. 짧은 정형 표현("~할 수 있어요" 등)은 무시해도 됨`)
}

process.exit(totalIssues > 0 ? 1 : 0)
