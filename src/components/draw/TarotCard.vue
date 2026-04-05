<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  cardId:   { type: String,  default: '' },
  faceUp:   { type: Boolean, default: false },
  imageSrc: { type: String,  default: '' },
  cardName: { type: String,  default: '' },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  selectedOrder: { type: Number, default: 0 },
})

const emit = defineEmits(['select'])

/* ── 3D tilt on hover ── */
const tiltX = ref(0)
const tiltY = ref(0)
const hovering = ref(false)

function handleSelect() {
  if (props.disabled) return
  emit('select', props.cardId)
}

const tiltStyle = computed(() => {
  if (!hovering.value || props.disabled || props.selected) return {}
  return {
    transform: `rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg)`,
  }
})

function onMouseMove(e) {
  if (props.disabled || props.selected) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  tiltX.value = +(y * -14).toFixed(1)
  tiltY.value = +(x * 14).toFixed(1)
  hovering.value = true
}

function onMouseLeave() {
  tiltX.value = 0
  tiltY.value = 0
  hovering.value = false
}
</script>

<template>
  <div
    class="tarot-card"
    :class="{
      'tarot-card--face-up': faceUp,
      'tarot-card--selected': selected,
      'tarot-card--disabled': disabled,
    }"
    role="button"
    :aria-pressed="selected"
    :aria-disabled="disabled"
    @click="handleSelect"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <div class="tarot-card__tilt" :style="tiltStyle">
      <div class="tarot-card__inner">
        <!-- 뒷면: LOVTARO 오리지널 카드 디자인 -->
        <div class="tarot-card__back" aria-hidden="true">
          <svg class="tarot-card__back-art" viewBox="0 0 120 198" fill="none">
            <!-- 외곽 장식 테두리 -->
            <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
            <rect x="9" y="9" width="102" height="180" rx="4" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5"/>

            <!-- 코너 장식 (4모서리) -->
            <path d="M13 21 Q13 13 21 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M13 27 Q13 13 27 13" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.4" fill="none"/>
            <path d="M107 21 Q107 13 99 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M107 27 Q107 13 93 13" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.4" fill="none"/>
            <path d="M13 177 Q13 185 21 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M13 171 Q13 185 27 185" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.4" fill="none"/>
            <path d="M107 177 Q107 185 99 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M107 171 Q107 185 93 185" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.4" fill="none"/>

            <!-- 수직 중심축 -->
            <line x1="60" y1="42" x2="60" y2="156" stroke="#C8A96E" stroke-opacity="0.06" stroke-width="0.4"/>

            <!-- 상단 달 위상: ☽ ● ☾ -->
            <circle cx="40" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="42.5" cy="30.5" r="4" fill="#0A1020"/>
            <circle cx="60" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
            <circle cx="80" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="77.5" cy="30.5" r="4" fill="#0A1020"/>

            <!-- 상단에서 중심으로 연결선 -->
            <line x1="60" y1="40" x2="60" y2="68" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
            <path d="M60 50 L62 53 L60 56 L58 53Z" fill="#C8A96E" fill-opacity="0.3"/>
            <path d="M60 60 L61 62 L60 64 L59 62Z" fill="#C8A96E" fill-opacity="0.2"/>

            <!-- 중심 만다라: 외부 원 -->
            <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>

            <!-- 방사형 눈금 (8방향) -->
            <line x1="60" y1="70" x2="60" y2="74" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
            <line x1="60" y1="124" x2="60" y2="128" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
            <line x1="31" y1="99" x2="35" y2="99" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
            <line x1="85" y1="99" x2="89" y2="99" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
            <line x1="39.5" y1="78.5" x2="42.3" y2="81.3" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
            <line x1="80.5" y1="78.5" x2="77.7" y2="81.3" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
            <line x1="39.5" y1="119.5" x2="42.3" y2="116.7" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
            <line x1="80.5" y1="119.5" x2="77.7" y2="116.7" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>

            <!-- 다이아몬드 (마름모) -->
            <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>

            <!-- 내부 원 -->
            <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="0.5" fill="none"/>

            <!-- 다이아몬드-원 교차점 장식 -->
            <circle cx="60" cy="70" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
            <circle cx="89" cy="99" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
            <circle cx="60" cy="128" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
            <circle cx="31" cy="99" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>

            <!-- ═══ 중심: 올-시잉 아이 ═══ -->
            <path d="M40 99 C48 85 54 81 60 81 C66 81 72 85 80 99 C72 113 66 117 60 117 C54 117 48 113 40 99Z"
                  stroke="#C8A96E" stroke-opacity="0.6" stroke-width="0.8" fill="none"/>
            <!-- 눈 위 장식선 -->
            <path d="M45 92 C50 86 55 83 60 83" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.4" fill="none"/>
            <path d="M75 92 C70 86 65 83 60 83" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.4" fill="none"/>
            <!-- 홍채 -->
            <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="none"/>
            <!-- 동공 -->
            <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
            <!-- 동공 하이라이트 -->
            <circle cx="58.5" cy="97.5" r="1" fill="#0A1020" fill-opacity="0.35"/>

            <!-- 중심에서 하단으로 연결선 -->
            <line x1="60" y1="130" x2="60" y2="158" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
            <path d="M60 134 L61 136 L60 138 L59 136Z" fill="#C8A96E" fill-opacity="0.2"/>
            <path d="M60 144 L62 147 L60 150 L58 147Z" fill="#C8A96E" fill-opacity="0.3"/>

            <!-- 하단 달 위상 (상단 반전): ☾ ● ☽ -->
            <circle cx="40" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="37.5" cy="167.5" r="4" fill="#0A1020"/>
            <circle cx="60" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
            <circle cx="80" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="82.5" cy="167.5" r="4" fill="#0A1020"/>

            <!-- 좌우 장식 점 -->
            <circle cx="21" cy="58" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
            <circle cx="21" cy="99" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
            <circle cx="21" cy="140" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
            <circle cx="99" cy="58" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
            <circle cx="99" cy="99" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
            <circle cx="99" cy="140" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>

            <!-- 흩뿌린 별 -->
            <circle cx="28" cy="46" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
            <circle cx="92" cy="46" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
            <circle cx="25" cy="78" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
            <circle cx="95" cy="120" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
            <circle cx="28" cy="152" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
            <circle cx="92" cy="152" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
            <circle cx="35" cy="70" r="0.4" fill="#C8A96E" fill-opacity="0.15"/>
            <circle cx="85" cy="128" r="0.4" fill="#C8A96E" fill-opacity="0.15"/>
          </svg>
        </div>
        <!-- 앞면 -->
        <div class="tarot-card__front">
          <img
            v-if="imageSrc"
            :src="imageSrc"
            :alt="cardName"
            class="tarot-card__image"
          />
          <div v-else class="tarot-card__placeholder">
            <span class="tarot-card__name">{{ cardName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tarot-card {
  width: 72px;
  cursor: pointer;
  perspective: 900px;
  position: relative;
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.tarot-card:hover:not(.tarot-card--disabled):not(.tarot-card--selected) {
  transform: translateY(-8px) scale(1.03);
}

/* ── 선택됨: 빛나는 글로우 ── */
.tarot-card--selected {
  z-index: 20;
  cursor: pointer;
}

.tarot-card--selected .tarot-card__back {
  border-color: rgba(200, 169, 110, 0.7);
  box-shadow:
    0 0 8px rgba(200, 169, 110, 0.35),
    0 0 24px rgba(200, 169, 110, 0.15),
    0 0 48px rgba(200, 169, 110, 0.08),
    inset 0 0 12px rgba(200, 169, 110, 0.06);
  animation: selected-glow 2.4s ease-in-out infinite;
}

.tarot-card--selected .tarot-card__back::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: var(--lt-radius-sm);
  background: linear-gradient(
    170deg,
    rgba(200, 169, 110, 0.08) 0%,
    transparent 40%,
    rgba(200, 169, 110, 0.05) 70%,
    transparent 100%
  );
  pointer-events: none;
}

@keyframes selected-glow {
  0%, 100% {
    box-shadow:
      0 0 8px rgba(200, 169, 110, 0.3),
      0 0 24px rgba(200, 169, 110, 0.12),
      0 0 48px rgba(200, 169, 110, 0.06),
      inset 0 0 12px rgba(200, 169, 110, 0.04);
  }
  50% {
    box-shadow:
      0 0 12px rgba(200, 169, 110, 0.45),
      0 0 32px rgba(200, 169, 110, 0.2),
      0 0 56px rgba(200, 169, 110, 0.1),
      inset 0 0 16px rgba(200, 169, 110, 0.08);
  }
}

.tarot-card--disabled {
  cursor: default;
  opacity: 0.32;
}

/* ── 3D 틸트 레이어 ── */
.tarot-card__tilt {
  transform-style: preserve-3d;
  transition: transform 150ms ease-out;
}

/* ── 카드 뒤집기 - premium ritual reveal ── */
.tarot-card__inner {
  position: relative;
  width: 72px;
  height: 118px;
  transition: transform 0.72s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-style: preserve-3d;
}

.tarot-card--face-up .tarot-card__inner {
  transform: rotateY(180deg);
}

/* Reveal glow effect during flip */
.tarot-card--face-up .tarot-card__back::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: calc(var(--lt-radius-sm) + 4px);
  background: transparent;
  box-shadow: 0 0 24px rgba(77, 163, 255, 0.2);
  animation: flip-glow 0.72s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  pointer-events: none;
}

@keyframes flip-glow {
  0% { opacity: 0; }
  40% { opacity: 1; }
  100% { opacity: 0; }
}

.tarot-card__back,
.tarot-card__front {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--lt-radius-sm);
  overflow: hidden;
}

/* ── 뒷면 디자인 ── */
.tarot-card__back {
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1px solid rgba(200, 169, 110, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 300ms ease, border-color 300ms ease;
}

.tarot-card__back-art {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* ── 앞면 - premium reveal with subtle light ── */
.tarot-card__front {
  transform: rotateY(180deg);
  background-color: var(--lt-bg-2);
  border: 1px solid var(--lt-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Subtle light sweep on face reveal */
.tarot-card--face-up .tarot-card__front::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 30%,
    rgba(143, 211, 255, 0.08) 50%,
    transparent 70%
  );
  animation: light-sweep 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both;
  pointer-events: none;
  border-radius: var(--lt-radius-sm);
}

@keyframes light-sweep {
  0% { transform: translateX(-100%); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}

.tarot-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tarot-card__placeholder {
  padding: 6px;
  text-align: center;
}

.tarot-card__name {
  font-size: 0.6rem;
  color: var(--lt-accent-2);
  line-height: 1.4;
}

/* ── 접근성: 움직임 감소 설정 ── */
@media (prefers-reduced-motion: reduce) {
  .tarot-card {
    transition: none;
  }
  .tarot-card__inner {
    transition: transform 0.2s ease;
  }
  .tarot-card--selected .tarot-card__back {
    animation: none;
  }
  .tarot-card--selected::before,
  .tarot-card--selected::after,
  .tarot-card--selected .tarot-card__back::after,
  .tarot-card--face-up .tarot-card__back::after,
  .tarot-card--face-up .tarot-card__front::after {
    animation: none;
    display: none;
  }
}
</style>
