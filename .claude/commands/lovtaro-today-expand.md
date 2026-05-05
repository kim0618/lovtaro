---
description: lovtaro.kr 오늘의 카드 마이너 아르카나 56장 데이터 추가 (하루 3장, today.js + reversedModifiers.js + relationshipModifiers.js, 56장 완료 시 자동 삭제)
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 러브타로 오늘의 카드 마이너 확장 스킬

`/today` (오늘의 연애 카드)에 마이너 아르카나 56장을 단계적으로 추가해 매일 뽑을 때의 변동성을 확보하는 스킬. 메이저 22장 + 데이터가 채워진 마이너만 덱에 자동 포함되는 **동적 덱 구조**로 운영(2026-05-05 전환 완료).

마이너 56장의 `today.js` + `reversedModifiers.js` + `relationshipModifiers.js` 세 파일에 **하루 3장씩** 데이터를 채워 넣는다. 데이터를 추가한 그날 빌드/배포부터 해당 카드가 자동으로 `/today` 덱에 포함된다.

## 실행 일정

- **시작일**: 2026-05-04 (월)
- **진행 속도**: 사용자 명시 없으면 **하루 3장만**
- **완료 목표**: 약 19일 (56장 ÷ 3장/일 = 18.7일)
- **총 대상**: 마이너 56장 (Cups 14 + Wands 14 + Pentacles 14 + Swords 14)
- 56장 전수 완료 시 이 스킬 파일 **자동 삭제** (덱 활성화는 동적 구조라 자동)

## 편수 원칙 (최우선)

- **사용자가 명시하지 않으면 반드시 3장만 작업한다.**
- "5장", "1장" 등 명시한 경우에만 그 수를 따른다.
- 완료 직전 마지막 잔여 1-2장이면 그날 잔여만 처리하고 종료 단계로 진입.

## 동적 덱 구조 (2026-05-05 전환 완료)

`useDailyTarot.js`의 `FULL_DECK`이 `MAJOR_ARCANA_CARDS + (TODAY_RESULTS에 데이터 있는 마이너만)`을 자동으로 합성한다. 데이터 없는 카드는 덱에 포함되지 않으므로 빈 결과 화면 버그가 원천 차단됨.

**작업자가 해야 할 일**: today.js + reversedModifiers.js + relationshipModifiers.js 세 파일에 카드 데이터를 추가하는 것. **`useDailyTarot.js`는 절대 수정하지 않는다.** 카드를 추가하면 다음 빌드부터 자동으로 덱에 포함된다.

## 프로젝트 경로

- 오늘의 카드 결과 데이터: [src/data/readings/today.js](/home/tjd618/lovtaro/src/data/readings/today.js) (`TODAY_RESULTS` 객체)
- 역방향 수정자: [src/data/reversedModifiers.js](/home/tjd618/lovtaro/src/data/reversedModifiers.js) (`REVERSED_MODIFIERS` 객체)
- 연애 상태 수정자: [src/data/relationshipModifiers.js](/home/tjd618/lovtaro/src/data/relationshipModifiers.js) (`RELATIONSHIP_MODIFIERS` 객체, 카드별 4상태 × 2필드)
- 마이너 카드 데이터: [src/data/minorArcana.js](/home/tjd618/lovtaro/src/data/minorArcana.js) (56장 카드 메타, **객체** 형태 - 키가 id)
- 덱 구성 composable: [src/composables/useDailyTarot.js](/home/tjd618/lovtaro/src/composables/useDailyTarot.js) (`FULL_DECK` export, 동적 합성)
- 덱 카드 배열: [src/data/tarotCards.js](/home/tjd618/lovtaro/src/data/tarotCards.js) (`MAJOR_ARCANA_CARDS`, 배열 형태)

### 자료 구조 주의

- `TAROT_CARDS`: **배열**, `[{ id, name, nameEn, keywords, energy }, ...]`
- `MINOR_ARCANA`: **객체**, `{ 'ace-of-cups': { number, name, nameEn, suit, energy, keywords, element, upright, reversed }, ... }` - 카드 객체 안에 `id` 필드 없음, 객체 키가 id 역할
- `shuffleCards(cards)`는 배열을 받고 각 항목의 `card.id`를 사용. 마이너를 덱에 합칠 때 반드시 id 필드 주입 필요

## 진행률 (매 작업마다 갱신)

### Cups (14장) - 우선순위 1 (감정·연애 직결)

<!-- 완료 카드 아래에 `- {id} ({YYYY-MM-DD})` 추가. relationshipModifiers는 2026-05-05에 6장 일괄 보강 완료 -->
- ace-of-cups (2026-05-04, relationship 보강 2026-05-05)
- two-of-cups (2026-05-04, relationship 보강 2026-05-05)
- three-of-cups (2026-05-04, relationship 보강 2026-05-05)
- four-of-cups (2026-05-05)
- five-of-cups (2026-05-05)
- six-of-cups (2026-05-05)

### Wands (14장) - 우선순위 2 (열정·관계 동력)

### Pentacles (14장) - 우선순위 3 (안정·현실)

### Swords (14장) - 우선순위 4 (생각·갈등)

### 미완료 카운트

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import { TODAY_RESULTS } from './src/data/readings/today.js'
import { REVERSED_MODIFIERS } from './src/data/reversedModifiers.js'
import { RELATIONSHIP_MODIFIERS } from './src/data/relationshipModifiers.js'
import { MINOR_ARCANA } from './src/data/minorArcana.js'
const minorIds = Object.keys(MINOR_ARCANA)
const fullyDone = minorIds.filter(id => TODAY_RESULTS[id] && REVERSED_MODIFIERS[id] && RELATIONSHIP_MODIFIERS[id])
const partial = minorIds.filter(id => (TODAY_RESULTS[id] || REVERSED_MODIFIERS[id] || RELATIONSHIP_MODIFIERS[id]) && !fullyDone.includes(id))
const missing = minorIds.filter(id => !TODAY_RESULTS[id] && !REVERSED_MODIFIERS[id] && !RELATIONSHIP_MODIFIERS[id])
console.log('전 파일 완료:', fullyDone.length, '/ 56')
console.log('부분 완료(보강 필요):', partial.length, partial.length ? '→ '+partial.join(',') : '')
console.log('미착수:', missing.length, '장')
console.log('미착수 첫 5장:', missing.slice(0,5).join(', '))
"
```

## 카드별 작성 분량

기존 메이저 22장 실측(2026-05-04 측정)을 베이스로 ±10% 허용:

### `today.js` 신규 엔트리 (카드당 약 500-700자)

```javascript
'ace-of-cups': {
  summary: '...',          // 40-65자, 오늘의 핵심 메시지 (실측 median 55)
  emotionHook: '...',      // 25-40자, 2줄 (\n 1개 포함), 공감 질문형 (실측 median 32)
  emotionTags: [...],      // 4개, 키워드 단어
  emotionFlow: [           // 5개 문장, 합계 220-310자 (실측 median 261)
    '...',                 // 카드의 오늘 에너지 도입
    '...',                 // 그 에너지 아래 깔린 마음
    '...',                 // 일어날 수 있는 구체 장면
    '...',                 // 주의/균형점
    '...',                 // 오늘 행동 방향 한 문장
  ],
  advice: [                // 2개 문장, 합계 100-150자 (실측 median 131)
    '...',                 // 구체 행동
    '...',                 // 마음가짐
  ],
  caution: [               // 2개 문장, 합계 90-130자 (실측 median 101)
    '...',                 // 빠지기 쉬운 함정
    '...',                 // 균형 회복 팁
  ],
},
```

### `reversedModifiers.js` 신규 엔트리 (카드당 약 100-150자)

```javascript
'ace-of-cups': {
  summary: '...',          // 25-50자, 역방향 핵심 (감정 막힘·역류) (실측 median 33)
  emotionHook: '...',      // 25-40자, 2줄 (\n 1개), 자성 질문형 (실측 median 31)
  emotionTags: [...],      // 4개, 그림자 키워드
  prefix: '...',           // 40-60자, emotionFlow 앞에 붙는 역방향 맥락 (실측 median 45)
},
```

### `relationshipModifiers.js` 신규 엔트리 (카드당 약 480-650자)

연애 상태 4가지(`single`, `situationship`, `dating`, `breakup`) × `lens` + `advice` 2필드 = **8개 항목**.

```javascript
'ace-of-cups': {
  single: {
    lens: '...',           // 50-100자, 솔로 상태에서 이 카드의 시그널 (emotionFlow 끝에 추가됨)
    advice: '...',         // 50-100자, 솔로 상태별 구체 행동 (advice 마지막 항목 대체)
  },
  situationship: {
    lens: '...',           // 50-100자, 썸 상태에서의 신호
    advice: '...',
  },
  dating: {
    lens: '...',           // 50-100자, 연애 중일 때의 신호
    advice: '...',
  },
  breakup: {
    lens: '...',           // 50-100자, 이별/재회 고민 중인 상태의 신호
    advice: '...',
  },
},
```

**작성 원칙**:
- 각 상태에서 카드의 의미가 어떻게 다르게 적용되는지 구체화. "솔로에게는 이 신호이지만, 연애 중에게는 다른 신호" 식으로.
- `lens`는 emotionFlow 끝에 자연스럽게 이어지는 톤 (관찰자/조언자 어조 유지)
- `advice`는 그 상태에서 오늘 할 수 있는 구체적인 행동 1개 + 짧은 마음가짐 1개 (한 문장에 합쳐도 OK)
- 메이저 22장 기존 엔트리(예: `magician`, `priestess`)를 참고해 톤·길이 일관성 유지

## 작업 순서

### 1) 대상 선정

**우선순위 슈트 순서 고정**: Cups → Wands → Pentacles → Swords

각 슈트 내 순서: ace → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → page → knight → queen → king

```bash
# 미완료 첫 3장 자동 선정 (세 파일 중 하나라도 없으면 작업 대상)
cd /home/tjd618/lovtaro && node --input-type=module -e "
import { TODAY_RESULTS } from './src/data/readings/today.js'
import { REVERSED_MODIFIERS } from './src/data/reversedModifiers.js'
import { RELATIONSHIP_MODIFIERS } from './src/data/relationshipModifiers.js'
import { MINOR_ARCANA } from './src/data/minorArcana.js'
const SUIT_ORDER = ['cups','wands','pentacles','swords']
const RANK_ORDER = ['ace','two','three','four','five','six','seven','eight','nine','ten','page','knight','queen','king']
const entries = Object.entries(MINOR_ARCANA).map(([id, card]) => ({ id, ...card }))
entries.sort((a,b) => {
  const sa = SUIT_ORDER.indexOf(a.suit), sb = SUIT_ORDER.indexOf(b.suit)
  if (sa !== sb) return sa - sb
  const ra = RANK_ORDER.indexOf(a.id.split('-of-')[0])
  const rb = RANK_ORDER.indexOf(b.id.split('-of-')[0])
  return ra - rb
})
const incomplete = entries.filter(c => !TODAY_RESULTS[c.id] || !REVERSED_MODIFIERS[c.id] || !RELATIONSHIP_MODIFIERS[c.id])
const targets = incomplete.slice(0, 3)
console.log('오늘 작업:', targets.map(c => {
  const missing = []
  if (!TODAY_RESULTS[c.id]) missing.push('today')
  if (!REVERSED_MODIFIERS[c.id]) missing.push('reversed')
  if (!RELATIONSHIP_MODIFIERS[c.id]) missing.push('relationship')
  return c.id+'['+missing.join(',')+']'
}).join(', '))
"
```

### 2) 카드 메타 확인

각 카드의 정방향/역방향 의미는 **이미 [minorArcana.js](/home/tjd618/lovtaro/src/data/minorArcana.js)에 정리되어 있음**. 거기 `upright.love`, `reversed.love`, `keywords`를 베이스로 오늘 해석을 작성한다.

```bash
# 특정 카드 메타 추출 (MINOR_ARCANA는 객체이므로 키로 접근)
cd /home/tjd618/lovtaro && node --input-type=module -e "
import { MINOR_ARCANA } from './src/data/minorArcana.js'
const c = MINOR_ARCANA['ace-of-cups']
console.log(JSON.stringify(c, null, 2))
"
```

### 3) 글 작성 가이드

> 분량은 기존 메이저 22장 실측 기준. 실제 사례를 보려면 `magician`, `priestess` 등 today.js의 메이저 카드를 직접 참고.

#### `summary` (40-65자)

- "오늘은 ~한 하루예요." 형식 권장
- 카드 본질을 일상 감각어로 풀어쓰기
- 점성술 용어·라틴어 금지

#### `emotionHook` (25-40자, 2줄)

- 첫 줄: 상황 묘사 (쉼표·말줄임표로 끝)
- 둘째 줄: 공감 질문 ("~지 않나요?", "~한 적 있죠?")
- `\n` 으로 줄 구분 (실제 키 안에 `\n` 1개 포함)
- 자극적 표현·불안 마케팅 금지

#### `emotionTags` (4개)

- 단어 또는 2어절 (예: "자신감", "한 발 부족")
- 카드 본연의 에너지 반영
- 부정 단어는 가급적 피하되 카드 성격상 필요하면 사용 (예: '한계', '소진')

#### `emotionFlow` (5문장, 합계 220-310자)

기존 메이저 22장 톤 그대로:
1. 오늘의 에너지 도입 ("오늘은 ~한 상태예요/기류예요")
2. 에너지 아래의 마음 ("이 ~ 아래에는 ~한 마음이 깔려 있어요")
3. 일어날 수 있는 장면 ("대화 중에", "혼자 있을 때")
4. 주의·균형점 ("다만 ~", "~할 때 주의")
5. 행동 방향 ("오늘은 ~보다 ~ 쪽이 좋아요")

각 문장 약 45-65자. 5문장 합계 220-310자 (median 261). 길어지면 호흡 흐름이 깨짐.

#### `advice` (2문장, 합계 100-150자)

- 1번: 구체 행동 ("~을 해보세요", "~을 시도해 보세요")
- 2번: 마음가짐 ("~ 이 가장 큰 무기예요", "~를 의식하세요")

#### `caution` (2문장, 합계 90-130자)

- 1번: 빠지기 쉬운 함정
- 2번: 균형 회복 단서

#### 역방향 (`reversedModifiers.js`)

- `summary`: 정방향의 그림자/막힘/역류 (25-50자)
- `emotionHook`: 자성 질문형 2줄 (25-40자)
- `emotionTags`: 그림자 키워드 4개
- `prefix`: "역방향의 ~ 카드는 ~한 결이에요/경고예요" (40-60자)

#### 연애 상태 (`relationshipModifiers.js`)

각 카드에 4상태 × 2필드 = 8개 항목 작성. 카드 의미와 4상태의 교차점을 짧고 구체적으로 표현.

- `single`: 솔로 - 이 카드가 새 인연 가능성·자기 점검에 어떻게 작용하는지
- `situationship`: 썸 - 모호한 관계의 다음 흐름·균형 점검
- `dating`: 연애 중 - 현재 관계의 호흡·온도·다음 단계
- `breakup`: 이별/재회 고민 - 회복 단계·미련 처리·다음 인연 준비

각 상태별:
- `lens`: 50-100자, 그 상태에서 보이는 신호. emotionFlow 끝에 자연스럽게 이어지는 한 문단 톤.
- `advice`: 50-100자, 오늘 할 수 있는 구체 행동 + 마음가짐. 결과 화면 advice 마지막 항목을 대체.

**참고**: 기존 메이저 22장 엔트리(예: `magician`, `priestess`, `empress`) 직접 읽어보고 톤·길이 맞추기.

### 4) 파일 수정

#### today.js 수정

```
Edit /home/tjd618/lovtaro/src/data/readings/today.js
```

`TODAY_RESULTS` 객체 끝(닫는 `}` 직전)에 신규 엔트리 추가. 기존 22장은 건드리지 않는다.

**키 표기**: 마이너는 하이픈 포함이라 따옴표 필수. `'ace-of-cups':` (메이저는 `magician:` 식으로 따옴표 없음. 둘 다 유효)

#### reversedModifiers.js 수정

```
Edit /home/tjd618/lovtaro/src/data/reversedModifiers.js
```

`REVERSED_MODIFIERS` **객체** 닫는 `}` 직전에 신규 엔트리 추가.

**주의**: 파일에는 `REVERSED_MODIFIERS` 객체 외에 `applyReversedModifier` 함수도 export됨. 객체 닫는 `}`을 정확히 잡아야 함수 안에 잘못 들어가지 않음. **마지막에 추가된 엔트리** 뒤, 객체 닫는 `}` 앞에 삽입한다 (이미 마이너 카드들이 추가되어 있을 수 있으므로 "메이저 마지막"이 아닐 수 있음).

위치 찾기 (객체 시작 + 종료 라인을 한번에 확인):
```bash
grep -nE "^export const REVERSED_MODIFIERS|^\}$" /home/tjd618/lovtaro/src/data/reversedModifiers.js | head -2
```

첫 줄이 객체 시작, 두 번째 줄이 객체 닫는 `}`. 그 사이의 마지막 엔트리 뒤에 새 엔트리를 삽입.

#### relationshipModifiers.js 수정

```
Edit /home/tjd618/lovtaro/src/data/relationshipModifiers.js
```

`RELATIONSHIP_MODIFIERS` **객체** 닫는 `}` 직전에 신규 엔트리 추가.

**주의**: 파일에는 `RELATIONSHIP_MODIFIERS` 객체 외에도 `OVERALL_RELATIONSHIP_LENS`, `applyRelationshipModifier`, `applyRelationshipModifierToOverall`, `RELATIONSHIP_LABELS` 등 여러 export가 있음. 같은 `^}$` 패턴이 4-5번 나타날 수 있으므로 꼭 첫 번째(`RELATIONSHIP_MODIFIERS`의 닫는 `}`)에만 삽입.

위치 찾기:
```bash
grep -nE "^export const RELATIONSHIP_MODIFIERS|^\}$" /home/tjd618/lovtaro/src/data/relationshipModifiers.js | head -2
```

첫 줄(`export const RELATIONSHIP_MODIFIERS = {`)과 그 다음에 처음 나오는 `^}$` 사이가 작업 범위. 그 닫는 `}` 직전에 새 엔트리를 삽입.

### 5) 빌드 검증

```bash
cd /home/tjd618/lovtaro && npm run build 2>&1 | tail -10
```

확인 사항:
- 빌드 성공 (문법 오류 0)
- 결과 데이터 모듈 import 정상

### 6) 분량 검증 (필수)

> 임계값은 메이저 22장 실측 min/max에 ±5자 버퍼 추가 (보더라인 케이스 자연스러운 통과 위해).

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import { TODAY_RESULTS } from './src/data/readings/today.js'
import { REVERSED_MODIFIERS } from './src/data/reversedModifiers.js'
import { RELATIONSHIP_MODIFIERS } from './src/data/relationshipModifiers.js'
const FIELD = {
  summary:[35,70], emotionHook:[20,45],
  emotionFlow:[210,320], advice:[95,160], caution:[85,135],
}
const STATUSES = ['single','situationship','dating','breakup']
for (const id of ['{id1}','{id2}','{id3}']) {
  const r = TODAY_RESULTS[id]
  if (!r) { console.log(id, '✗ today.js 누락'); continue }
  const issues = []
  for (const [k,[lo,hi]] of Object.entries(FIELD)) {
    const v = r[k]
    const n = Array.isArray(v) ? v.join('').length : (v?.length ?? 0)
    if (n < lo) issues.push(k+' 미달('+n+'/'+lo+')')
    else if (n > hi) issues.push(k+' 초과('+n+'/'+hi+')')
  }
  if ((r.emotionTags?.length ?? 0) !== 4) issues.push('emotionTags 4개 아님')
  if ((r.emotionFlow?.length ?? 0) !== 5) issues.push('emotionFlow 5개 아님')
  if ((r.advice?.length ?? 0) !== 2) issues.push('advice 2개 아님')
  if ((r.caution?.length ?? 0) !== 2) issues.push('caution 2개 아님')
  const m = REVERSED_MODIFIERS[id]
  if (!m) issues.push('reversedModifier 누락')
  else {
    const sl = m.summary?.length ?? 0
    if (sl < 20 || sl > 55) issues.push('rev.summary 분량('+sl+'/20-55)')
    const pl = m.prefix?.length ?? 0
    if (pl < 35 || pl > 62) issues.push('rev.prefix 분량('+pl+'/35-62)')
    const hl = m.emotionHook?.length ?? 0
    if (hl < 20 || hl > 45) issues.push('rev.emotionHook 분량('+hl+'/20-45)')
    if ((m.emotionTags?.length ?? 0) !== 4) issues.push('rev.emotionTags 4개 아님')
  }
  const rm = RELATIONSHIP_MODIFIERS[id]
  if (!rm) issues.push('relationshipModifier 누락')
  else {
    for (const s of STATUSES) {
      if (!rm[s]) { issues.push('rel.'+s+' 누락'); continue }
      if (!rm[s].lens || !rm[s].advice) { issues.push('rel.'+s+' lens/advice 누락'); continue }
      const ll = rm[s].lens.length, al = rm[s].advice.length
      if (ll < 40 || ll > 110) issues.push('rel.'+s+'.lens 분량('+ll+'/40-110)')
      if (al < 40 || al > 110) issues.push('rel.'+s+'.advice 분량('+al+'/40-110)')
    }
  }
  console.log(id+':', issues.length ? '✗ '+issues.join(', ') : '✓ OK')
}
"
```

전부 `✓ OK` 나올 때까지 보강 계속. 분량 1-2자 차이는 카드 성격상 어쩔 수 없을 수 있음 - 대폭 미달/초과만 잡고, ±5자 정도는 허용 가능.

### 7) 진행률 갱신

이 스킬 파일의 슈트별 섹션에 `- {id} ({YYYY-MM-DD})` 추가.

### 8) 결과 요약 출력

```
## 오늘의 카드 마이너 보강 결과 ({YYYY-MM-DD})

| 카드 id | 슈트 | today.js | reversed | relationship |
|---------|------|----------|----------|--------------|
| ace-of-cups | Cups | ✓ OK | ✓ OK | ✓ OK (4상태) |
| two-of-cups | Cups | ✓ OK | ✓ OK | ✓ OK (4상태) |
| three-of-cups | Cups | ✓ OK | ✓ OK | ✓ OK (4상태) |

**진행 현황: N / 56장 (X%)**
**남은 장수: (56-N)장 (하루 3장 기준 D일 소요)**
**FULL_DECK 자동 반영**: 다음 빌드/배포부터 새 카드들이 /today 덱에 포함됨
```

## 톤·문체 규칙 (전 프로젝트 공통)

- **em dash(—) 금지**: 하이픈(-) 사용 또는 삭제
- **AI 패턴 금지**: "안녕하세요", "정리합니다", "알아보겠습니다", "완벽 가이드", "한눈에"
- **단정 금지**: "반드시", "100%", "무조건" → "~일 수 있어요", "~한 경우가 많아요"
- **자가 부정 금지**: "타로는 미신이지만", "재미로 보세요"
- **자극적 표현 금지**: "이 사람과 끝납니다", "절대 돌아오지 않아요"
- **감정 톤**: 따뜻한 조언자, 조용한 관찰자
- **어미**: "~예요", "~이에요" 위주

## 절대 변경하지 않는 것

- 기존 메이저 22장의 today.js / reversedModifiers / relationshipModifiers 엔트리
- 마이너 카드 id, name, suit, keywords (`minorArcana.js`)
- `useDailyTarot.js` (`FULL_DECK` 동적 합성 로직)
- `TodayPage.vue` (이미 FULL_DECK/getAnyCardById 적용 완료)

## 56장 전수 완료 시 (스킬 종료 단계)

동적 덱 구조(2026-05-05 적용)로 인해 별도의 활성화 코드 변경은 필요 없다. 56장이 모두 채워지면 다음 빌드/배포 시점에 자동으로 78장 덱이 운영된다.

### 1) 전수 완료 사전 점검

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import { TODAY_RESULTS } from './src/data/readings/today.js'
import { REVERSED_MODIFIERS } from './src/data/reversedModifiers.js'
import { RELATIONSHIP_MODIFIERS } from './src/data/relationshipModifiers.js'
import { MINOR_ARCANA } from './src/data/minorArcana.js'
import { getCardImage } from './src/data/cardImages.js'
const minorIds = Object.keys(MINOR_ARCANA)
let ok = 0, fail = []
for (const id of minorIds) {
  const issues = []
  if (!TODAY_RESULTS[id]) issues.push('today')
  if (!REVERSED_MODIFIERS[id]) issues.push('reversed')
  if (!RELATIONSHIP_MODIFIERS[id]) issues.push('relationship')
  if (!getCardImage(id)) issues.push('image')
  if (issues.length) fail.push(id+'('+issues.join(',')+')')
  else ok++
}
console.log('완전:', ok, '/ 56')
if (fail.length) console.log('미완:', fail.join(', '))
"
```

`완전: 56 / 56` 나오면 종료 단계 진행.

### 2) 빌드·수동 테스트

```bash
cd /home/tjd618/lovtaro && npm run build 2>&1 | tail -10
```

`npm run preview` 후 `/today` 진입, 마이너 카드 1-2장 뽑힐 때까지 새로고침 → 결과 화면 + 연애 상태별 렌즈 정상 출력 확인.

### 3) 사용자 안내

```
오늘의 카드 마이너 56장 데이터 완료. /today 덱이 78장으로 전환됨.
이제 매일 같은 카드 나올 확률이 1/22 → 1/78로 낮아졌고,
4가지 연애 상태별 해석도 마이너 카드까지 모두 반영됩니다.
이 스킬(/lovtaro-today-expand)을 삭제합니다.
```

### 4) 스킬 파일 삭제

```bash
rm /home/tjd618/lovtaro/.claude/commands/lovtaro-today-expand.md
# 글로벌 심링크는 끊긴 링크가 되므로 함께 정리
rm /home/tjd618/.claude/commands/lovtaro-today-expand.md
```

## 금지

- `useDailyTarot.js` `FULL_DECK` 합성 로직 수정
- 하루 4장 이상 작업 (사용자 명시 없이)
- 기존 메이저 today.js / reversedModifiers / relationshipModifiers 엔트리 수정
- minorArcana.js의 카드 id/name/keywords 변경
- 카드 메타와 모순되는 의미 작성 (예: 5 of Cups를 "행복한 만남"으로)
- 세 파일 중 하나만 작성 (today.js + reversedModifiers + relationshipModifiers는 한 묶음)

## 완료 후 로그 기록

스킬 실행이 완료되면 반드시 아래 명령으로 `skill-log.json`에 기록한다:

```bash
python3 -c "import json,datetime; logs=json.load(open('/home/tjd618/skill-log.json')); now=datetime.datetime.now(); logs.insert(0,{'date':now.strftime('%Y-%m-%d'),'time':now.strftime('%H:%M'),'project':'lovtaro','skill':'lovtaro-today-expand'}); open('/home/tjd618/skill-log.json','w').write(json.dumps(logs,ensure_ascii=False,indent=2))"
```

$ARGUMENTS
