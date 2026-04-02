<script setup>
defineProps({
  summary: { type: String, required: true },
  label: { type: String, default: '전체 흐름' },
})
</script>

<template>
  <div class="three-card-summary">
    <p class="three-card-summary__label">{{ label }}</p>
    <p class="three-card-summary__text">{{ summary }}</p>
  </div>
</template>

<style scoped>
.three-card-summary {
  margin: 0 var(--lt-space-md);
  padding: var(--lt-space-lg) var(--lt-space-lg) var(--lt-space-lg) var(--lt-space-xl);
  background: none;
  border: none;
  border-left: 2px solid rgba(77, 163, 255, 0.25);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
}

.three-card-summary__label {
  font-size: 0.62rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.7;
}

.three-card-summary__text {
  font-size: 1rem;
  color: var(--lt-text);
  line-height: 1.9;
}
</style>
