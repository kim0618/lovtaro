---
description: lovtaro.kr 가이드·카드 본문 오류·문체 검증 (AI 패턴, em dash, 단정 표현 자동 검출 및 수정)
allowed-tools: Read, Edit, Glob, Grep, Bash
---

# 러브타로 검증 스킬

가이드 글·카드 상세 본문의 **AI 톤·금지 표현·em dash·단정 표현**을 검출하고 즉시 수정한다. 매일 `/lovtaro-guide`, `/lovtaro-card-expand` 작업 직후 실행 권장.

## 실행 시점

- 가이드 글 작성 직후
- 카드 보강 직후
- 주 1회 전수 스캔 (일요일 권장)
- 애드센스 신청 직전 (/lovtaro-adsense-check 선행 검증으로 동시 실행)

## 기본 동작

- **검출 + 자동 수정**: 규칙 기반 치환 가능한 건 즉시 Edit 실행
- **판단 필요**: 단정 표현 등 문맥 필요한 건 리포트만 하고 사용자 확인
- **대상 파일**: `src/data/guides/*.js`, `src/data/dreams/*.js`, `src/data/cardDictionary.js`, `src/data/minorArcana.js`

## 검사 대상 경로

```bash
GUIDE_DIR=/home/tjd618/lovtaro/src/data/guides
DREAM_DIR=/home/tjd618/lovtaro/src/data/dreams
CARD_MAJOR=/home/tjd618/lovtaro/src/data/cardDictionary.js
CARD_MINOR=/home/tjd618/lovtaro/src/data/minorArcana.js
```

## 검사 항목

### A. em dash (—) 자동 치환

**규칙**: 전 프로젝트 공통으로 em dash(—) 금지. 하이픈(-)으로 자동 치환. 불필요하면 삭제.

```bash
# 발견 위치 파악
grep -rn '—' /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/dreams/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js \
  /home/tjd618/lovtaro/src/pages/ \
  /home/tjd618/lovtaro/src/components/
```

발견 시 Edit 도구로 일괄 치환 (문맥 판단):

- `A — B` (구분자 역할) → `A - B` 또는 `A, B` (자연스러운 쪽)
- `A—B` (부가 설명) → 문장 재작성 또는 쉼표 사용
- 단순 리스트 구분용 → 하이픈

**주의**: 코드 주석·정규식 등 기능성 문자열은 제외. `.vue` 템플릿 내 한국어 텍스트에 집중.

### B. AI 자동생성 의심 패턴

```bash
grep -rnE '안녕하세요|정리합니다|알아보겠습니다|살펴보겠습니다|완벽 가이드|한눈에 정리|소개해드리겠습니다|말씀드리면|결론적으로' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/dreams/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

치환 가이드:

| 발견 | 교체 방향 |
|------|----------|
| `안녕하세요, ...` 도입부 | 도입부 제거 후 본론 시작 |
| `~정리합니다` | `~예요`, `~이에요` 또는 문장 삭제 |
| `알아보겠습니다` | `살펴봐요` 또는 제거 |
| `살펴보겠습니다` | `살펴봐요` 또는 본문으로 바로 |
| `완벽 가이드` | `해석 가이드` 또는 삭제 |
| `한눈에 정리` | 섹션 헤딩에서 제거 |
| `결론적으로` | `그래서`, `이렇게 보면` |
| `~이시군요!` (과잉 공감) | 담백한 표현 |

### C. 단정 표현 검출

```bash
grep -rnE '반드시|100%|절대|무조건|확실히|분명히|틀림없이|보장|완벽하게' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/dreams/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

치환 가이드 (문맥 필요):

| 발견 | 교체 방향 |
|------|----------|
| `반드시 ~합니다` | `~일 수 있어요`, `많은 경우 ~해요` |
| `100% ~` | `대체로 ~`, `~일 가능성이 높아요` |
| `절대 ~` | `~하지 않는 편이 좋아요` |
| `무조건` | `많은 경우` |
| `확실히` | `뚜렷하게` 또는 제거 |
| `보장` | 삭제 또는 `가능성` |

**애드센스 리스크**: 타로 결과를 단정하면 예언·점술 오해 + 면책 조항 약화. 서비스 신뢰성 저하.

### D. 자극적·불안 마케팅 표현

```bash
grep -rnE '큰일|망합니다|망해요|끔찍|재앙|저주|불행|파탄|비참' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/dreams/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

발견 시 완화 표현으로 교체. 타로 해석의 그림자 측면도 **자기 성찰 관점**으로 서술해야 함.

### E. 과도한 친근 톤 (~죠?, ~잖아요)

```bash
grep -rnE '죠\?|잖아요|거든요|더라구요|ㅋ|ㅎ|ㅠ' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/dreams/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

Lovtaro는 **조용한 조언자** 톤. 발견 시 담백한 어미로 수정.

### F. 타로 자가 부정 표현

```bash
grep -rnE '타로는 미신|정확하지 않|맞지 않을 수도|재미로' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/dreams/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

면책 조항은 `/disclaimer` 페이지에서만. 본문에서 자가 부정은 브랜드 훼손.

### G. 하드코딩된 URL

```bash
grep -rnE "https://lovtaro\.kr" \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/dreams/ \
  /home/tjd618/lovtaro/src/pages/ \
  /home/tjd618/lovtaro/src/composables/
```

`SITE_URL` 상수 import로 교체 (CLAUDE.md 규칙). 단, `scripts/prerender.mjs`와 `useHead.js` 내부의 SITE_URL 정의는 예외.

### H. 외부 이미지·스크립트 삽입

```bash
grep -rnE '<img[^>]+src="http|<script[^>]+src=|<iframe' \
  /home/tjd618/lovtaro/src/data/guides/
```

가이드 `content` 필드에 외부 리소스 금지 (현재 이미지 삽입 미지원 + 보안 리스크).

### I. 가이드 파일 구조 검증

각 `src/data/guides/*.js`가 필수 필드 포함하는지:

```bash
for f in /home/tjd618/lovtaro/src/data/guides/*.js; do
  [ "$(basename $f)" = "index.js" ] && continue
  slug=$(basename $f .js)
  for field in slug title category description createdAt updatedAt sections; do
    if ! grep -q "^\s*${field}:" "$f"; then
      echo "MISSING-FIELD: $slug → $field"
    fi
  done
done
```

누락 시 `/lovtaro-guide`로 재작성 또는 수동 보강 안내.

### J. index.js ↔ 개별 파일 일관성

```bash
# index.js에 등록된 slug
grep -oE "import \w+ from './([a-z0-9-]+)\.js'" /home/tjd618/lovtaro/src/data/guides/index.js \
  | sed "s/.*'\.\///; s/\.js'.*//" | sort > /tmp/lt-index.txt

# 실제 존재하는 파일 slug
ls /home/tjd618/lovtaro/src/data/guides/ | grep -v '^index.js$' | sed 's/\.js$//' | sort > /tmp/lt-files.txt

# 차이 확인
comm -23 /tmp/lt-files.txt /tmp/lt-index.txt  # 파일만 있고 index 미등록
comm -13 /tmp/lt-files.txt /tmp/lt-index.txt  # index에 있지만 파일 없음
```

### K. prerender.mjs GUIDES ↔ index.js 일관성

```bash
# prerender.mjs의 slug
grep -oE "slug: '[a-z0-9-]+'" /home/tjd618/lovtaro/scripts/prerender.mjs \
  | sort -u | sed "s/slug: '//; s/'//" > /tmp/lt-prerender.txt

# index.js의 slug (파일명 = slug 가정)
diff /tmp/lt-files.txt /tmp/lt-prerender.txt
```

차이 있으면 `/lovtaro-guide` 동기화 누락. 즉시 수정.

### L. sitemap.xml ↔ prerender.mjs 일관성

```bash
# sitemap의 /guide/ URL
grep -oE '/guide/[a-z0-9-]+' /home/tjd618/lovtaro/public/sitemap.xml \
  | sort -u | sed 's|/guide/||' > /tmp/lt-sitemap.txt

diff /tmp/lt-files.txt /tmp/lt-sitemap.txt
```

### M. 관련 카드·리딩 링크 실존

```bash
# relatedCards[].id가 실제 cardDictionary.js + minorArcana.js에 존재하는지
# + relatedDreams[].slug가 실제 발행된 꿈해몽인지 (2026-07-27 추가)
# + 카드 표시명(name)이 사전의 공식 name과 일치하는지 (2026-07-27 추가)
# CARD_DICTIONARY, MINOR_ARCANA 둘 다 객체이므로 Object.keys()로 id 추출
# guides + dreams 둘 다 검사 (2026-06-15 dreams 누락 사각지대 보강)
node --input-type=module -e "
import guides from '/home/tjd618/lovtaro/src/data/guides/index.js'
import dreams from '/home/tjd618/lovtaro/src/data/dreams/index.js'
import { CARD_DICTIONARY } from '/home/tjd618/lovtaro/src/data/cardDictionary.js'
import { MINOR_ARCANA } from '/home/tjd618/lovtaro/src/data/minorArcana.js'
const ALL = { ...CARD_DICTIONARY, ...MINOR_ARCANA }
const ids = new Set(Object.keys(ALL))
const dreamSlugs = new Set(dreams.map(d => d.slug))
let n = 0
for (const [kind, list] of [['guide', guides], ['dream', dreams]]) {
  list.forEach(g => {
    (g.relatedCards || []).forEach(c => {
      if (!ids.has(c.id)) { console.log('MISSING-CARD:', '['+kind+']', g.slug, '→', c.id); n++ }
      else if (ALL[c.id].name && c.name && ALL[c.id].name !== c.name) {
        console.log('NAME-MISMATCH:', '['+kind+']', g.slug, c.id, '칩=\"'+c.name+'\" 사전=\"'+ALL[c.id].name+'\"'); n++
      }
    })
    ;(g.relatedDreams || []).forEach(r => {
      if (!dreamSlugs.has(r.slug)) { console.log('DEAD-DREAM-LINK:', '['+kind+']', g.slug, '→', r.slug); n++ }
      if (r.slug === g.slug) { console.log('SELF-LINK:', '['+kind+']', g.slug); n++ }
    })
  })
}
console.log(n===0 ? '  ✅ relatedCards/relatedDreams 전수 실존 + 표시명 일치' : '  ⚠ '+n+'건')
"
```

(2026-04-24 수정: 이전 버전은 require + .map() 사용했는데 두 데이터가 객체라 TypeError. ESM + Object.keys()로 수정.)
(2026-06-15 보강: M이 guides만 검사하던 사각지대로 moving-dream의 `wheel-of-fortune`(실제 id는 `wheel`) 죽은 링크가 통과됨. dreams까지 확장. 메이저 카드 id는 cardDictionary 키에 있음 - `wheel`/`high-priestess`/`hanged`/`wheel` 등 슬러그 불일치 주의.)

**(2026-07-27 보강 2건)**:
- **`relatedDreams` 죽은 링크가 검사 밖이었음.** 꿈해몽끼리의 내부링크(토픽 클러스터)는 184건인데 한 번도 검증된 적이 없었다. 위 스크립트에 추가. 자기 자신을 가리키는 self-link도 함께 검출.
- **카드 표시명(`name`) 불일치가 검사 밖이었음.** `long-distance-relationship-tarot`이 `knight-of-wands`의 name을 '완드의 기사'로 적었는데, 사전 공식명과 기존 글 58곳은 전부 '완드의 나이트'였다. `relatedCards`의 name은 `GuideDetailPage.vue`에서 **칩 라벨로 그대로 렌더링**되므로, 칩을 눌러 들어간 카드 상세 페이지 제목과 다르게 보이는 사용자 화면 결함이 된다. id만 맞으면 통과하던 구멍이라 name 대조를 추가.

관련 리딩 `path`가 실존 라우트인지 (`/reading/love`, `/reading/mind`, `/reading/reunion`, `/reading/contact`, `/reading/yesno`, `/reading/compatibility`, `/reading/three`, `/today`):

```bash
grep -E "path: '/reading|path: '/today" /home/tjd618/lovtaro/src/data/guides/*.js \
  | grep -oE "path: '[^']+'" | sort -u
```

리스트 외 경로 있으면 수정.

### N. FAQ 본문 ↔ prerender.mjs GUIDES[].faq 일치

prerender JSON-LD 생성을 위해 두 배열이 완전히 일치해야 함. 개수뿐 아니라 **question/answer 문자열까지 정확 일치** 검사.

**배경 (2026-04-24 회고)**: 개수만 비교하던 초기 버전에서는 놓친 케이스가 있었음. 가이드 본문 트리밍/수정 시 guide 파일만 고치고 prerender.mjs는 미동기화된 케이스 2건 발견:
- tower A1: guide 142자, prerender 203자 (본문 초과로 트리밍한 버전이 prerender에 반영 안 됨)
- lovers A1: guide "이미", prerender "반드시" (단정 표현이 JSON-LD에 잔존, 금지 규칙 위반)

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import guides from './src/data/guides/index.js'
import fs from 'fs'
const pr = fs.readFileSync('./scripts/prerender.mjs','utf8')
let mm = 0
for (const g of guides) {
  const re = new RegExp(\"slug: '\"+g.slug+\"'[\\\\s\\\\S]*?faq: \\\\[([\\\\s\\\\S]*?)\\\\n    \\\\]\", 'm')
  const m = pr.match(re); if (!m) { console.log('MISSING:', g.slug); continue }
  const qs = [...m[1].matchAll(/question: '([^']+)'/g)].map(x => x[1])
  const as = [...m[1].matchAll(/answer: '([^']+)'/g)].map(x => x[1])
  ;(g.faq||[]).forEach((f,i) => {
    if (qs[i] !== f.question) { console.log(g.slug,'Q'+(i+1),'불일치'); mm++ }
    if (as[i] !== f.answer) { console.log(g.slug,'A'+(i+1),'불일치 (guide:',f.answer.length,'prerender:',(as[i]||'').length,'자)'); mm++ }
  })
}
console.log(mm===0 ? '  ✅ 전수 일치' : '  ⚠ '+mm+'건 불일치')
"
```

**불일치 시 처리**: prerender.mjs 쪽을 guide 파일 기준으로 맞춘다 (guide가 단일 소스). Edit 후 `npm run build` 재실행해서 JSON-LD 갱신.

### O. 얇은 카드 스캔 (2026-04-20 추가)

보강 완료로 표시된 카드인데 필드 합계가 2,000자에 못 미치는 경우가 있어 전수 순찰한다. 스킬의 필드별 목표(각 OK)만 보고 총합을 놓친 케이스 방지 목적.

```bash
node --input-type=module -e "
import { CARD_DICTIONARY } from '/home/tjd618/lovtaro/src/data/cardDictionary.js'
import { MINOR_ARCANA } from '/home/tjd618/lovtaro/src/data/minorArcana.js'
const ALL = { ...CARD_DICTIONARY, ...MINOR_ARCANA }
const thin = []
for (const [id, c] of Object.entries(ALL)) {
  if (!c.upright || !c.reversed) continue
  const sum = c.upright.core.length + c.upright.love.length + c.upright.advice.length +
              c.reversed.core.length + c.reversed.love.length + c.reversed.advice.length
  if (sum < 2000) thin.push({ id, sum })
}
thin.sort((a,b) => a.sum - b.sum)
console.log('얇은 카드(<2,000자):', thin.length, '장')
thin.slice(0,10).forEach(x => console.log(' ', x.id, x.sum, '자'))
"
```

보강 완료 명단(`/home/tjd618/.claude/commands/lovtaro-card-expand.md` 진행률)에 있는데 얇은 카드는 **최우선 재보강 대상**. 리포트에만 올리고 자동 수정은 하지 않는다 (보강은 `/lovtaro-card-expand` 스킬의 역할).

### P. 글-카드 본문 의미 중복 검사 (2026-04-22 추가, 2026-07-27 전면 확장)

글의 본문/FAQ/summary와 카드 cardDictionary.js / minorArcana.js 블록의 본문을 N-gram으로 비교해 연속 공유 문자열을 찾는다. 정규식 기반 감사(A~O)로는 잡히지 않는 **의미 레벨 중복**을 감지하는 유일한 단계.

**대조할 카드를 정하는 방식** (2026-07-27 확장으로 사각지대 제거):

| 글 유형 | 대조 카드 출처 |
|---|---|
| 카드 해석 가이드 (`card-interpretation`) | slug에서 뽑은 주 카드 1장 |
| 그 외 가이드 (`situation`/`method`/`faq`) | `relatedCards` 배열 전부 |
| 꿈해몽 전체 | `relatedCards` 배열 전부 |

**배경 (2026-04-22 회고)**: star 가이드 FAQ가 cardDictionary.js star 블록의 문장을 거의 그대로 재서술한 사례 발생. 작성자(AI)의 주관적 판단으로는 "심화"했다고 느꼈지만 실제로 32자 연속 겹침이 있었음. 객관적 측정이 필요해 이 스크립트를 도입.

**⚠️ 배경 (2026-07-27 회고) - 검사 대상이 88편 → 148편으로 늘어난 이유**:
이전 버전은 slug에서 카드 id를 못 뽑으면 그 글을 통째로 SKIP했다. 그 결과 **두 개의 사각지대**가 있었다.
1. **상황·방법론·FAQ 가이드 전부가 검사 밖**이었다. 이 글들은 slug에 카드명이 없어 `[SKIP] not card-interpretation`으로 조용히 넘어갔다.
2. **꿈해몽 60편은 아예 import조차 되지 않아** 단 한 번도 측정된 적이 없었다.

두 유형 모두 `relatedCards`를 갖고 있으므로 이를 카드 출처로 삼아 사각지대를 없앴다. 확장 즉시 기존 발행분에서 **reunion-tarot-cards ↔ eight-of-cups 22자 겹침**(카드 사전 두 문장을 어미만 바꿔 옮김)과 **sea-dream ↔ star 19자 겹침**이 발견돼 수정됐다. 상황 글은 독자가 카드 페이지를 본 뒤 읽는 동선이라 체감 중복도가 오히려 높다.

또한 꿈해몽의 `summary`는 **AI(ChatGPT·Perplexity)가 그대로 인용해 가는 자리**라 중복이 특히 치명적이므로 검사 블록에 포함시켰다.

```bash
# 가이드 88편 + 꿈해몽 60편 전수 검사
cd /home/tjd618/lovtaro && node scripts/verify/guide-card-overlap.mjs

# 특정 슬러그만 (부분 매치 가능, 이때는 OK 항목도 출력)
cd /home/tjd618/lovtaro && node scripts/verify/guide-card-overlap.mjs star

# 15자 이상만 추려 보기 (전수 실행 시 13-14자 정형구 노이즈가 많음)
cd /home/tjd618/lovtaro && node scripts/verify/guide-card-overlap.mjs 2>&1 | awk '
/^=== / {hdr=$0}
/겹침 1[5-9]자|겹침 [2-9][0-9]자/ {if(hdr!=last){print ""; print hdr; last=hdr} print "   " $0}'
```

**판정 기준**:
- 연속 **20자 이상 겹침**: 거의 확실한 의미 중복. 해당 문단을 심화·사례·다른 관점으로 재작성. **예외 없이 수정.**
- 연속 **15-19자 겹침**: 문맥 확인 필요. 정형 표현("~경우가 많아요", "~도움이 돼요" 등)이면 허용, 카드 고유 관점 재서술이면 수정.
- **13-14자**: 전수 실행 시 다수 발생하나 대부분 구조적 표현("이 카드가 역방향으로 나왔다면", "~카드가 나왔을 때"). 글이 카드를 이름으로 논하는 이상 불가피하므로 무시.

**자동 수정하지 않는다.** 중복은 의미를 재구성해야 하므로 수작업이 안전. 리포트만 내고 담당 글을 Edit.

**수정 후 동기화**: **가이드** 파일의 FAQ를 수정하면 `scripts/prerender.mjs`의 GUIDES[].faq도 동일하게 수정해야 JSON-LD 일치 유지(N 검사로 재확인). **꿈해몽은 prerender 동기화 불필요**(prerender가 dreams/index.js를 직접 import).

### Q. 가이드 본문 정적 주입 전수 확인 (2026-05-29 추가)

prerender.mjs가 가이드 본문(sections)을 `<div id="app">`에 정적 주입한다. 크롤러/AdSense 봇이 JS 렌더링 없이 본문을 읽도록 하는 장치. 빌드 후 전수에서 본문이 실제로 들어갔는지 확인한다.

**배경 (2026-05-29)**: 이전엔 가이드 본문이 Vue SPA 클라이언트 렌더만 돼서 정적 HTML에도 JSON-LD에도 없었음 (크롤러는 description + FAQ만 봄). prerender.mjs가 `#app`에 본문을 정적 주입하도록 개선. 본문은 `src/data/guides`가 단일 소스이며, prerender 내부 `GUIDES` 미러 배열엔 sections가 없으므로 `run()`이 src를 직접 import해 주입한다.

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import fs from 'fs'
import guides from './src/data/guides/index.js'
let ok=0, bad=[]
for (const g of guides) {
  const p = 'dist/guide/'+g.slug+'/index.html'
  if (!fs.existsSync(p)) { bad.push(g.slug+'(파일없음)'); continue }
  const h = fs.readFileSync(p,'utf8')
  const s = h.indexOf('<div id=\"app\">')
  const seg = h.slice(s, h.indexOf('</article>', s))
  const n = (seg.match(/guide-detail__section\"/g)||[]).length
  if (n>=1) ok++; else bad.push(g.slug+'(본문미주입)')
}
console.log(bad.length ? '⚠ '+bad.join(', ') : '✅ 전수 본문 주입 ('+ok+'편)')
"
```

**미주입 감지 시**: `npm run build`를 안 했거나 prerender.mjs 손상. 재빌드 후 재확인. 빌드는 했는데도 미주입이면 `buildGuideBodyHtml`/`injectMeta`의 `#app` 치환 정규식 또는 src import가 깨진 것.

### R. FAQ ↔ 본문 자체 중복 검사 (2026-05-31 추가)

FAQ answer가 같은 글의 `sections` 본문 문장을 거의 그대로 복붙한 경우를 잡는다. FAQ는 본문을 **심화·보완**해야지 반복하면 안 된다. 본문을 읽은 독자가 FAQ에서 같은 문장을 또 보면 "복붙"으로 느끼고, JSON-LD FAQPage와 본문이 겹치면 thin/duplicate 신호로 SEO에 불리하다.

**배경 (2026-05-31 회고)**: contact-timing-tarot 작성 시 lovtaro-guide의 자체 검증(질문 1~3)과 verify의 A~Q를 모두 통과했는데, 심층 분석에서 FAQ2가 본문과 25자, FAQ5가 28자 연속 겹침이 발견됨. FAQ를 쓸 때 본문 결론 문장을 무의식적으로 재사용하는 패턴이 있어 객관적 측정이 필요. P(가이드-카드 중복)는 외부 데이터와의 겹침만 보고 글 **내부** 자체중복은 못 잡는 사각지대였음.

**배경 (2026-06-08 회고)**: 이 검사가 `guides`만 돌고 `dreams`는 검사하지 않는 사각지대가 있었음. death-dream FAQ1↔본문 28자, breakup FAQ2↔본문 24자 복붙이 발행 후 심층 분석에서야 발견됨. 또 FAQ-본문뿐 아니라 **섹션↔섹션 본문 자체중복**도 사각지대였음(old-friend S2↔S4 22자 "그 감각이 부족하다는 걸 마음이 알아챈 거예요"). 아래 스크립트를 ① dreams까지 확장 ② 섹션 간 본문 중복(15자+)까지 검사하도록 보강.

**R-1. FAQ ↔ 본문 자체중복 (guides + dreams 전수)**:

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import guides from './src/data/guides/index.js'
import dreams from './src/data/dreams/index.js'
const norm = s => s.replace(/<[^>]*>/g,'').replace(/\s+/g,'')
let total = 0
for (const [kind, list] of [['guide', guides], ['dream', dreams]]) {
  for (const g of list) {
    const sec = norm((g.sections||[]).map(s=>s.content).join(''))
    ;(g.faq||[]).forEach((f,fi)=>{
      const a = norm(f.answer); const W = 20; const seen = new Set()
      for (let i=0;i+W<=a.length;i++){
        const sub = a.slice(i,i+W)
        if (sec.includes(sub) && !seen.has(sub)) {
          let len=W; while(i+len<a.length && sec.includes(a.slice(i,i+len+1))) len++
          seen.add(a.slice(i,i+len)); console.log('['+kind+'] '+g.slug,'FAQ'+(fi+1),len+'자:',a.slice(i,i+len)); total++
        }
      }
    })
  }
}
console.log(total===0 ? '  ✅ FAQ-본문 20자 이상 자체중복 없음' : '  ⚠ '+total+'건 (해당 FAQ를 다른 각도로 재작성)')
"
```

**R-2. 섹션 ↔ 섹션 본문 자체중복 (guides + dreams 전수)**:

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import guides from './src/data/guides/index.js'
import dreams from './src/data/dreams/index.js'
const norm = s => s.replace(/<[^>]*>/g,'').replace(/\s+/g,'')
let total = 0
for (const [kind, list] of [['guide', guides], ['dream', dreams]]) {
  for (const g of list) {
    const secs = (g.sections||[]).map(s=>norm(s.content))
    for (let a=0;a<secs.length;a++) for (let b=a+1;b<secs.length;b++){
      const A=secs[a], B=secs[b], W=15, seen=new Set()
      for(let i=0;i+W<=A.length;i++){
        const sub=A.slice(i,i+W)
        if(B.includes(sub)&&!seen.has(sub)){
          let len=W; while(i+len<A.length&&B.includes(A.slice(i,i+len+1)))len++
          seen.add(A.slice(i,i+len)); console.log('['+kind+'] '+g.slug,'S'+(a+1)+'<->S'+(b+1),len+'자:',A.slice(i,i+len)); total++
        }
      }
    }
  }
}
console.log(total===0 ? '  ✅ 섹션 간 15자 이상 자체중복 없음' : '  ⚠ '+total+'건 (반복 문단을 다른 각도로 재작성)')
"
```

**판정**:
- R-1(FAQ-본문) 연속 **20자 이상** → 해당 FAQ를 본문과 다른 각도로 재작성.
- R-2(섹션-섹션) 연속 **15자 이상** → 문맥 확인. 정형 표현("~경우가 많아요")이면 허용, 같은 메시지 재서술이면 한쪽 재작성. 같은 의미를 어휘만 바꿔 두 번 쓴 것(N-gram은 통과해도 의미상 반복)은 정독으로 잡아 한쪽 삭제·통합.
- 카드 해석 글뿐 아니라 **상황·방법·FAQ 글 + 꿈해몽 전체**에 적용. 정형 표현이 아니라 본문 결론을 그대로 옮긴 것이면 무조건 수정.

**수정 후**: guide 파일이면 `scripts/prerender.mjs`의 GUIDES[].faq도 함께 갱신(N 검사로 재확인). **dream 파일은 prerender 동기화 불필요**(prerender가 dreams/index.js를 직접 import).

### S. 상황 글 ↔ 리딩 데이터 겹침 검사 (2026-05-31 추가)

상황 글(category: situation)이 다루는 카드 해석이 해당 리딩의 결과 데이터(`src/data/readings/*.js`)와 연속 겹치는지 본다. P 검사는 `cardDictionary.js`/`minorArcana.js`만 비교하므로 리딩 데이터는 **사각지대**다. 독자가 실제 리딩을 본 뒤(`/reading/contact` 등) 같은 주제의 가이드를 읽는 동선이라, 리딩 결과 문구와 겹치면 카드 사전 겹침보다 체감도가 더 높다.

**배경 (2026-05-31 회고)**: contact-timing-tarot의 본문/FAQ가 `readings/contact.js`의 emotionFlow·advice와 moon 18자, chariot 16자 겹침. P 스크립트가 SKIP(상황 글이라 카드 매핑 없음)하고 지나가 발견되지 않았음.

**리딩 데이터 export 형태** (주제별로 다름): `contact.js` → `CONTACT_RESULTS`, 그 외 `mind.js`/`reunion.js` 등은 파일을 열어 export 이름과 구조(`summary`/`emotionFlow`/`advice`/`caution` 또는 유사 필드)를 먼저 확인한 뒤 아래 스크립트의 import·필드명을 맞춘다.

```bash
# 예시: contact 주제 상황 글 검사 (다른 주제는 import/필드 교체)
cd /home/tjd618/lovtaro && node --input-type=module -e "
import g from './src/data/guides/contact-timing-tarot.js'
import { CONTACT_RESULTS } from './src/data/readings/contact.js'
const norm = s => s.replace(/<[^>]*>/g,'').replace(/\s+/g,'')
const body = norm(g.sections.map(s=>s.content).join('') + g.faq.map(f=>f.question+f.answer).join(''))
const cards = (g.relatedCards||[]).map(c=>c.id)  // 또는 본문에서 다룬 카드 id 목록
let hits=0
for (const id of cards) {
  const r = CONTACT_RESULTS[id]; if(!r) continue
  const src = norm([r.summary, ...(r.emotionFlow||[]), ...(r.advice||[]), ...(r.caution||[])].join(''))
  const W=15; const seen=new Set()
  for(let i=0;i+W<=src.length;i++){
    const sub=src.slice(i,i+W)
    if(body.includes(sub)&&!seen.has(sub)){
      let len=W; while(i+len<src.length && body.includes(src.slice(i,i+len+1))) len++
      seen.add(src.slice(i,i+len)); console.log('['+id+'] '+len+'자:', src.slice(i,i+len)); hits++
    }
  }
}
console.log(hits===0?'  ✅ 리딩 데이터와 15자 이상 겹침 없음':'  ⚠ '+hits+'건 (해당 문단 재서술)')
"
```

**판정**: 연속 **15자 이상** 겹침이면 문맥 확인 후 재서술. 짧은 정형 표현은 허용. **카드 해석 글에는 적용하지 않는다**(리딩 데이터는 상황 글 주제와만 직접 연결됨). 주제↔리딩 매핑: 재회→`reunion.js`, 썸·짝사랑·속마음→`mind.js`, 연락→`contact.js`, 이별→해당 없음(reunion/mind 보조 참고).

### T. 정량 스펙 준수 검사 (2026-07-27 추가)

`/lovtaro-guide`·`/lovtaro-dream` 스킬이 정해둔 **숫자 기준**을 실제로 지켰는지 기계적으로 확인한다. 기준이 문서에만 있고 검사 항목이 없으면 작성자(AI)가 "충분해 보인다"고 자평하고 넘어간다.

**배경 (2026-07-27 회고)**: `long-distance-relationship-tarot` 발행 시 FAQ 답변 5개 중 **3개가 기준(150-250자) 미달**(134/149/117자)이었는데 A~S 전 항목을 통과했다. 가이드 스킬 5단계에 "각 답변 2-4문장, 150-250자, 너무 짧으면 JSON-LD 노출 감점"이 명시돼 있었는데도 검증 단계에 대응 항목이 없어 그대로 발행될 뻔했다. 같은 날 본문 분량은 재빌드 때마다 쟀으면서 FAQ 길이는 한 번도 재지 않았다.

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import guides from './src/data/guides/index.js'
import dreams from './src/data/dreams/index.js'
let n = 0
// 가이드: 본문 2800-4200자, FAQ 4-6개 각 150-250자, title 25-40자, desc 70-120자
for (const g of guides) {
  const body = (g.sections||[]).map(s=>s.content.replace(/<[^>]*>/g,'')).join('').replace(/\s+/g,'').length
  if (body < 2800 || body > 4200) { console.log('[guide]', g.slug, '본문', body, '자 (2800-4200)'); n++ }
  if (g.title.length < 25 || g.title.length > 40) { console.log('[guide]', g.slug, 'title', g.title.length, '자 (25-40)'); n++ }
  if (g.description.length < 70 || g.description.length > 120) { console.log('[guide]', g.slug, 'desc', g.description.length, '자 (70-120)'); n++ }
  if ((g.faq||[]).length < 4 || (g.faq||[]).length > 6) { console.log('[guide]', g.slug, 'FAQ', (g.faq||[]).length, '개 (4-6)'); n++ }
  ;(g.faq||[]).forEach((f,i) => {
    if (f.answer.length < 150 || f.answer.length > 250) { console.log('[guide]', g.slug, 'FAQ'+(i+1), f.answer.length, '자 (150-250)'); n++ }
  })
}
// 꿈해몽: 본문 2400-3600자, 4섹션, FAQ 4개, summary 필수
for (const d of dreams) {
  const body = (d.sections||[]).map(s=>s.content.replace(/<[^>]*>/g,'')).join('').replace(/\s+/g,'').length
  if (body < 2400 || body > 3600) { console.log('[dream]', d.slug, '본문', body, '자 (2400-3600)'); n++ }
  if (!d.summary) { console.log('[dream]', d.slug, 'summary 없음'); n++ }
}
console.log(n===0 ? '  ✅ 정량 스펙 전수 준수' : '  ⚠ '+n+'건 기준 이탈')
"
```

**판정**: 신규 발행 글은 **전부 기준 안에 들어와야 한다.** 기존 발행분의 이탈은 리포트만 하고 즉시 고치지 않는다(발행 후 본문 변경은 별도 판단). FAQ 답변이 짧으면 JSON-LD FAQPage 리치 결과 노출에서 불리하므로 특히 신규 글에서 엄격히 본다.

## 실행 순서

1. **대상 범위 확인**
   - 인자로 파일 지정되면 해당 파일만 (`/lovtaro-verify moon-love-meaning`)
   - 인자 없으면 전수 스캔

2. **A~T 순서대로 실행** (R = FAQ-본문 자체중복, S = 상황 글-리딩 데이터 겹침, T = 정량 스펙 준수)

3. **자동 수정 가능한 건 즉시 Edit**
   - em dash → 하이픈 (문맥 판단)
   - "안녕하세요" 도입부 제거
   - AI 패턴 단순 치환

4. **판단 필요한 건 리포트**
   - 단정 표현 (완화 표현 후보 제시)
   - 친근 톤 과다 (톤 조정 제안)

5. **자동 수정 후 빌드 검증**

```bash
cd /home/tjd618/lovtaro && npm run build 2>&1 | tail -8
```

6. **리포트 출력**

```
## 러브타로 문체 검증 결과 ({YYYY-MM-DD})

### ✅ 자동 수정 완료
- guides/moon-love-meaning.js: em dash 2건 → 하이픈 교체
- guides/moon-love-meaning.js: "안녕하세요" 도입부 제거
- cardDictionary.js::ace-of-cups: "정리합니다" → "~예요" 교체

### ⚠️ 수동 확인 필요
- guides/reunion-timing.js:L42: "반드시 돌아옵니다" (단정 표현)
  → 후보: "돌아올 가능성이 보여요", "많은 경우 돌아오는 흐름이에요"
- cardDictionary.js::tower: "끔찍한 변화" (자극 표현)
  → 후보: "급격한 변화", "예상치 못한 흐름"

### 🔧 구조 점검
- index.js 미등록: 0건
- prerender.mjs 미동기화: 0건
- sitemap.xml 미등록: 0건
- 관련 카드 실존: 전수 통과
- 빌드: 성공
```

## 톤·문체 권장 표현 (교체 후보 사전)

| 금지/비권장 | 권장 |
|-------------|------|
| 안녕하세요 | (제거) |
| 정리합니다 | ~예요, ~이에요 |
| 알아보겠습니다 | 살펴봐요, (제거) |
| 완벽 가이드 | 해석 가이드 |
| 반드시 | ~일 수 있어요 |
| 100% | 대체로 |
| 무조건 | 많은 경우 |
| 보장됩니다 | 예상돼요 |
| 큰일 납니다 | 주의가 필요해요 |
| 끔찍한 | 뚜렷한, 강한 |
| ~죠? | ~예요 |
| ~잖아요 | ~예요 |
| 재미로 하는 | (제거, disclaimer 페이지로) |

## 절대 변경하지 않는 것

- `slug`, `createdAt` - 가이드 URL 및 퍼블리싱 기록
- `id`, `number`, `name`, `nameEn` - 카드 식별자
- `category`, `energy`, `keywords` - 분류 필드
- 라우트 경로, 컴포넌트 구조
- JSON-LD 빌더 로직

## 변경해도 되는 것

- `title`, `description`, `sections[].content`, `faq[].question/answer`
- `upright.*`, `reversed.*` 본문 필드
- `updatedAt` (수정 작업 완료일로 갱신)

## 금지

- 본문 **대폭 재작성** (이 스킬은 검증+소규모 치환 전용)
- 글·카드 **삭제** (플래그만 올림)
- `slug`/`id` 변경
- `relatedCards`, `relatedReadings` 배열 재구성 (실존 확인만)


## 완료 후 로그 기록

스킬 실행이 완료되면 반드시 아래 명령으로 `skill-log.json`에 기록한다:

```bash
python3 -c "import json,datetime; logs=json.load(open('/home/tjd618/skill-log.json')); now=datetime.datetime.now(); logs.insert(0,{'date':now.strftime('%Y-%m-%d'),'time':now.strftime('%H:%M'),'project':'lovtaro','skill':'lovtaro-verify'}); open('/home/tjd618/skill-log.json','w').write(json.dumps(logs,ensure_ascii=False,indent=2))"
```

$ARGUMENTS
