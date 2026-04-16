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

### 2. 주간 전략 수립 후 사용자 승인
아래를 정리해서 보여주고 승인받아라:
- 날짜별 포맷 배치 (shortform/carousel/story)
- shortform 유형 배치 (기존형/참여형/카드소개형)
- 날짜별 카드 배정
- 날짜별 주제/훅

승인받은 후에만 파일 생성을 시작해라.

### 3. 파일 생성 순서
승인받으면 아래 순서로 **TodoWrite로 진행상황 추적하면서** 실행:

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

## 주간 운영 구조

- 주 6회 업로드: shortform 4 + carousel 2
- 일요일: 유동 운영 또는 story 집중
- shortform 4개 중: 기존형 1~2, 참여형 1~2, 카드소개형 1 이상
- story는 매일 보조 운영
- twitter는 날짜 폴더 루트에 twitter.txt 하나

---

## 포맷별 규칙

### shortform 공통
- 사이즈: 1080x1920
- 메이저 아르카나만 사용
- 카드 경로: `public/images/cards-png/{slug}.png`

### A. 참여형 shortform (2장)
- **scene01**: 질문 훅 + 카드 뒷면 3장 + 번호(1번/2번/3번) + "직감으로 골라보세요"
- **scene02**: 고정 — "직감으로 고른 번호를 댓글에 적어주세요" + "해석을 댓글로 달아드릴게요"
- scene01의 훅 문구만 매번 변경, scene02는 고정 템플릿
- reply_templates.txt 필수

**scene01 확정 스타일** (반드시 이 패턴 사용):
- 카드 scale 2.5, gap 50, cardY 920
- 배경: linearGradient (#100e2a → #121030 → #0a0918)
- 카드 영역 글로우: radialGradient + blur
- 번호: font-size 40, fill #e8d48b, weight 600, numGlow 필터
- 훅 텍스트: font-size 48, fill #F4F8FF, weight 300, y=280/350
- 하단: "직감으로 골라보세요" font-size 30, weight 300
- `siteCardBackSvg`, `siteCardBackDefs` from `./lib/card-back-svg.mjs`

**scene02 확정 스타일** (고정, 변경 금지):
- 배경: radialGradient bgGlow2 (#1a1040 → #110d2e → #07060f)
- goldStars + dimStars
- "직감으로 고른 번호를" / "댓글에 적어주세요" font-size 46, #F4F8FF, weight 300
- "해석을 댓글로 달아드릴게요" font-size 36, rgba(232,212,139,0.7)
- 장식 라인 + @lovtarot_

### B. 기존형 shortform (3장)
- scene01: 카드 뒷면(1장, scale 2.75) + 훅
- scene02: 카드 공개 (카드 576x864) + 한국어 카드명 + 영어 카드명(Georgia serif italic)
- scene03: 해석 텍스트 + 약한 CTA

### C. 카드 소개형 shortform (3장)
- scene01: 카드 관심을 끄는 질문
- scene02: 카드 공개 + 카드명 + 짧은 의미
- scene03: 감정 해석 + 약한 CTA

### carousel (5장, 1080x1350)
- slide01: 커버 — 메이저 아르카나 풀사이즈 + 하단 페이드 + 훅(font-size 44, weight 300, #F4F8FF)
- slide02~04: 카드 풀배경 + 영어 카드명(Georgia serif italic, size 22) + 한국어 부제(size 36~40, weight 300) + 본문
- slide05: CTA — 저장/공유
- `contentSlide(cardSlug, nameEn, subtitle, bodyText, index, filename)` 패턴

### carousel용 릴스 (carousel 날짜의 shortform)
- **캐러셀 이미지를 1080x1920으로 재구성** (단순 리사이즈 아님)
- 동일 내용, 세로형에 맞춘 레이아웃
- 카드/텍스트/정보량 그대로 유지
- 새 해석/새 카드/새 장면 금지

### story (1장, 1080x1920)
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
| 한국어 메인 텍스트 | sans-serif | 300 | 상황별 | #F4F8FF | - |
| 영어 카드명 | Georgia, serif | - | 22 | rgba(200,180,140,0.65) | font-style="italic" |
| 번호(참여형) | sans-serif | 600 | 40 | #e8d48b | numGlow 필터 |
| 키워드 | sans-serif | - | 20 | rgba(180,170,220,0.45) | letter-spacing 2 |

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
- 장면에 lovtaro.kr 직접 표기 금지
- em dash(—) 금지, 쉼표(,)로 연결
- 불필요한 장식 문자 금지

---

## 이미지 생성 스크립트 규칙

- 파일명: `scripts/generate-{포맷}-{날짜폴더명}.mjs`
- Node.js + sharp 기반
- 실행: `node scripts/generate-{포맷}-{날짜폴더명}.mjs`
- `scripts/lib/card-back-svg.mjs` 카드 뒷면 모듈 사용 (변형 금지)
- 스크립트 작성 후 반드시 실행하여 이미지 생성 확인
- 생성된 이미지를 Read로 확인하여 품질 점검

### 레퍼런스 스크립트 (반드시 참고)
- 참여형 shortform: `scripts/generate-shortform-2026-04-16_thu.mjs`
- 기존형 shortform: `scripts/generate-shortform-2026-04-18_sat.mjs`
- carousel: `scripts/generate-carousel-2026-04-17_fri.mjs`
- carousel 릴스: `scripts/generate-shortform-2026-04-17_fri.mjs`
- story: `scripts/generate-story-2026-04-16_thu.mjs`

새 스크립트 작성 시 반드시 해당 레퍼런스를 Read로 읽고 동일한 패턴/스타일/수치를 사용해라.

---

## 최종 체크리스트 (생성 완료 후 반드시 점검)

- [ ] shortform에 메이저 아르카나만 사용했는가
- [ ] 참여형 shortform은 2장 구조인가
- [ ] 기존형/카드소개형 shortform은 3장 구조인가
- [ ] carousel 커버는 메이저 아르카나인가
- [ ] carousel 영어 카드명이 Georgia serif italic인가
- [ ] story에 마이너 아르카나를 mcards 경로에서 사용했는가
- [ ] story는 1개만 생성했는가
- [ ] carousel용 릴스는 재해석 없이 세로형 레이아웃 변환만 했는가
- [ ] 마이너 아르카나 카드명을 영어로 표기했는가
- [ ] 한국어 텍스트에 sans-serif만 사용했는가
- [ ] 폰트 weight 300, fill #F4F8FF를 사용했는가
- [ ] 릴스 해시태그 5개, 캐러셀 해시태그 10개인가
- [ ] 모든 이미지가 정상 생성되었는가
- [ ] scene02(참여형 CTA)는 고정 템플릿 그대로인가
