<script setup>
import { ref } from 'vue'
import { generateStreakBadgeImage, downloadImage } from '../../composables/useShareCard.js'
import { trackEvent } from '../../utils/gtag.js'

const props = defineProps({
  streak: { type: Number, required: true },
  cardName: { type: String, default: '' },
})

const generating = ref(false)
const saveState = ref('idle')

async function handleSave() {
  if (generating.value) return
  generating.value = true
  try {
    const dataUrl = await generateStreakBadgeImage({
      streakCount: props.streak,
      cardName: props.cardName,
    })
    downloadImage(dataUrl, `lovtaro-streak-${props.streak}days.png`)
    trackEvent('streak_badge_save', { streak: props.streak })
    saveState.value = 'done'
    setTimeout(() => { saveState.value = 'idle' }, 2200)
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <div v-if="streak >= 2" class="streak-badge">
    <div class="streak-badge__content">
      <p class="streak-badge__count">{{ streak }}일 연속 리딩</p>
      <p v-if="streak >= 30" class="streak-badge__tier streak-badge__tier--gold">Master Reader</p>
      <p v-else-if="streak >= 14" class="streak-badge__tier streak-badge__tier--gold">Devoted Reader</p>
      <p v-else-if="streak >= 7" class="streak-badge__tier streak-badge__tier--gold">Faithful Reader</p>
      <p v-else-if="streak >= 3" class="streak-badge__tier streak-badge__tier--green">Rising Reader</p>
      <button
        class="streak-badge__btn"
        :disabled="generating"
        @click="handleSave"
      >
        <span v-if="saveState === 'done'" class="streak-badge__done">저장 완료</span>
        <template v-else>
          <span v-if="generating" class="streak-badge__spinner" />
          <span v-else>배지 이미지 저장</span>
        </template>
      </button>
      <p class="streak-badge__hint">스토리에 올려서 자랑해보세요</p>
    </div>
  </div>
</template>

<style scoped>
.streak-badge {
  padding: 0 var(--lt-space-md);
}

.streak-badge__content {
  text-align: center;
  padding: var(--lt-space-lg) var(--lt-space-md);
  background: rgba(77, 163, 255, 0.04);
  border: 1px solid rgba(77, 163, 255, 0.12);
  border-radius: var(--lt-radius-lg);
}

.streak-badge__count {
  font-size: 1rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.streak-badge__tier {
  font-family: var(--lt-font-display);
  font-size: 0.72rem;
  font-style: italic;
  letter-spacing: 0.08em;
  margin-bottom: var(--lt-space-md);
}

.streak-badge__tier--gold {
  color: rgba(200, 169, 110, 0.8);
}

.streak-badge__tier--green {
  color: rgba(100, 220, 180, 0.7);
}

.streak-badge__btn {
  padding: 10px 24px;
  background: var(--lt-btn-primary-bg);
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-sm);
  font-size: 0.78rem;
  color: var(--lt-text);
  letter-spacing: 0.04em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 42px;
  transition:
    background var(--lt-transition),
    border-color var(--lt-transition),
    box-shadow var(--lt-transition);
}

.streak-badge__btn:hover:not(:disabled) {
  background: var(--lt-btn-primary-hover);
  border-color: var(--lt-btn-primary-hover-border);
  box-shadow: 0 0 16px rgba(77, 163, 255, 0.12);
}

.streak-badge__btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.streak-badge__done {
  color: var(--lt-accent-2);
}

.streak-badge__spinner {
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--lt-line-soft);
  border-top-color: var(--lt-accent-2);
  border-radius: 50%;
  animation: streak-spin 0.7s linear infinite;
}

@keyframes streak-spin {
  to { transform: rotate(360deg); }
}

.streak-badge__hint {
  font-size: 0.65rem;
  color: var(--lt-text-muted);
  margin-top: var(--lt-space-sm);
  opacity: 0.6;
  letter-spacing: 0.04em;
}
</style>
