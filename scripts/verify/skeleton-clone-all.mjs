/**
 * U-전수. 글↔글 본문 골격 복제를 전 쌍(guides + dreams) 비교로 적발한다.
 *
 * ⚠️ 배경 (2026-10-10 사고): 스킬에 "U는 O(n²)라 전수 실행이 사실상 불가능"이라 적혀 있어서
 * 늘 `SLUG=` 단건 모드로 최근 몇 편만 돌렸다. 2026-10-10 전수 스캔 리포트에
 * "골격 복제 의심 0편"이라 적었는데, 실제로는 12편만 돌린 결과였고 전수로는 242쌍이 나왔다
 * (55자 템플릿을 공유하는 카드 가이드 14편, 56자를 공유하는 holding-hands↔hug 등).
 *
 * 전수가 가능하다. 쌍마다 maximal()을 돌리면 느리지만, 글별 14-gram Set을 미리 만들어
 * 공유 14-gram이 2개 이하인 쌍을 먼저 버리면 190여 편 전 쌍이 수십 초에 끝난다.
 * "전수 불가"라는 기재 자체가 틀렸으니 단건 모드만 돌리고 전수라 적지 말 것.
 *
 * 사용: node scripts/verify/skeleton-clone-all.mjs
 *
 * 판정 기준은 스킬(U 항목)과 동일: 12구절↑ 또는 최장 30자↑ = 복제의심(재집필 검토),
 * 8~11구절 또는 22~29자 = 문장 재사용(최장 구절 3~5개 치환).
 *
 * 실측 기준선 (2026-10-10 1차 정리 후): 전수 191쌍 = 복제의심 48(전부 카드 가이드 레이어)
 * + 문장재사용 143. 꿈해몽 레이어 복제의심은 0쌍. 이 수치보다 올라가면 신규 유입이다.
 */
import guides from '/home/tjd618/lovtaro/src/data/guides/index.js'
import dreams from '/home/tjd618/lovtaro/src/data/dreams/index.js'

const all = [...guides, ...dreams]
const norm = s => s.replace(/<[^>]*>/g, '').replace(/\s+/g, '')
const txt = d => norm((d.sections || []).map(s => s.content).join('') + (d.faq || []).map(f => f.question + f.answer).join(''))

const T = {}, G = {}
for (const d of all) {
  const t = txt(d); T[d.slug] = t
  const s = new Set()
  for (let i = 0; i + 14 <= t.length; i++) s.add(t.slice(i, i + 14))
  G[d.slug] = s
}

// 최대 구절 단위로만 센다. 매치되면 그 구간 끝으로 점프해야 한 문장이 여러 건으로 부풀지 않는다
const maximal = (B, Tt, W = 14) => {
  const out = []
  for (let i = 0; i + W <= B.length;) {
    if (Tt.includes(B.slice(i, i + W))) {
      let len = W; while (i + len < B.length && Tt.includes(B.slice(i, i + len + 1))) len++
      out.push(B.slice(i, i + len)); i += len
    } else i++
  }
  return out
}

const slugs = all.map(d => d.slug), out = []
for (let a = 0; a < slugs.length; a++) for (let b = a + 1; b < slugs.length; b++) {
  const A = slugs[a], B = slugs[b]
  let shared = 0
  for (const g of G[A]) if (G[B].has(g)) { shared++; if (shared > 2) break }
  if (shared <= 2) continue                      // 사전 필터: 여기서 대부분 버려진다
  const m = maximal(T[A], T[B]); if (!m.length) continue
  const mx = Math.max(...m.map(x => x.length))
  if (m.length >= 8 || mx >= 22) out.push({ A, B, n: m.length, mx, ex: m.slice().sort((x, y) => y.length - x.length)[0] })
}
out.sort((x, y) => y.mx - x.mx || y.n - x.n)
console.log('적발 쌍:', out.length)
for (const r of out) console.log((r.n >= 12 || r.mx >= 30 ? '[복제의심] ' : '[문장재사용] ') + r.A + ' <-> ' + r.B + '  ' + r.n + '구절 최장' + r.mx + '자 | ' + r.ex)
