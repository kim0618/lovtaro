# Lovtaro - CLAUDE.md

무료 연애 타로 리딩 서비스. 서비스 오픈 2026-04-06. 도메인 https://www.lovtaro.kr (canonical: https://lovtaro.kr)

- **계정**: @lovtarot_
- **타깃**: 연애 고민 20~30대 여성
- **무드**: 딥네이비/퍼플/골드, 몽환적 감성, 따뜻한 톤
- **AdSense**: 2026-06-12 신청 목표 (진행 중)

## 스택

Vue 3 + Vite 4 SPA → `scripts/prerender.mjs`로 라우트별 정적 HTML 생성.
상태 관리 라이브러리 없음. composable 패턴. GA4로 이벤트 추적.
배포: Cloudflare Pages (프로젝트명 `lovtaro`).

## 명령어

```bash
npm run dev       # Vite dev server
npm run build     # prebuild(OG 생성) → vite build → postbuild(prerender)
npm run preview   # 빌드 결과 미리보기

# 프로덕션 배포
cd /home/tjd618/lovtaro && npm run build && npx wrangler pages deploy dist --project-name=lovtaro
```

## 규칙

작업 영역에 따라 아래 규칙 파일 참조:

- @.claude/rules/frontend.md - Vue 3 구조, 페이지/composable/라우트 규칙
- @.claude/rules/seo.md - useHead, JSON-LD, prerender, OG 이미지
- @.claude/rules/analytics.md - GA4 이벤트 네이밍, 파라미터 컨벤션, UTM

## 라우트 구조

| 경로 | 역할 |
|------|------|
| `/` | 홈 |
| `/today` | 오늘의 연애 카드 |
| `/reading/love` | 러브타로 3장 |
| `/reading/mind` | 상대방 속마음 |
| `/reading/reunion` | 재회 가능성 |
| `/reading/contact` | 연락 올까 |
| `/reading/yesno` | Yes/No |
| `/reading/compatibility` | 궁합 |
| `/reading/three` | 3장 리딩 |
| `/cards` | 카드 목록 (78장) |
| `/cards/:id` | 카드 상세 (Major 22 + Minor 56) |
| `/guide` | 가이드 인덱스 (AdSense 콘텐츠 섹션, Phase 2 진행 중) |
| `/guide/:slug` | 가이드 상세 |
| `/about` | 서비스 소개 |
| `/contact` | 문의 (인스타 DM / 유튜브) |
| `/editorial-policy` | 편집 방침 |
| `/disclaimer` | 면책 조항 |
| `/privacy` | 개인정보처리방침 |

## 프로젝트 메모

- 라우트 추가 시 **3군데 동시 수정**: `src/router/index.js` + `scripts/prerender.mjs`의 `ROUTES` + `public/sitemap.xml`
- 카드 데이터는 `src/data/tarotCards.js`, `minorArcana.js`, `cardDictionary.js`가 단일 소스. 카드 배열 수정 시 `prerender.mjs`의 `CARDS`/`MINOR_CARDS`도 동기화
- 78장 카드 상세 페이지(`/cards/:id`)는 prerender가 카드 배열로 자동 생성
- 가이드 글은 `src/data/guides/{slug}.js` + `src/data/guides/index.js` 배열 등록 + `prerender.mjs`의 `GUIDES` 배열 + `public/sitemap.xml` **4군데 동시 수정** (스킬이 자동 처리)
- JSON-LD: prerender가 정적 주입 (Organization/WebSite/Article/FAQPage/CollectionPage/BreadcrumbList). Vue `useHead`는 SPA 네비 후 단일 스키마 덮어쓰기 (덜 풍부). 후속 과제: 공용 빌더 `scripts/seo/jsonld.mjs` 추출

## 하루 작업 (Phase 2: 2026-04-19 ~ 06-10)

**매일 (고정 순서)**:
1. `/lovtaro-guide` - 가이드 1편 (하드 캡)
2. `/lovtaro-card-expand` - 카드 본문 2장 보강 (하드 캡, 78장 완료 시 자동 삭제, 5/27경 예상)
3. `/lovtaro-verify` - 위 두 작업 묶어 전수 검증

**주 1회**: `/insta` - 인스타 1주일치 콘텐츠

**신청 전 1회**: `/lovtaro-adsense-check` - 2026-06-11 전수 점검

원칙: verify 통과 전 commit·배포 금지. 배포는 하루 1회. 편수 상한 절대 초과 금지.

## 금지

- em dash(—) 금지. 하이픈(-)으로 대체, 불필요 시 삭제. 전 프로젝트 공통 규칙
- 자극적 불안 마케팅, 과장, 저급 표현
- 예언·단정 표현 ("반드시", "100%", "무조건") - 타로는 가능성의 언어
- 자가 부정 표현 ("타로는 미신이지만", "재미로") - 면책은 `/disclaimer`가 담당
- `https://lovtaro.kr` 하드코딩 - `SITE_URL` import 사용
- `document.title` 직접 변경 - `useHead` 사용
- `window.gtag` 직접 호출 - `trackEvent` 래퍼 사용
- AI 패턴 ("안녕하세요", "정리합니다", "완벽 가이드", "한눈에")
