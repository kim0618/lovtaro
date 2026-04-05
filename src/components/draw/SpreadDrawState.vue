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

const emit = defineEmits(['remove'])

function handleSlotClick(index) {
  const card = props.selectedCards[index]
  if (card && card.id) {
    emit('remove', card.id)
  }
}

const justFilled = ref(props.positions.map(() => false))

const nextSlotIndex = computed(() =>
  props.selectedCards.findIndex(c => !c)
)

const filledCount = computed(() =>
  props.selectedCards.filter(Boolean).length
)

watch(
  () => props.selectedCards.map(c => c?.id).join(','),
  (newVal, oldVal) => {
    const newIds = newVal.split(',')
    const oldIds = oldVal.split(',')
    newIds.forEach((id, idx) => {
      if (id && id !== oldIds[idx]) {
        justFilled.value[idx] = true
        setTimeout(() => { justFilled.value[idx] = false }, 700)
      }
    })
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
        @click="handleSlotClick(i)"
      >
        <div class="spread-draw-state__card-area">
            <div v-if="props.selectedCards[i]" class="spread-draw-state__card-back">
              <svg class="spread-draw-state__card-art" viewBox="0 0 120 198" fill="none">
                <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
                <rect x="9" y="9" width="102" height="180" rx="4" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5"/>
                <path d="M13 21 Q13 13 21 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <path d="M107 21 Q107 13 99 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <path d="M13 177 Q13 185 21 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <path d="M107 177 Q107 185 99 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="0.5" fill="none"/>
                <path d="M40 99 C48 85 54 81 60 81 C66 81 72 85 80 99 C72 113 66 117 60 117 C54 117 48 113 40 99Z" stroke="#C8A96E" stroke-opacity="0.6" stroke-width="0.8" fill="none"/>
                <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="none"/>
                <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
              </svg>
              <div class="spread-draw-state__card-shimmer" />
            </div>
            <div v-else class="spread-draw-state__card-empty">
              <span class="spread-draw-state__num">{{ i + 1 }}</span>
            </div>
        </div>
        <span class="spread-draw-state__pos">{{ pos }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spread-draw-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--lt-space-md) var(--lt-space-md) var(--lt-space-sm);
}

.spread-draw-state__slots {
  display: flex;
  flex-direction: row;
  gap: var(--lt-space-xl);
  justify-content: center;
}

.spread-draw-state__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.spread-draw-state__slot--filled {
  cursor: pointer;
}

.spread-draw-state__slot--filled:hover .spread-draw-state__card-back {
  border-color: rgba(255, 100, 100, 0.4);
  box-shadow: 0 0 10px rgba(255, 100, 100, 0.12);
}

.spread-draw-state__card-area {
  width: 48px;
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spread-draw-state__card-empty {
  width: 48px;
  height: 78px;
  border: 1px dashed var(--lt-line-soft);
  border-radius: var(--lt-radius-sm);
  background-color: var(--lt-bg-1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spread-draw-state__num {
  font-size: 0.9rem;
  color: var(--lt-line-soft);
  font-family: var(--lt-font-display);
}

.spread-draw-state__card-back {
  width: 48px;
  height: 78px;
  border-radius: var(--lt-radius-sm);
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1.5px solid rgba(200, 169, 110, 0.45);
  box-shadow:
    0 0 10px rgba(200, 169, 110, 0.15),
    0 0 20px rgba(77, 163, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
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
    rgba(143, 211, 255, 0.15) 50%,
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

.spread-draw-state__pos {
  font-size: 0.62rem;
  font-weight: 400;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
}

.spread-draw-state__slot--filled .spread-draw-state__pos {
  color: var(--lt-accent-2);
}

/* ── 다음에 채워질 슬롯 ── */
.spread-draw-state__slot--next .spread-draw-state__card-empty {
  border-color: rgba(143, 211, 255, 0.45);
  animation: next-slot-pulse 1.8s ease-in-out infinite;
}

.spread-draw-state__slot--next .spread-draw-state__num {
  color: rgba(143, 211, 255, 0.7);
}

.spread-draw-state__slot--next .spread-draw-state__pos {
  color: var(--lt-accent-2);
  opacity: 0.8;
}

@keyframes next-slot-pulse {
  0%, 100% {
    border-color: rgba(143, 211, 255, 0.35);
    box-shadow: none;
  }
  50% {
    border-color: rgba(143, 211, 255, 0.6);
    box-shadow: 0 0 8px rgba(77, 163, 255, 0.1);
  }
}

/* 카드 등장 */
.spread-draw-state__card-back {
  animation: slot-fade-in 0.4s ease both;
}

@keyframes slot-fade-in {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .spread-draw-state__card-back,
  .spread-draw-state__card-shimmer,
  .spread-draw-state__slot--next .spread-draw-state__card-empty {
    animation: none;
  }
}
</style>
