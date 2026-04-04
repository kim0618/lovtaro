<script setup>
import { ref, computed } from 'vue'
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
const saveState = ref('idle') // 'idle' | 'done'
const copyState = ref('idle') // 'idle' | 'done'

const canNativeShare = computed(() =>
  typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
)

async function generateImage() {
  if (props.mode === 'three' && props.cards.length >= 3) {
    return generateThreeCardShareImage({
      readingType: props.readingType,
      cards: props.cards,
      summary: props.summary,
    })
  }
  return generateSingleCardShareImage({
    readingType: props.readingType,
    cardName: props.cardName,
    cardNameEn: props.cardNameEn,
    summary: props.summary,
    emotionTags: props.emotionTags,
  })
}

async function handleSave() {
  if (generating.value) return
  generating.value = true
  try {
    const dataUrl = await generateImage()
    downloadImage(dataUrl, `lovtaro-${props.readingType || 'reading'}.png`)
    saveState.value = 'done'
    setTimeout(() => { saveState.value = 'idle' }, 2200)
  } finally {
    generating.value = false
  }
}

async function handleShare() {
  if (generating.value) return
  generating.value = true
  try {
    const dataUrl = await generateImage()
    if (canNativeShare.value) {
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
    saveState.value = 'done'
    setTimeout(() => { saveState.value = 'idle' }, 2200)
  } finally {
    generating.value = false
  }
}

async function handleCopyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copyState.value = 'done'
    setTimeout(() => { copyState.value = 'idle' }, 2200)
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = window.location.href
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copyState.value = 'done'
    setTimeout(() => { copyState.value = 'idle' }, 2200)
  }
}
</script>

<template>
  <div class="share-save-section">
    <p class="share-save-section__heading">이 리딩을 간직하거나 공유하세요</p>
    <div class="share-save-section__actions">
      <button
        class="share-save-section__btn"
        :disabled="generating"
        :aria-label="generating ? '이미지 생성 중' : '이미지로 저장'"
        @click="handleSave"
      >
        <span v-if="generating" class="share-save-section__spinner" />
        <span v-else-if="saveState === 'done'" class="share-save-section__done-text">저장 완료</span>
        <span v-else>이미지 저장</span>
      </button>
      <button
        v-if="canNativeShare"
        class="share-save-section__btn"
        :disabled="generating"
        :aria-label="generating ? '이미지 생성 중' : '공유하기'"
        @click="handleShare"
      >
        <span v-if="generating" class="share-save-section__spinner" />
        <span v-else>공유하기</span>
      </button>
      <button
        class="share-save-section__btn share-save-section__btn--secondary"
        :aria-label="copyState === 'done' ? '복사 완료' : '링크 복사'"
        @click="handleCopyLink"
      >
        <span v-if="copyState === 'done'" class="share-save-section__done-text">복사 완료</span>
        <span v-else>링크 복사</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.share-save-section {
  padding: 0 var(--lt-space-md);
}

.share-save-section__heading {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.08em;
  text-align: center;
  margin-bottom: var(--lt-space-md);
  opacity: 0.7;
}

.share-save-section__actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.share-save-section__btn {
  flex: 1;
  min-width: 100px;
  max-width: 150px;
  padding: 12px var(--lt-space-md);
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-sm);
  font-size: 0.8rem;
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
  min-height: 44px;
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

.share-save-section__done-text {
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
