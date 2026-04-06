<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'

defineProps({
  hideHeader: { type: Boolean, default: false },
  hideFooter: { type: Boolean, default: false },
})
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="!hideHeader" />
    <main class="app-shell__main">
      <slot />
    </main>
    <AppFooter v-if="!hideFooter" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.app-shell__main {
  flex: 1;
  position: relative;
}
</style>
