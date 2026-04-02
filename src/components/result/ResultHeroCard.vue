<script setup>
defineProps({
  cardName: { type: String, required: true },
  cardNameEn: { type: String, default: '' },
  readingType: { type: String, default: '' },
  reversed: { type: Boolean, default: false },
})
</script>

<template>
  <div class="result-hero-card lt-appear">
    <p v-if="readingType" class="result-hero-card__type">{{ readingType }}</p>
    <h1 class="result-hero-card__name">{{ cardName }}</h1>
    <p v-if="cardNameEn" class="result-hero-card__name-en">{{ cardNameEn }}</p>
    <p v-if="reversed" class="result-hero-card__orientation">역방향 (Reversed)</p>
  </div>
</template>

<style scoped>
.result-hero-card {
  text-align: center;
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-md);
  position: relative;
}

.result-hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(45, 108, 223, 0.04) 0%, transparent 70%);
  pointer-events: none;
}

.result-hero-card__type {
  font-size: 0.65rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.14em;
  margin-bottom: var(--lt-space-sm);
  text-transform: uppercase;
  opacity: 0.7;
}

.result-hero-card__name {
  font-size: 2.4rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  margin-bottom: 6px;
  letter-spacing: 0.02em;
  line-height: 1.2;
  position: relative;
}

.result-hero-card__name-en {
  font-family: var(--lt-font-display);
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  font-style: italic;
  letter-spacing: 0.12em;
}

.result-hero-card__orientation {
  font-size: 0.7rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.1em;
  margin-top: var(--lt-space-sm);
  opacity: 0.8;
}
</style>
