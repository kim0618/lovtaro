<script setup>
defineProps({
  message: {
    type: String,
    default: '카드가 전한 이야기가 마음 한켠에 조용히 머물기를 바랍니다.',
  },
})
</script>

<template>
  <div class="reading-closing">
    <span class="reading-closing__dot" aria-hidden="true">✦</span>
    <p class="reading-closing__text">{{ message }}</p>
  </div>
</template>

<style scoped>
.reading-closing {
  padding: 0 var(--lt-space-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.reading-closing__dot {
  font-size: 0.6rem;
  color: var(--lt-accent-2);
  opacity: 0.35;
}

.reading-closing__text {
  font-family: var(--lt-font-sans);
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  line-height: 1.9;
  letter-spacing: 0.06em;
  font-weight: 200;
  opacity: 0.75;
}
</style>
