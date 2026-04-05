<script setup>
import { ref, computed } from 'vue'
import { generateSingleCardShareImage, generateThreeCardShareImage, downloadImage } from '../../composables/useShareCard.js'
import { trackEvent } from '../../utils/gtag.js'

const props = defineProps({
  readingType: { type: String, default: '' },
  cardName: { type: String, default: '' },
  cardNameEn: { type: String, default: '' },
  cardImage: { type: String, default: '' },
  reversed: { type: Boolean, default: false },
  summary: { type: String, default: '' },
  emotionTags: { type: Array, default: () => [] },
  cards: { type: Array, default: () => [] },
  mode: { type: String, default: 'single' },
})

const generating = ref(false)
const storySaveState = ref('idle')
const feedSaveState = ref('idle')
const copyState = ref('idle')

const canNativeShare = computed(() =>
  typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
)

async function generateImage(format = 'story') {
  if (props.mode === 'three' && props.cards.length >= 3) {
    return generateThreeCardShareImage({
      readingType: props.readingType,
      cards: props.cards,
      summary: props.summary,
      format,
    })
  }
  return generateSingleCardShareImage({
    readingType: props.readingType,
    cardName: props.cardName,
    cardNameEn: props.cardNameEn,
    cardImage: props.cardImage,
    reversed: props.reversed,
    summary: props.summary,
    emotionTags: props.emotionTags,
    format,
  })
}

async function handleSave(format = 'story') {
  if (generating.value) return
  generating.value = true
  const stateRef = format === 'feed' ? feedSaveState : storySaveState
  try {
    const dataUrl = await generateImage(format)
    const suffix = format === 'feed' ? '-feed' : '-story'
    downloadImage(dataUrl, `lovtaro-${props.readingType || 'reading'}${suffix}.png`)
    trackEvent('image_save', { reading_type: props.readingType, format })
    stateRef.value = 'done'
    setTimeout(() => { stateRef.value = 'idle' }, 2200)
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
        trackEvent('share', { reading_type: props.readingType, method: 'native' })
        return
      }
    }
    // Fallback: download
    downloadImage(dataUrl, `lovtaro-${props.readingType || 'reading'}.png`)
  } finally {
    generating.value = false
  }
}

async function handleCopyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    trackEvent('copy_link', { reading_type: props.readingType })
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
    <div class="share-save-section__grid">
      <button
        class="share-save-section__btn"
        :disabled="generating"
        @click="handleSave('story')"
      >
        <span v-if="storySaveState === 'done'" class="share-save-section__done-text">저장 완료</span>
        <template v-else>
          <span v-if="generating" class="share-save-section__spinner" />
          <span v-else>스토리용 저장</span>
        </template>
      </button>
      <button
        class="share-save-section__btn"
        :disabled="generating"
        @click="handleSave('feed')"
      >
        <span v-if="feedSaveState === 'done'" class="share-save-section__done-text">저장 완료</span>
        <template v-else>
          <span v-if="generating" class="share-save-section__spinner" />
          <span v-else>피드용 저장</span>
        </template>
      </button>
      <button
        v-if="canNativeShare"
        class="share-save-section__btn"
        :disabled="generating"
        @click="handleShare"
      >
        <span v-if="generating" class="share-save-section__spinner" />
        <span v-else>공유하기</span>
      </button>
      <button
        class="share-save-section__btn share-save-section__btn--secondary"
        @click="handleCopyLink"
      >
        <span v-if="copyState === 'done'" class="share-save-section__done-text">복사 완료</span>
        <span v-else>링크 복사</span>
      </button>
    </div>
    <p v-if="generating" class="share-save-section__progress">이미지를 만들고 있어요</p>
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

.share-save-section__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-width: 320px;
  margin: 0 auto;
}

.share-save-section__btn {
  padding: 11px 8px;
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-sm);
  font-size: 0.78rem;
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
  white-space: nowrap;
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

.share-save-section__progress {
  font-size: 0.68rem;
  color: var(--lt-accent-2);
  text-align: center;
  letter-spacing: 0.06em;
  opacity: 0.7;
  animation: share-progress-pulse 1.5s ease-in-out infinite;
  width: 100%;
}

@keyframes share-progress-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}
</style>
