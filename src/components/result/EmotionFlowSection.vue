<script setup>
defineProps({
  title: { type: String, default: '지금 감정의 흐름' },
  lines: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="emotion-flow-section">
    <h3 class="emotion-flow-section__title">{{ title }}</h3>
    <ul class="emotion-flow-section__list">
      <li
        v-for="(line, i) in lines"
        :key="i"
        class="emotion-flow-section__item"
      >
        {{ line }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.emotion-flow-section {
  padding: 0 var(--lt-space-md);
}

.emotion-flow-section__title {
  font-family: var(--lt-font-sans);
  font-size: 0.68rem;
  font-weight: 400;
  color: var(--lt-accent-2);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: var(--lt-space-md);
  opacity: 0.7;
}

.emotion-flow-section__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.emotion-flow-section__item {
  font-size: 0.9rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  padding-left: 14px;
  position: relative;
}

.emotion-flow-section__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 1px;
  height: 0.85em;
  background-color: var(--lt-accent-2);
  opacity: 0.4;
}
</style>
