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
import DrawActionBar from '../components/draw/DrawActionBar.vue'
import ThreeCardDrawState from '../components/draw/ThreeCardDrawState.vue'
import ThreeCardLayout from '../components/threecards/ThreeCardLayout.vue'
import ThreeCardMeaningBlock from '../components/threecards/ThreeCardMeaningBlock.vue'
import ThreeCardSummaryBox from '../components/threecards/ThreeCardSummaryBox.vue'
import EmotionFlowSection from '../components/result/EmotionFlowSection.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import { saveLastReading } from '../composables/useLastReading.js'
import { saveReadingHistory } from '../composables/useReadingHistory.js'
import { useCardDraw } from '../composables/useCardDraw.js'
import { THREE_CARD_INTERPRETATIONS, getThreeCardOverall } from '../data/readings/threecards.js'

const REVEAL_DURATION = 1800

const POSITIONS = ['past', 'present', 'future']
const POSITION_LABELS = { past: '과거', present: '현재', future: '미래' }

const { deck, selectedIds, selectedCards, canConfirm, onSelect, reset } = useCardDraw({ maxSelect: 3 })
const phase = ref('intro') // 'intro' | 'draw' | 'reveal' | 'result'

// 카드 3장 + 포지션 배정
const drawnTriple = computed(() =>
  selectedCards.value.slice(0, 3).map((card, i) => ({
    ...card,
    position: POSITION_LABELS[POSITIONS[i]],
    positionKey: POSITIONS[i],
  }))
)

const overall = computed(() => {
  if (drawnTriple.value.length < 3) return null
  return getThreeCardOverall(drawnTriple.value.map(c => c.energy))
})

const flowPoints = [
  { label: '과거 - 어떤 기류가 있었나', text: '관계의 시작이나 이별에 흐르던 에너지를 읽어냅니다.' },
  { label: '현재 - 지금의 결',          text: '지금 두 사람 사이에 어떤 흐름이 있는지 살펴봅니다.' },
  { label: '미래 - 앞으로의 방향',      text: '현재 기류가 이어지면 어떤 흐름으로 향하는지 읽어냅니다.' },
]

function startReading() { phase.value = 'draw' }
function confirm() {
  if (!canConfirm.value) return
  const names = drawnTriple.value.map(c => c.name).join(' · ')
  saveLastReading({ readingType: '3장 리딩', cardId: 'three', cardName: names, cardNameEn: '' })
  saveReadingHistory({
    readingType: '3장 리딩',
    spreadType: 'three',
    cards: drawnTriple.value.map(c => ({ id: c.id, name: c.name, nameEn: c.nameEn, reversed: c.reversed, position: c.position })),
    summary: overall.value?.summary ?? '',
  })
  phase.value = 'reveal'
  setTimeout(() => { phase.value = 'result' }, REVEAL_DURATION)
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
          title="3장 리딩"
          subtitle="과거, 현재, 미래의 기류로 관계의 흐름을 읽어봅니다."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <ReadingDescriptionBox
          description="카드 한 장보다 더 넓은 흐름으로 관계를 살피고 싶을 때 - 3장 리딩은 과거의 기류부터 앞으로의 방향까지 흐름 전체를 읽어냅니다."
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ReadingPointList :points="flowPoints" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <StartReadingCTA
          label="카드 3장 뽑기"
          note="관계를 조용히 떠올린 채, 손이 머무는 카드를 하나씩 골라보세요."
          @start="startReading"
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="3cards" />
      </SectionBlock>
    </template>

    <!-- ── DRAW ───────────────────────────────────── -->
    <template v-else-if="phase === 'draw'">
      <PageContainer>
        <CardDrawHeader
          title="카드를 3장 순서대로 골라보세요"
          instruction="과거 → 현재 → 미래 순으로 손이 머무는 카드를 선택합니다."
          :current-step="selectedIds.length < 3 ? selectedIds.length + 1 : 3"
          :total-steps="3"
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <ThreeCardDrawState :selected-cards="selectedCards" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <CardDeck :cards="deck" :selected-ids="selectedIds" :max-select="3" @select="onSelect" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <DrawActionBar
          :can-confirm="canConfirm"
          confirm-label="3장 리딩 결과 보기"
          reset-label="다시 선택"
          :show-reset="selectedIds.length > 0"
          @confirm="confirm"
          @reset="reset"
        />
      </SectionBlock>
    </template>

    <!-- ── REVEAL ─────────────────────────────────── -->
    <template v-else-if="phase === 'reveal'">
      <div class="three-reveal">
        <div class="three-reveal__glow" />
        <p class="three-reveal__text">카드가 펼쳐지고 있습니다</p>
        <div class="three-reveal__cards">
          <div
            v-for="(card, i) in drawnTriple"
            :key="card.id"
            class="three-reveal__card"
            :style="{ animationDelay: `${i * 400}ms` }"
          >
            <div class="three-reveal__card-inner">
              <span class="three-reveal__card-name">{{ card.name }}</span>
              <span class="three-reveal__card-pos">{{ card.position }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── RESULT ─────────────────────────────────── -->
    <template v-else-if="phase === 'result' && drawnTriple.length === 3 && overall">
      <!-- 카드 배열 히어로 -->
      <div class="three-result__hero lt-appear">
        <p class="three-result__hero-label">3장 리딩 결과</p>
        <SectionBlock spacing="sm">
          <ThreeCardLayout :cards="drawnTriple" />
        </SectionBlock>
      </div>

      <!-- 현재 감정 -->
      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-2">
        <EmotionFlowSection title="현재 감정" :lines="overall.currentEmotion" />
      </SectionBlock>

      <!-- 관계 흐름 -->
      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-3">
        <EmotionFlowSection title="관계의 흐름" :lines="overall.relationshipFlow" />
      </SectionBlock>

      <!-- 조언 -->
      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-4">
        <AdviceSection title="지금 할 수 있는 것" :lines="overall.advice" />
      </SectionBlock>

      <!-- 카드별 해석 -->
      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-5">
        <div class="three-result__meanings">
          <ThreeCardMeaningBlock
            v-for="card in drawnTriple"
            :key="card.id"
            :card-id="card.id"
            :position="card.position"
            :card-name="card.name"
            :keywords="THREE_CARD_INTERPRETATIONS[card.id]?.[card.positionKey]?.keywords ?? card.keywords"
            :interpretation="THREE_CARD_INTERPRETATIONS[card.id]?.[card.positionKey]?.text ?? ''"
            :reversed="card.reversed"
          />
        </div>
      </SectionBlock>

      <!-- 종합 요약 -->
      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-5">
        <ThreeCardSummaryBox :summary="overall.summary" label="전체 흐름 요약" />
      </SectionBlock>

      <!-- 다른 리딩 보기 - PRIMARY CTA -->
      <SectionBlock spacing="md">
        <OtherReadingsNav current="3cards" />
      </SectionBlock>

      <!-- 다시 뽑기 - secondary -->
      <SectionBlock spacing="sm">
        <div class="three-result__retry-wrap">
          <button class="three-result__retry" @click="retry">다시 뽑기</button>
        </div>
      </SectionBlock>

      <SectionBlock spacing="sm">
        <ShareSaveSection
          reading-type="3장 리딩"
          mode="three"
          :cards="drawnTriple"
          :summary="overall.summary"
        />
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
.three-result__hero {
  background: linear-gradient(180deg, var(--lt-bg-1) 0%, var(--lt-bg-0) 100%);
  padding-bottom: var(--lt-space-lg);
  margin-bottom: var(--lt-space-md);
  border-bottom: 1px solid var(--lt-border-soft);
}

.three-result__hero-label {
  text-align: center;
  font-family: var(--lt-font-display);
  font-size: 0.9rem;
  font-weight: 300;
  font-style: italic;
  color: var(--lt-accent-3);
  letter-spacing: 0.08em;
  padding: var(--lt-space-xl) 0 var(--lt-space-md);
  opacity: 0.8;
}

.three-result__meanings {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-md);
}

.three-result__retry-wrap {
  display: flex;
  justify-content: center;
  padding: 0 var(--lt-space-md);
}

.three-result__retry {
  font-size: 0.85rem;
  color: var(--lt-text-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: var(--lt-space-xs) var(--lt-space-md);
  transition: color var(--lt-transition);
}

.three-result__retry:hover {
  color: var(--lt-text-sub);
}

/* ── Reveal Phase ── */
.three-reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: var(--lt-space-xl) var(--lt-space-md);
  position: relative;
  overflow: hidden;
}

.three-reveal__glow {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(77, 163, 255, 0.08) 0%, transparent 70%);
  animation: three-reveal-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes three-reveal-pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

.three-reveal__text {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.12em;
  margin-bottom: var(--lt-space-xl);
  animation: lt-fade-in 600ms ease both;
}

.three-reveal__cards {
  display: flex;
  gap: var(--lt-space-lg);
}

.three-reveal__card {
  width: 80px;
  height: 130px;
  animation: three-reveal-appear 800ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes three-reveal-appear {
  0% { opacity: 0; transform: translateY(30px) scale(0.8); }
  60% { opacity: 1; transform: translateY(-4px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.three-reveal__card-inner {
  width: 100%;
  height: 100%;
  border-radius: var(--lt-radius-md);
  background: linear-gradient(170deg, var(--lt-bg-3) 0%, var(--lt-bg-1) 100%);
  border: 1px solid rgba(77, 163, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(77, 163, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
}

.three-reveal__card-name {
  font-size: 0.85rem;
  color: var(--lt-text-strong);
  font-weight: 300;
  letter-spacing: 0.04em;
}

.three-reveal__card-pos {
  font-size: 0.6rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  opacity: 0.7;
}

@media (prefers-reduced-motion: reduce) {
  .three-reveal__card,
  .three-reveal__glow,
  .three-reveal__text {
    animation: none;
  }
}
</style>
