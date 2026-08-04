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

## #app 본문 정적 주입 (크롤러가 JS 없이 본문·내부링크를 읽도록)

`prerender.mjs`가 빌드 시 빈 `<div id="app"></div>`를 실제 본문 HTML로 채운다. JS 활성 환경에서는 Vue가 마운트하며 즉시 교체하므로 사용자 화면에는 영향이 없다. 네이버처럼 JS 렌더가 약한 크롤러와 AI 크롤러(GPTBot 등) 대응이 목적.

| 대상 | 빌더 함수 |
|---|---|
| 가이드 상세 `/guide/:slug` | `buildGuideBodyHtml` |
| 가이드 허브 `/guide` (전 91편 링크) | `buildGuideHubBodyHtml` |
| 꿈해몽 상세 `/dream/:slug` | `buildDreamBodyHtml` |
| 꿈해몽 허브 `/dream` (전 64편 링크) | `buildDreamHubBodyHtml` |
| 카드 상세 `/cards/:id` | `buildCardBodyHtml` |

- **허브 주입 배경 (2026-08-03 추가)**: `/dream`만 허브 목록이 주입돼 있고 `/guide`는 `<div id="app"></div>` 빈 껍데기였다. 91편 가이드로 가는 내부링크가 허브에서 **한 줄도 나가지 않는 상태**(3.5KB)였고, 공교롭게 네이버 웹문서 상위를 도배한 레이어는 허브가 주입된 꿈해몽뿐이었다. `buildGuideHubBodyHtml`을 미러링해 91/91 링크 노출(43.8KB)로 정정

### ⚠️ 관련 링크(relatedCards·relatedReadings·relatedDreams) 주입 - 2026-08-04

**상세 페이지의 내부링크가 크롤러에게 사실상 전무했다.** 8/3에 허브→상세를 고쳤지만 **상세→카드/리딩 방향**은 그대로 비어 있었고, 원인이 두 겹이었다.

1. `buildGuideBodyHtml`에 관련 섹션이 아예 없었고, `buildDreamBodyHtml`은 `relatedDreams`만 주입했다(카드·리딩 누락).
2. 더 근본적으로 **`GuideDetailPage.vue`·`DreamDetailPage.vue`의 관련 링크가 전부 `href="#"` + `@click.prevent="router.push(...)"`** 였다. 즉 JS를 실행하는 크롤러조차 실제 URL을 못 봤고, 사용자도 새 탭 열기·가운데 클릭·링크 미리보기가 안 됐다.

측정값(수정 전 → 후):

```
dream  /cards/   0/65 → 65/65      guide  /cards/   0/91 → 91/91
dream  /reading/ 0/65 → 65/65      guide  /reading/ 0/91 → 91/91
dream  /dream/  65/65 → 65/65      guide  /guide/   0/91 → 91/91
홈(/) 복귀 링크: 0/156 → 156/156   깨진 링크 0건(146개 대상 전수 dist 대조)
```

- Vue 쪽은 `href="#"` → `:href="실제경로"`로 바꿨다. `@click.prevent`는 그대로 두어 SPA 내비게이션은 유지된다(전체 리로드 없음).
- **브레드크럼은 정적 주입본에서만 `<a>`다.** Vue 템플릿의 브레드크럼은 `<span @click>`이라 링크가 아니고, 정적 주입본은 `#app`을 통째로 대체해 `AppShell` 네비게이션도 들어가지 않는다. 그래서 상세→허브·홈 복귀 경로를 정적 주입본에서 직접 만들어준다. 이 divergence는 의도된 것이다(정적본은 크롤러 전용).
- `relatedReadings[].path`는 전 156편이 이미 트레일링 슬래시를 갖고 있으나, 누락 시 Cloudflare 308을 타므로 `trailingSlashPath()`로 정규화해 주입한다.
- 새 상세 라우트를 만들 때 관련 링크가 있다면 **빌더에 `<a href>`로 주입하는 것을 기본으로 할 것.** Vue에서 `href="#"` 패턴을 새로 쓰지 말 것.
- **아직 빈 `#app`인 라우트 25개**: `/`, `/cards`(78장 허브), `/test`, `/reading/*`, `/today` 등. 리딩·테스트는 인터랙션 페이지라 우선순위가 낮지만 **`/cards`는 78장 허브라 같은 문제**를 안고 있다. 후속 후보
- 허브 라우트가 정적 `ROUTES`에 선언돼 있으면 `run()`에서 src 로드 후 `_guideHub` 같은 필드를 붙여야 한다(꿈해몽은 라우트 자체를 `run()`에서 push해 선언 시점에 실림)

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

- **`public/sitemap.xml`은 자동 생성이다 (2026-07-28 전환). 손으로 고치지 말 것** — `scripts/prerender.mjs`가 `ROUTES`(= 실제로 찍는 페이지 전체)에서 빌드마다 `dist/sitemap.xml`과 `public/sitemap.xml`을 함께 다시 쓴다. 라우트를 추가하면 sitemap은 저절로 따라온다
  - `noindex: true` 라우트(`/history`, `/rt-draw-k39f2`)는 자동 제외
  - `<lastmod>`는 그 페이지 내용을 담은 소스 파일의 **git 마지막 커밋 날짜**. 글 하나가 파일 하나인 가이드·꿈해몽은 정확하고, 카드 78장은 데이터 파일 2개를 공유해 파일 단위 해상도
  - changefreq·priority는 손관리 시절 값을 그대로 유지 (`sitemapHints()`)
  - **전환 배경**: 손관리 탓에 lastmod가 0개였고 서치콘솔이 6/17 이후 6주간 sitemap을 재처리하지 않아, URL Inspection 기준 253개 중 133개가 "Google에 아직 알려지지 않은 URL"이었다(가이드 18%·꿈해몽 5% 색인). lastmod가 없으면 구글이 다시 읽을 이유가 생기지 않는다
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
