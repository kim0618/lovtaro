# Analytics Rules (GA4)

## 설정

- GA4 측정 ID: `G-9B8C0RHKXX` (index.html 및 [utils/gtag.js](../../src/utils/gtag.js))
- 수동 페이지뷰: `initGA()`에서 `send_page_view: false`로 꺼두고, 라우터에서 `trackPageView`를 명시 호출
- 모든 이벤트는 `trackEvent(name, params)` 래퍼를 통과 — `window.gtag` 직접 호출 금지

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
| `link_page_click` | `label`, `to` | [LinkPage.vue](../../src/pages/LinkPage.vue) |

## 권장 확장 이벤트 (아직 미구현)

| 이벤트 | 파라미터 | 발생 시점 |
|---|---|---|
| `scroll_depth` | `page`, `depth` (25/50/75/100) | 결과 페이지 스크롤 |
| `cta_click` | `cta_id`, `destination` | 주요 CTA (홈 메뉴 진입 등) |

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

- 자유 텍스트(사용자 질문) 금지 — 카디널리티 폭발, 개인정보 유출 위험
- `reading_type`은 라우트 경로의 마지막 세그먼트와 일치시킬 것 (교차 분석 편해짐)

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
