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

// ' - ' 뒤 접미가 여러 편에서 공용이면 사이트 관행이므로 어간에서 떼어낸다.
// (2026-10-10 신설) 이걸 안 떼면 카드 해석 가이드의 '정방향 {카드} - 상황별로 읽기'(19편)와
// '{카드} + {카드} - 조합으로 읽기'(42편)가 같은 랭크 카드끼리 1:1로 짝지어져
// freq 면제(완전일치 5편)도 SERIES_MIN 면제(어간 공유 편수)도 못 받고 26건 오탐으로 잡혔다.
// 실측 분포: 42편 / 19편 / 2편 / 1편... 이라 임계 5로 관행과 1회성이 깨끗이 갈린다.
// 접두도 같이 떼야 한다. '이 카드가 담은 것 - X'(19편)를 남기면 서로 무관한 X끼리도
// 접두 8자가 얹혀 11~14자로 올라간다(ten-of-wands '열정이 짐이 되는 과정' ↔ king-of-wands
// '열정이 방향이 될 때'는 접두를 떼면 어간 공유 3자로 정상).
// 실측 접두 분포: 42편 / 19편 / 4편 / 4편 / 3편... 이라 접미와 같은 임계 5가 맞는다.
const SHARED_PART_MIN = 5
const sufFreq = {}, preFreq = {}
all.forEach(d => (d.sections || []).forEach(s => {
  const i = s.heading.lastIndexOf(' - ')
  if (i > 0) { const suf = s.heading.slice(i + 3); sufFreq[suf] = (sufFreq[suf] || 0) + 1 }
  const j = s.heading.indexOf(' - ')
  if (j > 0) { const pre = s.heading.slice(0, j); preFreq[pre] = (preFreq[pre] || 0) + 1 }
}))
const stripShared = s => {
  let out = s
  const i = out.lastIndexOf(' - ')
  if (i > 0 && (sufFreq[out.slice(i + 3)] || 0) >= SHARED_PART_MIN) out = out.slice(0, i)
  const j = out.indexOf(' - ')
  if (j > 0 && (preFreq[out.slice(0, j)] || 0) >= SHARED_PART_MIN) out = out.slice(j + 3)
  return out
}

const stem = s => stripShared(s).replace(TAIL, '').replace(/[\s,·]/g, '')
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

/**
 * V-2. title 부제 프레임 검사 (2026-11-18 신설)
 *
 * 배경: V는 sections[].heading만 보고 title은 어느 검사도 보지 않았다. 그 사이
 * 부제 끝 "~가 뜻을 가르는 이유"가 shot-stabbed(11/11) → naked(11/17) → swimming 초판(11/18)으로
 * 3연속 통과했다. 같은 시기 lion(11/10)·horse(11/06)도 "~, X와 나 ~부터 봐요"를 공유했다.
 * 부제는 소재어가 앞에, 틀이 끝에 오므로 ' - ' 뒤 부제의 공통 접미(공백·문장부호 제거)로 잰다.
 *
 * 실측 분포(2026-11-18, 공통 접미 길이별 쌍 수):
 *   dream 107편 {4:14, 5:15, 6:12, 8:1, 9:2, 12:2} / guide 96편 {4:21, 5:4, 6:14, 7:2, 9:1}
 *   6~7자대는 '신호를읽는법'·'는마음의신호' 같은 사이트 공용 끝말이라 1:1 판정에서 뺀다.
 *   - T1. 1:1 도용: 공통 접미 8자 이상(사고 쌍 naked↔shot 8자, swimming 초판↔naked 10자)
 *   - T2. 최근 연쇄: 같은 레이어에서 createdAt 기준 직전 5편과 공통 접미 5자 이상.
 *         '가르는이유'(6자)·'부터봐요'(4자+쉼표 구조)처럼 짧은 틀은 길이로는 못 잡고 시간 근접으로만 잡힌다.
 *         5편 이상이 공유하는 접미('마음의신호' 6편 등)는 사이트 관행이라 면제.
 */
const TITLE_T1 = 8, TITLE_T2 = 5, TITLE_WINDOW = 5, TITLE_SERIES = 5
const sub = t => { const i = t.indexOf(' - '); return i < 0 ? '' : t.slice(i + 3).replace(/[\s,·?!.]/g, '') }
const commonSuffix = (a, b) => { let k = 0; while (k < a.length && k < b.length && a[a.length - 1 - k] === b[b.length - 1 - k]) k++; return a.slice(a.length - k) }
let thits = 0
for (const [kind, list] of [['guide', guides], ['dream', dreams]]) {
  const sufShare = {}
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const s = commonSuffix(sub(list[i].title), sub(list[j].title))
    if (s.length >= TITLE_T2) (sufShare[s] ||= new Set()).add(list[i].slug).add(list[j].slug)
  }
  const byDate = [...list].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '') || a.slug.localeCompare(b.slug))
  const tTargets = process.env.SLUG ? list.filter(d => d.slug === process.env.SLUG) : list
  const seen = new Set()
  for (const d of tTargets) {
    const me = sub(d.title); if (!me) continue
    const pos = byDate.findIndex(x => x.slug === d.slug)
    const recent = new Set(byDate.slice(Math.max(0, pos - TITLE_WINDOW), pos).map(x => x.slug))
    let flagged = false
    for (const o of list) {
      if (o.slug === d.slug) continue
      const s = commonSuffix(me, sub(o.title))
      const key = [d.slug, o.slug].sort().join('|')
      const series = (sufShare[s]?.size || 0) >= TITLE_SERIES
      let why = ''
      if (s.length >= TITLE_T1 && !series) why = '1:1 도용 ' + s.length + '자'
      else if (s.length >= TITLE_T2 && !series && recent.has(o.slug)) why = '최근 ' + TITLE_WINDOW + '편 연쇄 ' + s.length + '자'
      if (!why || seen.has(key)) continue
      seen.add(key); flagged = true; thits++
      console.log('  ⚠ title 프레임(' + why + '):', '[' + kind + '] ' + d.slug, '"' + d.title + '"')
      console.log('      ↔', o.slug, '"' + o.title + '" 공통 접미 "' + s + '"')
    }
    if (process.env.SLUG && !flagged) console.log('  ✅ title', '"' + d.title + '"')
  }
}
console.log(thits === 0 ? '  → title 프레임 복제 없음' : '  → ⚠ title ' + thits + '건: 부제를 소재 고유 표현으로 교체 검토')
