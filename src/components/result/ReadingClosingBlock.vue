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
    <p class="reading-closing__text">{{ message }}</p>
  </div>
</template>

<style scoped>
.reading-closing {
  padding: 0 var(--lt-space-lg);
  text-align: center;
}

.reading-closing__text {
  font-size: 0.85rem;
  color: var(--lt-text-muted);
  line-height: 1.9;
  letter-spacing: 0.02em;
  font-style: italic;
}
</style>
