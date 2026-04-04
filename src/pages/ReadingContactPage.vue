<script setup>
import { ref, computed } from 'vue'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import ReadingIntroHeader from '../components/reading/ReadingIntroHeader.vue'
import ReadingDescriptionBox from '../components/reading/ReadingDescriptionBox.vue'
import ReadingPointList from '../components/reading/ReadingPointList.vue'
import StartReadingCTA from '../components/reading/StartReadingCTA.vue'
import RelationshipStatusSelect from '../components/reading/RelationshipStatusSelect.vue'
import CardDrawHeader from '../components/draw/CardDrawHeader.vue'
import CardDeck from '../components/draw/CardDeck.vue'
import SelectedCardState from '../components/draw/SelectedCardState.vue'
import DrawActionBar from '../components/draw/DrawActionBar.vue'
import CardImageBlock from '../components/result/CardImageBlock.vue'
import EmotionTagList from '../components/result/EmotionTagList.vue'
import CoreInsightBlock from '../components/result/CoreInsightBlock.vue'
import EmotionFlowSection from '../components/result/EmotionFlowSection.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import CautionSection from '../components/result/CautionSection.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import ReadingClosingBlock from '../components/result/ReadingClosingBlock.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import CardRevealTransition from '../components/result/CardRevealTransition.vue'
import { saveLastReading } from '../composables/useLastReading.js'
import { useCardDraw } from '../composables/useCardDraw.js'
import { CONTACT_RESULTS } from '../data/readings/contact.js'
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
  const upright = CONTACT_RESULTS[drawnCard.value.id]
  if (!upright) return null
  const withReversed = applyReversedModifier(drawnCard.value.id, upright, isReversed.value)
  return applyRelationshipModifier(drawnCard.value.id, withReversed, relationshipStatus.value)
})

const flowPoints = [
  { label: '지금 상대의 상태', text: '상대가 현재 어떤 에너지 안에 있는지 살펴봅니다.' },
  { label: '연락 가능성',      text: '연락이 올 수 있는 흐름인지 카드가 비춰줍니다.' },
  { label: '지금의 방향',      text: '기다리는 동안 어떤 태도가 맞는지 살펴봅니다.' },
]

function startReading() { phase.value = 'status' }
function selectStatus(s) { relationshipStatus.value = s; phase.value = 'draw' }
function confirm() {
  if (!canConfirm.value) return
  const card = drawnCard.value
  saveLastReading({ readingType: '연락 올까', cardId: card.id, cardName: card.name, cardNameEn: card.nameEn })
  saveReadingHistory({
    readingType: '연락 올까',
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
          title="연락 올까 타로"
          subtitle="그 사람에게서 연락이 올 수 있는 흐름인지, 지금 기류를 읽어봅니다."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <ReadingDescriptionBox
          description="기다리는 시간 속에서 방향이 보이지 않을 때 - 그 사람이 지금 어떤 상태에 있는지, 연락이 올 수 있는 기류인지 카드로 읽어냅니다."
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ReadingPointList :points="flowPoints" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <StartReadingCTA
          label="카드 한 장 뽑기"
          note="그 사람을 조용히 떠올린 채, 손이 멈추는 카드를 골라보세요."
          @start="startReading"
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="contact" />
      </SectionBlock>
    </template>

    <!-- ── STATUS ────────────────────────────────────── -->
    <template v-else-if="phase === 'status'">
      <RelationshipStatusSelect reading-type="연락 올까" @select="selectStatus" />
    </template>

    <!-- ── DRAW ───────────────────────────────────── -->
    <template v-else-if="phase === 'draw'">
      <PageContainer>
        <CardDrawHeader
          title="연락의 기류가 담긴 카드를 골라보세요"
          instruction="마음을 가라앉힌 채, 손이 멈추는 카드로."
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
          confirm-label="흐름 확인하기"
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
        reading-type="연락 올까"
        :reversed="isReversed"
      />
    </template>

    <!-- ── RESULT ─────────────────────────────────── -->
    <template v-else-if="phase === 'result' && drawnCard && result">
      <div class="reading-result__hero lt-appear">
        <p class="reading-result__hero-label">연락 올까</p>
      </div>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <CardImageBlock :card-name="drawnCard.name" :card-name-en="drawnCard.nameEn" :energy="drawnCard.energy" :keywords="drawnCard.keywords" :reversed="isReversed" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <EmotionTagList :tags="result.emotionTags" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <CoreInsightBlock :insight="result.summary" label="핵심 해석" />
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
          reading-type="연락 올까"
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
        <OtherReadingsNav current="contact" />
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
