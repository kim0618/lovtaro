/**
 * V. heading 프레임 복제 검사 (2026-07-31 신설)
 *
 * 배경: U(글↔글 골격 복제)는 sections[].content + faq만 n-gram 비교하고 heading은 보지 않는다.
 * 그 사각지대로 2026-07-31 drinking-dream이 meal-dream heading을 그대로 들어 쓴 채
 * 1차 verify를 통과했다(본문 겹침은 meal-dream과 1구절 14자로 정상이었음).
 * bridge(7/27)·bath(7/29)에 이은 3연속 재발이라 수동 grep 지시로는 막히지 않는 것이 확인돼 스크립트화.
 *
 * 두 규칙을 함께 돌린다. 단일 지표로는 두 사고 유형을 모두 못 잡는다.
 *   A. 어간 LCS - 공용 어미(~에 따라 달라지는 결, ~신호로 봐도 될까 등)를 떼고 남은
 *      고유 어간이 다른 한 편과 10자 이상 연속 일치하면 복제. drinking 사고가 여기서 14자로 잡힌다.
 *   B. 금지 오프너 - 어간 LCS로는 안 잡히는 유형(오프너만 같고 중간이 다른 경우).
 *      bridge 사고("누구와, 어떻게 건넜는지~" ↔ travel "누구와, 어떤 여행이었는지~")는
 *      어간 LCS가 3자에 그쳐 여기서만 잡힌다.
 *
 * 임계 보정 실측(2026-07-31, 꿈해몽 63편): 어미 미제거 시 임계10 → 오탐 46건.
 * 어미 제거 후 임계8 → 18건, 9 → 7건, 10 → 4건(전부 "이 꿈을 ~인연이 온다는 신호로 봐도 될까"
 * 5편 공용 관용구). 따라서 10을 채택.
 *
 * 사용: SLUG=<slug> node scripts/verify/heading-frame.mjs      (특정 글, OK 항목도 출력)
 *       node scripts/verify/heading-frame.mjs                   (전수, 적발만 출력)
 */
import guides from '/home/tjd618/lovtaro/src/data/guides/index.js'
import dreams from '/home/tjd618/lovtaro/src/data/dreams/index.js'

const STEM_THRESHOLD = 10
// 어간을 공유하는 편수가 이 값 이하면 1:1 도용(사고), 넘으면 시리즈 템플릿(정상)
const SERIES_MIN = 2
// 사이트 공용 어미. 이걸 안 떼면 "~에 따라 달라지는 결"만으로 대량 오탐된다.
const TAIL = /(에 따라)? ?달라지는.*$|신호로 봐도 될까$|신호일까$|비추는 것$|살펴볼 것$|.*꿈의 결$/
// 특정 1~2편에만 있는데 반복 도용된 오프너. 사고가 날 때마다 추가한다.
const BANNED_OPENERS = ['누구와']

const all = [...guides, ...dreams]
const freq = {}
all.forEach(d => (d.sections || []).forEach(s => { freq[s.heading] = (freq[s.heading] || 0) + 1 }))

const stem = s => s.replace(TAIL, '').replace(/[\s,·]/g, '')
const lcs = (a, b) => {
  let m = 0
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) {
    let k = 0
    while (i + k < a.length && j + k < b.length && a[i + k] === b[j + k]) k++
    if (k > m) m = k
  }
  return m
}

const pool = []
all.forEach(d => (d.sections || []).forEach(s => pool.push({ slug: d.slug, h: s.heading, st: stem(s.heading) })))

const targets = process.env.SLUG ? all.filter(d => d.slug === process.env.SLUG) : all
if (process.env.SLUG && !targets.length) { console.log('slug 없음:', process.env.SLUG); process.exit(1) }
const verbose = Boolean(process.env.SLUG)

let hits = 0
for (const d of targets) {
  for (const s of d.sections || []) {
    // 5편 이상이 쓰는 heading은 의도된 사이트 관행이라 면제
    if ((freq[s.heading] || 0) >= 5) {
      if (verbose) console.log('  [관행]', s.heading, '(' + freq[s.heading] + '편 공용)')
      continue
    }
    const banned = BANNED_OPENERS.find(o => s.heading.startsWith(o))
    if (banned) {
      const others = pool.filter(p => p.slug !== d.slug && p.h.startsWith(banned)).map(p => p.slug)
      console.log('  ⚠ 금지 오프너 "' + banned + '":', d.slug, '"' + s.heading + '"')
      if (others.length) console.log('      같은 오프너 보유:', [...new Set(others)].join(', '))
      hits++
      continue
    }
    const st = stem(s.heading)
    if (st.length < 6) { if (verbose) console.log('  ✅', s.heading, '(어간 짧음)'); continue }
    let best = { n: 0 }
    const sharers = new Set()
    for (const q of pool) {
      if (q.slug === d.slug) continue
      const n = lcs(st, q.st)
      if (n >= STEM_THRESHOLD) sharers.add(q.slug)
      if (n > best.n) best = { n, ...q }
    }
    // 여러 편이 같은 어간을 공유하면 의도된 시리즈 템플릿(상황 가이드 "~리딩에서 자주 등장하는 카드 N장" 등).
    // 사고는 항상 특정 1편을 들어 쓴 1:1 도용이므로 공유 편수로 가른다.
    if (best.n >= STEM_THRESHOLD && sharers.size <= SERIES_MIN) {
      console.log('  ⚠ 프레임 복제:', d.slug, '"' + s.heading + '"')
      console.log('      ↔', best.slug, '"' + best.h + '" 어간 공유', best.n + '자')
      hits++
    } else if (best.n >= STEM_THRESHOLD) {
      if (verbose) console.log('  [시리즈]', s.heading, '(' + sharers.size + '편 공유 템플릿)')
    } else if (verbose) {
      console.log('  ✅', s.heading, best.n ? '(최대 어간공유 ' + best.n + '자 / ' + best.slug + ')' : '')
    }
  }
}
console.log(hits === 0 ? '  → heading 프레임 복제 없음' : '  → ⚠ ' + hits + '건: 소재 고유어로 교체 필요')
