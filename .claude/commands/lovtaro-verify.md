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
- **대상 파일**: `src/data/guides/*.js`, `src/data/cardDictionary.js`, `src/data/minorArcana.js`

## 검사 대상 경로

```bash
GUIDE_DIR=/home/tjd618/lovtaro/src/data/guides
CARD_MAJOR=/home/tjd618/lovtaro/src/data/cardDictionary.js
CARD_MINOR=/home/tjd618/lovtaro/src/data/minorArcana.js
```

## 검사 항목

### A. em dash (—) 자동 치환

**규칙**: 전 프로젝트 공통으로 em dash(—) 금지. 하이픈(-)으로 자동 치환. 불필요하면 삭제.

```bash
# 발견 위치 파악
grep -rn '—' /home/tjd618/lovtaro/src/data/guides/ \
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
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

발견 시 완화 표현으로 교체. 타로 해석의 그림자 측면도 **자기 성찰 관점**으로 서술해야 함.

### E. 과도한 친근 톤 (~죠?, ~잖아요)

```bash
grep -rnE '죠\?|잖아요|거든요|더라구요|ㅋ|ㅎ|ㅠ' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

Lovtaro는 **조용한 조언자** 톤. 발견 시 담백한 어미로 수정.

### F. 타로 자가 부정 표현

```bash
grep -rnE '타로는 미신|정확하지 않|맞지 않을 수도|재미로' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

면책 조항은 `/disclaimer` 페이지에서만. 본문에서 자가 부정은 브랜드 훼손.

### G. 하드코딩된 URL

```bash
grep -rnE "https://lovtaro\.kr" \
  /home/tjd618/lovtaro/src/data/guides/ \
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
# CARD_DICTIONARY, MINOR_ARCANA 둘 다 객체이므로 Object.keys()로 id 추출
node --input-type=module -e "
import guides from '/home/tjd618/lovtaro/src/data/guides/index.js'
import { CARD_DICTIONARY } from '/home/tjd618/lovtaro/src/data/cardDictionary.js'
import { MINOR_ARCANA } from '/home/tjd618/lovtaro/src/data/minorArcana.js'
const ids = new Set([...Object.keys(CARD_DICTIONARY), ...Object.keys(MINOR_ARCANA)])
guides.forEach(g => {
  (g.relatedCards || []).forEach(c => {
    if (!ids.has(c.id)) console.log('MISSING-CARD:', g.slug, '→', c.id)
  })
})
"
```

(2026-04-24 수정: 이전 버전은 require + .map() 사용했는데 두 데이터가 객체라 TypeError. ESM + Object.keys()로 수정.)

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

### P. 가이드-카드 본문 의미 중복 검사 (2026-04-22 추가)

카드 해석 가이드(category: card-interpretation)의 본문/FAQ와 해당 카드 cardDictionary.js / minorArcana.js 블록의 본문을 N-gram으로 비교해 연속 15자 이상 공유하는 문자열을 찾는다. 정규식 기반 감사(A~O)로는 잡히지 않는 **의미 레벨 중복**을 감지하는 유일한 단계.

**배경 (2026-04-22 회고)**: star 가이드 FAQ가 cardDictionary.js star 블록의 문장을 거의 그대로 재서술한 사례 발생. 작성자(AI)의 주관적 판단으로는 "심화"했다고 느꼈지만 실제로 32자 연속 겹침이 있었음. 객관적 측정이 필요해 이 스크립트를 도입.

```bash
# 전체 가이드 전수 검사
cd /home/tjd618/lovtaro && node scripts/verify/guide-card-overlap.mjs

# 특정 슬러그만 (부분 매치 가능)
cd /home/tjd618/lovtaro && node scripts/verify/guide-card-overlap.mjs star
```

**판정 기준**:
- 연속 **20자 이상 겹침**: 거의 확실한 의미 중복. 해당 문단을 심화·사례·다른 관점으로 재작성.
- 연속 **15-19자 겹침**: 문맥 확인 필요. 정형 표현("~경우가 많아요", "~도움이 돼요" 등)이면 허용, 카드 고유 관점 재서술이면 수정.
- **15자 미만**: 자연스러운 한국어 연결어 수준. 무시.

**자동 수정하지 않는다.** 중복은 의미를 재구성해야 하므로 수작업이 안전. 리포트만 내고 담당 가이드를 Edit.

**수정 후 동기화**: 가이드 파일을 수정하면 `scripts/prerender.mjs`의 GUIDES[].faq도 동일하게 수정해야 JSON-LD 일치 유지.

## 실행 순서

1. **대상 범위 확인**
   - 인자로 파일 지정되면 해당 파일만 (`/lovtaro-verify moon-love-meaning`)
   - 인자 없으면 전수 스캔

2. **A~P 순서대로 실행**

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
