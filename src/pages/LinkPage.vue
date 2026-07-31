<script setup>
import { useRouter } from 'vue-router'
import { useHead } from '../composables/useHead.js'
import { trackEvent } from '../utils/gtag.js'
import { PRICE_FROM } from '../data/kmong.js'
import {
  KAKAO_OPENCHAT_URL,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  YOUTUBE_URL,
  YOUTUBE_HANDLE,
} from '../data/contact.js'

useHead({
  title: 'Lovtaro | 무료 연애 타로 리딩',
  description: '상대방 속마음, 재회 가능성, 연락 올까 타로, 러브타로 스프레드까지. 무료 연애 타로 리딩, Lovtaro.',
})

const router = useRouter()

// 순서는 GA4 실측 기준(2026-07-30). /link 진입 세션의 도달률에서 노이즈를 넘는 4개만 이동했다.
// 연락 올까(9→3)·재회(8→4)는 하단 자리에서도 상위 실적, 심리테스트(2→8)·궁합(5→9)은 그 반대.
// 중위권(러브타로·Yes/No·오늘의 카드)은 세션 차이가 표본 오차 안이라 건드리지 않는다.
const links = [
  { label: '1:1 편지 리딩', desc: `사연을 카드 3장으로 풀어 편지로 · ${PRICE_FROM}`, to: '/premium/', premium: true },
  { label: '상대방 속마음 타로', desc: '그 사람의 진짜 마음 읽기', to: '/reading/mind/', hot: true, featured: true },
  { label: '연락 올까 타로', desc: '연락의 기류가 있는지 확인', to: '/reading/contact/', hot: true, featured: true },
  { label: '재회 가능성 타로', desc: '다시 만날 수 있을까?', to: '/reading/reunion/', hot: true, featured: true },
  { label: '러브타로 스프레드', desc: '나의 마음 · 상대의 에너지 · 관계의 방향', to: '/reading/love/' },
  { label: 'Yes/No 타로', desc: '지금 궁금한 것, 카드가 답합니다', to: '/reading/yesno/' },
  { label: '오늘의 연애 카드', desc: '매일 한 장, 오늘의 연애 에너지', to: '/today/' },
  { label: '연애 심리테스트', desc: '이상형 · 전생 · 짝사랑 타로 테스트', to: '/test/', tag: 'NEW' },
  { label: '궁합 타로', desc: '두 사람의 케미와 궁합 점수 확인', to: '/reading/compatibility/' },
  { label: '3카드 리딩', desc: '과거 · 현재 · 미래 흐름 읽기', to: '/reading/3cards/' },
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
        :class="{ 'link-page__item--hot': link.featured, 'link-page__item--premium': link.premium }"
        @click="go(link)"
      >
        <div class="link-page__text">
          <span class="link-page__label">{{ link.label }}</span>
          <span class="link-page__desc">{{ link.desc }}</span>
        </div>
        <span v-if="link.premium" class="link-page__premium">프리미엄</span>
        <span v-else-if="link.hot" class="link-page__hot">HOT</span>
        <span v-else-if="link.tag" class="link-page__tag">{{ link.tag }}</span>
        <span class="link-page__arrow">&#8594;</span>
      </button>
    </div>

    <div class="link-page__social">
      <a :href="INSTAGRAM_URL" target="_blank" rel="noopener" class="link-page__social-btn link-page__social-btn--insta" @click="trackEvent('link_page_click', { label: 'instagram', to: 'instagram' })">
        <svg class="link-page__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
        <span>{{ INSTAGRAM_HANDLE }}</span>
      </a>
      <a :href="YOUTUBE_URL" target="_blank" rel="noopener" class="link-page__social-btn link-page__social-btn--yt" @click="trackEvent('link_page_click', { label: 'youtube', to: 'youtube' })">
        <svg class="link-page__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="4"/><polygon points="10,8.5 16,12 10,15.5" fill="currentColor" stroke="none"/></svg>
        <span>{{ YOUTUBE_HANDLE }}</span>
      </a>
    </div>

    <a
      :href="KAKAO_OPENCHAT_URL"
      target="_blank"
      rel="noopener"
      class="link-page__kakao"
      @click="trackEvent('link_page_click', { label: 'kakao_openchat', to: 'kakao_openchat' })"
    >
      <svg class="link-page__kakao-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3.5C6.94 3.5 2.84 6.72 2.84 10.7c0 2.53 1.68 4.75 4.2 6.02l-.9 3.3c-.08.3.25.54.51.37l3.95-2.6c.45.05.92.08 1.4.08 5.06 0 9.16-3.22 9.16-7.19S17.06 3.5 12 3.5z"/>
      </svg>
      <span class="link-page__kakao-text">
        <span class="link-page__kakao-label">문의하기</span>
        <span class="link-page__kakao-desc">카카오 오픈채팅 · 익명 가능</span>
      </span>
    </a>

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

.link-page__item--premium {
  border-color: rgba(200, 169, 110, 0.4);
  border-left-color: rgba(200, 169, 110, 0.4);
  background: linear-gradient(180deg, #0A1020 0%, #05070D 100%);
}

.link-page__item--premium:hover {
  border-color: rgba(200, 169, 110, 0.6);
  border-left-color: rgba(200, 169, 110, 0.6);
  box-shadow: 0 4px 24px rgba(200, 169, 110, 0.14), inset 0 0 20px rgba(200, 169, 110, 0.04);
}

.link-page__item--premium:hover .link-page__arrow {
  color: rgba(212, 169, 94, 1);
}

.link-page__premium {
  font-size: 0.52rem;
  font-weight: 600;
  color: #0A1020;
  background: linear-gradient(135deg, #E8D09A 0%, #C8A96E 100%);
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
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

.link-page__social {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: var(--lt-space-lg);
  width: 100%;
  max-width: 380px;
}

.link-page__social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 0;
  font-size: 0.78rem;
  border-radius: var(--lt-radius-md);
  text-decoration: none;
  letter-spacing: 0.04em;
  transition:
    border-color 250ms ease,
    color 250ms ease,
    background 250ms ease,
    opacity 250ms ease;
}

.link-page__social-btn--insta {
  color: rgba(225, 120, 160, 0.9);
  background: rgba(225, 120, 160, 0.06);
  border: 1px solid rgba(225, 120, 160, 0.18);
}

.link-page__social-btn--insta:hover {
  background: rgba(225, 120, 160, 0.12);
  border-color: rgba(225, 120, 160, 0.35);
}

.link-page__social-btn--yt {
  color: rgba(255, 80, 80, 0.9);
  background: rgba(255, 80, 80, 0.06);
  border: 1px solid rgba(255, 80, 80, 0.18);
}

.link-page__social-btn--yt:hover {
  background: rgba(255, 80, 80, 0.12);
  border-color: rgba(255, 80, 80, 0.35);
}

.link-page__social-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* 문의 창구. 프리미엄 골드 CTA와 경쟁하지 않도록 채도를 낮춰 보조 요소로 둔다 */
.link-page__kakao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 380px;
  margin-top: 10px;
  padding: 13px 16px;
  border-radius: var(--lt-radius-md);
  background: rgba(233, 199, 62, 0.05);
  border: 1px solid rgba(233, 199, 62, 0.16);
  text-decoration: none;
  transition:
    border-color 250ms ease,
    background 250ms ease;
}

.link-page__kakao:hover {
  background: rgba(233, 199, 62, 0.1);
  border-color: rgba(233, 199, 62, 0.32);
}

.link-page__kakao-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: rgba(233, 199, 62, 0.75);
}

.link-page__kakao-text {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.link-page__kakao-label {
  font-size: 0.78rem;
  color: var(--lt-text);
  letter-spacing: 0.04em;
}

.link-page__kakao-desc {
  font-size: 0.66rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.02em;
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
