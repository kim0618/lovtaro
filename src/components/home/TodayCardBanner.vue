<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="today-card-banner" @click="router.push('/today')">
    <div class="today-card-banner__inner">
      <div class="today-card-banner__label">오늘의 카드</div>
      <p class="today-card-banner__text">오늘 하루, 어떤 에너지가 흐르는지 한 장으로 살펴봅니다.</p>
      <span class="today-card-banner__link">카드 한 장 뽑기 &#8594;</span>
    </div>
  </div>
</template>

<style scoped>
.today-card-banner {
  margin: 0 var(--lt-space-md);
  cursor: pointer;
  transition: opacity var(--lt-transition);
}

.today-card-banner:hover {
  opacity: 0.8;
}

.today-card-banner__inner {
  padding: var(--lt-space-lg);
  background: var(--lt-panel);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-md);
  backdrop-filter: blur(6px);
}

.today-card-banner__label {
  font-size: 0.62rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: var(--lt-space-sm);
  opacity: 0.8;
}

.today-card-banner__text {
  font-size: 0.88rem;
  color: var(--lt-text-sub);
  margin-bottom: var(--lt-space-md);
  line-height: 1.7;
}

.today-card-banner__link {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.08em;
  transition: color var(--lt-transition);
}

.today-card-banner:hover .today-card-banner__link {
  color: var(--lt-accent-2);
}
</style>
