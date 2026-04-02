<script setup>
defineProps({
  size: {
    type: String,
    default: 'md', // sm | md | lg
  },
})
</script>

<template>
  <span class="brand-logo" :class="`brand-logo--${size}`">LOVTARO</span>
</template>

<style scoped>
.brand-logo {
  font-family: var(--lt-font-display);
  font-weight: 300;
  color: var(--lt-text-sub);
  letter-spacing: 0.35em;
  line-height: 1;
  display: inline-block;
  transition: color var(--lt-transition);
}

.brand-logo--sm { font-size: 0.88rem; letter-spacing: 0.28em; }
.brand-logo--md { font-size: 1.15rem; }
.brand-logo--lg { font-size: 1.6rem; }
</style>
