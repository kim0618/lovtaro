<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'

useHead({
  title: '오늘의 연애 타로 - 하루의 감정 기류 | Lovtaro',
  description: '오늘 하루 어떤 연애 에너지가 흐르고 있는지 타로 카드 한 장으로 읽어봅니다. 매일 새로운 카드, 매일 새로운 메시지.',
})
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import CardDrawHeader from '../components/draw/CardDrawHeader.vue'
import CardDeck from '../components/draw/CardDeck.vue'
import SelectedCardState from '../components/draw/SelectedCardState.vue'
import DrawActionBar from '../components/draw/DrawActionBar.vue'
import CardImageBlock from '../components/result/CardImageBlock.vue'
import EmotionTagList from '../components/result/EmotionTagList.vue'
import ResultSummaryBox from '../components/result/ResultSummaryBox.vue'
import EmotionFlowSection from '../components/result/EmotionFlowSection.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import CautionSection from '../components/result/CautionSection.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import ReadingClosingBlock from '../components/result/ReadingClosingBlock.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import CardRevealTransition from '../components/result/CardRevealTransition.vue'
import MiniShareBar from '../components/result/MiniShareBar.vue'
import RelationshipStatusSelect from '../components/reading/RelationshipStatusSelect.vue'
import StreakBadge from '../components/result/StreakBadge.vue'
import TomorrowTeaser from '../components/result/TomorrowTeaser.vue'
import ReversedNoticeBanner from '../components/result/ReversedNoticeBanner.vue'
import { useDailyTarot } from '../composables/useDailyTarot.js'
import { useReadingSession } from '../composables/useReadingSession.js'
import { applyRelationshipModifier } from '../data/relationshipModifiers.js'
import { useStreak } from '../composables/useStreak.js'
import { encodeReadingParams, buildShareUrl, decodeReadingParams } from '../utils/shareLink.js'
import { getCardById, TAROT_CARDS, shuffleCards } from '../data/tarotCards.js'

const {
  phase,
  deck,
  selectedIds,
  drawnCard,
  isReversed,
  result: baseResult,
  canConfirm,
  alreadyDrawn,
  onSelect,
  confirm,
  reset,
  clearRevealTimer,
} = useDailyTarot()

const { streak } = useStreak()

// 연애 상태 - 이미 오늘 뽑은 경우 상태 선택 건너뜀
const relationshipStatus = ref(null)
useReadingSession('today', { phase, selectedIds, relationshipStatus, deck })
const showStatusSelect = computed(() => phase.value === 'draw' && !alreadyDrawn.value && !relationshipStatus.value)

const result = computed(() => {
  if (!baseResult.value || !drawnCard.value) return baseResult.value
  return applyRelationshipModifier(drawnCard.value.id, baseResult.value, relationshipStatus.value)
})

function selectStatus(s) {
  relationshipStatus.value = s
}

const shareUrl = computed(() => {
  if (!drawnCard.value) return ''
  return buildShareUrl('/today', encodeReadingParams({
    cardId: drawnCard.value.id, reversed: drawnCard.value.reversed, status: relationshipStatus.value,
  }))
})

const isSharedView = ref(false)

const _shared = decodeReadingParams()
if (_shared) {
  const _base = getCardById(_shared.cardId)
  if (_base) {
    isSharedView.value = true
    selectedIds.value = []
    onSelect(_shared.cardId)
    deck.value = deck.value.map(c => c.id === _shared.cardId ? { ...c, reversed: _shared.reversed } : c)
    relationshipStatus.value = _shared.status || null
    phase.value = 'result'
  }
}

function startMyReading() {
  isSharedView.value = false
  const url = new URL(window.location.href)
  url.search = ''
  window.history.replaceState({}, '', url.toString())
  selectedIds.value = []
  deck.value = shuffleCards(TAROT_CARDS)
  relationshipStatus.value = null
  phase.value = 'draw'
}

function scrollTop() { window.scrollTo({ top: 0 }) }

onUnmounted(() => { clearRevealTimer() })
</script>

<template>
  <AppShell>
    <Transition name="phase-fade" mode="out-in" @after-enter="scrollTop">
    <div :key="showStatusSelect ? 'status' : phase">

    <!-- ── STATUS SELECT ─────────────────────────── -->
    <template v-if="showStatusSelect">
      <RelationshipStatusSelect reading-type="오늘의 연애 카드" @select="selectStatus" />
    </template>

    <!-- ── DRAW PHASE ──────────────────────────────── -->
    <template v-else-if="phase === 'draw'">
      <PageContainer>
        <CardDrawHeader
          title="오늘 하루, 어떤 기류가 흐르고 있나요"
          instruction="카드 한 장을 골라보세요. 손이 멈추는 쪽으로."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <SelectedCardState
          :card="drawnCard"
          label="선택한 카드"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <CardDeck
          :cards="deck"
          :selected-ids="selectedIds"
          :max-select="1"
          @select="onSelect"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <DrawActionBar
          :can-confirm="canConfirm"
          confirm-label="오늘의 카드 확인하기"
          reset-label="다시 섞기"
          :show-reset="selectedIds.filter(Boolean).length > 0"
          @confirm="confirm"
          @reset="reset"
        />
      </SectionBlock>
    </template>

    <!-- ── REVEAL PHASE ────────────────────────────── -->
    <template v-else-if="phase === 'reveal' && drawnCard">
      <CardRevealTransition
        :card-id="drawnCard.id"
        :card-name="drawnCard.name"
        :card-name-en="drawnCard.nameEn"
        reading-type="오늘의 연애 카드"
        :reversed="isReversed"
      />
    </template>

    <!-- ── RESULT PHASE ────────────────────────────── -->
    <template v-else-if="phase === 'result' && drawnCard && result">
      <!-- 카드 타입 라벨 -->
      <div class="today-result-type lt-appear">
        <p class="today-result-type__label">오늘의 연애 카드</p>
        <p v-if="alreadyDrawn && streak > 1" class="today-result-type__streak">{{ streak }}일 연속 리딩 중</p>
      </div>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <CardImageBlock :image-src="drawnCard.image" :card-name="drawnCard.name" :card-name-en="drawnCard.nameEn" :energy="drawnCard.energy" :keywords="[]" :reversed="isReversed" />
      </SectionBlock>

      <SectionBlock v-if="isReversed" spacing="sm" class="lt-appear lt-appear--delay-1">
        <ReversedNoticeBanner />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <EmotionTagList :tags="result.emotionTags" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <ResultSummaryBox
          :summary="result.summary"
          label="오늘의 에너지"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <MiniShareBar
          reading-type="오늘의 연애 카드"
          :card-name="drawnCard.name"
          :reversed="drawnCard.reversed"
          :summary="result.summary"
          :share-url="shareUrl"
          :card-image="drawnCard.image"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-3">
        <EmotionFlowSection
          title="오늘 감정의 기류"
          :lines="result.emotionFlow"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-4">
        <AdviceSection
          title="지금 할 수 있는 것"
          :lines="result.advice"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <CautionSection
          title="조심할 점"
          :lines="result.caution"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <ReadingClosingBlock message="오늘 카드가 전한 에너지가 하루를 조용히 비추기를 바랍니다." />
      </SectionBlock>

      <SectionBlock v-if="!isSharedView" spacing="sm" class="lt-appear lt-appear--delay-5">
        <TomorrowTeaser :energy="drawnCard.energy" />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ShareSaveSection
          reading-type="오늘의 연애 카드"
          :card-name="drawnCard.name"
          :card-name-en="drawnCard.nameEn"
          :card-image="drawnCard.image"
          :reversed="drawnCard.reversed"
          :summary="result.summary"
          :emotion-tags="result.emotionTags"
          :share-url="shareUrl"
        />
      </SectionBlock>

      <SectionBlock v-if="isSharedView" spacing="md">
        <div class="try-mine-wrap">
          <p class="try-mine-wrap__text">나는 어떤 카드가 나올까?</p>
          <button class="try-mine-wrap__btn" @click="startMyReading">나도 뽑아보기</button>
        </div>
      </SectionBlock>

      <SectionBlock v-if="streak >= 2" spacing="md">
        <StreakBadge :streak="streak" :card-name="drawnCard.name" />
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="today" />
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
/* ── Result type label ── */
.today-result-type {
  text-align: center;
  padding: var(--lt-space-lg) var(--lt-space-md) var(--lt-space-sm);
}

.today-result-type__label {
  font-size: 0.65rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.7;
}

.today-result-type__streak {
  font-size: 0.68rem;
  color: rgba(100, 220, 180, 0.8);
  letter-spacing: 0.06em;
  margin-top: 6px;
}

/* ── "나도 뽑아보기" CTA (공유 방문자용) ── */
.try-mine-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: var(--lt-space-md) var(--lt-space-lg);
}

.try-mine-wrap__text {
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  letter-spacing: 0.06em;
  font-weight: 200;
  opacity: 0.8;
}

.try-mine-wrap__btn {
  padding: 6px 20px;
  border: 1px solid rgba(77, 163, 255, 0.22);
  border-radius: var(--lt-radius-full);
  font-size: 0.75rem;
  color: var(--lt-accent-2);
  background: rgba(77, 163, 255, 0.06);
  letter-spacing: 0.06em;
  opacity: 0.8;
  cursor: pointer;
  transition:
    opacity var(--lt-transition),
    border-color var(--lt-transition),
    box-shadow var(--lt-transition);
}

.try-mine-wrap__btn:hover {
  opacity: 1;
  border-color: rgba(77, 163, 255, 0.4);
  box-shadow: 0 0 12px rgba(77, 163, 255, 0.1);
}
</style>
