<script setup>
import { useRouter } from 'vue-router'
import { trackEvent } from '../../utils/gtag.js'
import { PRICE_FROM } from '../../data/kmong.js'

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
  <!-- 무료 리딩을 막 끝낸 사람에게 보이는 CTA. "더 깊게" 같은 모호한 말 대신
       무료(카드가 가진 뜻)와 유료(사연에 맞춰 쓴 편지)의 실제 차이를 적는다.
       리딩 완료 3,629건 대비 프리미엄 도달 1.4%가 이 문구에서 막혔다. -->
  <button class="premium-cta" @click="goPremium">
    <span class="premium-cta__label">프리미엄 · 1:1 편지 리딩</span>
    <span class="premium-cta__title">같은 카드도 사연을 알면 다르게 읽혀요</span>
    <span class="premium-cta__desc">
      지금 보신 해석은 카드가 가진 뜻이에요.
      사연을 보내주시면 그 이야기에 맞춰 편지를 씁니다.
    </span>
    <span class="premium-cta__foot">
      <span class="premium-cta__meta">{{ PRICE_FROM }} · 48시간 이내 회신</span>
      <span class="premium-cta__arrow" aria-hidden="true">&#8594;</span>
    </span>
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
  line-height: 1.5;
}

.premium-cta__desc {
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--lt-text-muted);
  margin-top: 2px;
}

/* 가격·회신 안내와 화살표를 한 줄에 양끝으로. 화살표를 제목에 붙여두면
   제목이 길어질 때 혼자 다음 줄로 떨어진다. */
.premium-cta__foot {
  display: flex;
  width: 100%;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: var(--lt-space-xs);
}

.premium-cta__meta {
  font-size: 0.74rem;
  color: rgba(200, 169, 110, 0.8);
  letter-spacing: 0.04em;
}

.premium-cta__arrow {
  font-size: 0.9rem;
  color: rgba(200, 169, 110, 0.95);
  flex-shrink: 0;
  transition: transform var(--lt-transition);
}

.premium-cta:hover .premium-cta__arrow {
  transform: translateX(3px);
}
</style>
