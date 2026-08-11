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

**관련 리딩 `path` 실존 검사 - 하드코딩 리스트와 눈으로 대조하지 말고 `dist`와 직접 대조한다** (2026-08-07 전환).

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import fs from 'fs'
import guides from './src/data/guides/index.js'
import dreams from './src/data/dreams/index.js'
let bad = 0
for (const [kind, list] of [['guide', guides], ['dream', dreams]])
  for (const g of list)
    for (const r of (g.relatedReadings || []))
      if (!fs.existsSync('./dist' + r.path + 'index.html')) { console.log('  DEAD-READING-LINK:', kind + ':' + g.slug, r.path); bad++ }
console.log(bad ? '  ⚠ ' + bad + '건' : '  ✅ relatedReadings 전수 실존 (dist 대조)')
"
```

`npm run build` 이후에 실행해야 한다(dist 기준). 죽은 경로가 나오면 `src/router/index.js`에서 실제 라우트를 확인해 고친다.

**⚠️ 배경 (2026-08-07 사고)**: 이 자리에 원래 "실존 라우트 리스트를 적어두고 grep 결과를 눈으로 대조하라"고 돼 있었는데, **그 리스트 자체가 틀려 있었다**(`/reading/three`로 적혀 있었으나 실제 라우트는 `/reading/3cards`). 그 결과 `card-combination-reading-tarot`(8/6 발행)이 죽은 링크를 단 채 배포됐고, 다음 날 `stairs-dream`이 같은 문서를 보고 같은 오류를 반복했다. CLAUDE.md 라우트표와 `lovtaro-guide.md` 2곳도 같이 틀려 있었다(전부 정정 완료).

교훈: **경로 검증을 문서에 적힌 리스트에 의존하면, 문서가 틀렸을 때 검사기가 오류를 재생산한다.** 실존 여부는 항상 빌드 산출물이나 라우터 정의 같은 1차 소스와 대조할 것. 같은 이유로 `relatedCards`·`relatedDreams`도 위 스크립트에서 데이터 원본과 직접 대조한다.

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
// 꿈해몽: 본문 2400-3600자, FAQ 4개 각 150-250자, summary 필수 + 전통 근거층, 소재어 밀도
for (const d of dreams) {
  const body = (d.sections||[]).map(s=>s.content.replace(/<[^>]*>/g,'')).join('').replace(/\s+/g,'').length
  if (body < 2400 || body > 3600) { console.log('[dream]', d.slug, '본문', body, '자 (2400-3600)'); n++ }
  if (!d.summary) { console.log('[dream]', d.slug, 'summary 없음'); n++ }
  else {
    if (d.summary.length < 90) { console.log('[dream]', d.slug, 'summary', d.summary.length, '자 (90+ 권장, 사이트 중앙값 102)'); n++ }
    if (!/전통|옛 풀이|예로부터|해몽에서/.test(d.summary)) { console.log('[dream]', d.slug, 'summary에 전통 근거층 없음'); n++ }
  }
  ;(d.faq||[]).forEach((f,i) => {
    if (f.answer.length < 150 || f.answer.length > 250) { console.log('[dream]', d.slug, 'FAQ'+(i+1), f.answer.length, '자 (150-250)'); n++ }
  })
}
console.log(n===0 ? '  ✅ 정량 스펙 전수 준수' : '  ⚠ '+n+'건 기준 이탈')
"
```

**판정**: 신규 발행 글은 **전부 기준 안에 들어와야 한다.** 기존 발행분의 이탈은 리포트만 하고 즉시 고치지 않는다(발행 후 본문 변경은 별도 판단). FAQ 답변이 짧으면 JSON-LD FAQPage 리치 결과 노출에서 불리하므로 특히 신규 글에서 엄격히 본다.

**⚠️ 꿈해몽 항목 보강 (2026-08-07)**: 원래 꿈해몽은 본문 길이와 summary 유무만 검사해 **FAQ 답변 길이·summary 품질이 통째로 사각지대**였다. `stairs-dream` 초판이 FAQ 평균 147자(최근 8편 중 최하, 비교군 165~185자)에 summary 68자·전통 근거층 없음으로 이 검사를 통과했다. summary는 스킬이 "AI(ChatGPT·Perplexity)가 그대로 인용해 가는 자리"로 규정한 곳이고, 전통층 부재는 bridge(7/27)·drinking(7/31)에 이어 3번째 재발이라 기계 검사로 옮겼다.

**소재어 과밀 검사 (신규 글 수동 실행)** - 소재 명사가 과하게 반복되면 목록이 한 단어로 도배된다. `stairs-dream` 초판 `계단` 38회 = **79자당 1회**(driving `운전` 217자·earthquake `지진` 465자 대비 2.7~5.9배)로 적발됐다. 기준: **150자당 1회보다 조밀하면 대명사·동의어로 분산**.

⚠️ **이 기준은 1~2음절 상징 명사에 적용하지 마라 (2026-08-11 실측 보정).** 전수 재측정 결과 `꽃` 49.3자·`나비` 57.9자·`새` 58.4자·`별` 59.0자·`뱀` 63.6자·`고양이` 75.3자·`물고기` 83.6자로 **상징 명사 계열은 전부 50~85자대**에 몰려 있고, 150자대는 `계단`(183)·`운전`(217)처럼 **대체 표현이 쉬운 다음절 명사**뿐이다. `새`·`별`처럼 동의어가 없고 대명사화("그것")가 어색한 단어를 억지로 150자에 맞추면 지시대명사 남발로 **선행사 없는 지시어**라는 새 결함을 만든다([[feedback_fix_introduces_new_defects]]). 판정은 **같은 계열 글과 비교**해서 하고, 계열 중앙값의 1.5배 이상 조밀할 때만 손댄다.

```bash
cd /home/tjd618/lovtaro && SLUG={slug} WORD={소재어} node --input-type=module -e "
const m = await import('./src/data/dreams/'+process.env.SLUG+'.js')   // 동적 경로라 await import 필수
const d = m.default
const t = ((d.sections||[]).map(s=>s.content.replace(/<[^>]*>/g,'')).join('')+(d.faq||[]).map(f=>f.question+f.answer).join('')).replace(/\s+/g,'')
const c = (t.match(new RegExp(process.env.WORD,'g'))||[]).length
const per = Math.round(t.length/c)
console.log('  '+process.env.WORD, c+'회 /', t.length+'자 =', per+'자당 1회', per<150?'⚠ 과밀':'✅')
"
```

### U. 글 ↔ 글 문장 골격 복제 검사 (2026-07-29 추가, 신규 글 필수)

신규 글이 **다른 한 편의 문장 뼈대를 명사만 바꿔 복제**했는지 전수 대비 이상치로 판정한다. A~T 어디에도 대응 항목이 없던 사각지대다. P는 외부 카드 데이터와의 겹침만, R-1/R-2는 글 **내부** 자체중복만 본다.

**배경 (2026-07-29 회고, 연쇄 재발)**: `/lovtaro-guide`·`/lovtaro-dream` 0단계가 "최근 글 2편을 읽어 톤을 체화"하라고 지시하는데, 이 단계가 직전 글의 문장 골격을 통째로 흡수하는 부작용을 낳는다. 2026-07-27 `bridge-dream`이 `travel-dream` 복제로 전면 재구성 판정을 받았는데, 이틀 뒤 `bath-dream`이 이번엔 그 `bridge-dream`을 복제했다(§3·§4·FAQ 본문까지). 작성자(AI)는 "톤을 맞췄다"고 느껴 자각하지 못하므로 기계 측정이 유일한 방어선이다.

**핵심**: 한 쌍씩 비교하면 개별 문구가 15~20자라 사이트 정형구와 구분되지 않아 "관행"으로 오판한다. **반드시 전편 순위표를 뽑아 1위와 2위의 격차**를 본다.

```bash
cd /home/tjd618/lovtaro && SLUG={검사할 slug} node --input-type=module -e "
import guides from './src/data/guides/index.js'
import dreams from './src/data/dreams/index.js'
const TARGET = process.env.SLUG   // 검사할 신규 글 slug
const all = [...guides, ...dreams]
const norm = s => s.replace(/<[^>]*>/g,'').replace(/\s+/g,'')
const txt = d => norm((d.sections||[]).map(s=>s.content).join('') + (d.faq||[]).map(f=>f.question+f.answer).join(''))
// 최대 구절 단위로만 센다. 매치되면 그 구간 끝으로 점프해야 한 문장이 여러 건으로 부풀지 않는다
const maximal = (B, T, W=14) => {
  const out = []
  for (let i=0; i+W<=B.length; ) {
    if (T.includes(B.slice(i,i+W))) {
      let len=W; while(i+len<B.length && T.includes(B.slice(i,i+len+1))) len++
      out.push(B.slice(i,i+len)); i += len            // ← 핵심: i++ 가 아니라 i+=len
    } else i++
  }
  return out
}
const me = all.find(d => d.slug === TARGET)
if (!me) { console.log('slug 없음:', TARGET); process.exit(1) }
const B = txt(me), rows = []
for (const d of all) {
  if (d.slug === TARGET) continue
  const m = maximal(B, txt(d))
  if (m.length) rows.push({slug:d.slug, n:m.length, mx:Math.max(...m.map(x=>x.length)), ex:m.sort((a,b)=>b.length-a.length)[0]})
}
rows.sort((a,b)=>b.n-a.n||b.mx-a.mx)
rows.slice(0,6).forEach(r=>console.log('  ', r.slug.padEnd(30), r.n+'구절', '최장', r.mx+'자', '|', r.ex))
const top = rows[0]
if (!top) console.log('  ✅ 겹침 없음')
else if (top.n >= 12 || top.mx >= 30) console.log('  ⚠ 골격 복제 의심:', top.slug, '→ 재집필 검토')
else if (top.n >= 8 || top.mx >= 22) console.log('  ⚠ 문장 단위 재사용:', top.slug, '→ 최장 구절 3~5개 치환')
else console.log('  ✅ 정상 범위')
"
```

**판정 기준** (2026-07-30 전면 재측정. 이전 "건수" 기준은 폐기)

⚠️ **이전 버전의 계측 결함 2개를 고친 값이다. 옛 기준선(정상 5~6건 / 복제 80건)과 섞어 쓰지 말 것.**

1. **건수 부풀림**: 옛 스크립트는 `i++`로 훑어 26자 한 문장을 26자·25자·24자···14자로 **13건**으로 셌다. 그래서 "80건"은 실제로 대여섯 구절이었을 수 있다. 지금은 최대 구절 단위로 1건이다.
2. **클러스터 통과**: 옛 판정은 "1위가 2위의 3배 + 20건 이상"이라 서로 겹치는 3~4편 클러스터는 비율이 희석돼 통과했다. 실제로 confession-timing ↔ reunion 같은 **한 쌍**을 두고 confession 쪽은 ⚠, reunion 쪽은 ✅로 갈렸다. 지금은 비율이 아니라 **절대 구절수·최장 길이**로 본다.

실측 기준선 (전부 최대 구절 기준):

| 구간 | 실측 | 판정 |
|---|---|---|
| 무관한 같은 카테고리 (moon↔sun, snake↔kiss) | 0~1구절 / 0~17자 | 정상 |
| 유사 소재 자연 겹침 (cat↔dog 4구절, ex-lover↔reunion-dream 7구절 28자) | 4~7구절 | 정상. 소재가 겹치면 어휘도 겹친다 |
| 문장 단위 재사용 (상황별 timing 글 클러스터) | 8~11구절 / 22~26자 | **최장 구절 3~5개만 치환.** 재집필 아님 |
| 골격 복제 (bath↔bridge 수정 전) | 12구절 이상 또는 최장 30자 이상 | **재집필** |
| 수정 완료 후 (bath↔bridge, infidelity↔rut) | 0구절 | 정상 복귀 확인값 |

- **최장 길이가 구절수보다 중요하다.** 30자 이상 한 방은 6구절짜리 정형구 다발보다 훨씬 나쁘다(문장을 통째로 옮긴 증거).
- 겹침 문구가 FAQ **질문** 골격이면 반드시 고친다. 질문은 검색 쿼리와 직결돼 중복 신호가 가장 크게 잡히는 자리다.

**heading은 U가 보지 않는다. 아래 V 항목으로 따로 검사한다.** (2026-07-31 스크립트화)

---

### ⚠️ U의 "✅ 정상 범위"는 골격 복제의 무죄 증명이 아니다 (2026-08-07 추가, 신규 글 필수)

**U를 통과했다고 골격이 다르다는 뜻이 아니다.** 어휘를 치환하면 n-gram은 얼마든지 내려간다. `stairs-dream`은 직전 발행분 `earthquake-dream`과 130구절/최장 43자였던 것을 하루치 어휘 치환으로 **7구절까지 내려 U를 통과**했지만, 실제로는 §2 갈래 구성·§3 힌지·§4 착지점이 그대로인 1:1 클론이었다. 의미중복 정독으로만 잡혔다.

**골격은 n-gram이 아니라 갈래 구성표를 나란히 놓고 봐야 잡힌다.** 신규 글과 **① 직전 발행분 2~3편 + ② 소재 계열이 같은 과거 글 전부**의 `§2 갈래 제목만` 뽑아 표로 세우고 슬롯 대응을 직접 읽는다.

### 🛑 "최근 N편"만 보면 놓친다 (2026-08-11 신설, 실제 사고)

**`bird-dream`(8/11)은 최근 6편과 전부 무죄였는데, 진짜 복제 원본은 `butterfly-dream`(7/15)·`fish-dream`(7/10)이었다.** "작은 생물이 다가오고·잡히고·놓쳐지는" 계열과 **5슬롯 5/5 대응**(접근/포획/상실/정지/복수)이었고 3번 슬롯은 논지까지 같았다. n-gram 상위 목록에 이 둘은 **아예 없어서** U로도 안 잡혔다.

원인: 톤 샘플로 읽지 않은 글과도 골격이 겹칠 수 있다. **같은 소재 계열은 서술 구조가 자연히 수렴하기 때문**이다. 그래서 비교 대상을 "최근"이 아니라 **"계열"**로 잡아야 한다.

**계열 후보를 먼저 기계적으로 뽑아라.** 신규 글의 소재가 속한 범주(동물·자연물·탈것·신체·장소 등)를 정하고, 그 범주의 기존 글을 전부 목록에 넣는다. 예: 새 → 나비·물고기·개·고양이·뱀(작은 생물/동물), 계단 → 다리·길·이사(이동/경로), 비 → 눈·바다·물(물/날씨). 애매하면 넓게 잡아라 - 표 하나 더 뽑는 비용이 재집필보다 싸다.

```bash
cd /home/tjd618/lovtaro && SLUGS="bird-dream,butterfly-dream,fish-dream,cat-dream,dog-dream,snake" node --input-type=module -e "
import dreams from './src/data/dreams/index.js'
const pick = process.env.SLUGS ? process.env.SLUGS.split(',') : dreams.slice(0,3).map(d=>d.slug)
for (const s of pick) {
  const d = dreams.find(x => x.slug === s); if (!d) { console.log('없음: '+s); continue }
  console.log('=== ' + d.slug + ' ===')
  const sec = d.sections.find(x => (x.content||'').includes('<li>')) || d.sections[1]
  ;[...(sec.content||'').matchAll(/<strong>(.*?)<\/strong>/g)].forEach((m,i) => console.log('  ' + (i+1) + '. ' + m[1]))
}
"
```

**적발 신호** (하나라도 해당하면 골격 복제):
- 1번 슬롯과 마지막 슬롯이 **소재 명사만 바뀐 동일 갈래**다 (실제 사고: 지진 `연인과 손 잡고 대피` ↔ 계단 `연인과 손 잡고 오르기` / 지진 `전 애인과 함께 겪음` ↔ 계단 `전 애인과 함께 있음`)
- 슬롯 개수와 **긍정→부정→모호→고립→과거** 배치 순서가 같다
- §3의 "옛 풀이가 짚은 건 [미래사건]이 아니라 지금 [X]" 힌지가 직전 편에도 있다 (driving 8/5 → earthquake 8/6 → stairs 8/7 → military 8/10 → bird 8/11 … **2026-08-03~08-11 7편 연속**으로 확인됨. 주어를 생략하거나 어휘를 바꿔도 **부정-대치 2단 구조**가 남아 있으면 해당된다)
- §4 마지막 문단의 착지가 같다 (예: "그 사람이 그리운지 그때의 느낌이 그리운지 구분하라"는 68편 중 6편이 쓰는 블록인데 최근 편에 몰림)
- **하우스 공식을 어휘 치환으로 위장했다.** bird 초판이 key/shoes/wedding-guest 등 8편의 "관계의 결과를 미리 **정해두는** 예언이 아니라 … **거울**"에서 **동사 1개·명사 1개만 바꿔**("알려주는", "신호") n-gram 12자 문턱 아래로 내려갔다. 최종 문단은 반드시 아래 3종을 grep으로 세어보고, 걸리면 글 고유 표현으로 교체한다

```bash
cd /home/tjd618/lovtaro && for p in '예언' '거울' '그 마음 자체는 자연스럽' '이 꿈이 반복된다면'; do
  printf '%-22s %s편\n' "$p" "$(grep -rl "$p" src/data/dreams/*.js | wc -l)"; done
```

⚠️ **`<strong>`을 갈래 라벨 외에 쓰지 마라.** 위 추출 스크립트가 `<strong>`을 세어 갈래를 뽑으므로, 불릿 **안쪽**에 강조를 하나 더 넣으면 유령 갈래가 생겨 이후 모든 골격 검사가 그 글을 오독한다(bird 재작성 중 실제 발생, 5갈래가 6갈래로 셈). 갈래 안에서 강조가 필요하면 `<em>`을 쓰거나 강조 없이 쓴다.

**적발 시**: 어휘 치환으로 해결되지 않는다. **판독 축 자체를 그 소재만 가질 수 있는 것으로 교체하고 갈래를 재분할**한다. 축이 "흔들림 세기"(지진)·"핸들 주체"(운전)·"오르내림 방향"(계단 초판)처럼 **1축 이항/연속 변수**면 소재를 바꿔도 같은 글이 된다. 계단 재집필에서는 축을 "걸음의 폭"(한 칸씩 / 여러 칸 건너뛰기 / 헛디딤)으로 바꿨는데, 이는 딛는 자리가 칸으로 나뉜 소재에서만 성립하고 전통 사전도 이 셋을 각각 다른 항목으로 나눠 둬서 근거와 고유성이 동시에 확보됐다.

**하우스 공식 카운트도 함께 본다.** 이 글만의 관점인 척하는 프레임이 실제로는 사이트 다수가 쓰는 공용 블록인지 세어본다(실측: "예언이 아니라 지금 내 마음" 34/68, "꿈은 나를 비추는 거울" 67/68, "전 애인=재회 예고 아니라 미정리" 26/68). 공용 블록을 쓰는 것 자체는 문제가 아니지만, **그것을 글의 결론 자리에 놓으면 그 글은 새로 주는 것이 없다.**

**수정 방법 - 판정에 따라 갈린다** (2026-07-30 분리)

- **골격 복제(12구절↑ 또는 30자↑)**: 부분 문구 치환으로 해결되지 않는다(치환해도 뼈대가 남는다). 그 소재 고유의 앵커로 **논지 자체를 갈아끼워 재집필**한다. 예: 목욕=물을 다시 받을 수 있음·씻는 순서·목욕탕이라는 공용 공간, 다리=건넌 지점·다리의 상태.
- **문장 단위 재사용(8~11구절 / 22~26자)**: 재집필하지 않는다. **최장 구절 3~5개만** 그 글 고유의 표현으로 바꾼다. 논지는 이미 다르고 문장만 돌려 쓴 상태라 치환으로 충분하다. 여기서 재집필을 하면 멀쩡한 논지를 흔들어 오히려 검증 항목이 늘어난다.

어느 쪽이든 수정 후 위 스크립트를 다시 돌려 내려왔는지 확인한다. FAQ 문구를 고쳤으면 `prerender.mjs`의 GUIDES[].faq 동기화(N 검사).

### V. heading 프레임 복제 검사 (2026-07-31 신설, 신규 글 필수)

**U는 `sections[].content` + `faq`만 본다. `heading`은 어느 검사에도 들어가 있지 않았다.**

**배경 (2026-07-31 회고, 3연속 재발)**: drinking-dream이 §2 heading을 `누구와, 어떤 분위기였는지에 따라 달라지는 결`로 썼다. meal-dream heading(`누구와, 어떤 분위기였는지에 따라`)에 travel-dream 어미(`~달라지는 결`)를 붙인 결합물인데, **본문 n-gram은 meal-dream과 1구절 14자로 완전 정상**이라 U를 조용히 통과했다. bridge(7/27)·bath(7/29)가 같은 `누구와` 프레임으로 사고를 낸 직후였고, 스킬에 "heading도 grep으로 대조하라"는 **수동 지시가 이미 있었는데도** 세 번째로 뚫렸다. 수동 지시로는 안 막히는 것이 확인돼 스크립트로 옮겼다.

```bash
# 신규 글 (OK 항목까지 출력)
cd /home/tjd618/lovtaro && SLUG={slug} node scripts/verify/heading-frame.mjs
```

두 규칙을 함께 돌린다. **단일 지표로는 두 사고 유형을 모두 못 잡는다.**

| 규칙 | 잡는 것 | 실측 |
|---|---|---|
| A. 어간 LCS ≥10자 (공유 편수 ≤2) | 특정 1편의 heading을 통째로 들어 쓴 경우 | drinking 사고 = meal-dream과 **14자** |
| B. 금지 오프너 (`누구와`) | 오프너만 같고 중간이 다른 경우 | bridge 사고 = travel과 어간 LCS **3자**라 A로는 안 잡힘 |

- **어미를 떼고 어간만 비교한다.** `~에 따라 달라지는 결`, `~신호로 봐도 될까`는 사이트 공용이라 안 떼면 임계10에서 오탐 46건.
- **어간을 3편 이상이 공유하면 시리즈 템플릿으로 보고 면제한다.** 사고는 항상 특정 1편 대상의 1:1 도용이다. 이 조건이 없으면 상황 가이드 12편의 의도된 템플릿(`{주제} 리딩에서 자주 등장하는 카드 N장`)이 통째로 오탐된다.
- 5편 이상이 쓰는 heading 완전일치(`이 꿈이 비추는 것` 43편 등)는 의도된 관행이라 면제.

**적발 시**: 소재 고유어로 교체한다. 부분 치환이 아니라 heading이 가리키는 **분류 축 자체**를 그 소재만의 것으로 바꾼다. 선례 - 목욕 `물의 상태와 씻고 난 뒤의 감각에 따라`, 다리 `다리의 상태와 건넌 지점에 따라`, 술 `술자리의 상대와 취기의 정도에 따라`.

**금지 오프너는 사고가 날 때마다 스크립트의 `BANNED_OPENERS`에 추가**한다.

⚠️ **인자 없이 전수 실행하면 카드 해석 가이드 78장의 정당한 병렬 heading**(`정방향 완드의 4 - 상황별로 읽기` ↔ `정방향 소드의 4 - 상황별로 읽기`)**이 대량 잡힌다.** 전수 모드는 참고용이고, 실사용은 신규 글 `SLUG=` 모드다.

## 실행 순서

1. **대상 범위 확인**
   - 인자로 파일 지정되면 해당 파일만 (`/lovtaro-verify moon-love-meaning`)
   - 인자 없으면 전수 스캔

2. **A~V 순서대로 실행** (R = FAQ-본문 자체중복, S = 상황 글-리딩 데이터 겹침, T = 정량 스펙 준수, U = 글↔글 본문 골격 복제, **V = heading 프레임 복제**)

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

**수동 기록 불필요.** `~/.claude/log-skill.sh`(PostToolUse 훅)가 스킬 호출 시 **자동으로** 두 곳에 기록한다:

- `~/skill-log.json` - 로컬 대시보드용 (홈 디렉토리라 **PC 간 동기화 안 됨**)
- `.claude/skill-log.md` - **git 추적 = PC 간 동기화됨.** 다른 PC에서 무엇을 돌렸는지 아는 유일한 근거

⚠️ 이 로그는 **"스킬을 호출했다"만** 기록한다(중간에 멈춰도 행이 남음). 산출물이 실제로 만들어졌는지는 각 스킬의 전용 대장·큐 파일로 판단할 것.

`.claude/skill-log.md`는 사용자가 커밋해야 다른 PC에 전파되므로, 작업 완료 보고 시 **커밋 대상에 포함**하라고 안내할 것.

$ARGUMENTS
