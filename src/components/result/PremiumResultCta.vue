<script setup>
import { useRouter } from 'vue-router'
import { trackEvent } from '../../utils/gtag.js'
import { PRICE_FROM, KMONG_EBOOK, EBOOK_PRICE } from '../../data/kmong.js'

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

/* 전자책은 카드가 아니라 한 줄 링크다. 위 프리미엄 CTA와 같은 골드 카드를 두 개
   연속으로 쌓으면 2026-06-15에 결과 CTA를 미니멀화한 결정(리딩→CTA 클릭 1%)을
   그대로 되돌리게 된다. 카드는 하나만 두고, 가격에서 튕기는 사람용 보조 경로만 남긴다.
   반드시 진짜 <a href>. window.open으로 열면 GA4 향상된 측정이 아웃바운드 클릭을
   못 봐서 cta_id(맞춤측정기준 미등록)를 대신 읽어줄 신호가 없어진다. */
function trackEbookClick() {
  trackEvent('cta_click', {
    cta_id: 'ebook_result',
    destination: 'kmong',
    location: 'reading_result',
    reading_type: props.readingType,
  })
}
</script>

<template>
  <div class="premium-cta-group">
  <!-- 무료 리딩을 막 끝낸 사람에게 보이는 CTA. "더 깊게" 같은 모호한 말 대신
       무료(카드가 가진 뜻)와 유료(사연에 맞춰 쓴 편지)의 실제 차이를 적는다.
       리딩 완료 3,629건 대비 프리미엄 도달 1.4%가 이 문구에서 막혔다. -->
  <button class="premium-cta" :class="{ 'premium-cta--joined': KMONG_EBOOK.active }" @click="goPremium">
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

  <!-- 사연 쓰기 자체가 부담인 사람용 보조 경로. 카드가 아니라 위 카드 아래 변에
       붙는 한 줄 띠다. 떼어놓고 밑줄만 그으면 브라우저 기본 링크처럼 보여서 붙여
       하나의 부품으로 읽히게 한다(2026-08-24 렌더 실측 후 교체). -->
  <a
    v-if="KMONG_EBOOK.active"
    class="ebook-line"
    :href="KMONG_EBOOK.url"
    target="_blank"
    rel="noopener"
    @click="trackEbookClick"
  >
    <span class="ebook-line__text">사연 쓰지 않고 직접 찾아보기 · 전자책 {{ EBOOK_PRICE }}</span>
    <span class="ebook-line__arrow" aria-hidden="true">&#8594;</span>
  </a>
  </div>
</template>

<style scoped>
.premium-cta-group {
  display: flex;
  flex-direction: column;
}

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

/* 전자책 띠가 붙는 쪽 변만 연다. 두 요소가 테두리 하나를 공유해 한 부품으로 읽힌다. */
.premium-cta--joined {
  border-bottom-color: transparent;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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

/* 카드 아래 변에 붙는 띠. 테두리·radius를 위 카드와 이어 붙이고, 안쪽은 골드
   글로우 없이 어둡게 둬서 무게가 카드보다 확실히 아래에 오게 한다. 밑줄은 쓰지
   않는다(브라우저 기본 링크처럼 보였다). */
.ebook-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px var(--lt-space-md);
  text-decoration: none;
  font-size: 0.76rem;
  line-height: 1.4;
  letter-spacing: 0.02em;
  color: rgba(200, 169, 110, 0.78);
  border: 1px solid rgba(200, 169, 110, 0.22);
  border-top: 1px solid rgba(200, 169, 110, 0.14);
  border-bottom-left-radius: var(--lt-radius-lg);
  border-bottom-right-radius: var(--lt-radius-lg);
  background: rgba(6, 9, 18, 0.55);
  transition: color var(--lt-transition), background var(--lt-transition);
}

.ebook-line__arrow {
  flex-shrink: 0;
  font-size: 0.82rem;
  transition: transform var(--lt-transition);
}

.ebook-line:hover {
  color: var(--lt-text-strong);
  background: rgba(10, 16, 32, 0.7);
}

.ebook-line:hover .ebook-line__arrow {
  transform: translateX(3px);
}
</style>
