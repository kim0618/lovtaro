<script setup>
import { ref, onMounted } from 'vue'
import TarotCard from './TarotCard.vue'

const props = defineProps({
  cards: {
    type: Array,
    required: true,
  },
  selectedId: {
    type: String,
    default: '',
  },
  maxSelect: {
    type: Number,
    default: 1,
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select'])

const shuffling = ref(true)
const scrollRef = ref(null)

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = prefersReduced ? 100 : 1200
  setTimeout(() => {
    shuffling.value = false
    if (scrollRef.value) {
      const el = scrollRef.value
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    }
  }, duration)
})

function isDisabled(cardId) {
  if (shuffling.value) return true
  if (props.selectedIds.includes(cardId)) return false
  if (props.maxSelect === 1) return false
  return props.selectedIds.filter(Boolean).length >= props.maxSelect
}

function getSelectedOrder(cardId) {
  if (!cardId) return 0
  const idx = props.selectedIds.indexOf(cardId)
  return idx >= 0 ? idx + 1 : 0
}
</script>

<template>
  <div class="card-deck" :class="{ 'card-deck--shuffling': shuffling }">
    <!-- Shuffle overlay -->
    <Transition name="shuffle-overlay">
      <div v-if="shuffling" class="card-deck__shuffle-overlay" aria-live="polite">
        <div class="card-deck__shuffle-stack">
          <div
            v-for="i in 5"
            :key="i"
            class="card-deck__shuffle-card"
            :style="{ animationDelay: `${(i - 1) * 80}ms` }"
          />
        </div>
        <p class="card-deck__shuffle-text">카드를 섞고 있습니다</p>
      </div>
    </Transition>

    <!-- Horizontal scroll deck -->
    <div class="card-deck__wrapper">
      <button
        v-if="!shuffling"
        class="card-deck__arrow card-deck__arrow--left"
        aria-label="왼쪽으로 스크롤"
        @click="scrollRef.scrollBy({ left: -320, behavior: 'smooth' })"
      >&#8249;</button>

      <div
        class="card-deck__scroll"
        :class="{ 'card-deck__scroll--revealed': !shuffling }"
      >
        <div
          ref="scrollRef"
          class="card-deck__scroll-inner"
          role="group"
          aria-label="타로 카드 선택"
        >
          <div class="card-deck__track">
          <TarotCard
            v-for="(card, index) in cards"
            :key="card.id"
            :card-id="card.id"
            :card-name="card.name"
            :image-src="card.image"
            :selected="selectedIds.includes(card.id) || selectedId === card.id"
            :selected-order="getSelectedOrder(card.id)"
            :disabled="isDisabled(card.id)"
            :style="!shuffling ? { animationDelay: `${index * 50}ms` } : {}"
            :class="{ 'card-deck__card-enter': !shuffling }"
            @select="emit('select', $event)"
          />
          </div>
        </div>
      </div>

      <button
        v-if="!shuffling"
        class="card-deck__arrow card-deck__arrow--right"
        aria-label="오른쪽으로 스크롤"
        @click="scrollRef.scrollBy({ left: 320, behavior: 'smooth' })"
      >&#8250;</button>
    </div>

    <p v-if="!shuffling" class="card-deck__hint">좌우로 밀어서 카드를 탐색하세요</p>
  </div>
</template>

<style scoped>
.card-deck {
  position: relative;
  min-height: 140px;
}

.card-deck__wrapper {
  position: relative;
}

/* Scroll arrows */
.card-deck__arrow {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 5;
  width: 36px;
  border: none;
  background: transparent;
  color: rgba(200, 210, 255, 0.6);
  font-size: 1.3rem;
  cursor: pointer;
  transition: color 300ms ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-deck__arrow::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.card-deck__arrow:hover {
  color: rgba(200, 210, 255, 0.95);
}

.card-deck__arrow--left { left: 0; }
.card-deck__arrow--left::before {
  background: linear-gradient(to right, rgba(13, 17, 23, 0.85), transparent);
}

.card-deck__arrow--right { right: 0; }
.card-deck__arrow--right::before {
  background: linear-gradient(to left, rgba(13, 17, 23, 0.85), transparent);
}

/* Horizontal scroll */
.card-deck__scroll {
  overflow: hidden;
  opacity: 0;
  transition: opacity 400ms ease;
}

.card-deck__scroll--revealed {
  opacity: 1;
}

.card-deck__scroll-inner {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 24px 0 12px;
}

.card-deck__scroll-inner::-webkit-scrollbar {
  display: none;
}

.card-deck__track {
  display: inline-flex;
  align-items: flex-end;
  gap: 8px;
  padding: 0 48px;
}

.card-deck__track > * {
  flex-shrink: 0;
}

/* Card deal animation */
.card-deck__card-enter {
  animation: card-deal 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes card-deal {
  0% {
    opacity: 0;
    transform: translateX(calc(50vw - 100%)) translateY(-30px) rotate(8deg) scale(0.7);
    filter: blur(2px);
  }
  40% {
    opacity: 1;
    filter: blur(0);
  }
  70% {
    transform: translateX(0) translateY(-4px) rotate(-1deg) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(0deg) scale(1);
    filter: blur(0);
  }
}

/* Scroll hint */
.card-deck__hint {
  text-align: center;
  font-size: 0.62rem;
  color: var(--lt-text-muted);
  opacity: 0.4;
  letter-spacing: 0.06em;
  padding: 4px 0 0;
  animation: hint-fade 2.5s ease forwards;
}

@keyframes hint-fade {
  0%, 60% { opacity: 0.4; }
  100%    { opacity: 0; }
}

/* ── Shuffle Overlay ── */
.card-deck__shuffle-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--lt-space-lg);
  z-index: 2;
}

.card-deck__shuffle-stack {
  position: relative;
  width: 80px;
  height: 120px;
}

.card-deck__shuffle-card {
  position: absolute;
  inset: 0;
  border-radius: var(--lt-radius-sm);
  background: linear-gradient(170deg, var(--lt-bg-3) 0%, var(--lt-bg-1) 50%, var(--lt-bg-0) 100%);
  border: 1px solid var(--lt-line-soft);
  animation: shuffle-fan 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

@keyframes shuffle-fan {
  0% { transform: rotate(0deg) translateX(0); opacity: 0.9; }
  25% { transform: rotate(calc(var(--fan-angle, 0deg))) translateX(calc(var(--fan-x, 0px))); opacity: 1; }
  50% { transform: rotate(0deg) translateX(0) translateY(-4px); opacity: 0.85; }
  75% { transform: rotate(calc(var(--fan-angle, 0deg) * -0.5)) translateX(calc(var(--fan-x, 0px) * -0.5)); opacity: 1; }
  100% { transform: rotate(0deg) translateX(0); opacity: 0.9; }
}

.card-deck__shuffle-card:nth-child(1) { --fan-angle: -12deg; --fan-x: -18px; }
.card-deck__shuffle-card:nth-child(2) { --fan-angle: -6deg;  --fan-x: -8px; }
.card-deck__shuffle-card:nth-child(3) { --fan-angle: 0deg;   --fan-x: 0px; }
.card-deck__shuffle-card:nth-child(4) { --fan-angle: 6deg;   --fan-x: 8px; }
.card-deck__shuffle-card:nth-child(5) { --fan-angle: 12deg;  --fan-x: 18px; }

.card-deck__shuffle-text {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.12em;
  animation: lt-fade-in 400ms ease 200ms both;
}

.shuffle-overlay-leave-active {
  transition: opacity 300ms ease;
}
.shuffle-overlay-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .card-deck__shuffle-card,
  .card-deck__card-enter,
  .card-deck__hint {
    animation: none;
  }
  .card-deck__shuffle-text {
    animation: none;
    opacity: 1;
  }
}
</style>
