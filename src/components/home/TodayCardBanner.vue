<script setup>
import { useRouter } from 'vue-router'
import { useStreak } from '../../composables/useStreak.js'

const router = useRouter()
const { streak } = useStreak()
</script>

<template>
  <div class="today-card-banner" @click="router.push('/today')">
    <div class="today-card-banner__inner">
      <div class="today-card-banner__glow" aria-hidden="true"></div>
      <div class="today-card-banner__content">
        <div class="today-card-banner__label">오늘의 카드</div>
        <p class="today-card-banner__text">오늘 하루, 어떤 에너지가 흐르는지<br>한 장으로 살펴봅니다.</p>
        <p v-if="streak > 0" class="today-card-banner__streak">{{ streak }}일 연속 리딩 중</p>
      </div>
      <span class="today-card-banner__link">뽑기 &#8594;</span>
    </div>
  </div>
</template>

<style scoped>
.today-card-banner {
  margin: 0 var(--lt-space-md);
  cursor: pointer;
}

.today-card-banner__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--lt-space-md);
  padding: 20px var(--lt-space-lg);
  background: linear-gradient(160deg, rgba(13, 21, 40, 0.9) 0%, rgba(16, 28, 52, 0.85) 100%);
  border: 1px solid rgba(120, 150, 200, 0.12);
  border-radius: var(--lt-radius-lg);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
  transition:
    border-color 300ms ease,
    box-shadow 300ms ease;
}

.today-card-banner:hover .today-card-banner__inner {
  border-color: rgba(143, 211, 255, 0.25);
  box-shadow:
    0 2px 16px rgba(0, 0, 0, 0.25),
    0 0 20px rgba(77, 163, 255, 0.08);
}

/* subtle glow in corner */
.today-card-banner__glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(77, 163, 255, 0.08) 0%, transparent 70%);
  filter: blur(20px);
  pointer-events: none;
}

.today-card-banner__content {
  flex: 1;
  min-width: 0;
}

.today-card-banner__label {
  font-size: 0.6rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 6px;
  opacity: 0.7;
}

.today-card-banner__text {
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  line-height: 1.65;
  letter-spacing: 0.02em;
}

.today-card-banner__link {
  flex-shrink: 0;
  font-size: 0.72rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  opacity: 0.6;
  transition: opacity 250ms ease;
}

.today-card-banner:hover .today-card-banner__link {
  opacity: 1;
}

.today-card-banner__streak {
  font-size: 0.65rem;
  color: rgba(100, 220, 180, 0.85);
  letter-spacing: 0.06em;
  margin-top: 6px;
  opacity: 0.9;
}
</style>
