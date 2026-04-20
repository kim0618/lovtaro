<script setup>
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'

useHead({
  title: '편집 방침 | Lovtaro',
  description: 'Lovtaro 타로 가이드 콘텐츠의 작성 기준, 정확성 원칙, 업데이트 정책을 안내합니다.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '편집 방침',
    description: 'Lovtaro 콘텐츠 편집 방침',
    url: 'https://lovtaro.kr/editorial-policy/',
    inLanguage: 'ko',
    isPartOf: { '@id': 'https://lovtaro.kr#website' },
  },
})
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="editorial">
        <h1 class="editorial__title">편집 방침</h1>
        <p class="editorial__updated">최종 수정일: 2026년 4월 19일</p>

        <section class="editorial__section">
          <h2>1. 콘텐츠 목적</h2>
          <p>
            Lovtaro의 타로 가이드는 연애 고민을 가진 분들이 타로 카드의 상징과 의미를 스스로 이해할 수 있도록 돕기 위해 작성됩니다.
            모든 콘텐츠는 오락 및 자기 성찰 목적으로 제공되며, 전문적인 심리 상담이나 점술 서비스를 대체하지 않습니다.
          </p>
        </section>

        <section class="editorial__section">
          <h2>2. 작성 기준</h2>
          <ul class="editorial__list">
            <li>타로 카드의 전통적 의미와 현대적 해석을 균형 있게 반영합니다.</li>
            <li>연애 상황에 실질적으로 도움이 되는 해석에 초점을 맞춥니다.</li>
            <li>과도한 불안을 유발하거나 특정 결과를 단정하는 표현을 사용하지 않습니다.</li>
            <li>카드 조합이나 스프레드 해석은 맥락에 따라 달라질 수 있음을 명시합니다.</li>
          </ul>
        </section>

        <section class="editorial__section">
          <h2>3. 정확성 및 업데이트</h2>
          <p>
            콘텐츠는 최초 작성 후 오류나 개선이 필요한 경우 수정됩니다.
            수정 시 페이지의 최종 수정일을 업데이트하며, 중요한 내용 변경이 있을 경우 별도로 안내합니다.
          </p>
          <p>
            타로 해석은 학파와 덱에 따라 다양하게 나뉠 수 있습니다.
            Lovtaro의 해석이 유일한 정답이 아님을 인식하고 참고 자료로 활용해 주세요.
          </p>
        </section>

        <section class="editorial__section">
          <h2>4. 외부 링크</h2>
          <p>
            가이드 콘텐츠는 외부 사이트로의 링크를 포함할 수 있습니다.
            외부 링크의 콘텐츠에 대해서는 책임을 지지 않으며, 링크된 사이트의 정책을 확인하시길 권합니다.
          </p>
        </section>

        <section class="editorial__section">
          <h2>5. 문의</h2>
          <p>
            콘텐츠 오류 발견 또는 개선 제안은 <a href="/contact">문의하기</a> 페이지를 통해 알려주세요.
          </p>
        </section>
      </div>
    </PageContainer>
  </AppShell>
</template>

<style scoped>
.editorial {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  max-width: 480px;
  margin: 0 auto;
}

.editorial__title {
  font-family: var(--lt-font-sans);
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  text-align: center;
  margin-bottom: var(--lt-space-sm);
}

.editorial__updated {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  text-align: center;
  opacity: 0.6;
  margin-bottom: var(--lt-space-xl);
}

.editorial__section {
  margin-bottom: var(--lt-space-lg);
}

.editorial__section h2 {
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.03em;
  margin-bottom: var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.editorial__section p {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  letter-spacing: 0.02em;
  margin-bottom: var(--lt-space-sm);
}

.editorial__section p:last-child {
  margin-bottom: 0;
}

.editorial__list {
  list-style: none;
  padding: 0;
  margin: var(--lt-space-sm) 0 0;
}

.editorial__list li {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  padding-left: var(--lt-space-md);
  position: relative;
  margin-bottom: 4px;
}

.editorial__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--lt-accent-2);
  opacity: 0.4;
}

.editorial__section a {
  color: var(--lt-accent-2);
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.85;
}

.editorial__section a:hover {
  opacity: 1;
}
</style>
