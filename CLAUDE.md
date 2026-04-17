# Lovtaro - CLAUDE.md

무료 연애 타로 리딩 서비스. 도메인 https://lovtaro.kr

- **계정**: @lovtarot_
- **타깃**: 연애 고민 20~30대 여성
- **무드**: 딥네이비/퍼플/골드, 몽환적 감성, 따뜻한 톤

## 스택

Vue 3 + Vite 4 SPA → `scripts/prerender.mjs`로 라우트별 정적 HTML 생성.
상태 관리 라이브러리 없음. composable 패턴. GA4로 이벤트 추적.

## 명령어

```bash
npm run dev       # Vite dev server
npm run build     # prebuild(OG 생성) → vite build → postbuild(prerender)
npm run preview   # 빌드 결과 미리보기
```

## 규칙

작업 영역에 따라 아래 규칙 파일 참조:

- @.claude/rules/frontend.md - Vue 3 구조, 페이지/composable/라우트 규칙
- @.claude/rules/seo.md - useHead, JSON-LD, prerender, OG 이미지
- @.claude/rules/analytics.md - GA4 이벤트 네이밍, 파라미터 컨벤션, UTM

## 프로젝트 메모

- 라우트 추가 시 `src/router/index.js` + `scripts/prerender.mjs`의 `ROUTES` + `public/sitemap.xml` 3군데 수정 필요
- 카드 데이터는 `src/data/tarotCards.js`, `minorArcana.js`, `cardDictionary.js`가 단일 소스. 카드 배열 수정 시 `prerender.mjs`의 `CARDS`/`MINOR_CARDS`도 동기화
- 78장 카드 상세 페이지(`/cards/:id`)는 prerender가 카드 배열로 자동 생성
- JSON-LD는 현재 **클라이언트 사이드 주입**만 있음 — 크롤러 가시성을 위해 prerender에 정적 주입 작업 예정

## 인스타 콘텐츠 생성

별도 슬래시 스킬 `/insta` 사용. 생성 규칙은 `~/.claude/commands/insta.md` 참고.

## 금지

- em dash(-) 대신 하이픈(-) 사용
- 자극적 불안 마케팅, 과장, 저급 표현
- `https://lovtaro.kr` 하드코딩 - `SITE_URL` import 사용
- `document.title` 직접 변경 - `useHead` 사용
- `window.gtag` 직접 호출 - `trackEvent` 래퍼 사용
