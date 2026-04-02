<script setup>
import BrandLogo from './BrandLogo.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <button class="app-header__logo" @click="router.push('/')" aria-label="홈으로 이동">
        <BrandLogo size="md" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(5, 7, 13, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--lt-border-soft);
}

.app-header__inner {
  padding: 0 var(--lt-space-md);
  height: 56px;
  display: flex;
  align-items: center;
}

.app-header__logo {
  padding: 0;
  line-height: 1;
  transition: opacity var(--lt-transition);
}

.app-header__logo:hover {
  opacity: 0.8;
}
</style>
