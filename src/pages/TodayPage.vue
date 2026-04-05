<script setup>
import { ref, computed } from 'vue'
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
import RelationshipStatusSelect from '../components/reading/RelationshipStatusSelect.vue'
import { useDailyTarot } from '../composables/useDailyTarot.js'
import { applyRelationshipModifier } from '../data/relationshipModifiers.js'
import { useStreak } from '../composables/useStreak.js'
import { encodeReadingParams, buildShareUrl } from '../utils/shareLink.js'

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
  resetToday,
} = useDailyTarot()

const { streak } = useStreak()

// 연애 상태 - 이미 오늘 뽑은 경우 상태 선택 건너뜀
const relationshipStatus = ref(null)
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

function handleResetToday() {
  relationshipStatus.value = null
  resetToday()
}
</script>

<template>
  <AppShell>
    <Transition name="phase-fade" mode="out-in">
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
      <!-- Already drawn today notice -->
      <div v-if="alreadyDrawn" class="today-already-drawn lt-appear">
        <p class="today-already-drawn__text">오늘 뽑은 카드입니다</p>
        <p v-if="streak > 1" class="today-already-drawn__streak">{{ streak }}일 연속 리딩 중</p>
        <p class="today-already-drawn__sub">내일 새로운 카드가 기다리고 있어요</p>
        <button class="today-already-drawn__redraw" @click="handleResetToday">다시 뽑기</button>
      </div>

      <!-- 카드 타입 라벨 -->
      <div class="today-result-type lt-appear">
        <p class="today-result-type__label">오늘의 연애 카드</p>
      </div>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <CardImageBlock :image-src="drawnCard.image" :card-name="drawnCard.name" :card-name-en="drawnCard.nameEn" :energy="drawnCard.energy" :keywords="[]" :reversed="isReversed" />
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
/* ── Already drawn notice ── */
.today-already-drawn {
  text-align: center;
  padding: var(--lt-space-lg) var(--lt-space-md);
  margin: 0 var(--lt-space-md) var(--lt-space-md);
  background: rgba(77, 163, 255, 0.04);
  border: 1px solid rgba(77, 163, 255, 0.1);
  border-radius: var(--lt-radius-lg);
}

.today-already-drawn__text {
  font-size: 0.8rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.1em;
  opacity: 0.85;
}

.today-already-drawn__streak {
  font-size: 0.75rem;
  color: rgba(100, 220, 180, 0.9);
  letter-spacing: 0.08em;
  margin-top: 6px;
  font-weight: 400;
}

.today-already-drawn__sub {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  margin-top: 4px;
  letter-spacing: 0.06em;
}

.today-already-drawn__redraw {
  margin-top: 12px;
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

.today-already-drawn__redraw:hover {
  opacity: 1;
  border-color: rgba(77, 163, 255, 0.4);
}

/* ── Result type label (replaces ResultHeroCard) ── */
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
</style>
