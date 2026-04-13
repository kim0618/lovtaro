<script setup>
import { computed } from 'vue'
import { getTomorrowTeaser } from '../../data/tomorrowTeasers.js'

const props = defineProps({
  energy: { type: String, default: 'neutral' },
})

const teaser = computed(() => getTomorrowTeaser(props.energy))
</script>

<template>
  <div class="tomorrow-teaser">
    <span class="tomorrow-teaser__dot" aria-hidden="true">&#x2729;</span>
    <p class="tomorrow-teaser__text">{{ teaser }}</p>
    <p class="tomorrow-teaser__sub">내일 다시 한 장 뽑아보세요</p>
  </div>
</template>

<style scoped>
.tomorrow-teaser {
  padding: var(--lt-space-md) var(--lt-space-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.tomorrow-teaser__dot {
  font-size: 0.55rem;
  color: var(--lt-accent-2);
  opacity: 0.3;
}

.tomorrow-teaser__text {
  font-family: var(--lt-font-sans);
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  line-height: 1.9;
  letter-spacing: 0.06em;
  font-weight: 200;
  opacity: 0.8;
}

.tomorrow-teaser__sub {
  font-size: 0.68rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  opacity: 0.5;
}
</style>
