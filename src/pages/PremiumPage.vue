<script setup>
import { ref } from 'vue'
import { useHead, SITE_URL } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'

const KAKAO_OPENCHAT_URL = 'https://open.kakao.com/o/sLi7dqxi'

const PRICE = '19,900원'
const REPLY_HOURS = '48시간'

useHead({
  title: '1:1 정밀 리딩 | Lovtaro',
  description: '사연을 깊이 풀어 편지로 보내드리는 러브타로 1:1 정밀 리딩. 카드 3장 심층 해석, 48시간 이내 회신.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Lovtaro 1:1 정밀 리딩',
    description: '연애 사연을 카드 3장으로 풀어 A4 5페이지 편지로 회신하는 1:1 타로 리딩 서비스',
    provider: { '@type': 'Organization', name: 'Lovtaro', url: `${SITE_URL}/` },
    offers: {
      '@type': 'Offer',
      price: '19900',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    },
    inLanguage: 'ko',
    url: `${SITE_URL}/premium/`,
  },
})

const reasons = [
  {
    title: '무료 리딩으로 충분히 풀리지 않을 때',
    body: '카드 한두 장으로는 잡히지 않는 사연을 가지고 계신 분께.',
  },
  {
    title: '종합적인 흐름을 깊이 듣고 싶을 때',
    body: '과거-현재-미래의 마음을 한 호흡으로 정리해 드립니다.',
  },
  {
    title: '편지로 두고두고 꺼내보고 싶을 때',
    body: '오래 간직하며 마음이 흔들릴 때 다시 펼쳐볼 수 있어요.',
  },
  {
    title: '한 사람만을 위한 해석이 필요할 때',
    body: '오직 보내주신 사연에 맞춰 작성하는 단 한 통의 리딩입니다.',
  },
]

const deliverables = [
  { label: '편지', value: 'A4 5페이지 · 인쇄 가능' },
  { label: '카드', value: '3장 심층 해석 · 위치별 + 종합' },
  { label: '실행 가이드', value: '지금부터 할 수 있는 4가지' },
]

const steps = [
  {
    num: '01',
    title: '오픈채팅 입장',
    body: '아래 버튼으로 1:1 오픈채팅에 들어와 신청 의사를 남겨주세요.',
  },
  {
    num: '02',
    title: '사연 작성',
    body: '닉네임, 사연, 궁금한 점 1~2가지를 자유롭게 보내주세요.',
  },
  {
    num: '03',
    title: '카드 뽑기 확인',
    body: '사연을 토대로 카드 3장을 뽑은 모습을 사진으로 먼저 보여드려요.',
  },
  {
    num: '04',
    title: '결제 확인',
    body: '계좌이체로 진행해요. 결제 확인 후 작성이 시작됩니다.',
  },
  {
    num: '05',
    title: '결과 회신',
    body: '완성된 편지를 오픈채팅으로 보내드립니다.',
  },
]

const samples = [
  {
    src: '/images/premium/card-draw.jpg',
    alt: '러브타로 1:1 정밀 리딩 카드 3장 뽑기 미리보기',
    caption: '사연을 토대로 뽑은 카드 3장',
    full: true,
    square: true,
  },
]

const applyTemplate = `닉네임:
두 사람 관계 (예: 짝사랑 / 썸 / 연인 / 이별 후 / 재회 시도 / 친구):
관계 기간 (예: 6개월, 3년):
사연:
궁금한 점 (1~2가지):`

const copied = ref(false)
async function copyTemplate() {
  try {
    await navigator.clipboard.writeText(applyTemplate)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1800)
  } catch {
    // 클립보드 권한 거부 시 무시
  }
}

function openKakao() {
  window.open(KAKAO_OPENCHAT_URL, '_blank', 'noopener')
}
</script>

<template>
  <AppShell>
    <div class="premium-content">
    <PageContainer>
      <!-- ── Hero ───────────────────────────────────────── -->
      <div class="premium-hero">
        <div class="premium-hero__celestial" aria-hidden="true">
          <div class="premium-hero__star premium-hero__star--1" />
          <div class="premium-hero__star premium-hero__star--2" />
          <div class="premium-hero__star premium-hero__star--3" />
        </div>

        <p class="premium-hero__eyebrow">ONE TO ONE READING</p>
        <div class="premium-hero__ornament" aria-hidden="true">
          <span class="premium-hero__ornament-line" />
          <span class="premium-hero__ornament-star">✦</span>
          <span class="premium-hero__ornament-line" />
        </div>

        <h1 class="premium-hero__title">
          한 줄에 담기 어려운 마음을<br>
          <em>한 번에 깊이 풀어드립니다</em>
        </h1>
        <p class="premium-hero__subtitle">사연을 카드 3장으로 풀어 편지로 보내드립니다</p>

        <div class="premium-hero__divider" aria-hidden="true" />

        <button class="premium-hero__cta" type="button" @click="openKakao">
          오픈채팅으로 신청하기
        </button>

        <p class="premium-hero__meta">{{ PRICE }} · {{ REPLY_HOURS }} 이내 회신</p>
      </div>

      <!-- ── 이런 분께 추천 ───────────────────────────── -->
      <SectionBlock spacing="md">
        <h2 class="section-title">이런 분께 보내드려요</h2>
        <ul class="reason-list">
          <li v-for="(r, i) in reasons" :key="i" class="reason-list__item">
            <span class="reason-list__bullet" aria-hidden="true">✦</span>
            <div class="reason-list__copy">
              <p class="reason-list__title">{{ r.title }}</p>
              <p class="reason-list__body">{{ r.body }}</p>
            </div>
          </li>
        </ul>
      </SectionBlock>

      <!-- ── 무엇을 받으시나요 ────────────────────────── -->
      <SectionBlock spacing="md">
        <h2 class="section-title">무엇을 받으시나요</h2>
        <div class="deliver-card">
          <dl class="deliver-list">
            <div v-for="(d, i) in deliverables" :key="i" class="deliver-list__row">
              <dt class="deliver-list__label">{{ d.label }}</dt>
              <dd class="deliver-list__value">{{ d.value }}</dd>
            </div>
          </dl>
        </div>
      </SectionBlock>

      <!-- ── 어떻게 진행되나요 ────────────────────────── -->
      <SectionBlock spacing="md">
        <h2 class="section-title">어떻게 진행되나요</h2>
        <ol class="step-list">
          <li v-for="s in steps" :key="s.num" class="step-list__item">
            <span class="step-list__num">{{ s.num }}</span>
            <div class="step-list__copy">
              <p class="step-list__title">{{ s.title }}</p>
              <p class="step-list__body">{{ s.body }}</p>
            </div>
          </li>
        </ol>
      </SectionBlock>

      <!-- ── 샘플 미리보기 ────────────────────────────── -->
      <SectionBlock spacing="md">
        <h2 class="section-title">샘플 미리보기</h2>
        <p class="section-sub">실제로 이렇게 카드를 펼쳐 보여드려요</p>
        <div class="sample-grid">
          <div
            v-for="(s, i) in samples"
            :key="i"
            class="sample-grid__item"
            :class="{ 'sample-grid__item--full': s.full }"
          >
            <div class="sample-grid__frame" :class="{ 'sample-grid__frame--square': s.square }">
              <img :src="s.src" :alt="s.alt" loading="lazy" />
            </div>
            <p class="sample-grid__caption">{{ s.caption }}</p>
          </div>
        </div>
      </SectionBlock>

      <!-- ── 신청 양식 ────────────────────────────────── -->
      <SectionBlock spacing="md">
        <h2 class="section-title">신청 양식</h2>
        <p class="section-sub">오픈채팅 입장 후, 아래 양식을 복사해 보내주세요</p>
        <div class="apply-box">
          <pre class="apply-box__template">{{ applyTemplate }}</pre>
          <button class="apply-box__copy" type="button" @click="copyTemplate">
            {{ copied ? '복사됨 ✓' : '양식 복사하기' }}
          </button>
        </div>
      </SectionBlock>

      <!-- ── 운영자 메시지 ────────────────────────────── -->
      <SectionBlock spacing="md">
        <div class="writer-note">
          <p class="writer-note__eyebrow">한 통의 편지를 준비하는 마음</p>
          <p class="writer-note__body">사연을 받으면 카드를 마음에 두고 천천히 풀어요.<br>단정하기보다 마음의 결을 비춰드릴게요.</p>
        </div>
      </SectionBlock>

      <!-- ── 마지막 CTA ───────────────────────────────── -->
      <SectionBlock spacing="md">
        <div class="final-cta">
          <p class="final-cta__eyebrow">READY?</p>
          <h2 class="final-cta__title">사연을 들려주세요</h2>
          <p class="final-cta__body">결제는 사연을 받은 뒤 안내해 드려요.<br>부담 없이 들러주셔도 괜찮습니다.</p>
          <button class="final-cta__btn" type="button" @click="openKakao">
            오픈채팅으로 신청하기
          </button>
        </div>
      </SectionBlock>

      <!-- ── 면책 / 정책 ──────────────────────────────── -->
      <SectionBlock spacing="md">
        <div class="notice-block">
          <p class="notice-block__line"><strong>환불</strong> 결제 후 작성 시작 전까지 100% 환불, 작성 시작 후에는 환불이 어렵습니다.</p>
          <p class="notice-block__line"><strong>개인정보</strong> 보내주신 사연과 결과물은 동의 없이 외부에 공개되지 않습니다.</p>
          <p class="notice-block__line"><strong>면책</strong> 타로 리딩은 자기 성찰을 위한 참고 자료이며, 중요한 결정은 신중히 판단해 주세요. 자세한 내용은 <router-link to="/disclaimer/">면책 조항</router-link>을 참고해 주세요.</p>
        </div>
      </SectionBlock>
    </PageContainer>
    </div>
  </AppShell>
</template>

<style scoped>
.premium-content {
  position: relative;
  z-index: 1;
}

/* ── Hero ─────────────────────────────────────────── */
.premium-hero {
  text-align: center;
  padding: var(--lt-space-2xl) var(--lt-space-md) calc(var(--lt-space-xl) + 8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-sm);
  position: relative;
  overflow: hidden;
}

.premium-hero__celestial {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.premium-hero__celestial::before {
  content: '';
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(200, 169, 110, 0.06) 0%, rgba(77, 163, 255, 0.03) 40%, transparent 70%);
}

.premium-hero__star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: rgba(200, 169, 110, 0.5);
  animation: lt-shimmer 4s ease-in-out infinite;
}

.premium-hero__star--1 { top: 18%; left: 22%; animation-delay: 0s; }
.premium-hero__star--2 { top: 30%; right: 18%; animation-delay: 1.5s; }
.premium-hero__star--3 { top: 55%; left: 35%; width: 1.5px; height: 1.5px; animation-delay: 3s; }

.premium-hero__eyebrow {
  font-size: 0.62rem;
  letter-spacing: 0.3em;
  color: var(--lt-text-muted);
  font-family: var(--lt-font-display);
  font-style: italic;
  opacity: 0.85;
  position: relative;
}

.premium-hero__ornament {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: var(--lt-space-sm) 0 0;
  position: relative;
}

.premium-hero__ornament-line {
  display: block;
  width: 38px;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(200, 169, 110, 0.4), transparent);
}

.premium-hero__ornament-star {
  font-size: 0.6rem;
  color: rgba(200, 169, 110, 0.7);
  animation: lt-shimmer 3s ease-in-out infinite;
}

.premium-hero__title {
  font-size: 1.65rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  line-height: 1.4;
  margin: var(--lt-space-sm) 0 0;
  letter-spacing: -0.01em;
  position: relative;
}

.premium-hero__title em {
  font-style: normal;
  background: linear-gradient(135deg, #D4B87A 0%, #C8A96E 40%, #A88B58 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.premium-hero__subtitle {
  font-size: 0.85rem;
  color: var(--lt-text-muted);
  margin-bottom: var(--lt-space-xs);
  letter-spacing: 0.04em;
  position: relative;
  max-width: 320px;
  line-height: 1.6;
}

.premium-hero__divider {
  width: 1px;
  height: 36px;
  background: linear-gradient(to bottom, transparent, rgba(200, 169, 110, 0.35), transparent);
  margin: var(--lt-space-sm) 0;
}

.premium-hero__cta {
  margin-top: var(--lt-space-xs);
  padding: 13px 36px;
  background: var(--lt-btn-primary-bg);
  color: #F4F8FF;
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-sm);
  font-size: 0.82rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  position: relative;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(45, 108, 223, 0.2);
  transition: background var(--lt-transition), box-shadow var(--lt-transition), transform var(--lt-transition);
}

.premium-hero__cta:hover {
  background: var(--lt-btn-primary-hover);
  box-shadow: 0 6px 28px rgba(45, 108, 223, 0.3), 0 0 0 1px rgba(77, 163, 255, 0.15);
  transform: translateY(-1px);
}

.premium-hero__cta:active {
  transform: scale(0.97);
}

.premium-hero__meta {
  margin-top: var(--lt-space-sm);
  font-size: 0.7rem;
  color: rgba(200, 169, 110, 0.7);
  letter-spacing: 0.1em;
  position: relative;
}

/* ── Section title ────────────────────────────────── */
.section-title {
  font-family: var(--lt-font-sans);
  font-size: 1rem;
  font-weight: 400;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  text-align: center;
  margin: 0 0 var(--lt-space-md);
}

.section-sub {
  font-size: 0.74rem;
  color: var(--lt-text-muted);
  text-align: center;
  letter-spacing: 0.04em;
  margin: calc(-1 * var(--lt-space-sm)) 0 var(--lt-space-md);
}

/* ── Reasons list ─────────────────────────────────── */
.reason-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-md);
}

.reason-list__item {
  display: flex;
  gap: 12px;
  padding: var(--lt-space-md);
  background: var(--lt-panel);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-md);
}

.reason-list__bullet {
  color: rgba(200, 169, 110, 0.7);
  font-size: 0.7rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.reason-list__title {
  font-size: 0.88rem;
  color: var(--lt-text-strong);
  font-weight: 400;
  margin: 0 0 4px;
  letter-spacing: 0.01em;
}

.reason-list__body {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.6;
  margin: 0;
}

/* ── Deliverables ─────────────────────────────────── */
.deliver-card {
  background: var(--lt-panel-2);
  border: 1px solid rgba(200, 169, 110, 0.18);
  border-radius: var(--lt-radius-md);
  padding: var(--lt-space-md) var(--lt-space-lg);
  box-shadow: var(--lt-shadow-card);
}

.deliver-list {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.deliver-list__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--lt-border-soft);
}

.deliver-list__row:last-child {
  border-bottom: none;
}

.deliver-list__label {
  font-size: 0.74rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

.deliver-list__value {
  font-size: 0.82rem;
  color: var(--lt-text-strong);
  font-weight: 400;
  text-align: right;
  margin: 0;
}

/* ── Steps ────────────────────────────────────────── */
.step-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.step-list__item {
  display: flex;
  gap: var(--lt-space-md);
  padding: var(--lt-space-md) 0;
  border-bottom: 1px solid var(--lt-border-soft);
}

.step-list__item:last-child {
  border-bottom: none;
}

.step-list__num {
  font-family: var(--lt-font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: rgba(200, 169, 110, 0.7);
  letter-spacing: 0.02em;
  flex-shrink: 0;
  width: 32px;
  line-height: 1;
  padding-top: 2px;
}

.step-list__title {
  font-size: 0.9rem;
  color: var(--lt-text-strong);
  font-weight: 400;
  margin: 0 0 4px;
}

.step-list__body {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.6;
  margin: 0;
}

/* ── Sample preview ───────────────────────────────── */
.sample-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--lt-space-md);
}

.sample-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sample-grid__item--full {
  grid-column: 1 / -1;
}

.sample-grid__frame {
  width: 100%;
  aspect-ratio: 1 / 1.414;
  border: 1px solid rgba(200, 169, 110, 0.25);
  border-radius: var(--lt-radius-sm);
  overflow: hidden;
  position: relative;
  box-shadow: var(--lt-shadow-card);
  background: var(--lt-bg-1);
}

.sample-grid__frame--square {
  aspect-ratio: 1 / 1;
  max-width: 88%;
  margin: 0 auto;
}

.sample-grid__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

.sample-grid__frame::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 75%, rgba(5, 7, 13, 0.4) 100%);
  pointer-events: none;
}

.sample-grid__caption {
  font-size: 0.7rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.06em;
  margin: 0;
}

/* ── Apply box ────────────────────────────────────── */
.apply-box {
  background: var(--lt-bg-1);
  border: 1px solid var(--lt-border);
  border-radius: var(--lt-radius-md);
  padding: var(--lt-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-md);
}

.apply-box__template {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.8rem;
  color: var(--lt-text);
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
}

.apply-box__copy {
  align-self: flex-start;
  padding: 8px 20px;
  background: transparent;
  color: rgba(200, 169, 110, 0.85);
  border: 1px solid rgba(200, 169, 110, 0.4);
  border-radius: var(--lt-radius-sm);
  font-size: 0.74rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all var(--lt-transition);
}

.apply-box__copy:hover {
  color: rgba(200, 169, 110, 1);
  border-color: rgba(200, 169, 110, 0.7);
  background: rgba(200, 169, 110, 0.05);
}

/* ── Writer note ──────────────────────────────────── */
.writer-note {
  text-align: center;
  padding: var(--lt-space-lg) var(--lt-space-md);
  border-top: 1px solid rgba(200, 169, 110, 0.18);
  border-bottom: 1px solid rgba(200, 169, 110, 0.18);
  max-width: 360px;
  margin: 0 auto;
}

.writer-note__eyebrow {
  font-size: 0.72rem;
  color: rgba(200, 169, 110, 0.85);
  letter-spacing: 0.18em;
  margin: 0 0 var(--lt-space-md);
}

.writer-note__body {
  font-size: 0.9rem;
  color: var(--lt-text);
  line-height: 1.9;
  margin: 0;
}

/* ── Final CTA ────────────────────────────────────── */
.final-cta {
  text-align: center;
  padding: var(--lt-space-xl) var(--lt-space-md);
  background: var(--lt-panel-2);
  border: 1px solid rgba(200, 169, 110, 0.2);
  border-radius: var(--lt-radius-lg);
  box-shadow: var(--lt-shadow-card);
}

.final-cta__eyebrow {
  font-family: var(--lt-font-display);
  font-style: italic;
  font-size: 0.62rem;
  letter-spacing: 0.3em;
  color: rgba(200, 169, 110, 0.75);
  margin: 0 0 var(--lt-space-sm);
}

.final-cta__title {
  font-size: 1.3rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  margin: 0 0 var(--lt-space-sm);
  letter-spacing: -0.01em;
}

.final-cta__body {
  font-size: 0.8rem;
  color: var(--lt-text-sub);
  line-height: 1.6;
  margin: 0 auto var(--lt-space-lg);
  max-width: 280px;
}

.final-cta__btn {
  padding: 13px 36px;
  background: var(--lt-btn-primary-bg);
  color: #F4F8FF;
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-sm);
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(45, 108, 223, 0.2);
  transition: background var(--lt-transition), box-shadow var(--lt-transition), transform var(--lt-transition);
}

.final-cta__btn:hover {
  background: var(--lt-btn-primary-hover);
  box-shadow: 0 6px 28px rgba(45, 108, 223, 0.3);
  transform: translateY(-1px);
}

.final-cta__btn:active {
  transform: scale(0.97);
}

/* ── Notice block ─────────────────────────────────── */
.notice-block {
  background: var(--lt-panel);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-md);
  padding: var(--lt-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
}

.notice-block__line {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  line-height: 1.6;
  margin: 0;
}

.notice-block__line strong {
  color: var(--lt-text-sub);
  font-weight: 500;
  margin-right: 6px;
}

.notice-block__line :deep(a) {
  color: rgba(200, 169, 110, 0.8);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

/* ── 모든 섹션 박스: image#1 우주 배경 느낌 (깊은 네이비 + 골드 글로우) ── */
.reason-list__item,
.deliver-card,
.apply-box,
.final-cta,
.notice-block {
  background: linear-gradient(180deg, #0A1020 0%, #05070D 100%);
}

/* ── Mobile fine tune ─────────────────────────────── */
@media (max-width: 360px) {
  .premium-hero__title {
    font-size: 1.45rem;
  }
  .deliver-card {
    padding: var(--lt-space-md);
  }
}
</style>
