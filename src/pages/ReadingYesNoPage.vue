<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'

useHead({
  title: 'Yes/No 타로 - 예스노 타로로 답을 확인하세요 | Lovtaro',
  description: '지금 궁금한 것에 대해 타로 카드가 Yes, No, Maybe로 답해드립니다. 무료 예스노 타로 리딩.',
})
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import ReadingIntroHeader from '../components/reading/ReadingIntroHeader.vue'
import ReadingDescriptionBox from '../components/reading/ReadingDescriptionBox.vue'
import ReadingPointList from '../components/reading/ReadingPointList.vue'
import StartReadingCTA from '../components/reading/StartReadingCTA.vue'
import CardDrawHeader from '../components/draw/CardDrawHeader.vue'
import CardDeck from '../components/draw/CardDeck.vue'
import SelectedCardState from '../components/draw/SelectedCardState.vue'
import DrawActionBar from '../components/draw/DrawActionBar.vue'
import YesNoAnswerBadge from '../components/result/YesNoAnswerBadge.vue'
import CardImageBlock from '../components/result/CardImageBlock.vue'
import EmotionTagList from '../components/result/EmotionTagList.vue'
import CoreInsightBlock from '../components/result/CoreInsightBlock.vue'
import ReversedNoticeBanner from '../components/result/ReversedNoticeBanner.vue'
import EmotionFlowSection from '../components/result/EmotionFlowSection.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import CautionSection from '../components/result/CautionSection.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import ReadingClosingBlock from '../components/result/ReadingClosingBlock.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import CardRevealTransition from '../components/result/CardRevealTransition.vue'
import MiniShareBar from '../components/result/MiniShareBar.vue'
import { saveLastReading } from '../composables/useLastReading.js'
import { useCardDraw } from '../composables/useCardDraw.js'
import { YESNO_RESULTS } from '../data/readings/yesno.js'
import { applyYesNoReversedModifier } from '../data/yesnoReversedModifiers.js'
import { saveReadingHistory } from '../composables/useReadingHistory.js'
import { useReadingSession } from '../composables/useReadingSession.js'
import { encodeReadingParams, buildShareUrl, decodeReadingParams } from '../utils/shareLink.js'
import { getCardById } from '../data/tarotCards.js'

const { deck, selectedIds, selectedCards, selectedCount, canConfirm, onSelect, reset } = useCardDraw({ maxSelect: 1 })
const phase = ref('intro') // 'intro' | 'draw' | 'reveal' | 'result'

const { clearSession } = useReadingSession('yesno', { phase, selectedIds, deck })

const _shared = decodeReadingParams()
if (_shared) {
  const _base = getCardById(_shared.cardId)
  if (_base) {
    selectedIds.value = [null]
    onSelect(_shared.cardId)
    deck.value = deck.value.map(c => c.id === _shared.cardId ? { ...c, reversed: _shared.reversed } : c)
    phase.value = 'result'
  }
}

const drawnCard = computed(() => selectedCards.value[0] ?? null)
const isReversed = computed(() => drawnCard.value?.reversed ?? false)
const result = computed(() => {
  if (!drawnCard.value) return null
  const upright = YESNO_RESULTS[drawnCard.value.id]
  if (!upright) return null
  return applyYesNoReversedModifier(drawnCard.value.id, upright, isReversed.value)
})

const shareUrl = computed(() => {
  if (!drawnCard.value) return ''
  return buildShareUrl('/reading/yesno', encodeReadingParams({
    cardId: drawnCard.value.id, reversed: drawnCard.value.reversed,
  }))
})

const flowPoints = [
  { label: '질문을 떠올리세요', text: '지금 가장 궁금한 것 하나를 마음속에 품어보세요.' },
  { label: 'Yes / No / Maybe',  text: '카드가 당신의 질문에 직관적인 답을 건넵니다.' },
  { label: '흐름 읽기',         text: '답의 이유와 지금 할 수 있는 것을 살펴봅니다.' },
]

let revealTimer = null

function startReading() { phase.value = 'draw' }
function confirm() {
  if (!canConfirm.value) return
  const card = drawnCard.value
  saveLastReading({ readingType: 'Yes/No 타로', cardId: card.id, cardName: card.name, cardNameEn: card.nameEn })
  saveReadingHistory({
    readingType: 'Yes/No 타로',
    spreadType: 'single',
    cards: [{ id: card.id, name: card.name, nameEn: card.nameEn, reversed: card.reversed }],
    summary: result.value?.summary ?? '',
    details: result.value ? { answer: result.value.answer, answerLabel: result.value.answerLabel, emotionTags: result.value.emotionTags, advice: result.value.advice, caution: result.value.caution } : null,
  })
  phase.value = 'reveal'
  revealTimer = setTimeout(() => { phase.value = 'result' }, 2200)
}
function retry() { clearSession(); reset(); phase.value = 'draw' }
function scrollTop() { window.scrollTo({ top: 0 }) }

onUnmounted(() => { if (revealTimer) clearTimeout(revealTimer) })
</script>

<template>
  <AppShell>
    <Transition name="phase-fade" mode="out-in" @after-enter="scrollTop">
    <div :key="phase">
    <!-- ── INTRO ───────────────────────────────────── -->
    <template v-if="phase === 'intro'">
      <PageContainer>
        <ReadingIntroHeader
          title="Yes/No 타로"
          subtitle="지금 궁금한 것에 대해, 카드가 직관적인 답을 건넵니다."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <ReadingDescriptionBox
          description="머릿속에 하나의 질문을 떠올려보세요. '그 사람이 날 좋아할까?', '이 선택이 맞을까?' 카드가 Yes, No, 또는 Maybe로 답합니다."
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ReadingPointList :points="flowPoints" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <StartReadingCTA
          label="카드 한 장 뽑기"
          note="질문을 마음에 품은 채, 끌리는 카드를 골라보세요."
          @start="startReading"
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="yesno" />
      </SectionBlock>
    </template>

    <!-- ── DRAW ───────────────────────────────────── -->
    <template v-else-if="phase === 'draw'">
      <PageContainer>
        <CardDrawHeader
          title="질문에 대한 답이 담긴 카드를 골라보세요"
          instruction="마음을 가라앉힌 채, 끌리는 카드 한 장으로."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <SelectedCardState :card="drawnCard" label="선택한 카드" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <CardDeck :cards="deck" :selected-ids="selectedIds" :max-select="1" @select="onSelect" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <DrawActionBar
          :can-confirm="canConfirm"
          confirm-label="답 확인하기"
          reset-label="다시 섞기"
          :show-reset="selectedCount > 0"
          @confirm="confirm"
          @reset="reset"
        />
      </SectionBlock>
    </template>

    <!-- ── REVEAL ─────────────────────────────────── -->
    <template v-else-if="phase === 'reveal' && drawnCard">
      <CardRevealTransition
        :card-id="drawnCard.id"
        :card-name="drawnCard.name"
        :card-name-en="drawnCard.nameEn"
        reading-type="Yes/No 타로"
        :reversed="isReversed"
      />
    </template>

    <!-- ── RESULT ─────────────────────────────────── -->
    <template v-else-if="phase === 'result' && drawnCard && result">
      <div class="reading-result__hero lt-appear">
        <p class="reading-result__hero-label">Yes/No 타로</p>
      </div>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <YesNoAnswerBadge :answer="result.answer" :answer-label="result.answerLabel" :answer-desc="result.answerDesc" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <CardImageBlock :image-src="drawnCard.image" :card-name="drawnCard.name" :card-name-en="drawnCard.nameEn" :energy="drawnCard.energy" :keywords="drawnCard.keywords" :reversed="isReversed" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <EmotionTagList :tags="result.emotionTags" />
      </SectionBlock>

      <SectionBlock v-if="isReversed" spacing="sm" class="lt-appear lt-appear--delay-2">
        <ReversedNoticeBanner />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <CoreInsightBlock :insight="result.summary" label="핵심 해석" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <MiniShareBar
          reading-type="Yes/No 타로"
          :card-name="drawnCard.name"
          :reversed="drawnCard.reversed"
          :summary="result.summary"
          :share-url="shareUrl"
          :card-image="drawnCard.image"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-3">
        <EmotionFlowSection title="지금 감정의 흐름" :lines="result.emotionFlow" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-4">
        <AdviceSection title="지금 할 수 있는 것" :lines="result.advice" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <CautionSection title="조심할 점" :lines="result.caution" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <ReadingClosingBlock />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ShareSaveSection
          reading-type="Yes/No 타로"
          :card-name="drawnCard.name"
          :card-name-en="drawnCard.nameEn"
          :card-image="drawnCard.image"
          :reversed="drawnCard.reversed"
          :summary="result.summary"
          :emotion-tags="result.emotionTags"
          :emotion-hook="result.emotionHook || ''"
          :share-url="shareUrl"
          :share-title="`${result.answerLabel}! ${drawnCard.name} 카드가 나왔어요`"
          :answer-label="result.answerLabel"
          :answer-desc="result.answerDesc"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <div class="reading-result__retry-wrap">
          <button class="reading-result__retry" @click="retry">다시 뽑기</button>
        </div>
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="yesno" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <DisclaimerBlock />
      </SectionBlock>
    </template>
    </div>
    </Transition>
  </AppShell>
</template>

<style scoped>
.reading-result__hero {
  background: linear-gradient(180deg, var(--lt-bg-1) 0%, var(--lt-bg-0) 100%);
  padding-bottom: var(--lt-space-md);
  border-bottom: 1px solid var(--lt-border-soft);
}

.reading-result__hero-label {
  text-align: center;
  font-family: var(--lt-font-sans);
  font-size: 0.75rem;
  font-weight: 300;
  color: var(--lt-accent-3);
  letter-spacing: 0.12em;
  padding: var(--lt-space-lg) 0 var(--lt-space-md);
  opacity: 0.7;
}

.reading-result__retry-wrap {
  display: flex;
  justify-content: center;
  padding: 0 var(--lt-space-md);
}

.reading-result__retry {
  font-size: 0.72rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  opacity: 0.7;
  border: 1px solid rgba(77, 163, 255, 0.2);
  border-radius: var(--lt-radius-full);
  padding: 5px 16px;
  background: rgba(77, 163, 255, 0.06);
  transition: opacity var(--lt-transition), border-color var(--lt-transition);
}

.reading-result__retry:hover {
  opacity: 1;
  border-color: rgba(77, 163, 255, 0.4);
}
</style>
