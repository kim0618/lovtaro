<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  selectedCards: {
    type: Array,
    default: () => [],
  },
  positions: {
    type: Array,
    required: true,
  },
})

const justFilled = ref(props.positions.map(() => false))

// The slot that will receive the next card
const nextSlotIndex = computed(() =>
  props.selectedCards.length < props.positions.length ? props.selectedCards.length : -1
)

watch(
  () => props.selectedCards.length,
  (newLen, oldLen) => {
    if (newLen > oldLen && newLen > 0) {
      const idx = newLen - 1
      justFilled.value[idx] = true
      setTimeout(() => { justFilled.value[idx] = false }, 700)
    }
  }
)
</script>

<template>
  <div class="spread-draw-state">
    <div class="spread-draw-state__slots">
      <div
        v-for="(pos, i) in positions"
        :key="pos"
        class="spread-draw-state__slot"
        :class="{
          'spread-draw-state__slot--filled': !!props.selectedCards[i],
          'spread-draw-state__slot--just-filled': justFilled[i],
          'spread-draw-state__slot--next': i === nextSlotIndex && !justFilled[i],
        }"
      >
        <div class="spread-draw-state__card-area">
          <Transition name="slot-fill">
            <div v-if="props.selectedCards[i]" class="spread-draw-state__card-back filled">
              <svg class="spread-draw-state__card-art" viewBox="0 0 120 198" fill="none">
                <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
                <rect x="9" y="9" width="102" height="180" rx="4" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5"/>
                <path d="M13 21 Q13 13 21 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <path d="M107 21 Q107 13 99 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <path d="M13 177 Q13 185 21 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <path d="M107 177 Q107 185 99 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <circle cx="40" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
                <circle cx="42.5" cy="30.5" r="4" fill="#0A1020"/>
                <circle cx="60" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
                <circle cx="80" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
                <circle cx="77.5" cy="30.5" r="4" fill="#0A1020"/>
                <line x1="60" y1="40" x2="60" y2="68" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
                <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>
                <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>
                <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="0.5" fill="none"/>
                <path d="M40 99 C48 85 54 81 60 81 C66 81 72 85 80 99 C72 113 66 117 60 117 C54 117 48 113 40 99Z" stroke="#C8A96E" stroke-opacity="0.6" stroke-width="0.8" fill="none"/>
                <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="none"/>
                <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
                <line x1="60" y1="130" x2="60" y2="158" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
                <circle cx="40" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
                <circle cx="37.5" cy="167.5" r="4" fill="#0A1020"/>
                <circle cx="60" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
                <circle cx="80" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
                <circle cx="82.5" cy="167.5" r="4" fill="#0A1020"/>
              </svg>
              <div class="spread-draw-state__card-shimmer" />
            </div>
            <div v-else class="spread-draw-state__card-empty">
              <span class="spread-draw-state__num">{{ i + 1 }}</span>
            </div>
          </Transition>
        </div>
        <div class="spread-draw-state__slot-info">
          <span class="spread-draw-state__pos">{{ pos }}</span>
          <span v-if="props.selectedCards[i]" class="spread-draw-state__card-chosen">선택됨</span>
          <span v-else class="spread-draw-state__hint">선택 전</span>
        </div>
      </div>
    </div>
    <p class="spread-draw-state__count">
      <span class="spread-draw-state__count-now">{{ props.selectedCards.length }}</span>
      / {{ positions.length }}장 선택됨
    </p>
  </div>
</template>

<style scoped>
.spread-draw-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-md);
  padding: var(--lt-space-lg) var(--lt-space-md);
}


.spread-draw-state__slots {
  display: flex;
  flex-direction: row;
  gap: var(--lt-space-lg);
  justify-content: center;
}

.spread-draw-state__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-xs);
}

.spread-draw-state__card-area {
  width: 64px;
  height: 106px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spread-draw-state__card-empty {
  width: 64px;
  height: 106px;
  border: 1px dashed var(--lt-line-soft);
  border-radius: var(--lt-radius-sm);
  background-color: var(--lt-bg-1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spread-draw-state__num {
  font-size: 1.2rem;
  color: var(--lt-line-soft);
  font-family: var(--lt-font-display);
}

.spread-draw-state__card-back {
  width: 64px;
  height: 106px;
  border-radius: var(--lt-radius-sm);
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1.5px solid rgba(200, 169, 110, 0.45);
  box-shadow:
    0 0 0 1px rgba(200, 169, 110, 0.12),
    0 0 16px rgba(200, 169, 110, 0.18),
    0 0 32px rgba(77, 163, 255, 0.1),
    var(--lt-shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  animation: spread-slot-glow 2.2s ease-in-out infinite;
}

@keyframes spread-slot-glow {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(200, 169, 110, 0.12),
      0 0 16px rgba(200, 169, 110, 0.18),
      0 0 32px rgba(77, 163, 255, 0.1),
      var(--lt-shadow-sm);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(212, 184, 122, 0.25),
      0 0 22px rgba(200, 169, 110, 0.3),
      0 0 44px rgba(77, 163, 255, 0.16),
      var(--lt-shadow-sm);
  }
}

.spread-draw-state__card-art {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.spread-draw-state__card-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 25%,
    rgba(143, 211, 255, 0.2) 50%,
    transparent 75%
  );
  animation: spread-shimmer-loop 3s ease-in-out infinite 0.3s;
  pointer-events: none;
}

@keyframes spread-shimmer-loop {
  0%, 70%, 100% { transform: translateX(-150%); opacity: 0; }
  30%            { transform: translateX(-150%); opacity: 0; }
  50%            { transform: translateX(150%);  opacity: 1; }
}


.spread-draw-state__slot-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.spread-draw-state__pos {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--lt-accent-2);
  letter-spacing: 0.05em;
}

/* ── 다음에 채워질 슬롯 ── */
.spread-draw-state__slot--next .spread-draw-state__card-empty {
  border-style: dashed;
  border-color: rgba(143, 211, 255, 0.45);
  animation: next-slot-pulse 1.8s ease-in-out infinite;
}

.spread-draw-state__slot--next .spread-draw-state__num {
  color: rgba(143, 211, 255, 0.7);
}

.spread-draw-state__slot--next .spread-draw-state__hint {
  color: var(--lt-accent-2);
  opacity: 0.7;
}

@keyframes next-slot-pulse {
  0%, 100% {
    border-color: rgba(143, 211, 255, 0.35);
    box-shadow: none;
  }
  50% {
    border-color: rgba(143, 211, 255, 0.65);
    box-shadow: 0 0 12px rgba(77, 163, 255, 0.12), inset 0 0 8px rgba(77, 163, 255, 0.06);
  }
}

.spread-draw-state__card-chosen {
  font-size: 0.68rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.05em;
  opacity: 0.85;
}

.spread-draw-state__hint {
  font-size: 0.7rem;
  color: var(--lt-text-muted);
}

.spread-draw-state__count {
  font-size: 0.8rem;
  color: var(--lt-text-muted);
}

.spread-draw-state__count-now {
  font-weight: 500;
  color: var(--lt-accent-2);
  font-size: 0.95rem;
}

/* 카드 등장 트랜지션 */
.slot-fill-enter-active {
  animation: slot-card-appear 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.slot-fill-leave-active {
  animation: slot-card-disappear 0.25s ease both;
}

@keyframes slot-card-appear {
  0%   { opacity: 0; transform: translateY(-20px) scale(0.7) rotateX(25deg); }
  60%  { opacity: 1; transform: translateY(3px) scale(1.06) rotateX(-3deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0deg); }
}

@keyframes slot-card-disappear {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.85); }
}

.spread-draw-state__slot--just-filled .spread-draw-state__card-chosen {
  animation: chosen-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes chosen-pop {
  0%   { opacity: 0; transform: scale(0.7) translateY(4px); }
  70%  { opacity: 1; transform: scale(1.1) translateY(-1px); }
  100% { opacity: 0.7; transform: scale(1) translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .spread-draw-state__card-back,
  .spread-draw-state__card-shimmer,
  .spread-draw-state__slot--next .spread-draw-state__card-empty {
    animation: none;
  }
  .slot-fill-enter-active,
  .slot-fill-leave-active {
    animation: none;
    transition: opacity 0.2s;
  }
}
</style>
