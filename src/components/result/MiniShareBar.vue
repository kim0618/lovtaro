<script setup>
import { ref, computed } from 'vue'
import { trackEvent } from '../../utils/gtag.js'

const props = defineProps({
  readingType: { type: String, default: '' },
  cardName: { type: String, default: '' },
  reversed: { type: Boolean, default: false },
  summary: { type: String, default: '' },
  shareUrl: { type: String, default: '' },
  shareTitle: { type: String, default: '' },
  cardImage: { type: String, default: '' },
  answerLabel: { type: String, default: '' },
  mode: { type: String, default: 'single' },
})

const copyState = ref('idle')

const resolvedUrl = computed(() => props.shareUrl || window.location.href)

function withUtm(url, source, medium) {
  const u = new URL(url, window.location.origin)
  u.searchParams.set('utm_source', source)
  u.searchParams.set('utm_medium', medium)
  u.searchParams.set('utm_campaign', props.readingType || 'reading')
  return u.toString()
}

function toPngUrl(imagePath) {
  return `https://lovtaro.kr${imagePath.replace('/cards/', '/cards-png/').replace('.webp', '.png')}`
}

function getShareImageUrl() {
  if (props.mode === 'compatibility') return 'https://lovtaro.kr/og-image.png'
  if (props.cardImage) return toPngUrl(props.cardImage)
  return 'https://lovtaro.kr/og-image.png'
}

function handleKakaoShare() {
  if (!window.Kakao?.Share) return

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
    url = withUtm(resolvedUrl.value, 'kakao', 'share')
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
    buttons: [{ title: buttonTitle, link: { mobileWebUrl: url, webUrl: url } }],
  })
  trackEvent('mini_share', { reading_type: props.readingType, method: 'kakao' })
}

async function handleCopyLink() {
  const url = withUtm(resolvedUrl.value, 'link', 'copy')
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  trackEvent('mini_copy_link', { reading_type: props.readingType })
  copyState.value = 'done'
  setTimeout(() => { copyState.value = 'idle' }, 2200)
}
</script>

<template>
  <div class="mini-share-bar">
    <span class="mini-share-bar__label">공유하기</span>
    <div class="mini-share-bar__actions">
      <button class="mini-share-bar__btn mini-share-bar__btn--kakao" @click="handleKakaoShare">
        카카오톡
      </button>
      <button class="mini-share-bar__btn mini-share-bar__btn--link" @click="handleCopyLink">
        <span v-if="copyState === 'done'" class="mini-share-bar__done">복사 완료</span>
        <span v-else>링크 복사</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.mini-share-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 var(--lt-space-md);
}

.mini-share-bar__label {
  font-size: 0.65rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.06em;
  opacity: 0.5;
  flex-shrink: 0;
}

.mini-share-bar__actions {
  display: flex;
  gap: 6px;
}

.mini-share-bar__btn {
  padding: 6px 14px;
  border-radius: var(--lt-radius-full);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    border-color var(--lt-transition),
    color var(--lt-transition),
    box-shadow var(--lt-transition),
    opacity var(--lt-transition);
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-share-bar__btn--kakao {
  background: rgba(180, 148, 48, 0.08);
  border: 1px solid rgba(180, 148, 48, 0.22);
  color: rgba(192, 162, 80, 0.8);
}

.mini-share-bar__btn--kakao:hover {
  background: rgba(180, 148, 48, 0.14);
  border-color: rgba(180, 148, 48, 0.36);
  box-shadow: 0 0 12px rgba(180, 148, 48, 0.08);
}

.mini-share-bar__btn--link {
  background: var(--lt-panel);
  border: 1px solid var(--lt-line-soft);
  color: var(--lt-text-muted);
}

.mini-share-bar__btn--link:hover {
  border-color: rgba(77, 163, 255, 0.25);
  color: var(--lt-accent-2);
  box-shadow: 0 0 10px rgba(77, 163, 255, 0.06);
}

.mini-share-bar__done {
  color: var(--lt-accent-2);
}
</style>
