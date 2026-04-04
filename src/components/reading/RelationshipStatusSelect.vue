<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['select'])

defineProps({
  readingType: { type: String, default: '' },
})

const statuses = [
  {
    value: 'single',
    label: '솔로',
    desc: '현재 연애 중이 아닌 상태',
  },
  {
    value: 'situationship',
    label: '썸',
    desc: '감정은 있지만 아직 정의되지 않은 관계',
  },
  {
    value: 'dating',
    label: '연애 중',
    desc: '현재 사귀고 있는 상대가 있는 상태',
  },
  {
    value: 'breakup',
    label: '이별 후',
    desc: '이별하거나 재회를 생각 중인 상태',
  },
]

const selected = ref(null)
const transitioning = ref(false)
const confirmed = ref(false)

const hasSelection = computed(() => selected.value !== null)

function onSelect(value) {
  if (confirmed.value) return
  selected.value = value
}

function onConfirm() {
  if (!selected.value || confirmed.value) return
  confirmed.value = true
  setTimeout(() => {
    transitioning.value = true
    setTimeout(() => emit('select', selected.value), 400)
  }, 150)
}
</script>

<template>
  <div class="rs-select" :class="{ 'rs-select--transitioning': transitioning, 'rs-select--chosen': hasSelection }">
    <!-- Decorative glow orb -->
    <div class="rs-select__orb" aria-hidden="true"></div>

    <!-- Step indicator -->
    <div class="rs-select__step">
      <span class="rs-select__step-dot rs-select__step-dot--active"></span>
      <span class="rs-select__step-line" :class="{ 'rs-select__step-line--filled': hasSelection }"></span>
      <span class="rs-select__step-dot" :class="{ 'rs-select__step-dot--active': hasSelection }"></span>
    </div>

    <div class="rs-select__header">
      <p class="rs-select__eyebrow">Step 1</p>
      <h2 class="rs-select__title">지금 어떤 상태인가요?</h2>
      <p class="rs-select__desc">
        가장 가까운 상태를 골라주세요.<br>
        해석의 결이 조금 더 또렷해집니다.
      </p>
    </div>

    <div class="rs-select__grid">
      <button
        v-for="s in statuses"
        :key="s.value"
        class="rs-select__option"
        :class="{
          'rs-select__option--selected': selected === s.value,
          'rs-select__option--dimmed': selected && selected !== s.value,
        }"
        :disabled="confirmed"
        @click="onSelect(s.value)"
      >
        <span class="rs-select__option-label">{{ s.label }}</span>
        <span class="rs-select__option-desc">{{ s.desc }}</span>
        <span v-if="selected === s.value" class="rs-select__option-check" aria-label="선택됨">✓</span>
      </button>
    </div>

    <!-- Bottom area: CTA + note -->
    <div class="rs-select__bottom">
      <transition name="rs-cta">
        <button
          v-if="hasSelection && !confirmed"
          class="rs-select__cta"
          @click="onConfirm"
        >
          선택한 상태로 카드 고르기
        </button>
      </transition>

      <transition name="rs-cta">
        <p v-if="confirmed" class="rs-select__confirm">
          <span class="rs-select__confirm-dot"></span>
          카드를 준비하고 있습니다
        </p>
      </transition>

      <p class="rs-select__note">이 선택은 결과 해석에만 반영되며 저장되지 않아요.</p>
    </div>
  </div>
</template>

<style scoped>
.rs-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 var(--lt-space-md);
  padding-top: 14vh;
  padding-bottom: 6vh;
  min-height: 100dvh;
  gap: 0;
  position: relative;
  overflow: hidden;
}

/* ── Decorative orb ── */
.rs-select__orb {
  position: absolute;
  top: 3vh;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(77, 130, 255, 0.08) 0%, rgba(45, 90, 200, 0.03) 40%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  animation: rs-orb-breathe 6s ease-in-out infinite;
}

@keyframes rs-orb-breathe {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
}

/* ── Step indicator ── */
.rs-select__step {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 18px;
  animation: rs-header-in 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.rs-select__step-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--lt-line-soft);
  transition: background 400ms ease, box-shadow 400ms ease;
}

.rs-select__step-dot--active {
  background: var(--lt-accent-2);
  box-shadow: 0 0 8px rgba(77, 163, 255, 0.4);
}

.rs-select__step-line {
  width: 32px;
  height: 1px;
  background: var(--lt-line-soft);
  position: relative;
  overflow: hidden;
}

.rs-select__step-line::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: var(--lt-accent-2);
  transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

.rs-select__step-line--filled::after {
  width: 100%;
}

/* ── Header ── */
.rs-select__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
  animation: rs-header-in 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.rs-select__eyebrow {
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  color: var(--lt-accent-2);
  opacity: 0.55;
  text-transform: uppercase;
  font-weight: 500;
}

.rs-select__title {
  font-family: var(--lt-font-sans);
  font-size: 1.4rem;
  font-weight: 200;
  color: var(--lt-text-strong);
  letter-spacing: 0.06em;
  margin-top: 2px;
}

.rs-select__desc {
  font-size: 0.76rem;
  color: var(--lt-text-muted);
  line-height: 1.7;
  letter-spacing: 0.03em;
  max-width: 260px;
  margin: 4px auto 0;
}

/* ── Grid ── */
.rs-select__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 340px;
}

/* ── Option card ── */
.rs-select__option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 20px var(--lt-space-md) 18px;
  background: linear-gradient(160deg, var(--lt-bg-card) 0%, rgba(14, 22, 42, 0.9) 100%);
  border: 1px solid rgba(120, 150, 200, 0.15);
  border-radius: var(--lt-radius-lg);
  text-align: left;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  transition:
    background 280ms ease,
    border-color 280ms ease,
    box-shadow 280ms ease,
    transform 280ms ease,
    opacity 350ms ease;
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: rs-option-in 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.rs-select__option:nth-child(1) { animation-delay: 80ms; }
.rs-select__option:nth-child(2) { animation-delay: 140ms; }
.rs-select__option:nth-child(3) { animation-delay: 200ms; }
.rs-select__option:nth-child(4) { animation-delay: 260ms; }

@keyframes rs-header-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes rs-option-in {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.rs-select__option::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(77, 163, 255, 0.05) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 250ms ease;
}

.rs-select__option:hover {
  background: linear-gradient(160deg, #0E1A30 0%, #12223E 100%);
  border-color: rgba(199, 215, 248, 0.3);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 1px rgba(199, 215, 248, 0.2);
}

.rs-select__option:hover::before {
  opacity: 1;
}

.rs-select__option:hover .rs-select__option-label {
  color: #F4F8FF;
}

.rs-select__option:active {
  transform: scale(0.97);
  border-color: rgba(143, 211, 255, 0.6);
  box-shadow:
    0 0 18px rgba(77, 163, 255, 0.2),
    inset 0 0 16px rgba(77, 163, 255, 0.05);
  background: linear-gradient(160deg, #0F1D38 0%, #142A52 50%, #0D1E42 100%);
  transition: all 120ms ease;
}

/* ── Selected state ── */
.rs-select__option--selected {
  opacity: 1;
  border-color: rgba(143, 211, 255, 0.75);
  background: linear-gradient(160deg, #091428 0%, #102660 45%, #081840 100%);
  box-shadow:
    0 0 0 1px rgba(100, 180, 255, 0.3),
    0 0 20px rgba(77, 163, 255, 0.18),
    0 0 40px rgba(45, 108, 223, 0.08),
    0 4px 20px rgba(0, 0, 0, 0.45);
  animation: rs-selected-pulse 3.2s ease-in-out infinite;
}

.rs-select__option--selected::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(77, 163, 255, 0.12) 0%, rgba(143, 211, 255, 0.04) 40%, transparent 70%);
}

.rs-select__option--selected .rs-select__option-label {
  color: #FFFFFF;
  font-weight: 500;
  text-shadow: 0 0 16px rgba(143, 211, 255, 0.4);
}

.rs-select__option--selected .rs-select__option-desc {
  color: rgba(200, 215, 240, 0.95);
}

@keyframes rs-selected-pulse {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(100, 180, 255, 0.3),
      0 0 20px rgba(77, 163, 255, 0.18),
      0 0 40px rgba(45, 108, 223, 0.08),
      0 4px 20px rgba(0, 0, 0, 0.45);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(100, 180, 255, 0.4),
      0 0 26px rgba(77, 163, 255, 0.24),
      0 0 48px rgba(45, 108, 223, 0.1),
      0 4px 20px rgba(0, 0, 0, 0.45);
  }
}

/* ── Selected check ── */
.rs-select__option-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  color: rgba(143, 211, 255, 0.6);
  background: rgba(77, 163, 255, 0.1);
  border: 1px solid rgba(143, 211, 255, 0.25);
  border-radius: 50%;
  opacity: 0;
  animation: rs-check-in 300ms cubic-bezier(0.16, 1, 0.3, 1) 50ms forwards;
}

@keyframes rs-check-in {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Label & desc ── */
.rs-select__option-label {
  font-family: var(--lt-font-sans);
  font-size: 1.02rem;
  font-weight: 300;
  color: var(--lt-text);
  letter-spacing: 0.06em;
  transition: color 280ms ease, text-shadow 280ms ease;
}

.rs-select__option-desc {
  font-size: 0.7rem;
  color: var(--lt-text-muted);
  line-height: 1.5;
  letter-spacing: 0.02em;
  transition: color 280ms ease;
}

/* ── Dimmed (unselected cards) ── */
.rs-select__option--dimmed {
  opacity: 0.55;
  transition: opacity 350ms ease;
}

.rs-select__option--dimmed:not([disabled]) {
  cursor: pointer;
  pointer-events: auto;
}

.rs-select__option--dimmed:not([disabled]):hover {
  opacity: 0.75;
}

.rs-select__option--dimmed[disabled] {
  pointer-events: none;
}

/* ── Bottom area ── */
.rs-select__bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 340px;
  margin-top: 32px;
  /* Reserve full height so CTA appearance doesn't reflow justify-content:center */
  min-height: 90px;
}

/* ── CTA button ── */
.rs-select__cta {
  width: 100%;
  padding: 16px var(--lt-space-lg);
  background: var(--lt-btn-primary-bg);
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-lg);
  color: var(--lt-text-strong);
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    background 250ms ease,
    border-color 250ms ease,
    box-shadow 250ms ease,
    transform 150ms ease;
  position: relative;
  overflow: hidden;
  min-height: 50px;
}

.rs-select__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(77, 163, 255, 0.08) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 250ms ease;
}

.rs-select__cta:hover {
  background: var(--lt-btn-primary-hover);
  border-color: var(--lt-btn-primary-hover-border);
  box-shadow:
    0 0 24px rgba(77, 163, 255, 0.18),
    0 6px 20px rgba(0, 0, 0, 0.35);
  transform: translateY(-1px);
}

.rs-select__cta:hover::before {
  opacity: 1;
}

.rs-select__cta:active {
  transform: scale(0.98) translateY(0);
  transition: all 100ms ease;
}

/* ── CTA transition ── */
.rs-cta-enter-active {
  transition: opacity 400ms ease, transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.rs-cta-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.rs-cta-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.rs-cta-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Privacy note ── */
.rs-select__note {
  font-size: 0.66rem;
  color: var(--lt-text-muted);
  opacity: 0.65;
  text-align: center;
  letter-spacing: 0.04em;
  line-height: 1.5;
}

/* ── Confirm text ── */
.rs-select__confirm {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--lt-accent-2);
  text-align: center;
  letter-spacing: 0.08em;
  opacity: 0;
  animation: rs-confirm-in 400ms ease 100ms forwards;
  padding: 14px 0;
}

.rs-select__confirm-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--lt-accent-2);
  animation: rs-dot-pulse 1.2s ease-in-out infinite;
}

@keyframes rs-dot-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes rs-confirm-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 0.75; transform: translateY(0); }
}

/* ── Page-level state change when selected ── */
.rs-select--chosen .rs-select__header {
  transition: opacity 400ms ease;
  opacity: 0.7;
}

.rs-select--chosen .rs-select__step {
  transition: opacity 400ms ease;
  opacity: 0.7;
}

/* ── Page fade-out ── */
.rs-select--transitioning {
  animation: rs-fade-out 400ms ease forwards;
}

@keyframes rs-fade-out {
  to { opacity: 0; transform: translateY(-8px); }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .rs-select__header,
  .rs-select__option,
  .rs-select--transitioning,
  .rs-select__confirm,
  .rs-select__option-badge,
  .rs-select__confirm-dot,
  .rs-select__step,
  .rs-select__orb {
    animation: none;
    opacity: 1;
  }
  .rs-select__option--selected {
    animation: none;
  }
}
</style>
