<script setup>
defineProps({
  title: { type: String, default: '지금 할 수 있는 것' },
  lines: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="advice-section">
    <h3 class="advice-section__title">{{ title }}</h3>
    <ul class="advice-section__list">
      <li
        v-for="(line, i) in lines"
        :key="i"
        class="advice-section__item"
      >
        {{ line }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.advice-section {
  padding: 0 var(--lt-space-md);
}

.advice-section__title {
  font-family: var(--lt-font-sans);
  font-size: 0.74rem;
  font-weight: 400;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  margin-bottom: var(--lt-space-md);
  opacity: 0.8;
}

.advice-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
}

.advice-section__item {
  font-size: 0.9rem;
  color: var(--lt-text);
  line-height: 1.8;
  padding: var(--lt-space-sm) var(--lt-space-md);
  background-color: var(--lt-panel);
  border-radius: var(--lt-radius-sm);
  border: 1px solid var(--lt-border-soft);
  border-left: 2px solid rgba(77, 163, 255, 0.25);
}
</style>
