<script setup>
defineProps({
  description: { type: String, required: true },
})
</script>

<template>
  <div class="reading-desc-box">
    <p class="reading-desc-box__text">{{ description }}</p>
  </div>
</template>

<style scoped>
.reading-desc-box {
  margin: 0 var(--lt-space-md);
  padding: var(--lt-space-lg);
  background: var(--lt-panel);
  border-radius: var(--lt-radius-md);
  border: 1px solid var(--lt-border-soft);
  border-left: 2px solid rgba(77, 163, 255, 0.25);
}

.reading-desc-box__text {
  font-size: 0.9rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
}
</style>
