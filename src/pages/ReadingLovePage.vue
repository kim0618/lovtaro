<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useHead } from '../composables/useHead.js'
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
import EmotionFlowSection from '../components/result/EmotionFlowSection.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import CoreInsightBlock from '../components/result/CoreInsightBlock.vue'
import ReadingClosingBlock from '../components/result/ReadingClosingBlock.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import MiniShareBar from '../components/result/MiniShareBar.vue'
import RelationshipStatusSelect from '../components/reading/RelationshipStatusSelect.vue'
import { saveLastReading } from '../composables/useLastReading.js'
import { saveReadingHistory } from '../composables/useReadingHistory.js'
import { useCardDraw } from '../composables/useCardDraw.js'
import { useReadingSession } from '../composables/useReadingSession.js'
import { getCardById } from '../data/tarotCards.js'
import { getCardImage } from '../data/cardImages.js'
import { LOVE_CARD_INTERPRETATIONS, getLoveOverall } from '../data/readings/love.js'
import { applyRelationshipModifierToOverall } from '../data/relationshipModifiers.js'
import { encodeSpreadParams, buildShareUrl, decodeSpreadParams } from '../utils/shareLink.js'

useHead({
  title: '러브타로 - 두 사람의 마음과 관계의 방향 | Lovtaro',
  description: '나의 마음, 상대의 에너지, 관계의 방향. 세 장의 카드로 사랑의 흐름을 깊이 읽어봅니다. 무료 러브타로 스프레드 리딩.',
})

const POSITIONS = ['myHeart', 'theirEnergy', 'direction']
const POSITION_LABELS = { myHeart: '나의 마음', theirEnergy: '상대의 에너지', direction: '관계의 방향' }

const { deck, selectedIds, selectedCards, selectedCount, canConfirm, onSelect, removeAt, reset } = useCardDraw({ maxSelect: 3 })
const phase = ref('intro') // 'intro' | 'status' | 'draw' | 'reveal' | 'result'
const deckKey = ref(0)
const relationshipStatus = ref(null)
const { clearSession } = useReadingSession('love', { phase, selectedIds, relationshipStatus, deck })

const _shared = decodeSpreadParams()
if (_shared && _shared.cards.length >= 3) {
  const resolved = _shared.cards.map(c => {
    const base = getCardById(c.id)
    if (!base) return null
    return { ...base, reversed: c.reversed, image: getCardImage(c.id) || '' }
  })
  if (!resolved.some(c => !c)) {
    selectedIds.value = [null, null, null]
    relationshipStatus.value = _shared.status || null
    resolved.forEach(c => onSelect(c.id))
    deck.value = deck.value.map(c => {
      const match = resolved.find(r => r.id === c.id)
      return match ? { ...c, reversed: match.reversed } : c
    })
    phase.value = 'result'
  }
}

const drawnTriple = computed(() =>
  selectedCards.value.filter(Boolean).map((card, i) => ({
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

const shareUrl = computed(() => {
  if (drawnTriple.value.length < 3) return ''
  return buildShareUrl('/reading/love', encodeSpreadParams(
    drawnTriple.value.map(c => ({ id: c.id, reversed: c.reversed })),
    relationshipStatus.value,
  ))
})

const flowPoints = [
  { label: '나의 마음', text: '지금 당신의 감정이 어디를 향하고 있는지 읽어봅니다.' },
  { label: '상대의 에너지', text: '상대가 지금 어떤 에너지 안에 있는지 살펴봅니다.' },
  { label: '관계의 방향', text: '두 사람 사이의 흐름이 어디로 향하는지 비춰봅니다.' },
]

let revealTimer = null

function startReading() { phase.value = 'status' }
function selectStatus(s) { relationshipStatus.value = s; phase.value = 'draw' }

function confirm() {
  if (!canConfirm.value) return
  const names = drawnTriple.value.map(c => c.name).join(' · ')
  saveLastReading({ readingType: '러브타로', cardId: 'love', cardName: names, cardNameEn: '' })
  saveReadingHistory({
    readingType: '러브타로',
    spreadType: 'three',
    cards: drawnTriple.value.map(c => ({ id: c.id, name: c.name, nameEn: c.nameEn, reversed: c.reversed, position: c.position })),
    summary: overall.value?.summary ?? '',
  })
  phase.value = 'reveal'
  revealTimer = setTimeout(() => { phase.value = 'result' }, 2800)
}

function doReset() { reset(); deckKey.value++ }
function retry() { clearSession(); doReset(); phase.value = 'draw' }
function scrollTop() { window.scrollTo({ top: 0 }) }

onUnmounted(() => { if (revealTimer) clearTimeout(revealTimer) })

const DRAW_INSTRUCTIONS = [
  '나의 마음 자리의 카드를 먼저 고르세요',
  '상대의 에너지 자리의 카드를 고르세요',
  '마지막으로 관계의 방향 카드를 고르세요',
  '3장이 모두 선택되었습니다',
]
const drawInstruction = computed(() => DRAW_INSTRUCTIONS[Math.min(selectedCount.value, 3)])

</script>

<template>
  <AppShell>
    <Transition name="phase-fade" mode="out-in" @after-enter="scrollTop">
    <div :key="phase">
    <!-- ── INTRO ───────────────────────────────────── -->
    <template v-if="phase === 'intro'">
      <PageContainer>
        <ReadingIntroHeader
          title="러브타로"
          subtitle="두 사람의 마음과 관계의 방향을 세 장의 카드로 읽어봅니다."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <ReadingDescriptionBox
          description="사랑의 흐름이 어디를 향하는지 알고 싶을 때. 나의 마음, 상대의 에너지, 그리고 관계의 방향을 카드 세 장으로 조용히 펼쳐봅니다."
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
      <RelationshipStatusSelect reading-type="러브타로" @select="selectStatus" />
    </template>

    <!-- ── DRAW ───────────────────────────────────── -->
    <template v-else-if="phase === 'draw'">
      <PageContainer>
        <CardDrawHeader
          title="세 장의 카드를 순서대로 골라보세요"
          :instruction="drawInstruction"
          :selected-count="selectedCount"
          :total-steps="3"
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <SpreadDrawState
          :selected-cards="selectedCards"
          :positions="['나의 마음', '상대의 에너지', '관계의 방향']"
          @remove="onSelect"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <CardDeck :key="deckKey" :cards="deck" :selected-ids="selectedIds" :max-select="3" @select="onSelect" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <DrawActionBar
          :can-confirm="canConfirm"
          confirm-label="러브타로 결과 보기"
          reset-label="다시 선택"
          :show-reset="selectedCount > 0"
          :selected-count="selectedCount"
          :total-count="3"
          @confirm="confirm"
          @reset="doReset"
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
            :style="{ '--card-delay': `${i * 400}ms` }"
          >
            <span class="love-reveal__card-pos">{{ card.position }}</span>
            <div class="love-reveal__card-body">
              <div class="love-reveal__card-flipper">
                <!-- 뒷면: 만다라/눈 -->
                <div class="love-reveal__card-back">
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
                <!-- 앞면: 카드 일러스트 -->
                <div class="love-reveal__card-front">
                  <img
                    v-if="card.image"
                    :src="card.image"
                    :alt="card.name"
                    class="love-reveal__card-img"
                    :class="{ 'love-reveal__card-img--reversed': card.reversed }"
                  />
                  <div v-else class="love-reveal__card-front-content">
                    <span class="love-reveal__card-name">{{ card.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="love-reveal__hint">잠시 후 해석이 펼쳐집니다</p>
        <div class="love-reveal__dots" aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>
    </template>

    <!-- ── RESULT ─────────────────────────────────── -->
    <template v-else-if="phase === 'result' && drawnTriple.length === 3 && overall">
      <div class="love-result__hero lt-appear">
        <p class="love-result__hero-label">러브타로 결과</p>
        <SectionBlock spacing="sm">
          <ThreeCardLayout :cards="drawnTriple" />
        </SectionBlock>
      </div>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <CoreInsightBlock :insight="overall.summary" label="핵심 메시지" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <MiniShareBar
          reading-type="러브타로"
          :summary="overall.summary"
          :share-url="shareUrl"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <EmotionFlowSection title="지금 감정의 온도" :lines="overall.currentEmotion" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-3">
        <EmotionFlowSection title="숨겨진 감정" :lines="overall.hiddenFeeling" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-4">
        <AdviceSection title="관계의 방향" :lines="overall.guidance" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
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

      <SectionBlock v-if="overall.spreadNarrative" spacing="sm" class="lt-appear lt-appear--delay-5">
        <EmotionFlowSection title="카드가 함께 말하는 것" :lines="overall.spreadNarrative" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <ReadingClosingBlock message="세 장의 카드가 비춘 흐름이 마음에 조용히 남기를 바랍니다." />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ShareSaveSection
          reading-type="러브타로"
          mode="three"
          :cards="drawnTriple"
          :summary="overall.summary"
          :share-url="shareUrl"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <div class="love-result__retry-wrap">
          <button class="love-result__retry" @click="retry">다시 뽑기</button>
        </div>
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="love" />
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
  min-height: calc(100vh - 60px);
  min-height: calc(100dvh - 60px);
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  position: relative;
  overflow: hidden;
}

.love-reveal__glow {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(200, 169, 110, 0.06) 0%, rgba(77, 163, 255, 0.04) 40%, transparent 70%);
  animation: reveal-glow-pulse 2.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes reveal-glow-pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
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
  gap: var(--lt-space-md);
}

.love-reveal__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  animation: love-reveal-appear 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--card-delay, 0ms);
}

@keyframes love-reveal-appear {
  0%   { opacity: 0; transform: translateY(40px) scale(0.75); }
  60%  { opacity: 1; transform: translateY(-6px) scale(1.04); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.love-reveal__card-pos {
  font-size: 0.58rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  opacity: 0.65;
}

.love-reveal__card-body {
  width: 100px;
  height: 165px;
  perspective: 800px;
}

.love-reveal__card-flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: love-card-flip 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  animation-delay: calc(var(--card-delay, 0ms) + 300ms);
}

@keyframes love-card-flip {
  0%   { transform: rotateY(0deg) scale(0.95); }
  30%  { transform: rotateY(0deg) scale(1) translateY(-6px); }
  50%  { transform: rotateY(90deg) scale(1) translateY(-6px); }
  75%  { transform: rotateY(180deg) scale(1.02) translateY(-3px); }
  100% { transform: rotateY(180deg) scale(1) translateY(0); }
}

.love-reveal__card-back,
.love-reveal__card-front {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--lt-radius-sm);
  overflow: hidden;
}

.love-reveal__card-back {
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1px solid rgba(200, 169, 110, 0.35);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 16px rgba(200, 169, 110, 0.12);
}

.love-reveal__card-front {
  transform: rotateY(180deg);
  background: linear-gradient(170deg, var(--lt-bg-3) 0%, var(--lt-bg-2) 100%);
  border: 1px solid rgba(200, 169, 110, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(200, 169, 110, 0.08);
}

.love-reveal__card-svg {
  width: 100%;
  height: 100%;
}

.love-reveal__card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.love-reveal__card-img--reversed {
  transform: rotate(180deg);
}

.love-reveal__card-front-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.love-reveal__card-name {
  font-size: 0.82rem;
  color: var(--lt-text-strong);
  font-weight: 300;
  letter-spacing: 0.04em;
}

.love-reveal__hint {
  font-size: 0.62rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.1em;
  opacity: 0;
  margin-top: var(--lt-space-lg);
  animation: lt-fade-in 400ms ease 1.6s both;
}

.love-reveal__dots {
  display: flex;
  gap: 12px;
  margin-top: var(--lt-space-xl);
  opacity: 0;
  animation: lt-fade-in 500ms ease 2s both;
}

.love-reveal__dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(200, 169, 110, 0.3);
  animation: love-dot-blink 1.4s ease-in-out infinite;
}

.love-reveal__dots span:nth-child(2) { animation-delay: 0.2s; }
.love-reveal__dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes love-dot-blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
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
  font-size: 0.75rem;
  font-weight: 300;
  color: var(--lt-accent-3);
  letter-spacing: 0.12em;
  padding: var(--lt-space-lg) 0 var(--lt-space-md);
  opacity: 0.7;
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

.love-result__retry:hover {
  opacity: 1;
  border-color: rgba(77, 163, 255, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .love-reveal__card,
  .love-reveal__card-flipper,
  .love-reveal__glow,
  .love-reveal__text {
    animation: none;
    opacity: 1;
  }
  .love-reveal__card-flipper {
    transform: rotateY(180deg);
  }
}
</style>
