<script setup>
import { computed } from 'vue'
import { REVERSED_MODIFIERS } from '../../data/reversedModifiers.js'

const props = defineProps({
  position: { type: String, required: true },
  cardName: { type: String, required: true },
  cardId: { type: String, default: '' },
  interpretation: { type: String, required: true },
  keywords: { type: Array, default: () => [] },
  reversed: { type: Boolean, default: false },
})

const reversedPrefix = computed(() => {
  if (!props.reversed || !props.cardId) return null
  return REVERSED_MODIFIERS[props.cardId]?.prefix ?? null
})

const effectiveKeywords = computed(() => {
  if (!props.reversed || !props.cardId) return props.keywords
  const mod = REVERSED_MODIFIERS[props.cardId]
  return mod ? mod.emotionTags : props.keywords
})
</script>

<template>
  <div class="three-card-meaning" :class="{ 'three-card-meaning--reversed': reversed }">
    <div class="three-card-meaning__header">
      <span class="three-card-meaning__position">{{ position }}</span>
      <h3 class="three-card-meaning__card-name">
        {{ cardName }}
        <span v-if="reversed" class="three-card-meaning__reversed-badge">역방향</span>
      </h3>
    </div>
    <div v-if="effectiveKeywords.length" class="three-card-meaning__keywords">
      <span
        v-for="kw in effectiveKeywords"
        :key="kw"
        class="three-card-meaning__keyword"
      >{{ kw }}</span>
    </div>
    <p v-if="reversedPrefix" class="three-card-meaning__reversed-prefix">{{ reversedPrefix }}</p>
    <p class="three-card-meaning__text">{{ interpretation }}</p>
  </div>
</template>

<style scoped>
.three-card-meaning {
  padding: var(--lt-space-lg) var(--lt-space-md);
  border-bottom: 1px solid var(--lt-border-soft);
  margin: 0 var(--lt-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
  background: var(--lt-panel);
  border-radius: var(--lt-radius-md);
  border: 1px solid var(--lt-border-soft);
}

.three-card-meaning:last-child {
  border-bottom: 1px solid var(--lt-border-soft);
}

.three-card-meaning__header {
  display: flex;
  align-items: center;
  gap: var(--lt-space-sm);
}

.three-card-meaning__position {
  font-size: 0.65rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  flex-shrink: 0;
  opacity: 0.7;
}

.three-card-meaning__card-name {
  font-size: 1rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.02em;
}

.three-card-meaning__keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.three-card-meaning__keyword {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  padding: 2px 8px;
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-sm);
  letter-spacing: 0.02em;
  background: rgba(13, 21, 40, 0.4);
}

.three-card-meaning__text {
  font-size: 0.9rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
}

.three-card-meaning__reversed-badge {
  font-size: 0.6rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  vertical-align: middle;
  margin-left: 6px;
  opacity: 0.8;
}

.three-card-meaning--reversed {
  border-color: rgba(77, 163, 255, 0.12);
}

.three-card-meaning__reversed-prefix {
  font-size: 0.82rem;
  color: var(--lt-accent-2);
  opacity: 0.75;
  line-height: 1.7;
  font-style: italic;
  padding-left: var(--lt-space-sm);
  border-left: 2px solid rgba(77, 163, 255, 0.3);
}
</style>
