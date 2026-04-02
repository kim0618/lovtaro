<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="hero-section">
    <!-- Celestial ambient glow -->
    <div class="hero-section__celestial" aria-hidden="true">
      <div class="hero-section__star hero-section__star--1" />
      <div class="hero-section__star hero-section__star--2" />
      <div class="hero-section__star hero-section__star--3" />
    </div>

    <p class="hero-section__eyebrow">LOVE TAROT READING</p>
    <div class="hero-section__ornament" aria-hidden="true">
      <span class="hero-section__ornament-line" />
      <span class="hero-section__ornament-star">✦</span>
      <span class="hero-section__ornament-line" />
    </div>
    <h1 class="hero-section__title">그 사람을 떠올린 채,<br><em>카드가 말하게 하세요</em></h1>
    <p class="hero-section__subtitle">감정의 결을 읽고, 관계의 흐름을 비춰봅니다</p>
    <div class="hero-section__divider" aria-hidden="true" />
    <button class="hero-section__cta" @click="router.push('/today')">
      오늘의 카드 뽑기
    </button>
  </div>
</template>

<style scoped>
.hero-section {
  text-align: center;
  padding: var(--lt-space-2xl) var(--lt-space-md) var(--lt-space-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-sm);
  position: relative;
  overflow: hidden;
}

/* Celestial ambient background glow */
.hero-section__celestial {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-section__celestial::before {
  content: '';
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(45, 108, 223, 0.06) 0%, rgba(77, 163, 255, 0.02) 40%, transparent 70%);
}

/* Subtle star dots */
.hero-section__star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: rgba(143, 211, 255, 0.4);
  animation: lt-shimmer 4s ease-in-out infinite;
}

.hero-section__star--1 {
  top: 18%;
  left: 22%;
  animation-delay: 0s;
}

.hero-section__star--2 {
  top: 30%;
  right: 18%;
  animation-delay: 1.5s;
}

.hero-section__star--3 {
  top: 55%;
  left: 35%;
  animation-delay: 3s;
  width: 1.5px;
  height: 1.5px;
}

.hero-section__eyebrow {
  font-size: 0.62rem;
  letter-spacing: 0.3em;
  color: var(--lt-text-muted);
  font-family: var(--lt-font-display);
  font-style: italic;
  opacity: 0.75;
  position: relative;
}

.hero-section__ornament {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: var(--lt-space-sm) 0 0;
  position: relative;
}

.hero-section__ornament-line {
  display: block;
  width: 38px;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(200, 169, 110, 0.4), transparent);
}

.hero-section__ornament-star {
  font-size: 0.6rem;
  color: rgba(200, 169, 110, 0.6);
  animation: lt-shimmer 3s ease-in-out infinite;
}

.hero-section__title {
  font-size: 1.65rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  line-height: 1.4;
  margin: var(--lt-space-sm) 0 0;
  letter-spacing: -0.01em;
  position: relative;
}

.hero-section__title em {
  font-style: normal;
  background: linear-gradient(135deg, #D4B87A 0%, #C8A96E 40%, #A88B58 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-section__subtitle {
  font-size: 0.85rem;
  color: var(--lt-text-muted);
  margin-bottom: var(--lt-space-xs);
  letter-spacing: 0.06em;
  position: relative;
}

.hero-section__divider {
  width: 1px;
  height: 36px;
  background: linear-gradient(to bottom, transparent, rgba(77, 163, 255, 0.3), transparent);
  margin: var(--lt-space-sm) 0;
}

.hero-section__cta {
  margin-top: var(--lt-space-xs);
  padding: 13px 44px;
  background: var(--lt-btn-primary-bg);
  color: #F4F8FF;
  border-radius: var(--lt-radius-sm);
  font-size: 0.82rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  position: relative;
  box-shadow: 0 4px 20px rgba(45, 108, 223, 0.2);
  transition:
    background var(--lt-transition),
    box-shadow var(--lt-transition),
    transform var(--lt-transition);
}

.hero-section__cta:hover {
  background: var(--lt-btn-primary-hover);
  box-shadow: 0 6px 28px rgba(45, 108, 223, 0.3), 0 0 0 1px rgba(77, 163, 255, 0.15);
  transform: translateY(-1px);
}

.hero-section__cta:active {
  transform: scale(0.97) translateY(0);
}
</style>
