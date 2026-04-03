<script setup>
import { ref, computed } from 'vue'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import CardDrawHeader from '../components/draw/CardDrawHeader.vue'
import CardDeck from '../components/draw/CardDeck.vue'
import SelectedCardState from '../components/draw/SelectedCardState.vue'
import DrawActionBar from '../components/draw/DrawActionBar.vue'
import ResultHeroCard from '../components/result/ResultHeroCard.vue'
import CardImageBlock from '../components/result/CardImageBlock.vue'
import EmotionTagList from '../components/result/EmotionTagList.vue'
import ResultSummaryBox from '../components/result/ResultSummaryBox.vue'
import EmotionFlowSection from '../components/result/EmotionFlowSection.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import CautionSection from '../components/result/CautionSection.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import SectionDivider from '../components/result/SectionDivider.vue'
import ReadingClosingBlock from '../components/result/ReadingClosingBlock.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import CardRevealTransition from '../components/result/CardRevealTransition.vue'
import RelationshipStatusSelect from '../components/reading/RelationshipStatusSelect.vue'
import { useDailyTarot } from '../composables/useDailyTarot.js'
import { applyRelationshipModifier } from '../data/relationshipModifiers.js'

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
          :show-reset="selectedIds.length > 0"
          @confirm="confirm"
          @reset="reset"
        />
      </SectionBlock>
    </template>

    <!-- ── REVEAL PHASE ────────────────────────────── -->
    <template v-else-if="phase === 'reveal' && drawnCard">
      <CardRevealTransition
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
        <p class="today-already-drawn__sub">내일 새로운 카드가 기다리고 있어요</p>
        <button class="today-already-drawn__redraw" @click="handleResetToday">다시 뽑기</button>
      </div>

      <PageContainer>
        <ResultHeroCard
          reading-type="오늘의 연애 카드"
          :card-name="drawnCard.name"
          :card-name-en="drawnCard.nameEn"
          :reversed="isReversed"
        />
      </PageContainer>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <CardImageBlock :card-name="drawnCard.name" :card-name-en="drawnCard.nameEn" :energy="drawnCard.energy" :keywords="drawnCard.keywords" :reversed="isReversed" />
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

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-3">
        <EmotionFlowSection
          title="오늘 감정의 기류"
          :lines="result.emotionFlow"
        />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-4">
        <AdviceSection
          title="지금 할 수 있는 것"
          :lines="result.advice"
        />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-5">
        <CautionSection
          title="조심할 점"
          :lines="result.caution"
        />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-5">
        <SectionDivider />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <ReadingClosingBlock message="오늘 카드가 전한 에너지가 하루를 조용히 비추기를 바랍니다." />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ShareSaveSection
          reading-type="오늘의 연애 카드"
          :card-name="drawnCard.name"
          :card-name-en="drawnCard.nameEn"
          :summary="result.summary"
          :emotion-tags="result.emotionTags"
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
.today-already-drawn {
  text-align: center;
  padding: var(--lt-space-lg) var(--lt-space-md) 0;
}

.today-already-drawn__text {
  font-size: 0.82rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.1em;
  opacity: 0.8;
}

.today-already-drawn__sub {
  font-size: 0.75rem;
  color: var(--lt-text-muted);
  margin-top: 4px;
  letter-spacing: 0.06em;
}

.today-already-drawn__redraw {
  margin-top: 10px;
  font-size: 0.75rem;
  color: var(--lt-text-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  letter-spacing: 0.06em;
  opacity: 0.6;
  transition: opacity var(--lt-transition);
}

.today-already-drawn__redraw:hover {
  opacity: 1;
}
</style>
