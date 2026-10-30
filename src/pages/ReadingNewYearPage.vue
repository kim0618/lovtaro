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
import NewYearCardGrid from '../components/newyear/NewYearCardGrid.vue'
import NewYearProfileForm from '../components/newyear/NewYearProfileForm.vue'
import NewYearYearCard from '../components/newyear/NewYearYearCard.vue'
import ThreeCardMeaningBlock from '../components/threecards/ThreeCardMeaningBlock.vue'
import EmotionFlowSection from '../components/result/EmotionFlowSection.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import CoreInsightBlock from '../components/result/CoreInsightBlock.vue'
import ReadingClosingBlock from '../components/result/ReadingClosingBlock.vue'
import PremiumResultCta from '../components/result/PremiumResultCta.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import OtherReadingsNav from '../components/common/OtherReadingsNav.vue'
import MiniShareBar from '../components/result/MiniShareBar.vue'
import RelationshipStatusSelect from '../components/reading/RelationshipStatusSelect.vue'
import { saveLastReading } from '../composables/useLastReading.js'
import { saveReadingHistory } from '../composables/useReadingHistory.js'
import { useCardDraw } from '../composables/useCardDraw.js'
import { useReadingSession } from '../composables/useReadingSession.js'
import { trackReadingStart, trackCardDrawn, trackReadingReveal, trackReadingReset } from '../composables/useReadingTracking.js'
import { getCardById } from '../data/tarotCards.js'
import { getCardImage } from '../data/cardImages.js'
import {
  NEWYEAR_YEAR, NEWYEAR_LABEL, NEWYEAR_SEO, NEWYEAR_POSITIONS, NEWYEAR_POSITION_LABELS,
  NEWYEAR_POSITION_THEMES, NEWYEAR_CARD_INTERPRETATIONS, NEWYEAR_YEAR_CARDS, NEWYEAR_FAQ,
  getNewYearOverall, getQuarterText, yearCardIdFromNumber, getYearCardBridge,
} from '../data/readings/newyear.js'
import { REVERSED_MODIFIERS } from '../data/reversedModifiers.js'
import { encodeSpreadParams, buildShareUrl, decodeSpreadParams } from '../utils/shareLink.js'
import { withJosa } from '../utils/josa.js'
import { trackEvent } from '../utils/gtag.js'

useHead({
  title: NEWYEAR_SEO.title,
  description: NEWYEAR_SEO.description,
})

// GA reading_type은 연도 없이 고정해야 해가 바뀌어도 데이터가 이어진다
const READING_TYPE = '신년 연애운'
const POSITION_NAMES = NEWYEAR_POSITIONS.map(p => NEWYEAR_POSITION_LABELS[p])

const { deck, selectedIds, selectedCards, selectedCount, canConfirm, onSelect, reset } = useCardDraw({ maxSelect: 4 })
const phase = ref('intro') // 'intro' | 'status' | 'profile' | 'draw' | 'reveal' | 'result'
const deckKey = ref(0)
const relationshipStatus = ref(null)
const { clearSession } = useReadingSession('newyear', { phase, selectedIds, relationshipStatus, deck })

// 닉네임과 연간 카드 번호만 탭 세션에 둔다(새로고침해도 결과가 유지되도록). 생일 자체는 보관하지 않는다.
const PROFILE_KEY = 'lovtaro_newyear_profile'
const EMPTY_PROFILE = { nickname: '', yearCardNumber: null }
function loadProfile() {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY)
    return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : { ...EMPTY_PROFILE }
  } catch {
    return { ...EMPTY_PROFILE }
  }
}
function saveProfile(p) {
  try { sessionStorage.setItem(PROFILE_KEY, JSON.stringify(p)) } catch { /* 프라이빗 모드 등 */ }
}
const profile = ref(loadProfile())
const isShared = ref(false)

const _shared = decodeSpreadParams()
if (_shared && _shared.cards.length >= 4) {
  const resolved = _shared.cards.slice(0, 4).map(c => {
    const base = getCardById(c.id)
    if (!base) return null
    return { ...base, reversed: c.reversed, image: getCardImage(c.id) || '' }
  })
  if (!resolved.some(c => !c)) {
    selectedIds.value = [null, null, null, null]
    relationshipStatus.value = _shared.status || null
    resolved.forEach(c => onSelect(c.id))
    deck.value = deck.value.map(c => {
      const match = resolved.find(r => r.id === c.id)
      return match ? { ...c, reversed: match.reversed } : c
    })
    phase.value = 'result'
    isShared.value = true
    // 공유 링크에는 닉네임 없이 연간 카드 번호(y)만 실린다. 받는 사람 자신의 세션 프로필은 섞지 않는다
    const y = Number(new URLSearchParams(window.location.search).get('y'))
    profile.value = { nickname: '', yearCardNumber: yearCardIdFromNumber(y) ? y : null }
  }
}

const yearCardId = computed(() => yearCardIdFromNumber(profile.value.yearCardNumber))
const yearCard = computed(() => (yearCardId.value ? getCardById(yearCardId.value) : null))
const resultLabel = computed(() => (profile.value.nickname ? `${profile.value.nickname}님의 ${NEWYEAR_LABEL}` : NEWYEAR_LABEL))

const drawnCards = computed(() =>
  selectedCards.value.filter(Boolean).map((card, i) => ({
    ...card,
    position: POSITION_NAMES[i],
    positionKey: NEWYEAR_POSITIONS[i],
  }))
)

const overall = computed(() => {
  if (drawnCards.value.length < 4) return null
  return getNewYearOverall(drawnCards.value, relationshipStatus.value)
})

const shareUrl = computed(() => {
  if (drawnCards.value.length < 4) return ''
  const qs = encodeSpreadParams(
    drawnCards.value.map(c => ({ id: c.id, reversed: c.reversed })),
    relationshipStatus.value,
  )
  // 끝 슬래시를 붙여 Cloudflare 308을 거치지 않게 한다
  return buildShareUrl('/reading/newyear/', yearCardId.value ? `${qs}&y=${profile.value.yearCardNumber}` : qs)
})

const yearCardBridge = computed(() => (yearCardId.value && overall.value ? getYearCardBridge(yearCardId.value, overall.value) : ''))
const yearCardEyebrow = computed(() => (profile.value.nickname ? `${profile.value.nickname}님의 ${NEWYEAR_YEAR} 연간 카드` : `${NEWYEAR_YEAR} 연간 카드`))

// 공유 이미지: 한 해 모양 제목과 연간 카드를 싣는다
const shareHeadline = computed(() => overall.value?.title ?? '')
const shareSubline = computed(() => (yearCard.value ? `연간 카드 · ${yearCard.value.name} · ${NEWYEAR_YEAR_CARDS[yearCardId.value].theme}` : ''))

function quarterKeywords(card) {
  if (card.reversed) return (REVERSED_MODIFIERS[card.id]?.emotionTags ?? []).slice(0, 3)
  return NEWYEAR_CARD_INTERPRETATIONS[card.id]?.[card.positionKey]?.keywords ?? card.keywords
}

const flowPoints = NEWYEAR_POSITIONS.map(p => ({
  label: NEWYEAR_POSITION_LABELS[p],
  text: `${withJosa(NEWYEAR_POSITION_THEMES[p], '을', '를')} 한 장의 카드로 읽어봅니다.`,
}))

let revealTimer = null

function startReading() { trackReadingStart(READING_TYPE); phase.value = 'status' }
function selectStatus(s) { relationshipStatus.value = s; phase.value = 'profile' }
function submitProfile(p) {
  profile.value = { nickname: p.nickname, yearCardNumber: p.yearCardNumber }
  saveProfile(profile.value)
  // 값 자체가 아니라 입력 여부만 보낸다(PII 금지)
  trackEvent('reading_profile', {
    reading_type: READING_TYPE,
    year_card_used: p.yearCardNumber !== null,
    nickname_used: Boolean(p.nickname),
  })
  phase.value = 'draw'
}

function confirm() {
  if (!canConfirm.value) return
  const names = drawnCards.value.map(c => c.name).join(' · ')
  trackCardDrawn(READING_TYPE, {
    spreadType: 'four',
    cards: drawnCards.value.map(c => ({ id: c.id, reversed: c.reversed, position: c.positionKey })),
  })
  saveLastReading({ readingType: READING_TYPE, cardId: 'newyear', cardName: names, cardNameEn: '' })
  saveReadingHistory({
    readingType: READING_TYPE,
    spreadType: 'four',
    cards: drawnCards.value.map(c => ({ id: c.id, name: c.name, nameEn: c.nameEn, reversed: c.reversed, position: c.position })),
    summary: overall.value?.summary ?? '',
  })
  phase.value = 'reveal'
  revealTimer = setTimeout(() => {
    phase.value = 'result'
    trackReadingReveal(READING_TYPE, { spreadType: 'four', cardCount: drawnCards.value.length })
  }, 3200)
}

function doReset() { reset(); deckKey.value++ }
function retry() {
  trackReadingReset(READING_TYPE)
  clearSession()
  doReset()
  if (isShared.value) {
    // 공유받은 결과에서 다시 뽑으면 내 리딩을 처음부터 시작한다
    isShared.value = false
    profile.value = { ...EMPTY_PROFILE }
    relationshipStatus.value = null
    history.replaceState(null, '', window.location.pathname)
    phase.value = 'status'
    return
  }
  phase.value = 'draw'
}
function scrollTop() { window.scrollTo({ top: 0 }) }

onUnmounted(() => { if (revealTimer) clearTimeout(revealTimer) })

const DRAW_INSTRUCTIONS = [
  '1~3월, 한 해가 열리는 카드를 먼저 고르세요',
  '4~6월의 카드를 고르세요',
  '7~9월의 카드를 고르세요',
  '마지막으로 10~12월의 카드를 고르세요',
  '4장이 모두 선택되었습니다',
]
const drawInstruction = computed(() => DRAW_INSTRUCTIONS[Math.min(selectedCount.value, 4)])
</script>

<template>
  <AppShell>
    <Transition name="phase-fade" mode="out-in" @after-enter="scrollTop">
    <div :key="phase">
    <!-- ── INTRO ───────────────────────────────────── -->
    <template v-if="phase === 'intro'">
      <PageContainer>
        <ReadingIntroHeader
          :title="NEWYEAR_LABEL"
          subtitle="올해 내 연애는 어떻게 흘러갈까. 네 계절의 카드로 한 해의 흐름을 읽어봅니다."
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <ReadingDescriptionBox
          :description="`${NEWYEAR_YEAR}년을 1~3월, 4~6월, 7~9월, 10~12월 네 시기로 나누어 시기마다 카드 한 장씩, 모두 네 장을 뽑습니다. 생일을 알려주시면 올해를 대표하는 나만의 연간 카드도 함께 찾아드려요.`"
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ReadingPointList :points="flowPoints" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <StartReadingCTA
          label="카드 4장 뽑기"
          note="올해 바라는 연애를 조용히 떠올린 채, 손이 머무는 카드를 하나씩 골라보세요."
          @start="startReading"
        />
      </SectionBlock>

      <SectionBlock spacing="md">
        <div class="ny-faq">
          <h2 class="ny-faq__title">자주 묻는 질문</h2>
          <details v-for="item in NEWYEAR_FAQ" :key="item.q" class="ny-faq__item">
            <summary class="ny-faq__q">{{ item.q }}</summary>
            <p class="ny-faq__a">{{ item.a }}</p>
          </details>
        </div>
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="newyear" />
      </SectionBlock>
    </template>

    <!-- ── STATUS ────────────────────────────────────── -->
    <template v-else-if="phase === 'status'">
      <RelationshipStatusSelect :reading-type="READING_TYPE" @select="selectStatus" />
    </template>

    <!-- ── PROFILE ────────────────────────────────────── -->
    <template v-else-if="phase === 'profile'">
      <NewYearProfileForm :initial="{ nickname: profile.nickname }" @submit="submitProfile" />
    </template>

    <!-- ── DRAW ───────────────────────────────────── -->
    <template v-else-if="phase === 'draw'">
      <PageContainer>
        <CardDrawHeader
          title="네 계절의 카드를 골라보세요"
          :instruction="drawInstruction"
          :selected-count="selectedCount"
          :total-steps="4"
        />
      </PageContainer>

      <SectionBlock spacing="sm">
        <SpreadDrawState
          :selected-cards="selectedCards"
          :positions="POSITION_NAMES"
          @remove="onSelect"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <CardDeck :key="deckKey" :cards="deck" :selected-ids="selectedIds" :max-select="4" @select="onSelect" />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <DrawActionBar
          :can-confirm="canConfirm"
          confirm-label="올해의 흐름 보기"
          reset-label="다시 선택"
          :show-reset="selectedCount > 0"
          :selected-count="selectedCount"
          :total-count="4"
          @confirm="confirm"
          @reset="doReset"
        />
      </SectionBlock>
    </template>

    <!-- ── REVEAL ─────────────────────────────────── -->
    <template v-else-if="phase === 'reveal'">
      <div class="ny-reveal">
        <div class="ny-reveal__glow" />
        <p class="ny-reveal__text">한 해의 카드가 펼쳐지고 있습니다</p>
        <div class="ny-reveal__cards">
          <div
            v-for="(card, i) in drawnCards"
            :key="card.id"
            class="ny-reveal__card"
            :style="{ '--card-delay': `${i * 400}ms` }"
          >
            <span class="ny-reveal__card-pos">{{ card.position }}</span>
            <div class="ny-reveal__card-body">
              <div class="ny-reveal__card-flipper">
                <!-- 뒷면: 만다라/눈 -->
                <div class="ny-reveal__card-back">
                  <svg viewBox="0 0 120 198" fill="none" class="ny-reveal__card-svg">
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
                <div class="ny-reveal__card-front">
                  <img
                    v-if="card.image"
                    :src="card.image"
                    :alt="card.name"
                    class="ny-reveal__card-img"
                    :class="{ 'ny-reveal__card-img--reversed': card.reversed }"
                  />
                  <div v-else class="ny-reveal__card-front-content">
                    <span class="ny-reveal__card-name">{{ card.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="ny-reveal__hint">잠시 후 해석이 펼쳐집니다</p>
        <div class="ny-reveal__dots" aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>
    </template>

    <!-- ── RESULT ─────────────────────────────────── -->
    <template v-else-if="phase === 'result' && drawnCards.length === 4 && overall">
      <div class="ny-result__hero lt-appear">
        <p class="ny-result__hero-label">{{ resultLabel }}</p>
        <SectionBlock spacing="sm">
          <NewYearCardGrid :cards="drawnCards" />
        </SectionBlock>
      </div>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <CoreInsightBlock :insight="overall.summary" :label="overall.title" />
      </SectionBlock>

      <SectionBlock v-if="yearCardId" spacing="sm" class="lt-appear lt-appear--delay-2">
        <NewYearYearCard
          :card-id="yearCardId"
          :card-number="profile.yearCardNumber"
          :eyebrow="yearCardEyebrow"
          :bridge="yearCardBridge"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
        <MiniShareBar
          :reading-type="READING_TYPE"
          :summary="overall.summary"
          :share-url="shareUrl"
        />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
        <EmotionFlowSection title="한 해의 흐름" :lines="overall.yearFlow" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-3">
        <AdviceSection title="시기별 포인트" :lines="overall.highlights" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-4">
        <div class="ny-result__meanings">
          <ThreeCardMeaningBlock
            v-for="card in drawnCards"
            :key="card.id"
            card-id=""
            :position="`${card.position} · ${NEWYEAR_POSITION_THEMES[card.positionKey]}`"
            :card-name="card.name"
            :keywords="quarterKeywords(card)"
            :interpretation="getQuarterText(card.id, card.positionKey, card.reversed)"
            :reversed="card.reversed"
          />
        </div>
      </SectionBlock>

      <SectionBlock v-if="overall.statusGuidance.length" spacing="sm" class="lt-appear lt-appear--delay-5">
        <AdviceSection :title="overall.statusTitle" :lines="overall.statusGuidance" />
      </SectionBlock>

      <SectionBlock spacing="md">
        <PremiumResultCta :reading-type="READING_TYPE" />
      </SectionBlock>

      <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-5">
        <ReadingClosingBlock message="네 장의 카드가 비춘 한 해의 흐름이 올해의 작은 지도가 되기를 바랍니다." />
      </SectionBlock>

      <SectionBlock spacing="md">
        <ShareSaveSection
          :reading-type="READING_TYPE"
          mode="three"
          :cards="drawnCards"
          :headline="shareHeadline"
          :subline="shareSubline"
          :header-label="resultLabel"
          :summary="overall.summary"
          :share-url="shareUrl"
        />
      </SectionBlock>

      <SectionBlock spacing="sm">
        <div class="ny-result__retry-wrap">
          <button class="ny-result__retry" @click="retry">다시 뽑기</button>
        </div>
      </SectionBlock>

      <SectionBlock spacing="md">
        <OtherReadingsNav current="newyear" />
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
.ny-faq {
  margin: 0 var(--lt-space-md);
}

.ny-faq__title {
  font-size: 0.82rem;
  font-weight: 400;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  margin-bottom: var(--lt-space-md);
}

.ny-faq__item {
  border-bottom: 1px solid var(--lt-border-soft);
}

.ny-faq__q {
  padding: var(--lt-space-md) 0;
  min-height: 44px;
  font-size: 0.88rem;
  color: var(--lt-text-strong);
  cursor: pointer;
  list-style-position: inside;
}

.ny-faq__a {
  padding: 0 0 var(--lt-space-md);
  font-size: 0.84rem;
  line-height: 1.8;
  color: var(--lt-text-sub);
}

/* ── Reveal Phase ── */
.ny-reveal {
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

.ny-reveal__glow {
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

.ny-reveal__text {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.12em;
  margin-bottom: var(--lt-space-xl);
  animation: lt-fade-in 600ms ease both;
}

.ny-reveal__cards {
  display: flex;
  gap: var(--lt-space-sm);
}

.ny-reveal__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  animation: ny-reveal-appear 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--card-delay, 0ms);
}

@keyframes ny-reveal-appear {
  0%   { opacity: 0; transform: translateY(40px) scale(0.75); }
  60%  { opacity: 1; transform: translateY(-6px) scale(1.04); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.ny-reveal__card-pos {
  font-size: 0.58rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  opacity: 0.65;
}

.ny-reveal__card-body {
  /* 4장이 320px 폭에도 한 줄로 들어가도록 */
  width: clamp(62px, 19vw, 92px);
  height: clamp(102px, 31vw, 152px);
  perspective: 800px;
}

.ny-reveal__card-flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: ny-card-flip 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  animation-delay: calc(var(--card-delay, 0ms) + 300ms);
}

@keyframes ny-card-flip {
  0%   { transform: rotateY(0deg) scale(0.95); }
  30%  { transform: rotateY(0deg) scale(1) translateY(-6px); }
  50%  { transform: rotateY(90deg) scale(1) translateY(-6px); }
  75%  { transform: rotateY(180deg) scale(1.02) translateY(-3px); }
  100% { transform: rotateY(180deg) scale(1) translateY(0); }
}

.ny-reveal__card-back,
.ny-reveal__card-front {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--lt-radius-sm);
  overflow: hidden;
}

.ny-reveal__card-back {
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1px solid rgba(200, 169, 110, 0.35);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 16px rgba(200, 169, 110, 0.12);
}

.ny-reveal__card-front {
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

.ny-reveal__card-svg {
  width: 100%;
  height: 100%;
}

.ny-reveal__card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ny-reveal__card-img--reversed {
  transform: rotate(180deg);
}

.ny-reveal__card-front-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.ny-reveal__card-name {
  font-size: 0.82rem;
  color: var(--lt-text-strong);
  font-weight: 300;
  letter-spacing: 0.04em;
}

.ny-reveal__hint {
  font-size: 0.62rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.1em;
  opacity: 0;
  margin-top: var(--lt-space-lg);
  animation: lt-fade-in 400ms ease 1.6s both;
}

.ny-reveal__dots {
  display: flex;
  gap: 12px;
  margin-top: var(--lt-space-xl);
  opacity: 0;
  animation: lt-fade-in 500ms ease 2s both;
}

.ny-reveal__dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(200, 169, 110, 0.3);
  animation: ny-dot-blink 1.4s ease-in-out infinite;
}

.ny-reveal__dots span:nth-child(2) { animation-delay: 0.2s; }
.ny-reveal__dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes ny-dot-blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* ── Result Phase ── */
.ny-result__hero {
  background: linear-gradient(180deg, var(--lt-bg-1) 0%, var(--lt-bg-0) 100%);
  padding-bottom: var(--lt-space-lg);
  margin-bottom: var(--lt-space-md);
  border-bottom: 1px solid var(--lt-border-soft);
}

.ny-result__hero-label {
  text-align: center;
  font-family: var(--lt-font-sans);
  font-size: 0.75rem;
  font-weight: 300;
  color: var(--lt-accent-3);
  letter-spacing: 0.12em;
  padding: var(--lt-space-lg) 0 var(--lt-space-md);
  opacity: 0.7;
}

.ny-result__meanings {
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-md);
}

.ny-result__retry-wrap {
  display: flex;
  justify-content: center;
  padding: 0 var(--lt-space-md);
}

.ny-result__retry {
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

.ny-result__retry:hover {
  opacity: 1;
  border-color: rgba(77, 163, 255, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .ny-reveal__card,
  .ny-reveal__card-flipper,
  .ny-reveal__glow,
  .ny-reveal__text {
    animation: none;
    opacity: 1;
  }
  .ny-reveal__card-flipper {
    transform: rotateY(180deg);
  }
}
</style>
