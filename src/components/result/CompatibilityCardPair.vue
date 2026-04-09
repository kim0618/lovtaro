<script setup>
defineProps({
  card1: { type: Object, required: true },
  card2: { type: Object, required: true },
  energy1: { type: String, default: '' },
  energy2: { type: String, default: '' },
})
</script>

<template>
  <div class="card-pair">
    <div class="card-pair__cards">
      <div class="card-pair__card">
        <div class="card-pair__image-wrap" :class="{ 'card-pair__image-wrap--reversed': card1.reversed }">
          <img :src="card1.image" :alt="card1.name" class="card-pair__image" />
        </div>
        <p class="card-pair__name">{{ card1.name }}</p>
        <p class="card-pair__name-en">{{ card1.nameEn }}</p>
        <span v-if="card1.reversed" class="card-pair__reversed">&#8635; 역방향</span>
      </div>

      <div class="card-pair__connector" aria-hidden="true">
        <span class="card-pair__connector-dot" />
        <span class="card-pair__connector-line" />
        <span class="card-pair__connector-symbol">&#8734;</span>
        <span class="card-pair__connector-line" />
        <span class="card-pair__connector-dot" />
      </div>

      <div class="card-pair__card">
        <div class="card-pair__image-wrap" :class="{ 'card-pair__image-wrap--reversed': card2.reversed }">
          <img :src="card2.image" :alt="card2.name" class="card-pair__image" />
        </div>
        <p class="card-pair__name">{{ card2.name }}</p>
        <p class="card-pair__name-en">{{ card2.nameEn }}</p>
        <span v-if="card2.reversed" class="card-pair__reversed">&#8635; 역방향</span>
      </div>
    </div>

    <div class="card-pair__energies">
      <div class="card-pair__energy">
        <p class="card-pair__energy-label">나의 에너지</p>
        <p class="card-pair__energy-desc">{{ energy1 }}</p>
      </div>
      <div class="card-pair__energy">
        <p class="card-pair__energy-label">상대의 에너지</p>
        <p class="card-pair__energy-desc">{{ energy2 }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-pair {
  padding: 0 var(--lt-space-md);
}

.card-pair__cards {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--lt-space-sm);
}

.card-pair__card {
  flex: 1;
  max-width: 160px;
  text-align: center;
}

.card-pair__image-wrap {
  aspect-ratio: 2/3;
  border-radius: var(--lt-radius-md);
  overflow: hidden;
  border: 1px solid rgba(200, 169, 110, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  margin-bottom: var(--lt-space-sm);
}

.card-pair__image-wrap--reversed {
  transform: rotate(180deg);
}

.card-pair__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-pair__name {
  font-size: 1rem;
  color: var(--lt-text-strong);
  font-weight: 400;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
}

.card-pair__name-en {
  font-family: var(--lt-font-display);
  font-style: italic;
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.02em;
  margin-bottom: 4px;
}

.card-pair__reversed {
  display: inline-block;
  font-size: 0.62rem;
  color: var(--lt-accent-2);
  border: 1px solid rgba(77, 163, 255, 0.25);
  border-radius: var(--lt-radius-full);
  padding: 2px 8px;
  letter-spacing: 0.04em;
}

.card-pair__connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 2px;
  margin-bottom: 40px;
}

.card-pair__connector-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(200, 169, 110, 0.5);
  box-shadow: 0 0 6px rgba(200, 169, 110, 0.25);
}

.card-pair__connector-line {
  width: 1px;
  height: 20px;
  background: linear-gradient(180deg, rgba(200, 169, 110, 0.1) 0%, rgba(200, 169, 110, 0.3) 50%, rgba(200, 169, 110, 0.1) 100%);
}

.card-pair__connector-symbol {
  font-size: 1rem;
  color: rgba(200, 169, 110, 0.45);
  line-height: 1;
}

.card-pair__energies {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-md);
  margin-top: var(--lt-space-xl);
  padding: var(--lt-space-md);
  background: var(--lt-panel);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-lg);
}

.card-pair__energy-label {
  font-size: 0.68rem;
  color: var(--lt-accent-3);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
  opacity: 0.8;
}

.card-pair__energy-desc {
  font-size: 0.85rem;
  color: var(--lt-text);
  line-height: 1.6;
  letter-spacing: 0.02em;
}
</style>
