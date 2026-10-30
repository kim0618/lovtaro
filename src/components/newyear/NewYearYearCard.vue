<script setup>
import { computed } from 'vue'
import { getCardById } from '../../data/tarotCards.js'
import { getCardImage } from '../../data/cardImages.js'
import { NEWYEAR_YEAR, NEWYEAR_YEAR_CARDS } from '../../data/readings/newyear.js'

const props = defineProps({
  cardId: { type: String, required: true },
  cardNumber: { type: Number, required: true },
  bridge: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
})

const card = computed(() => getCardById(props.cardId))
const image = computed(() => getCardImage(props.cardId) || '')
const yc = computed(() => NEWYEAR_YEAR_CARDS[props.cardId])
</script>

<template>
  <div v-if="card && yc" class="ny-year-card">
    <p class="ny-year-card__eyebrow">{{ eyebrow || `${NEWYEAR_YEAR} 연간 카드` }}</p>
    <div class="ny-year-card__body">
      <div class="ny-year-card__frame">
        <img v-if="image" :src="image" :alt="card.name" class="ny-year-card__img" />
      </div>
      <div class="ny-year-card__info">
        <p class="ny-year-card__name">{{ cardNumber }}번 {{ card.name }}</p>
        <p class="ny-year-card__name-en">{{ card.nameEn }}</p>
        <p class="ny-year-card__theme">{{ yc.theme }}</p>
      </div>
    </div>
    <p class="ny-year-card__text">{{ yc.text }}</p>
    <p v-if="bridge" class="ny-year-card__bridge">{{ bridge }}</p>
  </div>
</template>

<style scoped>
.ny-year-card {
  margin: 0 var(--lt-space-md);
  padding: var(--lt-space-lg);
  background: linear-gradient(160deg, var(--lt-bg-card) 0%, var(--lt-bg-1) 100%);
  border: 1px solid rgba(200, 169, 110, 0.28);
  border-radius: var(--lt-radius-lg);
  box-shadow: 0 0 24px rgba(200, 169, 110, 0.06);
}

.ny-year-card__eyebrow {
  font-size: 0.68rem;
  color: var(--lt-accent-3);
  letter-spacing: 0.14em;
  text-align: center;
  opacity: 0.85;
  margin-bottom: var(--lt-space-md);
}

.ny-year-card__body {
  display: flex;
  align-items: center;
  gap: var(--lt-space-lg);
}

.ny-year-card__frame {
  flex: 0 0 auto;
  width: 84px;
  height: 138px;
  border-radius: var(--lt-radius-sm);
  overflow: hidden;
  border: 1px solid rgba(200, 169, 110, 0.3);
  background: var(--lt-bg-2);
}

.ny-year-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ny-year-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ny-year-card__name {
  font-size: 1.15rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
}

.ny-year-card__name-en {
  font-family: var(--lt-font-serif);
  font-style: italic;
  font-size: 0.78rem;
  color: var(--lt-text-muted);
}

.ny-year-card__theme {
  margin-top: 6px;
  font-size: 0.86rem;
  color: var(--lt-accent-3);
  letter-spacing: 0.03em;
}

.ny-year-card__text {
  margin-top: var(--lt-space-lg);
  font-size: 0.9rem;
  line-height: 1.85;
  color: var(--lt-text-sub);
}

.ny-year-card__bridge {
  margin-top: var(--lt-space-md);
  padding-top: var(--lt-space-md);
  border-top: 1px solid var(--lt-border-soft);
  font-size: 0.84rem;
  line-height: 1.7;
  color: var(--lt-text-strong);
}
</style>
