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
import SpreadDrawState from '../components/draw/SpreadDrawState.vue'
import ThreeCardLayout from '../components/threecards/ThreeCardLayout.vue'
import ThreeCardMeaningBlock from '../components/threecards/ThreeCardMeaningBlock.vue'
import ThreeCardSummaryBox from '../components/threecards/ThreeCardSummaryBox.vue'
import EmotionFlowSection from '../components/result/EmotionFlowSection.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import RelationshipStatusSelect from '../components/reading/RelationshipStatusSelect.vue'
import { saveLastReading } from '../composables/useLastReading.js'
import { saveReadingHistory } from '../composables/useReadingHistory.js'
import { useCardDraw } from '../composables/useCardDraw.js'
import { LOVE_CARD_INTERPRETATIONS, getLoveOverall } from '../data/readings/love.js'
import { applyRelationshipModifierToOverall } from '../data/relationshipModifiers.js'

const POSITIONS = ['myHeart', 'theirEnergy', 'direction']
const POSITION_LABELS = { myHeart: '나의 마음', theirEnergy: '상대의 에너지', direction: '관계의 방향' }

const { deck, selectedIds, selectedCards, canConfirm, onSelect, reset } = useCardDraw({ maxSelect: 3 })
const phase = ref('intro') // 'intro' | 'status' | 'draw' | 'reveal' | 'result'
const relationshipStatus = ref(null)

const drawnTriple = computed(() =>
  selectedCards.value.slice(0, 3).map((card, i) => ({
    ...card,
    position: POSITION_LABELS[POSITIONS[i]],
    positionKey: POSITIONS[i],
  }))
)

const overall = computed(() => {
  if (drawnTriple.value.length < 3) return null
  const base = getLoveOverall(drawnTriple.value.map(c => c.energy))
  return applyRelationshipModifierToOverall(base, relationshipStatus.value)
})

const flowPoints = [
  { label: '나의 마음', text: '지금 당신의 감정이 어디를 향하고 있는지 읽어봅니다.' },
  { label: '상대의 에너지', text: '상대가 지금 어떤 에너지 안에 있는지 살펴봅니다.' },
  { label: '관계의 방향', text: '두 사람 사이의 흐름이 어디로 향하는지 비춰봅니다.' },
]

function startReading() { phase.value = 'status' }
function selectStatus(s) { relationshipStatus.value = s; phase.value = 'draw' }

function confirm() {
  if (!canConfirm.value) return
  const names = drawnTriple.value.map(c => c.name).join(' · ')
  saveLastReading({ readingType: '러브 타로', cardId: 'love', cardName: names, cardNameEn: '' })
  saveReadingHistory({
    readingType: '러브 타로',
    spreadType: 'three',
    cards: drawnTriple.value.map(c => ({ id: c.id, name: c.name, nameEn: c.nameEn, reversed: c.reversed, position: c.position })),
    summary: overall.value?.summary ?? '',
  })
  phase.value = 'reveal'
  setTimeout(() => { phase.value = 'result' }, 1800)
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
          title="러브 타로"
          subtitle="두 사람의 마음과 관계의 방향을 세 장의 카드로 읽어봅니다."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <ReadingDescriptionBox
          description="사랑의 흐름이 어디를 향하는지 알고 싶을 때 - 나의 마음, 상대의 에너지, 그리고 관계의 방향을 카드 세 장으로 조용히 펼쳐봅니다."
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ReadingPointList :points="flowPoints" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <StartReadingCTA
          label="카드 3장 뽑기"
          note="그 사람을 조용히 떠올린 채, 손이 머무는 카드를 하나씩 골라보세요."
          @start="startReading"
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="love" />
      </SectionBlock>
    </template>

    <!-- ── STATUS ────────────────────────────────────── -->
    <template v-else-if="phase === 'status'">
      <RelationshipStatusSelect reading-type="러브 타로" @select="selectStatus" />
    </template>

    <!-- ── DRAW ───────────────────────────────────── -->
    <template v-else-if="phase === 'draw'">
      <PageContainer>
        <CardDrawHeader
          title="세 장의 카드를 순서대로 골라보세요"
          instruction="나의 마음 → 상대의 에너지 → 관계의 방향 순으로 선택합니다."
          :current-step="selectedIds.length < 3 ? selectedIds.length + 1 : 3"
          :total-steps="3"
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <SpreadDrawState
          :selected-cards="selectedCards"
          :positions="['나의 마음', '상대의 에너지', '관계의 방향']"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <CardDeck :cards="deck" :selected-ids="selectedIds" :max-select="3" @select="onSelect" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <DrawActionBar
          :can-confirm="canConfirm"
          confirm-label="러브 타로 결과 보기"
          reset-label="다시 선택"
          :show-reset="selectedIds.length > 0"
          @confirm="confirm"
          @reset="reset"
        />
      </SectionBlock>
    </template>

    <!-- ── REVEAL ─────────────────────────────────── -->
    <template v-else-if="phase === 'reveal'">
      <div class="love-reveal">
        <div class="love-reveal__glow" />
        <p class="love-reveal__text">카드가 펼쳐지고 있습니다</p>
        <div class="love-reveal__cards">
          <div
            v-for="(card, i) in drawnTriple"
            :key="card.id"
            class="love-reveal__card"
            :style="{ animationDelay: `${i * 300}ms` }"
          >
            <div class="love-reveal__card-inner">
              <svg viewBox="0 0 120 198" fill="none" class="love-reveal__card-svg">
                <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
                <rect x="9" y="9" width="102" height="180" rx="4" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5"/>
                <path d="M13 21 Q13 13 21 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <path d="M107 21 Q107 13 99 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <path d="M13 177 Q13 185 21 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <path d="M107 177 Q107 185 99 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
                <circle cx="40" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
                <circle cx="42.5" cy="30.5" r="4" fill="#0A1020"/>
                <circle cx="60" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
                <circle cx="80" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
                <circle cx="77.5" cy="30.5" r="4" fill="#0A1020"/>
                <line x1="60" y1="40" x2="60" y2="68" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
                <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>
                <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>
                <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="0.5" fill="none"/>
                <path d="M40 99 C48 85 54 81 60 81 C66 81 72 85 80 99 C72 113 66 117 60 117 C54 117 48 113 40 99Z" stroke="#C8A96E" stroke-opacity="0.6" stroke-width="0.8" fill="none"/>
                <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="none"/>
                <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
                <line x1="60" y1="130" x2="60" y2="158" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
                <circle cx="40" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
                <circle cx="37.5" cy="167.5" r="4" fill="#0A1020"/>
                <circle cx="60" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
                <circle cx="80" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
                <circle cx="82.5" cy="167.5" r="4" fill="#0A1020"/>
              </svg>
            </div>
            <span class="love-reveal__card-pos">{{ card.position }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ── RESULT ─────────────────────────────────── -->
    <template v-else-if="phase === 'result' && drawnTriple.length === 3 && overall">
      <div class="love-result__hero lt-appear">
        <p class="love-result__hero-label">러브 타로 결과</p>
        <SectionBlock spacing="sm">
          <ThreeCardLayout :cards="drawnTriple" />
        </SectionBlock>
      </div>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-2">
        <EmotionFlowSection title="지금 감정의 온도" :lines="overall.currentEmotion" />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-3">
        <EmotionFlowSection title="숨겨진 감정" :lines="overall.hiddenFeeling" />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-4">
        <AdviceSection title="관계의 방향" :lines="overall.guidance" />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-5">
        <div class="love-result__meanings">
          <ThreeCardMeaningBlock
            v-for="card in drawnTriple"
            :key="card.id"
            :card-id="card.id"
            :position="card.position"
            :card-name="card.name"
            :keywords="LOVE_CARD_INTERPRETATIONS[card.id]?.[card.positionKey]?.keywords ?? card.keywords"
            :interpretation="LOVE_CARD_INTERPRETATIONS[card.id]?.[card.positionKey]?.text ?? ''"
            :reversed="card.reversed"
          />
        </div>
      </SectionBlock>

      <SectionBlock v-if="overall.spreadNarrative" spacing="md" class="lt-appear lt-appear--delay-5">
        <EmotionFlowSection title="카드가 함께 말하는 것" :lines="overall.spreadNarrative" />
      </SectionBlock>

      <SectionBlock spacing="md" class="lt-appear lt-appear--delay-5">
        <ThreeCardSummaryBox :summary="overall.summary" label="전체 흐름 요약" />
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="love" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <div class="love-result__retry-wrap">
          <button class="love-result__retry" @click="retry">다시 뽑기</button>
        </div>
      </SectionBlock>

      <SectionBlock spacing="sm">
        <ShareSaveSection
          reading-type="러브 타로"
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
/* ── Reveal Phase ── */
.love-reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: var(--lt-space-xl) var(--lt-space-md);
  position: relative;
  overflow: hidden;
}

.love-reveal__glow {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(77, 163, 255, 0.08) 0%, transparent 70%);
  animation: reveal-glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes reveal-glow-pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

.love-reveal__text {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.12em;
  margin-bottom: var(--lt-space-xl);
  animation: lt-fade-in 600ms ease both;
}

.love-reveal__cards {
  display: flex;
  gap: var(--lt-space-lg);
}

.love-reveal__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: reveal-card-appear 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes reveal-card-appear {
  0%   { opacity: 0; transform: translateY(40px) scale(0.75); }
  60%  { opacity: 1; transform: translateY(-6px) scale(1.04); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.love-reveal__card-inner {
  width: 72px;
  height: 118px;
  border-radius: var(--lt-radius-sm);
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1px solid rgba(200, 169, 110, 0.35);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 16px rgba(200, 169, 110, 0.12);
  overflow: hidden;
  animation: reveal-card-glow 2.2s ease-in-out infinite;
  animation-delay: inherit;
}

@keyframes reveal-card-glow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(200,169,110,0.12);
    border-color: rgba(200,169,110,0.35);
  }
  50% {
    box-shadow: 0 8px 40px rgba(0,0,0,0.55), 0 0 24px rgba(200,169,110,0.22);
    border-color: rgba(200,169,110,0.55);
  }
}

.love-reveal__card-svg {
  width: 100%;
  height: 100%;
}

.love-reveal__card-pos {
  font-size: 0.58rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  opacity: 0.65;
}

/* ── Result Phase ── */
.love-result__hero {
  background: linear-gradient(180deg, var(--lt-bg-1) 0%, var(--lt-bg-0) 100%);
  padding-bottom: var(--lt-space-lg);
  margin-bottom: var(--lt-space-md);
  border-bottom: 1px solid var(--lt-border-soft);
}

.love-result__hero-label {
  text-align: center;
  font-family: var(--lt-font-sans);
  font-size: 0.72rem;
  font-weight: 300;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  padding: var(--lt-space-xl) 0 var(--lt-space-md);
  opacity: 0.65;
}

.love-result__meanings {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-md);
}

.love-result__retry-wrap {
  display: flex;
  justify-content: center;
  padding: 0 var(--lt-space-md);
}

.love-result__retry {
  font-size: 0.85rem;
  color: var(--lt-text-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: var(--lt-space-xs) var(--lt-space-md);
  transition: color var(--lt-transition);
}

.love-result__retry:hover {
  color: var(--lt-text-sub);
}

@media (prefers-reduced-motion: reduce) {
  .love-reveal__card,
  .love-reveal__card-inner,
  .love-reveal__glow,
  .love-reveal__text {
    animation: none;
  }
}
</style>
