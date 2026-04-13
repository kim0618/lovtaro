<script setup>
import { ref, computed } from 'vue'
import { generateSingleCardShareImage, generateThreeCardShareImage, generateCompatibilityShareImage, downloadImage } from '../../composables/useShareCard.js'
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
  shareUrl: { type: String, default: '' },
  shareTitle: { type: String, default: '' },
  answerLabel: { type: String, default: '' },
  answerDesc: { type: String, default: '' },
  card2Name: { type: String, default: '' },
  card2NameEn: { type: String, default: '' },
  card2Image: { type: String, default: '' },
  card2Reversed: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  scoreLabel: { type: String, default: '' },
})

const generating = ref(false)
const saveState = ref('idle')
const copyState = ref('idle')

const resolvedUrl = computed(() => props.shareUrl || window.location.href)

function withUtm(url, source, medium) {
  const u = new URL(url, window.location.origin)
  u.searchParams.set('utm_source', source)
  u.searchParams.set('utm_medium', medium)
  u.searchParams.set('utm_campaign', props.readingType || 'reading')
  return u.toString()
}

const kakaoUrl = computed(() => withUtm(resolvedUrl.value, 'kakao', 'share'))
const copyUrl = computed(() => withUtm(resolvedUrl.value, 'link', 'copy'))

const instaState = ref('idle')

async function generateImage(format = 'story') {
  if (props.mode === 'compatibility') {
    return generateCompatibilityShareImage({
      card1Name: props.cardName.split(' + ')[0] || props.cardName,
      card1NameEn: props.cardNameEn.split(' & ')[0] || props.cardNameEn,
      card1Image: props.cardImage,
      card1Reversed: props.reversed,
      card2Name: props.card2Name,
      card2NameEn: props.card2NameEn,
      card2Image: props.card2Image,
      card2Reversed: props.card2Reversed,
      score: props.score,
      scoreLabel: props.scoreLabel,
      summary: props.summary,
      format,
    })
  }
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
    answerLabel: props.answerLabel,
    answerDesc: props.answerDesc,
    format,
  })
}

async function handleSave() {
  if (generating.value) return
  generating.value = true
  try {
    const dataUrl = await generateImage('story')
    downloadImage(dataUrl, `lovtaro-${props.readingType || 'reading'}.png`)
    trackEvent('image_save', { reading_type: props.readingType })
    saveState.value = 'done'
    setTimeout(() => { saveState.value = 'idle' }, 2200)
  } finally {
    generating.value = false
  }
}

async function handleInstaSave() {
  if (generating.value) return
  generating.value = true
  try {
    const dataUrl = await generateImage('feed')
    downloadImage(dataUrl, `lovtaro-insta-${props.readingType || 'reading'}.png`)
    trackEvent('image_save', { reading_type: props.readingType, format: 'instagram_feed' })
    instaState.value = 'done'
    setTimeout(() => { instaState.value = 'idle' }, 2200)
  } finally {
    generating.value = false
  }
}

function toPngUrl(imagePath) {
  return `https://lovtaro.kr${imagePath.replace('/cards/', '/cards-png/').replace('.webp', '.png')}`
}

function getShareImageUrl() {
  if (props.mode === 'compatibility') return 'https://lovtaro.kr/og-image.png'
  if (props.cardImage) return toPngUrl(props.cardImage)
  if (props.cards.length > 0 && props.cards[0].image) return toPngUrl(props.cards[0].image)
  return 'https://lovtaro.kr/og-image.png'
}

function handleKakaoShare() {
  if (!window.Kakao?.Share) {
    alert('카카오톡 공유 기능을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    return
  }

  const cardLabel = props.cardName
    ? `${props.cardName}${props.reversed ? ' (역방향)' : ''}`
    : 'Lovtaro'

  let url, kakaoTitle, kakaoDesc, buttonTitle

  if (props.mode === 'compatibility') {
    const introPath = '/reading/compatibility'
    url = withUtm(new URL(introPath, window.location.origin).toString(), 'kakao', 'share')
    kakaoTitle = '우리의 타로 궁합은 몇 점일까?'
    kakaoDesc = '카드 두 장으로 알아보는 연애 궁합 타로, 지금 바로 확인해봐!'
    buttonTitle = '나도 궁합 보기'
  } else {
    url = kakaoUrl.value
    kakaoTitle = props.shareTitle || `${props.readingType} 리딩 결과`
    kakaoDesc = props.answerLabel
      ? `${props.answerLabel}! ${props.summary || `${cardLabel} 카드가 나왔어요`}`
      : (props.summary || `${cardLabel} 카드가 나왔어요`)
    buttonTitle = props.readingType === '오늘의 연애 카드' ? '나도 뽑아보기' : '결과 보기'
  }

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: kakaoTitle,
      description: kakaoDesc,
      imageUrl: getShareImageUrl(),
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [
      {
        title: buttonTitle,
        link: { mobileWebUrl: url, webUrl: url },
      },
    ],
  })
  trackEvent('share', { reading_type: props.readingType, method: 'kakao' })
}

async function handleCopyLink() {
  try {
    await navigator.clipboard.writeText(copyUrl.value)
    trackEvent('copy_link', { reading_type: props.readingType })
    copyState.value = 'done'
    setTimeout(() => { copyState.value = 'idle' }, 2200)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = copyUrl.value
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
        class="share-save-section__btn share-save-section__btn--insta"
        :disabled="generating"
        @click="handleInstaSave"
      >
        <span v-if="instaState === 'done'" class="share-save-section__done-text">저장 완료</span>
        <template v-else>
          <span v-if="generating" class="share-save-section__spinner" />
          <span v-else>인스타 피드용</span>
        </template>
      </button>
      <button
        class="share-save-section__btn"
        :disabled="generating"
        @click="handleSave"
      >
        <span v-if="saveState === 'done'" class="share-save-section__done-text">저장 완료</span>
        <template v-else>
          <span v-if="generating" class="share-save-section__spinner" />
          <span v-else>스토리용 저장</span>
        </template>
      </button>
      <button
        class="share-save-section__btn share-save-section__btn--kakao"
        @click="handleKakaoShare"
      >
        카카오톡 공유
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
    <p class="share-save-section__nudge">스토리에 올리면 친구들도 뽑아볼 수 있어요</p>
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
  padding: 11px 16px;
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

.share-save-section__btn--insta {
  background: rgba(225, 48, 108, 0.12);
  border-color: rgba(225, 48, 108, 0.3);
  color: rgba(225, 120, 160, 0.9);
}

.share-save-section__btn--insta:hover:not(:disabled) {
  background: rgba(225, 48, 108, 0.18);
  border-color: rgba(225, 48, 108, 0.5);
  box-shadow: 0 0 16px rgba(225, 48, 108, 0.1);
}

.share-save-section__btn--kakao {
  background: rgba(254, 229, 0, 0.12);
  border-color: rgba(254, 229, 0, 0.3);
  color: rgba(254, 229, 0, 0.9);
}

.share-save-section__btn--kakao:hover:not(:disabled) {
  background: rgba(254, 229, 0, 0.18);
  border-color: rgba(254, 229, 0, 0.5);
  box-shadow: 0 0 16px rgba(254, 229, 0, 0.1);
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
  margin-top: var(--lt-space-sm);
}

@keyframes share-progress-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}

.share-save-section__nudge {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  text-align: center;
  letter-spacing: 0.04em;
  margin-top: var(--lt-space-md);
  opacity: 0.6;
}
</style>
