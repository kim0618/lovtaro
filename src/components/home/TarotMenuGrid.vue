<script setup>
import TarotMenuCard from './TarotMenuCard.vue'

defineProps({
  items: {
    type: Array,
    required: true,
    // [{ title, description, to, tag }]
  },
})
</script>

<template>
  <div class="tarot-menu-grid">
    <TarotMenuCard
      v-for="item in items"
      :key="item.to"
      v-bind="item"
    />
  </div>
</template>

<style scoped>
.tarot-menu-grid {
  display: flex;
  flex-direction: column;
  padding: 0 var(--lt-space-md);
}
</style>
