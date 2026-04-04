<script setup>
defineProps({
  tags: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="emotion-tag-list">
    <span
      v-for="tag in tags"
      :key="tag"
      class="emotion-tag-list__tag"
    >{{ tag }}</span>
  </div>
</template>

<style scoped>
.emotion-tag-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  padding: 0 var(--lt-space-md);
  padding-bottom: var(--lt-space-sm);
}

.emotion-tag-list__tag {
  font-size: 0.75rem;
  color: var(--lt-text-sub);
  letter-spacing: 0.04em;
  padding: 5px 14px;
  border: 1px solid rgba(77, 163, 255, 0.2);
  border-radius: var(--lt-radius-full);
  background: rgba(77, 163, 255, 0.06);
}
</style>
