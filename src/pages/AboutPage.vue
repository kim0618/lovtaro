<script setup>
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'

useHead({
  title: 'Lovtaro 소개 - 무료 연애 타로 리딩 서비스 | Lovtaro',
  description: 'Lovtaro는 연애 고민을 가진 분들을 위한 무료 타로 리딩 서비스입니다. 상대방 속마음, 재회 가능성, 연락 올까 타로까지 - 감정의 흐름을 조용하게 읽어드립니다.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Lovtaro 소개',
    description: 'Lovtaro 무료 연애 타로 리딩 서비스 소개',
    url: 'https://lovtaro.kr/about/',
    inLanguage: 'ko',
    isPartOf: { '@id': 'https://lovtaro.kr#website' },
  },
})
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="about">
        <h1 class="about__title">Lovtaro 소개</h1>

        <section class="about__section">
          <h2>타로로 감정을 읽다</h2>
          <p>
            Lovtaro는 연애 고민을 가진 분들을 위한 무료 타로 리딩 서비스입니다.
            상대방의 속마음이 궁금하거나, 재회가 가능한 흐름인지 알고 싶거나,
            연락이 올지 조용히 살펴보고 싶을 때 카드가 감정의 결을 함께 읽어드립니다.
          </p>
          <p>
            타로는 점이 아니라 내면의 언어입니다.
            카드가 보여주는 상징을 통해 지금 이 순간의 감정을 더 명확하게 바라볼 수 있도록 돕는 것이 Lovtaro의 역할입니다.
          </p>
        </section>

        <section class="about__section">
          <h2>제공하는 리딩</h2>
          <ul class="about__list">
            <li><strong>러브타로</strong> - 두 사람의 마음과 관계의 방향을 3장으로 읽기</li>
            <li><strong>상대방 속마음</strong> - 그 사람이 지금 나를 어떻게 생각하는지</li>
            <li><strong>재회 가능성</strong> - 다시 만날 수 있는 흐름인지</li>
            <li><strong>연락 올까</strong> - 그 사람에게서 연락이 올지</li>
            <li><strong>Yes/No 타로</strong> - 궁금한 것에 카드가 답하기</li>
            <li><strong>궁합 타로</strong> - 두 사람의 에너지와 케미 확인</li>
            <li><strong>3장 리딩</strong> - 과거·현재·미래 흐름 읽기</li>
            <li><strong>오늘의 연애 카드</strong> - 하루의 감정 기류 한 장</li>
          </ul>
        </section>

        <section class="about__section">
          <h2>타로 카드 사전</h2>
          <p>
            메이저 아르카나 22장과 마이너 아르카나 56장, 총 78장의 타로 카드 의미를 수록했습니다.
            정방향·역방향 해석과 연애 상황별 의미를 함께 제공합니다.
          </p>
        </section>

        <section class="about__section">
          <h2>무료로 이용하기</h2>
          <p>
            모든 타로 리딩과 카드 사전은 무료로 이용하실 수 있습니다.
            회원가입 없이 바로 시작할 수 있으며, 리딩 기록은 기기에 안전하게 저장됩니다.
          </p>
        </section>

        <section class="about__section">
          <h2>면책 안내</h2>
          <p>
            Lovtaro의 타로 리딩은 오락 및 자기 성찰 목적으로 제공됩니다.
            타로 결과는 미래를 단정하거나 보장하지 않으며, 중요한 결정에 앞서 전문가의 조언을 구하시길 권합니다.
            자세한 내용은 <a href="/disclaimer">면책 조항</a>을 참고해 주세요.
          </p>
        </section>
      </div>
    </PageContainer>
  </AppShell>
</template>

<style scoped>
.about {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  max-width: 480px;
  margin: 0 auto;
}

.about__title {
  font-family: var(--lt-font-sans);
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  text-align: center;
  margin-bottom: var(--lt-space-xl);
}

.about__section {
  margin-bottom: var(--lt-space-lg);
}

.about__section h2 {
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.03em;
  margin-bottom: var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.about__section p {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  letter-spacing: 0.02em;
  margin-bottom: var(--lt-space-sm);
}

.about__section p:last-child {
  margin-bottom: 0;
}

.about__list {
  list-style: none;
  padding: 0;
  margin: var(--lt-space-sm) 0 0;
}

.about__list li {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  padding-left: var(--lt-space-md);
  position: relative;
  margin-bottom: 4px;
}

.about__list li::before {
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

.about__list strong {
  color: var(--lt-text);
  font-weight: 400;
}

.about__section a {
  color: var(--lt-accent-2);
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.85;
}

.about__section a:hover {
  opacity: 1;
}
</style>
