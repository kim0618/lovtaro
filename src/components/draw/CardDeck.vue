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

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = prefersReduced ? 100 : 1200
  setTimeout(() => { shuffling.value = false }, duration)
})

function isDisabled(cardId) {
  if (shuffling.value) return true
  if (props.selectedIds.includes(cardId)) return false
  // single-select: always allow clicking a new card (replaces current)
  if (props.maxSelect === 1) return false
  return props.selectedIds.length >= props.maxSelect
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

    <!-- Actual card grid -->
    <div class="card-deck__grid" :class="{ 'card-deck__grid--revealed': !shuffling }">
      <TarotCard
        v-for="(card, index) in cards"
        :key="card.id"
        :card-id="card.id"
        :card-name="card.name"
        :image-src="card.image"
        :selected="selectedIds.includes(card.id) || selectedId === card.id"
        :disabled="isDisabled(card.id)"
        :style="!shuffling ? { animationDelay: `${index * 30}ms` } : {}"
        :class="{ 'card-deck__card-enter': !shuffling }"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.card-deck {
  position: relative;
  min-height: 200px;
  padding: 0 var(--lt-space-md);
}

.card-deck__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--lt-space-sm);
  opacity: 0;
  transition: opacity 400ms ease;
}

.card-deck__grid--revealed {
  opacity: 1;
}

/* Individual card entrance after shuffle */
.card-deck__card-enter {
  animation: deck-card-appear 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes deck-card-appear {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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
  0% {
    transform: rotate(0deg) translateX(0);
    opacity: 0.9;
  }
  25% {
    transform: rotate(calc(var(--fan-angle, 0deg))) translateX(calc(var(--fan-x, 0px)));
    opacity: 1;
  }
  50% {
    transform: rotate(0deg) translateX(0) translateY(-4px);
    opacity: 0.85;
  }
  75% {
    transform: rotate(calc(var(--fan-angle, 0deg) * -0.5)) translateX(calc(var(--fan-x, 0px) * -0.5));
    opacity: 1;
  }
  100% {
    transform: rotate(0deg) translateX(0);
    opacity: 0.9;
  }
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

/* Overlay exit transition */
.shuffle-overlay-leave-active {
  transition: opacity 300ms ease;
}
.shuffle-overlay-leave-to {
  opacity: 0;
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .card-deck__shuffle-card {
    animation: none;
  }
  .card-deck__card-enter {
    animation: none;
  }
  .card-deck__shuffle-text {
    animation: none;
    opacity: 1;
  }
}
</style>
