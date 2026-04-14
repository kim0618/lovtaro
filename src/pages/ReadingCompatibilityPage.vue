<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'

useHead({
  title: '궁합 타로 - 두 사람의 케미를 카드로 확인하세요 | Lovtaro',
  description: '나와 상대의 카드를 한 장씩 뽑아 궁합을 확인합니다. 두 사람의 에너지, 케미, 궁합 점수를 무료로 리딩합니다.',
})
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import ReadingIntroHeader from '../components/reading/ReadingIntroHeader.vue'
import ReadingDescriptionBox from '../components/reading/ReadingDescriptionBox.vue'
import ReadingPointList from '../components/reading/ReadingPointList.vue'
import StartReadingCTA from '../components/reading/StartReadingCTA.vue'
import CardDrawHeader from '../components/draw/CardDrawHeader.vue'
import CardDeck from '../components/draw/CardDeck.vue'
import DrawActionBar from '../components/draw/DrawActionBar.vue'
import CompatibilityScore from '../components/result/CompatibilityScore.vue'
import CompatibilityCardPair from '../components/result/CompatibilityCardPair.vue'
import CoreInsightBlock from '../components/result/CoreInsightBlock.vue'
import EmotionFlowSection from '../components/result/EmotionFlowSection.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import CautionSection from '../components/result/CautionSection.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import ReadingClosingBlock from '../components/result/ReadingClosingBlock.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import MiniShareBar from '../components/result/MiniShareBar.vue'
import { saveLastReading } from '../composables/useLastReading.js'
import { useCardDraw } from '../composables/useCardDraw.js'
import { calculateCompatibility, generateCompatibilityResult } from '../data/readings/compatibility.js'
import { saveReadingHistory } from '../composables/useReadingHistory.js'
import { useReadingSession } from '../composables/useReadingSession.js'
import { encodeReadingParams, buildShareUrl, decodeReadingParams } from '../utils/shareLink.js'
import { getCardById } from '../data/tarotCards.js'
import { getCardImage } from '../data/cardImages.js'

const { deck, selectedIds, selectedCards, selectedCount, canConfirm, onSelect, reset } = useCardDraw({ maxSelect: 2 })
const phase = ref('intro') // 'intro' | 'draw' | 'reveal' | 'result'
const drawStep = ref(1) // 1 = 나의 카드, 2 = 상대 카드

const { clearSession } = useReadingSession('compatibility', { phase, selectedIds, deck })

const _shared = decodeReadingParams()
if (_shared) {
  const _base1 = getCardById(_shared.cardId)
  if (_base1) {
    selectedIds.value = [null, null]
    onSelect(_shared.cardId)
    deck.value = deck.value.map(c => c.id === _shared.cardId ? { ...c, reversed: _shared.reversed } : c)
    if (_shared.cardId2) {
      const _base2 = getCardById(_shared.cardId2)
      if (_base2) {
        onSelect(_shared.cardId2)
        deck.value = deck.value.map(c => c.id === _shared.cardId2 ? { ...c, reversed: _shared.reversed2 ?? false } : c)
      }
    }
  }
}

const card1 = computed(() => selectedCards.value[0] ?? null)
const card2 = computed(() => selectedCards.value[1] ?? null)

const score = ref(0)
const result = ref(null)

// 세션 복원 및 공유 링크 진입 시 결과 재계산
if ((phase.value === 'result' || _shared) && card1.value && card2.value) {
  const s = calculateCompatibility(card1.value.id, card1.value.reversed, card2.value.id, card2.value.reversed)
  score.value = s
  result.value = generateCompatibilityResult(card1.value, card2.value, s)
  phase.value = 'result'
}
const shareUrl = computed(() => {
  if (!card1.value || !card2.value) return ''
  return buildShareUrl('/reading/compatibility', encodeReadingParams({
    cardId: card1.value.id, reversed: card1.value.reversed,
    cardId2: card2.value.id, reversed2: card2.value.reversed,
  }))
})

const flowPoints = [
  { label: '나의 카드', text: '나를 떠올리며 끌리는 카드를 한 장 골라보세요.' },
  { label: '상대의 카드', text: '상대를 떠올리며 다시 한 장을 골라보세요.' },
  { label: '궁합 읽기', text: '두 카드가 만들어내는 케미와 궁합을 읽어냅니다.' },
]

const drawHeaders = {
  1: { title: '나를 떠올리며 카드를 골라보세요', instruction: '지금의 나를 담은 카드, 손이 가는 대로.' },
  2: { title: '상대를 떠올리며 한 장 더 골라보세요', instruction: '그 사람의 에너지가 담긴 카드로.' },
}

let revealTimer = null

function startReading() { phase.value = 'draw'; drawStep.value = 1 }

function handleSelect(id) {
  if (drawStep.value === 1 && selectedCount.value === 0) {
    onSelect(id)
    drawStep.value = 2
  } else if (drawStep.value === 2 && selectedCount.value === 1) {
    onSelect(id)
  }
}

function confirm() {
  if (selectedCount.value < 2) return
  const c1 = card1.value
  const c2 = card2.value
  const s = calculateCompatibility(c1.id, c1.reversed, c2.id, c2.reversed)
  score.value = s
  result.value = generateCompatibilityResult(c1, c2, s)

  saveLastReading({ readingType: '궁합 타로', cardId: c1.id, cardName: c1.name, cardNameEn: c1.nameEn })
  saveReadingHistory({
    readingType: '궁합 타로',
    spreadType: 'pair',
    cards: [
      { id: c1.id, name: c1.name, nameEn: c1.nameEn, reversed: c1.reversed },
      { id: c2.id, name: c2.name, nameEn: c2.nameEn, reversed: c2.reversed },
    ],
    summary: result.value?.scoreSummary ?? '',
    details: result.value ? { score: s, scoreLabel: result.value.scoreLabel, advice: result.value.advice, caution: result.value.caution } : null,
  })
  phase.value = 'reveal'
  revealTimer = setTimeout(() => { phase.value = 'result' }, 2800)
}

function retry() { clearSession(); reset(); drawStep.value = 1; phase.value = 'draw' }
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
          title="궁합 타로"
          subtitle="두 사람의 에너지가 만나면 어떤 흐름이 생기는지, 카드로 읽어봅니다."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <ReadingDescriptionBox
          description="나와 상대, 각각 한 장씩 카드를 뽑아보세요. 두 카드가 만들어내는 케미와 궁합 점수를 읽어냅니다."
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ReadingPointList :points="flowPoints" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <StartReadingCTA
          label="궁합 보기"
          note="나와 상대를 떠올리며, 끌리는 카드를 한 장씩 골라보세요."
          @start="startReading"
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="compatibility" />
      </SectionBlock>
    </template>

    <!-- ── DRAW ───────────────────────────────────── -->
    <template v-else-if="phase === 'draw'">
      <PageContainer>
        <CardDrawHeader
          :title="drawHeaders[drawStep].title"
          :instruction="drawHeaders[drawStep].instruction"
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <div class="compat-draw-pair">
          <div class="compat-draw-pair__slot" :class="{ 'compat-draw-pair__slot--active': drawStep === 1, 'compat-draw-pair__slot--done': !!card1 }">
            <p class="compat-draw-pair__label">나의 카드</p>
            <div v-if="card1" class="compat-draw-pair__filled">
              <div class="compat-draw-pair__card-frame compat-draw-pair__card-frame--glow">
                <svg class="compat-draw-pair__card-art" viewBox="0 0 120 198" fill="none">
                  <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="1"/>
                  <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.22" stroke-width="0.5" fill="none"/>
                  <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.6" fill="none"/>
                  <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="0.6" fill="none"/>
                  <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.65"/>
                </svg>
              </div>
              <span class="compat-draw-pair__check">&#10003;</span>
            </div>
            <div v-else class="compat-draw-pair__empty" />
          </div>

          <div class="compat-draw-pair__connector" aria-hidden="true">
            <span class="compat-draw-pair__dot" />
            <span class="compat-draw-pair__line" />
            <span class="compat-draw-pair__dot" />
          </div>

          <div class="compat-draw-pair__slot" :class="{ 'compat-draw-pair__slot--active': drawStep === 2, 'compat-draw-pair__slot--done': !!card2 }">
            <p class="compat-draw-pair__label">상대의 카드</p>
            <div v-if="card2" class="compat-draw-pair__filled">
              <div class="compat-draw-pair__card-frame compat-draw-pair__card-frame--glow">
                <svg class="compat-draw-pair__card-art" viewBox="0 0 120 198" fill="none">
                  <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="1"/>
                  <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.22" stroke-width="0.5" fill="none"/>
                  <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.6" fill="none"/>
                  <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="0.6" fill="none"/>
                  <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.65"/>
                </svg>
              </div>
              <span class="compat-draw-pair__check">&#10003;</span>
            </div>
            <div v-else class="compat-draw-pair__empty" />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock spacing="sm">
        <CardDeck :cards="deck" :selected-ids="selectedIds" :max-select="2" @select="handleSelect" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <DrawActionBar
          :can-confirm="selectedCount === 2"
          confirm-label="궁합 확인하기"
          reset-label="다시 섞기"
          :show-reset="selectedCount > 0"
          @confirm="confirm"
          @reset="() => { reset(); drawStep = 1 }"
        />
      </SectionBlock>
    </template>

    <!-- ── REVEAL ─────────────────────────────────── -->
    <template v-else-if="phase === 'reveal' && card1 && card2">
      <div class="compat-reveal">
        <p class="compat-reveal__type">궁합 타로</p>
        <div class="compat-reveal__text">두 사람의 에너지를 읽고 있어요</div>
        <div class="compat-reveal__pair">
          <div class="compat-reveal__card-slot">
            <div class="compat-reveal__flip" :class="{ 'compat-reveal__flip--reversed': card1.reversed }">
              <div class="compat-reveal__flip-inner compat-reveal__flip-inner--first">
                <div class="compat-reveal__back">
                  <svg viewBox="0 0 120 198" fill="none">
                    <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
                    <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>
                    <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>
                    <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
                  </svg>
                </div>
                <div class="compat-reveal__front">
                  <img :src="getCardImage(card1.id)" :alt="card1.name" />
                </div>
              </div>
            </div>
            <p class="compat-reveal__name compat-reveal__name--first">{{ card1.name }}</p>
          </div>

          <div class="compat-reveal__connector" aria-hidden="true">
            <span class="compat-reveal__connector-dot" />
            <span class="compat-reveal__connector-line" />
            <span class="compat-reveal__connector-dot" />
          </div>

          <div class="compat-reveal__card-slot">
            <div class="compat-reveal__flip" :class="{ 'compat-reveal__flip--reversed': card2.reversed }">
              <div class="compat-reveal__flip-inner compat-reveal__flip-inner--second">
                <div class="compat-reveal__back">
                  <svg viewBox="0 0 120 198" fill="none">
                    <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
                    <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>
                    <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>
                    <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
                  </svg>
                </div>
                <div class="compat-reveal__front">
                  <img :src="getCardImage(card2.id)" :alt="card2.name" />
                </div>
              </div>
            </div>
            <p class="compat-reveal__name compat-reveal__name--second">{{ card2.name }}</p>
          </div>
        </div>
        <p class="compat-reveal__message">두 카드가 만나 이야기를 만들어갑니다</p>
      </div>
    </template>

    <!-- ── RESULT ─────────────────────────────────── -->
    <template v-else-if="phase === 'result' && card1 && card2 && result">
      <div class="reading-result__hero lt-appear">
        <p class="reading-result__hero-label">궁합 타로</p>
      </div>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <CompatibilityScore :score="score" :label="result.scoreLabel" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <CoreInsightBlock :insight="result.scoreSummary" label="두 사람의 궁합" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <MiniShareBar
          reading-type="궁합 타로"
          :summary="result.scoreSummary"
          :share-url="shareUrl"
          mode="compatibility"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <CompatibilityCardPair :card1="card1" :card2="card2" :energy1="result.energy1" :energy2="result.energy2" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-3">
        <EmotionFlowSection title="두 사람의 케미" :lines="result.emotionFlow" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-4">
        <AdviceSection title="이 관계에서 할 수 있는 것" :lines="result.advice" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <CautionSection title="조심할 점" :lines="result.caution" />
      </SectionBlock>

      <SectionBlock v-if="result.spreadNarrative" spacing="sm" class="lt-appear lt-appear--delay-5">
        <EmotionFlowSection title="두 카드가 함께 말하는 것" :lines="[result.spreadNarrative]" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <ReadingClosingBlock />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ShareSaveSection
          reading-type="궁합 타로"
          mode="compatibility"
          :card-name="card1.name"
          :card-name-en="card1.nameEn"
          :card-image="card1.image"
          :reversed="card1.reversed"
          :card2-name="card2.name"
          :card2-name-en="card2.nameEn"
          :card2-image="card2.image"
          :card2-reversed="card2.reversed"
          :score="score"
          :score-label="result.scoreLabel"
          :summary="result.scoreSummary"
          :emotion-tags="[]"
          :share-url="shareUrl"
          :share-title="`궁합 ${score}%! ${card1.name} + ${card2.name}`"
          :answer-label="`${score}%`"
          :answer-desc="result.scoreLabel"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <div class="reading-result__retry-wrap">
          <button class="reading-result__retry" @click="retry">다시 뽑기</button>
        </div>
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="compatibility" />
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

/* Draw pair slots */
.compat-draw-pair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--lt-space-sm);
  padding: var(--lt-space-md) var(--lt-space-md);
}

.compat-draw-pair__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-sm);
  opacity: 0.4;
  transition: opacity 400ms ease;
}

.compat-draw-pair__slot--active {
  opacity: 1;
}

.compat-draw-pair__slot--done {
  opacity: 0.85;
}

.compat-draw-pair__label {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.06em;
  transition: color 300ms ease;
}

.compat-draw-pair__slot--active .compat-draw-pair__label {
  color: var(--lt-accent-2);
}

.compat-draw-pair__slot--done .compat-draw-pair__label {
  color: var(--lt-accent-3);
}

.compat-draw-pair__empty {
  width: 72px;
  height: 118px;
  border: 1px dashed rgba(199, 215, 248, 0.18);
  border-radius: var(--lt-radius-sm);
  background: linear-gradient(170deg, rgba(10, 16, 32, 0.5) 0%, rgba(5, 7, 13, 0.3) 100%);
  transition: border-color 300ms ease;
}

.compat-draw-pair__slot--active .compat-draw-pair__empty {
  border-color: rgba(77, 163, 255, 0.3);
  animation: slot-pulse 2.4s ease-in-out infinite;
}

@keyframes slot-pulse {
  0%, 100% { border-color: rgba(77, 163, 255, 0.2); }
  50% { border-color: rgba(77, 163, 255, 0.45); }
}

.compat-draw-pair__filled {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.compat-draw-pair__card-frame {
  width: 72px;
  height: 118px;
  border-radius: var(--lt-radius-sm);
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1.5px solid rgba(200, 169, 110, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.compat-draw-pair__card-frame--glow {
  box-shadow:
    0 0 16px rgba(200, 169, 110, 0.2),
    0 0 40px rgba(77, 163, 255, 0.1),
    0 6px 24px rgba(0, 0, 0, 0.4);
  animation: pair-glow 2.4s ease-in-out infinite;
}

@keyframes pair-glow {
  0%, 100% {
    box-shadow: 0 0 16px rgba(200, 169, 110, 0.2), 0 0 40px rgba(77, 163, 255, 0.1), 0 6px 24px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 24px rgba(200, 169, 110, 0.32), 0 0 56px rgba(77, 163, 255, 0.18), 0 6px 24px rgba(0, 0, 0, 0.4);
  }
}

.compat-draw-pair__card-art {
  width: 100%;
  height: 100%;
}

.compat-draw-pair__check {
  font-size: 0.62rem;
  color: var(--lt-accent-3);
  margin-top: 4px;
  opacity: 0.8;
}

.compat-draw-pair__connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin-bottom: 20px;
}

.compat-draw-pair__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(200, 169, 110, 0.35);
}

.compat-draw-pair__line {
  width: 1px;
  height: 30px;
  background: linear-gradient(180deg, rgba(200, 169, 110, 0.25) 0%, rgba(200, 169, 110, 0.08) 100%);
}

/* Reveal – 2-card */
.compat-reveal {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--lt-space-xl) var(--lt-space-md);
  position: relative;
  overflow: hidden;
}

.compat-reveal__type {
  font-size: 0.65rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.14em;
  margin-bottom: var(--lt-space-md);
  opacity: 0;
  animation: lt-fade-in 500ms ease 200ms both;
}

.compat-reveal__text {
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  letter-spacing: 0.08em;
  margin-bottom: var(--lt-space-2xl);
  opacity: 0;
  animation: compat-pulse-in 2s ease-in-out 400ms infinite;
}

@keyframes compat-pulse-in {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.compat-reveal__pair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--lt-space-md);
}

.compat-reveal__card-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.compat-reveal__flip {
  width: 110px;
  height: 180px;
  perspective: 1000px;
}

.compat-reveal__flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.compat-reveal__flip-inner--first {
  animation: compat-card-flip 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) 600ms both;
}

.compat-reveal__flip-inner--second {
  animation: compat-card-flip 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) 1000ms both;
}

@keyframes compat-card-flip {
  0%   { transform: rotateY(0deg) scale(0.92); }
  30%  { transform: rotateY(0deg) scale(1) translateY(-8px); }
  50%  { transform: rotateY(90deg) scale(1) translateY(-8px); }
  75%  { transform: rotateY(180deg) scale(1.03) translateY(-4px); }
  100% { transform: rotateY(180deg) scale(1) translateY(0); }
}

.compat-reveal__back,
.compat-reveal__front {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--lt-radius-md);
  overflow: hidden;
}

.compat-reveal__back {
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1px solid rgba(200, 169, 110, 0.3);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(200, 169, 110, 0.1);
}

.compat-reveal__back svg {
  width: 100%;
  height: 100%;
}

.compat-reveal__front {
  transform: rotateY(180deg);
  border: 1px solid rgba(200, 169, 110, 0.25);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(200, 169, 110, 0.08);
}

.compat-reveal__front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.compat-reveal__name {
  font-size: 0.88rem;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  margin-top: var(--lt-space-sm);
  text-align: center;
}

.compat-reveal__name--first {
  opacity: 0;
  animation: lt-fade-in 400ms ease 1.8s both;
}

.compat-reveal__name--second {
  opacity: 0;
  animation: lt-fade-in 400ms ease 2.2s both;
}

.compat-reveal__connector {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 28px;
  opacity: 0;
  animation: lt-fade-in 400ms ease 2.0s both;
}

.compat-reveal__connector-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(200, 169, 110, 0.55);
  box-shadow: 0 0 8px rgba(200, 169, 110, 0.3);
}

.compat-reveal__connector-line {
  width: 20px;
  height: 1px;
  background: linear-gradient(90deg, rgba(200, 169, 110, 0.15) 0%, rgba(200, 169, 110, 0.4) 50%, rgba(200, 169, 110, 0.15) 100%);
}

.compat-reveal__message {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.08em;
  margin-top: var(--lt-space-xl);
  opacity: 0;
  animation: lt-fade-in 500ms ease 2.4s both;
}
</style>
