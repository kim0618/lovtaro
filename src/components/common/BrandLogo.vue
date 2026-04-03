<script setup>
defineProps({
  size: {
    type: String,
    default: 'md', // sm | md | lg | hero
  },
  gold: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <span class="brand-logo" :class="[`brand-logo--${size}`, { 'brand-logo--gold': gold }]">
    LOVTARO
  </span>
</template>

<style scoped>
.brand-logo {
  font-family: var(--lt-font-title);
  font-weight: 400;
  color: var(--lt-text-sub);
  letter-spacing: 0.38em;
  line-height: 1;
  display: inline-block;
  transition: color var(--lt-transition);
}

.brand-logo--gold {
  background: linear-gradient(135deg, #D4B87A 0%, #E8D09A 45%, #C8A96E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-logo--sm   { font-size: 0.78rem; letter-spacing: 0.32em; }
.brand-logo--md   { font-size: 1.05rem; }
.brand-logo--lg   { font-size: 1.5rem; }
.brand-logo--hero { font-size: 0.92rem; letter-spacing: 0.5em; }
</style>
