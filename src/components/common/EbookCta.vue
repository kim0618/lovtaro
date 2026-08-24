<script setup>
import { trackEvent } from '../../utils/gtag.js'
import { KMONG_EBOOK, EBOOK_PRICE } from '../../data/kmong.js'
import { topic } from '../../utils/josa.js'

const props = defineProps({
  /** 카드 상세에서 쓸 때 어떤 카드에서 눌렸는지. 없으면 일반 문구로 나간다. */
  cardName: { type: String, default: '' },
  cardId: { type: String, default: '' },
  location: { type: String, default: 'card_detail' },
})

/* 이동은 앵커가 한다. window.open으로 열면 GA4 향상된 측정이 아웃바운드 클릭을 못 봐서
   linkUrl 기반 집계가 통째로 비고, cta_id는 맞춤측정기준 미등록이라 대신 읽어줄 신호가
   없다(.claude/rules/analytics.md). 여기서는 이벤트만 쏜다. */
function trackClick() {
  trackEvent('cta_click', {
    cta_id: 'ebook_kmong',
    destination: 'kmong',
    location: props.location,
    card_id: props.cardId,
  })
}
</script>

<template>
  <!-- 카드 상세 하단의 유료 전환점. 이 페이지가 주는 것(카드 한 장의 일반 의미)과
       책이 주는 것(그 카드를 관계 상태별로 나눠 읽은 해석 + 78장 한 권)의 차이를
       그대로 적는다. "사이트에 없는 내용"은 사실이 아니므로 쓰지 않는다.
       바로 아래 무료 리딩 CTA가 "이 카드가 지금 내 연애에선?"이라고 물으므로 여기서
       같은 질문을 반복하지 않는다. 책이 파는 건 질문이 아니라 찾아보는 완전성이다. -->
  <a
    :href="KMONG_EBOOK.url"
    target="_blank"
    rel="noopener"
    class="ebook-cta"
    @click="trackClick"
  >
    <span class="ebook-cta__label">전자책 · 그 사람 마음 사전</span>
    <span class="ebook-cta__title">
      <template v-if="cardName">{{ topic(cardName) }} 솔로 · 썸 · 연애 중 · 이별 후에 각각 다르게 읽혀요</template>
      <template v-else>같은 카드도 솔로 · 썸 · 연애 중 · 이별 후에 다르게 읽혀요</template>
    </span>
    <span class="ebook-cta__desc">
      이 페이지는 카드 한 장이 가진 뜻이에요.
      책에는 78장을 네 가지 관계 상태로 나눠 읽은 {{ KMONG_EBOOK.entries }}가지 해석을
      한 권에 모았어요. 카드를 뽑을 때마다 찾아보는 사전으로 만들었어요.
    </span>
    <span class="ebook-cta__foot">
      <span class="ebook-cta__meta">PDF {{ KMONG_EBOOK.pages }}페이지 · {{ EBOOK_PRICE }}</span>
      <span class="ebook-cta__arrow" aria-hidden="true">&#8594;</span>
    </span>
  </a>
</template>

<style scoped>
/* 골드는 프리미엄(유료) 전용. 위쪽 무료 리딩 CTA와 색으로 구분된다.
   <button>이 아니라 <a>이므로 display·text-align·line-height를 직접 잡아야
   padding과 줄간격이 버튼과 같아진다(analytics.md 참조). */
.ebook-cta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  text-align: left;
  line-height: normal;
  text-decoration: none;
  cursor: pointer;
  padding: var(--lt-space-md) var(--lt-space-lg);
  border-radius: var(--lt-radius-lg);
  border: 1px solid rgba(200, 169, 110, 0.22);
  background: linear-gradient(170deg, rgba(40, 33, 20, 0.45) 0%, rgba(16, 22, 41, 0.55) 100%);
  position: relative;
  overflow: hidden;
  transition: border-color 300ms ease, box-shadow 300ms ease;
}

.ebook-cta::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -20px;
  width: 200px;
  height: 140px;
  background: radial-gradient(ellipse, rgba(200, 169, 110, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.ebook-cta:hover {
  border-color: rgba(200, 169, 110, 0.4);
  box-shadow: 0 0 24px rgba(200, 169, 110, 0.07);
}

.ebook-cta__label {
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  color: rgba(200, 169, 110, 0.85);
}

.ebook-cta__title {
  font-family: var(--lt-font-sans);
  font-size: 1rem;
  font-weight: 500;
  color: var(--lt-text-strong);
  letter-spacing: 0.01em;
  line-height: 1.5;
}

.ebook-cta__desc {
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--lt-text-muted);
  word-break: keep-all;
  margin-top: 2px;
}

.ebook-cta__foot {
  display: flex;
  width: 100%;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: var(--lt-space-xs);
}

.ebook-cta__meta {
  font-size: 0.74rem;
  color: rgba(200, 169, 110, 0.8);
  letter-spacing: 0.04em;
}

.ebook-cta__arrow {
  font-size: 0.9rem;
  color: rgba(200, 169, 110, 0.95);
  flex-shrink: 0;
  transition: transform var(--lt-transition);
}

.ebook-cta:hover .ebook-cta__arrow {
  transform: translateX(3px);
}
</style>
