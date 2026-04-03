<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  instruction: { type: String, default: '카드를 선택해주세요.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  selectedCount: { type: Number, default: null },
})

// selectedCount takes priority; fall back to currentStep-based derivation for
// pages that still pass only currentStep/totalSteps.
const effectiveSelected = computed(() =>
  props.selectedCount !== null ? props.selectedCount : props.currentStep - 1
)

function dotState(i) {
  const s = effectiveSelected.value
  if (i <= s) return 'filled'
  if (i === s + 1 && s < props.totalSteps) return 'active'
  return 'empty'
}
</script>

<template>
  <div class="card-draw-header">
    <!-- dot progress replaces bare "X / Y" text -->
    <div v-if="totalSteps > 1" class="card-draw-header__dots" aria-hidden="true">
      <span
        v-for="n in totalSteps"
        :key="n"
        class="card-draw-header__dot"
        :class="`card-draw-header__dot--${dotState(n)}`"
      />
    </div>
    <h2 class="card-draw-header__title">{{ title }}</h2>
    <p class="card-draw-header__instruction">{{ instruction }}</p>
  </div>
</template>

<style scoped>
.card-draw-header {
  text-align: center;
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-lg);
}

/* ── dot progress bar ── */
.card-draw-header__dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--lt-space-md);
}

.card-draw-header__dot {
  display: inline-block;
  border-radius: 9999px;
  transition: width 260ms cubic-bezier(0.16, 1, 0.3, 1),
              background 260ms ease,
              box-shadow 260ms ease,
              opacity 260ms ease;
}

/* past step: small filled dot */
.card-draw-header__dot--filled {
  width: 6px;
  height: 6px;
  background: var(--lt-accent-2);
  opacity: 0.55;
}

/* current step: wider pill, glowing */
.card-draw-header__dot--active {
  width: 22px;
  height: 6px;
  background: var(--lt-accent-2);
  box-shadow: 0 0 8px rgba(77, 163, 255, 0.5);
  opacity: 1;
}

/* future step: dim outline dot */
.card-draw-header__dot--empty {
  width: 6px;
  height: 6px;
  background: rgba(77, 163, 255, 0.18);
  border: 1px solid rgba(77, 163, 255, 0.25);
  opacity: 1;
}

.card-draw-header__title {
  font-size: 1.4rem;
  color: var(--lt-text-strong);
  margin-bottom: var(--lt-space-sm);
}

.card-draw-header__instruction {
  font-size: 0.9rem;
  color: var(--lt-text-sub);
}

@media (prefers-reduced-motion: reduce) {
  .card-draw-header__dot {
    transition: none;
  }
}
</style>
