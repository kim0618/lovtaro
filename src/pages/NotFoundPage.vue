<script setup>
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'

useHead({
  title: '페이지를 찾을 수 없습니다 | Lovtaro',
  description: '요청하신 페이지를 찾을 수 없습니다.',
})
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="not-found">
        <div class="not-found__icon" aria-hidden="true">
          <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
            <circle cx="40" cy="40" r="32" stroke="rgba(200,169,110,0.2)" stroke-width="1" fill="none"/>
            <circle cx="40" cy="40" r="16" stroke="rgba(200,169,110,0.12)" stroke-width="0.5" fill="none"/>
            <circle cx="40" cy="40" r="4" fill="rgba(200,169,110,0.3)"/>
          </svg>
        </div>
        <p class="not-found__code">404</p>
        <h1 class="not-found__title">카드가 이 길을 비추지 않았습니다</h1>
        <p class="not-found__desc">
          찾으시는 페이지가 존재하지 않거나, 다른 곳으로 이동되었을 수 있어요.
        </p>
        <router-link to="/" class="not-found__cta">
          홈으로 돌아가기
        </router-link>
      </div>
    </PageContainer>
  </AppShell>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20vh var(--lt-space-md) var(--lt-space-2xl);
  gap: var(--lt-space-md);
}

.not-found__icon {
  opacity: 0.6;
  margin-bottom: var(--lt-space-sm);
}

.not-found__code {
  font-family: var(--lt-font-display);
  font-size: 3rem;
  font-weight: 300;
  color: var(--lt-text-muted);
  letter-spacing: 0.12em;
  opacity: 0.3;
}

.not-found__title {
  font-family: var(--lt-font-sans);
  font-size: 1.1rem;
  font-weight: 200;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  line-height: 1.6;
}

.not-found__desc {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  line-height: 1.7;
  max-width: 280px;
  letter-spacing: 0.02em;
}

.not-found__cta {
  margin-top: var(--lt-space-md);
  padding: 12px 28px;
  background: var(--lt-btn-primary-bg);
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-lg);
  color: var(--lt-text-strong);
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition:
    background 250ms ease,
    border-color 250ms ease,
    box-shadow 250ms ease;
}

.not-found__cta:hover {
  background: var(--lt-btn-primary-hover);
  border-color: var(--lt-btn-primary-hover-border);
  box-shadow: 0 0 20px rgba(77, 163, 255, 0.15);
}
</style>
