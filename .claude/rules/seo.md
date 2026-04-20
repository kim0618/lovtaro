# SEO Rules

## 핵심 구조

- **메타 태그**: `scripts/prerender.mjs`가 빌드 후 라우트별 index.html에 **정적 주입** (title, description, og:*, twitter:*, canonical, hreflang)
- **JSON-LD**: `src/composables/useHead.js`가 **클라이언트 사이드**로 `<script type="application/ld+json" id="lovtaro-jsonld">` 주입
- **도메인 상수**: `SITE_URL` (useHead.js에 정의), prerender.mjs도 동일 값 — 변경 시 두 곳 동시 수정

## 모든 페이지 필수 - useHead

```js
import { useHead } from '../composables/useHead.js'

useHead({
  title: '...',           // 고정 문자열 또는 () => string
  description: '...',     // 고정 또는 함수
  jsonLd: {...},          // schema.org 객체 또는 () => 객체
  ogImage: '...',         // 절대 URL (https://lovtaro.kr/...) 또는 함수
})
```

- 동적 페이지(카드 상세 등)는 값들을 `() =>` 함수로 넘겨야 `route.params` 변경에 반응 ([CardDetailPage.vue 참고](../../src/pages/CardDetailPage.vue))
- `useHead` 없이 페이지를 만들면 기본 메타만 노출되고 JSON-LD 없음

## JSON-LD 타입 매핑 (prerender에서 정적 주입됨)

모든 페이지는 `@graph` 배열로 여러 스키마를 한 script에 묶어 주입.
빌더: [prerender.mjs](../../scripts/prerender.mjs)의 `buildGraph(route, ...)`

| 페이지 유형 | @graph 포함 스키마 |
|---|---|
| 홈 `/` | `Organization` + `WebSite` + `WebApplication` + `BreadcrumbList` |
| 카드 목록 `/cards` | `ItemList`(78장) + `BreadcrumbList` |
| 카드 상세 `/cards/:id` | `Article` + `FAQPage`(정/역방향 × core/love = 4 Q&A) + `BreadcrumbList` |
| 리딩 페이지 `/reading/*`, `/today` | `WebPage` + `BreadcrumbList` |
| 기타 페이지 | `BreadcrumbList`만 |

- `Organization`과 `WebSite`는 홈에만 주입하고, 다른 페이지는 `@id` 참조(`#organization`, `#website`)만 사용 — Google에서 자동 연결
- 카드 상세 FAQ는 `src/data/cardDictionary.js` + `src/data/minorArcana.js`의 `upright.core/love`, `reversed.core/love`를 사용. 카드 데이터 수정 시 FAQ도 자동 반영됨

## 클라이언트 JSON-LD 싱크 주의 (후속 작업 대상)

`useHead({ jsonLd: ... })`가 클라이언트 렌더 시 `id="lovtaro-jsonld"` script를 교체함. 현재 Vue 컴포넌트의 jsonLd는 prerender가 주입한 `@graph` 버전보다 **덜 풍부한 단일 객체**([HomePage](../../src/pages/HomePage.vue), [CardsPage](../../src/pages/CardsPage.vue), [CardDetailPage](../../src/pages/CardDetailPage.vue)).

- 첫 페이지 로딩 시: 크롤러가 풍부한 정적 HTML을 봄 (SEO 혜택 ✅)
- SPA 네비게이션 후: Vue가 덮어써 덜 풍부해짐 (단일 스키마만 유지, 여전히 유효)

**개선 방향** (후속): `scripts/seo/jsonld.mjs` 같은 공용 빌더로 뽑아 prerender와 Vue에서 동일 로직 사용. 지금 작업 범위에선 보류.

- 리딩 페이지들(`/reading/*`, `/today`)은 Vue에서 jsonLd 호출이 없음 — SPA 네비 후 JSON-LD script가 이전 페이지 것으로 남음. 후속 작업 시 `useHead` 호출부에 jsonLd 추가 필요

## 라우트 추가 체크리스트 (SEO 관점)

1. `scripts/prerender.mjs`의 `ROUTES`에 `{ path, title, description, ogImage? }` 등록
2. 페이지 컴포넌트에 `useHead` 호출
3. 카드 상세처럼 동적이면 `CARDS`/`MINOR_CARDS` 배열 루프에서 자동 생성되는지 확인
4. 빌드 후 `dist/{path}/index.html`의 `<title>`과 `<meta>` 직접 열어서 확인

## OG 이미지 규칙

- 기본값: `https://lovtaro.kr/og-image.png` (prerender 폴백)
- 카드 상세: `https://lovtaro.kr/images/cards-png/{slug}.png`
- Major 카드 슬러그 불일치 케이스는 `OG_SLUG_MAP` ([prerender.mjs](../../scripts/prerender.mjs))
  - `priestess → high-priestess`, `wheel → wheel-of-fortune`, `hanged → hanged-man`
- OG 이미지 경로 바꿀 때 `scripts/generate-og-image.mjs` (prebuild)와 충돌 없는지 확인

## sitemap / robots

- `public/sitemap.xml` 수동 관리 — 라우트 추가 시 수동 업데이트 필수 (자동 생성 아님)
- `public/robots.txt` 수정 시 `/print/` 같은 내부 경로 제외 규칙 유지
- 네이버 인증: `index.html`의 `naver-site-verification` 메타 유지

## URL 규칙

- **trailingSlash 있음** (Cloudflare Pages 디렉토리 기반 정규화와 일치): `/cards/fool/` (O), `/cards/fool` (X)
  - canonical, sitemap.xml, JSON-LD `url`, `<router-link>` 내부 링크 모두 슬래시로 끝나야 함
  - `useHead.js`의 `canonicalUrl(path)` 헬퍼 사용 (prerender.mjs에도 동일 함수 존재)
  - 슬래시 없는 요청은 Cloudflare가 308로 슬래시 버전에 리다이렉트 — canonical/sitemap이 불일치하면 Google이 "redirect error"로 분류
- 쿼리스트링 기반 상태 사용 금지 — 크롤링 중복 방지
- hreflang: 한국어 단일 (`ko_KR`), 영문 추가 계획 없음

## 구조화 데이터 검증

작업 후 점검:
- https://search.google.com/test/rich-results
- https://validator.schema.org
- 빌드 산출물 직접 grep: `rg "application/ld\+json" dist/`

## 금지 사항

- `document.title = ...` 직접 호출 금지 — `useHead`를 통해서만 변경
- 페이지 내부 하드코딩된 `https://lovtaro.kr` 금지 — `SITE_URL` import
- JSON-LD 안에 사용자 입력(예: 질문 텍스트) 삽입 시 이스케이프 필수 (스크립트 인젝션 방지)
