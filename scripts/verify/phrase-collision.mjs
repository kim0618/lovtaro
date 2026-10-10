/**
 * 교체·신규 작성할 문장을 **쓰기 전에** 전체 코퍼스와 대조한다.
 *
 * ⚠️ 배경 (2026-10-10): 중복 제거를 하면서 새로 쓴 문장 25개 중 **11개가 또 다른 글과
 * 14자 이상 겹쳤다.** 사람(AI)이 "충분히 다르게 썼다"고 느낀 문장이 실제로는
 * '짝사랑·연인·상대방 자리에서 각각'(15자)처럼 사이트 공용 열거를 그대로 물고 있었다.
 * 쓰고 나서 U로 잡으면 이미 파일이 바뀐 뒤라 되돌리기가 번거롭다. 쓰기 전에 걸러라.
 *
 * 사용:
 *   SLUG=<내 글 slug> PHRASE='새로 쓸 문장' node scripts/verify/phrase-collision.mjs
 *   SLUG=<slug> FILE=/tmp/candidates.txt node scripts/verify/phrase-collision.mjs   (한 줄에 한 문장)
 *
 * SLUG은 그 문장이 들어갈 글이다(자기 자신은 비교 대상에서 뺀다).
 * FAQ 답변이면 FAQ=1을 함께 줘라. 자기 본문과의 20자 중복(R-1)까지 본다.
 *
 * 🛑 유령 충돌 함정 3종 (전부 2026-10-10에 실제로 겪었다. 가드를 직접 짤 때 반복하지 말 것)
 *   1. 같은 배치에서 교체될 **옛 문장**이 코퍼스에 남아 있으면 사라질 텍스트와 충돌한다고 보고한다.
 *   2. 본문 속 문장을 **그 본문과** 대조하면 자기 자신이 잡혀 항상 충돌로 나온다.
 *   3. 자체중복(R-1)은 'FAQ 답변 vs 본문'이다. 본문 교체에 적용하면 2번이 된다.
 */
import guides from '/home/tjd618/lovtaro/src/data/guides/index.js'
import dreams from '/home/tjd618/lovtaro/src/data/dreams/index.js'
import fs from 'fs'

const SLUG = process.env.SLUG
const phrases = process.env.FILE
  ? fs.readFileSync(process.env.FILE, 'utf8').split('\n').map(s => s.trim()).filter(Boolean)
  : (process.env.PHRASE ? [process.env.PHRASE] : [])
if (!SLUG || !phrases.length) {
  console.log("사용: SLUG=<slug> PHRASE='문장' node scripts/verify/phrase-collision.mjs")
  process.exit(1)
}

const all = [...guides, ...dreams]
if (!all.some(d => d.slug === SLUG)) console.log('⚠ 참고: SLUG "' + SLUG + '"은 아직 코퍼스에 없는 글이에요 (신규면 정상)')
const norm = s => s.replace(/<[^>]*>/g, '').replace(/\s+/g, '')
const body = d => norm((d.sections || []).map(s => s.content).join(''))
const full = d => body(d) + norm((d.faq || []).map(f => f.question + f.answer).join(''))

const corpus = {}
for (const d of all) corpus[d.slug] = full(d)
const mine = all.find(d => d.slug === SLUG)
const myBody = mine ? body(mine) : ''

let bad = 0
for (const raw of phrases) {
  const N = norm(raw)
  console.log('\n■ ' + raw.slice(0, 60) + (raw.length > 60 ? '…' : '') + '  (' + raw.length + '자)')
  let hit = 0
  for (const [s, t] of Object.entries(corpus)) {
    if (s === SLUG) continue
    for (let i = 0; i + 14 <= N.length;) {
      if (t.includes(N.slice(i, i + 14))) {
        let l = 14; while (i + l < N.length && t.includes(N.slice(i, i + l + 1))) l++
        console.log('   ⚠ 타글 ' + l + '자 ↔ ' + s + ': ' + N.slice(i, i + l)); hit++; bad++; i += l
      } else i++
    }
  }
  if (process.env.FAQ && myBody) {
    for (let i = 0; i + 20 <= N.length;) {
      if (myBody.includes(N.slice(i, i + 20))) {
        let l = 20; while (i + l < N.length && myBody.includes(N.slice(i, i + l + 1))) l++
        console.log('   ⚠ 자기 본문 ' + l + '자 (R-1): ' + N.slice(i, i + l)); hit++; bad++; i += l
      } else i++
    }
  }
  if (!hit) console.log('   ✅ 겹침 없음')
}
console.log(bad ? '\n⚠ 총 ' + bad + '건 - 문장을 고쳐서 다시 돌려라' : '\n✅ 전부 통과')
