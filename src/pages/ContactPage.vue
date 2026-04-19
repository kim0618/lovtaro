<script setup>
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'

useHead({
  title: '문의하기 | Lovtaro',
  description: 'Lovtaro 서비스 관련 문의는 유튜브 또는 인스타그램 DM으로 연락해 주세요.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: '문의하기',
    description: 'Lovtaro 서비스 문의',
    url: 'https://lovtaro.kr/contact',
    inLanguage: 'ko',
    isPartOf: { '@id': 'https://lovtaro.kr#website' },
  },
})
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="contact">
        <h1 class="contact__title">문의하기</h1>

        <section class="contact__section">
          <p>
            서비스 이용 중 불편한 점이나 개선 의견이 있으시면 아래 채널로 연락해 주세요.
            광고 및 협업 문의도 동일한 채널로 보내주세요.
          </p>
        </section>

        <section class="contact__section">
          <h2>연락 채널</h2>
          <div class="contact__channels">
            <a
              href="https://www.instagram.com/lovtarot_/"
              target="_blank"
              rel="noopener noreferrer"
              class="contact__channel contact__channel--insta"
            >
              <svg class="contact__channel-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
              <span class="contact__channel-handle">@lovtarot_</span>
            </a>
            <a
              href="https://www.youtube.com/@러브타로"
              target="_blank"
              rel="noopener noreferrer"
              class="contact__channel contact__channel--yt"
            >
              <svg class="contact__channel-svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
              </svg>
              <span class="contact__channel-handle">러브타로</span>
            </a>
          </div>
        </section>

        <section class="contact__section">
          <h2>답변 안내</h2>
          <p>
            DM 문의는 순차적으로 답변드립니다.
            타로 해석 요청, 개인 상담, 미래 예언 요청에는 답변드리기 어렵습니다.
          </p>
        </section>
      </div>
    </PageContainer>
  </AppShell>
</template>

<style scoped>
.contact {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  max-width: 480px;
  margin: 0 auto;
}

.contact__title {
  font-family: var(--lt-font-sans);
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  text-align: center;
  margin-bottom: var(--lt-space-xl);
}

.contact__section {
  margin-bottom: var(--lt-space-lg);
}

.contact__section h2 {
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.03em;
  margin-bottom: var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.contact__section p {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  letter-spacing: 0.02em;
  margin: 0;
}

.contact__channels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--lt-space-sm);
}

.contact__channel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px var(--lt-space-sm);
  background: var(--lt-bg-card);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-md);
  text-decoration: none;
  transition: border-color var(--lt-transition), background var(--lt-transition);
}

.contact__channel--insta {
  color: #c9769a;
}

.contact__channel--yt {
  color: #b85f5f;
}

.contact__channel:hover {
  background: var(--lt-surface-raised);
  border-color: var(--lt-border);
}

.contact__channel-svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.85;
}

.contact__channel-handle {
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  font-weight: 300;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
</style>
