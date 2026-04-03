<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const links = [
  { label: '러브',   to: '/reading/love' },
  { label: '속마음', to: '/reading/mind' },
  { label: '재회',   to: '/reading/reunion' },
  { label: '연락',   to: '/reading/contact' },
  { label: '3장',    to: '/reading/3cards' },
  { label: '오늘',   to: '/today' },
  { label: '기록',   to: '/history' },
]
</script>

<template>
  <nav class="bottom-nav-section" aria-label="리딩 빠른 이동">
    <button
      v-for="link in links"
      :key="link.to"
      class="bottom-nav-section__item"
      @click="router.push(link.to)"
    >
      {{ link.label }}
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav-section {
  display: flex;
  justify-content: center;
  gap: var(--lt-space-sm);
  flex-wrap: wrap;
  padding: 0 var(--lt-space-md);
}

.bottom-nav-section__item {
  padding: 10px var(--lt-space-lg);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-sm);
  font-size: 0.8rem;
  color: var(--lt-text-muted);
  background: var(--lt-panel);
  letter-spacing: 0.04em;
  min-height: 44px;
  display: flex;
  align-items: center;
  transition:
    border-color var(--lt-transition),
    color var(--lt-transition),
    box-shadow var(--lt-transition);
}

.bottom-nav-section__item:hover {
  border-color: rgba(77, 163, 255, 0.25);
  color: var(--lt-accent-2);
  box-shadow: 0 0 12px rgba(77, 163, 255, 0.08);
}
</style>
