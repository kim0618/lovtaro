<script setup>
import { computed } from 'vue'

const props = defineProps({
  canConfirm: { type: Boolean, default: false },
  confirmLabel: { type: String, default: '이 카드로 결과 보기' },
  resetLabel: { type: String, default: '다시 선택' },
  showReset: { type: Boolean, default: false },
  selectedCount: { type: Number, default: null },
  totalCount: { type: Number, default: null },
})

const remainingHint = computed(() => {
  if (props.canConfirm || props.totalCount === null || props.selectedCount === null) return null
  const remaining = props.totalCount - props.selectedCount
  if (remaining <= 0) return null
  return `${remaining}장을 더 선택하면 결과를 볼 수 있어요`
})

const emit = defineEmits(['confirm', 'reset'])
</script>

<template>
  <div class="draw-action-bar">
    <button
      v-if="showReset"
      class="draw-action-bar__reset"
      @click="emit('reset')"
    >
      {{ resetLabel }}
    </button>
    <button
      class="draw-action-bar__confirm"
      :disabled="!canConfirm"
      @click="canConfirm && emit('confirm')"
    >
      {{ confirmLabel }}
    </button>
    <p v-if="remainingHint" class="draw-action-bar__hint">{{ remainingHint }}</p>
  </div>
</template>

<style scoped>
.draw-action-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-sm);
  padding: var(--lt-space-lg) var(--lt-space-md);
}

.draw-action-bar__confirm {
  width: 100%;
  max-width: 320px;
  padding: var(--lt-space-md) var(--lt-space-lg);
  background: var(--lt-btn-primary-bg);
  color: rgba(200, 220, 255, 0.95);
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-sm);
  font-size: 0.82rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  box-shadow:
    0 4px 24px rgba(10, 30, 80, 0.6),
    0 1px 0 rgba(100, 160, 255, 0.12) inset,
    0 -1px 0 rgba(0, 0, 0, 0.3) inset;
  position: relative;
  overflow: hidden;
  transition:
    background var(--lt-transition),
    border-color var(--lt-transition),
    box-shadow var(--lt-transition),
    transform var(--lt-transition),
    opacity var(--lt-transition);
}

.draw-action-bar__confirm::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(143, 211, 255, 0.22), transparent);
  pointer-events: none;
}

.draw-action-bar__confirm:disabled {
  opacity: 0.28;
  cursor: not-allowed;
  box-shadow: none;
  border-color: rgba(77, 163, 255, 0.1);
}

.draw-action-bar__confirm:not(:disabled):hover {
  background: var(--lt-btn-primary-hover);
  border-color: var(--lt-btn-primary-hover-border);
  box-shadow:
    0 6px 32px rgba(20, 50, 120, 0.55),
    0 0 18px rgba(77, 163, 255, 0.15),
    0 1px 0 rgba(100, 160, 255, 0.18) inset;
  transform: translateY(-1px);
}

.draw-action-bar__confirm:not(:disabled):active {
  transform: scale(0.98) translateY(0);
}

.draw-action-bar__reset {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  padding: var(--lt-space-xs) var(--lt-space-md);
  letter-spacing: 0.04em;
  opacity: 0.65;
  transition: opacity var(--lt-transition), color var(--lt-transition);
}

.draw-action-bar__reset:hover {
  opacity: 1;
  color: var(--lt-text-sub);
}

.draw-action-bar__hint {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  opacity: 0.6;
  letter-spacing: 0.03em;
  text-align: center;
  animation: hint-fade-in 300ms ease both;
}

@keyframes hint-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 0.6; transform: translateY(0); }
}
</style>
