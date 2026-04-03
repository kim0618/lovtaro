<script setup>
import { ref, computed } from 'vue'
import AppShell from '../components/common/AppShell.vue'
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
import { saveLastReading } from '../composables/useLastReading.js'
import { useCardDraw } from '../composables/useCardDraw.js'
import { MIND_RESULTS } from '../data/readings/mind.js'
import { applyReversedModifier } from '../data/reversedModifiers.js'
import { applyRelationshipModifier } from '../data/relationshipModifiers.js'
import { saveReadingHistory } from '../composables/useReadingHistory.js'

const { deck, selectedIds, selectedCards, canConfirm, onSelect, reset } = useCardDraw({ maxSelect: 1 })
const phase = ref('intro') // 'intro' | 'status' | 'draw' | 'reveal' | 'result'
const relationshipStatus = ref(null)

const drawnCard = computed(() => selectedCards.value[0] ?? null)
const isReversed = computed(() => drawnCard.value?.reversed ?? false)
const result = computed(() => {
  if (!drawnCard.value) return null
  const upright = MIND_RESULTS[drawnCard.value.id]
  if (!upright) return null
  const withReversed = applyReversedModifier(drawnCard.value.id, upright, isReversed.value)
  return applyRelationshipModifier(drawnCard.value.id, withReversed, relationshipStatus.value)
})

const flowPoints = [
  { label: '상대의 현재 기류', text: '지금 그 사람의 감정이 어디에 머물고 있는지 살펴봅니다.' },
  { label: '속마음의 결',      text: '드러나지 않는 내면의 에너지를 카드로 읽어봅니다.' },
  { label: '지금의 방향',      text: '이 흐름에서 어떤 태도가 맞는지 살펴봅니다.' },
]

function startReading() { phase.value = 'status' }
function selectStatus(s) { relationshipStatus.value = s; phase.value = 'draw' }
function confirm() {
  if (!canConfirm.value) return
  const card = drawnCard.value
  saveLastReading({ readingType: '상대방 속마음', cardId: card.id, cardName: card.name, cardNameEn: card.nameEn })
  saveReadingHistory({
    readingType: '상대방 속마음',
    spreadType: 'single',
    cards: [{ id: card.id, name: card.name, nameEn: card.nameEn, reversed: card.reversed }],
    summary: result.value?.summary ?? '',
  })
  phase.value = 'reveal'
  setTimeout(() => { phase.value = 'result' }, 2200)
}
function retry() { reset(); phase.value = 'draw' }
</script>

<template>
  <AppShell>
    <Transition name="phase-fade" mode="out-in">
    <div :key="phase">
    <!-- ── INTRO ───────────────────────────────────── -->
    <template v-if="phase === 'intro'">
      <PageContainer>
        <ReadingIntroHeader
          title="상대방 속마음 타로"
          subtitle="그 사람이 지금 나를 어떻게 인식하고 있는지, 카드의 흐름으로 살펴봅니다."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <ReadingDescriptionBox
          description="상대의 마음이 어디를 향하고 있는지, 직접 묻기 어려울 때 - 지금 어떤 에너지가 흐르는지 카드로 읽어봅니다. 답을 단정 짓는 것이 아니라, 기류를 살피는 리딩입니다."
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ReadingPointList :points="flowPoints" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <StartReadingCTA
          label="카드 한 장 뽑기"
          note="그 사람을 조용히 떠올린 채, 손이 머무는 카드를 골라보세요."
          @start="startReading"
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="mind" />
      </SectionBlock>
    </template>

    <!-- ── STATUS ────────────────────────────────────── -->
    <template v-else-if="phase === 'status'">
      <RelationshipStatusSelect reading-type="상대방 속마음" @select="selectStatus" />
    </template>

    <!-- ── DRAW ───────────────────────────────────── -->
    <template v-else-if="phase === 'draw'">
      <PageContainer>
        <CardDrawHeader
          title="그 사람의 기류가 담긴 카드를 골라보세요"
          instruction="서두르지 않아도 됩니다. 손이 멈추는 곳으로."
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
          confirm-label="속마음 확인하기"
          reset-label="다시 섞기"
          :show-reset="selectedIds.length > 0"
          @confirm="confirm"
          @reset="reset"
        />
      </SectionBlock>
    </template>

    <!-- ── REVEAL ─────────────────────────────────── -->
    <template v-else-if="phase === 'reveal' && drawnCard">
      <CardRevealTransition
        :card-name="drawnCard.name"
        :card-name-en="drawnCard.nameEn"
        reading-type="상대방 속마음"
        :reversed="isReversed"
      />
    </template>

    <!-- ── RESULT ─────────────────────────────────── -->
    <template v-else-if="phase === 'result' && drawnCard && result">
      <PageContainer>
        <ResultHeroCard
          reading-type="상대방 속마음"
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
        <ResultSummaryBox :summary="result.summary" label="핵심 해석" />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-3">
        <EmotionFlowSection title="지금 감정의 흐름" :lines="result.emotionFlow" />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-4">
        <AdviceSection title="지금 할 수 있는 것" :lines="result.advice" />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-5">
        <CautionSection title="조심할 점" :lines="result.caution" />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-5">
        <SectionDivider />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <ReadingClosingBlock />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ShareSaveSection
          reading-type="상대방 속마음"
          :card-name="drawnCard.name"
          :card-name-en="drawnCard.nameEn"
          :summary="result.summary"
          :emotion-tags="result.emotionTags"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <div class="reading-result__retry-wrap">
          <button class="reading-result__retry" @click="retry">다시 뽑기</button>
        </div>
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="mind" />
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
.reading-result__retry-wrap {
  display: flex;
  justify-content: center;
  padding: 0 var(--lt-space-md);
}

.reading-result__retry {
  font-size: 0.85rem;
  color: var(--lt-text-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: var(--lt-space-xs) var(--lt-space-md);
  transition: color var(--lt-transition);
}

.reading-result__retry:hover {
  color: var(--lt-text-sub);
}
</style>
