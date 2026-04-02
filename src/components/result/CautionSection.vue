<script setup>
defineProps({
  title: { type: String, default: '조심할 점' },
  lines: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="caution-section">
    <h3 class="caution-section__title">{{ title }}</h3>
    <ul class="caution-section__list">
      <li
        v-for="(line, i) in lines"
        :key="i"
        class="caution-section__item"
      >
        {{ line }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.caution-section {
  padding: 0 var(--lt-space-md);
}

.caution-section__title {
  font-family: var(--lt-font-sans);
  font-size: 0.68rem;
  font-weight: 400;
  color: var(--lt-text-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: var(--lt-space-md);
  opacity: 0.65;
}

.caution-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
}

.caution-section__item {
  font-size: 0.88rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  padding: var(--lt-space-sm) var(--lt-space-md);
  background-color: rgba(13, 21, 40, 0.5);
  border-left: 2px solid rgba(199, 215, 248, 0.2);
  border-radius: 0 var(--lt-radius-sm) var(--lt-radius-sm) 0;
}
</style>
