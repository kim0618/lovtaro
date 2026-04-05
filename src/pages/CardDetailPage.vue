<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import CardSymbol from '../components/cards/CardSymbol.vue'
import { getCardDetail } from '../data/cardDictionary.js'
import { getCardImage } from '../data/cardImages.js'

const route = useRoute()
const card = computed(() => getCardDetail(route.params.id))

useHead({
  title: () => card.value ? `${card.value.name}(${card.value.nameEn}) 타로 카드 의미 | Lovtaro` : '카드 상세 | Lovtaro',
  description: () => card.value ? `${card.value.name} 타로 카드의 정방향, 역방향 의미와 연애 해석. ${card.value.keywords.join(', ')}. Lovtaro 카드 의미 사전.` : '',
})

const cardImage = computed(() => card.value ? getCardImage(card.value.id) : null)
const energyLabel = { positive: '긍정적 에너지', neutral: '중립적 에너지', challenging: '도전적 에너지' }
</script>

<template>
  <AppShell>
    <template v-if="card">
      <!-- Hero: image bg + meta overlay -->
      <div class="card-detail__hero">
        <img v-if="cardImage" :src="cardImage" :alt="card.name" class="card-detail__bg-image" loading="eager" />
        <div class="card-detail__bg-overlay"></div>
        <div class="card-detail__hero-content">
          <div v-if="!cardImage" class="card-detail__fallback">
            <span class="card-detail__number">{{ card.number }}</span>
            <CardSymbol :card-id="card.id" :size="80" class="card-detail__symbol" />
          </div>
          <h1 class="card-detail__name">{{ card.name }}</h1>
          <p class="card-detail__name-en">{{ card.nameEn }}</p>
          <div class="card-detail__tags">
            <span class="card-detail__energy">{{ energyLabel[card.energy] }}</span>
            <span class="card-detail__element">{{ card.element }}</span>
          </div>
          <div class="card-detail__keywords">
            <span v-for="kw in card.keywords" :key="kw" class="card-detail__keyword">{{ kw }}</span>
          </div>
        </div>
      </div>

      <!-- 정방향 -->
      <SectionBlock spacing="sm">
        <div class="card-detail__section">
          <div class="card-detail__section-header">
            <span class="card-detail__direction card-detail__direction--upright">정방향</span>
          </div>
          <div class="card-detail__block">
            <h2 class="card-detail__block-title">핵심 의미</h2>
            <p class="card-detail__block-text">{{ card.upright.core }}</p>
          </div>
          <div class="card-detail__block">
            <h2 class="card-detail__block-title">연애 해석</h2>
            <p class="card-detail__block-text">{{ card.upright.love }}</p>
          </div>
          <div class="card-detail__advice">
            <p>{{ card.upright.advice }}</p>
          </div>
        </div>
      </SectionBlock>

      <!-- 역방향 -->
      <SectionBlock spacing="sm">
        <div class="card-detail__section">
          <div class="card-detail__section-header">
            <span class="card-detail__direction card-detail__direction--reversed">역방향</span>
          </div>
          <div class="card-detail__block">
            <h2 class="card-detail__block-title">핵심 의미</h2>
            <p class="card-detail__block-text">{{ card.reversed.core }}</p>
          </div>
          <div class="card-detail__block">
            <h2 class="card-detail__block-title">연애 해석</h2>
            <p class="card-detail__block-text">{{ card.reversed.love }}</p>
          </div>
          <div class="card-detail__advice">
            <p>{{ card.reversed.advice }}</p>
          </div>
        </div>
      </SectionBlock>

      <!-- 리딩 CTA -->
      <SectionBlock spacing="md">
        <div class="card-detail__cta">
          <p class="card-detail__cta-text">이 카드로 리딩을 받아보세요</p>
          <div class="card-detail__cta-links">
            <router-link to="/reading/mind" class="card-detail__cta-btn">상대방 속마음</router-link>
            <router-link to="/reading/love" class="card-detail__cta-btn">러브 타로</router-link>
            <router-link to="/today" class="card-detail__cta-btn">오늘의 카드</router-link>
          </div>
        </div>
      </SectionBlock>

      <!-- 다른 카드 -->
      <SectionBlock spacing="sm">
        <div class="card-detail__nav">
          <router-link to="/cards" class="card-detail__back">전체 카드 목록 보기</router-link>
        </div>
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="" />
      </SectionBlock>
    </template>

    <!-- 카드 없음 -->
    <template v-else>
      <PageContainer>
        <div class="card-detail__empty">
          <p>해당 카드를 찾을 수 없습니다.</p>
          <router-link to="/cards">카드 목록으로 돌아가기</router-link>
        </div>
      </PageContainer>
    </template>
  </AppShell>
</template>

<style scoped>
.card-detail__hero {
  position: relative;
  text-align: center;
  min-height: 480px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

/* Background image */
.card-detail__bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  z-index: 0;
}

/* Dark overlay gradient for readability */
.card-detail__bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to bottom,
    rgba(13, 17, 23, 0) 0%,
    rgba(13, 17, 23, 0.15) 30%,
    rgba(13, 17, 23, 0.6) 60%,
    rgba(13, 17, 23, 0.92) 80%,
    rgba(13, 17, 23, 1) 100%
  );
}

/* Content on top of image */
.card-detail__hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-lg);
}

/* Fallback (no image) */
.card-detail__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--lt-space-xl) 0;
}

.card-detail__number {
  font-family: var(--lt-font-display);
  font-size: 2.5rem;
  color: var(--lt-text-muted);
  opacity: 0.2;
  display: block;
  margin-bottom: var(--lt-space-xs);
}

.card-detail__symbol {
  color: var(--lt-accent-2, #4da3ff);
  opacity: 0.7;
  filter: drop-shadow(0 0 8px rgba(77, 163, 255, 0.35)) drop-shadow(0 0 20px rgba(77, 163, 255, 0.15));
}

.card-detail__name {
  font-size: 1.8rem;
  font-weight: 200;
  color: #fff;
  letter-spacing: 0.06em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

.card-detail__name-en {
  font-family: var(--lt-font-display);
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  margin-top: 4px;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}

.card-detail__tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: var(--lt-space-md);
}

.card-detail__energy,
.card-detail__element {
  font-size: 0.65rem;
  padding: 3px 10px;
  border-radius: var(--lt-radius-full);
  color: rgba(200, 220, 255, 0.9);
  background: rgba(77, 163, 255, 0.12);
  border: 1px solid rgba(77, 163, 255, 0.25);
  letter-spacing: 0.04em;
  backdrop-filter: blur(4px);
}

.card-detail__keywords {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: var(--lt-space-sm);
}

.card-detail__keyword {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.75);
  padding: 2px 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--lt-radius-sm);
  backdrop-filter: blur(4px);
}

/* Sections */
.card-detail__section {
  padding: 0 var(--lt-space-md);
}

.card-detail__section-header {
  margin-bottom: var(--lt-space-md);
}

.card-detail__direction {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  padding: 4px 12px;
  border-radius: var(--lt-radius-full);
}

.card-detail__direction--upright {
  color: rgba(100, 220, 180, 0.9);
  background: rgba(100, 220, 180, 0.08);
  border: 1px solid rgba(100, 220, 180, 0.2);
}

.card-detail__direction--reversed {
  color: rgba(255, 140, 100, 0.9);
  background: rgba(255, 140, 100, 0.08);
  border: 1px solid rgba(255, 140, 100, 0.2);
}

.card-detail__block {
  margin-bottom: var(--lt-space-lg);
}

.card-detail__block-title {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--lt-text-muted);
  letter-spacing: 0.08em;
  margin-bottom: var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.card-detail__block-text {
  font-size: 0.85rem;
  color: var(--lt-text-sub);
  line-height: 1.9;
  letter-spacing: 0.02em;
}

.card-detail__advice {
  padding: var(--lt-space-md);
  background: rgba(77, 163, 255, 0.04);
  border: 1px solid rgba(77, 163, 255, 0.1);
  border-radius: var(--lt-radius-lg);
  margin-bottom: var(--lt-space-sm);
}

.card-detail__advice p {
  font-size: 0.82rem;
  color: var(--lt-text);
  line-height: 1.8;
  text-align: center;
  letter-spacing: 0.02em;
}

/* CTA */
.card-detail__cta {
  text-align: center;
  padding: 0 var(--lt-space-md);
}

.card-detail__cta-text {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  margin-bottom: var(--lt-space-md);
  letter-spacing: 0.04em;
}

.card-detail__cta-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.card-detail__cta-btn {
  padding: 10px 18px;
  font-size: 0.78rem;
  color: var(--lt-text);
  background: var(--lt-btn-primary-bg);
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-md);
  text-decoration: none;
  letter-spacing: 0.03em;
  transition: background 200ms ease, border-color 200ms ease;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.card-detail__cta-btn:hover {
  background: var(--lt-btn-primary-hover);
  border-color: var(--lt-btn-primary-hover-border);
}

/* Nav */
.card-detail__nav {
  text-align: center;
}

.card-detail__back {
  font-size: 0.75rem;
  color: var(--lt-accent-2);
  text-decoration: underline;
  text-underline-offset: 3px;
  opacity: 0.7;
  transition: opacity 200ms ease;
}

.card-detail__back:hover {
  opacity: 1;
}

/* Empty */
.card-detail__empty {
  text-align: center;
  padding: var(--lt-space-2xl) var(--lt-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-md);
  align-items: center;
}

.card-detail__empty p {
  color: var(--lt-text-muted);
}

.card-detail__empty a {
  color: var(--lt-accent-2);
  text-decoration: underline;
}
</style>
