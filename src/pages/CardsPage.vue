<script setup>
import { ref, computed } from 'vue'
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import CardSymbol from '../components/cards/CardSymbol.vue'
import { getAllCards } from '../data/cardDictionary.js'
import { getCardImage } from '../data/cardImages.js'

const allCards = getAllCards()

useHead({
  title: '타로 카드 의미 사전 - 22장 메이저 아르카나 해석 | Lovtaro',
  description: '타로 메이저 아르카나 22장의 정방향, 역방향 의미와 연애 해석을 확인하세요. 바보, 마법사, 여사제, 여황제, 황제, 교황, 연인, 전차, 힘, 은둔자, 운명의 수레바퀴, 정의, 매달린 사람, 죽음, 절제, 악마, 탑, 별, 달, 태양, 심판, 세계.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '타로 카드 의미 사전',
    description: '메이저 아르카나 22장의 정방향, 역방향 의미와 연애 해석',
    numberOfItems: 22,
    itemListElement: allCards.map((card, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${card.name} (${card.nameEn})`,
      url: `https://lovtaro.kr/cards/${card.id}`,
    })),
  },
})

const activeFilter = ref('all')

const filters = [
  { key: 'all', label: '전체' },
  { key: 'positive', label: '긍정' },
  { key: 'neutral', label: '중립' },
  { key: 'challenging', label: '도전' },
]

const cards = computed(() => {
  if (activeFilter.value === 'all') return allCards
  return allCards.filter(c => c.energy === activeFilter.value)
})

const energyLabel = {
  positive: '긍정',
  neutral: '중립',
  challenging: '도전',
}

const energyClass = {
  positive: 'cards-grid__energy--positive',
  neutral: 'cards-grid__energy--neutral',
  challenging: 'cards-grid__energy--challenging',
}

const energyBorder = {
  positive: 'cards-grid__item--positive',
  neutral: 'cards-grid__item--neutral',
  challenging: 'cards-grid__item--challenging',
}
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="cards-header">
        <h1 class="cards-header__title">타로 카드 의미 사전</h1>
        <p class="cards-header__sub">22장의 메이저 아르카나가 품고 있는 이야기를 확인하세요</p>
      </div>
    </PageContainer>

    <!-- Filter tabs -->
    <div class="cards-filter">
      <button
        v-for="f in filters"
        :key="f.key"
        :class="['cards-filter__btn', { 'cards-filter__btn--active': activeFilter === f.key }]"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <SectionBlock spacing="sm">
      <div class="cards-grid">
        <router-link
          v-for="(card, idx) in cards"
          :key="card.id"
          :to="`/cards/${card.id}`"
          :class="['cards-grid__item', energyBorder[card.energy]]"
          :style="{ animationDelay: `${idx * 60}ms` }"
        >
          <!-- Card image or fallback -->
          <div class="cards-grid__visual">
            <img
              v-if="getCardImage(card.id)"
              :src="getCardImage(card.id)"
              :alt="card.name"
              class="cards-grid__thumb"
              loading="lazy"
              @error="$event.target.style.display='none'"
            />
            <template v-else>
              <span class="cards-grid__watermark" aria-hidden="true">{{ card.number }}</span>
              <CardSymbol :card-id="card.id" :size="36" class="cards-grid__symbol" />
            </template>
          </div>
          <div class="cards-grid__info">
            <div class="cards-grid__top">
              <span class="cards-grid__name">{{ card.name }}</span>
              <span :class="['cards-grid__energy', energyClass[card.energy]]">{{ energyLabel[card.energy] }}</span>
            </div>
            <span class="cards-grid__name-en">{{ card.nameEn }}</span>
            <div class="cards-grid__keywords">
              <span v-for="kw in card.keywords" :key="kw" class="cards-grid__keyword">{{ kw }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </SectionBlock>
  </AppShell>
</template>

<style scoped>
.cards-header {
  text-align: center;
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-lg);
}

.cards-header__title {
  font-size: 1.4rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  margin-bottom: 6px;
}

.cards-header__sub {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
}

/* ── Filter tabs ── */
.cards-filter {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 var(--lt-space-md) var(--lt-space-md);
}

.cards-filter__btn {
  font-size: 0.7rem;
  padding: 6px 16px;
  border-radius: var(--lt-radius-full);
  color: var(--lt-text-muted);
  border: 1px solid var(--lt-border-soft);
  background: transparent;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 250ms ease;
}

.cards-filter__btn:hover {
  border-color: rgba(77, 163, 255, 0.2);
  color: var(--lt-text-sub);
}

.cards-filter__btn--active {
  color: var(--lt-accent-2);
  border-color: rgba(77, 163, 255, 0.4);
  background: rgba(77, 163, 255, 0.08);
}

/* ── 2-column grid ── */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 var(--lt-space-md);
}

.cards-grid__item {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--lt-panel);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-lg);
  text-decoration: none;
  overflow: hidden;
  transition: border-color 250ms ease, box-shadow 250ms ease, transform 250ms ease;
  animation: cardFadeIn 400ms ease both;
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.cards-grid__item:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: rgba(77, 163, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(77, 163, 255, 0.15);
}

.cards-grid__item--positive:hover {
  border-color: rgba(100, 220, 180, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(100, 220, 180, 0.2);
}

.cards-grid__item--neutral:hover {
  border-color: rgba(77, 163, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(77, 163, 255, 0.2);
}

.cards-grid__item--challenging:hover {
  border-color: rgba(255, 140, 100, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 140, 100, 0.2);
}

/* Visual area (image or fallback) */
.cards-grid__visual {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: rgba(77, 163, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cards-grid__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms ease;
}

.cards-grid__item:hover .cards-grid__thumb {
  transform: scale(1.05);
}

/* Watermark (fallback only) */
.cards-grid__watermark {
  position: absolute;
  font-family: var(--lt-font-display);
  font-size: 3rem;
  color: var(--lt-text-muted);
  opacity: 0.08;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

.cards-grid__item--positive .cards-grid__watermark {
  color: rgba(100, 220, 180, 0.9);
}

.cards-grid__item--neutral .cards-grid__watermark {
  color: rgba(77, 163, 255, 0.9);
}

.cards-grid__item--challenging .cards-grid__watermark {
  color: rgba(255, 140, 100, 0.9);
}

.cards-grid__symbol {
  color: var(--lt-text-muted);
  opacity: 0.15;
  pointer-events: none;
  filter: drop-shadow(0 0 4px rgba(77, 163, 255, 0.2));
}

/* Info area */
.cards-grid__info {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cards-grid__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.cards-grid__name {
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text-strong);
  letter-spacing: 0.03em;
}

.cards-grid__name-en {
  font-family: var(--lt-font-display);
  font-size: 0.62rem;
  color: var(--lt-text-muted);
  font-style: italic;
  opacity: 0.7;
}

.cards-grid__energy {
  font-size: 0.5rem;
  padding: 2px 6px;
  border-radius: var(--lt-radius-full);
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

.cards-grid__energy--positive {
  color: rgba(100, 220, 180, 0.9);
  background: rgba(100, 220, 180, 0.08);
  border: 1px solid rgba(100, 220, 180, 0.15);
}

.cards-grid__energy--neutral {
  color: rgba(77, 163, 255, 0.9);
  background: rgba(77, 163, 255, 0.08);
  border: 1px solid rgba(77, 163, 255, 0.15);
}

.cards-grid__energy--challenging {
  color: rgba(255, 140, 100, 0.9);
  background: rgba(255, 140, 100, 0.08);
  border: 1px solid rgba(255, 140, 100, 0.15);
}

.cards-grid__keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
}

.cards-grid__keyword {
  font-size: 0.55rem;
  color: var(--lt-text-muted);
  padding: 1px 5px;
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-sm);
  opacity: 0.7;
}
</style>
