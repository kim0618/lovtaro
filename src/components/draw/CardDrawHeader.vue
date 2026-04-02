<script setup>
defineProps({
  title: { type: String, required: true },
  instruction: { type: String, default: '카드를 선택해주세요.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
})
</script>

<template>
  <div class="card-draw-header">
    <p v-if="totalSteps > 1" class="card-draw-header__step">
      {{ currentStep }} / {{ totalSteps }}
    </p>
    <h2 class="card-draw-header__title">{{ title }}</h2>
    <p class="card-draw-header__instruction">{{ instruction }}</p>
  </div>
</template>

<style scoped>
.card-draw-header {
  text-align: center;
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-lg);
}

.card-draw-header__step {
  font-size: 0.72rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.12em;
  margin-bottom: var(--lt-space-sm);
  opacity: 0.7;
}

.card-draw-header__title {
  font-size: 1.4rem;
  color: var(--lt-text-strong);
  margin-bottom: var(--lt-space-sm);
}

.card-draw-header__instruction {
  font-size: 0.9rem;
  color: var(--lt-text-sub);
}
</style>
