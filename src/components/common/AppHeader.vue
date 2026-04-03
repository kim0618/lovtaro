<script setup>
import BrandLogo from './BrandLogo.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <button class="app-header__logo" @click="router.push('/')" aria-label="홈으로 이동">
        <span class="app-header__ornament" aria-hidden="true">✦</span>
        <BrandLogo size="md" gold />
        <span class="app-header__ornament" aria-hidden="true">✦</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(5, 7, 13, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(200, 169, 110, 0.1);
}

.app-header__inner {
  padding: 0 var(--lt-space-md);
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-header__logo {
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: opacity var(--lt-transition);
  opacity: 0.85;
}

.app-header__logo:hover {
  opacity: 1;
}

.app-header__ornament {
  font-size: 0.45rem;
  color: rgba(200, 169, 110, 0.5);
  transition: color var(--lt-transition);
}

.app-header__logo:hover .app-header__ornament {
  color: rgba(200, 169, 110, 0.85);
}
</style>
