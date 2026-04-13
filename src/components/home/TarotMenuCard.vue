<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  to: { type: String, required: true },
  tag: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  hero: { type: Boolean, default: false },
})

const router = useRouter()
</script>

<template>
  <!-- Hero variant: card with illustration -->
  <button
    v-if="hero"
    class="tarot-menu-hero"
    @click="router.push(props.to)"
  >
    <div class="tarot-menu-hero__cards" aria-hidden="true">
      <div v-for="i in 3" :key="i" class="tarot-menu-hero__card-back">
        <svg viewBox="0 0 120 198" fill="none">
          <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
          <rect x="9" y="9" width="102" height="180" rx="4" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5"/>
          <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>
          <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>
          <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="0.5" fill="none"/>
          <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
        </svg>
      </div>
    </div>
    <div class="tarot-menu-hero__copy">
      <span v-if="tag" class="tarot-menu-hero__tag">{{ tag }}</span>
      <h3 class="tarot-menu-hero__title">{{ title }}</h3>
      <p class="tarot-menu-hero__desc">{{ description }}</p>
    </div>
    <span class="tarot-menu-hero__arrow">시작하기 →</span>
  </button>

  <!-- Default variant: list item -->
  <button
    v-else
    class="tarot-menu-card"
    :class="{ 'tarot-menu-card--featured': featured }"
    @click="router.push(props.to)"
  >
    <div class="tarot-menu-card__body">
      <span v-if="tag" class="tarot-menu-card__tag">{{ tag }}</span>
      <div class="tarot-menu-card__text">
        <h3 class="tarot-menu-card__title">{{ title }}</h3>
        <p class="tarot-menu-card__desc">{{ description }}</p>
      </div>
    </div>
    <span class="tarot-menu-card__arrow" aria-hidden="true">&#8594;</span>
  </button>
</template>

<style scoped>
.tarot-menu-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid var(--lt-border-soft);
  padding: var(--lt-space-lg) 0;
  cursor: pointer;
  transition: opacity var(--lt-transition);
}

.tarot-menu-card:hover {
  opacity: 0.75;
}

.tarot-menu-card--featured {
  position: relative;
}

.tarot-menu-card--featured::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 28px;
  background: linear-gradient(to bottom, var(--lt-accent-2), transparent);
  opacity: 0.5;
}

.tarot-menu-card--featured .tarot-menu-card__title {
  color: var(--lt-text-strong);
}

.tarot-menu-card__body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.tarot-menu-card__tag {
  font-size: 0.6rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.8;
}

.tarot-menu-card__text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tarot-menu-card__title {
  font-family: var(--lt-font-sans);
  font-size: 0.98rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.01em;
}

.tarot-menu-card__desc {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  line-height: 1.5;
}

.tarot-menu-card__arrow {
  font-size: 0.8rem;
  color: var(--lt-text-muted);
  flex-shrink: 0;
  margin-left: var(--lt-space-md);
  transition: transform var(--lt-transition), color var(--lt-transition);
}

.tarot-menu-card:hover .tarot-menu-card__arrow {
  transform: translateX(3px);
  color: var(--lt-accent-2);
}

/* ── Hero variant ── */
.tarot-menu-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-md);
  width: 100%;
  text-align: center;
  background: linear-gradient(170deg, rgba(16, 26, 49, 0.85) 0%, rgba(10, 16, 32, 0.9) 100%);
  border: 1px solid rgba(200, 169, 110, 0.15);
  border-radius: var(--lt-radius-md);
  padding: var(--lt-space-xl) var(--lt-space-lg) var(--lt-space-lg);
  margin-bottom: var(--lt-space-sm);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    border-color 300ms ease,
    box-shadow 300ms ease;
}

.tarot-menu-hero::before {
  content: '';
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 160px;
  background: radial-gradient(ellipse, rgba(200, 169, 110, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.tarot-menu-hero:hover {
  border-color: rgba(200, 169, 110, 0.3);
  box-shadow: 0 0 24px rgba(200, 169, 110, 0.06);
}

.tarot-menu-hero__cards {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.tarot-menu-hero__card-back {
  width: 44px;
  height: 68px;
  background: linear-gradient(170deg, #101A31 0%, #060A14 100%);
  border-radius: 4px;
  border: 1px solid rgba(200, 169, 110, 0.25);
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4), 0 0 8px rgba(200, 169, 110, 0.05);
  transition: border-color 300ms ease, box-shadow 300ms ease;
}

.tarot-menu-hero:hover .tarot-menu-hero__card-back {
  border-color: rgba(200, 169, 110, 0.45);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4), 0 0 16px rgba(200, 169, 110, 0.08);
}

.tarot-menu-hero__card-back svg {
  width: 100%;
  height: 100%;
}

.tarot-menu-hero__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.tarot-menu-hero__tag {
  font-size: 0.55rem;
  color: var(--lt-gold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.7;
}

.tarot-menu-hero__title {
  font-family: var(--lt-font-sans);
  font-size: 1rem;
  font-weight: 400;
  color: var(--lt-text-strong);
  letter-spacing: 0.02em;
}

.tarot-menu-hero__desc {
  font-size: 0.8rem;
  color: var(--lt-text-muted);
  line-height: 1.6;
  letter-spacing: 0.01em;
}

.tarot-menu-hero__arrow {
  font-size: 0.72rem;
  color: rgba(200, 169, 110, 0.6);
  letter-spacing: 0.08em;
  transition: color 300ms ease;
}

.tarot-menu-hero:hover .tarot-menu-hero__arrow {
  color: rgba(200, 169, 110, 0.9);
}
</style>
