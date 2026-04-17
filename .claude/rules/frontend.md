# Frontend Rules (Vue 3)

## 스택
- Vue 3 + `<script setup>` SFC 전용 (Options API 금지)
- vue-router 4 (createWebHistory)
- Vite 4 (SPA → `scripts/prerender.mjs`로 정적화)
- 상태 관리 라이브러리 없음 — `ref`/`computed` + composable 패턴

## 디렉토리 규칙

```
src/
  pages/          라우트 단위 페이지 (*.Page.vue 또는 *Page.vue)
  components/
    common/       AppShell, ErrorBoundary, OtherReadingsNav 등
    ui/           PageContainer, SectionBlock 등 원자 UI
    home/         홈 전용
    reading/      리딩 결과 공통
    result/       공유/저장/Streak 등
    cards/        카드 목록/상세
    draw/         카드 뽑기 UI
    threecards/   3장 리딩 전용
  composables/    use{Domain}.js (로직 재사용)
  data/           정적 데이터 (tarotCards, cardDictionary, readings/*)
  utils/          gtag, shareLink (순수 헬퍼)
  assets/styles/  global.css, variables.css
  router/index.js 라우트 등록
```

- 새 도메인 컴포넌트 생긴다고 `components/` 루트에 두지 말 것. 도메인 폴더 먼저 확인, 없으면 새로 만든다.
- composable은 반드시 `src/composables/`에 두고 `use` 접두사 사용.

## 페이지 컴포넌트 템플릿

모든 페이지는 다음 구조를 기본으로 한다:

```vue
<script setup>
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'

useHead({ title, description, jsonLd, ogImage })
</script>

<template>
  <AppShell>
    <PageContainer>
      <SectionBlock spacing="md">...</SectionBlock>
    </PageContainer>
  </AppShell>
</template>
```

- `useHead` 호출 없는 페이지 금지 (SEO 결함 발생)
- `AppShell > PageContainer > SectionBlock` 래핑 준수

## 라우트 추가 체크리스트

라우트 1개 추가 시 **3군데 동시 수정**:

1. `src/router/index.js` — `routes` 배열에 등록
2. `scripts/prerender.mjs`의 `ROUTES` 배열에 `{ path, title, description, ogImage? }` 등록
3. `src/pages/`에 페이지 컴포넌트 생성 (`useHead` 포함)

prerender 누락 시 소셜 공유/검색 크롤러에 기본 메타만 노출됨.

## 스타일 규칙

- CSS 변수: `src/assets/styles/variables.css`에 정의된 토큰 사용 (색/spacing/radius)
- 하드코딩된 색·폰트 금지 — 브랜드 규칙은 `.claude/rules/` 추가 예정
- 페이지/컴포넌트별 `<style scoped>` 기본, 전역 재사용 클래스만 `global.css`
- 한국어: `word-break: keep-all` 전역 적용됨

## Composable 작성 규칙

- 파일명: `use{Domain}.js`
- localStorage 접근은 항상 `try/catch`로 감싸기 (SSR/프라이빗 모드 안전)
- 반환은 객체로 명시 (구조분해 가능하게)
- 날짜 키: `YYYY-MM-DD` 포맷 고정 (예: `useDailyTarot.js`의 `getTodayKey()`)

## 데이터 구조 변경 시

- `src/data/tarotCards.js`, `minorArcana.js`, `cardDictionary.js`는 **카드 목록의 단일 소스**
- 카드 배열을 수정하면 `scripts/prerender.mjs`의 `CARDS`/`MINOR_CARDS` 배열도 동기화 필수 (prerender는 독립 미러링 중)
- `src/data/cardImages.js`에 경로 매핑, `OG_SLUG_MAP` (prerender.mjs)에 슬러그 불일치 케이스

## PWA

- `public/manifest.json`, `public/sw.js`
- 서비스워커는 `index.html`에서 자동 등록 — 캐시 전략 변경 시 두 파일 동시 수정

## 금지 사항

- `fetch`로 타로 데이터 가져오기 금지 (전부 정적 import)
- 라우트 `params` 신뢰 금지 — 존재하지 않는 카드 id 방어 (`CardDetailPage`처럼 `v-if="card"` 분기)
- 하드코딩된 도메인 (`https://lovtaro.kr`) 금지 — `SITE_URL`  `useHead.js`에서 import
