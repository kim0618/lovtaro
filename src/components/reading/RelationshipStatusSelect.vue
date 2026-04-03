<script setup>
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
</script>

<template>
  <div class="rs-select">
    <div class="rs-select__header">
      <p class="rs-select__eyebrow">리딩 시작 전</p>
      <h2 class="rs-select__title">지금 어떤 상태인가요?</h2>
      <p class="rs-select__desc">상태를 선택하면 당신의 감정 흐름에 더 맞는 해석이 이루어집니다.</p>
    </div>

    <div class="rs-select__grid">
      <button
        v-for="s in statuses"
        :key="s.value"
        class="rs-select__option"
        @click="emit('select', s.value)"
      >
        <span class="rs-select__option-label">{{ s.label }}</span>
        <span class="rs-select__option-desc">{{ s.desc }}</span>
      </button>
    </div>

    <p class="rs-select__note">선택한 상태는 결과 해석에만 사용되며 저장되지 않아요.</p>
  </div>
</template>

<style scoped>
.rs-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--lt-space-xl) var(--lt-space-md);
  min-height: 70vh;
  gap: var(--lt-space-xl);
}

.rs-select__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
}

.rs-select__eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  color: var(--lt-accent-2);
  opacity: 0.7;
  text-transform: uppercase;
}

.rs-select__title {
  font-family: var(--lt-font-display);
  font-size: 1.5rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
}

.rs-select__desc {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  line-height: 1.65;
  letter-spacing: 0.03em;
  max-width: 280px;
  margin: 0 auto;
}

.rs-select__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--lt-space-sm);
  width: 100%;
  max-width: 360px;
}

.rs-select__option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: var(--lt-space-md) var(--lt-space-md);
  background: var(--lt-bg-card);
  border: 1px solid var(--lt-line-soft);
  border-radius: var(--lt-radius-md);
  text-align: left;
  cursor: pointer;
  transition:
    background var(--lt-transition),
    border-color var(--lt-transition),
    box-shadow var(--lt-transition),
    transform var(--lt-transition);
  position: relative;
  overflow: hidden;
}

.rs-select__option::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(77, 163, 255, 0.05) 0%, transparent 60%);
  opacity: 0;
  transition: opacity var(--lt-transition);
}

.rs-select__option:hover {
  background: linear-gradient(160deg, #0E1A30 0%, #12223E 100%);
  border-color: rgba(199, 215, 248, 0.3);
  box-shadow:
    0 6px 28px rgba(0, 0, 0, 0.4),
    0 0 1px rgba(199, 215, 248, 0.2);
  transform: translateY(-2px);
}

.rs-select__option:hover::before {
  opacity: 1;
}

.rs-select__option:hover .rs-select__option-label {
  color: #F4F8FF;
}

.rs-select__option:active {
  transform: scale(0.96) translateY(0);
  border-color: rgba(143, 211, 255, 0.6);
  box-shadow:
    0 0 24px rgba(77, 163, 255, 0.25),
    0 0 60px rgba(77, 163, 255, 0.08),
    inset 0 0 20px rgba(77, 163, 255, 0.06);
  background: linear-gradient(160deg, #0F1D38 0%, #142A52 50%, #0D1E42 100%);
  transition: all 120ms ease;
}

.rs-select__option:active .rs-select__option-label {
  color: var(--lt-accent-3);
  text-shadow: 0 0 12px rgba(143, 211, 255, 0.4);
}

.rs-select__option-label {
  font-family: var(--lt-font-sans);
  font-size: 1.05rem;
  font-weight: 300;
  color: var(--lt-text);
  letter-spacing: 0.06em;
}

.rs-select__option-desc {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  line-height: 1.5;
  letter-spacing: 0.02em;
}

.rs-select__note {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  opacity: 0.5;
  text-align: center;
  letter-spacing: 0.04em;
}
</style>
