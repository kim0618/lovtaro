---
description: LOVTARO 1주일치 인스타 콘텐츠 생성 (shortform + carousel + story + twitter)
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, AskUserQuestion, TodoWrite
---

# LOVTARO 인스타 콘텐츠 생성

## 실행 흐름

### 0. 날짜 확인
사용자에게 아래를 질문해라:
> 몇월 몇일(요일)부터 몇월 몇일(요일)까지 생성할까요?

사용자가 날짜를 알려주면 해당 기간의 콘텐츠를 생성한다.
폴더명은 `YYYY-MM-DD_day` 형식 (예: `2026-04-20_mon`).

### 1. 사전 확인
- `content-output/` 기존 폴더 확인 (중복 방지)
- `public/images/cards-png/` 메이저 아르카나 목록 확인
- `public/images/mcards/` 마이너 아르카나 목록 확인
- **메모리 `project_lovtaro_card_usage.md` 반드시 Read** — 누적 사용 카드 목록 확인 후 미사용 카드 풀에서 배정
- 최근 1~2주 콘텐츠에서 사용한 카드 추가 확인 (중복 방지)

### 2. 주간 전략 수립 후 즉시 진행
아래를 정리해서 보여주되 **승인 대기 없이 바로 파일 생성을 시작**해라:
- 날짜별 포맷 배치 (shortform/carousel/story)
- shortform 유형 배치 (참여형/소개형 메이저/소개형 마이너) — 고정 주간 배치표 준수
- 날짜별 카드 배정 (메모리 `project_lovtaro_card_usage.md` 기반 미사용 카드 우선)
- 날짜별 주제/훅

### 3. 파일 생성 순서
아래 순서로 **TodoWrite로 진행상황 추적하면서** 실행:

1. 날짜별 폴더 구조 생성
2. 날짜별 copy.txt 작성
3. 참여형이 있으면 reply_templates.txt 작성
4. twitter.txt 작성
5. `scripts/templates/`에서 해당 포맷 템플릿을 `scripts/generate-{포맷}-{날짜}.mjs`로 **복사**한 뒤 카드/카피만 교체
6. 이미지 생성 스크립트 실행
7. **생성된 이미지 시각 검증 (필수)** — 각 장면을 Read 도구로 열어 다음 확인:
   - 한국어 렌더링 자소 정상 여부 (특히 `듦` 같은 겹받침 — KO_STACK 미적용 시 깨짐)
   - 텍스트 오버플로우/잘림 여부
   - 프레임·카드·텍스트 간격이 레퍼런스와 일치하는지
   - 코스믹 배경·달·별·프레임이 의도대로 그려졌는지
   - 문제 발견 시 스크립트 수정 후 재생성. 문제없어야 8번으로 진행
8. **`project_lovtaro_card_usage.md` 메모리 업데이트** — 이번 주에 사용한 메이저/마이너 카드(커버+본문+참여+스토리 전부) 추가 기록

---

## 브랜드 정의

계정: @lovtarot_ | 사이트: lovtaro.kr
타깃: 연애 고민 20~30대 여성
무드: 딥네이비/퍼플/골드, 몽환적 감성, 따뜻한 톤
금지: 자극적 불안 마케팅, 과장, 저급한 표현

---

## 포맷별 비주얼 스타일 (중요)

**릴스/숏폼(1080x1920)**: 코스믹 프레임 스타일
- 딥네이비+퍼플 성운 배경 + 크레센트 달(왼쪽 상단) + 금색 장식 프레임이 감싸는 카드
- 세로형에서 장면 전환으로 몰입감을 만드는 무드
- 적용: 참여형/기존형/카드소개형 shortform **전부**
- 캐러셀용 릴스는 **예외** — scene01(cover)/scene05(closing)은 코스믹 유지, scene02~04(본문)는 editorial 템플릿 사용 (아래 "캐러셀용 릴스" 항목 참고)

**캐러셀(1080x1350)**: 풀배경 카드 스타일
- 카드 아트가 슬라이드 전체 배경을 점령하는 드라마틱한 레이아웃
- 피드 썸네일 한 장으로 시선을 잡는 게 목표이므로 카드 이미지 자체가 주인공
- **코스믹 프레임 스타일로 변경 금지** - 풀배경이 캐러셀 포맷에 맞음

**스토리(1080x1920)**: 기존 스타일 유지
- 마이너 아르카나 단일 카드 + "오늘의 소개 카드" 헤더 + 훅 + 키워드

---

## 주간 운영 구조 (고정 배치)

주 6회 인스타 업로드 + 스토리/트위터 매일.

| 요일 | 메인 콘텐츠 | 유형 | 카드 | 디자인 |
|---|---|---|---|---|
| 월 | shortform (3컷) | **소개형 메이저** | 메이저 1장 | NEW (`scene*_new.png`) |
| 화 | shortform (2컷) | 참여형 #2 | 공개 카드 3장(메이저) | 코스믹 참여형 |
| 수 | carousel + carousel용 릴스 | carousel 주제 | 메이저 커버 + 마이너 본문 | 풀배경 + 하이브리드 |
| 목 | shortform (2컷) | 참여형 #1 | 공개 카드 3장(메이저) | 코스믹 참여형 |
| 금 | shortform (3컷) | **소개형 마이너** | 마이너 1장 | 기존 (`scene*.png`) |
| 토 | carousel + carousel용 릴스 | carousel 주제 | 메이저 커버 + 마이너 본문 | 풀배경 + 하이브리드 |
| 일 | shortform (7컷) + story | **Sunday Tarot Preview** (주간 예고형) | 공개 카드 3장(메이저+마이너 혼합) | 코스믹 예고형 |

- 매일: story 1장 + twitter.txt 1개
- 참여형 릴스는 화·목 2회, reply_templates.txt 포함
- **소개형 메이저는 NEW 디자인(scene*_new)**, **소개형 마이너는 기존 디자인(scene*)** — 절대 섞지 말 것
- **일요일 Sunday Preview**는 참여형/소개형과 다른 전용 포맷. 7컷 구조 + 주간 시리즈명 고정("Sunday Tarot Preview"). 참여형과 구조적 차별화 필수: ① 타임라인 축(주 초반/중반/후반) ② 3번째 카드 공개 씬 전 정지 유도 씬(scene03) ③ 마지막 저장 CTA 씬(scene07)

---

## 코스믹 스타일 공통 요소 (릴스/숏폼 공통)

모든 릴스/숏폼 씬은 아래 공통 헬퍼를 사용한다:

### `cosmicDefs()` - SVG defs에 포함
- `cosmicBg` radialGradient: #1a0f38 → #140b2c → #0c0820 → #06040f
- `neb1` (오렌지), `neb2` (퍼플), `neb3` (골드) 성운 radialGradient
- `moonGlow` 달 주변 빛무리
- `moonMask` 크레센트 모양 마스크 (두 원 겹침)
- `softGlow` 텍스트용 블러 필터

### `cosmicBody(withMoon, starSeed)` - 배경 요소
- `cosmicBg` rect + 4개 성운 ellipse + ~500개 랜덤 별(mulberry32 시드) + 왼쪽 상단 달

### `drawFrame(x, y, w, h, strong)` - 카드 프레임
- 바깥 골드 rect (stroke 2.5) + 안쪽 가는 rect (gap 10)
- 4코너 장식 path (L자 모양)
- 색상: rgba(201,168,76,~) 계열

### `genStars(count, seed, ...)` - 별 생성 (mulberry32 seed 기반)

### 카드 이미지 처리
- `loadCard(slug, w, h)`: public/images/cards-png/{slug}.png 로드 후 리사이즈
- `roundImg(buf, w, h, r)`: 둥근 모서리 마스킹
- 프레임 안쪽에 카드 이미지를 sharp composite로 합성

---

## 포맷별 규칙

### shortform 공통
- 사이즈: 1080x1920
- 참여형·소개형 메이저: 메이저 아르카나 / 소개형 마이너: 마이너 아르카나
- 카드 경로: 메이저 `public/images/cards-png/{slug}.png`, 마이너 `public/images/mcards/{suit}/{Card Name}.png`
- **모든 씬에 cosmicDefs + cosmicBody 적용** (참여형 scene01만 라이트 버전)
- **소개형은 2가지 디자인 분기**:
  - 메이저 → NEW 디자인 (`scene01_new.png` / `scene02_new.png` / `scene03_new.png`), 레퍼런스 `generate-shortform-2026-04-18_sat_new.mjs`
  - 마이너 → 기존 디자인 (`scene01.png` / `scene02.png` / `scene03.png`), 레퍼런스 `generate-shortform-2026-04-18_sat.mjs` (오늘자 확정안)

### A. 참여형 shortform (2장)

디자인 의도만 서술. 수치·좌표는 템플릿(`scripts/templates/shortform-participation.mjs`)이 단일 소스.

**scene01**: 라이트 코스믹 + 컬러 variant 카드 뒷면 3장 + 번호
- `participationBody(seed)` 라이트 배경 (별 밀도 ↑, 작은 달)
- 훅 + 카드 3장(뒷면) + 번호(scheme accent색, numGlow) + "직감으로 골라보세요" 보조문구
- **카드 뒷면 컬러 variant 시스템**: `scripts/lib/color-card-back-svg.mjs`의 `pickRandomSchemes(3)`가 7개 스킴 풀(`navy / indigo / plum / teal / rose / emerald / amber`)에서 매 실행마다 **중복 없이** 랜덤 3개 픽
  - 만다라/올-시잉 아이/골드 장식은 전부 동일 (사이트 정본 패턴 유지)
  - scheme별로 달라지는 것: 카드 내부 배경 그라디언트(다크 채도톤) + 별빛 팔레트 + 테두리 컬러 글로우 + 번호 라벨 accent색
  - scheme별 accent색은 `getSchemeAccent(scheme)` 헬퍼로 조회 (번호 라벨 fill에 사용)
  - 스킴 추가는 `SCHEMES` 객체에 `{bgTop, bgBot, darkOverlay, border, borderGlow, moonFill, stars, accent, starSeed}` 세트로 등록. 기존 API(`pickRandomSchemes`, `getSchemeAccent`, `colorCardBackDefs`, `colorCardBackSvg`) 시그니처 변경 금지

**scene02**: 풀 코스믹 + 고정 CTA 템플릿
- `fullCosmicBody(seed)` + goldDivider 상하 장식 라인
- "직감으로 고른 번호를 / 댓글에 적어주세요" + "해석을 댓글로 달아드릴게요" + 3점 장식 + @lovtarot_
- **이 템플릿은 참여형 전용 고정 레이아웃 — 수정 금지**

### B. 소개형 shortform (3장) — 마이너 아르카나 전용 / 기존 디자인

디자인 의도만 서술. 수치·좌표는 템플릿(`scripts/templates/shortform-minor.mjs`)이 단일 소스.

**scene01**: 풀 코스믹 배경 + 달 + 훅 + **크게 강조된 프레임 카드 뒷면(중앙)**
- `cosmicBody(true, seed)` + `drawFrame` + `siteCardBackSvg`

**scene02**: **큰 프레임 카드 공개** + 글로우/비네팅 + 프레임 **외부 하단**에 카드명·키워드
- `cosmicBody(false, seed)` — 크레센트 달 **제거** (카드 내 달과 겹침 방지)
- `vignette` radialGradient 오버레이 + `cardGlow` 카드 뒤 골든/퍼플 ellipse 글로우
- 카드 이미지는 `sharpen` + `modulate({saturation, brightness})`로 가독성/채도 강화
- 프레임은 `drawFrame(..., strong>1)` 강화
- 한국어 카드명 + 영어 카드명(Georgia italic) + 키워드(letter-spacing 강조)

**scene03**: 헤더 + 중간 프레임 카드(내부 하단에 카드명 한/영) + 해석 3줄 + CTA
- 프레임 외부 하단에 키워드 라인
- CTA: "당신도 직접 뽑아보세요" + "무료 타로 리딩 lovtaro.kr"

### D. Sunday Tarot Preview shortform (7컷) — 일요일 전용 주간 예고형

디자인 의도만 서술. 수치·좌표는 레퍼런스 스크립트(`scripts/generate-shortform-2026-04-26_sun.mjs`)가 단일 소스. 매주 일요일 같은 포맷으로 재생성하되 카드 3장은 매주 새로 배정.

**구조 (7컷 고정 순서)**:

- **scene01** - 훅 + 흐릿한 카드 뒷면 3장 + "Sunday Tarot Preview" 시리즈 블록
  - `cosmicBodyNoMoon(seed)` + `cardAura` 골든/퍼플 글로우 ellipse
  - 카드 뒷면 3장: `cardScale=2.4`, gap=44, `softBlur`(stdDeviation=7) + opacity=0.55로 흐릿
  - 상단 훅 2줄 "다음 주 연애 흐름, / 월요일 전에 미리 확인하세요"(58px) → goldDivider(y=610) → "Sunday Tarot Preview"(Georgia italic 32px, y=680) → 보조 설명 1줄 "지금 고른 카드가 다음 주 흐름을 열어줘요"(28px, y=725)
  - **중요**: 시리즈명과 보조 설명은 하나의 블록처럼 보이도록 간격 45px 유지

- **scene02** - 선택 유도 (선명한 컬러 variant 카드 뒷면 3장 + 번호)
  - `participationBody(seed)` 라이트 배경 (참여형 scene01과 동일)
  - `cardScale=2.5`, gap=50, 훅 "직감으로 하나 골라보세요"(1줄, 52px)
  - 번호: 1번/3번 46px weight 600 + softGlow, **2번만 48px weight 700 + midNumGlow** (카드색에 묻히지 않도록 강조)
  - 하단 "멈추고 선택해보세요"(32px, opacity 0.95, midNumGlow) - 빠르게 지나가도 읽히는 밝기

- **scene03** - 정지 유도 (카드 확대 + 강한 중앙 글로우)
  - `participationBody(seed)` + `stopGlowStrong` 넓은 글로우 + `centerPulse` 중앙 카드 전용 펄스
  - `cardScale=2.65`, gap=20, cardY=1160 (scene02보다 아래로 이동)
  - 상단 "선택했나요?"(68px, y=330) + 서브 "고른 번호를 기억하세요"(30px, y=420)
  - 하단 3점 장식(y=1620) + "결과는 다음 장에서 열려요"(32px, y=1695)
  - **구조적 차별화**: cardScale 2.5→2.65 + gap 50→20 + cardY 아래로 → scene02 반복이 아닌 "정지" 순간

- **scene04~06** - 번호별 카드 공개 (프레임 카드 + 키워드 + 훅)
  - 마이너 scene02 레이아웃 재사용 (780×1170 프레임 + vignette + cardGlow), `frameY=265`
  - **상단**: 번호(Georgia 60px) → 훅(KO_STACK 42px)
  - 훅은 `string`(1줄) 또는 `[string, string]`(2줄) 둘 다 지원. 짧으면 1줄, 길면 2줄
  - 프레임 외부 하단: 한국어 카드명(54px, softGlow) + 영어(Georgia italic 32px, **softGlow 제외**) + 키워드(28px, ls 4)
  - **중요**: 영문 카드명에 softGlow 적용 금지 - Georgia italic 세리프 사이 글로우가 누적되어 콜론(":") 같은 아티팩트 발생. 한국어 카드명만 softGlow로 감싸기
  - 훅은 **타임라인 축**으로 작성: "주 초반, ~", "주 중반, ~" 또는 "수~목 사이, ~", "주 후반, ~"

- **scene07** - 저장 CTA (3장 썸네일 + 저장 유도 + 댓글 답글 유도)
  - `cosmicBodyNoMoon(seed)` + `thumbGlow` 전체 썸네일 뒤 글로우
  - **계층 3단**:
    - 최상단(56px, y=260/340): "저장해두고 / 다음 주에 다시 확인해보세요"
    - 중단(36px, y=1260/1325): "고른 번호를 댓글에 남겨주세요 / 답글로 더 깊은 해석을 남겨드릴게요"
    - 하단(Georgia 28px, y=1600): "Sunday Tarot Preview" → 서브(22px, y=1640, opacity 0.82, weight 400): "매주 일요일, 다음 주 연애 흐름"
  - 3장 썸네일 300x450 + 프레임(strong=1.1) + 1번/2번/3번 라벨(36px)

**카드 이미지 소스 (중요)**:
- `public/images/cards-png/*.png` 중 일부(`knight-of-cups`, `ace-of-wands` 등)는 **1200x630 OG 이미지**라 780x1170 세로 리사이즈 시 내용 손실 큼
- portrait 원본 경로로 명시적 오버라이드:
  - 메이저: `public/images/cards-png/{slug}.png` (1024x1536, 정상)
  - 마이너: `public/images/cards/{slug}.webp` (600x900) 또는 `public/images/mcards/{suit}/{Name}.png` (1024x1536)
- `CARDS` 배열 각 항목에 `imageSrc` 필드 추가. revealScene·scene07 양쪽 모두 `card.imageSrc || cardsDir/{slug}.png` 순으로 조회

**카드 배정 규칙 (3장 3축)**:
- 3장은 주의 리듬을 각각 다른 축으로 보여줌:
  - **희망/접근/급변**: The Star / Knight of Cups / Ace of Wands (2026-04-26 레퍼런스)
  - 매주 새로운 3축 조합 권장 (예: 안정/변동/결단, 회복/재회/전환 등)
- 메이저·마이너 혼합 가능. 단 `project_lovtaro_card_usage.md`와 대조해 중복 배정 금지
- 각 카드 훅은 "주 초반/수~목 사이/주 후반 + 가능성 언어" 포맷 엄수. "반드시/100%/무조건" 금지

**색상 일관성 (필수)**:
- scene01·02·03은 **동일한 카드 뒷면 컬러 3종** 사용 (선택 지속성)
- 구현: 모듈 최상위에서 `const [SCHEME_1, SCHEME_2, SCHEME_3] = pickRandomSchemes(3)` 한 번 픽해서 세 씬 전부에서 동일 상수 참조
- scene04~06은 실제 카드 공개이므로 무관

**복제 시 변경 항목**:
1. 파일명 날짜 치환
2. `CARDS` 배열 3장 교체 (slug / imageSrc / nameKr / nameEn / keywords / hook)
3. `starSeed` 값 교체 (시각 다양성)
4. copy.txt의 카드명/설명 갱신
5. reply_templates.txt의 1/2/3번 답글 갱신 (가능성 언어 유지)
6. capcut.txt는 장면 길이·줌 효과 템플릿 유지 가능 (매주 재사용)

**필수 출력물** (`content-output/{date}_sun/shortform/`):
- `scene01.png ~ scene07.png`
- `copy.txt` (릴스 해시태그 5개, 한국어 위주)
- `reply_templates.txt` (번호별 답글 3종, 심플 포맷: `1번 (한글/영문)` 헤더 + 4줄 마침표 구분)
- `capcut.txt` (장면별 길이·줌·트랜지션 디렉션) - CapCut 편집용

---

### C. 소개형 shortform (3장) — 메이저 아르카나 전용 / NEW 디자인

파일명은 `scene*_new.png`(NEW 식별자) 유지. scene02 비주얼은 **마이너 scene02 레이아웃과 동일**(780×1170 프레임 카드 + cosmic bg + vignette + cardGlow + 프레임 외부 카드명/키워드) — 메이저/마이너의 scene02 시각 패턴을 통일한다. scene01/03은 기존 NEW 디자인(1.png·3.png 배경, 드라마틱 훅) 유지.

- scene01_new: `public/images/1.png` 배경 + 훅 + @lovtarot_ (기존 유지)
- **scene02_new**: B섹션 scene02와 동일한 구조
  - `cosmicBody(seed)` (달 없음) + `vignette` + `cardGlow` ellipse
  - `drawFrame(..., strong=1.3)`로 780×1170 프레임 카드 (메이저 카드 `cards-png/{slug}.png`)
  - 카드 이미지 `sharpen` + `modulate({saturation:1.12, brightness:1.03})` + 8px rounded mask
  - 프레임 외부 하단: 한국어 카드명(KO_STACK, 52px, ls 3) + 영어 카드명(Georgia italic, 30px) + 키워드(KO_STACK, 26px, ls 4)
- scene03_new: `public/images/3.png` 배경 + 작은 프레임 카드 + 해석 3줄 + CTA (기존 유지)
- GPT 풀사이즈 일러스트 교체는 별도 채팅에서 수동 처리, 이 스킬 범위 밖
- 레퍼런스: `scripts/generate-shortform-2026-04-20_mon.mjs`

### carousel (5장, 1080x1350) - 풀배경 카드 스타일 (코스믹 적용 X)
- 템플릿: `scripts/templates/carousel.mjs` (수치는 템플릿이 단일 소스)
- slide01: 커버 — 메이저 아르카나 풀사이즈 + 하단 페이드 + 훅
- slide02~04: 카드 풀배경 + 영어 카드명(Georgia italic) + 한국어 부제 + 본문
- slide05: CTA — 카드 중앙 + 저장/공유 아이콘 + 텍스트
- `contentSlide(cardSlug, nameEn, subtitle, bodyText, index, filename)` 패턴
- **캐러셀은 피드 몰입감 우선이므로 코스믹 프레임 스타일로 변경 금지**

### carousel용 릴스 (carousel 날짜의 shortform) - 하이브리드 스타일
- **캐러셀 내용을 1080x1920로 재구성** (단순 리사이즈 아님)
- 동일 해석/동일 카드/새 장면 금지
- 세로형 하이브리드 레이아웃:
  - **scene01 (cover)**: 코스믹 스타일 — 큰 프레임 카드(720x1080) + 하단 훅
  - **scene02~04 (body)**: editorial 스타일 — `carouselShortformSlide()` 템플릿 사용 ([scripts/lib/carousel-shortform-template.mjs](../../lovtaro/scripts/lib/carousel-shortform-template.mjs))
  - **scene05 (closing)**: 코스믹 스타일 — CTA (360x540 프레임 카드 + 저장/공유 아이콘 + 텍스트)

#### scene02~04 editorial 템플릿 사용법
```js
import { carouselShortformSlide } from './lib/carousel-shortform-template.mjs'

const svg = carouselShortformSlide({
  cardSlug: 'the-moon',              // cards-png/{slug}.png
  nameEn: 'THE MOON',                // 영문 카드명 (대문자)
  titleKo: ['흐려진 마음의', '진짜 얼굴'],  // 한국어 제목 (배열 가능, 줄바꿈)
  subtitleEn: 'what the tides quietly hide', // 영문 서브카피 (Georgia italic)
  bodyLines: [                       // 본문 (최대 6줄, 초과 시 경고)
    '보이는 것과 느껴지는 것',
    '그 사이의 결을 조용히 살펴봅니다',
  ],
  keywords: ['직감', '불안', '흐림'],  // 하단 키워드
  index: 3,                          // 슬라이드 번호
  total: 5,                          // 전체 슬라이드 수
})
```

- 카드 크기: 440x726 (상단 중앙 hero)
- 본문 최대 6줄 (초과 시 console.warn, 슬라이드 분할 권장)
- 배경 cosmicSky + 상단 hairline + 우상단 초승달 + 하단 LOVTARO 로고 자동 포함
- `index`/`total` 파라미터는 내부 seed 계산에만 사용 (페이지 번호 표시는 제거됨)
- 폰트/컬러는 템플릿 내부에서 브랜드 규칙 자동 적용 (절대 수정 금지)

### story (1장, 1080x1920) - 기존 스타일 유지
- 템플릿: `scripts/templates/story.mjs` (수치는 템플릿이 단일 소스)
- 마이너 아르카나만 사용, 카드 경로: `public/images/mcards/{suit}/{Card Name}.png`
- `loadCard(suit, name, w, h)` 패턴 (suit: cups/swords/wands/pentacles)
- 상단 "오늘의 소개 카드" 헤더 + 카드 + 영어 카드명(Georgia italic) + 한국어 훅 + 키워드

#### 요일별 story 방향성
- **월~토**: 오늘의 소개 카드 (평상시 톤, 단일 마이너 + 감정 훅)
- **일요일**: 아래 둘 중 하나 선택
  - **주간 리캡형**: "이번 주 나의 카드들" 컨셉, 그 주 메인 주제·감정 흐름을 회고하는 훅 (예: "이번 주, 마음을 비추던 3장의 카드")
  - **다음 주 예고형**: 다음 주 월요일 소개형 메이저를 티징 (예: "내일부터 꺼내볼 카드") — 메이저 실루엣·키워드만 살짝 노출, 카드명은 숨김
- 일요일 story는 반드시 **감정 연장형 톤** 유지 (광고형 문구 금지). 예고형 선택 시에도 "내일부터 올라올 콘텐츠 많이 봐주세요" 같은 광고 문구 금지, 감성 티저만 허용

---

## 폰트 규칙 (절대 변경 금지)

한국어 렌더 font-family 스택 (상수, 변경 금지):
```
'Noto Sans KR', 'Apple SD Gothic Neo', NanumSquare, sans-serif
```
이하 표에서 **KO_STACK** 으로 표기.

| 용도 | font-family | font-weight | font-size | fill | 기타 |
|------|-------------|-------------|-----------|------|------|
| 한국어 메인 텍스트 | KO_STACK | 300 | 상황별 | #F4F8FF | softGlow 필터 권장 |
| 영어 카드명 | Georgia, serif | - | 19~32 | rgba(232,212,139,0.78) 또는 rgba(200,180,140,0.65) | font-style="italic" |
| 번호(참여형) | sans-serif | 600 | 42 | `getSchemeAccent(scheme)` 동적 (scheme별 accent) | numGlow 필터 (숫자만이라 스택 불필요) |
| 키워드 | KO_STACK | 300~400 | 20~30 | rgba(232,212,139,0.6~0.72) 또는 #e8d48b | letter-spacing 5~8 |
| 프레임 내 한국어 카드명 | KO_STACK | 300 | 32~62 | #F4F8FF | letter-spacing 5~8 |

- 한국어에 라틴 display 폰트 절대 금지
- Cormorant Garamond 사용 금지
- **한국어 font-family에 단순 `sans-serif` 단일 지정 금지** — sharp/librsvg가 fallback으로 렌더할 때 `듦` 같은 복잡 자소(겹받침)를 깨뜨림. 반드시 KO_STACK 전체를 명시해야 NanumSquare로 안정 렌더됨

---

## 카드 배정 규칙

- 참여형 shortform: 메이저 아르카나 (공개 카드 3장)
- 소개형 메이저 shortform (월): 메이저 아르카나 1장, NEW 디자인
- 소개형 마이너 shortform (금): 마이너 아르카나 1장, 기존 디자인
- carousel 커버: 메이저 아르카나만
- carousel 본문: 마이너 포함 가능
- story: 마이너 아르카나만
- 같은 주 내 동일 카드 2회 메인 사용 금지
- **누적 중복 방지**: 메모리 `project_lovtaro_card_usage.md`의 사용 기록 확인 후 미사용 카드 우선 배정
- **기록 대상(생성 후 반드시 업데이트)**: 소개형 scene02 메인, 캐러셀 커버, **캐러셀 본문 slide02~04 전부**, 참여형 공개 카드 3장, 참여형 scene02 공개 카드, story 카드, 캐러셀 릴스 scene01/02~04 메인
### 카드명 표기 (단일 소스)

카드명은 반드시 아래 데이터 파일의 값을 그대로 사용 (임의 번역 금지):
- **메이저 아르카나**: `src/data/tarotCards.js` → `MAJOR_ARCANA_CARDS[].name` (한국어) / `.nameEn` (영어)
- **마이너 아르카나**: `src/data/minorArcana.js` → `MINOR_ARCANA[slug].name` (한국어) / `.nameEn` (영어)

표기 규칙:
- **캡션·해시태그·유튜브 설명 등 텍스트 본문**: 마이너는 **영어 `nameEn`만** 사용 (예: `Ace of Cups`, `Knight of Wands`). 즉흥 번역(`컵의 기사`, `소드 퀸`) 금지
- **프레임 내 카드명 렌더링 (이미지)**: 한국어 `name` + 영어 `nameEn` 병기
  - 메이저 예: `연인` + `The Lovers` / `달` + `The Moon`
  - 마이너 예: `컵 에이스` + `Ace of Cups` / `완드 9` + `Nine of Wands`
- 같은 카드를 다른 이름으로 부르지 말 것 — 데이터 파일이 단일 소스

---

## copy.txt 구조

### shortform/copy.txt
```
[콘텐츠 주제]
[커버 문구]
[인스타 릴스 캡션]
[인스타 첫 댓글]
[유튜브 쇼츠 제목]
[유튜브 설명]
[유튜브 고정 댓글]
[틱톡 캡션]
[틱톡 첫 댓글]
```
- **[커버 문구]만 유지** — 한 줄 훅으로 전체 콘텐츠를 압축. scene01~05 문구는 copy.txt에 기록하지 않음 (이미지 안에 이미 있음, 스크립트 내 문자열이 단일 소스)
- **[인스타 릴스 캡션]**: 본문 + 해시태그 5개 (한국어 기반, 다양화)
- **[유튜브 쇼츠 제목]**: 반드시 끝에 `#shorts` 붙이기
- **[유튜브 설명]**: 본문 + 해시태그 5개 (**한국어 3 + 영어 2**). 영어는 `#tarot` `#tarotreading` `#lovereading` `#dailytarot` `#tarotcards` 등에서 2개 선택
- **[틱톡 캡션]**: 본문(릴스보다 짧고 훅 중심, 1~2줄) + 해시태그 **5개** (**한국어 3 + 영어 2**: `#fyp` `#foryou` `#tarot` `#tarottok` `#lovereading` 등에서 2개 선택, `#fyp`는 가급적 포함)
- **[틱톡 첫 댓글]**: 프로필 링크 유도 멘트 1줄 (틱톡은 캡션 내 링크 비활성이라 고정 댓글로 유도)
- **파일 맨 끝**: `[틱톡 첫 댓글]` 아래 빈 줄 3개 추가 (복사 시 여백 확보)

### carousel/copy.txt
```
[콘텐츠 주제]
[인스타 캐러셀 캡션]
[인스타 첫 댓글]
[스토리 점심 문구]
[스토리 업로드 전 예고]
[스토리 업로드 후 공유]
```
- **슬라이드별 문구/카드 배정(첫 장 문구, 슬라이드 구성)은 copy.txt에 기록하지 않음** — 스크립트가 단일 소스
- **[인스타 캐러셀 캡션]**: 본문 + 해시태그 **10개**, **주제 특화 태그 우선 배치**
  - 첫 3~5개는 콘텐츠 주제에 특화된 태그 (예: 이별후회복 캐러셀 → `#이별후회복 #이별극복 #자존감타로`)
  - 일반 태그(`#연애타로` `#타로카드` `#타로리딩`)는 뒷쪽에, 주 내 중복 3회 이상 금지
  - 매 캐러셀마다 태그 세트 70% 이상 다르게 구성 (고정 세트 반복 금지)

### story/copy.txt
- **생성 안 함** — 스토리는 이미지(story01.png) 1장만 생성. 별도 copy.txt 없음.
- 스토리 업로드 전/후 예고·공유 문구가 필요하면 해당 날짜의 shortform/carousel copy.txt에 포함하거나 생략 가능.

### reply_templates.txt (참여형만)
```
[참여형 콘텐츠 주제]
[운영자 고정/첫 댓글]
댓글에 1, 2, 3 중 하나를 남겨주시면 해당 번호 해석을 답글로 달아드릴게요 ✨

[1번 답글]
[2번 답글]
[3번 답글]
```
- 답글 1개씩만 작성 (기본/긴 구분 없음, 긴 톤으로 통일)
- **첫 문장은 반드시 "N번 카드는 {카드명} 카드예요"** 형식으로 시작
- **마지막 문장은 열린 결말** — 마침표로 단정짓지 말고 다음 질문·호기심을 유도
  - 좋음: "어떤 결이 찾아올지 조금 더 궁금해질지도 몰라요"
  - 좋음: "그 다음 흐름은 타로에게 다시 물어봐도 좋아요"
  - 나쁨: "~올 거예요." / "~세요." (단정 종결)
- **문장마다 줄바꿈 필수** — 인스타 댓글 가독성을 위해 마침표 뒤 반드시 줄바꿈. 한 단락처럼 붙이지 말 것
  ```
  N번 카드는 X 카드예요.
  (해석 문장 1)
  (해석 문장 2)
  (해석 문장 3)
  (열린 결말 문장)
  ```
- 카드는 해당 참여형의 scene01 뒷면 3장에 대응되는 공개 카드 (메이저/마이너 가능)

### twitter.txt
```
[게시물]
[이미지 사용]
[링크 사용]
[첫 댓글]
```
- 1개만 작성, 경우의 수 나누지 않음
- **[게시물]**: 본문 + **해시태그 2~3개** (본문 말미). 주제 특화 태그 우선
- **[링크 사용]**: URL만 적지 말고 **어디에 배치하는지 명시**
  - `본문 끝에 첨부` / `첫 댓글에 첨부` / `프로필 링크 유도 (본문에 "프로필 링크")` 중 택 1
  - X(트위터) 알고리즘상 링크는 **첫 댓글에 배치**가 도달률 유리 → 기본은 첫 댓글 배치 권장
- **[첫 댓글]**: 본문 직후 스레드 연결용 한 줄
  - 링크를 첫 댓글에 배치하는 경우 이 댓글에 URL 포함
  - 링크를 본문에 넣는 경우에도 첫 댓글로 보조 CTA/추가 문구 작성
  - **해시태그는 본문에만 쓰고 첫 댓글에는 넣지 않음**

---

## 해시태그 규칙
- 릴스(인스타): **5개 고정**
- 캐러셀/피드(인스타): 10개
- **트위터(X)**: 본문 내 **2~3개**, 주제 특화 태그 우선 (예: `#타로 #연애타로 #이별극복`). 링크와 해시태그를 같은 트윗에 섞으면 도달률 떨어지므로 링크는 첫 댓글, 해시태그는 본문 말미
- **유튜브 설명/고정댓글**: 5개, 그중 **영어 해시태그 2개 섞기** (예: `#tarot`, `#lovereading`, `#shorts`, `#tarotreading`, `#dailytarot` 등에서 2개)
- **틱톡**: 캡션에 **5개**, **한국어 3 + 영어 2**. `#fyp`는 가급적 포함, 영어는 `#fyp` `#foryou` `#tarot` `#tarottok` `#lovereading` 등에서 2개. 링크는 캡션에서 클릭 안 되므로 **첫 댓글에 프로필 링크 유도 1줄**
- **다양화 필수**: 매 콘텐츠마다 해시태그 세트를 다르게 구성 (고정 세트 반복 금지). 카드/주제에 맞춰 로테이션:
  - 공통 후보: `#연애타로` `#러브타로` `#타로카드` `#타로리딩` `#오늘의타로` `#무료타로` `#연애운` `#궁합타로` `#재회타로` `#속마음타로`
  - 카드별 후보: `#달타로` `#러버스카드` `#황제카드` 등 (카드명 한국어 기반)
  - 주제별 후보: `#운명의사람` `#진심타로` `#흔들리는마음` `#짝사랑타로` `#속마음` 등
  - **채널별** 동일 해시태그 3회 이상 반복 금지 (릴스/YT/틱톡 각각 독립 카운트). 같은 해시태그가 릴스 2회+YT 2회여도 채널별 각 2회이므로 허용
  - 영어 공통 해시태그(`#tarot` `#tarotreading` `#lovereading` `#dailytarot` `#tarotcards` `#lovetarot` `#foryou` `#tarottok` 등)는 채널 내 동일 태그 2회 이하 목표, 풀이 작으므로 3회까지 허용
- **유튜브 쇼츠 제목**: 끝에 반드시 `#shorts` 포함
- **유튜브 고정 댓글**: "프로필 링크" 표현 금지 (유튜브에 없는 개념) → "설명란 링크" 또는 "고정 댓글 링크" 사용 (예: `이 사람과 나, 정말 운명일까? | The Lovers 카드의 진심 #shorts`)

---

## 콘텐츠 톤 원칙
- 질문형 훅이 강해야 함
- 감정적으로 바로 이해되는 문장
- 설명형 금지
- CTA는 감정 연장형 (광고형 금지)
- 장면에 lovtaro.kr 직접 표기 금지 (단, 소개형 마이너 scene03 CTA의 "무료 타로 리딩 lovtaro.kr" 라인은 허용)
- em dash(-) 금지, 쉼표(,)로 연결
- 불필요한 장식 문자 금지

---

## 이미지 생성 스크립트 규칙

- 파일명: `scripts/generate-{포맷}-{날짜폴더명}.mjs`
- Node.js + sharp 기반
- 실행: `node scripts/generate-{포맷}-{날짜폴더명}.mjs`
- `scripts/lib/card-back-svg.mjs` 사이트 정본 카드 뒷면 모듈 (변형 금지)
- `scripts/lib/color-card-back-svg.mjs` 참여형 전용 컬러 variant 카드 뒷면 모듈
  - `pickRandomSchemes(n)` — 7개 스킴 풀에서 n개 중복 없이 랜덤 픽
  - `getSchemeAccent(scheme)` — 번호 라벨 fill 색상 조회
  - `colorCardBackDefs()` / `colorCardBackSvg(cx, cy, scale, scheme)` — defs·카드 SVG 생성
  - 참여형 scene01에서만 사용. 소개형/캐러셀/스토리에는 정본(`card-back-svg.mjs`) 사용
- 스크립트 작성 후 반드시 실행하여 이미지 생성 확인
- 생성된 이미지를 Read로 확인하여 품질 점검
- `mulberry32` 시드 기반 `genStars` 함수로 별 생성 (별 배치가 실행마다 동일하게 재현)

### 레퍼런스 스크립트 (단일 소스 — `scripts/templates/`)

| 용도 | 템플릿 파일 | 비고 |
|---|---|---|
| 참여형 shortform | `scripts/templates/shortform-participation.mjs` | 2컷, 코스믹 |
| 소개형 마이너 shortform (기존 디자인) | `scripts/templates/shortform-minor.mjs` | 3컷, 확정안 |
| 소개형 메이저 shortform (NEW 디자인) | `scripts/templates/shortform-major.mjs` | 3컷, scene02는 마이너와 동일 프레임 레이아웃 |
| carousel (풀배경) | `scripts/templates/carousel.mjs` | 5장 |
| story | `scripts/templates/story.mjs` | 1장, 마이너 |
| carousel 릴스 (하이브리드) | cover/closing은 코스믹 헬퍼, body는 `scripts/lib/carousel-shortform-template.mjs`의 `carouselShortformSlide()` | - |

- 새 스크립트 작성 = **템플릿 파일을 `scripts/generate-{포맷}-{YYYY-MM-DD_day}.mjs`로 복사 후 카드/카피만 교체**
- 템플릿 파일이 픽셀 수치·레이아웃의 **단일 소스**. 스킬 문서는 "디자인 의도"만 서술하고 수치는 템플릿을 따른다
- 수치 변경이 필요하면 **템플릿 자체를 업데이트** (스킬 문서 수치 수정만 하면 드리프트 발생)
- 코스믹 공통 헬퍼(cosmicDefs, cosmicBody, drawFrame, genStars, mulberry32)는 템플릿 안에 포함됨 — 그대로 재사용

**carousel 릴스의 scene02~04는 코스믹 헬퍼로 새로 그리지 말고 반드시 `carouselShortformSlide()`를 호출해 반환된 SVG를 그대로 sharp로 렌더링한다.**

---

## 최종 체크리스트 (생성 완료 후 반드시 점검)

### 포맷 구조
- [ ] 소개형 메이저는 NEW 디자인(scene*_new), 소개형 마이너는 기존 디자인(scene*)인가
- [ ] 참여형 shortform은 2장 구조인가
- [ ] 소개형 shortform은 3장 구조인가
- [ ] carousel 커버는 메이저 아르카나인가
- [ ] story에 마이너 아르카나를 mcards 경로에서 사용했는가
- [ ] story는 이미지 1장만 생성했는가 (copy.txt 없음)
- [ ] carousel용 릴스는 재해석 없이 하이브리드 레이아웃 변환만 했는가 (cover/closing 코스믹, body `carouselShortformSlide()` 사용)
- [ ] `project_lovtaro_card_usage.md` 업데이트했는가

### 비주얼 스타일
- [ ] **릴스/숏폼 전부 코스믹 스타일인가** (cosmicDefs + cosmicBody + drawFrame 사용)
- [ ] **캐러셀은 풀배경 카드 스타일인가** (코스믹 스타일로 바꾸지 않았는가)
- [ ] 참여형 scene01은 라이트 코스믹(participationBody + 작은 달)인가
- [ ] 참여형 scene02는 풀 코스믹 + 고정 CTA 템플릿인가
- [ ] 소개형 마이너 scene02는 780×1170 프레임 카드 + vignette/cardGlow + 프레임 외부 카드명인가
- [ ] 소개형 마이너 scene03은 헤더 + 440×660 프레임 카드 + 해석 + "무료 타로 리딩 lovtaro.kr" CTA인가
- [ ] 소개형 메이저(NEW) scene02도 780×1170 프레임 카드 + vignette/cardGlow + 프레임 외부 카드명 구조인가 (마이너 scene02와 시각 통일, 출력은 `scene02_new.png`)
- [ ] 프레임 내부 카드명이 한국어+영어 병기인가

### 폰트/텍스트
- [ ] 카드명이 `src/data/tarotCards.js`/`minorArcana.js`의 `name`·`nameEn` 값과 일치하는가 (임의 번역 없음)
- [ ] 텍스트 본문에서 마이너 아르카나를 영어 `nameEn`으로 표기했는가
- [ ] 한국어 텍스트 font-family가 KO_STACK(`'Noto Sans KR', 'Apple SD Gothic Neo', NanumSquare, sans-serif`)인가 (단순 `sans-serif` 금지, Cormorant Garamond 금지)
- [ ] 폰트 weight 300, fill #F4F8FF 기본값을 사용했는가
- [ ] 영어 카드명은 Georgia serif italic인가

### 기타
- [ ] 릴스 해시태그 5개, 캐러셀 해시태그 10개, 틱톡 해시태그 5개(한3+영2, `#fyp` 포함)인가
- [ ] shortform/copy.txt에 `[틱톡 캡션]`과 `[틱톡 첫 댓글]` 섹션이 포함되어 있는가
- [ ] 모든 이미지가 정상 생성되었는가
- [ ] em dash(-) 사용 안 했는가 (쉼표로 연결)
