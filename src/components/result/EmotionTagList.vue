<script setup>
defineProps({
  tags: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <p class="emotion-tag-list">
    <template v-for="(tag, i) in tags" :key="tag">
      <span v-if="i > 0" class="emotion-tag-list__sep"> · </span>
      <span class="emotion-tag-list__tag">{{ tag }}</span>
    </template>
  </p>
</template>

<style scoped>
.emotion-tag-list {
  text-align: center;
  padding: 0 var(--lt-space-md);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  color: var(--lt-text-sub);
  line-height: 2;
}

.emotion-tag-list__sep {
  color: rgba(77, 163, 255, 0.3);
}
</style>
