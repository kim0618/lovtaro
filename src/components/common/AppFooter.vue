<script setup>
import BrandLogo from './BrandLogo.vue'
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <BrandLogo size="sm" />
      <p class="app-footer__tagline">보이지 않는 의미를 천천히 비추는 공간</p>
      <p class="app-footer__copy">&copy; 2026 Lovtaro. 타로 리딩은 오락 및 자기 성찰 목적이며, 전문 상담을 대체하지 않습니다.</p>
      <div class="app-footer__links app-footer__links--main">
        <router-link to="/about/" class="app-footer__link app-footer__link--main">소개</router-link>
        <router-link to="/contact/" class="app-footer__link app-footer__link--main">문의</router-link>
      </div>
      <div class="app-footer__links">
        <router-link to="/editorial-policy/" class="app-footer__link">편집 방침</router-link>
        <router-link to="/disclaimer/" class="app-footer__link">면책 조항</router-link>
        <router-link to="/privacy/" class="app-footer__link">개인정보처리방침</router-link>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--lt-border-soft);
  background-color: var(--lt-bg-0);
  margin-top: var(--lt-space-lg);
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

.app-footer__links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.app-footer__links--main {
  gap: 20px;
}

.app-footer__link {
  font-size: 0.62rem;
  color: var(--lt-text-muted);
  opacity: 0.4;
  text-decoration: underline;
  text-underline-offset: 2px;
  letter-spacing: 0.02em;
  transition: opacity var(--lt-transition);
}

.app-footer__link--main {
  font-size: 0.72rem;
  opacity: 0.65;
  text-decoration: none;
}

.app-footer__link:hover {
  opacity: 0.85;
}
</style>
