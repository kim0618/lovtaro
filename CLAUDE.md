# Lovtaro - CLAUDE.md

무료 연애 타로 리딩 서비스. 서비스 오픈 2026-04-06. 도메인 https://www.lovtaro.kr (canonical: https://lovtaro.kr)

- **계정**: @lovtarot_
- **타깃**: 연애 고민 20~30대 여성
- **무드**: 딥네이비/퍼플/골드, 몽환적 감성, 따뜻한 톤
- **수익화**: 프리미엄 1:1 리딩(편지/카드) 중심. **AdSense 보류** (디스플레이 광고 대신 상품 수익화, 2026-06-01 재확인). `/lovtaro-adsense-check` 스킬은 보류 상태로 보존(재개 시 사용)

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
| `/reading/3cards` | 3장 리딩 |
| `/cards` | 카드 목록 (78장) |
| `/cards/:id` | 카드 상세 (Major 22 + Minor 56) |
| `/test` | 연애 심리테스트 허브 |
| `/test/:slug` | 심리테스트 엔진 (질문→결과 카드, 데이터 구동) |
| `/guide` | 가이드 인덱스 (AdSense 콘텐츠 섹션, Phase 2 진행 중) |
| `/guide/:slug` | 가이드 상세 |
| `/about` | 서비스 소개 |
| `/contact` | 문의 (카카오 오픈채팅 / 인스타 DM / 유튜브) |
| `/editorial-policy` | 편집 방침 |
| `/disclaimer` | 면책 조항 |
| `/privacy` | 개인정보처리방침 |

## 프로젝트 메모

- 라우트 추가 시 **2군데 동시 수정**: `src/router/index.js` + `scripts/prerender.mjs`의 `ROUTES`. **sitemap은 건드리지 않는다** - prerender가 `ROUTES`에서 빌드마다 자동 생성(2026-07-28 전환, `noindex` 라우트 자동 제외 + git 기준 `lastmod` 부여)
- 카드 데이터는 `src/data/tarotCards.js`, `minorArcana.js`, `cardDictionary.js`가 단일 소스. 카드 배열 수정 시 `prerender.mjs`의 `CARDS`/`MINOR_CARDS`도 동기화
- 78장 카드 상세 페이지(`/cards/:id`)는 prerender가 카드 배열로 자동 생성
- 심리테스트 추가: `src/data/tests/{slug}.js`(love-style.js 스키마) + `src/data/tests/index.js`의 `TESTS` 배열 등록 **2군데**(sitemap 자동). prerender는 `TESTS`를 루프해 `/test/{slug}` intro를 자동 생성(엔진 `TestPage.vue` 1개가 모든 테스트 구동, 결과는 메이저 아르카나 카드에 매핑)
- 가이드 글은 `src/data/guides/{slug}.js` + `src/data/guides/index.js` 배열 등록 + `prerender.mjs`의 `GUIDES` 배열 **3군데 동시 수정**(sitemap 자동, 스킬이 처리)
- JSON-LD: prerender가 정적 주입 (Organization/WebSite/Article/FAQPage/CollectionPage/BreadcrumbList). Vue `useHead`는 SPA 네비 후 단일 스키마 덮어쓰기 (덜 풍부). 후속 과제: 공용 빌더 `scripts/seo/jsonld.mjs` 추출

## 콘텐츠 발행 주기 (2026-07-30 개정)

| 스킬 | 주기 | 비고 |
|---|---|---|
| `/lovtaro-dream` | **매일 1편** (하드 캡) | 수요 실측 최상위 레이어. 7/21 캡처 웹문서 TOP30 상위를 도배(old-friend 3062노출 전체 1위 등). 유지 |
| `/lovtaro-guide` | **주 2편 - 월·목만** (하드 캡) | 2026-08-03(월) 시작. 이전 "매일 1편"은 폐기 |
| `/lovtaro-verify` | 발행 있는 날 | 발행분 묶어 전수 검증 |
| `/insta` | 주 1회 | 인스타·유튜브 1주일치 |

**가이드를 주 2편으로 내린 이유** (되돌리기 전 필독): 카드 78장 가이드가 2026-07-19 완주해 수요 근거가 있는 큐가 소진됐고, 편당 성과가 꿈해몽의 자릿수 아래이며(가이드 90편 중 웹문서 TOP30 진입 1개), 하루 1편 압박이 골격 복제 사고를 만들었다(7/27 10건·7/29 11건 수정, N-gram 일치 29건). 상세는 [.claude/commands/lovtaro-guide.md](.claude/commands/lovtaro-guide.md) "주 2편 전환 배경".

- **화·수·금·토·일**: 가이드 신규 발행 없음. 대신 보강 슬롯(기존 가이드 역방향·속마음 각도 강화)
- **🛑 억지 큐 정지선**: 큐가 남아 있어도 주제가 근거 없이 억지스러워지면 신규 발행을 멈추고 보강으로 대체. 현재 판정으로 **2026-08-20에 발행 대상 6편이 소진**되고 그 뒤는 보류 7개만 남는다
- **게이트 ~~2026-08-27~~ → 2026-10-01 이후로 연기 (8/4 변경)**: 가이드 레이어 웹문서 TOP30 진입이 1개 → 3개 이상이면 주 2편 유지. **⚠️8/27에 동결 결론 금지** - 게이트 직전 구조적 SEO 변경 2건(8/3 `/guide` 허브 내부링크 0→91, 8/4 상세 관련링크 0/91→91/91 + `href="#"` 정정)이 들어가 판정이 오염됐다. 8/27은 중간 관측만 기록하고, 10월 판정에서도 미달이면 **노출·색인 선행지표가 움직였는지 먼저 확인**한 뒤에 동결을 검토한다. 상세는 [lovtaro-guide.md](.claude/commands/lovtaro-guide.md) "게이트 연기 사유"
- 2026-07-30(목)~08-02(일) 가이드 미발행은 전환 공백으로 **의도적**. 결번 아님

~~**신청 전 1회**: `/lovtaro-adsense-check` - 2026-06-11 전수 점검~~ (AdSense 보류로 미실행)

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
