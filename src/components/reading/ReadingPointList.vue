<script setup>
defineProps({
  points: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <ul class="reading-point-list">
    <li
      v-for="(point, index) in points"
      :key="index"
      class="reading-point-list__item"
    >
      <span class="reading-point-list__index">{{ String(index + 1).padStart(2, '0') }}</span>
      <div class="reading-point-list__body">
        <strong class="reading-point-list__label">{{ point.label }}</strong>
        <p class="reading-point-list__text">{{ point.text }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.reading-point-list {
  display: flex;
  flex-direction: column;
  padding: 0 var(--lt-space-md);
  border-top: 1px solid var(--lt-border-soft);
}

.reading-point-list__item {
  display: flex;
  gap: var(--lt-space-md);
  align-items: flex-start;
  border-bottom: 1px solid var(--lt-border-soft);
  padding: var(--lt-space-md) 0;
}

.reading-point-list__index {
  flex-shrink: 0;
  width: 28px;
  font-family: var(--lt-font-display);
  font-size: 0.72rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  padding-top: 3px;
  opacity: 0.6;
}

.reading-point-list__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reading-point-list__label {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--lt-text-strong);
  letter-spacing: 0.01em;
}

.reading-point-list__text {
  font-size: 0.85rem;
  color: var(--lt-text-sub);
  line-height: 1.7;
}
</style>
