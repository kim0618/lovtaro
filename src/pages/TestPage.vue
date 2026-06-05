<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useHead, SITE_URL } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import ReadingIntroHeader from '../components/reading/ReadingIntroHeader.vue'
import ReadingDescriptionBox from '../components/reading/ReadingDescriptionBox.vue'
import ReadingPointList from '../components/reading/ReadingPointList.vue'
import StartReadingCTA from '../components/reading/StartReadingCTA.vue'
import CardImageBlock from '../components/result/CardImageBlock.vue'
import EmotionTagList from '../components/result/EmotionTagList.vue'
import CoreInsightBlock from '../components/result/CoreInsightBlock.vue'
import AdviceSection from '../components/result/AdviceSection.vue'
import ReadingClosingBlock from '../components/result/ReadingClosingBlock.vue'
import ShareSaveSection from '../components/result/ShareSaveSection.vue'
import DisclaimerBlock from '../components/result/DisclaimerBlock.vue'
import { getTest } from '../data/tests/index.js'
import { getCardById } from '../data/tarotCards.js'
import { getCardImage } from '../data/cardImages.js'
import { trackEvent } from '../utils/gtag.js'

const route = useRoute()
const test = computed(() => getTest(route.params.slug))

useHead({
  title: () => test.value?.metaTitle || '연애 심리테스트 | Lovtaro',
  description: () => test.value?.metaDescription || '나를 닮은 연애 타로 유형을 찾아보세요. 무료 연애 심리테스트, Lovtaro.',
})

const phase = ref('intro') // 'intro' | 'quiz' | 'result'
const currentIndex = ref(0)
const answers = ref([]) // 질문 인덱스별로 선택한 답변 객체 (뒤로가기 대비 기록 방식)
const resultKey = ref(null)

// 보기 순서를 섞어둔 질문 목록 (시작 시 1회 생성, 세션 내내 유지 - 뒤로가도 같은 순서)
const shuffledQuestions = ref([])
const total = computed(() => test.value?.questions?.length ?? 0)
const currentQuestion = computed(() => shuffledQuestions.value[currentIndex.value] ?? null)
const progressPct = computed(() => total.value ? Math.round(((currentIndex.value + 1) / total.value) * 100) : 0)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const result = computed(() => (resultKey.value && test.value) ? test.value.results[resultKey.value] : null)
const resultCard = computed(() => {
  if (!result.value) return null
  const base = getCardById(result.value.cardId)
  if (!base) return null
  return { ...base, image: getCardImage(result.value.cardId) || '' }
})

const shareUrl = computed(() => test.value ? `${SITE_URL}/test/${test.value.slug}/` : SITE_URL)

// 결과 라벨을 코드(예: ENTP)와 유형명(예: 재치있는 토론가)으로 분리 - 공유 이미지용
const resultTypeCode = computed(() => {
  const l = result.value?.label || ''
  return l.includes(' · ') ? l.split(' · ')[0] : ''
})
const resultTypeName = computed(() => {
  const l = result.value?.label || ''
  return l.includes(' · ') ? l.split(' · ').slice(1).join(' · ') : l
})
// "나랑 잘 맞는 유형" - matches 맵에서 매칭 결과의 라벨을 찾음
const matchLabel = computed(() => {
  const mKey = test.value?.matches?.[resultKey.value]
  return (mKey && test.value?.results?.[mKey]) ? test.value.results[mKey].label : ''
})

// 테스트별 어울리는 무료 리딩 (결과 → 무료 리딩 다리, 2개씩)
const READING_OPTIONS = {
  love: { to: '/reading/love/', title: '러브타로', subtitle: '나와 상대, 관계의 흐름 3장' },
  mind: { to: '/reading/mind/', title: '상대방 속마음', subtitle: '그 사람의 마음 읽기' },
  reunion: { to: '/reading/reunion/', title: '재회 가능성', subtitle: '다시 만날 수 있을까' },
  contact: { to: '/reading/contact/', title: '연락 올까', subtitle: '그 사람에게 연락이 올까' },
  yesno: { to: '/reading/yesno/', title: 'Yes/No 타로', subtitle: '궁금한 것에 답을 듣기' },
  compatibility: { to: '/reading/compatibility/', title: '궁합 타로', subtitle: '두 사람의 케미 보기' },
  today: { to: '/today/', title: '오늘의 연애 카드', subtitle: '오늘의 연애 기류 한 장' },
  three: { to: '/reading/3cards/', title: '3장 리딩', subtitle: '과거 · 현재 · 미래 흐름' },
}
const recommendedReadings = computed(() =>
  (test.value?.readings ?? ['love', 'mind']).map(k => READING_OPTIONS[k]).filter(Boolean)
)

const selectedAnswer = computed(() => answers.value[currentIndex.value] ?? null)
const pendingAnswer = ref(null) // 방금 탭한 답 (선택 확인 애니메이션용)
let selectTimer = null

function start() {
  // 질문은 그대로, 각 질문의 보기 순서만 섞음 (답변은 객체 참조로 채점 → 결과 일관성 유지)
  shuffledQuestions.value = (test.value?.questions ?? []).map(q => ({ ...q, answers: shuffle(q.answers) }))
  answers.value = []
  currentIndex.value = 0
  phase.value = 'quiz'
  trackEvent('test_start', { reading_type: test.value?.shareLabel })
}

function choose(answer) {
  if (pendingAnswer.value) return // 연타/중복 탭 방지
  pendingAnswer.value = answer
  answers.value[currentIndex.value] = answer
  selectTimer = setTimeout(() => {
    pendingAnswer.value = null
    if (currentIndex.value < total.value - 1) {
      currentIndex.value++
      window.scrollTo({ top: 0 })
    } else {
      finish()
    }
  }, 230) // 선택 확인을 잠깐 보여준 뒤 다음으로
}

function back() {
  if (pendingAnswer.value) return
  if (currentIndex.value > 0) {
    currentIndex.value--
    window.scrollTo({ top: 0 })
  }
}

onUnmounted(() => { if (selectTimer) clearTimeout(selectTimer) })

function computeScores() {
  // 기록된 답변에서 점수 합산 (뒤로가기 후 재선택해도 일관됨)
  const scores = {}
  for (const a of answers.value) {
    if (!a) continue
    if (a.weights) {
      for (const [k, v] of Object.entries(a.weights)) scores[k] = (scores[k] || 0) + v
    } else if (a.type) {
      scores[a.type] = (scores[a.type] || 0) + 1
    }
  }
  return scores
}

function resolveResultKey() {
  const scores = computeScores()
  // 축(이분법) 기반: 각 축에서 우세한 글자를 이어붙여 키 생성 (예: 'ENFP'), 동점 시 a
  if (test.value.axes) {
    return test.value.axes
      .map(ax => ((scores[ax.a] || 0) >= (scores[ax.b] || 0) ? ax.a : ax.b))
      .join('')
  }
  // 단일 유형 argmax (동점 시 먼저 선언된 유형 우선)
  let bestKey = null
  let bestScore = -1
  for (const key of Object.keys(test.value.results)) {
    const s = scores[key] || 0
    if (s > bestScore) { bestScore = s; bestKey = key }
  }
  return bestKey
}

function finish() {
  resultKey.value = resolveResultKey()
  phase.value = 'result'
  trackEvent('test_complete', { reading_type: test.value?.shareLabel, result_type: result.value?.label })
  window.scrollTo({ top: 0 })
}

function retry() {
  if (selectTimer) clearTimeout(selectTimer)
  pendingAnswer.value = null
  resultKey.value = null
  answers.value = []
  currentIndex.value = 0
  phase.value = 'intro'
  window.scrollTo({ top: 0 })
}

// 테스트 결과 → 무료 리딩 다리 (프리미엄은 무료 리딩 끝에서 등장)
function goReading(to) {
  trackEvent('cta_click', {
    cta_id: 'test_to_reading',
    destination: to,
    reading_type: test.value?.shareLabel,
  })
}
</script>

<template>
  <AppShell>
    <!-- ── 잘못된 slug ─────────────────────────────── -->
    <template v-if="!test">
      <PageContainer>
        <div class="test-missing">
          <p class="test-missing__text">찾는 테스트가 없어요.</p>
          <RouterLink class="test-missing__link" to="/test/">전체 테스트 보기</RouterLink>
        </div>
      </PageContainer>
    </template>

    <template v-else>
      <Transition name="phase-fade" mode="out-in">
      <div :key="phase">
        <!-- ── INTRO ─────────────────────────────────── -->
        <template v-if="phase === 'intro'">
          <PageContainer>
            <ReadingIntroHeader :title="test.title" :subtitle="test.subtitle" />
          </PageContainer>

          <SectionBlock spacing="sm">
            <ReadingDescriptionBox :description="test.intro.lead" />
          </SectionBlock>

          <SectionBlock spacing="md">
            <ReadingPointList :points="test.intro.points" />
          </SectionBlock>

          <SectionBlock spacing="sm">
            <StartReadingCTA
              :label="test.intro.startLabel"
              :note="test.intro.startNote"
              @start="start"
            />
          </SectionBlock>
        </template>

        <!-- ── QUIZ ──────────────────────────────────── -->
        <template v-else-if="phase === 'quiz' && currentQuestion">
          <PageContainer>
            <div class="quiz">
              <div class="quiz__progress">
                <div class="quiz__progress-bar">
                  <div class="quiz__progress-fill" :style="{ width: progressPct + '%' }" />
                </div>
                <p class="quiz__progress-text">{{ currentIndex + 1 }} / {{ total }}</p>
              </div>

              <Transition name="quiz-step" mode="out-in">
                <div :key="currentIndex" class="quiz__step">
                  <h2 class="quiz__question">{{ currentQuestion.text }}</h2>

                  <ul class="quiz__answers">
                    <li v-for="(answer, i) in currentQuestion.answers" :key="i">
                      <button
                        class="quiz__answer"
                        :class="{
                          'quiz__answer--selected': selectedAnswer === answer,
                          'quiz__answer--confirm': pendingAnswer === answer,
                        }"
                        @click="choose(answer)"
                      >
                        {{ answer.text }}
                      </button>
                    </li>
                  </ul>

                  <div v-if="currentIndex > 0" class="quiz__nav">
                    <button class="quiz__back" @click="back">
                      <span aria-hidden="true">&#8592;</span> 이전 질문
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </PageContainer>
        </template>

        <!-- ── RESULT ────────────────────────────────── -->
        <template v-else-if="phase === 'result' && result && resultCard">
          <div class="test-result__hero lt-appear">
            <p class="test-result__hero-eyebrow">{{ test.shareLabel }}</p>
            <p class="test-result__hero-label">{{ result.label }}</p>
            <p class="test-result__hero-tagline">{{ result.tagline }}</p>
          </div>

          <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-1">
            <CardImageBlock
              :image-src="resultCard.image"
              :card-name="resultCard.name"
              :card-name-en="resultCard.nameEn"
              :energy="resultCard.energy"
              :keywords="resultCard.keywords"
            />
          </SectionBlock>

          <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
            <EmotionTagList :tags="result.emotionTags" />
          </SectionBlock>

          <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-2">
            <CoreInsightBlock :insight="result.body" label="나의 연애 스타일" />
          </SectionBlock>

          <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-3">
            <AdviceSection title="당신에게 건네는 한마디" :lines="[result.advice]" />
          </SectionBlock>

          <SectionBlock spacing="sm" class="lt-appear lt-appear--delay-4">
            <ReadingClosingBlock />
          </SectionBlock>

          <SectionBlock spacing="md">
            <ShareSaveSection
              mode="test"
              :reading-type="test.shareLabel"
              :type-code="resultTypeCode"
              :type-name="resultTypeName"
              :match-label="matchLabel"
              :card-name="resultCard.name"
              :card-name-en="resultCard.nameEn"
              :card-image="resultCard.image"
              :summary="result.tagline"
              :emotion-tags="result.emotionTags"
              :share-url="shareUrl"
              :share-title="`내 연애 유형은 '${result.label}'`"
            />
          </SectionBlock>

          <SectionBlock spacing="md">
            <p class="test-reading-heading">내 연애, 더 깊이 보고 싶다면</p>
            <div class="test-reading-list">
              <RouterLink
                v-for="r in recommendedReadings"
                :key="r.to"
                class="test-reading-cta"
                :to="r.to"
                @click="goReading(r.to)"
              >
                <span class="test-reading-cta__head">
                  <span class="test-reading-cta__title">{{ r.title }}</span>
                  <span class="test-reading-cta__arrow" aria-hidden="true">&#8594;</span>
                </span>
                <span class="test-reading-cta__subtitle">{{ r.subtitle }}</span>
              </RouterLink>
            </div>
          </SectionBlock>

          <SectionBlock spacing="sm">
            <div class="test-result__retry-wrap">
              <button class="test-result__retry" @click="retry">다시 해보기</button>
              <RouterLink class="test-result__more" to="/test/">다른 테스트 보기</RouterLink>
            </div>
          </SectionBlock>

          <SectionBlock spacing="sm">
            <DisclaimerBlock variant="test" />
          </SectionBlock>
        </template>
      </div>
      </Transition>
    </template>
  </AppShell>
</template>

<style scoped>
/* ── Quiz ─────────────────────────────────────────── */
.quiz {
  padding: var(--lt-space-lg) 0;
}

.quiz__progress {
  margin-bottom: var(--lt-space-xl);
}

.quiz__progress-bar {
  height: 4px;
  border-radius: var(--lt-radius-full);
  background: var(--lt-line-soft);
  overflow: hidden;
}

.quiz__progress-fill {
  height: 100%;
  border-radius: var(--lt-radius-full);
  background: linear-gradient(90deg, var(--lt-accent-2), var(--lt-accent-3));
  transition: width 350ms ease;
}

.quiz__progress-text {
  margin-top: 8px;
  text-align: center;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--lt-text-muted);
}

.quiz__question {
  font-family: var(--lt-font-sans);
  font-size: 1.18rem;
  font-weight: 500;
  line-height: 1.6;
  color: var(--lt-text-strong);
  text-align: center;
  padding: 0 var(--lt-space-sm);
  margin-bottom: var(--lt-space-xl);
}

.quiz__answers {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quiz__answer {
  width: 100%;
  text-align: left;
  padding: 15px 18px;
  border-radius: var(--lt-radius-lg);
  border: 1px solid var(--lt-line-soft);
  background: var(--lt-bg-2);
  color: var(--lt-text);
  font-size: 0.92rem;
  line-height: 1.5;
  cursor: pointer;
  transition: border-color var(--lt-transition), background var(--lt-transition), transform var(--lt-transition);
}

.quiz__answer:hover {
  border-color: rgba(77, 163, 255, 0.45);
  background: var(--lt-bg-3);
  box-shadow: 0 4px 18px rgba(77, 163, 255, 0.1);
  transform: translateY(-2px);
}

.quiz__answer:active {
  transform: scale(0.985);
  border-color: var(--lt-accent-2);
  background: rgba(77, 163, 255, 0.1);
}

.quiz__answer--selected {
  border-color: rgba(77, 163, 255, 0.5);
  background: var(--lt-bg-3);
  box-shadow: 0 0 14px rgba(77, 163, 255, 0.1);
}

/* 탭 직후 선택 확인 (액센트로 채워짐) */
.quiz__answer--confirm,
.quiz__answer--confirm:hover {
  border-color: var(--lt-accent-2);
  background: rgba(77, 163, 255, 0.18);
  color: #FFFFFF;
  box-shadow: 0 0 22px rgba(77, 163, 255, 0.22);
  transform: translateY(-2px);
}

/* 질문 전환 (부드러운 스텝) */
.quiz-step-enter-active,
.quiz-step-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.quiz-step-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.quiz-step-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.quiz__nav {
  display: flex;
  justify-content: center;
  margin-top: var(--lt-space-lg);
}

.quiz__back {
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  color: var(--lt-text-muted);
  opacity: 0.75;
  border: 1px solid var(--lt-line-soft);
  border-radius: var(--lt-radius-full);
  padding: 6px 18px;
  background: transparent;
  cursor: pointer;
  transition: opacity var(--lt-transition), border-color var(--lt-transition), color var(--lt-transition);
}

.quiz__back:hover {
  opacity: 1;
  color: var(--lt-text);
  border-color: rgba(77, 163, 255, 0.3);
}

/* ── Result hero ──────────────────────────────────── */
.test-result__hero {
  text-align: center;
  background: linear-gradient(180deg, var(--lt-bg-1) 0%, var(--lt-bg-0) 100%);
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-lg);
  border-bottom: 1px solid var(--lt-border-soft);
}

.test-result__hero-eyebrow {
  font-family: var(--lt-font-sans);
  font-size: 0.7rem;
  font-weight: 300;
  letter-spacing: 0.14em;
  color: var(--lt-accent-3);
  opacity: 0.7;
  margin-bottom: var(--lt-space-md);
}

.test-result__hero-label {
  font-family: var(--lt-font-display);
  font-size: 1.9rem;
  font-weight: 600;
  color: var(--lt-text-strong);
  letter-spacing: 0.01em;
}

.test-result__hero-tagline {
  margin-top: 10px;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--lt-text-muted);
}

/* ── Result actions ───────────────────────────────── */
.test-result__retry-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--lt-space-md);
  flex-wrap: wrap;
  padding: 0 var(--lt-space-md);
}

.test-result__retry,
.test-result__more {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--lt-accent-2);
  opacity: 0.7;
  border: 1px solid rgba(77, 163, 255, 0.2);
  border-radius: var(--lt-radius-full);
  padding: 5px 16px;
  background: rgba(77, 163, 255, 0.06);
  transition: opacity var(--lt-transition), border-color var(--lt-transition);
  text-decoration: none;
}

.test-result__retry:hover,
.test-result__more:hover {
  opacity: 1;
  border-color: rgba(77, 163, 255, 0.4);
}

/* ── 무료 리딩 다리 CTA (테스트별 2개) ─────────────── */
.test-reading-heading {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.08em;
  text-align: center;
  margin-bottom: var(--lt-space-md);
  opacity: 0.7;
}

.test-reading-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.test-reading-cta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 13px 15px;
  border-radius: var(--lt-radius-lg);
  border: 1px solid rgba(77, 163, 255, 0.22);
  border-left: 2px solid rgba(77, 163, 255, 0.2);
  background: linear-gradient(170deg, rgba(20, 33, 55, 0.5) 0%, rgba(16, 22, 41, 0.55) 100%);
  text-decoration: none;
  transition:
    border-color 250ms ease,
    border-left-color 250ms ease,
    background 250ms ease,
    box-shadow 250ms ease,
    transform 180ms ease;
}

.test-reading-cta:hover {
  border-color: rgba(77, 163, 255, 0.45);
  border-left-color: var(--lt-accent-2);
  background: linear-gradient(170deg, rgba(27, 43, 72, 0.72) 0%, rgba(18, 27, 49, 0.72) 100%);
  box-shadow: 0 6px 22px rgba(77, 163, 255, 0.14), inset 0 0 20px rgba(77, 163, 255, 0.04);
  transform: translateY(-2px);
}

.test-reading-cta:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 10px rgba(77, 163, 255, 0.1);
}

.test-reading-cta__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.test-reading-cta__title {
  font-family: var(--lt-font-sans);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--lt-text-strong);
  min-width: 0;
}

.test-reading-cta__subtitle {
  font-size: 0.74rem;
  line-height: 1.4;
  color: var(--lt-text-muted);
}

.test-reading-cta__arrow {
  flex-shrink: 0;
  font-size: 1rem;
  color: rgba(143, 211, 255, 0.95);
  transition: transform var(--lt-transition);
}

.test-reading-cta:hover .test-reading-cta__arrow {
  transform: translateX(5px);
  color: #BFE3FF;
}

/* ── Missing ──────────────────────────────────────── */
.test-missing {
  text-align: center;
  padding: var(--lt-space-xl) var(--lt-space-md);
}

.test-missing__text {
  color: var(--lt-text-muted);
  margin-bottom: var(--lt-space-md);
}

.test-missing__link {
  color: var(--lt-accent-2);
  font-size: 0.9rem;
  text-decoration: none;
  border-bottom: 1px solid rgba(77, 163, 255, 0.3);
}
</style>
