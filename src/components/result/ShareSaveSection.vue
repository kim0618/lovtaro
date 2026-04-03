<script setup>
import { ref } from 'vue'
import { generateSingleCardShareImage, generateThreeCardShareImage, downloadImage } from '../../composables/useShareCard.js'

const props = defineProps({
  readingType: { type: String, default: '' },
  cardName: { type: String, default: '' },
  cardNameEn: { type: String, default: '' },
  summary: { type: String, default: '' },
  emotionTags: { type: Array, default: () => [] },
  cards: { type: Array, default: () => [] },
  mode: { type: String, default: 'single' },
})

const generating = ref(false)
const generated = ref(false)

async function handleSave() {
  if (generating.value) return
  generating.value = true

  try {
    let dataUrl
    if (props.mode === 'three' && props.cards.length >= 3) {
      dataUrl = await generateThreeCardShareImage({
        readingType: props.readingType,
        cards: props.cards,
        summary: props.summary,
      })
    } else {
      dataUrl = await generateSingleCardShareImage({
        readingType: props.readingType,
        cardName: props.cardName,
        cardNameEn: props.cardNameEn,
        summary: props.summary,
        emotionTags: props.emotionTags,
      })
    }
    downloadImage(dataUrl, `lovtaro-${props.readingType || 'reading'}.png`)
    generated.value = true
    setTimeout(() => { generated.value = false }, 2000)
  } finally {
    generating.value = false
  }
}

async function handleShare() {
  if (generating.value) return
  generating.value = true

  try {
    let dataUrl
    if (props.mode === 'three' && props.cards.length >= 3) {
      dataUrl = await generateThreeCardShareImage({
        readingType: props.readingType,
        cards: props.cards,
        summary: props.summary,
      })
    } else {
      dataUrl = await generateSingleCardShareImage({
        readingType: props.readingType,
        cardName: props.cardName,
        cardNameEn: props.cardNameEn,
        summary: props.summary,
        emotionTags: props.emotionTags,
      })
    }

    // Try native share if available
    if (navigator.share && navigator.canShare) {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'lovtaro-reading.png', { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Lovtaro - ${props.readingType}`,
          files: [file],
        })
        return
      }
    }
    // Fallback: download
    downloadImage(dataUrl, `lovtaro-${props.readingType || 'reading'}.png`)
    generated.value = true
    setTimeout(() => { generated.value = false }, 2000)
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <div class="share-save-section">
    <p class="share-save-section__heading">이 리딩을 간직하세요</p>
    <div class="share-save-section__actions">
      <button
        class="share-save-section__btn"
        :disabled="generating"
        :aria-label="generating ? '이미지 생성 중' : '이미지 저장'"
        @click="handleSave"
      >
        <span v-if="generating" class="share-save-section__spinner" />
        <span v-else-if="generated">저장 완료</span>
        <span v-else>이미지 저장</span>
      </button>
      <button
        class="share-save-section__btn share-save-section__btn--secondary"
        :disabled="generating"
        :aria-label="generating ? '이미지 생성 중' : '공유하기'"
        @click="handleShare"
      >
        <span v-if="generating" class="share-save-section__spinner" />
        <span v-else>공유하기</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.share-save-section {
  padding: 0 var(--lt-space-md);
}

.share-save-section__heading {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.08em;
  text-align: center;
  margin-bottom: var(--lt-space-md);
  opacity: 0.6;
}

.share-save-section__actions {
  display: flex;
  justify-content: center;
  gap: var(--lt-space-sm);
}

.share-save-section__btn {
  flex: 1;
  max-width: 140px;
  padding: 11px var(--lt-space-md);
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-sm);
  font-size: 0.82rem;
  color: var(--lt-text);
  background: var(--lt-btn-primary-bg);
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    border-color var(--lt-transition),
    color var(--lt-transition),
    box-shadow var(--lt-transition),
    opacity var(--lt-transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 42px;
}

.share-save-section__btn:hover:not(:disabled) {
  border-color: var(--lt-btn-primary-hover-border);
  background: var(--lt-btn-primary-hover);
  box-shadow: 0 0 16px rgba(77, 163, 255, 0.12);
}

.share-save-section__btn--secondary {
  background: var(--lt-panel);
  border-color: var(--lt-line-soft);
  color: var(--lt-text-sub);
}

.share-save-section__btn--secondary:hover:not(:disabled) {
  border-color: rgba(77, 163, 255, 0.3);
  background: var(--lt-panel);
  color: var(--lt-accent-2);
  box-shadow: 0 0 12px rgba(77, 163, 255, 0.08);
}

.share-save-section__btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.share-save-section__btn--done {
  border-color: rgba(77, 163, 255, 0.3);
  color: var(--lt-accent-2);
}

.share-save-section__spinner {
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--lt-line-soft);
  border-top-color: var(--lt-accent-2);
  border-radius: 50%;
  animation: share-spin 0.7s linear infinite;
}

@keyframes share-spin {
  to { transform: rotate(360deg); }
}
</style>
