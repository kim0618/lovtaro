<script setup>
defineProps({
  insight: { type: String, required: true },
  label: { type: String, default: '핵심 메시지' },
})
</script>

<template>
  <div class="core-insight">
    <p class="core-insight__label">{{ label }}</p>
    <p class="core-insight__text">{{ insight }}</p>
    <div class="core-insight__line" aria-hidden="true" />
  </div>
</template>

<style scoped>
.core-insight {
  margin: 0 var(--lt-space-md);
  padding: var(--lt-space-lg) var(--lt-space-lg) calc(var(--lt-space-lg) + 4px);
  background: linear-gradient(170deg, rgba(16, 26, 49, 0.7) 0%, rgba(10, 16, 32, 0.5) 100%);
  border: 1px solid rgba(77, 163, 255, 0.18);
  border-radius: var(--lt-radius-md);
  text-align: center;
  position: relative;
}

.core-insight__label {
  font-size: 0.65rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: var(--lt-space-md);
  opacity: 0.8;
}

.core-insight__text {
  font-size: 1.08rem;
  color: var(--lt-text-strong);
  line-height: 1.85;
  letter-spacing: 0.01em;
  font-weight: 300;
}

.core-insight__line {
  width: 36px;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(77, 163, 255, 0.35), transparent);
  margin: var(--lt-space-md) auto 0;
}
</style>
