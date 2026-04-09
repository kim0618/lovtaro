<script setup>
import { useRouter } from 'vue-router'
import { useHead } from '../composables/useHead.js'
import { trackEvent } from '../utils/gtag.js'

useHead({
  title: 'Lovtaro | 무료 연애 타로 리딩',
  description: '상대방 속마음, 재회 가능성, 연락 올까 타로, 러브타로 스프레드까지. 무료 연애 타로 리딩, Lovtaro.',
})

const router = useRouter()

const links = [
  { label: '상대방 속마음 타로', desc: '그 사람의 진짜 마음 읽기', to: '/reading/mind', hot: true },
  { label: 'Yes/No 타로', desc: '지금 궁금한 것, 카드가 답합니다', to: '/reading/yesno', tag: 'NEW' },
  { label: '궁합 타로', desc: '두 사람의 케미와 궁합 점수 확인', to: '/reading/compatibility', tag: 'NEW' },
  { label: '러브타로 스프레드', desc: '나의 마음 · 상대의 에너지 · 관계의 방향', to: '/reading/love' },
  { label: '오늘의 연애 카드', desc: '매일 한 장, 오늘의 연애 에너지', to: '/today' },
  { label: '재회 가능성 타로', desc: '다시 만날 수 있을까?', to: '/reading/reunion' },
  { label: '연락 올까 타로', desc: '연락의 기류가 있는지 확인', to: '/reading/contact' },
  { label: '3카드 리딩', desc: '과거 · 현재 · 미래 흐름 읽기', to: '/reading/3cards' },
]

function go(link) {
  trackEvent('link_page_click', { label: link.label, to: link.to })
  router.push(link.to + '?utm_source=instagram&utm_medium=bio&utm_campaign=link_page')
}
</script>

<template>
  <div class="link-page">
    <div class="link-page__glow" aria-hidden="true" />

    <div class="link-page__header">
      <div class="link-page__logo">LOVTARO</div>
      <p class="link-page__tagline">감정의 흐름을 읽는 타로</p>
      <p class="link-page__sub">무료 연애 타로 리딩</p>
    </div>

    <div class="link-page__links">
      <button
        v-for="link in links"
        :key="link.to"
        class="link-page__item"
        :class="{ 'link-page__item--hot': link.hot }"
        @click="go(link)"
      >
        <div class="link-page__text">
          <span class="link-page__label">{{ link.label }}</span>
          <span class="link-page__desc">{{ link.desc }}</span>
        </div>
        <span v-if="link.hot" class="link-page__hot">HOT</span>
        <span v-else-if="link.tag" class="link-page__tag">{{ link.tag }}</span>
        <span class="link-page__arrow">&#8594;</span>
      </button>
    </div>

    <div class="link-page__footer">
      <p class="link-page__footer-text">lovtaro.kr</p>
    </div>
  </div>
</template>

<style scoped>
.link-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-lg);
  position: relative;
  overflow: hidden;
}

.link-page__glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(45, 108, 223, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.link-page__header {
  text-align: center;
  margin-bottom: var(--lt-space-xl);
  position: relative;
}

.link-page__logo {
  font-family: var(--lt-font-title);
  font-size: 1.3rem;
  font-weight: 400;
  letter-spacing: 0.5em;
  background: linear-gradient(135deg, #D4B87A 0%, #E8D09A 45%, #C8A96E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--lt-space-sm);
}

.link-page__tagline {
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.link-page__sub {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.06em;
}

.link-page__links {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.link-page__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: var(--lt-panel);
  border: 1px solid var(--lt-line-soft);
  border-left: 2px solid transparent;
  border-radius: var(--lt-radius-md);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 250ms ease,
    background 250ms ease,
    box-shadow 250ms ease,
    transform 250ms ease;
}

.link-page__item:hover {
  border-color: rgba(77, 163, 255, 0.35);
  border-left-color: var(--lt-accent-2);
  background: rgba(13, 21, 40, 0.95);
  box-shadow: 0 4px 24px rgba(77, 163, 255, 0.12), inset 0 0 20px rgba(77, 163, 255, 0.03);
  transform: translateY(-2px);
}

.link-page__item:active {
  transform: translateY(0) scale(0.98);
}

.link-page__item--hot {
  border-color: rgba(77, 163, 255, 0.25);
  background: linear-gradient(135deg, var(--lt-panel) 0%, rgba(45, 108, 223, 0.06) 100%);
}

.link-page__hot {
  font-size: 0.56rem;
  font-weight: 500;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  opacity: 0.7;
  flex-shrink: 0;
}

.link-page__tag {
  font-size: 0.52rem;
  font-weight: 500;
  color: var(--lt-accent-3);
  letter-spacing: 0.08em;
  opacity: 0.7;
  flex-shrink: 0;
}

.link-page__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.link-page__label {
  font-size: 0.88rem;
  color: var(--lt-text);
  font-weight: 400;
  letter-spacing: 0.02em;
  transition: color 250ms ease;
}

.link-page__item:hover .link-page__label {
  color: var(--lt-text-strong);
}

.link-page__desc {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  line-height: 1.4;
}

.link-page__arrow {
  font-size: 0.75rem;
  color: var(--lt-text-muted);
  flex-shrink: 0;
  transition: transform var(--lt-transition), color var(--lt-transition);
}

.link-page__item:hover .link-page__arrow {
  transform: translateX(3px);
  color: var(--lt-accent-2);
}

.link-page__footer {
  margin-top: auto;
  padding-top: var(--lt-space-xl);
  text-align: center;
}

.link-page__footer-text {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.1em;
  opacity: 0.5;
}
</style>
