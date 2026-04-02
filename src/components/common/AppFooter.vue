<script setup>
import BrandLogo from './BrandLogo.vue'
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <BrandLogo size="sm" />
      <p class="app-footer__tagline">보이지 않는 의미를 천천히 비추는 공간</p>
      <p class="app-footer__copy">&copy; 2026 Lovtaro. 타로 리딩은 참고용이며, 모든 결정은 본인의 판단을 따르세요.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--lt-border-soft);
  background-color: var(--lt-bg-0);
  margin-top: var(--lt-space-2xl);
}

.app-footer__inner {
  padding: var(--lt-space-xl) var(--lt-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
  align-items: center;
  text-align: center;
}

.app-footer__tagline {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
  opacity: 0.6;
}

.app-footer__copy {
  font-size: 0.65rem;
  color: var(--lt-text-muted);
  line-height: 1.7;
  opacity: 0.4;
  letter-spacing: 0.02em;
}
</style>
