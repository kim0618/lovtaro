<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  selectedCards: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['remove'])

function handleSlotClick(index) {
  const card = props.selectedCards[index]
  if (card && card.id) {
    emit('remove', card.id)
  }
}

const POSITIONS = ['과거', '현재', '미래']

const justFilled = ref([false, false, false])

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
  <div class="three-card-draw-state">
    <div class="three-card-draw-state__slots">
      <div
        v-for="(pos, i) in POSITIONS"
        :key="pos"
        class="three-card-draw-state__slot"
        :class="{
          'three-card-draw-state__slot--filled': !!props.selectedCards[i],
          'three-card-draw-state__slot--just-filled': justFilled[i],
        }"
        @click="handleSlotClick(i)"
      >
        <div class="three-card-draw-state__card-area">
            <div v-if="props.selectedCards[i]" class="three-card-draw-state__card-back">
              <svg class="three-card-draw-state__card-art" viewBox="0 0 120 198" fill="none">
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
              <div class="three-card-draw-state__card-shimmer" />
            </div>
            <div v-else class="three-card-draw-state__card-empty">
              <span class="three-card-draw-state__num">{{ i + 1 }}</span>
            </div>
        </div>
        <div class="three-card-draw-state__slot-info">
          <span class="three-card-draw-state__pos">{{ pos }}</span>
          <span v-if="props.selectedCards[i]" class="three-card-draw-state__card-chosen">선택됨</span>
          <span v-else class="three-card-draw-state__hint">선택 전</span>
        </div>
      </div>
    </div>
    <p class="three-card-draw-state__count">
      <span class="three-card-draw-state__count-now">{{ filledCount }}</span>
      / 3장 선택됨
    </p>
  </div>
</template>

<style scoped>
.three-card-draw-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-md);
  padding: var(--lt-space-lg) var(--lt-space-md);
}

.three-card-draw-state__slots {
  display: flex;
  gap: var(--lt-space-lg);
  justify-content: center;
}

.three-card-draw-state__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-xs);
}

.three-card-draw-state__slot--filled {
  cursor: pointer;
}

.three-card-draw-state__slot--filled:hover .three-card-draw-state__card-back {
  border-color: rgba(255, 100, 100, 0.4);
  box-shadow: 0 0 12px rgba(255, 100, 100, 0.15);
}

.three-card-draw-state__card-area {
  width: 64px;
  height: 106px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.three-card-draw-state__card-empty {
  width: 64px;
  height: 106px;
  border: 1px dashed var(--lt-line-soft);
  border-radius: var(--lt-radius-sm);
  background-color: var(--lt-bg-1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.three-card-draw-state__num {
  font-size: 1.2rem;
  color: var(--lt-line-soft);
  font-family: var(--lt-font-display);
}

.three-card-draw-state__card-back {
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
  animation: slot-glow-pulse 2.2s ease-in-out infinite;
}

@keyframes slot-glow-pulse {
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

.three-card-draw-state__card-art {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.three-card-draw-state__card-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 25%,
    rgba(143, 211, 255, 0.2) 50%,
    transparent 75%
  );
  animation: slot-shimmer-loop 3s ease-in-out infinite 0.3s;
  pointer-events: none;
}

@keyframes slot-shimmer-loop {
  0%, 70%, 100% { transform: translateX(-150%); opacity: 0; }
  30%            { transform: translateX(-150%); opacity: 0; }
  50%            { transform: translateX(150%);  opacity: 1; }
}


.three-card-draw-state__slot-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.three-card-draw-state__pos {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--lt-accent-2);
  letter-spacing: 0.05em;
}

.three-card-draw-state__card-chosen {
  font-size: 0.68rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.three-card-draw-state__hint {
  font-size: 0.7rem;
  color: var(--lt-text-muted);
}

.three-card-draw-state__count {
  font-size: 0.8rem;
  color: var(--lt-text-muted);
}

.three-card-draw-state__count-now {
  font-weight: 500;
  color: var(--lt-accent-2);
  font-size: 0.95rem;
}

/* 카드 등장: 점점 나타남 */
.three-card-draw-state__card-back {
  animation: slot-fade-in 0.5s ease both;
}

@keyframes slot-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* just-filled 상태에서 슬롯 라벨 강조 */
.three-card-draw-state__slot--just-filled .three-card-draw-state__card-chosen {
  animation: chosen-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes chosen-pop {
  0%   { opacity: 0; transform: scale(0.7) translateY(4px); }
  70%  { opacity: 1; transform: scale(1.1) translateY(-1px); }
  100% { opacity: 0.7; transform: scale(1) translateY(0); }
}

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .three-card-draw-state__card-back,
  .three-card-draw-state__card-shimmer {
    animation: none;
  }
}
</style>
