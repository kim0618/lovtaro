<script setup>
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'

useHead({
  title: '면책 조항 | Lovtaro',
  description: 'Lovtaro 타로 리딩 서비스 이용 시 적용되는 면책 조항을 안내합니다. 타로 결과는 오락 및 참고 목적으로만 활용해 주세요.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '면책 조항',
    description: 'Lovtaro 타로 서비스 면책 조항',
    url: 'https://lovtaro.kr/disclaimer/',
    inLanguage: 'ko',
    isPartOf: { '@id': 'https://lovtaro.kr#website' },
  },
})
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="disclaimer">
        <h1 class="disclaimer__title">면책 조항</h1>
        <p class="disclaimer__updated">최종 수정일: 2026년 4월 19일</p>

        <section class="disclaimer__section">
          <h2>1. 오락 목적 서비스</h2>
          <p>
            Lovtaro에서 제공하는 타로 리딩은 오락 및 자기 성찰 목적으로만 제공됩니다.
            타로 카드 결과는 미래를 예언하거나 보장하지 않으며, 어떠한 결과도 실제 상황을 단정하지 않습니다.
          </p>
        </section>

        <section class="disclaimer__section">
          <h2>2. 전문가 상담 권고</h2>
          <p>
            연애, 심리, 건강, 법률, 재정 등 중요한 사안에 대한 결정을 내리기 전에는 반드시 해당 분야의 전문가와 상담하시길 권합니다.
            Lovtaro의 타로 결과는 전문가의 조언을 대체할 수 없습니다.
          </p>
        </section>

        <section class="disclaimer__section">
          <h2>3. 책임의 한계</h2>
          <p>
            Lovtaro는 타로 리딩 결과를 바탕으로 이용자가 내린 결정이나 행동으로 인해 발생하는 어떠한 손실이나 피해에 대해서도 법적 책임을 지지 않습니다.
          </p>
          <p>
            서비스 이용 중 발생하는 기술적 오류, 데이터 손실, 접근 불가 등의 상황에 대해 Lovtaro는 책임을 지지 않습니다.
          </p>
        </section>

        <section class="disclaimer__section">
          <h2>4. 콘텐츠 정확성</h2>
          <p>
            Lovtaro는 제공하는 타로 해석과 가이드 콘텐츠의 정확성을 위해 노력하지만, 타로 해석은 학파와 덱에 따라 다양하게 나뉠 수 있습니다.
            모든 콘텐츠는 참고 자료로만 활용하시기 바랍니다.
          </p>
        </section>

        <section class="disclaimer__section">
          <h2>5. 서비스 변경</h2>
          <p>
            Lovtaro는 사전 통보 없이 서비스 내용을 변경하거나 종료할 수 있습니다.
            이로 인한 이용자의 손실에 대해서는 책임지지 않습니다.
          </p>
        </section>

        <section class="disclaimer__section">
          <h2>6. 문의</h2>
          <p>
            면책 조항에 관한 문의는 <a href="/contact">문의하기</a> 페이지를 통해 연락해 주세요.
          </p>
        </section>
      </div>
    </PageContainer>
  </AppShell>
</template>

<style scoped>
.disclaimer {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  max-width: 480px;
  margin: 0 auto;
}

.disclaimer__title {
  font-family: var(--lt-font-sans);
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  text-align: center;
  margin-bottom: var(--lt-space-sm);
}

.disclaimer__updated {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  text-align: center;
  opacity: 0.6;
  margin-bottom: var(--lt-space-xl);
}

.disclaimer__section {
  margin-bottom: var(--lt-space-lg);
}

.disclaimer__section h2 {
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.03em;
  margin-bottom: var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.disclaimer__section p {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  letter-spacing: 0.02em;
  margin-bottom: var(--lt-space-sm);
}

.disclaimer__section p:last-child {
  margin-bottom: 0;
}

.disclaimer__section a {
  color: var(--lt-accent-2);
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.85;
}

.disclaimer__section a:hover {
  opacity: 1;
}
</style>
