<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '지금 감정의 흐름' },
  lines: {
    type: Array,
    required: true,
  },
  initialCount: { type: Number, default: 5 },
})

const expanded = ref(false)
const hasMore = computed(() => props.lines.length > props.initialCount)
const visibleLines = computed(() =>
  expanded.value ? props.lines : props.lines.slice(0, props.initialCount)
)
</script>

<template>
  <div class="emotion-flow-section">
    <h3 class="emotion-flow-section__title">{{ title }}</h3>
    <ul class="emotion-flow-section__list">
      <li
        v-for="(line, i) in visibleLines"
        :key="i"
        class="emotion-flow-section__item"
      >
        {{ line }}
      </li>
    </ul>
    <button
      v-if="hasMore && !expanded"
      class="emotion-flow-section__more"
      @click="expanded = true"
    >
      더 보기
    </button>
  </div>
</template>

<style scoped>
.emotion-flow-section {
  padding: 0 var(--lt-space-md);
}

.emotion-flow-section__title {
  font-family: var(--lt-font-sans);
  font-size: 0.74rem;
  font-weight: 400;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  margin-bottom: var(--lt-space-md);
  opacity: 0.8;
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

.emotion-flow-section__more {
  margin-top: 16px;
  font-size: 0.7rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  opacity: 0.65;
  transition: opacity var(--lt-transition);
  padding: 4px 14px;
  border: 1px solid rgba(77, 163, 255, 0.15);
  border-radius: var(--lt-radius-full);
  background: rgba(77, 163, 255, 0.04);
}

.emotion-flow-section__more:hover {
  opacity: 1;
  border-color: rgba(77, 163, 255, 0.3);
}
</style>
