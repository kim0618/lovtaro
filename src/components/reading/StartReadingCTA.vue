<script setup>
const emit = defineEmits(['start'])

defineProps({
  label: { type: String, default: '카드 뽑기 시작' },
  note: { type: String, default: '마음을 조용히 가다듬고 시작해보세요.' },
})
</script>

<template>
  <div class="start-reading-cta">
    <p v-if="note" class="start-reading-cta__note">{{ note }}</p>
    <button class="start-reading-cta__btn" @click="emit('start')">
      {{ label }}
    </button>
  </div>
</template>

<style scoped>
.start-reading-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-lg);
  padding: 0 var(--lt-space-md);
}

.start-reading-cta__note {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  text-align: center;
  letter-spacing: 0.04em;
}

.start-reading-cta__btn {
  width: 100%;
  max-width: 320px;
  padding: var(--lt-space-md) var(--lt-space-lg);
  background: var(--lt-btn-primary-bg);
  color: rgba(200, 220, 255, 0.95);
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-sm);
  font-size: 0.85rem;
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
    transform var(--lt-transition);
}

.start-reading-cta__btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(143, 211, 255, 0.25), transparent);
  pointer-events: none;
}

.start-reading-cta__btn:hover {
  background: var(--lt-btn-primary-hover);
  border-color: var(--lt-btn-primary-hover-border);
  box-shadow:
    0 6px 32px rgba(20, 50, 120, 0.55),
    0 0 18px rgba(77, 163, 255, 0.15),
    0 1px 0 rgba(100, 160, 255, 0.18) inset;
  transform: translateY(-1px);
}

.start-reading-cta__btn:active {
  transform: scale(0.98) translateY(0);
}
</style>
