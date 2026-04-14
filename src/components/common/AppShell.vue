<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BottomTabNav from './BottomTabNav.vue'

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
    <BottomTabNav />
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
  padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
}
</style>
