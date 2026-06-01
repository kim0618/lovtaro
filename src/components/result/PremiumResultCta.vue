<script setup>
import { useRouter } from 'vue-router'
import { trackEvent } from '../../utils/gtag.js'

const props = defineProps({
  readingType: { type: String, default: '' },
})

const router = useRouter()

function goPremium() {
  trackEvent('cta_click', {
    cta_id: 'premium_result',
    destination: '/premium/',
    reading_type: props.readingType,
  })
  router.push('/premium/')
}
</script>

<template>
  <button class="premium-cta" @click="goPremium">
    <span class="premium-cta__label">프리미엄</span>
    <span class="premium-cta__title">마음이 더 깊게 얽혀 있다면</span>
    <p class="premium-cta__desc">
      무료 리딩은 한 장면을 비춰드려요. 풀리지 않는 사연이라면, 카드 3장으로 더 깊이 읽어 한 통의 편지로 담아드릴게요.
    </p>
    <span class="premium-cta__action">
      1:1 정밀 리딩 보기
      <span class="premium-cta__arrow" aria-hidden="true">&#8594;</span>
    </span>
    <span class="premium-cta__meta">사연 기반 · 5페이지 편지 · 19,900원</span>
  </button>
</template>

<style scoped>
.premium-cta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  padding: var(--lt-space-md) var(--lt-space-lg);
  border-radius: var(--lt-radius-lg);
  border: 1px solid rgba(200, 169, 110, 0.22);
  background: linear-gradient(170deg, rgba(40, 33, 20, 0.45) 0%, rgba(16, 22, 41, 0.55) 100%);
  position: relative;
  overflow: hidden;
  transition: border-color 300ms ease, box-shadow 300ms ease;
}

.premium-cta::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -20px;
  width: 200px;
  height: 140px;
  background: radial-gradient(ellipse, rgba(200, 169, 110, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.premium-cta:hover {
  border-color: rgba(200, 169, 110, 0.4);
  box-shadow: 0 0 24px rgba(200, 169, 110, 0.07);
}

.premium-cta__label {
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(200, 169, 110, 0.85);
}

.premium-cta__title {
  font-family: var(--lt-font-sans);
  font-size: 1rem;
  font-weight: 500;
  color: var(--lt-text-strong);
  letter-spacing: 0.01em;
}

.premium-cta__desc {
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--lt-text-muted);
}

.premium-cta__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--lt-space-xs);
  font-size: 0.9rem;
  color: rgba(200, 169, 110, 0.95);
  letter-spacing: 0.01em;
}

.premium-cta__arrow {
  transition: transform var(--lt-transition);
}

.premium-cta:hover .premium-cta__arrow {
  transform: translateX(3px);
}

.premium-cta__meta {
  font-size: 0.74rem;
  color: var(--lt-text-muted);
  opacity: 0.8;
}
</style>
