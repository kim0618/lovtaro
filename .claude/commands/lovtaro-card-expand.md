---
description: lovtaro.kr 카드 상세 페이지 본문 보강 - 연애 해석 심화 (하루 2장, 78장 완료 시 자동 삭제)
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 러브타로 카드 상세 보강 스킬

78장 타로 카드 각각의 `cardDictionary.js` 본문을 **연애 해석 심화 + 사례 + 조합 의미**로 보강한다. 슬러그·이름·JSON-LD 구조는 그대로, 본문 텍스트만 확장.

## 실행 일정

- **시작일**: 2026-04-19 (일) - Phase 2 Day 1
- **진행 속도**: 사용자 명시 없으면 **하루 2장만**
- **완료 목표**: 2026-05-27 (수) - Phase 2 Week 6 중반 (78장 ÷ 2장/일 = 39일)
- **총 대상**: 78장 (Major 22 + Minor 56)
- 78장 전수 완료 시 이 스킬 파일 **자동 삭제**

## 편수 원칙 (최우선)

- **사용자가 명시하지 않으면 반드시 2장만 작업한다.**
- "3장", "5개" 등 명시한 경우에만 그 수를 따른다.
- Google 스팸 패턴 회피: 카드 3장 이상 한꺼번에 `updatedAt` 갱신 금지.

## 프로젝트 경로

- 메이저 카드 데이터: [src/data/cardDictionary.js](/home/tjd618/lovtaro/src/data/cardDictionary.js) (22장, `CARD_DICTIONARY` 객체)
- 마이너 카드 데이터: [src/data/minorArcana.js](/home/tjd618/lovtaro/src/data/minorArcana.js) (56장, `MINOR_ARCANA` 배열)
- 카드 목록: [src/data/tarotCards.js](/home/tjd618/lovtaro/src/data/tarotCards.js)
- 상세 페이지: `src/pages/CardDetailPage.vue`
- prerender FAQ 생성: [scripts/prerender.mjs](/home/tjd618/lovtaro/scripts/prerender.mjs)의 `buildFAQPage`

## 보강 진행률 (매 작업마다 갱신)

### Major Arcana (22장)

<!-- 보강 완료 카드 아래에 `- {id} ({YYYY-MM-DD})` 추가 -->
- moon (2026-04-19)
- lovers (2026-04-19)
- empress (2026-04-20)
- emperor (2026-04-20)
- star (2026-04-21)
- tower (2026-04-21)
- fool (2026-04-22)
- sun (2026-04-22)
- hermit (2026-04-24)
- devil (2026-04-24)
- magician (2026-04-25)

### Minor Arcana (56장)

<!-- 보강 완료 카드 아래에 `- {id} ({YYYY-MM-DD})` 추가 -->
- ace-of-cups (2026-04-26)
- two-of-cups (2026-04-26)

### 미완료 카운트

```bash
# 메이저 카드 id 목록
grep -oE "^\s+[a-z-]+:" /home/tjd618/lovtaro/src/data/cardDictionary.js | head -25
# 마이너 카드 id 목록 (예: ace-of-cups)
grep -oE "id: '[a-z-]+'" /home/tjd618/lovtaro/src/data/minorArcana.js
```

## 카드 보강 대상 필드

기존 구조 유지하며 **다음 4개 필드만 확장**:

```javascript
upright: {
  core: '...',       // 현재 100-200자 → 200-350자로 확장 (핵심 의미 심화)
  love: '...',       // 현재 150-250자 → 400-600자로 확장 (연애 해석 심화, 사례 포함)
  advice: '...',     // 현재 50-100자 → 100-200자로 확장
},
reversed: {
  core: '...',       // 동일
  love: '...',       // 동일 (역방향 연애 해석)
  advice: '...',     // 동일
},
```

**총 증분**: 현재 약 700-900자 → 약 2,000-2,800자로 확장.

## 추가 필드 (선택, 없으면 신설)

카드 객체에 다음 필드를 추가해 보강 가치 확장 가능. **타입 변경은 cardDictionary.js 구조에 맞춰** 기존 카드와 일관성 유지.

```javascript
magician: {
  // ... 기존 필드
  loveScenarios: [  // 상황별 연애 해석 (새 필드, 선택)
    { situation: '짝사랑', meaning: '...' },
    { situation: '재회', meaning: '...' },
    { situation: '썸', meaning: '...' },
  ],
  combinations: [   // 자주 나오는 조합 (새 필드, 선택)
    { with: 'lovers', meaning: '...' },
    { with: 'moon', meaning: '...' },
  ],
},
```

**주의**: `CardDetailPage.vue`에서 새 필드를 렌더링하도록 함께 수정해야 함. 단순 본문 확장이 우선이고, 렌더링 파일 수정 범위가 커지면 코어 필드(upright/reversed)만 확장한다.

## 작업 순서

### 1) 대상 선정

우선순위:

1. **연애 빈출 카드 먼저**: `moon`, `lovers`, `empress`, `emperor`, `star`, `tower`, `fool`, `sun`, `hermit`
2. **Cups 슈트** (감정·연애 관련): `ace-of-cups`, `two-of-cups`, `three-of-cups`, ... `king-of-cups`
3. 나머지 Major → 나머지 Minor 순

```bash
# 보강 완료 목록 조회 (이 파일 위 진행률 섹션)
# 미완료 중 위 우선순위대로 2장 선택
```

### 2) 현재 본문 측정

```bash
# 특정 카드 (메이저)
grep -A 15 "^  moon: {" /home/tjd618/lovtaro/src/data/cardDictionary.js | head -30
# 특정 카드 (마이너)
grep -B 2 -A 20 "id: 'ace-of-cups'" /home/tjd618/lovtaro/src/data/minorArcana.js | head -30
```

기존 문장과 **중복 회피**. 보강은 *확장*이지 *재서술*이 아니다.

### 3) 글 확장

각 필드 작성 가이드:

#### `upright.core` (200-350자)

- 카드의 상징 1-2줄
- 이 카드가 전하는 본질적 메시지
- 그림 요소(등장 인물·소품)가 가리키는 것 1-2문장
- 중립 톤, 학술적 과장 금지

#### `upright.love` (400-600자, 목표 500-580자)

- **상황별 분기** (짝사랑·썸, 연인 관계, 재회, 상대방 자리 중 **3개 선택**)
  - 각 시나리오 약 150자. 4개 전부 + 도입부 쓰면 600자 넘기 쉬움 (2026-04-24 회고: hermit·devil 둘 다 760자 나와서 사후 트리밍 필요했음)
  - **도입부는 쓰지 않거나 1-2문장으로 짧게**. 본론부터 바로 시작해도 OK
- 각 시나리오는 **구체 장면 1개 + 판단 조언 1개** 포함
- **독자 다음 행동 힌트**는 마지막 시나리오 안에 녹여서 (별도 문단 추가 금지)
- 단정 금지: "~할 수 있어요", "~일 가능성이 높아요"

#### `upright.advice` (100-200자)

- 구체적 행동 조언 1개
- 피해야 할 태도 1개
- 따뜻한 응원 1문장

#### `reversed.*` 세트도 동일 구조로

- 역방향은 **그림자·막힘·역류**의 관점
- 자학적/비관적 톤 금지. "지금 잠시 ~한 시기", "~을 돌아볼 때"

### 4) 파일 수정 (Edit 도구)

```
Edit /home/tjd618/lovtaro/src/data/cardDictionary.js
```

해당 카드 블록의 필드만 교체. 주변 카드 블록은 건드리지 않는다.

**주의**: 자바스크립트 문자열 안에 `'`, `"` 이스케이프. 멀티라인은 템플릿 리터럴(\`...\`) 또는 `\n` 사용.

**렌더링 주의 (2026-04-19 이슈 회고)**:

`upright.love`, `reversed.love`처럼 긴 문단을 가진 필드에 `\n\n`로 문단 구분을 넣을 때, `CardDetailPage.vue`의 `.card-detail__block-text`에 `white-space: pre-line` CSS가 있어야 브라우저에서 실제 문단으로 보여요. 2026-04-19 moon/lovers 보강 때 이 속성이 없어 `\n\n`가 공백으로 collapse되는 버그가 있었고, 이후 수정됨.

체크:
```bash
grep -A 5 "card-detail__block-text" /home/tjd618/lovtaro/src/pages/CardDetailPage.vue | grep -c "white-space: pre-line"
# 기대: 1 이상
```

결과가 0이면 먼저 CSS를 복구한 뒤 보강 작업을 진행한다. 또는 `\n\n` 대신 한 문단으로 풀어쓴다.

### 5) 빌드 검증

```bash
cd /home/tjd618/lovtaro && npm run build 2>&1 | tail -10
```

확인 사항:
- 빌드 성공 (문법 오류 0)
- `dist/cards/{id}/index.html` 생성 확인
- FAQ JSON-LD 자동 갱신 확인:

```bash
grep -c 'application/ld+json' /home/tjd618/lovtaro/dist/cards/{id}/index.html
```

### 6) 본문 분량 검증 (필수, 2026-04-20 회고)

**필드별 + 총합 둘 다 검증한다.** 과거에 필드별 목표만 맞추고 총합 미달로 발행된 사례가 있어 반드시 둘 다 통과시킨 뒤 완료 처리.

```bash
node --input-type=module -e "
import { CARD_DICTIONARY } from '/home/tjd618/lovtaro/src/data/cardDictionary.js'
const FIELD_TARGETS = {
  'upright.core': [200,350], 'upright.love': [400,600], 'upright.advice': [100,200],
  'reversed.core': [200,350], 'reversed.love': [400,600], 'reversed.advice': [100,200]
}
const TOTAL_MIN = 2000, TOTAL_MAX = 2800
for (const id of ['{id1}','{id2}']) {
  const c = CARD_DICTIONARY[id]
  let sum = 0
  const issues = []
  for (const [k,[lo,hi]] of Object.entries(FIELD_TARGETS)) {
    const [t,f] = k.split('.')
    const n = c[t][f].length
    sum += n
    if (n<lo) issues.push(k+' 미달('+n+'/'+lo+')')
    else if (n>hi) issues.push(k+' 초과('+n+'/'+hi+')')
  }
  const totalMark = sum<TOTAL_MIN ? ' ***총합 미달('+sum+'/'+TOTAL_MIN+')***' :
                    sum>TOTAL_MAX ? ' ***총합 초과('+sum+'/'+TOTAL_MAX+')***' : ' 총합 OK('+sum+')'
  console.log(id+':'+totalMark+(issues.length ? ' | '+issues.join(', ') : ''))
}
"
```

**모두 `총합 OK` 표시 나올 때까지 보강 계속**. 미달일 경우:
- 우선 `upright.love`/`reversed.love`에 **상대방 자리 해석** 한 단락 추가 (가장 자연스러운 확장 지점)
- 그다음 `core`에 카드의 장기적/근원적 메시지 한 문장 추가
- `advice`는 1-2 문장 추가

총합이 `초과`면 가장 장황한 필드에서 중복 표현 제거. 억지로 깎지 말 것.

### 7) 진행률 갱신

이 파일 "보강 진행률" 섹션에 `- {id} ({YYYY-MM-DD})` 추가.

메모리에도 동기화:

```
Read /home/tjd618/.claude/projects/-home-tjd618/memory/project_lovtaro_card_usage.md
```

(해당 파일은 인스타 생성용 카드 사용 기록. 이 보강 스킬은 그 파일을 **참고만** 하고 수정하지 않음. 보강 진행률은 이 스킬 파일 본문에 기록.)

### 8) 결과 요약 출력

```
## 카드 보강 결과 ({YYYY-MM-DD})

| 카드 id | 이름 | 보강 전 | 보강 후 | 증분 |
|---------|------|---------|---------|------|
| moon | 달 | 860자 | 2,340자 | +1,480자 |
| lovers | 연인 | 780자 | 2,210자 | +1,430자 |

**진행 현황: N / 78장 (X%)**
**남은 장수: 78-N장 (하루 2장 기준 D일 소요)**
**카드 보강 완료 목표 (2026-06-03) D-?**
```

## 톤·문체 규칙

- **em dash(—) 금지**: 하이픈(-) 사용 또는 삭제
- **AI 패턴 금지**: "안녕하세요", "정리합니다", "알아보겠습니다", "완벽 가이드"
- **단정 금지**: "반드시", "100%", "무조건" → "~일 수 있어요", "~한 경우가 많아요"
- **자극적 표현 금지**: "이 사람과 헤어집니다", "절대 돌아오지 않아요"
- **감정 톤**: 따뜻한 조언자, 조용한 관찰자
- **어미**: "~예요", "~이에요" 위주
- **타로 자가 부정 금지**: "타로는 맞지 않을 수도 있지만"

## 검증 체크리스트 (작업 후 필수)

```
□ npm run build 성공, 문법 에러 0
□ 필드별 목표 전 통과 (upright/reversed × core/love/advice 6개)
□ **총합 2,000-2,800자 통과** (2026-04-20 회고 - 필드별 OK여도 총합 미달 가능)
□ em dash(—) 0건
□ AI 패턴 0건
□ 단정 표현 0건
□ 기존 slug, name, nameEn 변경 없음
□ energy, keywords, element 변경 없음
□ JSON-LD FAQ 자동 갱신 (dist 확인)
□ 이 스킬 진행률 표 갱신
```

## 절대 변경하지 않는 것

- `id`, `slug`, `name`, `nameEn` - URL 및 canonical 영향
- `number`, `energy`, `keywords`, `element` - UI 분류 영향
- 다른 카드 블록 - 작업 대상만 수정
- `tarotCards.js`, `minorArcana.js`의 `id` 배열 순서
- `prerender.mjs`의 `CARDS`/`MINOR_CARDS` 배열 (자동 동기화 대상)

## 변경해도 되는 것

- `upright.core`, `upright.love`, `upright.advice`
- `reversed.core`, `reversed.love`, `reversed.advice`
- (선택) `loveScenarios`, `combinations` 새 필드 (CardDetailPage 렌더링 함께 수정 시)

## 금지

- 하루 3장 이상 보강 (사용자 명시 없이)
- 여러 카드 `updatedAt` 한꺼번에 갱신 (cardDictionary 구조상 updatedAt 필드 없음, 해당 없음)
- 카드 삭제·추가 (78장 고정)
- 이름·번호 변경 (예: "마법사" → "The Magician")
- JSON-LD 빌더 로직 수정

## 78장 전수 완료 시

1. 사용자에게 메시지:
   ```
   러브타로 카드 78장 보강 완료! Phase 2 Week 6 목표 달성 (5/27 예정).
   AdSense 신청(6/12) 준비의 카드 파트 완료.
   이 스킬(/lovtaro-card-expand)을 삭제합니다.
   ```
2. 이 스킬 파일(`/home/tjd618/.claude/commands/lovtaro-card-expand.md`) 삭제
3. 프로젝트 스킬(`/home/tjd618/lovtaro/.claude/commands/lovtaro-card-expand.md`)도 함께 삭제 (symlink면 원본 삭제로 끝)
4. 애드센스 계획 메모리(`project_lovtaro_adsense_plan.md`)에 완료 표시 갱신


## 완료 후 로그 기록

스킬 실행이 완료되면 반드시 아래 명령으로 `skill-log.json`에 기록한다:

```bash
python3 -c "import json,datetime; logs=json.load(open('/home/tjd618/skill-log.json')); now=datetime.datetime.now(); logs.insert(0,{'date':now.strftime('%Y-%m-%d'),'time':now.strftime('%H:%M'),'project':'lovtaro','skill':'lovtaro-card-expand'}); open('/home/tjd618/skill-log.json','w').write(json.dumps(logs,ensure_ascii=False,indent=2))"
```

$ARGUMENTS
