<script setup>
defineProps({
  narrow: { type: Boolean, default: false },
})
</script>

<template>
  <div class="page-container" :class="{ 'page-container--narrow': narrow }">
    <slot />
  </div>
</template>

<style scoped>
.page-container {
  padding: 0;
}

.page-container--narrow {
  max-width: 360px;
}
</style>
