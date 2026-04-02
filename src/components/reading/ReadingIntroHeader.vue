<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="reading-intro-header">
    <h1 class="reading-intro-header__title">{{ title }}</h1>
    <p v-if="subtitle" class="reading-intro-header__subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.reading-intro-header {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-lg);
  text-align: center;
  position: relative;
}

.reading-intro-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(45, 108, 223, 0.04) 0%, transparent 70%);
  pointer-events: none;
}

.reading-intro-header__title {
  font-size: 1.6rem;
  color: var(--lt-text-strong);
  margin-bottom: var(--lt-space-sm);
  position: relative;
}

.reading-intro-header__subtitle {
  font-size: 0.9rem;
  color: var(--lt-text-sub);
  line-height: 1.7;
  position: relative;
}
</style>
