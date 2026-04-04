<script setup>
defineProps({
  spacing: {
    type: String,
    default: 'md', // sm | md | lg | xl
  },
})
</script>

<template>
  <section class="section-block" :class="`section-block--${spacing}`">
    <slot />
  </section>
</template>

<style scoped>
.section-block { width: 100%; }

.section-block--sm  { padding: var(--lt-space-md) 0; }
.section-block--md  { padding: var(--lt-space-lg) 0; }
.section-block--lg  { padding: var(--lt-space-2xl) 0; }
.section-block--xl  { padding: calc(var(--lt-space-2xl) * 1.5) 0; }
</style>
