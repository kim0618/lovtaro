# Analytics Rules (GA4)

## 설정

- GA4 측정 ID: `G-9B8C0RHKXX` (index.html 및 [utils/gtag.js](../../src/utils/gtag.js))
- 수동 페이지뷰: `initGA()`에서 `send_page_view: false`로 꺼두고, 라우터에서 `trackPageView`를 명시 호출
- 모든 이벤트는 `trackEvent(name, params)` 래퍼를 통과 - `window.gtag` 직접 호출 금지

## 🚨 파라미터는 맞춤측정기준에 등록해야 조회된다 (2026-08-11 적발)

**`trackEvent`로 보낸 파라미터는 GA4 맞춤 정의에 등록하지 않으면 수집만 되고 조회가 원천 차단된다.** Data API는 `customEvent:cta_id`를 아예 `not a valid dimension`으로 거부하고, UI 보고서에도 나타나지 않는다. 오류가 나지 않고 조용히 사라지므로 코드만 보면 멀쩡해 보인다.

2026-08-11 전수 탐침 결과 **이 표의 파라미터 15개 전부 미등록**이었다. 오픈(4/6) 이후 4개월치 `cta_id`·`reading_type`·`card_id`가 저장은 됐지만 한 번도 읽을 수 없는 상태였고, 그 탓에 프리미엄→크몽 이탈이 몇 명인지 판별 불가였다(`cta_click` 총량 53건만 보이고 그중 크몽행이 몇인지 모름).

- **등록은 소급 적용되지 않는다.** 등록 이전 데이터는 영구히 못 쪼갠다. 새 파라미터를 설계했으면 그 주에 등록할 것
- 등록 위치: GA4 **관리 → 데이터 표시 → 맞춤 정의 → 맞춤 측정기준 만들기**, 범위 `이벤트`, 이벤트 매개변수에 파라미터 키를 그대로 입력
- 이벤트 범위 맞춤측정기준은 **최대 50개**이고 삭제가 아니라 보관만 된다. 카디널리티가 큰 자유값은 등록하지 말 것(이 표의 규칙과 동일)
- 등록 여부 확인 + 퍼널 조회: `node ~/.claude/analytics/lovtaro-premium-funnel.mjs [일수]` - 미등록이면 경고를 찍고 나머지 단계만 출력한다

**행동을 이벤트 이름으로 쪼개서 우회하지 말 것.** `premium_kmong`을 `kmong_click`이라는 별도 이벤트로 빼면 등록 없이 보이지만, 아래 네이밍 규칙(이름=행동, 파라미터=맥락)을 깨고 `cta_click` 카운팅이 분리된다. 해법은 등록이지 이름 쪼개기가 아니다.

## 🔗 외부 링크는 반드시 진짜 `<a href>` (등록 없이 읽히는 유일한 경로)

`linkUrl`·`linkDomain`은 **기본 제공 측정기준**이라 맞춤측정기준 등록 없이 즉시 조회된다. GA4 향상된 측정이 아웃바운드 클릭에 자동으로 `click` 이벤트를 붙여주기 때문인데, **실제 앵커 태그에만 붙는다.** `<button>` + `window.open()`으로 열면 GA4는 그 이동을 영영 못 본다.

2026-08-11 이 차이로 매출 퍼널 마지막 칸이 비어 있었다. 같은 속성에서 카카오·유튜브는 잡히는데(`<a href>`) 크몽만 0이었다(`window.open`):

```
linkDomain      eventName  eventCount
open.kakao.com  click      2      ← ContactPage의 <a href>
youtube.com     click      1
(크몽 없음)                        ← PremiumPage의 window.open
```

- **외부 도메인으로 나가는 CTA는 `<a :href target="_blank">`로 만든다.** 클릭 핸들러는 `trackEvent`만 쏘고 이동은 앵커에 맡긴다(`window.open` 호출 금지)
- `rel`은 **`noopener`만** 쓴다. 크몽처럼 상대 쪽 유입 통계로 교차검증할 채널에 `noreferrer`를 붙이면 리퍼러가 지워져 저쪽 대시보드에서 우리가 안 보인다. `noreferrer`는 리퍼러를 숨겨야 할 때만
- **`<button>`을 `<a>`로 바꾸면 CSS 3줄이 따라와야 한다**: `display`(a는 inline이라 padding이 줄 높이에 안 잡힘), `text-align: center`(button은 기본 중앙), `line-height: normal`(a는 본문 줄간격을 상속해 1.5px 커짐). 실측으로 확인할 것 - 배포본과 로컬을 같은 뷰포트로 렌더해 `getBoundingClientRect` + `getComputedStyle`을 1:1 대조하면 눈대중 없이 잡힌다
- 같은 함정의 반대 사례가 [seo.md](seo.md)에 있다(2026-08-04, `href="#"` + `@click.prevent`로 크롤러가 URL을 못 봄). **링크는 링크로 만든다**가 두 규칙의 공통 결론이다

## 기본 사용

```js
import { trackEvent } from '@/utils/gtag.js'
// 또는 상대 경로: '../../utils/gtag.js'

trackEvent('reading_complete', {
  reading_type: 'love',
  card_id: 'fool',
  reversed: false,
})
```

## 이벤트 네이밍 규칙

- `snake_case`, `동사_대상` 형태
- 이름 = 행동, 파라미터 = 맥락 (행동을 이름에 인코딩해서 쪼개지 말 것)
  - 좋음: `share` + `{ method: 'kakao' }`
  - 나쁨: `share_kakao`, `share_link_copy` (카운팅 분리됨)
- 페이지명은 파라미터 `page` 또는 기본 `page_path`로 — 이벤트 이름에 박지 말 것

## 활성 이벤트 (변경 금지, 파라미터만 확장)

### 리딩 퍼널 (useReadingTracking.js)

| 이벤트 | 파라미터 | 발생 시점 |
|---|---|---|
| `reading_start` | `reading_type` | `startReading()` 호출 (intro → status/draw) |
| `card_drawn` | `reading_type`, `spread_type`, `card_id`, `reversed`, `position` | `confirm()` 진입 시, 카드 1장당 이벤트 1회 |
| `reading_reveal` | `reading_type`, `spread_type`, `card_count` | reveal 타이머 완료 후 result phase 진입 |
| `reading_complete` | `reading_type`, `spread_type`, `card_count` | `saveReadingHistory()` 호출 (localStorage 저장 완료) |
| `reading_reset` | `reading_type` | `retry()` / `resetToday()` 호출 |
| `today_draw` | `card_id`, `reversed` | /today 오늘자 1회 뽑기 |

- `reading_complete`는 `saveReadingHistory`에서 자동 발생 — 명시 호출 불필요
- 나머지는 [useReadingTracking.js](../../src/composables/useReadingTracking.js)의 헬퍼 사용

### 공유/저장/기타

| 이벤트 | 파라미터 | 발생 위치 |
|---|---|---|
| `share` | `reading_type`, `method` (kakao) | [ShareSaveSection.vue](../../src/components/result/ShareSaveSection.vue) |
| `copy_link` | `reading_type` | ShareSaveSection |
| `image_save` | `reading_type`, `format?` | ShareSaveSection |
| `mini_share` | `reading_type`, `method` | [MiniShareBar.vue](../../src/components/result/MiniShareBar.vue) |
| `mini_copy_link` | `reading_type` | MiniShareBar |
| `streak_badge_save` | `streak` | [StreakBadge.vue](../../src/components/result/StreakBadge.vue) |
| `link_page_click` | `label`, `to` | [LinkPage.vue](../../src/pages/LinkPage.vue). `label`에 `kakao_openchat` 추가(2026-07-30) |
| `cta_click` | `cta_id`, `destination`, `reading_type?`, `location?`, `service?` | 주요 CTA. `cta_id`: `premium_result`(무료리딩→프리미엄), `test_to_reading`(테스트 결과→무료리딩), `premium_kmong`(프리미엄→크몽 주문, `location`=`hero`/`packages`/`final`, `service`=`love`/`reunion`), `premium_see_packages`(리딩 종류 보기→패키지 섹션 스크롤, 서비스 2개 이상일 때만 노출), `premium_copy_template`(사연양식 복사), `contact_kakao`(문의 페이지→카카오 오픈채팅) |

- `premium_kakao`는 2026-07-29 결제 채널을 크몽으로 옮기며 발생 중단. 과거 데이터 조회 시에만 사용
- `premium_kmong`은 **2026-08-11부터 앵커 클릭**이다. `trackKmongClick()`이 `cta_click`만 쏘고 이동은 `<a href>`가 하므로, GA4 자동 `click` 이벤트(`linkUrl = kmong.com/gig/796050|796377`)가 함께 발생한다. **크몽 이탈 수는 이 자동 click으로 센다**(등록 불필요). `cta_id`가 등록되면 `location`별 분해까지 가능해진다

### 심리테스트 (TestPage.vue)

| 이벤트 | 파라미터 | 발생 시점 |
|---|---|---|
| `test_start` | `reading_type` (= 테스트 shareLabel) | 테스트 시작(intro → quiz) |
| `test_complete` | `reading_type`, `result_type` (결과 라벨) | 마지막 답변 후 결과 도출 |

- 테스트 결과 화면의 공유/저장은 기존 `share`/`copy_link`/`image_save`를 그대로 사용(`reading_type` = 테스트 shareLabel, 예: `이상형 타로`)
- `reading_type` 값에 테스트 shareLabel 추가됨: `연애 스타일`, `MBTI 연애`, `이상형 타로`, `전생 연애`, `짝사랑`

## 권장 확장 이벤트 (아직 미구현)

| 이벤트 | 파라미터 | 발생 시점 |
|---|---|---|
| `scroll_depth` | `page`, `depth` (25/50/75/100) | 결과 페이지 스크롤 |

이벤트 추가 시:
- 이 표를 업데이트 (문서와 코드가 같이 업데이트돼야 함)
- 동일 맥락은 같은 파라미터 키 재사용 (예: `reading_type`은 어디서나 동일)

## 파라미터 컨벤션

| 키 | 값 | 예시 |
|---|---|---|
| `reading_type` | 한국어 리딩 명칭 (기존 GA 데이터 연속성 유지) | `상대방 속마음`, `러브타로`, `재회 가능성`, `연락 올까`, `Yes/No 타로`, `궁합 타로`, `3장 리딩`, `오늘의 연애 카드` |
| `spread_type` | 카드 배열 형태 | `single`, `three`, `pair` |
| `method` | 공유/인터랙션 채널 | `kakao`, `link`, `native`, `download` |
| `format` | 이미지 포맷 | `instagram_story`, `instagram_feed` |
| `card_id` | 카드 id (tarotCards.js의 id) | `fool`, `ace-of-cups` |
| `reversed` | boolean | `true` / `false` |
| `position` | 스프레드 내 위치 | `past`, `present`, `future`, `self`, `other`, `today`, `mind`, `reunion`, `contact`, `yesno` |

- 자유 텍스트(사용자 질문) 금지 - 카디널리티 폭발, 개인정보 유출 위험
- `reading_type`은 라우트 경로의 마지막 세그먼트와 일치시킬 것 (교차 분석 편해짐)

### 맞춤측정기준 등록 우선순위

전부 등록할 필요는 없다. 답이 매출로 이어지는 순서다(2026-08-11 기준 전부 미등록).

| 순위 | 파라미터 | 값 개수 | 이걸 등록해야 답할 수 있는 질문 |
|---|---|---|---|
| 1 | `cta_id` | 6 | /premium에서 크몽으로 실제로 몇 명이 나갔나 |
| 2 | `location` | 3 | 크몽 버튼 3곳(hero·packages·final) 중 어디가 눌리나 |
| 3 | `service` | 2 | 연애와 재회 중 어느 상품이 팔리나 |
| 4 | `reading_type` | 13 | 8개 무료리딩 중 어느 것이 프리미엄 클릭을 만드나 |
| 5 | `destination` | ~10 | cta_id와 대체로 중복 - 여유 있으면 |
| - | `card_id` | 78 | 카드→전환 상관. 카디널리티가 커 `(other)` 뭉침 주의 |

`label`·`result_type`·`method`·`spread_type`·`position`·`format`·`reversed`·`streak`·`to`는 지금 의사결정에 안 쓰인다. 필요해질 때 등록할 것.

## UTM 규칙

- 공유 링크에 UTM 자동 부착 ([ShareSaveSection](../../src/components/result/ShareSaveSection.vue)의 `withUtm` 참고)
- 컨벤션:
  - `utm_source`: `kakao` / `link` / `instagram` / `youtube` / `twitter`
  - `utm_medium`: `share` / `copy` / `bio` / `post`
  - `utm_campaign`: `reading_type` 또는 콘텐츠 ID
- 외부에서 유입된 UTM은 GA가 자동 처리 — 수동 이벤트로 덮어쓰지 말 것

## 드롭오프/퍼널 측정

- 리딩 퍼널: `reading_start → card_drawn → reading_reveal → reading_complete`
- GA4 탐색 보고서에서 퍼널 분석 가능하도록 위 4개 이벤트를 모든 리딩 페이지에서 동일한 이름으로 발생시킬 것

## 개발 모드

- 로컬 개발 시 `window.gtag`가 로딩되지만 측정 속성은 동일 — **실측정에 개발 이벤트가 섞임**
- 필요하면 `trackEvent`에 `if (import.meta.env.DEV) return` 가드 추가 가능 (현재는 미적용)

## 금지 사항

- `window.gtag` 직접 호출 금지 (로컬/prod 분기, 폴백 무력화됨)
- PII (이름, 이메일, 질문 텍스트, 생년월일) 이벤트 파라미터 전달 금지
- 이벤트 이름에 동적 값 넣기 금지 (`share_kakao_${userId}` 같은 것)
- 기존 이벤트 이름 변경 금지 — 과거 데이터와 연속성 끊김. 새 이름을 추가하고 병기.
