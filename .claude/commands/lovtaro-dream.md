---
description: lovtaro.kr 꿈해몽 사전 글 1편 자동 작성 + 파일 생성 + index/sitemap 동기화 (연애+꿈 롱테일 SEO 엔진)
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch
---

# 러브타로 꿈해몽 사전 작성 스킬

`lovtaro` 프로젝트의 `/dream` 섹션에 **퀄리티가 브랜드를 결정하는** 꿈해몽 글 1편을 작성한다. 얇거나 AI스러운 글, 멋대로 지어낸 해몽은 절대 발행하지 않는다. 기준 미달이면 기준까지 다시 쓴다.

## 존재 이유 / 포지셔닝

꿈해몽은 사주·운세 사이트와 블로그가 빽빽한 레드오션이다. 범용 꿈해몽으로 정면 경쟁하지 않는다. 우리 니치는 **"연애+꿈 롱테일"** - "전 애인 꿈 재회", "좋아하는 사람 꿈 의미"처럼 운세 사이트가 약하고 연애 타로 브랜드가 강한 각도다. 신규 도메인이 일반 대형 키워드(이빨·똥 등)로 상위 진입은 어렵다는 전제 위에서, 연애가 지배적 해석인 꿈을 우선한다.

## 편수 원칙 (절대)

- 사용자가 명시하지 않으면 **하루 1편.** 2편 이상 금지.
- 기준 미달이면 리라이트 허용. 편수 채우려고 얇게 발행하지 않는다. 기준 미달이면 발행을 미뤄도 OK.
- verify 통과 전 commit·배포 금지. 배포는 사용자가 직접(빌드까지만).

## 핵심 작성 원칙: 근거 위 재해석 (3겹)

1. **전통 해몽(근거)** - 그 꿈의 일반적/전통적 통념을 먼저 파악(필요 시 WebSearch). 검색 유저가 기대하는 표준 해석에서 벗어나지 않는다. 멋대로 발명 금지.
2. **러브타로 연애 각도(브랜드)** - 표준 해석 위에 "이 꿈이 연애·관계에 주는 신호"를 얹는다.
3. **가능성의 언어(톤)** - 카드 사전과 동일한 화법. "~인 경우가 많아요", "~신호일 수 있어요". 점쟁이 톤이 아니라 마음을 비추는 거울 톤.

연애 직결도가 낮은 범용 꿈(이빨·똥·물)은 표준 해몽을 메인으로 깔고 연애는 보조 1섹션만. 억지로 연애를 메인에 욱여넣지 않는다. 무리하면 그 주제는 스킵하고 큐에서 연애 직결 주제를 당겨온다.

## 프로젝트 경로

- 꿈 배열(단일 소스): [src/data/dreams/index.js](/home/tjd618/lovtaro/src/data/dreams/index.js)
- 개별 글: `/home/tjd618/lovtaro/src/data/dreams/{slug}.js`
- 상세 페이지: [src/pages/DreamDetailPage.vue](/home/tjd618/lovtaro/src/pages/DreamDetailPage.vue) (수정 불필요)
- 인덱스 페이지: [src/pages/DreamIndexPage.vue](/home/tjd618/lovtaro/src/pages/DreamIndexPage.vue) (수정 불필요)
- sitemap: [public/sitemap.xml](/home/tjd618/lovtaro/public/sitemap.xml)
- 주제 큐: [.claude/dreams-queue.md](/home/tjd618/lovtaro/.claude/dreams-queue.md)

**중요**: prerender.mjs는 `src/data/dreams/index.js`를 직접 import해 라우트를 자동 생성한다. **prerender는 수동 수정 불필요.** 가이드와 달리 동기화 지점이 3곳뿐이다.

## 0단계. 쓰기 전에 읽기 (Research Phase)

이 단계를 건너뛰면 글은 반드시 얄팍해진다.

0. **⚠️ 원격 동기화 확인 (가장 먼저, 생략 금지)** - 큐 파일(`dreams-queue.md`)과 로컬 파일 목록만 보고 "미발행"을 판단하지 않는다. 여러 PC에서 작업하므로 로컬이 원격보다 뒤처져 있으면 **이미 발행된 주제를 중복 작성**하게 된다.

   ```bash
   cd /home/tjd618/lovtaro && git fetch origin 2>&1 && git status -sb | head -3
   ```

   원격에 새 커밋이 있으면(behind/diverged) **작업을 멈추고 사용자에게 pull을 먼저 요청한다.** 부득이 진행해야 하면 원격 목록을 직접 대조한다:

   ```bash
   git ls-tree origin/main src/data/dreams/ --name-only | sed 's/.*\///; s/\.js$//' | sort
   ```

   *배경 (2026-07-20 사고)*: 같은 날 `/lovtaro-guide`에서 원격에 이미 발행된 가이드를 로컬 큐만 믿고 중복 작성해 하루치 작업을 폐기했다. 꿈해몽도 큐 소진 후 자체 선정 방식이라 동일한 위험이 있다.

1. **기존 꿈해몽 톤 샘플 2편** - `src/data/dreams/`의 최근 글 2편을 읽어 톤·구조·어휘를 체화한다. 시드 3편(ex-lover, crush, kiss)이 기준 템플릿이다. 새 글이 같은 감정 온도를 가져야 한다.
2. **전통 해몽 근거 확인** - 그 꿈의 표준 통념을 파악. 불확실하면 `WebSearch`로 확인. (예: 뱀=재물·이성운, 이빨=가족·구설, 태몽=새 생명·변화)
3. **중복 회피** - `ls src/data/dreams/ | grep -v '^index.js$' | sed 's/\.js$//'`로 미발행 확인. **위 0번에서 원격까지 대조한 뒤에만 유효하다.**

## 1단계. 주제 선정

큐 [.claude/dreams-queue.md](/home/tjd618/lovtaro/.claude/dreams-queue.md) **맨 위 미발행(`- [ ]`)에서 1개**를 꺼낸다.

- 큐 소진 임박(남은 미발행 4개 이하)이면 먼저 사용자에게 알리고, 네이버 서치어드바이저 노출 화면을 요청해 다음 큐를 짠다(데이터 쌓인 후 역산 전환).
- 큐의 "후순위(범용 대형)" 주제는 연애 각도가 억지면 스킵하고 1·2군에서 당겨온다.

## 2단계. 제목·메타 카피

- **title**: `{꿈} 꿈 해몽 - {연애 각도 한 줄}` 형식. 예: `전 애인 꿈 해몽 - 미련일까 정리의 신호일까` (60자 이내 권장)
- **description**: 그 꿈의 의미 + 상황별 분기 + 연애 각도를 한 문장에. 검색 의도 키워드(전남친 꿈, 짝사랑 꿈 등)를 자연스럽게 포함. 150자 내외.

## 3단계. 구조 설계 (4섹션 + FAQ)

분량 **2,400-3,600자** (HTML 렌더 후). 이보다 얇으면 리라이트.

| 섹션 | 역할 |
|------|------|
| 1. 이 꿈이 비추는 것 | 전통 해몽 통념 + "이 꿈은 상대가 아니라 내 마음을 비춘다"는 프레임 |
| 2. 상황별 분기 (`<ul>`) | 4개 내외. 누구와/어떤 장면이었는지에 따라 결이 다름. 각 항목 `<strong>` 라벨 + 풀이 |
| 3. 이 꿈을 ~신호로 봐도 될까 | 가장 궁금한 오해(재회 신호인가 등)를 정면으로 다루되 단정 없이 |
| 4. 꿈을 꾸고 난 뒤 살펴볼 것 | 충동 행동 자제 + 감정 알아차리기 + 현실 흐름 점검으로 마무리 |

## 4단계. 문장 규칙 (lovtaro 공통)

- 어미: "~예요/~어요" 따뜻한 구어체. 사례형 문단 필수.
- **단정·예언 금지**: "반드시/100%/무조건" 금지. 꿈은 가능성의 언어.
- **불안 마케팅 금지**: "흉몽이니 조심" 식 공포 조장 금지. 부정적 통념도 "~불안이 비친 것"으로 심리적 재해석.
- **자가 부정 금지**: "미신이지만/재미로" 금지.
- **em dash(—) 전면 금지.** 하이픈(-)으로 대체하거나 삭제.
- **AI 패턴 금지**: "안녕하세요", "정리합니다", "완벽 가이드", "한눈에" 등.

## 5단계. FAQ 작성 (4개)

검색 유저가 실제로 치는 질문으로. 예: "전 애인 꿈을 꾸면 그 사람도 나를 생각하나요?", "재회 신호인가요?", "자주 꾸는 이유는?", "기분이 안 좋은데 어떻게 하나요?". 답변은 평문(HTML 태그 없이), 단정 없이.

## 6단계. 관련 링크

- **relatedReadings (1-3개)**: 그 꿈의 연애 각도에 맞는 무료 리딩. 재회 꿈→`/reading/reunion/`, 상대 마음 꿈→`/reading/mind/` 등. 퍼널 연결.
- **relatedCards (3-5장)**: 그 꿈 정서와 통하는 타로 카드. `{ id, name }` 형식, id는 tarotCards/minorArcana의 실제 id.

## 7단계. 파일 포맷

`src/data/dreams/{slug}.js` - 시드 3편과 **동일 스키마**(가이드와 같음):

```js
const SITE_URL = 'https://lovtaro.kr'
export default {
  slug: '...',            // 영소문자+하이픈, unique
  title: '...',
  category: 'person' | 'situation' | 'symbol',
  description: '...',
  createdAt: 'YYYY-MM-DD',
  updatedAt: 'YYYY-MM-DD',
  ogImage: `${SITE_URL}/og-image.png`,
  summary: '...',          // 한 줄 핵심 답(GEO 인용용). 제목 아래 박스로 노출. 단정 없이.
  sections: [{ heading: '...', content: `<p>...</p>` }],  // content는 신뢰된 정적 HTML
  faq: [{ question: '...', answer: '...' }],               // answer는 평문
  relatedReadings: [{ label: '...', path: '/reading/.../' }],
  relatedCards: [{ id: '...', name: '...' }],
  relatedDreams: [{ slug: '...', label: '...' }],          // 관련 꿈 내부링크(토픽 클러스터)
}
```

- **summary (필수)**: 그 꿈의 핵심을 1문장으로. "~인 경우가 많아요/~신호에 가까워요" 가능성 어법. 본문 첫 섹션 첫 문장과 중복되지 않게 더 압축. AI(ChatGPT·Perplexity)가 그대로 인용해 가는 자리다.
- **relatedDreams (2개 내외)**: 토픽이 통하는 **이미 발행된** 꿈 slug만. 존재하지 않는 slug 금지(죽은 링크). 새 글 발행 시, 기존 관련 글의 relatedDreams에도 이 글을 역으로 추가해 양방향 연결하면 더 좋다.

## 8단계. 동기화 (2곳)

1. **파일 생성**: `src/data/dreams/{slug}.js`
2. **레지스트리 등록**: [src/data/dreams/index.js](/home/tjd618/lovtaro/src/data/dreams/index.js)에 `import` + `dreams` 배열에 추가 (최신이 위로)

prerender.mjs와 sitemap은 건드리지 않는다 (둘 다 자동).

**sitemap은 2026-07-28부터 자동 생성이다.** prerender가 빌드마다 `ROUTES`에서 `dist/sitemap.xml`과 `public/sitemap.xml`을 다시 쓴다. 손으로 넣은 URL은 다음 빌드에서 덮어써진다. 레지스트리에 등록만 하면 URL과 `<lastmod>`(= `{slug}.js`의 git 커밋 날짜)가 함께 붙는다. 빌드 후 `grep -c "dream/{slug}/" public/sitemap.xml` 이 1인지만 확인한다.

## 9단계. 빌드 검증

```bash
cd /home/tjd618/lovtaro && npm run build 2>&1 | grep -iE "dream|error|fail|pages written"
```

- `✓ /dream/{slug}` 출력 확인
- `dist/dream/{slug}/index.html`에서 확인: ① `<div id="app"><div class="dream-detail">`로 본문 정적 주입됨 ② `"@type":"Article"` + `"@type":"FAQPage"` JSON-LD ③ canonical이 trailingSlash(`/dream/{slug}/`)

## 10단계. 큐 + verify

- 큐 [.claude/dreams-queue.md](/home/tjd618/lovtaro/.claude/dreams-queue.md)에서 발행한 주제를 `- [x]` + slug/발행일로 체크. 하단 "발행 후 기록"에 추가(최근 7편만 유지).
- 작성 후 `/lovtaro-verify`로 묶어 검증(오류·AI패턴·em dash·단정 표현). verify 통과 전 배포 금지.

## 금지 (lovtaro 공통)

- em dash(—), 자극·불안 마케팅, 예언·단정, 자가 부정, AI 패턴.
- `https://lovtaro.kr` 하드코딩은 파일 상단 `SITE_URL` 상수로.
- 멋대로 지어낸 해몽. 전통 통념 근거 없이 쓰지 않는다.
- 연애 각도가 억지인 범용 꿈을 메인 연애 해석으로 욱여넣기.
