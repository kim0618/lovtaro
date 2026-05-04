---
description: lovtaro.kr 오늘의 카드 마이너 아르카나 56장 데이터 추가 (하루 3장, 56장 완료 시 덱 활성화 + 자동 삭제)
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 러브타로 오늘의 카드 마이너 확장 스킬

`/today` (오늘의 연애 카드)는 현재 메이저 아르카나 22장만 사용 중. 사용자가 매일 뽑다 보니 한 달 안에 중복이 많이 발생함. 마이너 아르카나 56장을 덱에 추가해 변동성 확보가 목표.

마이너 56장의 `today.js` + `reversedModifiers.js` 데이터를 **하루 3장씩** 채워 넣고, 56장 전수 완료되는 시점에 `useDailyTarot.js`의 덱을 메이저+마이너 합본으로 전환한다.

## 실행 일정

- **시작일**: 2026-05-04 (월)
- **진행 속도**: 사용자 명시 없으면 **하루 3장만**
- **완료 목표**: 약 19일 (56장 ÷ 3장/일 = 18.7일)
- **총 대상**: 마이너 56장 (Cups 14 + Wands 14 + Pentacles 14 + Swords 14)
- 56장 전수 완료 시 덱 활성화 + 이 스킬 파일 **자동 삭제**

## 편수 원칙 (최우선)

- **사용자가 명시하지 않으면 반드시 3장만 작업한다.**
- "5장", "1장" 등 명시한 경우에만 그 수를 따른다.
- 완료 직전 마지막 잔여 1-2장이면 그날 잔여만 처리하고 활성화 단계로 진입.

## 활성화 시점 안내 (중요)

**56장 미완료 상태에서는 절대 `useDailyTarot.js`를 수정하지 않는다.** 미완료 상태에서 덱에 마이너를 추가하면 데이터 없는 카드 뽑힐 시 결과 화면이 빈 상태로 나옴 (`TODAY_RESULTS[id]` undefined → result null).

데이터 채우는 동안 사이트는 **현행 메이저 22장 운영 그대로 유지**. 56장이 완전히 채워진 그날에만 한 번에 덱을 전환한다.

## 프로젝트 경로

- 오늘의 카드 결과 데이터: [src/data/readings/today.js](/home/tjd618/lovtaro/src/data/readings/today.js) (현재 22장, `TODAY_RESULTS` 객체)
- 역방향 수정자: [src/data/reversedModifiers.js](/home/tjd618/lovtaro/src/data/reversedModifiers.js) (현재 22장 메이저만, `REVERSED_MODIFIERS` 객체)
- 마이너 카드 데이터: [src/data/minorArcana.js](/home/tjd618/lovtaro/src/data/minorArcana.js) (56장 카드 메타, **객체** 형태 - 키가 id)
- 덱 구성 composable: [src/composables/useDailyTarot.js](/home/tjd618/lovtaro/src/composables/useDailyTarot.js) (`shuffleCards(TAROT_CARDS)`)
- 덱 카드 배열: [src/data/tarotCards.js](/home/tjd618/lovtaro/src/data/tarotCards.js) (`TAROT_CARDS = MAJOR_ARCANA_CARDS`, 배열 형태 - 각 카드에 `id` 필드 있음)

### 자료 구조 주의

- `TAROT_CARDS`: **배열**, `[{ id, name, nameEn, keywords, energy }, ...]`
- `MINOR_ARCANA`: **객체**, `{ 'ace-of-cups': { number, name, nameEn, suit, energy, keywords, element, upright, reversed }, ... }` - 카드 객체 안에 `id` 필드 없음, 객체 키가 id 역할
- `shuffleCards(cards)`는 배열을 받고 각 항목의 `card.id`를 사용. 마이너를 덱에 합칠 때 반드시 id 필드 주입 필요

## 진행률 (매 작업마다 갱신)

### Cups (14장) - 우선순위 1 (감정·연애 직결)

<!-- 완료 카드 아래에 `- {id} ({YYYY-MM-DD})` 추가 -->
- ace-of-cups (2026-05-04)
- two-of-cups (2026-05-04)
- three-of-cups (2026-05-04)

### Wands (14장) - 우선순위 2 (열정·관계 동력)

### Pentacles (14장) - 우선순위 3 (안정·현실)

### Swords (14장) - 우선순위 4 (생각·갈등)

### 미완료 카운트

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import { TODAY_RESULTS } from './src/data/readings/today.js'
import { MINOR_ARCANA } from './src/data/minorArcana.js'
const minorIds = Object.keys(MINOR_ARCANA)
const filled = minorIds.filter(id => TODAY_RESULTS[id])
const missing = minorIds.filter(id => !TODAY_RESULTS[id])
console.log('완료:', filled.length, '/ 56')
console.log('남음:', missing.length)
console.log('미완료 첫 5장:', missing.slice(0,5).join(', '))
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

## 작업 순서

### 1) 대상 선정

**우선순위 슈트 순서 고정**: Cups → Wands → Pentacles → Swords

각 슈트 내 순서: ace → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → page → knight → queen → king

```bash
# 미완료 첫 3장 자동 선정
cd /home/tjd618/lovtaro && node --input-type=module -e "
import { TODAY_RESULTS } from './src/data/readings/today.js'
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
const targets = entries.filter(c => !TODAY_RESULTS[c.id]).slice(0, 3)
console.log('오늘 작업:', targets.map(c => c.id).join(', '))
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

**주의**: 파일 끝이 아님. 객체 닫는 `}`은 약 line 141에 있고 그 뒤에는 `applyReversedModifier` 함수가 있음. 파일 끝(line 163)에 추가하면 함수 안쪽에 들어가서 문법 오류 발생. 마지막 메이저 카드(`judgement`) 엔트리 뒤, 객체 닫는 `}` 앞에 삽입한다.

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
const FIELD = {
  summary:[35,70], emotionHook:[20,45],
  emotionFlow:[210,320], advice:[95,160], caution:[85,135],
}
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

| 카드 id | 슈트 | today.js | reversed |
|---------|------|----------|----------|
| ace-of-cups | Cups | 820자 | 230자 |
| two-of-cups | Cups | 790자 | 220자 |
| three-of-cups | Cups | 850자 | 240자 |

**진행 현황: N / 56장 (X%)**
**남은 장수: (56-N)장 (하루 3장 기준 D일 소요)**
**활성화 예정일: 56장 완료일**
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

- 기존 메이저 22장의 today.js 엔트리
- 기존 reversedModifiers 22장(메이저) 엔트리
- 마이너 카드 id, name, suit, keywords (`minorArcana.js`)
- `useDailyTarot.js` (56장 전수 완료 전까지 절대 수정 금지)

## 56장 전수 완료 시 (활성화 단계)

이 단계는 56장 전부 채워진 그날 한 번만 실행한다.

### 1) `useDailyTarot.js` 덱 전환

**중요**: `MINOR_ARCANA`는 객체이고 카드 객체에 `id` 필드가 없음 (키가 id 역할). `shuffleCards`는 배열을 받고 `card.id`를 사용하므로 변환 필수.

권장 방식: 별도 파일 `src/data/fullDeck.js`를 만들어 변환 로직 격리. (useDailyTarot.js 안에 두면 매 마운트마다 객체→배열 변환이 일어남)

```js
// 신규 파일: src/data/fullDeck.js
import { MAJOR_ARCANA_CARDS } from './tarotCards.js'
import { MINOR_ARCANA } from './minorArcana.js'

const MINOR_DECK = Object.entries(MINOR_ARCANA).map(([id, card]) => ({
  id,
  name: card.name,
  nameEn: card.nameEn,
  keywords: card.keywords,
  energy: card.energy,
}))

export const FULL_DECK = [...MAJOR_ARCANA_CARDS, ...MINOR_DECK]

export function getAnyCardById(id) {
  return FULL_DECK.find(c => c.id === id) ?? null
}
```

`useDailyTarot.js` 수정:

```js
// 변경 전
import { TAROT_CARDS, shuffleCards } from '../data/tarotCards.js'
const deck = ref(shuffleCards(TAROT_CARDS))

// 변경 후
import { shuffleCards } from '../data/tarotCards.js'
import { FULL_DECK } from '../data/fullDeck.js'
const deck = ref(shuffleCards(FULL_DECK))
```

`reset()`, `resetToday()` 함수 안의 `shuffleCards(TAROT_CARDS)` 호출도 `shuffleCards(FULL_DECK)`로 변경.

`TodayPage.vue` 수정 (검증 완료된 패치):

```js
// 변경 전 (line 37)
import { getCardById, TAROT_CARDS, shuffleCards } from '../data/tarotCards.js'

// 변경 후
import { shuffleCards } from '../data/tarotCards.js'
import { FULL_DECK, getAnyCardById } from '../data/fullDeck.js'
```

```js
// 변경 전 (line 81): shared view에서 마이너 카드 조회 안 됨
const _base = getCardById(_shared.cardId)

// 변경 후
const _base = getAnyCardById(_shared.cardId)
```

```js
// 변경 전 (line 98): startMyReading 안 덱 재구성
deck.value = shuffleCards(TAROT_CARDS)

// 변경 후
deck.value = shuffleCards(FULL_DECK)
```

확인:
```bash
grep -n "TAROT_CARDS\|getCardById" /home/tjd618/lovtaro/src/pages/TodayPage.vue
# 출력 0줄이어야 함 (모두 FULL_DECK / getAnyCardById로 교체됨)
```

### 1-1) 활성화 직전 사전 점검

```bash
cd /home/tjd618/lovtaro && node --input-type=module -e "
import { TODAY_RESULTS } from './src/data/readings/today.js'
import { REVERSED_MODIFIERS } from './src/data/reversedModifiers.js'
import { MINOR_ARCANA } from './src/data/minorArcana.js'
import { getCardImage } from './src/data/cardImages.js'
const minorIds = Object.keys(MINOR_ARCANA)
let ok = 0, fail = []
for (const id of minorIds) {
  const issues = []
  if (!TODAY_RESULTS[id]) issues.push('today')
  if (!REVERSED_MODIFIERS[id]) issues.push('reversed')
  if (!getCardImage(id)) issues.push('image')
  if (issues.length) fail.push(id+'('+issues.join(',')+')')
  else ok++
}
console.log('완전:', ok, '/ 56')
if (fail.length) console.log('미완:', fail.join(', '))
"
```

`완전: 56 / 56` 나오면 활성화 진행.

### 2) 빌드·점검

```bash
cd /home/tjd618/lovtaro && npm run build 2>&1 | tail -15
```

수동 테스트 (`npm run preview` 후 `/today` 진입, 마이너 카드 1장 뽑힐 때까지 새로고침 → 결과 화면 정상 출력 확인).

### 3) 사용자 안내

```
오늘의 카드 마이너 56장 데이터 완료. /today 덱이 78장으로 전환됨.
이제 매일 같은 카드 나올 확률이 1/22 → 1/78로 낮아졌어요.
이 스킬(/lovtaro-today-expand)을 삭제합니다.
```

### 4) 스킬 파일 삭제

```bash
rm /home/tjd618/lovtaro/.claude/commands/lovtaro-today-expand.md
# 글로벌 심링크는 끊긴 링크가 되므로 함께 정리
rm /home/tjd618/.claude/commands/lovtaro-today-expand.md
```

## 금지

- 56장 미완료 상태에서 `useDailyTarot.js` 수정
- 하루 4장 이상 작업 (사용자 명시 없이)
- 기존 메이저 today.js / reversedModifiers 엔트리 수정
- minorArcana.js의 카드 id/name/keywords 변경
- 카드 메타와 모순되는 의미 작성 (예: 5/5 of Cups를 "행복한 만남"으로)

## 완료 후 로그 기록

스킬 실행이 완료되면 반드시 아래 명령으로 `skill-log.json`에 기록한다:

```bash
python3 -c "import json,datetime; logs=json.load(open('/home/tjd618/skill-log.json')); now=datetime.datetime.now(); logs.insert(0,{'date':now.strftime('%Y-%m-%d'),'time':now.strftime('%H:%M'),'project':'lovtaro','skill':'lovtaro-today-expand'}); open('/home/tjd618/skill-log.json','w').write(json.dumps(logs,ensure_ascii=False,indent=2))"
```

$ARGUMENTS
