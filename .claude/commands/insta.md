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
- 최근 1~2주 콘텐츠에서 사용한 카드 확인 (중복 방지)

### 2. 주간 전략 수립 후 즉시 진행
아래를 정리해서 보여주되 **승인 대기 없이 바로 파일 생성을 시작**해라:
- 날짜별 포맷 배치 (shortform/carousel/story)
- shortform 유형 배치 (기존형/참여형/카드소개형)
- 날짜별 카드 배정
- 날짜별 주제/훅

### 3. 파일 생성 순서
아래 순서로 **TodoWrite로 진행상황 추적하면서** 실행:

1. 날짜별 폴더 구조 생성
2. 날짜별 copy.txt 작성
3. 참여형이 있으면 reply_templates.txt 작성
4. twitter.txt 작성
5. 이미지 생성 스크립트 작성 및 실행
6. 생성된 이미지 확인

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
- 적용: 참여형/기존형/카드소개형/캐러셀용 릴스 **전부**

**캐러셀(1080x1350)**: 풀배경 카드 스타일
- 카드 아트가 슬라이드 전체 배경을 점령하는 드라마틱한 레이아웃
- 피드 썸네일 한 장으로 시선을 잡는 게 목표이므로 카드 이미지 자체가 주인공
- **코스믹 프레임 스타일로 변경 금지** - 풀배경이 캐러셀 포맷에 맞음

**스토리(1080x1920)**: 기존 스타일 유지
- 마이너 아르카나 단일 카드 + "오늘의 연애 카드" 헤더 + 훅 + 키워드

---

## 주간 운영 구조

- 주 6회 업로드: shortform 4 + carousel 2
- 일요일: 유동 운영 또는 story 집중
- shortform 4개 중: 기존형 1~2, 참여형 1~2, 카드소개형 1 이상
- story는 매일 보조 운영
- twitter는 날짜 폴더 루트에 twitter.txt 하나

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
- 메이저 아르카나만 사용
- 카드 경로: `public/images/cards-png/{slug}.png`
- **모든 씬에 cosmicDefs + cosmicBody 적용** (참여형 scene01만 라이트 버전)

### A. 참여형 shortform (2장)

**scene01**: 라이트 코스믹 배경 + 카드 뒷면 3장 + 번호
- 배경: `participationBody(starSeed)` - 어두운 밤하늘 + 별 밀도 ↑ + 하단 성운 약간 + 작은 달(moonMaskSmall)
- 훅: y=380/455, font-size 48, weight 300, #F4F8FF, letter-spacing 3, softGlow 필터
- 카드 3장: scale 2.5, gap 50, cardY 980, cardShadow 필터
- 번호: y = cardY + cardH/2 + 55, font-size 42, fill #e8d48b, weight 600, numGlow 필터
- "직감으로 골라보세요" y=1640, font-size 30, weight 300, rgba(244,248,255,0.6)
- `siteCardBackSvg`, `siteCardBackDefs` from `./lib/card-back-svg.mjs`

**scene02**: 풀 코스믹 + CTA (고정 템플릿)
- 배경: `fullCosmicBody(starSeed)` - 풀 성운 + 큰 달(moonMaskBig)
- goldDivider linearGradient (양끝 투명, 중간 골드)
- 상/하 장식 라인 y=820, y=1150
- "직감으로 고른 번호를 / 댓글에 적어주세요" y=910/985, font-size 48, #F4F8FF, weight 300
- "해석을 댓글로 달아드릴게요" y=1100, font-size 34, rgba(232,212,139,0.85), letter-spacing 4
- 3점 장식 dots y=1300
- @lovtarot_ y=1860

### B. 기존형 shortform (3장)

**scene01**: 풀 코스믹 + 훅 + 프레임 카드 뒷면
- 배경: `cosmicBody(true, seed)` - 풀 성운 + 달
- 훅: y=400/475, font-size 48, weight 300, softGlow 필터
- 프레임 카드 뒷면: cardCX=540, cardCY=1080, cardScale 2.55, framePad 28
- `drawFrame` 으로 프레임 감싼 후 `siteCardBackSvg`

**scene02**: 큰 프레임 카드 공개 + 카드명 프레임 내부 + 키워드
- 배경: 풀 코스믹
- 카드: 620x930, frameY=260, framePad 30, nameArea 230
- 프레임 내부에 카드 이미지 + 구분선 + 한국어 카드명(62pt, weight 300) + 영어 카드명(Georgia italic 32pt)
- 프레임 외부 하단: 키워드 y=frameY+frameH+80, font-size 30, rgba(232,212,139,0.72), letter-spacing 7-8

**scene03**: 헤더 + 작은 프레임 카드 + 해석 + CTA
- 배경: 풀 코스믹
- 헤더: y=200, font-size 40, weight 300, letter-spacing 6 (예: "운명의 끌림", "놓지 못한 감정")
- 작은 프레임 카드: 300x450, frameY=280, framePad 18, nameArea 115
- 카드명: 한국어 32pt / 영어 Georgia italic 19pt
- 키워드: frame 하단 y=frameY+frameH+60, font-size 22
- 해석 3줄: font-size 34, weight 300, letter-spacing 1, lineGap 58
- CTA: "당신도 직접 뽑아보세요" (34pt) / "무료 타로 리딩 lovtaro.kr" (26pt, rgba(232,212,139,0.78))

### C. 카드 소개형 shortform (3장)

**scene01**: 풀 코스믹 + 질문 훅 (카드 뒷면 없음, 텍스트 중심)
- 배경: 풀 코스믹
- 중심 큰 성운 glow + 훅 텍스트 상/하 장식 라인 (goldLine)
- 훅: y=900/970, font-size 54, weight 300, letter-spacing 2, softGlow
- 보조 문구: y=1100, font-size 30, rgba(232,212,139,0.7), letter-spacing 5 (예: "이 카드의 답을 들어보세요")

**scene02, scene03**: 기존형 scene02/scene03와 동일한 레이아웃 패턴

### carousel (5장, 1080x1350) - 풀배경 카드 스타일 (코스믹 적용 X)
- slide01: 커버 — 메이저 아르카나 풀사이즈 + 하단 페이드 + 훅(font-size 44, weight 300, #F4F8FF)
- slide02~04: 카드 풀배경 + 영어 카드명(Georgia serif italic, size 22) + 한국어 부제(size 36~40, weight 300) + 본문
- slide05: CTA — 저장/공유 (카드 중앙 + 저장/공유 아이콘 + 텍스트)
- `contentSlide(cardSlug, nameEn, subtitle, bodyText, index, filename)` 패턴
- **캐러셀은 피드 몰입감 우선이므로 코스믹 프레임 스타일로 변경 금지**

### carousel용 릴스 (carousel 날짜의 shortform) - 코스믹 스타일
- **캐러셀 내용을 1080x1920 코스믹 스타일로 재구성** (단순 리사이즈 아님)
- 동일 해석/동일 카드/새 장면 금지
- 세로형 코스믹 레이아웃:
  - scene01: 큰 프레임 카드(720x1080) + 하단 훅
  - scene02~04: contentScene 패턴 (작은 프레임 카드 340x510 + 부제 + 카드명 + 해석)
  - scene05: CTA (360x540 프레임 카드 + 저장/공유 아이콘 + 텍스트)

### story (1장, 1080x1920) - 기존 스타일 유지
- 마이너 아르카나만 사용
- 카드 경로: `public/images/mcards/{suit}/{Card Name}.png`
- `loadCard(suit, name, w, h)` 패턴 (suit: cups/swords/wands/pentacles)
- 카드 680x930, cardTop 170, roundCorner 20
- 영어 카드명: Georgia serif italic, size 22, rgba(200,180,140,0.65)
- 한국어 훅: sans-serif, size 38, weight 300, #F4F8FF
- hookStartY = engNameY + 80, 줄간격 55
- 키워드: sans-serif, size 20, rgba(180,170,220,0.45)
- 상단 "오늘의 연애 카드" 헤더

---

## 폰트 규칙 (절대 변경 금지)

| 용도 | font-family | font-weight | font-size | fill | 기타 |
|------|-------------|-------------|-----------|------|------|
| 한국어 메인 텍스트 | sans-serif | 300 | 상황별 | #F4F8FF | softGlow 필터 권장 |
| 영어 카드명 | Georgia, serif | - | 19~32 | rgba(232,212,139,0.78) 또는 rgba(200,180,140,0.65) | font-style="italic" |
| 번호(참여형) | sans-serif | 600 | 42 | #e8d48b | numGlow 필터 |
| 키워드 | sans-serif | 300 | 22~30 | rgba(232,212,139,0.6~0.72) | letter-spacing 5~8 |
| 프레임 내 한국어 카드명 | sans-serif | 300 | 32~62 | #F4F8FF | letter-spacing 5~8 |

- 한국어에 라틴 display 폰트 절대 금지
- Cormorant Garamond 사용 금지

---

## 카드 배정 규칙

- shortform: 메이저 아르카나(22장)만
- carousel 커버: 메이저 아르카나만
- carousel 본문: 마이너 포함 가능
- story: 마이너 아르카나만
- 같은 주 내 동일 카드 2회 메인 사용 금지
- 마이너 아르카나 카드명은 반드시 영어 (Ace of Cups, Knight of Wands 등)
- 한국어 번역형 금지 (컵 3, 소드 퀸 등)
- 프레임 카드명 표기 시에는 한국어+영어 병기 (예: "연인" + "The Lovers", "컵의 기사" + "Knight of Cups")

---

## copy.txt 구조

### shortform/copy.txt
```
[콘텐츠 주제]
[커버 문구]
[scene01 문구]
[scene02 문구]
[scene03 문구]
[인스타 릴스 캡션]
[인스타 첫 댓글]
[유튜브 쇼츠 제목]
[유튜브 설명]
[유튜브 고정 댓글]
```
- 참여형은 [scene03 문구]에 "사용 안 함"

### carousel/copy.txt
```
[콘텐츠 주제]
[첫 장 문구]
[슬라이드 구성]
[인스타 캐러셀 캡션]
[인스타 첫 댓글]
[스토리 점심 문구]
[스토리 업로드 전 예고]
[스토리 업로드 후 공유]
```

### story/copy.txt
```
[점심 스토리 문구]
[업로드 전 예고]
[업로드 후 공유]
```

### reply_templates.txt (참여형만)
```
[참여형 콘텐츠 주제]
[운영자 고정/첫 댓글]
댓글에 1, 2, 3 중 하나를 남겨주시면 해당 번호 해석을 답글로 달아드릴게요 ✨

[1번 - 기본 댓글 답글]
[1번 - 긴 댓글 답글]
[2번 - 기본 댓글 답글]
[2번 - 긴 댓글 답글]
[3번 - 기본 댓글 답글]
[3번 - 긴 댓글 답글]
```

### twitter.txt
```
[게시물]
[이미지 사용]
[링크 사용]
```
- 1개만 작성, 경우의 수 나누지 않음

---

## 해시태그 규칙
- 릴스: 5개
- 캐러셀/피드: 10개

---

## 콘텐츠 톤 원칙
- 질문형 훅이 강해야 함
- 감정적으로 바로 이해되는 문장
- 설명형 금지
- CTA는 감정 연장형 (광고형 금지)
- 장면에 lovtaro.kr 직접 표기 금지 (단, 카드소개형/기존형 scene03 CTA의 "무료 타로 리딩 lovtaro.kr" 라인은 허용)
- em dash(-) 금지, 쉼표(,)로 연결
- 불필요한 장식 문자 금지

---

## 이미지 생성 스크립트 규칙

- 파일명: `scripts/generate-{포맷}-{날짜폴더명}.mjs`
- Node.js + sharp 기반
- 실행: `node scripts/generate-{포맷}-{날짜폴더명}.mjs`
- `scripts/lib/card-back-svg.mjs` 카드 뒷면 모듈 사용 (변형 금지)
- 스크립트 작성 후 반드시 실행하여 이미지 생성 확인
- 생성된 이미지를 Read로 확인하여 품질 점검
- `mulberry32` 시드 기반 `genStars` 함수로 별 생성 (별 배치가 실행마다 동일하게 재현)

### 레퍼런스 스크립트 (반드시 참고, 코스믹 스타일 정본)
- **참여형 shortform**: `scripts/generate-shortform-2026-04-21_tue.mjs`
- **기존형 shortform**: `scripts/generate-shortform-2026-04-20_mon.mjs` (Lovers 카드 예시)
- **카드소개형 shortform**: `scripts/generate-shortform-2026-04-23_thu.mjs` (Strength 카드 예시)
- **carousel (풀배경)**: `scripts/generate-carousel-2026-04-22_wed.mjs` 또는 `scripts/generate-carousel-2026-04-25_sat.mjs`
- **carousel 릴스 (코스믹)**: `scripts/generate-shortform-2026-04-22_wed.mjs` 또는 `scripts/generate-shortform-2026-04-25_sat.mjs`
- **story**: `scripts/generate-story-2026-04-20_mon.mjs`

새 스크립트 작성 시 반드시 해당 레퍼런스를 Read로 읽고 동일한 패턴/스타일/수치를 사용해라. 특히 코스믹 공통 헬퍼(cosmicDefs, cosmicBody, drawFrame, genStars, mulberry32)는 레퍼런스에서 복사해 재사용한다.

---

## 최종 체크리스트 (생성 완료 후 반드시 점검)

### 포맷 구조
- [ ] shortform에 메이저 아르카나만 사용했는가
- [ ] 참여형 shortform은 2장 구조인가
- [ ] 기존형/카드소개형 shortform은 3장 구조인가
- [ ] carousel 커버는 메이저 아르카나인가
- [ ] story에 마이너 아르카나를 mcards 경로에서 사용했는가
- [ ] story는 1개만 생성했는가
- [ ] carousel용 릴스는 재해석 없이 코스믹 세로형 레이아웃 변환만 했는가

### 비주얼 스타일
- [ ] **릴스/숏폼 전부 코스믹 스타일인가** (cosmicDefs + cosmicBody + drawFrame 사용)
- [ ] **캐러셀은 풀배경 카드 스타일인가** (코스믹 스타일로 바꾸지 않았는가)
- [ ] 참여형 scene01은 라이트 코스믹(participationBody + 작은 달)인가
- [ ] 참여형 scene02는 풀 코스믹 + 고정 CTA 템플릿인가
- [ ] 기존형/카드소개형 scene02는 큰 프레임 카드 + 카드명 프레임 내부인가
- [ ] 기존형/카드소개형 scene03은 헤더 + 작은 프레임 카드 + 해석 + "무료 타로 리딩 lovtaro.kr" CTA인가
- [ ] 프레임 내부 카드명이 한국어+영어 병기인가

### 폰트/텍스트
- [ ] 마이너 아르카나 카드명을 영어로 표기했는가
- [ ] 한국어 텍스트에 sans-serif만 사용했는가 (Cormorant Garamond 금지)
- [ ] 폰트 weight 300, fill #F4F8FF 기본값을 사용했는가
- [ ] 영어 카드명은 Georgia serif italic인가

### 기타
- [ ] 릴스 해시태그 5개, 캐러셀 해시태그 10개인가
- [ ] 모든 이미지가 정상 생성되었는가
- [ ] em dash(-) 사용 안 했는가 (쉼표로 연결)
