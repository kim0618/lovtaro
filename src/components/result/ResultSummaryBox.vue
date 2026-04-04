<script setup>
defineProps({
  summary: { type: String, required: true },
  label: { type: String, default: '한 줄 요약' },
})
</script>

<template>
  <div class="result-summary-box">
    <p class="result-summary-box__label">{{ label }}</p>
    <p class="result-summary-box__text">{{ summary }}</p>
  </div>
</template>

<style scoped>
.result-summary-box {
  margin: 0 var(--lt-space-md);
  padding: var(--lt-space-lg);
  padding-left: var(--lt-space-xl);
  background: none;
  border: none;
  border-left: 2px solid rgba(77, 163, 255, 0.25);
}

.result-summary-box__label {
  font-size: 0.65rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.14em;
  margin-bottom: 10px;
  text-transform: uppercase;
  opacity: 0.8;
}

.result-summary-box__text {
  font-size: 1rem;
  color: var(--lt-text);
  line-height: 1.9;
  letter-spacing: 0.01em;
}
</style>
