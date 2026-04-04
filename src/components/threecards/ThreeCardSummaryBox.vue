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
  padding: var(--lt-space-lg);
  background: linear-gradient(170deg, rgba(16, 26, 49, 0.5) 0%, rgba(10, 16, 32, 0.35) 100%);
  border: 1px solid rgba(77, 163, 255, 0.1);
  border-left: 2px solid rgba(77, 163, 255, 0.3);
  border-radius: 0 var(--lt-radius-md) var(--lt-radius-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
}

.three-card-summary__label {
  font-size: 0.65rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.8;
}

.three-card-summary__text {
  font-size: 1.02rem;
  color: var(--lt-text-strong);
  line-height: 1.9;
  font-weight: 300;
}
</style>
